# LionsChat Frontend - Vercel Deployment Guide

## Prerequisites
- Git repository pushed to GitHub
- Backend deployed on Render with URL available

## Deployment Steps

### 1. Push Code to GitHub
Make sure your frontend code is in a separate repository: `LionsChatApp-Frontend`

### 2. Update API Configuration

Before deploying, update the backend URL in `src/config.js`:

```javascript
const API_CONFIG = {
    BASE_URL: isProduction 
        ? 'https://YOUR-RENDER-APP.onrender.com'  // Replace with your actual Render URL
        : 'https://localhost:7218',
    WS_URL: isProduction 
        ? 'https://YOUR-RENDER-APP.onrender.com'  // Replace with your actual Render URL
        : 'https://localhost:7218'
};
```

Replace `YOUR-RENDER-APP` with your actual Render service name.

### 3. Deploy to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository: `jerrylokoroi/LionsChatApp-Frontend`
4. Configure project:
   - **Framework Preset**: Other
   - **Root Directory**: `./`
   - **Build Command**: Leave empty (no build needed for vanilla JS)
   - **Output Directory**: `.`
   - **Install Command**: Leave empty

5. Click **"Deploy"**

### 4. Get Your Vercel URL

After deployment completes, Vercel will provide your URL:
- Production: `https://lionschatapp-frontend.vercel.app`
- Or your custom domain

### 5. Update Backend CORS

The backend is already configured to allow your Vercel domain. If needed, verify in the backend [Program.cs](../LionsChatBE/LLFS.LionsChat.API/Program.cs):

```csharp
policy.WithOrigins(
    "https://lionschatapp-frontend.vercel.app",  // Your Vercel URL
    // ... other origins
)
```

### 6. Test Your Application

Visit your Vercel URL and test:
- User registration
- User login
- Creating chatrooms
- Sending messages
- Real-time message updates (SignalR)

## Configuration Files

### `src/config.js`
Central configuration for API endpoints. Automatically detects production environment and uses appropriate URLs.

### `vercel.json`
Vercel configuration file with deployment settings.

## Troubleshooting

### API Connection Fails
1. Check browser console for CORS errors
2. Verify the Render URL in `src/config.js` is correct
3. Ensure backend CORS includes your Vercel URL
4. Check if backend service is running on Render

### SignalR/WebSocket Connection Issues
1. Render free tier may have WebSocket limitations
2. Check if backend is awake (free tier spins down after inactivity)
3. Verify WS_URL in config matches your backend URL
4. Check browser console for SignalR connection errors

### Static Files Not Loading
1. Verify all file paths are relative (no absolute paths)
2. Check that CSS and image files are committed to Git
3. Look for 404 errors in browser Network tab

### Environment Detection Wrong
The app detects production by checking if hostname is not localhost. If you need different logic:

```javascript
// In src/config.js
const isProduction = window.location.hostname.includes('vercel.app');
```

## Custom Domain (Optional)

To use a custom domain:
1. Go to Vercel project settings
2. Navigate to "Domains"
3. Add your custom domain
4. Update DNS records as instructed
5. Update backend CORS to include your custom domain

## Continuous Deployment

Vercel automatically deploys:
- **Production**: Commits to `main` branch
- **Preview**: Pull requests and other branches

Every push to main will trigger a new deployment.

## Performance Tips

1. **Images**: Optimize images before committing (use WebP format)
2. **Caching**: Vercel automatically caches static assets
3. **CDN**: Vercel serves your site from global CDN
4. **Monitoring**: Check Vercel Analytics for performance insights

## Files Updated for Deployment

- `src/config.js` - Environment-aware API configuration
- `src/api/authentication-api-service.js` - Uses centralized config
- `src/api/chatroom-api-service.js` - Uses centralized config
- `src/managers/chatroom-page-manager.js` - Uses config for SignalR
- `vercel.json` - Vercel deployment configuration

## Post-Deployment Checklist

- [ ] Frontend loads without errors
- [ ] Can register new user
- [ ] Can login with credentials
- [ ] Can create chatroom
- [ ] Can send messages
- [ ] Messages appear in real-time
- [ ] Can see other users' messages
- [ ] No console errors
- [ ] Backend CORS allows frontend domain
