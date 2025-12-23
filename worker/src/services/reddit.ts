/**
 * Reddit API Integration Service
 *
 * KNOWN LIMITATION: Reddit's public API frequently rate-limits or blocks requests
 * from Cloudflare Workers IPs. This is a common issue with serverless platforms
 * as they share IP pools that may be flagged by Reddit's anti-bot measures.
 *
 * Production considerations:
 * - Consider using Reddit's official API with authentication
 * - Implement a proxy service with dedicated IPs
 * - Use alternative data sources for community reviews
 *
 * Current implementation: Best-effort public API access
 */

function getProductWords(productName: string): string[] {
  const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
  const words = productName.toLowerCase().split(' ');
  const filtered: string[] = [];

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    let skip = false;

    for (let j = 0; j < stopWords.length; j++) {
      if (word === stopWords[j]) {
        skip = true;
        break;
      }
    }

    if (!skip && word.length > 2) {
      filtered.push(word);
    }
  }

  return filtered;
}

// Fetch posts from a subreddit
async function fetchFromSubreddit(subreddit: string, searchQuery: string): Promise<any[]> {
  const url = `https://www.reddit.com/r/${subreddit}/search.json?q=${encodeURIComponent(searchQuery)}&limit=100&restrict_sr=1&sort=relevance`;

  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'SkinSense/1.0' }
    });

    if (!response.ok) {
      console.log(`Reddit API error: ${response.status} for ${subreddit}`);
      return [];
    }

    const data: any = await response.json();
    const posts = data.data?.children || [];
    console.log(`Reddit returned ${posts.length} posts for "${searchQuery}" in r/${subreddit}`);
    return posts;
  } catch (error) {
    console.log(`Reddit fetch error:`, error);
    return [];
  }
}

function checkPostMatch(post: any, brand: string, productWords: string[]) {
  const titleLower = post.title.toLowerCase();
  const bodyLower = post.body.toLowerCase();
  const brandLower = brand.toLowerCase();

  if (!titleLower.includes(brandLower) && !bodyLower.includes(brandLower)) {
    return null;
  }

  // Count how many product words appear in title and body
  let titleMatches = 0;
  let bodyMatches = 0;

  for (let i = 0; i < productWords.length; i++) {
    if (titleLower.includes(productWords[i])) {
      titleMatches++;
    }
    if (bodyLower.includes(productWords[i])) {
      bodyMatches++;
    }
  }

  const titlePercent = productWords.length > 0 ? titleMatches / productWords.length : 0;
  const bodyPercent = productWords.length > 0 ? bodyMatches / productWords.length : 0;

  const hasEnoughMatches = (titlePercent >= 0.5) ||
                           (bodyLower.includes(brandLower) && (titlePercent >= 0.3 || bodyPercent >= 0.5));

  if (!hasEnoughMatches) {
    return null;
  }

  return { matchScore: titlePercent };
}

function getKeyWords(productName: string): string[] {
  const skipWords = ['cream', 'serum', 'moisturizer', 'cleanser', 'toner', 'essence',
                     'lotion', 'gel', 'foam', 'balm', 'oil', 'mask', 'treatment',
                     'the', 'a', 'an', 'for', 'with'];

  const words = productName.toLowerCase().split(/[\s-]+/);
  const keyWords = [];

  for (let i = 0; i < words.length && keyWords.length < 3; i++) {
    const word = words[i];
    if (!skipWords.includes(word) && word.length > 2 && !/^\d+%?$/.test(word)) {
      keyWords.push(word);
    }
  }

  return keyWords;
}

export async function searchReddit(productName: string, brand: string) {
  const subreddits = ['SkincareAddiction', 'AsianBeauty'];

  const keyWords = getKeyWords(productName);
  const searchQuery = brand
    ? `${brand} ${keyWords.join(' ')}`
    : keyWords.join(' ') || productName;

  const productWords = keyWords.length > 0 ? keyWords : getProductWords(productName);

  // Fetch from both subreddits
  const posts1 = await fetchFromSubreddit(subreddits[0], searchQuery);
  const posts2 = await fetchFromSubreddit(subreddits[1], searchQuery);
  const allPosts = [...posts1, ...posts2];

  // Format posts
  const formattedPosts = [];
  for (let i = 0; i < allPosts.length; i++) {
    const post = allPosts[i].data;
    const createdDate = new Date(post.created_utc * 1000);
    const ageInDays = (Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24);

    formattedPosts.push({
      title: post.title,
      body: post.selftext || '',
      score: post.score,
      numComments: post.num_comments,
      createdAt: createdDate.toISOString(),
      ageInDays: ageInDays,
      url: `https://reddit.com${post.permalink}`,
      subreddit: post.subreddit
    });
  }

  console.log(`Formatted ${formattedPosts.length} Reddit posts total`);

  const results = formattedPosts.map(post => ({
    ...post,
    matchScore: 1,
    ageTier: 0
  }));

  console.log(`Returning ${results.length} Reddit posts for ${brand} ${productName}`);

  if (results.length === 0) {
    console.log('No Reddit results found - API may be rate limited');
    return [];
  }

  return results.slice(0, 10);
}

// Check if post is a review (has review keywords)
function isReviewPost(post: any): boolean {
  const reviewWords = ['review', 'tried', 'tested', 'using', 'used', 'love', 'hate', 'recommend', 'thoughts'];
  const text = (post.title + ' ' + post.body).toLowerCase();

  for (let i = 0; i < reviewWords.length; i++) {
    if (text.includes(reviewWords[i])) {
      return true;
    }
  }

  return false;
}

// Check if post is a question
function isQuestionPost(post: any): boolean {
  const title = post.title.toLowerCase();
  return title.includes('?') || title.includes('anyone') || title.includes('should i');
}

// Calculate score for a post
function calculateScore(post: any): number {
  let score = post.matchScore * 5; // Product match is most important

  // Bonus for reviews
  if (isReviewPost(post)) {
    score = score + 3;
  }

  // Bonus for questions with lots of comments
  if (isQuestionPost(post) && post.numComments >= 10) {
    score = score + 2;
  }

  // Bonus for upvotes
  if (post.score >= 50) {
    score = score + 1;
  }

  // Penalty for old posts
  if (post.ageInDays > 365) {
    score = score - 1;
  }

  return Math.min(score, 10);
}

export function rankRedditPosts(posts: any[]) {
  if (posts.length === 0) {
    return [];
  }

  const rankedPosts = [];

  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];
    const finalScore = calculateScore(post);

    rankedPosts.push({
      title: post.title,
      body: post.body,
      score: post.score,
      numComments: post.numComments,
      createdAt: post.createdAt,
      url: post.url,
      subreddit: post.subreddit,
      relevanceScore: finalScore
    });
  }

  // Sort by score (highest first)
  rankedPosts.sort(function(a, b) {
    return b.relevanceScore - a.relevanceScore;
  });

  return rankedPosts.slice(0, 10);
}

// Check if comment is relevant
function isRelevantComment(comment: string, productName: string): boolean {
  const commentLower = comment.toLowerCase();
  const reviewWords = ['love', 'hate', 'tried', 'works', 'recommend', 'skin', 'using'];

  // Must be long enough
  if (comment.length < 50) {
    return false;
  }

  // Check for review keywords
  for (let i = 0; i < reviewWords.length; i++) {
    if (commentLower.includes(reviewWords[i])) {
      return true;
    }
  }

  // Check for product mentions
  const productWords = productName.toLowerCase().split(' ');
  for (let i = 0; i < productWords.length; i++) {
    if (productWords[i].length > 3 && commentLower.includes(productWords[i])) {
      return true;
    }
  }

  return false;
}

export async function fetchTopComments(postUrl: string, productName: string) {
  try {
    const response = await fetch(postUrl + '.json', {
      headers: { 'User-Agent': 'SkinSense/1.0' }
    });

    if (!response.ok) {
      return [];
    }

    const data: any = await response.json();

    // Reddit returns [post, comments]
    if (!data || data.length < 2) {
      return [];
    }

    const commentData = data[1];
    if (!commentData || !commentData.data || !commentData.data.children) {
      return [];
    }

    const comments = [];
    const commentList = commentData.data.children;

    for (let i = 0; i < commentList.length && comments.length < 5; i++) {
      const comment = commentList[i];

      if (!comment.data || !comment.data.body || comment.data.score <= 3) {
        continue;
      }

      if (isRelevantComment(comment.data.body, productName)) {
        comments.push({
          body: comment.data.body,
          score: comment.data.score
        });
      }
    }

    return comments;
  } catch (error) {
    return [];
  }
}
