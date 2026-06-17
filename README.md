# XenoReach AI — Enterprise AI-Native CRM for Retail Brands

> **Forward Deployed Engineer Interview Project** | Enterprise-grade, full-stack AI CRM built with React 19, Node.js, MongoDB Atlas, and the Google Gemini API.

![XenoReach AI](https://img.shields.io/badge/XenoReach-AI--Native%20CRM-7c3aed?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0id2hpdGUiIGQ9Ik0xMyAxMFY3bC01IDVoMXY2bDUtNWgtMXoiLz48L3N2Zz4=)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb)
![Gemini](https://img.shields.io/badge/Google-Gemini%20AI-4285F4?style=flat-square&logo=google)

---

## 🏗️ Architecture Overview

XenoReach AI is architected as a highly scalable **3-service microservices application**:

```text
┌─────────────────────────────────────────────────────────────┐
│                    XenoReach AI System                       │
├─────────────────┬─────────────────────┬─────────────────────┤
│  Frontend       │   CRM Backend       │  Channel Service     │
│  React + Vite   │   Node.js/Express   │  Node.js/Express     │
│  :5173          │   :5000             │  :5001               │
│                 │                     │                       │
│  • 22 Pages     │   • JWT Auth        │  • Delivery sim      │
│  • Recharts     │   • 14 API modules  │  • Event gen         │
│  • React Query  │   • Gemini AI       │  • Async callbacks   │
│  • Radix UI     │   • 9 Mongo Models  │                       │
└─────────────────┴─────────────────────┴─────────────────────┘
```

### Microservice Event Flow

```text
Frontend → POST /api/campaigns/:id/launch → CRM Backend
CRM Backend → POST /deliver → Channel Service
Channel Service → POST /api/analytics/callback → CRM Backend (async webhook)
CRM Backend ↔ Gemini API (segment generation, insights, campaign generation, copilot)
```

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js 18+ 
- MongoDB Atlas account (free tier works)
- Google Gemini API key (optional — demo mode falls back to curated responses without it)

### 1. Clone & Install Dependencies

```bash
# Install dependencies across all microservices
cd backend && npm install
cd ../channel-service && npm install
cd ../frontend && npm install
```

### 2. Configure Environment Variables

```bash
# CRM Backend
cp backend/.env.example backend/.env
# Edit .env to add MONGODB_URI and GEMINI_API_KEY

# Channel Service  
cp channel-service/.env.example channel-service/.env
```

### 3. Run All Services

Open **3 separate terminals** and execute:

```bash
# Terminal 1 — CRM Backend (Port 5000)
cd backend && npm run dev

# Terminal 2 — Channel Service (Port 5001)
cd channel-service && npm run dev

# Terminal 3 — Frontend (Port 5173)
cd frontend && npm run dev
```

### 4. Access the Application

Visit **http://localhost:5173**

**Demo credentials (auto-seeded on first run):**
- **Email:** `demo@xenoreach.ai`
- **Password:** `demo123`

*Note: The backend automatically runs a seed script on startup if the database is empty, generating 200 realistic customers, 500+ orders, campaigns, and pre-built AI segments.*

---

## ✨ Core Features

### 🏢 Enterprise Suite (New!)
- **Workflow Builder:** Visual tool to create automated marketing workflows triggered by system events (e.g., `customer_created`, `order_placed`).
- **Audit Center:** System-wide logging of all events for strict compliance and security monitoring.
- **Data Quality Dashboard:** Dedicated tools for tracking database integrity, deduplication, and data hygiene.
- **Implementation & Deployment Tracker:** AI-driven tools to assist Forward Deployed Engineers and Customer Success teams in onboarding clients and ensuring deployment readiness.
- **Executive Insights:** High-level ROI metrics and cross-campaign reporting geared towards leadership.

### 🤖 Google Gemini AI Integration
Powered by `gemini-1.5-flash`, XenoReach features four deep AI integrations:
1. **AI Segment Builder:** Translates natural language queries (e.g., *"High value customers inactive for 90 days"*) directly into complex MongoDB filters.
2. **AI Campaign Generator:** Translates high-level business goals into full campaign blueprints (channel selection, subject line, personalized message).
3. **AI Customer Insights:** Analyzes 360° customer profiles to predict churn risk and recommend next-best actions.
4. **AI Copilot Chat:** A multi-turn conversational interface that parses intent and surfaces actionable UI buttons (e.g., "Create Segment") directly within the chat.

### 👥 Customer Data Platform (CDP)
- **Customer 360° Profiles:** Unified view of orders, lifecycle stage, AI insights, and preferred channels.
- **CSV Bulk Import:** Drag-and-drop file ingestion using `react-dropzone` and `csv-parse`, featuring automatic email-based upserts.
- **Simulated Integrations:** Mock connectors for Shopify, WooCommerce, Mailchimp, WhatsApp Business, ERPs, and POS systems.

### 📊 Analytics & Delivery Engine
- **Dashboard:** Real-time KPI tracking via Recharts (Area, Bar, Pie, Radar, and custom Funnel charts).
- **Channel Service:** A dedicated Node.js microservice that simulates realistic delivery funnels for Email, SMS, WhatsApp, and Push notifications, sending asynchronous webhooks back to the CRM.

---

## 🗄️ Database Schema Overview

The application utilizes **MongoDB** with Mongoose. Key collections include:

```text
users          — email, passwordHash (bcrypt), name, role
customers      — name, email, phone, city, totalSpend, lastOrderDate, aiInsights, dataQualityScore
orders         — customerId, orderNumber, totalAmount, status, items
segments       — name, filters (AI generated), naturalLanguageQuery, customerCount
campaigns      — name, channel, message, segmentId, stats (sent/delivered/opened/clicked/converted)
communications — campaignId, customerId, status, timestamps (async delivery tracking)
workflows      — trigger, actions, executionCount, isActive
auditLogs      — action, category, userId, status, ipAddress
```

---

## 📦 Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 19, TypeScript, Vite 8 |
| **Styling & UI** | Tailwind CSS v4, Custom CSS, Radix UI Primitives |
| **State & Data** | TanStack React Query v5 |
| **Animation & Charts** | Framer Motion, Recharts |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB Atlas, Mongoose 8 |
| **Auth & Security** | JWT, bcryptjs, Helmet, Express Rate Limit |
| **AI Integration** | Google Gemini 1.5 Flash SDK |

---

## 📝 License & Contact

This project was built for interview demonstration purposes. All seeded data is purely synthetic.

*Built with ❤️ by XenoReach AI — Powered by Google Gemini*
