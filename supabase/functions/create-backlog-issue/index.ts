import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface RequestBody {
  backlogProjectId: string;
  summary: string;
  description: string;
  issueType: string;
  priority: string;
  assignee?: string;
  selectedItems: any[];
  templateVersion: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Authorization header is required');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const requestBody: RequestBody = await req.json();
    const { backlogProjectId, summary, description, issueType, priority, assignee, selectedItems, templateVersion } = requestBody;

    const { data: backlogSettings, error: settingsError } = await supabase
      .from('backlog_settings')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (settingsError || !backlogSettings) {
      throw new Error('Backlog設定が見つかりません。先にBacklog連携設定を完了してください。');
    }

    if (!backlogSettings.is_connected) {
      throw new Error('Backlogが接続されていません。接続テストを実行してください。');
    }

    const issueTypeMap: Record<string, number> = {
      'task': 1,
      'bug': 2,
      'request': 3,
      'other': 4
    };

    const priorityMap: Record<string, number> = {
      'low': 3,
      'normal': 2,
      'high': 1
    };

    const backlogSpace = backlogSettings.space_name;
    const backlogApiKey = backlogSettings.api_key;
    const backlogUrl = `https://${backlogSpace}.backlog.jp/api/v2/issues`;

    const params = new URLSearchParams();
    params.append('projectId', backlogProjectId);
    params.append('summary', summary);
    params.append('description', description);
    params.append('issueTypeId', issueTypeMap[issueType]?.toString() || '1');
    params.append('priorityId', priorityMap[priority]?.toString() || '2');
    
    if (assignee) {
      params.append('assigneeId', assignee);
    }

    const backlogResponse = await fetch(backlogUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString() + `&apiKey=${backlogApiKey}`,
    });

    if (!backlogResponse.ok) {
      const errorText = await backlogResponse.text();
      throw new Error(`Backlog API error: ${errorText}`);
    }

    const backlogData = await backlogResponse.json();
    const issueKey = backlogData.issueKey;
    const issueUrl = `https://${backlogSpace}.backlog.jp/view/${issueKey}`;

    const { error: insertError } = await supabase
      .from('issue_generations')
      .insert({
        user_id: user.id,
        template_version: templateVersion,
        selected_items: selectedItems,
        generated_summary: summary,
        generated_description: description,
        edited_summary: summary,
        edited_description: description,
        backlog_issue_key: issueKey,
        backlog_issue_url: issueUrl,
        project_id: null,
      });

    if (insertError) {
      console.error('Database insert error:', insertError);
    }

    await supabase
      .from('audit_logs')
      .insert({
        user_id: user.id,
        action: 'create_issue',
        resource_type: 'issue',
        details: {
          issueKey,
          backlogProjectId,
          summary: summary.substring(0, 100),
          itemCount: selectedItems.length
        }
      });

    return new Response(
      JSON.stringify({ issueKey, issueUrl }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    );
  }
});