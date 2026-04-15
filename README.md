# DocConnect

Doctor-Patient Appointment & Consultation Platform with voice search, real-time chat, and AI symptom checker.

## Features

- **Patient Registration & Login** with Email OTP verification
- **Doctor Registration** with specialization profiles
- **Voice Search** — speak in Hindi or English to find doctors (local Whisper AI)
- **AI Symptom Checker** — describe illness in conversation, get doctor recommendations (18 specializations, bilingual Hindi+English)
- **Appointment Booking** with time slot management and double-booking prevention
- **Reschedule & Cancel** appointments
- **Real-time Consultation Chat** between patient and doctor (Socket.io)
- **Doctor Dashboard** with stats, today's schedule
- **Patient Dashboard** with upcoming appointments, recent consultations
- **Mobile Responsive** with bottom navigation
- **PWA** — installable on phone/desktop

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite 8, Tailwind CSS v4, React Router 7 |
| Backend | Node.js, Express 5, Mongoose ODM |
| Database | MongoDB |
| Real-time | Socket.io |
| Voice | Python OpenAI Whisper (local, Hindi + English) |
| Email | Resend API |
| Auth | JWT (access + refresh tokens), bcrypt, OTP |
| PWA | Service Worker, Web Manifest |

## Requirements

### System

| Tool | Version | Install (macOS) |
|------|---------|----------------|
| Node.js | >= 18 | `brew install node` |
| npm | >= 9 | comes with Node.js |
| MongoDB | >= 6 | `brew tap mongodb/brew && brew install mongodb-community && brew services start mongodb-community` |
| Python | >= 3.10 | `brew install python3` |
| ffmpeg | any | `brew install ffmpeg` |
| ngrok (optional) | any | `brew install ngrok/ngrok/ngrok` |

### Python Packages

```
openai-whisper
flask
flask-cors
```

Install:
```bash
pip3 install openai-whisper flask flask-cors
```

### API Keys (free)

| Service | Purpose | Get it |
|---------|---------|--------|
| Resend | Email OTP | https://resend.com/signup (free 100 emails/day) |
| Twilio (optional) | SMS OTP | https://twilio.com (free trial) |

## Setup

```bash
# Clone
git clone git@github.com:rohitraj1609/Doctor-Connect.git
cd Doctor-Connect

# Check all dependencies and install npm packages
npm run setup

# Configure environment
cp .env.example server/.env
# Edit server/.env with your MongoDB URI, JWT secrets, API keys
```

### Environment Variables (server/.env)

```env
PORT=5000
NODE_ENV=development

# MongoDB
MONGO_URI=mongodb://localhost:27017/docconnect

# JWT (use any random string, min 32 chars)
JWT_ACCESS_SECRET=your-random-access-secret-key-here-min32
JWT_REFRESH_SECRET=your-random-refresh-secret-key-here-min32
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Email OTP (get from https://resend.com)
RESEND_API_KEY=re_your_api_key_here

# SMS OTP - optional (get from https://twilio.com)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

CLIENT_URL=http://localhost:5173
```

## Run

### Local Development

```bash
npm run dev
```

Opens 3 services:
- React client: http://localhost:5173
- Express API: http://localhost:5000
- Voice API: http://localhost:5001

### Share via ngrok

```bash
npm run share
```

Builds client, starts server, opens public URL.

## Scripts

| Command | What it does |
|---------|-------------|
| `npm run dev` | Start all 3 services for local development |
| `npm run share` | Build + serve + ngrok for sharing |
| `npm run setup` | Check dependencies + install npm packages |
| `npm run server` | API server only |
| `npm run client` | React dev server only |
| `npm run voice` | Whisper voice API only |

## Project Structure

```
Doctor-Connect/
├── client/                    # React frontend
│   ├── src/
│   │   ├── pages/             # 17 pages
│   │   ├── components/        # Reusable UI components
│   │   ├── context/           # Auth, Socket providers
│   │   ├── hooks/             # useVoiceSearch
│   │   ├── services/          # API client
│   │   └── utils/             # Symptom analyzer, constants
│   └── public/                # PWA manifest, icons, service worker
├── server/                    # Express backend
│   └── src/
│       ├── controllers/       # Business logic
│       ├── models/            # 8 Mongoose schemas
│       ├── routes/            # 7 route groups
│       ├── services/          # Email, SMS, OTP, slot booking
│       ├── socket/            # Real-time chat handlers
│       ├── middleware/        # Auth, validation, error
│       └── config/            # DB, env, socket setup
├── voice-server/              # Python Whisper API
│   └── voice_api.py
├── setup.sh                   # Dependency checker
└── package.json               # Root scripts
```

## API Endpoints

### Auth — `/api/v1/auth`
| Method | Path | Description |
|--------|------|-------------|
| POST | `/register/patient` | Register patient |
| POST | `/register/doctor` | Register doctor |
| POST | `/login` | Login, returns JWT |
| POST | `/logout` | Invalidate session |
| POST | `/refresh-token` | Rotate tokens |
| POST | `/send-otp` | Send OTP (email/phone) |
| POST | `/verify-otp` | Verify 6-digit code |

### Doctors — `/api/v1/doctors`
| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | List/filter doctors |
| GET | `/:id` | Doctor profile |
| GET | `/me` | Own profile |
| PUT | `/me` | Update profile |
| GET | `/me/stats` | Dashboard stats |

### Search — `/api/v1/search`
| Method | Path | Description |
|--------|------|-------------|
| GET | `/doctors?q=&specialization=` | Search doctors |

### Slots — `/api/v1/slots`
| Method | Path | Description |
|--------|------|-------------|
| POST | `/bulk` | Create time slots |
| GET | `/my-slots` | Doctor's slots |
| GET | `/doctor/:id/available` | Available slots |
| DELETE | `/:id` | Remove slot |

### Appointments — `/api/v1/appointments`
| Method | Path | Description |
|--------|------|-------------|
| POST | `/` | Book appointment |
| GET | `/my` | List appointments |
| PATCH | `/:id/reschedule` | Reschedule |
| PATCH | `/:id/cancel` | Cancel |
| PATCH | `/:id/complete` | Mark complete |

### Consultations — `/api/v1/consultations`
| Method | Path | Description |
|--------|------|-------------|
| POST | `/start` | Start chat session |
| GET | `/my` | List consultations |
| GET | `/:id/messages` | Chat messages |
| PATCH | `/:id/end` | End with prescription |

## Specializations Covered (18)

General Physician, Cardiologist, Dermatologist, Neurologist, Orthopedic, Pediatrician, Psychiatrist, Gynecologist, ENT Specialist, Ophthalmologist, Dentist, Urologist, Pulmonologist, Gastroenterologist, Oncologist, Endocrinologist, Nephrologist

## Symptom Checker

The AI symptom checker understands both English and Hindi/Hinglish:

| You say | Doctor recommended |
|---------|-------------------|
| "My stomach is hurting" | Gastroenterologist |
| "pet dard ho raha hai" | Gastroenterologist |
| "I have chest pain" | Cardiologist |
| "sir mein dard hai" | Neurologist |
| "peshab mein jalan" | Urologist |
| "bachche ko bukhar" | Pediatrician |
| "neend nahi aa rahi" | Psychiatrist |

Supports conversational follow-ups — remembers previous diagnosis when you describe location, duration, or severity.

## Troubleshooting

**MongoDB not running**
```bash
brew services start mongodb-community
```

**Port already in use**
```bash
lsof -ti:5000 | xargs kill -9
lsof -ti:5173 | xargs kill -9
lsof -ti:5001 | xargs kill -9
```

**Voice server crash**
```bash
pip3 install openai-whisper flask flask-cors
brew install ffmpeg
```

**Email OTP not delivering**
- Resend free tier sends only to account owner email
- Verify a domain at resend.com/domains for sending to any email
- OTP code always printed in server terminal as fallback

**Create test account (skip OTP)**
```bash
curl -s -X POST http://localhost:5000/api/v1/auth/register/patient \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Test","lastName":"User","email":"test@test.com","phone":"+910000000000","password":"test123"}'

mongosh "mongodb://localhost:27017/docconnect" \
  --eval 'db.users.updateOne({email:"test@test.com"},{$set:{isEmailVerified:true,isPhoneVerified:true}})'
```

## License

MIT
