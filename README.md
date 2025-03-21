# URL Shortener Backend

A URL shortening service built with Node.js, Express, TypeScript, and PostgreSQL, following Domain-Driven Design (DDD) principles.

## Features

- Create shortened URLs with custom or auto-generated slugs
- Track visit counts for shortened URLs
- User authentication via Clerk
- Rate limiting to prevent abuse
- Request validation using Zod
- RESTful API following JSON:API specification
- Self-ping mechanism for health checks
- Ping service as a heartbeat to prevent application spin-down on Render

## Tech Stack

- Node.js 22
- TypeScript
- Express
- PostgreSQL
- Clerk for authentication
- Zod for validation
- Docker (optional for local development)

## Prerequisites

- Node.js 22 or higher
- PostgreSQL database
- Clerk account for authentication

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
PORT=3000
NODE_ENV=development
BASE_URL=http://localhost:3000
DATABASE_URL=postgres://username:password@localhost:5432/url_shortener
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
CLERK_API_KEY=your_clerk_api_key
CLERK_FRONTEND_API=your_clerk_frontend_api
PING_INTERVAL=300000
```

## Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/url-shortener-backend.git
cd url-shortener-backend
```

2. Install dependencies:

```bash
npm install
```

3. Set up the database:

```bash
npm run db:init
```

4. Build the application:

```bash
npm run build
```

## Running the Application

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

### Ping Service

The application includes a ping service that acts as a heartbeat to prevent the application from spinning down on hosting platforms like Render that have idle timeout policies. This is particularly useful for free-tier deployments.

To run the ping service separately:

```bash
npm run ping
```

The ping service periodically sends requests to the application's health endpoint to keep it alive. You can configure the interval using the `PING_INTERVAL` environment variable (in milliseconds, default is 5 minutes).

When deployed to Render, the ping service is automatically started as part of the application, ensuring continuous availability without manual intervention.

## API Endpoints

### Create a Short URL

```
POST /api/urls
```

Request body:
```json
{
  "data": {
    "attributes": {
      "originalUrl": "https://example.com",
      "slug": "custom-slug" // Optional
    }
  }
}
```

### Get User's URLs

```
GET /api/urls
```

### Get URL by ID

```
GET /api/urls/:id
```

### Update URL

```
PUT /api/urls/:id
```

Request body:
```json
{
  "data": {
    "attributes": {
      "originalUrl": "https://updated-example.com",
      "slug": "updated-slug"
    }
  }
}
```

### Delete URL

```
DELETE /api/urls/:id
```

### Redirect to Original URL

```
GET /:slug
```

## API Validation

The API uses Zod for request validation to ensure data integrity and provide clear error messages. The validation:

- Supports both JSON:API format and direct format for request bodies
- Validates URLs to ensure they are properly formatted
- Ensures required fields are present
- Validates parameter types and formats (e.g., UUIDs, slugs)
- Returns standardized error responses following JSON:API specification

Example of a validation error response:

```json
{
  "errors": [
    {
      "status": "400",
      "title": "Validation Error",
      "detail": "Required",
      "source": {
        "pointer": "/data/originalUrl"
      }
    }
  ]
}
```

## License

MIT
