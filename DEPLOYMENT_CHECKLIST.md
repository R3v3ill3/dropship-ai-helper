# Deployment Checklist

Use this checklist to ensure your DropshipAI Helper is properly deployed and configured.

## ✅ Pre-Deployment

### Database Setup
- [ ] Run `database-setup-improved.sql` in Supabase SQL editor
- [ ] Verify tables exist: `projects` and `outputs`
- [ ] Confirm `brand_tone` column exists in `projects` table
- [ ] Check Row Level Security (RLS) policies are enabled
- [ ] Test database connection with `npm run verify-db`

### Environment Variables
- [ ] `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- [ ] `OPENAI_API_KEY` - Your OpenAI API key
- [ ] `NODE_VERSION=20.11.0` - Set in Railway environment

### Code Configuration
- [ ] Node.js version set to 20+ (check `.nvmrc` and `railway.json`)
- [ ] Dependencies installed (`npm install`)
- [ ] Build succeeds locally (`npm run build`)

## ✅ Railway Deployment

### Railway Setup
- [ ] Project connected to GitHub repository
- [ ] Environment variables configured in Railway dashboard
- [ ] `NODE_VERSION=20.11.0` set in Railway variables
- [ ] Build logs show successful deployment
- [ ] Health check passes (status 200 on `/`)

### Post-Deployment Tests
- [ ] Application loads without errors
- [ ] User registration/login works
- [ ] Dashboard displays correctly
- [ ] Generate branding API returns success (not 500 error)
- [ ] Database operations complete successfully

## ✅ Troubleshooting

If you encounter issues:

1. **Check Railway Logs**
   ```bash
   # Look for specific error messages
   # Common issues: missing env vars, database connection errors
   ```

2. **Verify Database Schema**
   ```bash
   npm run verify-db
   ```

3. **Test API Endpoints**
   - Visit `/api/generate-branding` should return method not allowed (405) not 500
   - POST requests should work with proper authentication

4. **Database Issues**
   - See `DATABASE_TROUBLESHOOTING.md` for detailed solutions
   - Check Supabase dashboard for table structure
   - Restart Supabase API if needed

## ✅ Performance Optimization

### After Successful Deployment
- [ ] Monitor Railway resource usage
- [ ] Check API response times
- [ ] Monitor OpenAI API usage and costs
- [ ] Set up error monitoring/logging
- [ ] Configure domain (if using custom domain)

## ✅ Security Checklist

- [ ] RLS policies properly configured
- [ ] API keys not exposed in client-side code
- [ ] CORS configured correctly
- [ ] Authentication working properly
- [ ] User data isolated per user account

## Common Error Solutions

### "Could not find the 'brand_tone' column"
- Run the improved database setup script
- Restart Supabase API from dashboard
- Verify table structure in Supabase

### Node.js Deprecation Warnings
- Ensure `NODE_VERSION=20.11.0` in Railway
- Check `.nvmrc` file exists
- Redeploy after updating Node version

### 500 Internal Server Error
- Check Railway logs for specific error details
- Verify all environment variables are set
- Test database connection
- Check OpenAI API key validity

## Success Indicators

✅ **Deployment is successful when:**
- Application loads without errors
- User can register/login
- Generate branding returns results (not errors)
- Database operations complete successfully
- No 500 errors in Railway logs
- Node.js 20+ is being used (no deprecation warnings)