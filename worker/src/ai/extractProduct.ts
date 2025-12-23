import { parseJSON, responseToString } from '../utils/parseJSON';

export async function extractProductInfo(ai: any, pageInfo: any, pageText: string) {
  // Build page info
  let info = `Page: ${pageInfo.title}\n`;

  if (pageInfo.headings && pageInfo.headings.length > 0) {
    info += `Headings: ${pageInfo.headings.slice(0, 3).join(', ')}\n`;
  }

  const pagePreview = pageText.substring(0, 500);

  // Build prompt
  const prompt = `Extract the product name and brand from this page.

${info}

Text: "${pagePreview}"

Return JSON:
{
  "productName": "product name",
  "brand": "brand name",
  "confidence": 0.9
}

Example: {"productName": "Moisturizing Cream", "brand": "CeraVe", "confidence": 0.95}`;

  // Call AI
  const aiResponse = await ai.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', {
    messages: [{ role: 'user', content: prompt }]
  });

  // Parse response
  const responseText = responseToString(aiResponse.response);
  const parsed = parseJSON(responseText);

  if (parsed) {
    return {
      productName: parsed.productName || '',
      brand: parsed.brand || '',
      confidence: parsed.confidence || 0.5
    };
  }

  // Return empty if parsing failed
  return {
    productName: '',
    brand: '',
    confidence: 0.3
  };
}
