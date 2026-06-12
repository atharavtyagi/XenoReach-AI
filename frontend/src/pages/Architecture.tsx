import { motion } from 'framer-motion'
import { Code2, Database, Zap, Shield, Server, GitBranch, ArrowRight, CheckCircle } from 'lucide-react'

const SECTIONS = [
  {
    icon: GitBranch,
    title: 'Microservice Architecture',
    color: '#7c3aed',
    content: `XenoReach AI is split into two independent services for clear separation of concerns and independent scaling:

**CRM Service (port 5000)** handles all business logic: authentication, customer management, segment generation, campaign management, and analytics aggregation. It's the system of record.

**Channel Service (port 5001)** is a stateless delivery simulator. It receives campaign payloads, simulates realistic delivery events (delivered/opened/clicked/converted) with channel-appropriate timing and rates, then fires async callbacks back to the CRM.

This separation means:
- Channel Service can be replaced with real SMS/Email providers without touching CRM logic
- Each service can scale independently
- Failures in Channel Service don't bring down the CRM`,
    tradeoffs: [
      'Two processes to manage vs. simpler monolith',
      'Network calls between services add latency',
      'But: production-ready for real channel provider swap-in',
    ],
  },
  {
    icon: Database,
    title: 'MongoDB Design Decisions',
    color: '#059669',
    content: `**Why MongoDB over PostgreSQL?**
- Customer data is semi-structured (tags, AI insights, variable attributes)
- Segment filters are dynamic JSON — fits document model perfectly
- Horizontal scaling via sharding suits high-volume retail data
- Flexible schema allows rapid feature iteration without migrations

**Index Strategy:**
- customers: email (unique), totalSpend (desc), lastOrderDate (desc), city
- orders: customerId, createdAt (desc)
- communications: campaignId, customerId
- analyticsEvents: campaignId, timestamp (desc)

**Aggregation Pipelines** power analytics — MongoDB's $group/$bucket/$match pipeline is used for:
- Customer spend distribution bucketing
- City-wise revenue rollups  
- Monthly customer growth trends
- Campaign performance aggregation`,
    tradeoffs: [
      'No ACID transactions across collections (MongoDB 4+ has multi-doc transactions)',
      'Denormalized: segmentName stored in campaigns for query performance',
      'Analytics events collection grows large — production needs TTL index or time-series collection',
    ],
  },
  {
    icon: Zap,
    title: 'Gemini AI Integration',
    color: '#c026d3',
    content: `**Three AI capabilities powered by Gemini 1.5 Flash:**

1. **Segment Generation** — Natural language → structured MongoDB filter object
   - Prompt engineering extracts: minSpend, inactiveDays, cities, tags, etc.
   - Result is validated and executed directly against MongoDB

2. **Campaign Generation** — Goal description → full campaign blueprint
   - Returns: name, channel recommendation, subject, personalized message, tips
   - Uses segment context for personalized audience recommendations

3. **Customer Insights** — Customer profile → actionable analysis
   - Generates: value tier, churn risk, engagement opportunity, next action

4. **Copilot Chat** — Multi-turn conversation with full history
   - System prompt primes the model as a CRM expert
   - Extracts structured actions from responses (create_segment, create_campaign)

**Graceful Fallback:** All AI features work in demo mode without API key using curated responses.`,
    tradeoffs: [
      'Gemini API calls add 1-3s latency to AI features',
      'Prompt engineering is brittle — production needs structured output mode',
      'Cost consideration: Flash model chosen for speed/cost balance over Pro',
    ],
  },
  {
    icon: Shield,
    title: 'Authentication & Security',
    color: '#2563eb',
    content: `**JWT-based stateless authentication:**
- bcryptjs with 12 salt rounds for password hashing
- 7-day token expiry with auto-refresh on frontend
- All CRM routes protected via authenticate middleware
- Analytics callback endpoint intentionally public (channel service calls it)

**Security measures:**
- helmet.js sets secure HTTP headers
- CORS configured for specific frontend origin
- Rate limiting: 500 requests/15min per IP
- express-validator for input sanitization
- Multer limits: 10MB max file size for CSV uploads

**Production improvements needed:**
- Refresh token rotation
- Redis session blacklisting for logout
- API key authentication for Channel Service callback`,
    tradeoffs: [
      'Stateless JWT: no server-side session invalidation (solved with blacklist in prod)',
      'Password reset flow not implemented in demo',
      'Role-based access control (admin/marketer/viewer) defined but not enforced in all routes',
    ],
  },
  {
    icon: Server,
    title: 'Channel Simulation Design',
    color: '#d97706',
    content: `**Realistic delivery simulation:**

Each channel has a tuned profile with realistic industry rates:
- Email: 88% delivery, 38% open, 28% click, 15% conversion
- WhatsApp: 96% delivery, 71% open, 42% click, 22% conversion  
- SMS: 94% delivery, 62% open, 35% click, 18% conversion
- Push: 82% delivery, 45% open, 38% click, 20% conversion

**Event timing simulation:**
- Delivery: 0.5–3.5 seconds after send
- Opens: Seconds to minutes (realistic human behavior)
- Clicks: Minutes after open
- Conversions: Minutes to 30 minutes after click

**Architecture pattern:** Fire-and-forget with async callbacks
- CRM sends payload → Channel Service acknowledges immediately (200 OK)
- Channel Service simulates asynchronously
- Each event POSTed back to /api/analytics/callback
- CRM updates campaign stats and communication status in real-time`,
    tradeoffs: [
      'In-memory simulation: no persistence if Channel Service restarts',
      'Callbacks could be missed if CRM is down (no retry queue)',
      'Production: use a message queue (RabbitMQ/SQS) for reliable delivery',
    ],
  },
  {
    icon: Code2,
    title: 'Frontend Architecture',
    color: '#ec4899',
    content: `**React 18 + TypeScript + Vite stack:**

**State Management:** React Query (@tanstack/query) for all server state
- Automatic caching, background refetching, optimistic updates
- 30-second stale time for analytics; 15-second for campaigns
- No Redux needed — server state is the source of truth

**Design System:** Tailwind CSS v4 with custom design tokens
- CSS custom properties for all brand colors and semantic tokens
- Glassmorphism via backdrop-filter + rgba backgrounds
- Framer Motion for page transitions and list animations

**Component Strategy:** Composition over inheritance
- Small, focused components (StatCard, CustomTooltip, SkeletonCard)
- Page-level components handle data fetching
- Layout.tsx owns sidebar state and navigation

**API Layer:** Single axios instance with JWT interceptor
- Auto-attaches Bearer token to all requests
- 401 response → clears auth state, redirects to /login

**Charts:** Recharts for all data visualization
- AreaChart, BarChart, RadarChart, PieChart, custom Funnel visualization`,
    tradeoffs: [
      'No Server-Side Rendering (Vite is CSR-only) — use Next.js for SEO needs',
      'In-memory conversation store for copilot (persists only per page load)',
      'shadcn/ui not used in final implementation — used direct Radix primitives to save bundle size',
    ],
  },
]

export default function Architecture() {
  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold gradient-text">Architecture Decisions</h1>
        <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
          Technical design, tradeoffs, and rationale — XenoReach AI Engineering Brief
        </p>
      </div>

      {/* System Diagram */}
      <div className="glass p-6 rounded-2xl" style={{ border: '1px solid rgba(124,58,237,0.2)' }}>
        <h3 className="font-semibold text-sm mb-4" style={{ color: 'rgba(255,255,255,0.8)' }}>System Architecture</h3>
        <div className="flex items-center justify-center gap-4 flex-wrap text-xs">
          {[
            { label: 'React Frontend', sublabel: ':5173', color: '#c026d3' },
            { label: '→', isArrow: true },
            { label: 'CRM Backend', sublabel: ':5000 Express', color: '#7c3aed' },
            { label: '→', isArrow: true },
            { label: 'MongoDB Atlas', sublabel: 'Database', color: '#059669' },
          ].map((item, i) => item.isArrow ? (
            <ArrowRight key={i} size={16} style={{ color: 'rgba(255,255,255,0.3)' }} />
          ) : (
            <div key={i} className="text-center p-3 rounded-xl" style={{ background: `${item.color}20`, border: `1px solid ${item.color}30`, minWidth: 100 }}>
              <div className="font-semibold" style={{ color: item.color }}>{item.label}</div>
              <div style={{ color: 'rgba(255,255,255,0.4)' }}>{item.sublabel}</div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-center gap-4 mt-4 flex-wrap text-xs">
          {[
            { label: 'CRM Backend', sublabel: ':5000', color: '#7c3aed' },
            { label: '→ launch →', isArrow: true },
            { label: 'Channel Service', sublabel: ':5001 Express', color: '#d97706' },
            { label: '→ callback →', isArrow: true },
            { label: 'CRM Backend', sublabel: 'analytics update', color: '#7c3aed' },
          ].map((item, i) => item.isArrow ? (
            <span key={i} style={{ color: 'rgba(255,255,255,0.3)' }}>{item.label}</span>
          ) : (
            <div key={i} className="text-center p-3 rounded-xl" style={{ background: `${item.color}20`, border: `1px solid ${item.color}30`, minWidth: 100 }}>
              <div className="font-semibold" style={{ color: item.color }}>{item.label}</div>
              <div style={{ color: 'rgba(255,255,255,0.4)' }}>{item.sublabel}</div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-center gap-4 mt-4 flex-wrap text-xs">
          {[
            { label: 'CRM Backend', sublabel: ':5000', color: '#7c3aed' },
            { label: '→ AI calls →', isArrow: true },
            { label: 'Gemini API', sublabel: 'gemini-1.5-flash', color: '#2563eb' },
          ].map((item, i) => item.isArrow ? (
            <span key={i} style={{ color: 'rgba(255,255,255,0.3)' }}>{item.label}</span>
          ) : (
            <div key={i} className="text-center p-3 rounded-xl" style={{ background: `${item.color}20`, border: `1px solid ${item.color}30`, minWidth: 100 }}>
              <div className="font-semibold" style={{ color: item.color }}>{item.label}</div>
              <div style={{ color: 'rgba(255,255,255,0.4)' }}>{item.sublabel}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Decision Cards */}
      {SECTIONS.map(({ icon: Icon, title, color, content, tradeoffs }, i) => (
        <motion.div key={title} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
          className="glass p-6 rounded-2xl" style={{ border: `1px solid ${color}20` }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}20` }}>
              <Icon size={18} style={{ color }} />
            </div>
            <h2 className="font-bold text-base" style={{ color: 'rgba(255,255,255,0.9)' }}>{title}</h2>
          </div>

          <div className="text-sm leading-relaxed mb-5 space-y-1"
            style={{ color: 'rgba(255,255,255,0.6)' }}
            dangerouslySetInnerHTML={{
              __html: content
                .replace(/\*\*(.*?)\*\*/g, `<strong style="color:rgba(255,255,255,0.85)">$1</strong>`)
                .replace(/- (.*?)(?:\n|$)/g, '<div style="display:flex;gap:8px;margin:4px 0"><span style="color:#a78bfa">•</span><span>$1</span></div>')
                .replace(/\n/g, '<br/>')
            }}
          />

          <div>
            <div className="text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.3)' }}>
              Tradeoffs & Considerations
            </div>
            {tradeoffs.map((t, j) => (
              <div key={j} className="flex items-start gap-2 text-xs mb-1.5" style={{ color: 'rgba(255,255,255,0.45)' }}>
                <span style={{ color: color, marginTop: 2 }}>⚡</span>
                {t}
              </div>
            ))}
          </div>
        </motion.div>
      ))}

      {/* Tech Stack */}
      <div className="glass p-6 rounded-2xl" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
        <h2 className="font-bold text-base mb-4" style={{ color: 'rgba(255,255,255,0.9)' }}>Full Tech Stack</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            ['Frontend', 'React 18 + TypeScript'],
            ['Bundler', 'Vite 5'],
            ['Styling', 'Tailwind CSS v4'],
            ['Animation', 'Framer Motion'],
            ['Charts', 'Recharts'],
            ['State', 'TanStack React Query'],
            ['Routing', 'React Router v6'],
            ['Backend', 'Node.js + Express'],
            ['Database', 'MongoDB + Mongoose'],
            ['Auth', 'JWT + bcryptjs'],
            ['AI', 'Google Gemini 1.5 Flash'],
            ['Upload', 'Multer + csv-parse'],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center gap-2 p-2.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <CheckCircle size={13} style={{ color: '#10b981', flexShrink: 0 }} />
              <div>
                <div className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{label}</div>
                <div className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.8)' }}>{value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
