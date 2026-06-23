# 🤰 CareCompass

### A Patient-Centered Healthcare Management Platform

**Not another patient portal. A memory system, communication bridge, and pattern-detection tool for pregnant individuals managing complex health.**

[![License: MIT](https://img.shields.io/badge/License-MIT-pink.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![React Native](https://img.shields.io/badge/React%20Native-0.73-61DAFB.svg)](https://reactnative.dev/)
[![NestJS](https://img.shields.io/badge/NestJS-10.3-E0234E.svg)](https://nestjs.com/)

---

## 📖 Overview

CareCompass helps pregnant individuals **remember everything, document everything, and communicate better** with their healthcare providers.

### The Problem

> *"I told my provider I had a headache that wouldn't go away. She wrote 'mild headache' in my chart. I ended up with severe preeclampsia."*

> *"I have to log my fasting, post-breakfast, post-lunch, post-dinner, what I ate, how many carbs, my exercise, my insulin units, and whether I felt dizzy. It's a full-time job."*

**CareCompass fixes this.** One app. Everything documented. Evidence-builder reports for appointments.

---

## ✨ Key Features

### 🎯 Zero-Shame Language
Never uses "missed," "failed," or "non-compliant." Status indicators are neutral, never judgmental.

### 📊 Symptom Intelligence
Automatic trend detection: "Headaches increased 43% in 14 days." Correlation with BP and medications.

### 📋 Evidence Builder
Clinical-language reports for appointments. Combats provider dismissal with date-stamped, objective data.

### 🔇 Discrete Mode
App becomes "Health Tracker" with neutral icon. Workplace privacy protection.

### 👨‍👩‍👧 Partner Portal
Customizable sharing with partners/family. Alert thresholds for BP, missed meds.

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Mobile** | React Native, Expo, TypeScript |
| **Backend** | NestJS, Express, TypeScript |
| **Database** | PostgreSQL with Prisma ORM |
| **Cache** | Redis |

---

## 📱 Screens

- **Dashboard** — Daily overview with trend alerts
- **Symptom Journal** — One-tap logging for nausea, headache, fatigue, swelling, mood
- **Medication Tracking** — Smart reminders, side-effect logging
- **Blood Pressure** — Trend detection, alerts when BP exceeds thresholds
- **Provider Reports** — Evidence-builder with clinical language
- **AI Health Assistant** — Summarizes symptoms, generates questions

---

## 🚀 Quick Start

```bash
# Clone
git clone https://github.com/Ini-Quee/CareCompass.git
cd CareCompass

# Start services
docker-compose up -d

# Install dependencies
npm install

# Set up environment
cp apps/api/.env.example apps/api/.env
# Edit .env with your values

# Run migrations
npm run db:migrate

# Start development
npm run dev
```

---

## 📄 License

MIT License - see [LICENSE](LICENSE)

---

## 🙏 Acknowledgments

- Built with [NestJS](https://nestjs.com/) and [React Native](https://reactnative.dev/)
- Database by [PostgreSQL](https://www.postgresql.org/)
- ORM by [Prisma](https://www.prisma.io/)

---

**Built with ❤️ for patients everywhere**
