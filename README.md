# URL Shortener Backend

A URL shortening service built with Node.js, Express, TypeScript, and PostgreSQL, following Domain-Driven Design (DDD) principles.

## Features

- Create shortened URLs with custom or auto-generated slugs
- Track visit counts for shortened URLs
- User authentication via Clerk
- Rate limiting to prevent abuse
- RESTful API following JSON:API specification
- Self-ping mechanism for health checks

## Tech Stack

- Node.js 22
- TypeScript
- Express
- PostgreSQL
- Clerk for authentication
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

## License

MIT
