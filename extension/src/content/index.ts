function getProductName() {
  let productName = '';

  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) {
    const content = ogTitle.getAttribute('content');
    if (content) {
      productName = content;
    }
  }

  if (!productName) {
    const h1 = document.querySelector('h1');
    if (h1 && h1.textContent) {
      productName = h1.textContent;
    }
  }

  if (!productName) {
    productName = document.title;
  }

  return productName.trim();
}

function getBrand() {
  let brand = '';

  const brandElement = document.querySelector('[itemprop="brand"]');
  if (brandElement && brandElement.textContent) {
    brand = brandElement.textContent.trim();
    return brand;
  }

  const brandClass = document.querySelector('.product-brand');
  if (brandClass && brandClass.textContent) {
    brand = brandClass.textContent.trim();
    return brand;
  }

  return brand;
}

function getIngredients() {
  const ingredients = [];

  const ingredientElement = document.querySelector('[class*="ingredient"]');
  if (ingredientElement && ingredientElement.textContent) {
    const text = ingredientElement.textContent;
    const cleaned = text.replace('Ingredients:', '').replace('ingredients:', '');

    if (cleaned.length > 20) {
      const parts = cleaned.split(',');
      for (let i = 0; i < parts.length; i++) {
        const ingredient = parts[i].trim();
        if (ingredient) {
          ingredients.push(ingredient);
        }
      }
    }
  }

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
  const productName = getProductName();
  const brand = getBrand();
  const ingredients = getIngredients();
  const pageText = getPageText();
  const url = window.location.href;

  return {
    productName: productName,
    brand: brand,
    ingredients: ingredients,
    url: url,
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
