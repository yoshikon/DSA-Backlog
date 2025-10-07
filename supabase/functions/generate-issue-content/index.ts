import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface SelectedItem {
  itemId: string;
  sectionId: string;
  value: string | string[];
}

interface RequestBody {
  selectedItems: SelectedItem[];
  template: any;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { selectedItems, template }: RequestBody = await req.json();

    const itemsMap = new Map();
    template.sections.forEach((section: any) => {
      section.items.forEach((item: any) => {
        itemsMap.set(item.id, { ...item, sectionTitle: section.title });
      });
    });

    const structuredData: any[] = [];
    selectedItems.forEach((selected) => {
      const itemDef = itemsMap.get(selected.itemId);
      if (itemDef && selected.value) {
        let displayValue = selected.value;
        if (Array.isArray(selected.value)) {
          displayValue = selected.value.join(', ');
        }
        if (displayValue) {
          structuredData.push({
            section: itemDef.sectionTitle,
            label: itemDef.label,
            value: displayValue,
          });
        }
      }
    });

    const prompt = `あなたはWEB制作会社のプロジェクトマネージャーです。以下の選択された項目から、Backlog課題用の「件名」と「詳細」を生成してください。

【生成ルール】
- 件名: 30-60文字、重要キーワードを前方に配置
- 詳細: 見出し + 本文の形式、箇条書き（・）を使用
- 選択されていない項目は絶対に出力しない
- 項目の選択順序を尊重する
- 空値の項目は省略する
- 日本語で自然な文章にする

【選択された項目】
${JSON.stringify(structuredData, null, 2)}

【出力形式】
JSON形式で以下を出力:
{
  "summary": "件名をここに",
  "description": "詳細をここに（見出しと箇条書き形式）"
}`;

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OPENAI_API_KEY が設定されていません');
    }

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'あなたはWEB制作プロジェクトの課題管理を支援するAIアシスタントです。選択された項目のみを使用し、明確で構造化された課題の件名と詳細を生成します。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.2,
        response_format: { type: 'json_object' }
      }),
    });

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      throw new Error(`OpenAI API error: ${errorText}`);
    }

    const openaiData = await openaiResponse.json();
    const generatedContent = JSON.parse(openaiData.choices[0].message.content);

    return new Response(
      JSON.stringify(generatedContent),
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