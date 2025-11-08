# Netlify Deployment Guide

## Quick Deploy (Drag & Drop)

1. Build the frontend:
   ```bash
   npm run build
   ```

2. Drag and drop the `dist` folder to Netlify's deploy interface

## Environment Variables

Before deploying, make sure to set the following environment variable in Netlify:

- **VITE_API_URL**: Your backend API URL (e.g., `https://your-backend.railway.app`)

### How to Set Environment Variables in Netlify:

1. Go to your site settings in Netlify
2. Navigate to **Environment variables**
3. Add `VITE_API_URL` with your backend URL
4. Redeploy your site

## Important Notes

- The `_redirects` file in the `public` folder ensures SPA routing works correctly
- The `netlify.toml` file is configured for automatic builds if you connect your GitHub repo
- Make sure your backend API has CORS enabled for your Netlify domain

## Manual Build

If you need to rebuild manually:

```bash
cd frontend
npm install
npm run build
```

The `dist` folder will contain all the production-ready files.




