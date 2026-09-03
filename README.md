# PawCare

PawCare is a pet-care platform that brings everyday pet health and care services into one place. The website is designed to help pet parents find nearby veterinary clinics, explore care categories, manage pet-related information, and use an AI symptom-checker workflow. It also includes account registration, email verification, password login, Google OAuth login, and session-aware navigation.

## Features

- React frontend built with Vite
- Express and Node.js backend
- MongoDB database with Mongoose
- User signup, login, logout, and protected profile access
- Email verification for local accounts
- Google OAuth 2.0 authentication
- Responsive pet-care homepage with clinic and service sections
- Axios API client with credential-based cookies
- Tailwind CSS with centralized theme variables

## Project Structure

```text
petServiceHub/
├── backend/     Express API, authentication, database, and server configuration
├── frontend/    React/Vite user interface
└── README.md
```

## Requirements

Install these before starting:

- Node.js 18 or newer
- npm
- MongoDB, either locally or through MongoDB Atlas
- A Google Cloud project if Google login is required
- SMTP email credentials if email verification is required

## Installation

Install dependencies separately in both applications.

### Backend

```bash
cd backend
npm install
```

### Frontend

Open a second terminal from the project root:

```bash
cd frontend
npm install
```

## Environment Configuration

Create a file named `.env` inside `backend/`. Do not commit this file or share its secret values.

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/pawcare
JWT_SECRET=replace_with_a_long_random_secret

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

EMAIL_USER=your_smtp_email
EMAIL_PASSWORD=your_smtp_password_or_app_password

# Optional, only needed for Cloudinary uploads
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### MongoDB

For a local MongoDB server, use a connection string such as:

```env
MONGO_URI=mongodb://127.0.0.1:27017/pawcare
```

For MongoDB Atlas:

1. Create a cluster and database user.
2. Add your development IP address to the Atlas network access list.
3. Copy the driver connection string.
4. Replace the username, password, and database name.
5. Put the finished connection string in `MONGO_URI`.

Example:

```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/pawcare
```

### JWT Secret

`JWT_SECRET` is used to sign authentication tokens. Use a long, random value in development and production. Never use a real secret in source control.

### Google OAuth

Google login is configured for local development with these callback URLs:

- Authorized JavaScript origin: `http://localhost:5173`
- Authorized redirect URI: `http://localhost:5000/api/auth/google/callback`

To configure it:

1. Open the Google Cloud Console.
2. Create or select a project.
3. Enable the Google Identity or OAuth-related APIs if prompted.
4. Configure the OAuth consent screen.
5. Create an OAuth 2.0 Client ID for a Web application.
6. Add the origins and redirect URI listed above.
7. Copy the generated client ID and client secret into `backend/.env`.

The frontend starts Google login at:

```text
http://localhost:5000/api/auth/google
```

The backend callback redirects back to the frontend after authentication. If you change either development port, update the CORS setting in `backend/src/server.js` and the Google OAuth URLs in `backend/src/config/passport.js`.

### Email Verification

The backend sends verification emails using Nodemailer. Configure `EMAIL_USER` and `EMAIL_PASSWORD` with credentials for your SMTP provider. If your provider supports two-factor authentication, use an app password instead of your normal account password.

## Running in Development

Start the backend and frontend in separate terminals.

### Terminal 1: Backend

```bash
cd backend
npm run dev
```

The API runs at:

```text
http://localhost:5000
```

Health check:

```text
http://localhost:5000/api/health
```

### Terminal 2: Frontend

```bash
cd frontend
npm run dev
```

The frontend runs at:

```text
http://localhost:5173
```

Open the frontend URL in your browser. The frontend API client is configured to call the backend at `http://localhost:5000` and sends cookies with requests.

## Available Scripts

### Backend

```bash
npm run dev     # Start the API with Nodemon
npm start       # Start the API normally
```

### Frontend

```bash
npm run dev     # Start the Vite development server
npm run build   # Create a production build
npm run lint    # Run ESLint
npm run preview # Preview the production build locally
```

## Authentication Routes

The backend authentication API is mounted under `/api/auth`:

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET /api/auth/verify-email/:token`
- `GET /api/auth/google`
- `GET /api/auth/google/callback`

## Profile and Pet Routes

These resources require the JWT cookie created during login, or an
`Authorization: Bearer <token>` header. Profile and pet queries are scoped to
the logged-in user; clients cannot assign or change `userId` or `owner`.

### Profile

- `GET /api/profile` - Get the logged-in user's profile
- `PUT /api/profile` - Create or update the logged-in user's profile

The profile document uses `userId` as a unique owner reference.

### Pets

- `GET /api/pets` - List only the logged-in user's pets
- `POST /api/pets` - Add a pet for the logged-in user
- `GET /api/pets/:petId` - Get one of the logged-in user's pets
- `PATCH /api/pets/:petId` - Edit one of the logged-in user's pets
- `DELETE /api/pets/:petId` - Delete one of the logged-in user's pets

Each pet has an `owner` reference. The schema is ready for future medical
information and vaccination data, but vaccination and reminder workflows are
not implemented yet.

### Roles

Users support these roles:

- `user` - Default role for pet owners
- `provider` - Reserved for care providers
- `admin` - Reserved for administrators

Roles are restricted by the User schema, and `authorizeRoles` can be applied to
future role-specific routes.

## Troubleshooting

### Database connection fails

Check that MongoDB is running, the `MONGO_URI` is correct, and Atlas allows your current IP address.

### Google login fails

Confirm that the client ID and secret are correct and that the redirect URI exactly matches:

```text
http://localhost:5000/api/auth/google/callback
```

Also make sure both servers are running on ports `5000` and `5173`.

### Frontend cannot reach the backend

Confirm that the backend is running and that the frontend Axios base URL is `http://localhost:5000`. Check that backend CORS allows `http://localhost:5173` and credentials are enabled.

### Port already in use

Stop the process using the port, or change the backend `PORT` and update the frontend API base URL, CORS origin, and Google OAuth configuration to match.

## Security Notes

- Keep `backend/.env` out of Git.
- Never commit database passwords, JWT secrets, OAuth secrets, SMTP passwords, or Cloudinary credentials.
- Use HTTPS and secure cookie settings when deploying.
- Use separate development and production credentials.
