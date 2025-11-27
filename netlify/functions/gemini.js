export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  const API_KEY = process.env.GEMINI_API_KEY;

  if (!API_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server misconfigured: API key not set' }),
    };
  }

  try {
    const { imageBase64 } = JSON.parse(event.body);

    if (!imageBase64) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'No image data provided' }),
      };
    }

    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Analyze this image carefully. Your task is to identify ONLY clearly visible handwritten digits/numbers.

STRICT RULES:
1. ONLY identify actual handwritten numbers (0-9) that are clearly written by hand
2. If there are NO handwritten numbers in the image, respond with exactly: NONE
3. Do NOT hallucinate or guess numbers that aren't clearly visible
4. Do NOT interpret shapes, objects, or patterns as numbers unless they are obviously handwritten digits
5. If numbers are present, respond ONLY with the digits you see
6. PRESERVE THE EXACT LAYOUT: Keep the same line breaks and spacing as in the image
7. If numbers are on different lines in the image, put them on different lines in your response
8. Separate numbers on the same line with spaces as they appear
9. Do NOT include any explanation, just the numbers or "NONE"

What handwritten numbers do you see?`
                },
                {
                  inline_data: {
                    mime_type: 'image/jpeg',
                    data: base64Data
                  }
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0
          }
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: errorData.error?.message || 'Failed to analyze image' }),
      };
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!text) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'No response from AI' }),
      };
    }

    if (text.toUpperCase().includes('NONE') || text.toLowerCase().includes('no number') || text.toLowerCase().includes('no handwritten')) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'No handwritten numbers found in the image' }),
      };
    }

    const cleaned = text.replace(/[^0-9\s\n]/g, '').trim();

    if (!cleaned) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'No handwritten numbers found in the image' }),
      };
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ result: cleaned }),
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || 'Internal server error' }),
    };
  }
}
