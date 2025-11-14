# API Routes Documentation

Complete reference for all API endpoints in the portfolio backend.

## Base URL

Development: `http://localhost:5000/api`

## Table of Contents

- [Authentication](#authentication)
- [Projects](#projects)
- [Work Experience](#work-experience)
- [Commands](#commands)
- [File Uploads](#file-uploads)
- [Newsletter](#newsletter)
- [Contact Emails](#contact-emails)

---

## Authentication

### Register User

Create a new user account.

**Endpoint:** `POST /api/register`

**Authentication:** None

**Request Body:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "firstName": "string",
  "lastName": "string"
}
```

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "username": "string",
  "email": "string",
  "firstName": "string",
  "lastName": "string",
  "isAdmin": false,
  "createdAt": "timestamp"
}
```

**Errors:**
- `400` - Username or email already exists
- `400` - Validation error

---

### Login

Authenticate and create a session.

**Endpoint:** `POST /api/login`

**Authentication:** None

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "username": "string",
  "email": "string",
  "firstName": "string",
  "lastName": "string",
  "isAdmin": boolean
}
```

**Errors:**
- `401` - Invalid credentials
- `400` - Validation error

---

### Logout

End the current session.

**Endpoint:** `POST /api/logout`

**Authentication:** Required

**Response:** `200 OK`
```json
{
  "message": "Logged out successfully"
}
```

---

### Get Current User

Get the authenticated user's information.

**Endpoint:** `GET /api/user`

**Authentication:** Required

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "username": "string",
  "email": "string",
  "firstName": "string",
  "lastName": "string",
  "isAdmin": boolean
}
```

**Errors:**
- `401` - Unauthorized

---

### Check Admin Status

Check if the current user has admin privileges.

**Endpoint:** `GET /api/admin-status`

**Authentication:** Required

**Response:** `200 OK`
```json
{
  "isAdmin": boolean
}
```

**Errors:**
- `401` - Unauthorized

---

## Projects

### Get All Projects

Retrieve all projects ordered by `order` field.

**Endpoint:** `GET /api/projects`

**Authentication:** None

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "title": "string",
    "description": "string",
    "longDescription": "string",
    "technologies": ["string"],
    "githubUrl": "string",
    "liveUrl": "string",
    "iconUrl": "string",
    "heroImageUrl": "string",
    "screenshotUrls": ["string"],
    "order": 0,
    "createdAt": "timestamp",
    "updatedAt": "timestamp"
  }
]
```

---

### Get Project by ID

Retrieve a specific project.

**Endpoint:** `GET /api/projects/:id`

**Authentication:** None

**URL Parameters:**
- `id` - Project UUID

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "title": "string",
  "description": "string",
  "longDescription": "string",
  "technologies": ["string"],
  "githubUrl": "string",
  "liveUrl": "string",
  "iconUrl": "string",
  "heroImageUrl": "string",
  "screenshotUrls": ["string"],
  "order": 0,
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

**Errors:**
- `404` - Project not found

---

### Create Project

Create a new project.

**Endpoint:** `POST /api/projects`

**Authentication:** Admin required

**Request Body:**
```json
{
  "title": "string",
  "description": "string",
  "longDescription": "string",
  "technologies": ["string"],
  "githubUrl": "string (optional)",
  "liveUrl": "string (optional)",
  "iconUrl": "string (optional)",
  "heroImageUrl": "string (optional)",
  "screenshotUrls": ["string (optional)"],
  "order": 0
}
```

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "title": "string",
  ...
}
```

**Errors:**
- `400` - Invalid project data
- `401` - Authentication required
- `403` - Admin privileges required

---

### Update Project

Update an existing project.

**Endpoint:** `PUT /api/projects/:id`

**Authentication:** Admin required

**URL Parameters:**
- `id` - Project UUID

**Request Body:** (all fields optional)
```json
{
  "title": "string",
  "description": "string",
  "longDescription": "string",
  "technologies": ["string"],
  "githubUrl": "string",
  "liveUrl": "string",
  "order": 0
}
```

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "title": "string",
  ...
}
```

**Errors:**
- `400` - Invalid data
- `401` - Authentication required
- `403` - Admin privileges required
- `404` - Project not found

---

### Delete Project

Delete a project.

**Endpoint:** `DELETE /api/projects/:id`

**Authentication:** Admin required

**URL Parameters:**
- `id` - Project UUID

**Response:** `204 No Content`

**Errors:**
- `401` - Authentication required
- `403` - Admin privileges required
- `404` - Project not found

---

## Work Experience

### Get All Work Experiences

Retrieve all work experiences ordered by `order` field.

**Endpoint:** `GET /api/work-experiences`

**Authentication:** None

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "company": "string",
    "position": "string",
    "description": "string",
    "startDate": "date",
    "endDate": "date (optional)",
    "technologies": ["string"],
    "order": 0,
    "createdAt": "timestamp",
    "updatedAt": "timestamp"
  }
]
```

---

### Get Work Experience by ID

**Endpoint:** `GET /api/work-experiences/:id`

**Authentication:** None

**Response:** `200 OK`

**Errors:**
- `404` - Work experience not found

---

### Create Work Experience

**Endpoint:** `POST /api/work-experiences`

**Authentication:** Admin required

**Request Body:**
```json
{
  "company": "string",
  "position": "string",
  "description": "string",
  "startDate": "date",
  "endDate": "date (optional)",
  "technologies": ["string"],
  "order": 0
}
```

**Response:** `201 Created`

---

### Update Work Experience

**Endpoint:** `PUT /api/work-experiences/:id`

**Authentication:** Admin required

**Response:** `200 OK`

---

### Delete Work Experience

**Endpoint:** `DELETE /api/work-experiences/:id`

**Authentication:** Admin required

**Response:** `204 No Content`

---

## Commands

Commands are project-specific terminal/CLI commands.

### Get Commands by Project

**Endpoint:** `GET /api/projects/:projectId/commands`

**Authentication:** None

**URL Parameters:**
- `projectId` - Project UUID

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "projectId": "uuid",
    "command": "string",
    "description": "string",
    "order": 0,
    "createdAt": "timestamp"
  }
]
```

---

### Get Command by ID

**Endpoint:** `GET /api/commands/:id`

**Authentication:** None

**Response:** `200 OK`

---

### Create Command

**Endpoint:** `POST /api/projects/:projectId/commands`

**Authentication:** Admin required

**Request Body:**
```json
{
  "command": "string",
  "description": "string",
  "order": 0
}
```

**Response:** `201 Created`

---

### Update Command

**Endpoint:** `PUT /api/commands/:id`

**Authentication:** Admin required

**Response:** `200 OK`

---

### Delete Command

**Endpoint:** `DELETE /api/commands/:id`

**Authentication:** Admin required

**Response:** `204 No Content`

---

## File Uploads

All file upload endpoints require admin authentication and accept multipart/form-data.

### Upload Project Icon

**Endpoint:** `POST /api/projects/:id/upload-icon`

**Authentication:** Admin required

**Content-Type:** `multipart/form-data`

**Form Data:**
- `icon` - Image file (max 10MB)

**Response:** `200 OK`
```json
{
  "iconUrl": "string",
  "project": { ... }
}
```

**Errors:**
- `400` - No file provided or invalid file type
- `401` - Authentication required
- `403` - Admin privileges required
- `404` - Project not found

---

### Upload Project Hero Image

**Endpoint:** `POST /api/projects/:id/upload-hero`

**Authentication:** Admin required

**Content-Type:** `multipart/form-data`

**Form Data:**
- `hero` - Image file (max 10MB)

**Response:** `200 OK`
```json
{
  "heroImageUrl": "string",
  "project": { ... }
}
```

---

### Upload Project Screenshots

Upload multiple screenshots (max 10).

**Endpoint:** `POST /api/projects/:id/upload-screenshots`

**Authentication:** Admin required

**Content-Type:** `multipart/form-data`

**Form Data:**
- `screenshots` - Array of image files (max 10MB each)

**Response:** `200 OK`
```json
{
  "screenshotUrls": ["string"],
  "project": { ... }
}
```

---

### Delete Single Screenshot

**Endpoint:** `DELETE /api/projects/:id/screenshots/:screenshotIndex`

**Authentication:** Admin required

**URL Parameters:**
- `id` - Project UUID
- `screenshotIndex` - Index of screenshot to delete (0-based)

**Response:** `200 OK`
```json
{
  "project": { ... }
}
```

**Errors:**
- `400` - Invalid screenshot index

---

### Delete All Screenshots

**Endpoint:** `DELETE /api/projects/:id/screenshots`

**Authentication:** Admin required

**Response:** `200 OK`

---

### Reorder Screenshots

**Endpoint:** `PUT /api/projects/:id/reorder-screenshots`

**Authentication:** Admin required

**Request Body:**
```json
{
  "screenshotUrls": ["string"]
}
```

**Response:** `200 OK`

**Errors:**
- `400` - Invalid reorder (URLs must match existing screenshots)

---

### Get File

Retrieve uploaded files from object storage.

**Endpoint:** `GET /api/files/:filename`

**Authentication:** None

**URL Parameters:**
- `filename` - Name of the file

**Response:** `200 OK`
- Returns the file with appropriate content-type
- Cache-Control header set for 1 year

**Errors:**
- `404` - File not found

---

## Newsletter

### Newsletter Signup

Create account and subscribe to newsletter in one step.

**Endpoint:** `POST /api/newsletter/signup`

**Authentication:** None

**Request Body:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "firstName": "string",
  "lastName": "string",
  "preferences": {
    "frequency": "monthly",
    "topics": ["string"]
  }
}
```

**Response:** `201 Created`
```json
{
  "user": { ... },
  "newsletter": {
    "id": "uuid",
    "userId": "uuid",
    "isActive": true,
    "preferences": { ... }
  },
  "message": "Account created and newsletter subscription successful!"
}
```

---

### Subscribe to Newsletter

Subscribe existing user to newsletter.

**Endpoint:** `POST /api/newsletter/subscribe`

**Authentication:** Required

**Request Body:**
```json
{
  "preferences": {
    "frequency": "monthly",
    "topics": ["string"]
  }
}
```

**Response:** `201 Created`

**Errors:**
- `400` - Already subscribed

---

### Unsubscribe from Newsletter

**Endpoint:** `DELETE /api/newsletter/unsubscribe`

**Authentication:** Required

**Response:** `200 OK`
```json
{
  "message": "Successfully unsubscribed from newsletter"
}
```

---

### Get User's Subscription

**Endpoint:** `GET /api/newsletter/subscription`

**Authentication:** Required

**Response:** `200 OK`
```json
{
  "subscription": {
    "id": "uuid",
    "userId": "uuid",
    "isActive": boolean,
    "preferences": { ... }
  }
}
```

---

### Get All Subscriptions

**Endpoint:** `GET /api/newsletter/subscriptions`

**Authentication:** Admin required

**Response:** `200 OK`
```json
{
  "subscriptions": [ ... ]
}
```

---

## Contact Emails

### Save Contact Email

Save an email address from contact form.

**Endpoint:** `POST /api/contact-email`

**Authentication:** None

**Request Body:**
```json
{
  "email": "string",
  "source": "get_in_touch" // optional, default: "get_in_touch"
}
```

**Response:** `201 Created`
```json
{
  "contactEmail": {
    "id": "uuid",
    "email": "string",
    "source": "string",
    "submittedAt": "timestamp"
  },
  "message": "Email saved successfully!"
}
```

---

### Get All Contact Emails

**Endpoint:** `GET /api/contact-emails`

**Authentication:** Admin required

**Response:** `200 OK`
```json
{
  "contactEmails": [
    {
      "id": "uuid",
      "email": "string",
      "source": "string",
      "submittedAt": "timestamp"
    }
  ]
}
```

---

## Common Error Responses

### 400 Bad Request
```json
{
  "error": "Validation error",
  "details": [
    {
      "path": ["fieldName"],
      "message": "Validation message"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "message": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "message": "Admin privileges required"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Failed to perform operation"
}
```

---

## Rate Limiting

Currently no rate limiting is implemented. Consider adding rate limiting for production deployments.

## CORS

CORS is handled by Vite in development. Configure CORS appropriately for production.
