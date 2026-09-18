# PawCare

PawCare is a multi-tenant pet-care platform for finding veterinary clinics, managing pets, booking appointments, tracking vaccination reminders, joining a pet-parent community, and leaving verified reviews.

## Academic Project

PawCare is a University of Sindh IT Final Year Project for Batch 2K23.

Project members:

- MariamSawera
- Syeda Summaiya

The project is currently approximately half complete. Planned work includes:

- Further UI and user-experience improvements
- Backend support for the Contact page
- AI symptom checker
- Optional tenant membership support for users belonging to multiple tenants
- Production deployment

## Features

- React frontend built with Vite and Tailwind CSS
- Express, Node.js, and MongoDB backend
- Local authentication with email verification and Google OAuth 2.0
- Tenant-aware data isolation and tenant switching
- Provider clinic management, maps, geolocation, nearby search, filters, and directions
- Pet profiles, vaccination history, and due-date notifications
- Appointment booking, cancellation, provider status updates, and verified reviews
- Community posts and comments with protected interactions
- In-app notifications and API/authentication rate limiting
- About, Contact, Services, and Community public pages

## Requirements

- Node.js 18 or newer
- npm
- MongoDB locally or through MongoDB Atlas
- Google Cloud credentials for Google login
- SMTP credentials for email verification
- Cloudinary credentials only if image uploads are enabled

## Installation

```bash
cd backend
npm install
```

In a second terminal:

```bash
cd frontend
npm install
```

## Environment Configuration

Create `backend/.env` and do not commit it:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/pawcare
JWT_SECRET=replace_with_a_long_random_secret

# Tenant configuration
DEFAULT_TENANT_SLUG=default
# Optional production subdomain support, for example clinic-a.example.com
TENANT_BASE_DOMAIN=example.com

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# SMTP email verification
EMAIL_USER=your_smtp_email
EMAIL_PASSWORD=your_smtp_password_or_app_password

# Optional Cloudinary uploads
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

Optional `frontend/.env`:

```env
VITE_TENANT_SLUG=default
```

The frontend stores the active tenant in local storage and sends it on every API request as `x-tenant-slug`. The logged-in Navbar includes a workspace switcher. The backend verifies that the authenticated user belongs to the selected tenant.

Google OAuth uses:

```text
Authorized origin: http://localhost:5173
Redirect URI: http://localhost:5000/api/auth/google/callback
```

## Running in Development

Backend:

```bash
cd backend
npm run dev
```

Frontend:

```bash
cd frontend
npm run dev
```

The API runs at `http://localhost:5000` and the frontend at `http://localhost:5173`.

Health check: `http://localhost:5000/api/health`

On startup, the backend creates the default tenant and migrates legacy records without a `tenantId` into it. Complete this migration before deploying multiple production tenants.

## Scripts

Backend:

```bash
npm run dev
npm start
npm run seed:clinics
```

Frontend:

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

## Authentication and Roles

```text
POST /api/auth/signup
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
GET  /api/auth/verify-email/:token
GET  /api/auth/google
GET  /api/auth/google/callback
```

Supported roles are `user`, `provider`, and `admin`. Users manage pets and bookings. Providers manage their clinics and appointments. Admins can provision tenants through `POST /api/tenants`.

## Tenant Architecture

Tenant ownership is stored on users, clinics, pets, appointments, profiles, reviews, notifications, community posts, and comments.

Tenant resolution uses:

1. `x-tenant-slug` request header
2. Subdomain when `TENANT_BASE_DOMAIN` is configured
3. `DEFAULT_TENANT_SLUG` fallback

Every tenant-owned controller query includes `tenantId`. Cross-tenant clinic, pet, appointment, review, notification, post, and comment access is rejected or returns not found.

Create a tenant as an authenticated admin:

```text
POST /api/tenants
```

```json
{
  "name": "Clinic Group A",
  "slug": "clinic-group-a"
}
```

The current model assigns one tenant to each user through `User.tenantId`. A future `TenantMembership` model can support users belonging to multiple tenants with different roles per tenant.

## Clinics and Providers

```text
GET    /api/clinics
GET    /api/clinics/:clinicId
GET    /api/clinics/nearby?longitude=<lng>&latitude=<lat>
GET    /api/clinics/mine
POST   /api/clinics
PATCH  /api/clinics/:clinicId
DELETE /api/clinics/:clinicId
```

Provider frontend routes are `/provider/dashboard` and `/provider/appointments`.

Clinic locations use GeoJSON coordinates in `[longitude, latitude]` order and a MongoDB `2dsphere` index. Nearby search accepts `maxDistance`, `limit`, and `specialty`.

## Appointments and Reviews

```text
POST  /api/appointments
GET   /api/appointments
GET   /api/appointments/:appointmentId
PATCH /api/appointments/:appointmentId/cancel
GET   /api/appointments/provider
PATCH /api/appointments/provider/:appointmentId/status
```

Appointment statuses are `pending`, `confirmed`, `completed`, and `cancelled`. Status changes create tenant-scoped notifications. Completing an appointment also creates a review prompt.

```text
GET    /api/reviews/clinic/:clinicId
GET    /api/reviews/mine
POST   /api/reviews
PATCH  /api/reviews/:reviewId
DELETE /api/reviews/:reviewId
```

Reviews are allowed only for completed appointments, one review per appointment. Clinic ratings are recalculated after review changes.

## Pets, Reminders, and Notifications

```text
GET    /api/pets
POST   /api/pets
GET    /api/pets/:petId
PATCH  /api/pets/:petId
DELETE /api/pets/:petId
GET    /api/pets/:petId/vaccinations
POST   /api/pets/:petId/vaccinations
PATCH  /api/pets/:petId/vaccinations/:vaccinationId
DELETE /api/pets/:petId/vaccinations/:vaccinationId
GET    /api/reminders
```

Notifications:

```text
GET   /api/notifications
PATCH /api/notifications/:notificationId/read
PATCH /api/notifications/read-all
```

The startup job and daily interval create vaccination notifications for due dates within 30 days. Tenant-aware unique keys prevent duplicate reminders.

## Community

Anyone can read posts and comments. Authentication is required to create, update, delete, or respond.

```text
GET    /api/community/posts
POST   /api/community/posts
GET    /api/community/posts/:postId
PATCH  /api/community/posts/:postId
DELETE /api/community/posts/:postId
GET    /api/community/posts/:postId/comments
POST   /api/community/posts/:postId/comments
DELETE /api/community/comments/:commentId
```

The frontend page is `/community`. Guests can browse and are prompted to sign up when they try to interact.

## Frontend Pages

```text
/                  Home
/about             About PawCare
/contact           Contact page
/services          Service directory
/community         Pet-parent community
/find-vets         Clinic search and map
/find-vets/:id     Clinic details and directions
/login             Login
/signup            Signup
/profile           Protected profile
/pets              Protected pet management
/appointments      Protected appointment history
```

## Rate Limiting

The API has a general limit of 300 requests per 15 minutes. Login and signup have a stricter limit of 10 failed attempts per 15 minutes. Rate-limit responses use HTTP `429` and JSON messages.

## Demo Clinic Seed

With `MONGO_URI` configured:

```bash
cd backend
npm run seed:clinics
```

This creates or updates four Hyderabad clinics and a demo provider in the default tenant.

```text
Email: provider.demo@pawcare.com
Password: Provider123!
```

Change or remove these credentials before deployment.

## Troubleshooting

- Database errors: check MongoDB, `MONGO_URI`, and Atlas network access.
- Frontend API errors: confirm both servers, Axios base URL, CORS, cookies, and `VITE_TENANT_SLUG`.
- Tenant errors: confirm the tenant exists and the logged-in user belongs to it.
- Google login errors: verify the OAuth origin and callback URI exactly.
- Port conflicts: update backend port, frontend API base URL, CORS origin, and OAuth settings together.
- Build disk errors: Vite may need additional free disk space when copying `frontend/public` assets.

## Security Notes

- Keep `backend/.env` and `frontend/.env` out of Git.
- Never commit database passwords, JWT secrets, OAuth secrets, SMTP passwords, or Cloudinary credentials.
- Use HTTPS and secure cookies in production.
- Use separate development and production credentials.
- Keep tenant filtering on every tenant-owned read, write, update, delete, and aggregate query.
- Do not rely on hidden frontend links for authorization; enforce roles and tenant membership in the backend.
