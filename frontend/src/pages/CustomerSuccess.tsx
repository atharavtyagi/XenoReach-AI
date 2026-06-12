import { motion } from 'framer-motion'
import { Star, TrendingUp, Award, ArrowRight, CheckCircle, Building2, Zap } from 'lucide-react'
import toast from 'react-hot-toast'

const CASE_STUDIES = [
  {
    company: 'FashionFirst India',
    industry: 'Retail Fashion',
    industryColor: '#7c3aed',
    logo: '👗',
    problem: 'Siloed data across 3 offline stores and Shopify. Zero visibility into repeat purchase patterns, manual campaigns with <12% engagement rate.',
    integrations: ['Shopify', 'POS System', 'WhatsApp API', 'Loyalty Platform'],
    outcomes: [
      { value: '+31%', label: 'Repeat Purchase Rate', color: '#10b981' },
      { value: '₹2.4Cr', label: 'Revenue Attributed', color: '#3b82f6' },
      { value: '4.2x', label: 'Campaign ROI', color: '#f59e0b' },
      { value: '-28%', label: 'Churn Rate', color: '#7c3aed' },
    ],
    timeline: '3 weeks',
    testimonial: '"XenoReach transformed how we see our customers. We now know exactly who to target and when. Our WhatsApp campaigns achieve 71% open rates."',
    author: 'Priya Sharma, CMO',
    bgAccent: 'rgba(124,58,237,0.06)',
    borderAccent: 'rgba(124,58,237,0.2)',
  },
  {
    company: 'TechGadgets Pro',
    industry: 'Consumer Electronics',
    industryColor: '#3b82f6',
    logo: '📱',
    problem: 'High acquisition costs eating into margins. Post-purchase engagement was non-existent, leading to 40% churn within 90 days of first purchase.',
    integrations: ['Shopify', 'Google Analytics', 'Email', 'WhatsApp API'],
    outcomes: [
      { value: '-18%', label: 'Churn Rate Reduction', color: '#10b981' },
      { value: '4.2x', label: 'Campaign ROI', color: '#f59e0b' },
      { value: '+65%', label: 'Email Open Rate', color: '#3b82f6' },
      { value: '₹1.8Cr', label: 'Win-Back Revenue', color: '#7c3aed' },
    ],
    timeline: '2 weeks',
    testimonial: '"The AI segmentation identified our at-risk customers perfectly. Win-back campaigns recovered ₹1.8Cr in just the first quarter. Incredible ROI."',
    author: 'Rahul Mehta, Growth Lead',
    bgAccent: 'rgba(59,130,246,0.06)',
    borderAccent: 'rgba(59,130,246,0.2)',
  },
  {
    company: 'SpiceRoute Restaurants',
    industry: 'F&B / Restaurant Chain',
    industryColor: '#f59e0b',
    logo: '🍽️',
    problem: 'Fragmented customer data across Zomato, Swiggy, dine-in POS, and loyalty cards. Retention campaigns were generic with zero personalization.',
    integrations: ['POS System', 'Loyalty Platform', 'WhatsApp API', 'Zomato API'],
    outcomes: [
      { value: '+45%', label: 'Loyalty Conversion', color: '#f59e0b' },
      { value: '₹85L', label: 'Incremental Revenue', color: '#10b981' },
      { value: '3.8x', label: 'Festival Campaign ROI', color: '#3b82f6' },
      { value: '+52%', label: 'Dine-in Repeat Visits', color: '#7c3aed' },
    ],
    timeline: '4 weeks',
    testimonial: '"Birthday campaigns with a personal message and 15% discount brought back 67% of dormant customers. XenoReach made us see retention differently."',
    author: 'Arjun Kapoor, Operations Director',
    bgAccent: 'rgba(245,158,11,0.06)',
    borderAccent: 'rgba(245,158,11,0.2)',
  },
  {
    company: 'LuxeWear Fashion',
    industry: 'Luxury Apparel',
    industryColor: '#ec4899',
    logo: '✨',
    problem: 'VIP customers weren\'t being treated as VIPs. No differentiation between ₹500 and ₹50,000 buyers. High-value clients drifting to competitors.',
    integrations: ['Shopify Plus', 'POS System', 'WhatsApp Business', 'CRM System'],
    outcomes: [
      { value: '+67%', label: 'VIP Retention Rate', color: '#10b981' },
      { value: '2.8x', label: 'Average Order Value', color: '#f59e0b' },
      { value: '₹4.2Cr', label: 'VIP Segment Revenue', color: '#ec4899' },
      { value: '94%', label: 'Customer Satisfaction', color: '#3b82f6' },
    ],
    timeline: '3 weeks',
    testimonial: '"Our Platinum tier customers now feel truly valued. First-access previews and personalized styling notes drove 2.8x AOV. Exceptional platform."',
    author: 'Nisha Gupta, Brand Director',
    bgAccent: 'rgba(236,72,153,0.06)',
    borderAccent: 'rgba(236,72,153,0.2)',
  },
]

export default function CustomerSuccess() {
  return (
    <div style={{ padding: 32, background: 'hsl(222,47%,4%)', minHeight: '100%', overflowY: 'auto' }}>

      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        style={{ textAlign: 'center', marginBottom: 48, padding: '48px 20px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 999, background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.2)', marginBottom: 20 }}>
          <Star size={13} color="#a78bfa" fill="#a78bfa" />
          <span style={{ fontSize: 12, fontWeight: 700, color: '#a78bfa' }}>CUSTOMER SUCCESS STORIES</span>
        </div>
        <h1 style={{ fontSize: 40, fontWeight: 900, background: 'linear-gradient(135deg,#a78bfa,#e879f9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 12, lineHeight: 1.2 }}>
          Real Results from Real Brands
        </h1>
        <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)', maxWidth: 560, margin: '0 auto 40px', lineHeight: 1.7 }}>
          See how Indian retail brands transformed their customer relationships with XenoReach AI
        </p>
        {/* Hero stats */}
        <div style={{ display: 'flex', gap: 32, justifyContent: 'center', flexWrap: 'wrap' }}>
          {[
            { value: '120+', label: 'Brands Onboarded', icon: Building2, color: '#7c3aed' },
            { value: '+23%', label: 'Avg Revenue Increase', icon: TrendingUp, color: '#10b981' },
            { value: '4.8/5', label: 'Customer Satisfaction', icon: Star, color: '#f59e0b' },
            { value: '< 3wks', label: 'Average Time to Value', icon: Zap, color: '#3b82f6' },
          ].map(({ value, label, icon: Icon, color }) => (
            <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${color}15` }}>
                <Icon size={20} style={{ color }} />
              </div>
              <div style={{ fontSize: 26, fontWeight: 900, color }}>{value}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{label}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Case Studies */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
        {CASE_STUDIES.map((cs, i) => (
          <motion.div key={cs.company}
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.1 }}
            style={{ padding: '28px 32px', borderRadius: 20, background: cs.bgAccent, border: `1px solid ${cs.borderAccent}` }}>

            {/* Top row */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 56, height: 56, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  {cs.logo}
                </div>
                <div>
                  <h2 style={{ fontSize: 20, fontWeight: 800, color: 'rgba(255,255,255,0.95)', margin: 0, marginBottom: 6 }}>{cs.company}</h2>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 6, background: `${cs.industryColor}20`, color: cs.industryColor }}>{cs.industry}</span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderRadius: 10, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
                <Zap size={13} color="#10b981" />
                <span style={{ fontSize: 12, fontWeight: 700, color: '#10b981' }}>Live in {cs.timeline}</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 32, flexWrap: 'wrap' }}>
              {/* Left: problem + integrations */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>Challenge</div>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, marginBottom: 20 }}>{cs.problem}</p>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>Integrations Used</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {cs.integrations.map(int => (
                      <div key={int} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <CheckCircle size={11} color="#10b981" />
                        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)' }}>{int}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right: outcomes */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, minWidth: 280 }}>
                {cs.outcomes.map(outcome => (
                  <div key={outcome.label} style={{ padding: '14px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: `1px solid ${outcome.color}20`, textAlign: 'center' }}>
                    <div style={{ fontSize: 24, fontWeight: 900, color: outcome.color, marginBottom: 4 }}>{outcome.value}</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', lineHeight: 1.3 }}>{outcome.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Testimonial */}
            <div style={{ marginTop: 22, padding: '16px 20px', borderRadius: 14, background: 'rgba(255,255,255,0.03)', borderLeft: `4px solid ${cs.industryColor}` }}>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, fontStyle: 'italic', margin: 0, marginBottom: 8 }}>{cs.testimonial}</p>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.5)' }}>— {cs.author}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* CTA */}
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
        style={{ textAlign: 'center', marginTop: 56, padding: '48px 32px', borderRadius: 24, background: 'linear-gradient(135deg,rgba(124,58,237,0.12),rgba(192,38,211,0.08))', border: '1px solid rgba(124,58,237,0.2)' }}>
        <Award size={36} color="#a78bfa" style={{ marginBottom: 16 }} />
        <h2 style={{ fontSize: 28, fontWeight: 900, color: 'rgba(255,255,255,0.95)', marginBottom: 12 }}>Ready to be the next success story?</h2>
        <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', marginBottom: 28, maxWidth: 480, margin: '0 auto 28px' }}>
          Join 120+ Indian retail brands that transformed customer relationships with XenoReach AI
        </p>
        <button onClick={() => toast.success('Demo booked! Our team will reach out within 24 hours.')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '14px 32px', borderRadius: 14, fontSize: 15, fontWeight: 800, background: 'linear-gradient(135deg,#7c3aed,#c026d3)', border: 'none', color: 'white', cursor: 'pointer' }}>
          Book a Free Demo <ArrowRight size={16} />
        </button>
      </motion.div>
    </div>
  )
}
