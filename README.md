# Sweety – Blood Glucose Tracker

A full-stack blood glucose tracking application built with React, Node.js, Express, Prisma ORM, and PostgreSQL.

Users can securely manage their glucose readings, organize measurements by daily time slots, and view reports for different date ranges.

## Features

### Authentication
- User registration and login.
- Password hashing using bcrypt.
- JWT-based authentication.
- User-specific reading access.

### Glucose Reading Management
- Create, view, update, and delete glucose readings.
- Four daily reading slots:
  - Morning (fasting)
  - After breakfast
  - After lunch
  - After dinner
- Glucose values must be whole numbers between 40 and 600 mg/dL.
- Only one reading per slot per day.
- Maximum of four readings per day.
- Future dates are not allowed.
- Optional notes for each reading.

### Reports
- **Daily Report:** Readings for a selected date.
- **Month-to-Date Report:** First day of the selected month through the selected date.
- **Monthly Report:** All readings from the previous calendar month.
- Highest, lowest, average, and total reading count.
- Average rounded to one decimal place.
- Friendly empty states when no readings are available.

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite |
| Styling | CSS |
| Charts | Recharts |
| Icons | Lucide React |
| Backend | Node.js, Express |
| Database | PostgreSQL |
| ORM | Prisma |
| Authentication | JWT, bcrypt |
| API requests | Axios |

## Project Structure

```text
Sweety-Blood-Glucose-Tracker/
├── client/
│   ├── src/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── components/
│   │   └── context/
│   ├── .env.example
│   └── package.json
│
├── server/
│   ├── prisma/
│   │   ├── migrations/
│   │   ├── schema.prisma
│   │   └── seed.js
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   └── services/
│   ├── .env.example
│   └── package.json
│
└── README.md
```

## Prerequisites

Install the following before starting:

- Node.js
- npm
- PostgreSQL
- Git

## Installation

### 1. Clone the repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd Sweety-Blood-Glucose-Tracker
```

### 2. Configure PostgreSQL

Create a PostgreSQL database:

```sql
CREATE DATABASE sweety_glucose_tracker;
```

### 3. Configure the backend

```bash
cd server
npm install
```

Create a `.env` file using `.env.example` as a reference.

Configure your database connection and JWT secret.

Example:

```env
PORT=5000
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/sweety_glucose_tracker"
JWT_SECRET=your_secure_secret
CLIENT_URL=http://localhost:5173
APP_TIME_ZONE=Asia/Kolkata
```

### 4. Run database migrations

```bash
npx prisma migrate deploy
npx prisma generate
```

### 5. Seed demo data

```bash
npm run db:seed
```

### 6. Start the backend

```bash
npm run dev
```

The backend runs at:

```text
http://localhost:5000
```

### 7. Configure and start the frontend

Open another terminal:

```bash
cd client
npm install
```

Create a `.env` file using `client/.env.example`.

```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm run dev
```

Open:

```text
http://localhost:5173
```

## Demo Account

The seed script creates a demo account.

| Field | Value |
|---|---|
| Email | demo@sweety.com |
| Password | SweetyDemo@123 |

Use this account for local testing.

## API Overview

All API routes are prefixed with `/api`.

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/auth/register` | Register a user |
| POST | `/auth/login` | Login |
| GET | `/readings` | Get user's readings |
| POST | `/readings` | Create a reading |
| PUT | `/readings/:id` | Update a reading |
| DELETE | `/readings/:id` | Delete a reading |
| GET | `/reports/daily?date=YYYY-MM-DD` | Daily report |
| GET | `/reports/month-to-date?date=YYYY-MM-DD` | Month-to-date report |
| GET | `/reports/monthly?date=YYYY-MM-DD` | Previous-month report |
| GET | `/health` | Database health check |

Protected endpoints require a valid JWT bearer token.

## Testing Checklist

Verify the following before submission:

- Register a new account and log in.
- Confirm that passwords are hashed in the database.
- Add, edit, and delete glucose readings.
- Reject decimal glucose values.
- Reject values below 40 or above 600.
- Reject future dates.
- Reject duplicate readings for the same user, date, and slot.
- Verify that one user cannot access another user's readings.
- Verify daily, month-to-date, and previous-month reports.
- Verify highest, lowest, average, and total count calculations.
- Verify empty report messages.

## Environment Variables

Never commit real `.env` files or database credentials.

Use the supplied `.env.example` files to document the required environment variables.

## Assumptions and Improvements

- All glucose readings are stored in mg/dL.
- Each user can record at most one measurement in each of the four defined daily slots.
- The application stores measurement dates separately from reading slots.
- The application is intended for personal tracking and reporting, not medical diagnosis.
- Future improvements could include graphical trends, pagination, downloadable reports, and healthcare professional access.

## License

This project was developed as part of a technical assessment.
