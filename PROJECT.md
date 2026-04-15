# DocConnect - Doctor-Patient Appointment & Consultation Platform

## Quick Start

```bash
cd /Users/user/Desktop/docconnect

# First time setup
npm run setup

# Local development
npm run dev

# Share via ngrok
npm run share
```

## Architecture

```
docconnect/
├── server/          # Express 5 API (port 5000)
├── client/          # React 19 + Vite + Tailwind (port 5173)
├── voice-server/    # Python Whisper voice API (port 5001)
├── setup.sh         # Dependency checker
├── ngrok.yml        # Multi-tunnel config
└── package.json     # Root scripts: dev, share, setup
```

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 19, Vite 8, Tailwind CSS v4, React Router 7, Socket.io-client |
| Backend | Node.js, Express 5, Mongoose, JWT, Socket.io, Nodemailer |
| Database | MongoDB (local localhost:27017, DB name: `docconnect`) |
| Voice | Python OpenAI Whisper `small` model (local, supports Hindi+English) |
| Email OTP | Resend (API key in server/.env) |
| SMS OTP | Twilio (expired, falls back to console log) |
| PWA | manifest.json + service worker |

## Database

- **MongoDB local**: `mongodb://localhost:27017/docconnect`
- **Atlas (backup)**: Connection string commented in `server/.env`
- 16 seeded doctors across 12 specializations

### Collections
- `users` — Discriminator pattern: base User + Patient/Doctor fields
- `otps` — TTL indexed, auto-deletes after 10 min
- `timeslots` — Individual bookable slots, unique index `{doctorId, date, startTime}`
- `appointments` — Booking with status lifecycle
- `consultations` — Chat session metadata
- `messages` — Chat messages, indexed by consultationId

## API Endpoints (server/src/routes/)

### Auth `/api/v1/auth`
- `POST /register/patient` — Register patient
- `POST /register/doctor` — Register doctor
- `POST /login` — JWT login (access + refresh token)
- `POST /logout` — Invalidate refresh token
- `POST /refresh-token` — Rotate tokens (httpOnly cookie)
- `POST /send-otp` — Send OTP to email/phone (rate limited: 3/min)
- `POST /verify-otp` — Verify 6-digit code
- `POST /forgot-password` / `POST /reset-password`

### Doctors `/api/v1/doctors`
- `GET /` — List doctors (paginated, filterable by specialization/city)
- `GET /:doctorId` — Public profile
- `GET /me` / `PUT /me` — Own profile (doctor auth)
- `GET /me/stats` — Dashboard stats

### Search `/api/v1/search`
- `GET /doctors?q=&specialization=&city=` — Regex search

### Slots `/api/v1/slots`
- `POST /bulk` — Doctor creates slots from time range
- `GET /my-slots?from=&to=` — Doctor's own slots
- `GET /doctor/:doctorId/available?date=` — Available slots for booking
- `DELETE /:slotId` — Remove available slot
- `PATCH /:slotId/block` — Block a slot

### Appointments `/api/v1/appointments`
- `POST /` — Book (atomic findOneAndUpdate prevents double-booking)
- `GET /my` — List own appointments (with status filter)
- `GET /:appointmentId` — Get details
- `PATCH /:id/reschedule` — Atomic: book-new-then-release-old
- `PATCH /:id/cancel` — Cancel + release slot
- `PATCH /:id/complete` / `PATCH /:id/no-show` — Doctor actions

### Consultations `/api/v1/consultations`
- `POST /start` — Doctor starts chat (creates consultation)
- `GET /my` — List all consultations
- `GET /:id` — Get details
- `GET /:id/messages` — Paginated messages
- `PATCH /:id/end` — End with diagnosis/prescription/summary

### Patients `/api/v1/patients`
- `GET /me` / `PUT /me` — Profile

## Socket.io Events (server/src/socket/)

- **Auth**: JWT on handshake (`socket.handshake.auth.token`)
- `join-consultation` / `leave-consultation` — Room management
- `send-message` — Persists to DB then broadcasts
- `typing-start` / `typing-stop` — Typing indicators
- `new-message` / `user-joined` / `user-left` / `consultation-ended` — Server broadcasts

## Frontend Pages (client/src/pages/)

| Page | Route | Role |
|------|-------|------|
| Landing | `/` | Public |
| Login | `/login` | Public |
| RegisterPatient | `/register/patient` | Public |
| RegisterDoctor | `/register/doctor` | Public |
| VerifyOtp | `/verify` | Public |
| SymptomChecker | `/symptom-checker` | Patient |
| PatientDashboard | `/patient/dashboard` | Patient |
| DoctorDashboard | `/doctor/dashboard` | Doctor |
| DoctorSearch | `/doctors` | Auth |
| DoctorProfile | `/doctors/:id` | Auth |
| BookAppointment | `/book/:doctorId` | Patient |
| MyAppointments | `/appointments` | Auth |
| RescheduleAppointment | `/appointments/:id/reschedule` | Patient |
| ManageSlots | `/doctor/slots` | Doctor |
| ConsultationChat | `/consultation/:id` | Auth |
| ConsultationHistory | `/consultations` | Auth |
| NotFound | `*` | Public |

## Key Features

### Voice Search (client/src/hooks/useVoiceSearch.js)
- Records audio via MediaRecorder API in browser
- Sends to Python Whisper server at localhost:5001
- Whisper `small` model translates Hindi→English
- Used in DoctorSearch and SymptomChecker pages

### Symptom Checker (client/src/utils/symptomAnalyzer.js)
- 18 specializations, 400+ keywords
- Bilingual: English + Hindi/Hinglish
- Conversational: remembers previous diagnosis for follow-ups
- Understands location (right/left), duration (kal/aaj), severity (tez/halka)
- Shows matching doctors from DB

### Atomic Booking (server/src/services/slot.service.js)
- `findOneAndUpdate({status:"available"})` prevents double-booking
- Reschedule: book-new THEN release-old (prevents race condition)
- Cancel: releases slot back to available

### Auth (server/src/controllers/auth.controller.js)
- JWT access (15min) + refresh (7d) tokens
- Refresh token stored hashed in DB, rotated on each use
- httpOnly cookie for refresh token
- OTP: 6-digit, bcrypt hashed, TTL 10min, max 5 attempts

## Environment Variables (server/.env)

```
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/docconnect
JWT_ACCESS_SECRET=<secret>
JWT_REFRESH_SECRET=<secret>
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
RESEND_API_KEY=<your-resend-api-key>
TWILIO_ACCOUNT_SID=<your-twilio-sid>
TWILIO_AUTH_TOKEN=<your-twilio-token>
TWILIO_PHONE_NUMBER=<your-twilio-number>
CLIENT_URL=http://localhost:5173
```

## Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Patient | demo@test.com | demo123 |
| Doctor | demodoc@test.com | demo123 |
| Patient | patient@test.com | test123 |
| Any seeded doctor | sneha@doc.com | test123 |

## Seeded Doctors (16 total)

| Name | Specialization | Hospital | Fee |
|------|---------------|----------|-----|
| Sneha Reddy | Pediatrician | Rainbow Children | 500 |
| Rajesh Kumar | Cardiologist | Apollo Hospital | 800 |
| Vikram Singh | Neurologist | AIIMS | 1000 |
| Meera Iyer | Psychiatrist | Nimhans | 900 |
| Priya Sharma | Dermatologist | Fortis Hospital | 600 |
| Amit Patel | Orthopedic | Max Hospital | 700 |
| Karthik Nair | ENT Specialist | Medanta Hospital | 550 |
| Ananya Gupta | General Physician | City Clinic | 300 |
| Sunita Verma | Urologist | Manipal Hospital | 700 |
| Deepa Menon | Gynecologist | Cloudnine Hospital | 600 |
| Arjun Kapoor | Oncologist | Tata Memorial | 1200 |
| Pooja Agarwal | Endocrinologist | Max Hospital | 800 |
| Rohit Joshi | Nephrologist | Fortis Hospital | 900 |
| Nisha Rajput | Gynecologist | Apollo Cradle | 500 |
| Sanjay Mishra | Urologist | AIIMS | 850 |
| Kavita Desai | Endocrinologist | Medanta Hospital | 650 |

## npm Scripts

| Script | Command | What it does |
|--------|---------|-------------|
| `npm run dev` | concurrently server+client+voice | Local development (3 services) |
| `npm run share` | build client + start server + ngrok | Share via public URL |
| `npm run setup` | bash setup.sh | Check dependencies + install npm packages |
| `npm run server` | cd server && nodemon | API server only |
| `npm run client` | cd client && vite | React dev server only |
| `npm run voice` | cd voice-server && python3 voice_api.py | Whisper voice API only |

## Troubleshooting

### MongoDB not running
```bash
brew services start mongodb-community
# or
mongod --dbpath /data/db
```

### Port already in use
```bash
lsof -ti:5000 | xargs kill -9   # API
lsof -ti:5173 | xargs kill -9   # Client
lsof -ti:5001 | xargs kill -9   # Voice
```

### Voice server crash
```bash
pip3 install openai-whisper flask flask-cors
brew install ffmpeg
```

### Email OTP not delivering
- Resend free tier only sends to account owner: nihabilal1402@gmail.com
- For other emails: verify a domain at resend.com/domains
- OTP code always printed in server terminal as fallback

### Twilio SMS not working
- Twilio trial number expired
- OTP code printed in server terminal as fallback

### Create test account (skip OTP)
```bash
# Register + auto-verify
curl -s -X POST http://localhost:5000/api/v1/auth/register/patient \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Test","lastName":"User","email":"test@test.com","phone":"+910000000000","password":"test123"}'

mongosh --quiet "mongodb://localhost:27017/docconnect" \
  --eval 'db.users.updateOne({email:"test@test.com"},{$set:{isEmailVerified:true,isPhoneVerified:true}})'
```

### Rebuild client for ngrok sharing
```bash
cd client && npx vite build && cd ..
```

## File Structure Reference

### Server key files
- `server/src/app.js` — Express middleware + routes + static serving
- `server/src/server.js` — HTTP + Socket.io bootstrap
- `server/src/services/slot.service.js` — Atomic booking logic
- `server/src/controllers/auth.controller.js` — JWT + OTP flow
- `server/src/socket/handlers/consultation.handler.js` — Chat events
- `server/src/models/` — All 8 Mongoose schemas

### Client key files
- `client/src/App.jsx` — All routes
- `client/src/hooks/useVoiceSearch.js` — Voice recording + Whisper API
- `client/src/utils/symptomAnalyzer.js` — 18-specialization bilingual analyzer
- `client/src/context/AuthContext.jsx` — JWT state management
- `client/src/context/SocketContext.jsx` — Socket.io connection
- `client/src/pages/SymptomChecker.jsx` — Conversational health assistant
- `client/src/pages/ConsultationChat.jsx` — Real-time doctor-patient chat
