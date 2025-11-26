<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Eran Studio Suit

A powerful AI-powered creative studio suite built with React, TypeScript, and Vite.

**Live Demo:** https://\<your-username\>.github.io/Eran-Studio-Suit/

View your app in AI Studio: https://ai.studio/apps/drive/1tDO4LUG5AiaDFV9cKVBtubEJNHkt0oKX

## Run Locally

**Prerequisites:** Node.js 18+

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deploy to GitHub Pages

### Automated Deployment (Recommended)

This project is configured for automatic deployment to GitHub Pages using GitHub Actions.

**Setup Steps:**

1. **Enable GitHub Pages:**
   - Go to your repository Settings → Pages
   - Under "Source", select "GitHub Actions"

2. **Add API Key Secret:**
   - Go to Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `GEMINI_API_KEY`
   - Value: Your Gemini API key
   - Click "Add secret"

3. **Deploy:**
   - Push your changes to the `main` branch
   - GitHub Actions will automatically build and deploy your app
   - Your site will be live at: `https://<your-username>.github.io/Eran-Studio-Suit/`

### Manual Deployment

If you prefer to deploy manually:

1. Install gh-pages package:
   ```bash
   npm install --save-dev gh-pages
   ```

2. Deploy:
   ```bash
   npm run deploy
   ```

## Technology Stack

- **Framework:** React 19 with TypeScript
- **Build Tool:** Vite 6
- **AI Integration:** Google Generative AI (Gemini)
- **UI Icons:** Lucide React
- **Deployment:** GitHub Pages with GitHub Actions
