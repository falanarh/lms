# API Configuration Documentation

This document explains how to configure API endpoints using environment variables.

## Environment Variables

### Required Environment Variables

| Variable | Description | Default Value |
|----------|-------------|---------------|
| `NEXT_PUBLIC_API_BASE_URL` | Base URL for all API endpoints | `https://api-lms-kappa.vercel.app` |

## Setup Instructions

### 1. Create Environment File

Copy the example environment file:

```bash
cp .env.example .env.local
```

### 2. Configure API Base URL

Edit `.env.local` and set your API base URL:

```bash
# Production API
NEXT_PUBLIC_API_BASE_URL=https://api-lms-kappa.vercel.app

# Development API (if available)
# NEXT_PUBLIC_API_BASE_URL=http://localhost:8080

# Staging API (if available)
# NEXT_PUBLIC_API_BASE_URL=https://staging-api.example.com
```

### 3. Restart Development Server

```bash
npm run dev
```

## API Endpoints

The application uses the following API endpoints:

### Forums
- `GET /forums` - Get all forums
- `POST /forums` - Create new forum
- `PATCH /forums/{id}` - Update forum

### Topics
- `POST /topics` - Create new topic

### Discussions
- `POST /discussions` - Create new discussion
- `PATCH /discussions/{id}` - Edit discussion
- `PATCH /discussions/{id}/vote` - Vote on discussion
- `GET /discussions/{forumId}/replies` - Get discussions for forum

## Usage in Code

```typescript
import { API_ENDPOINTS, API_CONFIG } from '@/config/api';

// Example API call
const response = await axios.get(API_ENDPOINTS.FORUMS, API_CONFIG);
```

## Development vs Production

- **Development**: Use `.env.local` for local development configuration
- **Production**: Set environment variables in your hosting platform (Vercel, Netlify, etc.)
- **Staging**: Create `.env.staging` for staging environment

## Security Notes

- Only use `NEXT_PUBLIC_` prefix for variables that need to be accessed in the browser
- Sensitive API keys should be handled server-side (without `NEXT_PUBLIC_` prefix)
- Never commit `.env.local` to version control (it's already in `.gitignore`)

## Troubleshooting

### API calls failing

1. Check if the environment variable is set correctly:
   ```bash
   echo $NEXT_PUBLIC_API_BASE_URL
   ```

2. Verify the API is accessible:
   ```bash
   curl $NEXT_PUBLIC_API_BASE_URL/forums
   ```

3. Restart the development server after changing environment variables

### Environment variables not loading

1. Ensure the file is named `.env.local` (not `.env`)
2. Check that the variable starts with `NEXT_PUBLIC_`
3. Restart the development server
4. Check for syntax errors in the `.env.local` file

## Migration from Hardcoded URLs

Previously, API URLs were hardcoded like this:

```typescript
// Before (❌ Hardcoded)
const response = await axios.get("https://api-lms-kappa.vercel.app/forums");
```

Now they use environment variables:

```typescript
// After (✅ Environment-based)
import { API_ENDPOINTS, API_CONFIG } from '@/config/api';
const response = await axios.get(API_ENDPOINTS.FORUMS, API_CONFIG);
```

This change makes the application more flexible and secure for different deployment environments.