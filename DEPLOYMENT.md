# Deployment Guide for PriTapia ONG - CPanel

This guide explains how to deploy the PriTapia ONG website to CPanel hosting.

## Prerequisites

- CPanel hosting account with Apache server
- FTP/SFTP access to your hosting
- Domain pointed to your hosting

## Build Process

1. Ensure all dependencies are installed:
   ```bash
   npm install
   ```

2. Build the production version:
   ```bash
   npm run build
   ```

3. The build output will be in the `dist/` directory

## Deployment Steps

### Method 1: FTP Upload

1. Connect to your CPanel hosting via FTP/SFTP
2. Navigate to the public_html directory (or your domain's root directory)
3. Upload all contents from the `dist/` folder to your hosting root directory
4. Ensure the `.htaccess` file is uploaded (it may be hidden)

### Method 2: File Manager

1. Log into your CPanel dashboard
2. Go to "File Manager"
3. Navigate to public_html (or your domain directory)
4. Upload the contents of the `dist/` folder
5. Make sure to show hidden files (dotfiles) to see `.htaccess`

## Important Files

- `index.html` - Main application entry point
- `.htaccess` - Apache configuration for SPA routing and security
- `assets/` - Compiled CSS and JavaScript files
- Static assets (images, favicon, etc.)

## Configuration Notes

### SPA Routing
The `.htaccess` file handles client-side routing by redirecting all requests to `index.html` except for actual files. This ensures React Router works properly on Apache servers.

### Security Headers
The `.htaccess` file includes security headers that were previously in the HTML meta tags for additional server-level protection.

### Compression & Caching
Static assets are configured for optimal compression and caching to improve performance.

## Testing Deployment

1. After upload, visit your domain
2. Test navigation between pages (/, /login, /admin, etc.)
3. Verify all assets load correctly
4. Check browser developer tools for any 404 errors

## Troubleshooting

### 404 Errors on Direct URL Access
If you get 404 errors when accessing routes directly (e.g., domain.com/admin), ensure:
- `.htaccess` file is uploaded and working
- Apache mod_rewrite is enabled (contact hosting provider if needed)

### Assets Not Loading
- Check file permissions (should be 644 for files, 755 for directories)
- Verify all files from `dist/` were uploaded
- Check for case sensitivity issues

### Performance Issues
- Ensure compression is enabled on your server
- Check if caching headers are working

## Environment Variables

If you need different configurations for production:
- Create a `.env.production` file
- Set `VITE_` prefixed variables for client-side environment variables

## Maintenance

- Always test builds locally before deploying
- Keep backup of previous deployment
- Monitor server logs for any issues

## Support

For issues with this deployment:
1. Check CPanel error logs
2. Verify all files are uploaded correctly
3. Test locally with `npm run preview` before deploying