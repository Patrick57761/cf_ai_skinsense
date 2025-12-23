import { parseJSON } from '../utils/parseJSON';

export async function analyzeIngredients(ai: any, ingredients: string[], userProfile: any) {
  // Return default if no ingredients
  if (!ingredients || ingredients.length === 0) {
    return {
      good: [],
      bad: [],
      score: 5,
      reasoning: 'No ingredients found to analyze.'
    };
  }

  // Build prompt
  const ingredientList = ingredients.join(', ');
  const prompt = `You are a skincare expert. Analyze these ingredients for someone with ${userProfile.skinType} skin in a ${userProfile.climate} climate with concerns about ${userProfile.concerns.join(', ')}.

Ingredients: ${ingredientList}

Categorize each ingredient as GOOD or BAD for this person. Return JSON:
{
  "good": [{"name": "Niacinamide", "reason": "Controls oil"}],
  "bad": [{"name": "Alcohol", "reason": "Drying"}],
  "score": 7.5,
  "reasoning": "Overall assessment"
}

Score should be 1-10.`;

  // Call AI
  const aiResponse = await ai.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', {
    messages: [{ role: 'user', content: prompt }]
  });

  // Parse response
  const parsed = parseJSON(aiResponse.response || '');

  if (parsed) {
    return {
      good: Array.isArray(parsed.good) ? parsed.good : [],
      bad: Array.isArray(parsed.bad) ? parsed.bad : [],
      score: parsed.score || 5,
      reasoning: parsed.reasoning || 'Analysis completed'
    };
  }

  // Return default if parsing failed
  return {
    good: [],
    bad: [],
    score: 5,
    reasoning: 'Analysis completed'
  };
}
