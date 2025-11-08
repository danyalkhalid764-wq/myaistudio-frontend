# MyAIStudio Frontend

React + Vite frontend for MyAIStudio application.

## 🚀 Quick Start

### Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

3. Frontend will run on `http://localhost:3000`

### Production Build

```bash
npm run build
```

Build output will be in the `dist` folder.

## 🌐 Deployment on Netlify

### Prerequisites

- Railway backend URL: `https://pakistani-project-backend-production.up.railway.app`

### Setup Steps

1. **Connect GitHub Repo to Netlify**
   - Go to [Netlify Dashboard](https://app.netlify.com/)
   - Click "Add new site" → "Import an existing project"
   - Connect your GitHub repo: `myaistudio-frontend`
   - Netlify will auto-detect build settings from `netlify.toml`

2. **Set Environment Variable**
   - Go to Site settings → Environment variables
   - Add: `VITE_API_URL` = `https://pakistani-project-backend-production.up.railway.app`
   - Save

3. **Deploy**
   - Netlify will automatically build and deploy
   - Or trigger manual deploy from Deploys tab

### Build Settings (Auto-detected from netlify.toml)

- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Node version**: 18

## 📋 Environment Variables

### Required for Production

- `VITE_API_URL`: Your Railway backend URL
  - Example: `https://pakistani-project-backend-production.up.railway.app`

### Local Development

- Defaults to: `http://localhost:8000`
- Can be overridden with `.env.local` file:
  ```
  VITE_API_URL=http://localhost:8000
  ```

## 🔗 API Configuration

All API calls use `VITE_API_URL` environment variable:
- `src/api/auth.js` - Authentication
- `src/api/payment.js` - Payments
- `src/api/tts.js` - Text-to-speech
- `src/api/video.js` - Video generation

## 📦 Project Structure

```
frontend/
├── src/
│   ├── api/          # API client files
│   ├── components/   # React components
│   ├── contexts/     # React contexts
│   ├── pages/        # Page components
│   └── main.jsx      # Entry point
├── public/           # Static assets
├── dist/             # Build output (gitignored)
└── netlify.toml      # Netlify configuration
```

## 🛠️ Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool
- **React Router** - Routing
- **Axios** - HTTP client
- **Tailwind CSS** - Styling
- **React Hot Toast** - Notifications

## 📝 Notes

- The `dist` folder is gitignored (build output)
- Environment variables starting with `VITE_` are embedded at build time
- Make sure to set `VITE_API_URL` in Netlify before building
