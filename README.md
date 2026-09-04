# PawCare

PawCare is a pet-care platform for finding veterinary clinics, managing pets, booking appointments, and leaving verified reviews. It includes local authentication, email verification, Google OAuth, provider clinic management, maps, directions, and appointment workflows.

## Features

- React frontend built with Vite
- Express and Node.js backend
- MongoDB database with Mongoose
- User signup, login, logout, protected profile and pet access
- Email verification and Google OAuth 2.0 authentication
- Provider-owned clinics with role-protected CRUD APIs
- GeoJSON clinic locations with a MongoDB `2dsphere` index
- Find Vets directory with Leaflet and OpenStreetMap markers
- Browser geolocation, nearby search, radius and specialty filters
- Clinic directions using Leaflet and OSRM
- Appointment booking, booking history, cancellation, and provider status management
- Verified reviews after completed appointments

## Requirements

- Node.js 18 or newer
- npm
- MongoDB locally or through MongoDB Atlas
- Google Cloud project if Google login is required
- SMTP email credentials if email verification is required

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
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
EMAIL_USER=your_smtp_email
EMAIL_PASSWORD=your_smtp_password_or_app_password

# Optional Cloudinary upload settings
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

Google OAuth uses `http://localhost:5173` as the authorized origin and `http://localhost:5000/api/auth/google/callback` as the authorized redirect URI.

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

## Available Scripts

### Backend

```bash
npm run dev
npm start
npm run seed:clinics
```

### Frontend

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

## Demo Clinic Seed

With `MONGO_URI` configured, seed four Hyderabad clinics and a demo provider:

```bash
cd backend
npm run seed:clinics
```

Demo provider credentials:

```text
Email: provider.demo@pawcare.com
Password: Provider123!
```

The seed is repeatable and updates matching provider-owned clinics instead of creating duplicates. Change or remove these credentials before deployment.

## Authentication and Roles

Authentication routes are mounted under `/api/auth`:

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET /api/auth/verify-email/:token`
- `GET /api/auth/google`
- `GET /api/auth/google/callback`

Supported roles are `user`, `provider`, and `admin`. Users manage pets and bookings. Providers manage their clinics and appointments. Public Find Vets and clinic detail pages do not require authentication.

## Clinics and Providers

Clinics are tenants owned by provider users. The backend always assigns the authenticated provider as `owner` during creation and scopes provider updates and deletes to that owner.

Provider frontend routes:

- `/provider/dashboard` - Create, edit, and delete owned clinics
- `/provider/appointments` - Review appointments for owned clinics and update status

Clinic API routes:

- `GET /api/clinics` - List public clinics
- `GET /api/clinics/:clinicId` - Get a public clinic
- `GET /api/clinics/nearby?longitude=<lng>&latitude=<lat>` - List clinics ordered by distance
- `GET /api/clinics/mine` - List the authenticated provider's clinics
- `POST /api/clinics` - Create a provider-owned clinic
- `PATCH /api/clinics/:clinicId` - Update an owned clinic
- `DELETE /api/clinics/:clinicId` - Delete an owned clinic

Nearby search accepts `maxDistance`, `limit`, and `specialty`; results include `distanceKm`.

Clinic locations use GeoJSON coordinates in `[longitude, latitude]` order:

```json
{
  "type": "Point",
  "coordinates": [78.4867, 17.4065]
}
```

The provider dashboard includes a map picker. Manual coordinates remain available under Advanced location.

The Find Vets page is `/find-vets`. It uses Leaflet with OpenStreetMap tiles, clinic markers, browser geolocation, nearby sorting, radius filters, and specialty filters. Clinic details provide Get directions using OSRM.

## Appointments

The booking flow is:

```text
Find Vets -> Clinic Details -> Book Appointment -> Select Pet -> Select Service
-> Select Date -> Select Time -> Confirm Booking
```

- `POST /api/appointments` - Create a pending appointment
- `GET /api/appointments` - List the logged-in user's bookings
- `GET /api/appointments/:appointmentId` - Get an owned booking
- `PATCH /api/appointments/:appointmentId/cancel` - Cancel a pending or confirmed booking
- `GET /api/appointments/provider` - List appointments for provider-owned clinics
- `PATCH /api/appointments/provider/:appointmentId/status` - Provider status update

Providers can update appointments to `pending`, `confirmed`, `completed`, or `cancelled`. Users see persisted status at `/appointments`.

## Verified Reviews

Users can leave one review per appointment only after the provider marks that appointment `completed`. Users can update or delete only their own reviews.

- `GET /api/reviews/clinic/:clinicId` - Public clinic reviews
- `GET /api/reviews/mine` - Logged-in user's reviews
- `POST /api/reviews` - Review a completed owned appointment
- `PATCH /api/reviews/:reviewId` - Update an owned review
- `DELETE /api/reviews/:reviewId` - Delete an owned review

Clinic rating and review totals are recalculated whenever a review is created, updated, or deleted.

## Profile and Pets

Profile and pet routes require authentication and are scoped to the logged-in user.

- `GET /api/profile`
- `PUT /api/profile`
- `GET /api/pets`
- `POST /api/pets`
- `GET /api/pets/:petId`
- `PATCH /api/pets/:petId`
- `DELETE /api/pets/:petId`

## Troubleshooting

- If the database connection fails, check MongoDB, `MONGO_URI`, and Atlas network access.
- If the frontend cannot reach the backend, confirm both servers, the Axios base URL, CORS, and credentials settings.
- If a port is in use, update the backend port, frontend API base URL, CORS origin, and OAuth configuration together.

## Security Notes

- Keep `backend/.env` out of Git.
- Never commit database passwords, JWT secrets, OAuth secrets, SMTP passwords, or Cloudinary credentials.
- Use HTTPS and secure cookie settings when deploying.
- Use separate development and production credentials.
