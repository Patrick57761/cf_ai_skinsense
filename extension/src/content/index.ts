function getPageInfo() {
  const info: {
    title: string;
    url: string;
    metaTags: string[];
    headings: string[];
    structuredData: string[];
  } = {
    title: document.title,
    url: window.location.href,
    metaTags: [],
    headings: [],
    structuredData: []
  };

  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) {
    const content = ogTitle.getAttribute('content');
    if (content) {
      info.metaTags.push('og:title: ' + content);
    }
  }

  const h1Elements = document.querySelectorAll('h1');
  for (let i = 0; i < h1Elements.length; i++) {
    const h1 = h1Elements[i];
    if (h1 && h1.textContent) {
      const text = h1.textContent.trim();
      if (text.length > 0) {
        info.headings.push(text);
      }
    }
  }

  const h2Elements = document.querySelectorAll('h2');
  for (let i = 0; i < h2Elements.length && i < 5; i++) {
    const h2 = h2Elements[i];
    if (h2 && h2.textContent) {
      const text = h2.textContent.trim();
      if (text.length > 0) {
        info.headings.push(text);
      }
    }
  }

  const scripts = document.querySelectorAll('script[type="application/ld+json"]');
  for (let i = 0; i < scripts.length; i++) {
    const script = scripts[i];
    if (script && script.textContent) {
      info.structuredData.push(script.textContent);
    }
  }

  return info;
}

function getIngredients() {
  const ingredients = [];

  const allText = document.body.textContent || document.body.innerText || '';

  const patterns = [
    /(?:Major Ingredients?|MAJOR INGREDIENTS?)[\s:]*([A-Z][^\.]*(?:,\s*[A-Z][^\.]*){3,})/gi,
    /(?:Ingredients?|INGREDIENTS?)[\s:]*([A-Z][^\.]*(?:,\s*[A-Z][^\.]*){3,})/gi,
    /(?:Active Ingredients?|ACTIVE INGREDIENTS?)[\s:]*([^\.]+)/gi,
    /(?:Inactive Ingredients?|INACTIVE INGREDIENTS?)[\s:]*([^\.]+)/gi,
    /(?:Full Ingredients?|FULL INGREDIENTS?)[\s:]*([^\.]+)/gi,
    /(?:Key Ingredients?|KEY INGREDIENTS?)[\s:]*([A-Z][^\.]*(?:,\s*[A-Z][^\.]*){3,})/gi
  ];

  let bestMatch = null;
  let bestScore = 0;

  for (let i = 0; i < patterns.length; i++) {
    const matches = allText.matchAll(patterns[i]);
    for (const match of matches) {
      if (match[1] && match[1].length > 50) {
        const text = match[1];
        const commaCount = (text.match(/,/g) || []).length;

        const hasChemicalTerms = /(?:aqua|water|glycerin|acid|alcohol|extract|oil|butter|tocopherol|panthenol|cetyl|stearyl|dimethicone|carbomer|xanthan|phenoxyethanol)/i.test(text);

        const hasColonInFirst20 = text.substring(0, 20).indexOf(':') >= 0;

        const score = commaCount + (hasChemicalTerms ? 10 : 0) - (hasColonInFirst20 ? 20 : 0);

        if (score > bestScore && commaCount >= 5) {
          bestScore = score;
          bestMatch = text;
        }
      }
    }
  }

  if (bestMatch && bestMatch.length > 20) {
    const cleaned = bestMatch
      .replace(/Ingredients?:?/gi, '')
      .replace(/Active:?/gi, '')
      .replace(/Inactive:?/gi, '')
      .replace(/\s+/g, ' ')
      .replace(/\([^)]*\)/g, '')
      .trim();

    const parts = cleaned.split(/[,;]/);
    for (let i = 0; i < parts.length; i++) {
      let ingredient = parts[i]
        .trim()
        .replace(/^\d+\.?\s*/, '')
        .replace(/\*+$/, '');

      if (ingredient.indexOf(':') >= 0) {
        continue;
      }

      if (ingredient &&
          ingredient.length > 2 &&
          ingredient.length < 100 &&
          /[a-zA-Z]/.test(ingredient)) {
        ingredients.push(ingredient);
      }
    }
  }

  console.log('Scraped ingredients:', ingredients.length, ingredients.slice(0, 5));
  return ingredients;
}

function getPageText() {
  let pageText = '';

  const main = document.querySelector('main');
  if (main && main.textContent) {
    pageText = main.textContent.substring(0, 2000);
  } else if (document.body && document.body.textContent) {
    pageText = document.body.textContent.substring(0, 2000);
  }

  return pageText;
}

function scrapeProduct() {
  const pageInfo = getPageInfo();
  const ingredients = getIngredients();
  const pageText = getPageText();

  return {
    pageInfo: pageInfo,
    ingredients: ingredients,
    pageText: pageText
  };
}

chrome.runtime.onMessage.addListener(function(message, _sender, sendResponse) {
  if (message.type === 'SCRAPE_PRODUCT') {
    const productData = scrapeProduct();
    sendResponse({ success: true, data: productData });
  }
  return true;
});
