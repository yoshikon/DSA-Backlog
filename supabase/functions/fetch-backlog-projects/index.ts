import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

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

    const { data: backlogSettings, error: settingsError } = await supabase
      .from('backlog_settings')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (settingsError || !backlogSettings) {
      throw new Error('Backlog設定が見つかりません');
    }

    const backlogSpace = backlogSettings.space_name;
    const backlogApiKey = backlogSettings.api_key;
    const backlogUrl = `https://${backlogSpace}.backlog.jp/api/v2/projects?apiKey=${backlogApiKey}`;

    const backlogResponse = await fetch(backlogUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!backlogResponse.ok) {
      const errorText = await backlogResponse.text();
      throw new Error(`Backlog API error: ${errorText}`);
    }

    const projects = await backlogResponse.json();

    const formattedProjects = projects.map((project: any) => ({
      id: project.id,
      projectKey: project.projectKey,
      name: project.name,
      archived: project.archived
    }));

    return new Response(
      JSON.stringify({ projects: formattedProjects }),
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