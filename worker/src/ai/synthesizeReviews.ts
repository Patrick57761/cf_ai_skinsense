import { parseJSON } from '../utils/parseJSON';

// Build review text from posts
function buildReviewText(posts: any[]): string {
  let text = '';

  for (let i = 0; i < Math.min(posts.length, 5); i++) {
    const post = posts[i];
    text += `[Post ${i + 1}]: ${post.title}. ${post.body.substring(0, 200)}\n`;

    if (post.comments && post.comments.length > 0) {
      for (let j = 0; j < Math.min(post.comments.length, 3); j++) {
        const comment = post.comments[j];
        text += `- ${comment.body.substring(0, 150)}\n`;
      }
    }
    text += '\n';
  }

  return text;
}

export async function synthesizeReviews(ai: any, redditPosts: any[], userProfile: any) {
  // Return default if no posts
  if (!redditPosts || redditPosts.length === 0) {
    return {
      sentiment: 'neutral',
      positivePercent: 50,
      totalReviews: 0,
      keyThemes: [],
      summary: 'No Reddit reviews found for this product.',
      topPosts: []
    };
  }

  // Build review text
  const reviewText = buildReviewText(redditPosts);

  // Build prompt
  const prompt = `Analyze these Reddit reviews for someone with ${userProfile.skinType} skin and concerns about ${userProfile.concerns.join(', ')}.

Reviews:
${reviewText}

Return JSON:
{
  "sentiment": "positive" or "mixed" or "negative",
  "positivePercent": 0-100,
  "keyThemes": ["theme1", "theme2"],
  "summary": "2-3 sentence summary"
}`;

  // Call AI
  const aiResponse = await ai.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', {
    messages: [{ role: 'user', content: prompt }]
  });

  // Parse response
  const parsed = parseJSON(aiResponse.response || '');

  // Get top 3 posts
  const topPosts = [];
  for (let i = 0; i < Math.min(redditPosts.length, 3); i++) {
    topPosts.push({
      title: redditPosts[i].title,
      url: redditPosts[i].url,
      score: redditPosts[i].score,
      createdAt: redditPosts[i].createdAt,
      relevanceScore: redditPosts[i].relevanceScore
    });
  }

  if (parsed) {
    return {
      sentiment: parsed.sentiment || 'neutral',
      positivePercent: parsed.positivePercent || 50,
      totalReviews: redditPosts.length,
      keyThemes: Array.isArray(parsed.keyThemes) ? parsed.keyThemes : [],
      summary: parsed.summary || 'Reviews analyzed.',
      topPosts: topPosts
    };
  }

  // Return default if parsing failed
  return {
    sentiment: 'neutral',
    positivePercent: 50,
    totalReviews: redditPosts.length,
    keyThemes: [],
    summary: 'Reviews analyzed.',
    topPosts: topPosts
  };
}
