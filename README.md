# StudyNook — Server (REST API)

🔗 **Live API:** [https://study-nook-server-zb5u.vercel.app/api/health](https://study-nook-server-zb5u.vercel.app/api/health)

## About

This is the backend REST API for StudyNook — a library study room booking platform. Built with Node.js, Express, and MongoDB Atlas.

## API Endpoints

### Auth Routes — `/api/auth`
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/register` | Register with email & password | ❌ |
| POST | `/login` | Login with email & password | ❌ |
| POST | `/google` | Login/Register with Google OAuth | ❌ |
| POST | `/logout` | Logout and clear cookie | ❌ |
| GET | `/me` | Get current logged-in user | ✅ |

### Room Routes — `/api/rooms`
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get all rooms (with search & filter) | ❌ |
| GET | `/:id` | Get single room details | ❌ |
| GET | `/my-rooms` | Get rooms added by logged-in user | ✅ |
| POST | `/` | Add a new room | ✅ |
| PUT | `/:id` | Update a room (owner only) | ✅ |
| DELETE | `/:id` | Delete a room (owner only) | ✅ |

### Booking Routes — `/api/bookings`
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/` | Create a new booking | ✅ |
| GET | `/my-bookings` | Get all bookings of logged-in user | ✅ |
| PATCH | `/:id/cancel` | Cancel a booking | ✅ |

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB Atlas + Mongoose
- **Auth:** JWT (stored in HTTPOnly cookies)
- **Password Hashing:** bcryptjs
- **Deployment:** Vercel (serverless)

## Local Setup

```bash
git clone <your-server-repo-url>
cd studynook-server
npm install
cp .env.example .env
# Fill in your values in .env
npm run dev
```

## Environment Variables

Create a `.env` file in the root:

```
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key
CLIENT_URL=http://localhost:5173
PORT=5000
NODE_ENV=development
```

## Database Models

### User
| Field | Type | Description |
|-------|------|-------------|
| name | String | User's full name |
| email | String | Unique email address |
| password | String | Hashed (bcryptjs) — empty for Google users |
| photoURL | String | Profile photo URL |
| provider | String | `email` or `google` |

### Room
| Field | Type | Description |
|-------|------|-------------|
| name | String | Room name |
| description | String | Room description |
| image | String | Room image URL |
| floor | String | Floor location |
| capacity | Number | Max people |
| hourlyRate | Number | Price per hour |
| amenities | Array | List of amenities |
| owner | ObjectId | Reference to User |

### Booking
| Field | Type | Description |
|-------|------|-------------|
| room | ObjectId | Reference to Room |
| user | ObjectId | Reference to User |
| date | String | Booking date |
| startTime | String | Start time |
| endTime | String | End time |
| totalCost | Number | Calculated total |
| status | String | `confirmed` or `cancelled` |

## Deployment (Vercel)

1. Push this repo to GitHub
2. Import on [Vercel](https://vercel.com)
3. Set these Environment Variables in Vercel dashboard:

| Variable | Value |
|----------|-------|
| `MONGODB_URI` | Your MongoDB Atlas URI |
| `JWT_SECRET` | A long random secret string |
| `CLIENT_URL` | Your Vercel client URL (no trailing slash) |
| `NODE_ENV` | `production` |

4. MongoDB Atlas → Network Access → Add `0.0.0.0/0` to allow Vercel IPs
