export async function extractProductInfo(ai, pageText, rawProductName, rawBrand) {
  const shortText = pageText.substring(0, 500);

  const prompt = `Extract the clean product name and brand from this e-commerce page.

Product name from page: "${rawProductName}"
Brand from page: "${rawBrand}"
Page text: "${shortText}"

Return a JSON object like this:
{
  "productName": "clean product name",
  "brand": "brand name",
  "confidence": 0.9
}

Example:
Input: "Buy CeraVe Moisturizing Cream - 19 oz | Free Shipping"
Output: {"productName": "Moisturizing Cream", "brand": "CeraVe", "confidence": 0.95}`;

  const aiResponse = await ai.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', {
    messages: [
      {
        role: 'user',
        content: prompt
      }
    ]
  });

  let productName = rawProductName;
  let brand = rawBrand;
  let confidence = 0.3;

  try {
    const responseText = aiResponse.response || '';
    const jsonStart = responseText.indexOf('{');
    const jsonEnd = responseText.lastIndexOf('}');

    if (jsonStart >= 0 && jsonEnd >= 0) {
      const jsonString = responseText.substring(jsonStart, jsonEnd + 1);
      const parsed = JSON.parse(jsonString);

      if (parsed.productName) {
        productName = parsed.productName;
      }
      if (parsed.brand) {
        brand = parsed.brand;
      }
      if (parsed.confidence) {
        confidence = parsed.confidence;
      }
    }
  } catch (error) {
    console.error('Failed to parse AI response:', error);
  }

  return {
    productName: productName,
    brand: brand,
    confidence: confidence
  };
}
