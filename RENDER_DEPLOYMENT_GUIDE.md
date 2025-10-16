# Render Deployment Guide

## Backend Deployment Configuration

### Build Command
```bash
npm run build
```

### Start Command
```bash
npm start
```

### Environment Variables Required

Set these in your Render dashboard under "Environment":

```env
# Database Configuration
DATABASE_URL=postgresql://username:password@host:port/database

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=5000
NODE_ENV=production

# Client Configuration (your frontend URL)
CLIENT_URL=https://your-frontend-domain.onrender.com

# OpenAI Configuration
OPENAI_API_KEY=sk-your-openai-api-key

# Stripe Configuration
STRIPE_SECRET_KEY=sk_live_your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=whsec_your-stripe-webhook-secret

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=EchoWrite <noreply@echowrite.ai>

# App Configuration
APP_NAME=EchoWrite
APP_URL=https://your-backend-domain.onrender.com

# Feature Limits
ANONYMOUS_SESSION_EXPIRY_DAYS=30
FREE_CONVERSATIONS_LIMIT=3
FREE_MESSAGES_LIMIT=3
```

## Build Process

The build command `npm run build` will:

1. **Install Dependencies**: `npm install` - Installs all required packages
2. **Generate Prisma Client**: `npm run prisma:generate` - Generates Prisma client for database operations
3. **Compile TypeScript**: `tsc` - Compiles TypeScript to JavaScript in `dist/` folder
4. **Run Database Migrations**: `npm run prisma:deploy` - Applies database schema changes

## Deployment Steps

### 1. Prepare Your Repository
- Ensure all changes are committed and pushed to GitHub
- Make sure `.env` file is not committed (it's in `.gitignore`)

### 2. Create Render Service
- Go to [Render Dashboard](https://dashboard.render.com)
- Click "New" → "Web Service"
- Connect your GitHub repository
- Select your repository and branch

### 3. Configure Service Settings
- **Name**: `ai-social-post-creator-backend`
- **Runtime**: `Node`
- **Build Command**: `npm run build`
- **Start Command**: `npm start`
- **Node Version**: `18` (or higher)

### 4. Set Environment Variables
- Copy all environment variables from the list above
- Paste them in the "Environment Variables" section
- Make sure to use your actual values (not the example values)

### 5. Database Setup
- Create a PostgreSQL database on Render (if not already done)
- Copy the database URL and set it as `DATABASE_URL`
- The first deployment will automatically run migrations

### 6. Deploy
- Click "Create Web Service"
- Wait for the build to complete (usually 5-10 minutes)
- Check the logs for any errors

## Troubleshooting

### Common Issues

1. **Build Fails with TypeScript Errors**
   - Ensure all `@types/*` packages are in dependencies (not devDependencies)
   - Check that `tsconfig.json` has proper Node.js configuration

2. **Database Connection Issues**
   - Verify `DATABASE_URL` is correct
   - Ensure database is accessible from Render
   - Check if database migrations need to be run manually

3. **Environment Variables Not Working**
   - Double-check all environment variables are set correctly
   - Ensure no typos in variable names
   - Restart the service after adding new environment variables

4. **Prisma Migration Errors**
   - If you see "database schema is not empty" error, this is normal for existing databases
   - The application will still start and work correctly

### Logs and Monitoring
- Check Render logs for detailed error messages
- Monitor the service health in Render dashboard
- Set up alerts for service downtime

## Production Checklist

- [ ] All environment variables configured
- [ ] Database is accessible and migrations applied
- [ ] OpenAI API key is valid and has sufficient credits
- [ ] Stripe keys are production keys (not test keys)
- [ ] Email configuration is working
- [ ] Frontend URL is correctly set in `CLIENT_URL`
- [ ] Service is responding to health checks

## Security Notes

- Never commit `.env` files to version control
- Use strong, unique JWT secrets
- Keep API keys secure and rotate them regularly
- Use HTTPS in production
- Set up proper CORS origins

## Performance Optimization

- Enable Redis caching if needed
- Set up database connection pooling
- Monitor memory usage and scale accordingly
- Use CDN for static assets if applicable
