export async function recognizeDigits(imageBase64) {
  const response = await fetch('/.netlify/functions/gemini', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ imageBase64 }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to analyze image');
  }

  return data.result;
}
