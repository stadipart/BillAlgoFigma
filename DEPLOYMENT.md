# BillFlow Deployment Guide

This guide covers deploying BillFlow to Netlify or AWS.

## Prerequisites

- Node.js 20+ installed
- Supabase account with project created
- Git repository (GitHub, GitLab, or Bitbucket)

## Environment Variables

You need to set these environment variables in your deployment platform:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Netlify Deployment

### Option 1: Deploy via Netlify CLI

1. Install Netlify CLI:
```bash
npm install -g netlify-cli
```

2. Build your project:
```bash
npm run build
```

3. Deploy:
```bash
netlify deploy --prod
```

4. Follow the prompts to:
   - Authorize Netlify CLI
   - Select or create a site
   - Specify `build` as the publish directory

### Option 2: Deploy via Netlify UI

1. Push your code to a Git repository (GitHub/GitLab/Bitbucket)

2. Go to [Netlify](https://app.netlify.com/)

3. Click "Add new site" → "Import an existing project"

4. Connect your Git provider and select your repository

5. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `build`
   - **Node version**: `20`

6. Add environment variables:
   - Go to Site settings → Environment variables
   - Add `VITE_SUPABASE_URL`
   - Add `VITE_SUPABASE_ANON_KEY`

7. Click "Deploy site"

### Netlify Configuration

The `netlify.toml` file in the root handles:
- Build configuration
- SPA redirects (all routes → index.html)
- Node version specification

## AWS Deployment Options

### Option 1: AWS Amplify

1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify/)

2. Click "New app" → "Host web app"

3. Connect your Git repository

4. Configure build settings:
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - npm ci
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: build
       files:
         - '**/*'
     cache:
       paths:
         - node_modules/**/*
   ```

5. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

6. Deploy

### Option 2: AWS S3 + CloudFront

1. **Build your project**:
```bash
npm run build
```

2. **Create S3 Bucket**:
```bash
aws s3 mb s3://billflow-app
```

3. **Configure bucket for static website hosting**:
```bash
aws s3 website s3://billflow-app --index-document index.html --error-document index.html
```

4. **Upload build files**:
```bash
aws s3 sync build/ s3://billflow-app --delete
```

5. **Create CloudFront Distribution**:
   - Origin: Your S3 bucket
   - Default root object: `index.html`
   - Error pages: Route 404/403 to `/index.html` with 200 status
   - Enable HTTPS
   - Set environment variables via CloudFront Functions or Lambda@Edge

6. **Update bucket policy** for CloudFront access:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowCloudFrontAccess",
      "Effect": "Allow",
      "Principal": {
        "Service": "cloudfront.amazonaws.com"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::billflow-app/*"
    }
  ]
}
```

### Option 3: AWS Elastic Beanstalk

1. Install EB CLI:
```bash
pip install awsebcli
```

2. Initialize Elastic Beanstalk:
```bash
eb init billflow --platform node.js --region us-east-1
```

3. Create environment:
```bash
eb create billflow-production
```

4. Set environment variables:
```bash
eb setenv VITE_SUPABASE_URL=your_url VITE_SUPABASE_ANON_KEY=your_key
```

5. Deploy:
```bash
eb deploy
```

## Post-Deployment

### 1. Verify Deployment

Visit your deployed URL and check:
- [ ] Login/Signup works
- [ ] Dashboard loads
- [ ] Database operations work (create/edit/delete items)
- [ ] Theme switching works
- [ ] All pages accessible

### 2. Supabase Configuration

Ensure your Supabase project allows requests from your deployed domain:

1. Go to Supabase Dashboard → Settings → API
2. Add your deployment URL to allowed origins if needed

### 3. Custom Domain (Optional)

#### Netlify:
1. Go to Site settings → Domain management
2. Add custom domain
3. Configure DNS records as instructed

#### AWS:
1. Request ACM certificate for your domain
2. Add custom domain to CloudFront distribution
3. Update DNS records (CNAME or A/AAAA with Alias)

## Troubleshooting

### Issue: Blank page after deployment
**Solution**: Check browser console for errors. Ensure environment variables are set correctly.

### Issue: 404 errors on page refresh
**Solution**: Ensure SPA redirects are configured (netlify.toml or CloudFront error pages).

### Issue: API calls failing
**Solution**:
1. Check CORS settings in Supabase
2. Verify environment variables are set
3. Check network tab for actual error

### Issue: Build fails
**Solution**:
1. Verify Node version is 20+
2. Check that all dependencies are in package.json
3. Run `npm run build` locally first

## CI/CD Pipeline

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Netlify

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}

      - name: Deploy to Netlify
        uses: nwtgck/actions-netlify@v2
        with:
          publish-dir: './build'
          production-deploy: true
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

## Performance Optimization

### 1. Enable Compression
Both Netlify and CloudFront automatically handle compression.

### 2. Caching
- Static assets are automatically cached
- CloudFront: Configure cache behaviors
- Netlify: Handled automatically

### 3. Bundle Size
Current bundle size: ~1.2MB (can be optimized with code splitting)

## Security Checklist

- [ ] Environment variables are not committed to Git
- [ ] Supabase RLS policies are properly configured
- [ ] HTTPS is enabled
- [ ] API keys are stored securely
- [ ] CORS is properly configured

## Monitoring

### Netlify:
- View deploy logs in Netlify dashboard
- Enable analytics in Site settings

### AWS:
- CloudWatch for logs and metrics
- CloudFront access logs
- S3 access logs

## Support

For issues:
1. Check deployment logs
2. Verify environment variables
3. Test locally first
4. Check Supabase connection

## Cost Estimates

### Netlify:
- Free tier: 100GB bandwidth/month
- Pro: $19/month (unlimited)

### AWS:
- S3: ~$0.50-2/month
- CloudFront: ~$1-5/month (100GB transfer)
- Amplify: Free tier, then $0.01/build minute

## Next Steps

After deployment:
1. Set up custom domain
2. Configure CI/CD pipeline
3. Enable monitoring
4. Set up backup strategy for database
5. Configure email notifications (via Supabase)
