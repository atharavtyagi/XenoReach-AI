# XenoReach AI — AI-Native CRM for Retail Brands

> **Forward Deployed Engineer Interview Project** | Full-stack, production-quality AI CRM built with React 18, Node.js, MongoDB Atlas, and Google Gemini API.

![XenoReach AI](https://img.shields.io/badge/XenoReach-AI--Native%20CRM-7c3aed?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0id2hpdGUiIGQ9Ik0xMyAxMFY3bC01IDVoMXY2bDUtNWgtMXoiLz48L3N2Zz4=)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb)
![Gemini](https://img.shields.io/badge/Google-Gemini%20AI-4285F4?style=flat-square&logo=google)

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    XenoReach AI System                       │
├─────────────────┬─────────────────────┬─────────────────────┤
│  Frontend       │   CRM Backend       │  Channel Service     │
│  React + Vite   │   Node.js/Express   │  Node.js/Express     │
│  :5173          │   :5000             │  :5001               │
│                 │                     │                       │
│  • 8 Pages      │   • JWT Auth        │  • Delivery sim      │
│  • Recharts     │   • 8 API modules   │  • Event gen         │
│  • Framer Motion│   • Gemini AI       │  • Async callbacks   │
│  • React Query  │   • MongoDB         │                       │
└─────────────────┴─────────────────────┴─────────────────────┘
```

### Microservice Communication

```
Frontend → POST /api/campaigns/:id/launch → CRM Backend
CRM Backend → POST /deliver → Channel Service
Channel Service → POST /api/analytics/callback → CRM Backend (async)
CRM Backend → Gemini API (segment gen, campaign gen, insights, copilot)
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB Atlas account (free tier works)
- Google Gemini API key (optional — demo mode works without it)

### 1. Clone & Install

```bash
# Install all dependencies
cd backend && npm install
cd ../channel-service && npm install
cd ../frontend && npm install
```

### 2. Configure Environment

```bash
# Backend
cp backend/.env.example backend/.env
# Edit: add MONGODB_URI and GEMINI_API_KEY

# Channel Service  
cp channel-service/.env.example channel-service/.env
```

### 3. Run All Services

Open **3 terminals** and run:

```bash
# Terminal 1 — CRM Backend (port 5000)
cd backend && npm run dev

# Terminal 2 — Channel Service (port 5001)
cd channel-service && npm run dev

# Terminal 3 — Frontend (port 5173)
cd frontend && npm run dev
```

### 4. Open & Login

Visit **http://localhost:5173**

Demo credentials (auto-seeded):
- **Email:** `demo@xenoreach.ai`
- **Password:** `demo123`

The seed script auto-runs on first start and creates:
- 1 demo user
- 200 realistic Indian retail customers
- 500+ orders across cities (Mumbai, Delhi, Bangalore, Hyderabad, Chennai, Pune)
- 8 pre-built customer segments
- 10 sample campaigns across all channels

---

## ✨ Features

### 🔐 Authentication
- JWT-based stateless auth (7-day tokens)
- bcrypt password hashing (12 rounds)
- Auto-redirect on 401

### 👥 Customer Hub
- Paginated table with search (15 per page)
- CSV drag-and-drop import (auto-upsert by email)
- Customer 360° profile with order history
- AI-generated insights + churn risk scoring
- Data quality score calculation

### 🎯 AI Segment Builder
- Natural language → MongoDB query via Gemini
- Live preview (customer count, estimated revenue, avg spend)
- Save and reuse segments across campaigns
- Revenue estimation per segment

### 📧 AI Campaign Generator
- Goal description → full campaign blueprint
- AI generates: name, channel, subject, personalized message, tips
- 5 channel types: Email, SMS, WhatsApp, Push, Multi-Channel
- One-click launch to Channel Service

### 🤖 AI Copilot Chat
- Multi-turn conversation with Google Gemini
- Starter prompts for quick actions
- Action buttons: Create Segment, Create Campaign, View Analytics
- Markdown rendering with syntax highlighting

### 📊 Analytics Dashboard
- 8 KPI cards with trend indicators
- Customer acquisition area chart
- Revenue by city bar chart
- Spend distribution pie chart
- Campaign funnel visualization
- Radar chart for channel performance scores

### 🔌 Integration Hub
- 8 simulated integrations (Shopify, WooCommerce, POS, ERP, Mailchimp, WhatsApp, Razorpay, Google Analytics)
- Connect/disconnect/sync simulation
- Records synced counter

### 🏛️ Architecture Page
- Full system architecture documentation
- 6 decision cards with tradeoffs
- Tech stack reference

---

## 📡 API Reference

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Get JWT token |
| GET | `/api/auth/me` | Get current user |

### Customers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/customers?page=1&limit=15&search=` | List customers |
| GET | `/api/customers/stats` | Aggregate stats |
| GET | `/api/customers/:id` | Customer 360 profile |
| POST | `/api/customers` | Create customer |
| PUT | `/api/customers/:id` | Update customer |
| DELETE | `/api/customers/:id` | Delete customer |
| POST | `/api/customers/upload-csv` | CSV bulk import |
| POST | `/api/customers/:id/insights` | Generate AI insights |

### Segments
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/segments` | List all segments |
| POST | `/api/segments` | Create segment |
| POST | `/api/segments/ai-generate` | AI segment from NL query |
| DELETE | `/api/segments/:id` | Delete segment |

### Campaigns
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/campaigns` | List all campaigns |
| POST | `/api/campaigns` | Create campaign |
| GET | `/api/campaigns/:id/analytics` | Campaign analytics |
| POST | `/api/campaigns/:id/launch` | Launch campaign |
| POST | `/api/campaigns/ai-generate` | AI campaign from goal |

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics/overview` | Dashboard KPIs |
| GET | `/api/analytics/campaigns` | Campaign performance list |
| POST | `/api/analytics/callback` | **[Public]** Channel service callback |

### Copilot
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/copilot/chat` | Send message to Gemini |
| DELETE | `/api/copilot/session/:id` | Clear session |

### Integrations
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/integrations` | List integrations |
| POST | `/api/integrations/:id/connect` | Connect integration |
| POST | `/api/integrations/:id/disconnect` | Disconnect |
| POST | `/api/integrations/:id/sync` | Sync records |

### Channel Service
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/deliver` | Launch campaign delivery |
| GET | `/health` | Health check |

---

## 🗄️ Database Schema

```
users          — email, password, name, company, role
customers      — name, email, phone, city, state, tags, totalSpend, orderCount, 
                 lastOrderDate, preferredChannel, aiInsights, dataQualityScore
orders         — customerId, orderNumber, totalAmount, status, channel, items
segments       — name, description, filters, customerCount, estimatedRevenue,
                 naturalLanguageQuery, isAiGenerated
campaigns      — name, channel, message, subject, goal, segmentId, audienceSize,
                 status, stats (sent/delivered/opened/clicked/converted/revenue),
                 isAiGenerated, aiMetadata
communications — campaignId, customerId, channel, status, timestamps, revenue
analyticsEvents — type, campaignId, customerId, metadata, timestamp
```

---

## 🤖 Gemini AI Integration

Four AI features powered by `gemini-1.5-flash`:

### 1. Segment Generation
```
Input: "Show customers who spent > ₹5000 and haven't ordered in 90 days"
Output: { filters: { totalSpend: { $gte: 5000 }, lastOrderDate: { $lte: 90daysAgo } } }
```

### 2. Campaign Generation
```
Input: Goal text + optional segment
Output: { name, channel, subject, message, audienceRecommendation, expectedOutcome, tips }
```

### 3. Customer Insights
```
Input: Customer profile data
Output: Behavioral analysis, churn risk, engagement opportunities, next action
```

### 4. Copilot Chat
```
Multi-turn conversation with CRM context
Returns: { response (markdown), actions: [{ type, label }] }
```

**Demo Mode:** If `GEMINI_API_KEY` is not set, all AI features return realistic curated responses. The app is fully functional for demos without any API key.

---

## 🎨 Design System

- **Theme:** Dark mode, glassmorphism, purple gradient branding
- **Font:** Inter (Google Fonts)
- **Colors:** Violet (#7c3aed) → Fuchsia (#c026d3) primary gradient
- **Components:** Custom CSS classes (`.glass`, `.btn-gradient`, `.metric-card`, `.shimmer`)
- **Animations:** Framer Motion for page transitions, stagger effects
- **Charts:** Recharts (Area, Bar, Pie, Radar, custom Funnel)

---

## 📦 Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + TypeScript + Vite 5 |
| Styling | Tailwind CSS v4 + Custom CSS |
| Animation | Framer Motion |
| Charts | Recharts |
| State | TanStack React Query v5 |
| Routing | React Router v6 |
| Backend | Node.js + Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcryptjs |
| AI | Google Gemini 1.5 Flash |
| Upload | Multer + csv-parse |
| Dev | Nodemon + Vite HMR |

---

## 🏃 Development

```bash
# Frontend linting + type check
cd frontend && npx tsc --noEmit

# Frontend production build
cd frontend && npm run build

# Backend — reset + re-seed database
cd backend && node src/scripts/seed.js

# Test API endpoints
curl http://localhost:5000/api/auth/login \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@xenoreach.ai","password":"demo123"}'
```

---

## 🌐 Deployment Notes

### Production Checklist
- [ ] Set `NODE_ENV=production` in backend
- [ ] Configure MongoDB Atlas Network Access (whitelist deploy IP)
- [ ] Set strong `JWT_SECRET` (32+ random chars)
- [ ] Enable CORS for your production frontend URL
- [ ] Use PM2 or Railway/Render for backend hosting
- [ ] Deploy frontend to Vercel/Netlify (static build)
- [ ] Update `VITE_API_URL` to production backend URL
- [ ] Remove demo seeding logic or protect with env flag

### Recommended Hosting
- **Frontend:** Vercel (zero-config Vite support)
- **Backend:** Railway or Render (Node.js, free tier)
- **Channel Service:** Railway (second service, free tier)
- **Database:** MongoDB Atlas (M0 free cluster)

---

## 📝 License

Built for interview demonstration purposes. All data is synthetic.

---

*Built with ❤️ by XenoReach AI — Powered by Google Gemini*
