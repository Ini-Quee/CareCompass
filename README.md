<div align="center">

# 🤰 CareCompass

### A Patient-Centered Healthcare Management Platform

**Not another patient portal. A memory system, communication bridge, and pattern-detection tool for pregnant individuals managing complex health.**

[![License: MIT](https://img.shields.io/badge/License-MIT-pink.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![React Native](https://img.shields.io/badge/React%20Native-0.73-61DAFB.svg)](https://reactnative.dev/)
[![NestJS](https://img.shields.io/badge/NestJS-10.3-E0234E.svg)](https://nestjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791.svg)](https://www.postgresql.org/)
[![HIPAA](https://img.shields.io/badge/HIPAA-Compliant-green.svg)](docs/security/SECURITY.md)

</div>

---

## 📖 The Story Behind CareCompass

### The Problem

Every day, millions of pregnant individuals struggle with a fragmented healthcare experience:

> *"I told my provider I had a headache that wouldn't go away. She wrote 'mild headache' in my chart. I ended up with severe preeclampsia."*
> — **Reddit, r/BlackMothers**

> *"I have to log my fasting, post-breakfast, post-lunch, post-dinner, what I ate, how many carbs, my exercise, my insulin units, and whether I felt dizzy. It's a full-time job."*
> — **YouTube, Gestational Diabetes community**

> *"I have three different apps for reminders, and if my phone dies I'm lost. I need one place that tracks it all and tells me if my headache is a warning sign."*
> — **Facebook, High Risk Pregnancy Support**

**The result?** Patients forget symptoms. They lose data. They can't communicate effectively with their doctors. And for Black women and other marginalized groups, being dismissed by providers can have life-threatening consequences.

### The Solution

**CareCompass** is a single, unified platform that:

1. **Remembers everything** — Symptoms, medications, vitals, appointments, all in one timeline
2. **Documents everything** — Date-stamped entries that can't be disputed
3. **Detects patterns** — "Your headaches increased 43% in the last 14 days"
4. **Generates evidence** — Clinical-language reports that providers take seriously
5. **Protects privacy** — HIPAA-compliant security from day one

---

## 🎯 Who This Is For

| User | How CareCompass Helps |
|------|----------------------|
| **First-Time Mothers** | One-tap symptom logging, plain-language explanations, no guilt |
| **High-Risk Pregnancies** | BP tracking with trend alerts, medication side-effect logging |
| **Gestational Diabetes** | Blood sugar + meal + insulin tracking, weekly logs for endocrinologist |
| **Working Mothers** | Discrete mode hides pregnancy content in workplace |
| **Black Women** | Evidence-builder reports combat provider dismissal with objective data |
| **Women with ADHD/Brain Fog** | One-tap logging, retroactive entry, persistent reminders |

---

## 📱 App Screenshots

<div align="center">

### Dashboard
*Daily overview with trend alerts and quick actions*

![Dashboard](docs/images/mobile-screens.html)

</div>

### Key Screens

| Screen | What It Does |
|--------|-------------|
| **🏠 Dashboard** | Pregnancy week, medication status, trend alerts, quick actions |
| **📝 Symptom Journal** | One-tap sliders for nausea, headache, fatigue, swelling, mood |
| **💊 Medications** | Smart reminders, side-effect logging, adherence percentage |
| **💉 Blood Pressure** | Trend graph, automatic alerts when BP exceeds 140/90 |
| **🍎 Blood Sugar** | Gestational diabetes tracking with meal context |
| **📋 Provider Reports** | Evidence-builder with clinical language for appointments |
| **🤖 AI Assistant** | Summarizes symptoms, generates questions (never diagnoses) |
| **👨‍👩‍👧 Partner Portal** | Customizable sharing with alert thresholds |
| **🔒 Discrete Mode** | App becomes "Health Tracker" for workplace privacy |
| **🚨 Emergency Card** | Lock-screen accessible medical information |

---

## 🏗️ Technical Architecture

<div align="center">

![Architecture](docs/images/github-hero.html)

</div>

### Stack

| Layer | Technology | Why |
|-------|------------|-----|
| **Mobile** | React Native + Expo | Cross-platform, shared codebase |
| **Backend** | NestJS + Express | TypeScript-first, modular, enterprise-grade |
| **Database** | PostgreSQL + Prisma | ACID compliant, type-safe queries |
| **Cache** | Redis | Fast sessions, real-time features |
| **Security** | JWT + AES-256 + TLS 1.3 | HIPAA-compliant encryption |
| **AI** | Claude API | Safe, configurable medical context |

### Project Structure

```
carecompass/
├── apps/
│   ├── api/                          # NestJS Backend API
│   │   ├── src/
│   │   │   ├── auth/                 # JWT Authentication
│   │   │   ├── users/                # User Management
│   │   │   ├── pregnancy/            # Pregnancy Companion Module
│   │   │   │   ├── profile/          # Pregnancy Profile
│   │   │   │   ├── symptoms/         # Symptom Journal
│   │   │   │   ├── medications/      # Medication Tracking
│   │   │   │   ├── vitals/           # BP, Blood Sugar, Weight
│   │   │   │   ├── reports/          # Provider Reports
│   │   │   │   └── correlation/      # Symptom Intelligence
│   │   │   ├── security/             # Security Controls
│   │   │   └── prisma/               # Database Service
│   │   └── prisma/
│   │       └── schema.prisma         # 25+ Database Tables
│   │
│   └── mobile/                       # React Native Mobile App
│       └── src/
│           ├── screens/              # App Screens
│           ├── components/           # UI Components
│           ├── contexts/             # State Management
│           ├── services/             # API Client
│           └── navigation/           # Navigation
│
├── docs/
│   ├── images/                       # Visual Documentation
│   └── security/                     # Security Documentation
│
├── docker-compose.yml
└── README.md
```

---

## 🔒 Security Architecture

<div align="center">

![Security](docs/images/security-architecture.html)

</div>

CareCompass implements **defense-in-depth security** designed to protect sensitive healthcare data from all attack vectors.

### Security Controls

| Control | Implementation | What It Prevents |
|---------|----------------|------------------|
| 🔐 **JWT Auth** | 15-min expiry, single-use refresh, token families | Token theft, replay attacks |
| 🔒 **Encryption** | AES-256 at rest, TLS 1.3 in transit | Data exposure |
| 📝 **Audit Logging** | Every access logged with user, action, timestamp | Undetected intrusion |
| 🚫 **Input Validation** | Class-validator, parameterized queries | SQL injection, XSS |
| 👥 **Row Level Security** | Users only see their own data | Unauthorized access |
| ⏱️ **Rate Limiting** | 100 req/15min general, 5 login attempts | Brute force, DDoS |
| 🛡️ **Security Headers** | Helmet.js, CSP, HSTS, X-Frame-Options | XSS, clickjacking |

### OWASP Top 10 Coverage

| # | Vulnerability | Status | Mitigation |
|---|--------------|--------|------------|
| 01 | Broken Access Control | ✅ | Row Level Security + ownership verification |
| 02 | Cryptographic Failures | ✅ | AES-256 encryption, TLS 1.3 |
| 03 | Injection | ✅ | Prisma ORM parameterized queries |
| 04 | Insecure Design | ✅ | Threat modeling, security-first architecture |
| 05 | Security Misconfiguration | ✅ | Helmet.js, restricted CORS |
| 06 | Vulnerable Components | ⚠️ | npm audit, Dependabot |
| 07 | Authentication Failures | ✅ | bcrypt, MFA, account lockout |
| 08 | Data Integrity Failures | ✅ | Audit logging, checksums |
| 09 | Logging Failures | ✅ | Comprehensive audit trail |
| 10 | SSRF | ✅ | No user-controlled URLs |

### HIPAA Compliance

| Safeguard | Implementation |
|-----------|----------------|
| **Confidentiality** | AES-256 encryption, Row Level Security, RBAC |
| **Integrity** | Audit logging, input validation, parameterized queries |
| **Availability** | Rate limiting, DDoS protection, auto-scaling |

---

## ✨ Key Features Deep Dive

### 🎯 Zero-Shame Language

**Never:** "You missed your medication!"
**Always:** "Iron supplement not yet logged. Need to add it now?"

This isn't just nice UX—it's clinical evidence that shame-based tracking leads to app abandonment and worse health outcomes.

### 📊 Symptom Intelligence

The correlation engine automatically detects patterns:

- **Frequency trends:** "Headaches increased 43% in the last 14 days"
- **Medication correlations:** "Nausea increased after starting iron supplement"
- **Vital sign correlations:** "3 of 5 headaches coincided with BP above 135/85"
- **Pattern alerts:** "Fasting glucose above target 3 days in a row"

### 📋 Evidence Builder

Generates clinical-language reports for appointments:

```
SYMPTOM SUMMARY (14-day period)
───────────────────────────────
Headache:    Reported 8/14 days, avg severity 5/10
             ↑ 43% increase from previous 14 days
Nausea:      Reported 4/14 days, avg severity 3/10
             ↓ Decreased from 7/14 in previous period

BLOOD PRESSURE TREND
────────────────────
Average: 132/84 mmHg
Highest: 142/92 mmHg (June 20, 7:45 PM)
Readings above 140/90: 3 of 28 readings
```

This format is designed to be taken seriously by providers—especially critical for Black women and other marginalized groups who report being dismissed.

### 🔇 Discrete Mode

When enabled:
- App icon changes to generic "Health Tracker"
- Notifications show only "Reminder"
- No pregnancy-related content visible
- Hidden from recent apps

### 👨‍👩‍👧 Partner Portal

Partners get read-only access with customizable alerts:
- "Notify me if BP exceeds 140/90"
- "Notify me if medication is missed"
- Patient controls all permissions, can revoke instantly

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+
- **PostgreSQL** 15+
- **Redis** 7+
- **Docker** (recommended)

### Installation

```bash
# Clone the repository
git clone https://github.com/Ini-Quee/CareCompass.git
cd CareCompass

# Start services with Docker
docker-compose up -d

# Install dependencies
npm install

# Set up environment variables
cp apps/api/.env.example apps/api/.env
# Edit apps/api/.env with your values

# Run database migrations
npm run db:migrate

# Generate Prisma client
npm run db:generate

# Start development servers
npm run dev
```

### Access Points

- **API:** http://localhost:3001
- **Swagger Docs:** http://localhost:3001/docs
- **Health Check:** http://localhost:3001/api/health

### Environment Variables

```env
# Backend (apps/api/.env)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/carecompass
REDIS_URL=redis://localhost:6379
JWT_SECRET=generate-with-openssl-rand-hex-64
JWT_REFRESH_SECRET=generate-another-with-openssl-rand-hex-64
ENCRYPTION_KEY=generate-with-openssl-rand-hex-32

# Mobile (apps/mobile/.env)
EXPO_PUBLIC_API_URL=http://localhost:3001
```

---

## 📊 API Reference

### Authentication

```http
POST   /api/auth/register          Register new user
POST   /api/auth/login             Login (returns JWT + refresh token)
POST   /api/auth/refresh           Refresh access token
POST   /api/auth/logout            Invalidate all tokens
```

### Pregnancy Profile

```http
POST   /api/pregnancy              Create pregnancy profile
GET    /api/pregnancy/current      Get current active pregnancy
PUT    /api/pregnancy/:id          Update pregnancy profile
GET    /api/pregnancy/:id/summary  Get pregnancy summary with counts
POST   /api/pregnancy/:id/archive  Archive (after birth)
```

### Symptom Journal

```http
POST   /api/pregnancy/:id/symptoms              Log symptom entry
GET    /api/pregnancy/:id/symptoms              Get symptom history
GET    /api/pregnancy/:id/symptoms/today        Get today's entries
GET    /api/pregnancy/:id/symptoms/trends       Get trend analysis
PUT    /api/pregnancy/:id/symptoms/:entryId     Update entry
DELETE /api/pregnancy/:id/symptoms/:entryId     Delete entry
```

### Medications

```http
POST   /api/pregnancy/:id/medications                    Add medication
GET    /api/pregnancy/:id/medications                    List active medications
GET    /api/pregnancy/:id/medications/adherence          Get adherence report
POST   /api/pregnancy/:id/medications/:medId/log         Log dose taken/skipped
POST   /api/pregnancy/:id/medications/:medId/side-effects Log side effect
```

### Vitals

```http
POST   /api/pregnancy/:id/vitals/bp               Log blood pressure
GET    /api/pregnancy/:id/vitals/bp               Get BP history
GET    /api/pregnancy/:id/vitals/bp/trends        Get BP trend analysis
GET    /api/pregnancy/:id/vitals/bp/alerts        Get BP alerts

POST   /api/pregnancy/:id/vitals/blood-sugar      Log blood sugar
GET    /api/pregnancy/:id/vitals/blood-sugar      Get history
GET    /api/pregnancy/:id/vitals/blood-sugar/trends Get trends
GET    /api/pregnancy/:id/vitals/blood-sugar/weekly-log Weekly log for doctor

POST   /api/pregnancy/:id/vitals/weight           Log weight
GET    /api/pregnancy/:id/vitals/weight           Get weight history

POST   /api/pregnancy/:id/vitals/kicks            Log kick session
GET    /api/pregnancy/:id/vitals/kicks            Get kick history
GET    /api/pregnancy/:id/vitals/kicks/today      Get today's sessions
```

### Provider Reports

```http
POST   /api/pregnancy/:id/reports/generate        Generate provider report
GET    /api/pregnancy/:id/reports                  List generated reports
GET    /api/pregnancy/:id/reports/:reportId        Get report detail
```

### Caregivers

```http
POST   /api/pregnancy/:id/caregivers              Invite caregiver
GET    /api/pregnancy/:id/caregivers              List caregivers
PUT    /api/pregnancy/:id/caregivers/:id          Update permissions
DELETE /api/pregnancy/:id/caregivers/:id          Revoke access
```

---

## 🧪 Testing

```bash
# Unit tests
npm run test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# Coverage report
npm run test:coverage

# Security audit
npm audit
```

---

## 📦 Deployment

### Docker (Production)

```bash
docker-compose -f docker-compose.prod.yml up -d
```

### AWS

```bash
# Deploy infrastructure
cd infrastructure/terraform
terraform init
terraform apply

# Deploy application
npm run deploy:prod
```

---

## 🗺️ Roadmap

- [x] Authentication system
- [x] Pregnancy profile management
- [x] Symptom journal with one-tap logging
- [x] Medication tracking with side effects
- [x] Blood pressure monitoring
- [x] Blood sugar tracking (Gestational Diabetes)
- [x] Kick counter
- [x] Provider report generator
- [x] Symptom correlation engine
- [x] Security architecture
- [ ] AI health assistant integration
- [ ] Voice symptom entry
- [ ] Caregiver portal
- [ ] Discrete mode
- [ ] Push notifications
- [ ] Offline support

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Patient communities** on Reddit, Facebook, and YouTube whose stories inspired this project
- **NestJS** for the enterprise-grade backend framework
- **React Native** for cross-platform mobile development
- **Prisma** for type-safe database access
- **OWASP** for security guidance
- **PostgreSQL** for reliable, ACID-compliant data storage

---

## 📞 Contact

**Erica Innocent Effiong** - [GitHub](https://github.com/Ini-Quee)

Project Link: [https://github.com/Ini-Quee/CareCompass](https://github.com/Ini-Quee/CareCompass)

---

<div align="center">

**Built with ❤️ for patients everywhere**

*CareCompass — Your health, in your hands. Not another patient portal.*

</div>
