# Video Overlay Endpoint - Environment Variables

Add the following environment variables to your `.env` file for Cloudflare R2 storage:

```bash
# Cloudflare R2 Configuration
R2_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=your_r2_access_key_id
R2_SECRET_ACCESS_KEY=your_r2_secret_access_key
R2_BUCKET_NAME=video-processing
R2_PUBLIC_URL=https://your-bucket.your-domain.com
```

## How to Get R2 Credentials

1. **Create R2 Bucket**:
   - Go to Cloudflare Dashboard → R2
   - Create a new bucket (e.g., `video-processing`)
   - Enable public access if you want videos to be publicly accessible

2. **Get API Tokens**:
   - Go to R2 → Manage R2 API Tokens
   - Create API Token with "Object Read & Write" permissions
   - Copy the Access Key ID and Secret Access Key

3. **Configure Public URL** (Optional):
   - Set up a custom domain for your R2 bucket
   - Or use the default R2.dev subdomain
   - Update `R2_PUBLIC_URL` with your domain

## FFmpeg Installation

The endpoint requires FFmpeg to be installed on the server:

### macOS
```bash
brew install ffmpeg
```

### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install ffmpeg
```

### Docker
If deploying with Docker, add to your Dockerfile:
```dockerfile
RUN apt-get update && apt-get install -y ffmpeg
```

## Vercel/Serverless Deployment Notes

> **Important**: FFmpeg processing can be resource-intensive and may exceed serverless function limits.

For production deployment on Vercel or similar platforms:
1. Consider using a background job queue (e.g., BullMQ, AWS SQS)
2. Or use a dedicated server/container for video processing
3. Or use cloud-based video processing services (e.g., Cloudinary, AWS MediaConvert)

The current implementation uses `ffmpeg-static` which bundles FFmpeg, but processing large videos may timeout on serverless platforms.
