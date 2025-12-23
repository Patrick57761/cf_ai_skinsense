# SkinSense

AI-powered skincare product analysis Chrome extension with personalized recommendations.

## What It Does

SkinSense helps you make informed decisions about skincare products by analyzing ingredients and providing personalized recommendations based on your skin profile. The extension uses AI to analyze product ingredients and generate tailored insights for your specific skin type, climate, and concerns.

## Features

- **Product Detection**: Automatically extracts product information from e-commerce pages
- **AI Ingredient Analysis**: Analyzes ingredients and identifies which ones work for your skin
- **Personalized Recommendations**: Tailored advice based on your skin type, climate, and concerns
- **Smart Caching**: Fast responses with 30-day intelligent caching

## How to Use

1. Navigate to any skincare product page (Amazon, Sephora, etc.)
2. Click the SkinSense extension icon
3. Set up your skin profile (first time only)
4. Click "Analyze This Product"
5. View your personalized ingredient analysis and recommendations

## Installation

### Deploy the Backend

1. Install dependencies:
   ```bash
   cd worker
   npm install
   ```

2. Authenticate with Cloudflare:
   ```bash
   npx wrangler login
   ```

3. Deploy:
   ```bash
   npx wrangler deploy
   ```

### Install the Extension

1. Build the extension:
   ```bash
   cd extension
   npm install
   npm run build
   ```

2. Update `extension/src/config.ts` with your deployed API URL

3. Load in Chrome:
   - Go to `chrome://extensions`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `extension/dist` folder

## Known Limitations

The Reddit community review feature is currently unavailable due to API rate-limiting of Cloudflare Workers IPs. This is a common limitation with serverless platforms. The core AI analysis and personalized recommendations work fully.

## License

MIT