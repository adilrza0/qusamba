# Qusamba E-commerce Platform - Deployment Guide

## Prerequisites

Before deploying, make sure you have:

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **MongoDB Atlas**: Set up a database at [mongodb.com](https://www.mongodb.com/cloud/atlas)
3. **Cloudinary Account**: For image uploads at [cloudinary.com](https://cloudinary.com)
4. **Stripe Account**: For payments at [stripe.com](https://stripe.com)

## Environment Variables Setup

### Backend Environment Variables (Add in Vercel Dashboard)

```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/qusamba
NODE_ENV=production
PORT=5000
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
JWT_EXPIRE=7d
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
FRONTEND_URL=https://your-app-name.vercel.app
```

### Frontend Environment Variables

```
NEXT_PUBLIC_API_URL=https://your-app-name.vercel.app/api
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key
NEXT_PUBLIC_APP_URL=https://your-app-name.vercel.app
```

## Deployment Steps

### Option 1: Deploy via Vercel CLI

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy from the project root:
```bash
vercel
```

4. Follow the prompts and add environment variables when prompted.

### Option 2: Deploy via GitHub (Recommended)

1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/qusamba.git
   git push -u origin main
   ```

2. **Connect to Vercel**:
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository
   - Configure environment variables in the Vercel dashboard

3. **Set Environment Variables**:
   - In Vercel dashboard, go to your project settings
   - Add all environment variables listed above
   - Deploy again if needed

## Database Setup (MongoDB Atlas)

1. Create a MongoDB Atlas account
2. Create a new cluster
3. Create a database user
4. Whitelist your IP address (or use 0.0.0.0/0 for all)
5. Get the connection string and add to MONGO_URI

## Image Upload Setup (Cloudinary)

1. Create a Cloudinary account
2. Get your cloud name, API key, and API secret
3. Add these to your environment variables

## Payment Setup (Stripe)

1. Create a Stripe account
2. Get your publishable and secret keys
3. Add webhook endpoint for your Vercel app
4. Add environment variables

## Post-Deployment Checklist

- [ ] Test user registration and login
- [ ] Test product creation with images
- [ ] Test cart functionality
- [ ] Test payment processing
- [ ] Test admin features
- [ ] Check all API endpoints are working
- [ ] Verify environment variables are set correctly

## Troubleshooting

### Common Issues:

1. **API not found**: Check if backend routes are correctly configured
2. **CORS errors**: Verify FRONTEND_URL environment variable
3. **Database connection**: Check MongoDB Atlas whitelist and connection string
4. **Image upload fails**: Verify Cloudinary credentials
5. **Build fails**: Check for syntax errors and missing dependencies

### Useful Commands:

```bash
# Check deployment logs
vercel logs

# Redeploy
vercel --prod

# View environment variables
vercel env ls
```

## Support

If you encounter issues during deployment, check:
1. Vercel build logs
2. Browser console for frontend errors
3. Network tab for API call failures
4. MongoDB Atlas logs for database issues
