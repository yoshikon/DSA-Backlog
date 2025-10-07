import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface RequestBody {
  space_name: string;
  api_key: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { space_name, api_key }: RequestBody = await req.json();

    if (!space_name || !api_key) {
      throw new Error('space_name and api_key are required');
    }

    const backlogUrl = `https://${space_name}.backlog.jp/api/v2/users/myself?apiKey=${api_key}`;

    const backlogResponse = await fetch(backlogUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!backlogResponse.ok) {
      if (backlogResponse.status === 401) {
        throw new Error('APIキーが無効です');
      } else if (backlogResponse.status === 404) {
        throw new Error('スペース名が見つかりません');
      } else {
        throw new Error(`Backlog API error: ${backlogResponse.status}`);
      }
    }

    const userData = await backlogResponse.json();

    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: userData.id,
          name: userData.name,
        }
      }),
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
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    );
  }
});