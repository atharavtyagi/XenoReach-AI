const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'demo_key');

const getModel = () => genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

/**
 * Parse JSON from Gemini response safely
 */
const parseJSON = (text) => {
  try {
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1] || jsonMatch[0]);
    }
    return JSON.parse(text);
  } catch {
    return null;
  }
};

/**
 * Generate segment filters from natural language query
 */
const generateSegment = async (query) => {
  // If no API key, return demo data
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
    return getDemoSegmentResult(query);
  }

  try {
    const model = getModel();
    const prompt = `You are a CRM data expert. Convert this natural language customer segment query into structured filters.

Query: "${query}"

Return a JSON object with this exact structure:
{
  "name": "Segment name (short, descriptive)",
  "description": "What this segment represents",
  "filters": {
    "minSpend": null or number (minimum total spend in INR),
    "maxSpend": null or number (maximum total spend),
    "minOrders": null or number (minimum order count),
    "maxOrders": null or number,
    "inactiveDays": null or number (days since last order - for inactive customers),
    "lastActiveDays": null or number (active within last N days),
    "cities": [] or array of city names,
    "tags": [] or array of tags,
    "gender": null or "Male" or "Female",
    "minAge": null or number,
    "maxAge": null or number
  },
  "suggestions": "Marketing suggestions for this segment (2-3 sentences)"
}

Examples:
- "customers who spent more than 5000 and inactive 90 days" → minSpend: 5000, inactiveDays: 90
- "high value customers in Mumbai" → minSpend: 10000, cities: ["Mumbai"]
- "customers who ordered 3+ times this month" → minOrders: 3, lastActiveDays: 30

Only return the JSON, no explanation.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const parsed = parseJSON(text);
    return parsed || getDemoSegmentResult(query);
  } catch (err) {
    console.error('Gemini segment error:', err.message);
    return getDemoSegmentResult(query);
  }
};

const getDemoSegmentResult = (query) => {
  const q = query.toLowerCase();
  const filters = {};
  
  if (q.includes('premium') || q.includes('high value') || q.includes('vip')) filters.minSpend = 10000;
  if (q.includes('inactive') || q.includes('lapsed') || q.includes('churn')) filters.inactiveDays = 90;
  if (q.includes('new') || q.includes('recent')) filters.lastActiveDays = 30;
  if (q.includes('5000') || q.includes('₹5000')) filters.minSpend = 5000;
  if (q.includes('mumbai')) filters.cities = ['Mumbai'];
  if (q.includes('delhi')) filters.cities = ['Delhi'];
  if (q.includes('bangalore') || q.includes('bengaluru')) filters.cities = ['Bangalore'];

  return {
    name: `AI Segment: ${query.substring(0, 40)}`,
    description: `Customers matching: ${query}`,
    filters,
    suggestions: 'Target these customers with personalized re-engagement campaigns. Consider offering exclusive discounts or early access to new products. Use multi-channel outreach for maximum impact.',
  };
};

/**
 * Generate campaign from goal description
 */
const generateCampaign = async (goal, segmentInfo) => {
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
    return getDemoCampaignResult(goal, segmentInfo);
  }

  try {
    const model = getModel();
    const segmentContext = segmentInfo
      ? `Target segment: "${segmentInfo.name}" with ${segmentInfo.customerCount} customers, avg spend ₹${segmentInfo.avgSpend}`
      : 'No specific segment selected';

    const prompt = `You are an expert retail marketing strategist. Generate a complete campaign for this goal.

Campaign Goal: "${goal}"
${segmentContext}

Return a JSON object:
{
  "name": "Campaign name (catchy, brand-aligned)",
  "description": "Campaign description",
  "channel": "Email" or "SMS" or "WhatsApp" or "Push" or "Multi-Channel",
  "subject": "Email subject line (if email channel)",
  "message": "Full campaign message (150-200 words, personalized with {customerName} placeholder, include offer/CTA)",
  "goal": "Specific measurable goal",
  "audienceRecommendation": "Who to target and why",
  "channelRationale": "Why this channel was chosen",
  "expectedOutcome": "Expected results",
  "tips": ["tip1", "tip2", "tip3"]
}

The message should be engaging, use the brand name XenoReach, and include a clear call-to-action.
Only return JSON.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const parsed = parseJSON(text);
    return parsed || getDemoCampaignResult(goal, segmentInfo);
  } catch (err) {
    console.error('Gemini campaign error:', err.message);
    return getDemoCampaignResult(goal, segmentInfo);
  }
};

const getDemoCampaignResult = (goal, segmentInfo) => {
  const g = goal.toLowerCase();
  let channel = 'Email';
  let name = 'Win-Back Campaign';
  
  if (g.includes('whatsapp')) channel = 'WhatsApp';
  else if (g.includes('sms')) channel = 'SMS';
  else if (g.includes('push')) channel = 'Push';
  
  if (g.includes('premium') || g.includes('vip')) name = 'VIP Exclusive Access';
  else if (g.includes('inactive') || g.includes('win back') || g.includes('churn')) name = 'Win-Back Campaign';
  else if (g.includes('new') || g.includes('welcome')) name = 'Welcome Campaign';
  else if (g.includes('sale') || g.includes('discount')) name = 'Flash Sale Alert';

  return {
    name,
    description: `AI-generated campaign for: ${goal}`,
    channel,
    subject: `${name} — Exclusive offer just for you! 🎉`,
    message: `Hi {customerName},\n\nWe've been thinking about you! As one of our valued customers, we have an exclusive offer just for you.\n\n🎁 Enjoy 20% OFF your next purchase with code XENO20\n\nThis exclusive offer is valid for 7 days only. Don't miss out on our latest collection designed just for customers like you.\n\n✨ Shop Now and save big!\n\nBest regards,\nTeam XenoReach\n\n[Shop Now Button]`,
    goal: 'Increase repeat purchase rate by 25% within 30 days',
    audienceRecommendation: segmentInfo ? `${segmentInfo.name} (${segmentInfo.customerCount} customers)` : 'High-value customers with recent purchase history',
    channelRationale: `${channel} provides high visibility and personalization capability for this campaign type`,
    expectedOutcome: '20-35% open rate, 8-12% click rate, 3-5% conversion rate',
    tips: [
      'Personalize the subject line with the customer name',
      'Send on Tuesday or Wednesday morning for best open rates',
      'Include a clear single CTA to reduce decision fatigue',
    ],
  };
};

/**
 * Generate AI insights for a customer
 */
const generateCustomerInsights = async (customer, orders) => {
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
    return getDemoCustomerInsights(customer);
  }

  try {
    const model = getModel();
    const prompt = `You are a retail CRM analyst. Analyze this customer profile and provide actionable insights.

Customer: ${customer.name}
City: ${customer.city}, Total Spend: ₹${customer.totalSpend}
Orders: ${customer.orderCount}, Avg Order: ₹${customer.avgOrderValue}
Last Order: ${customer.lastOrderDate ? new Date(customer.lastOrderDate).toLocaleDateString() : 'Never'}
Tags: ${customer.tags?.join(', ') || 'none'}

Recent Orders: ${JSON.stringify(orders.map(o => ({ amount: o.totalAmount, status: o.status, date: o.createdAt })))}

Provide a brief analysis (3-4 sentences) covering:
1. Customer value tier (High/Mid/Low)
2. Churn risk (High/Medium/Low) with reasoning
3. Best engagement opportunity
4. Recommended next action

Be specific and actionable. Keep it under 150 words.`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (err) {
    console.error('Gemini insights error:', err.message);
    return getDemoCustomerInsights(customer);
  }
};

const getDemoCustomerInsights = (customer) => {
  const tier = customer.totalSpend > 20000 ? 'High' : customer.totalSpend > 5000 ? 'Mid' : 'Low';
  const daysSinceOrder = customer.lastOrderDate
    ? Math.floor((Date.now() - new Date(customer.lastOrderDate)) / (1000 * 60 * 60 * 24))
    : 999;
  const churnRisk = daysSinceOrder > 120 ? 'High' : daysSinceOrder > 60 ? 'Medium' : 'Low';

  return `**Customer Value Tier: ${tier}** — This customer has a lifetime value of ₹${customer.totalSpend.toLocaleString()} across ${customer.orderCount} orders. **Churn Risk: ${churnRisk}** — Last active ${daysSinceOrder} days ago. ${churnRisk === 'High' ? 'Immediate re-engagement needed via personalized win-back campaign.' : churnRisk === 'Medium' ? 'Consider a loyalty reward or exclusive offer to prevent churn.' : 'Customer is engaged — focus on upsell and cross-sell opportunities.'} Recommended action: ${tier === 'High' ? 'Invite to VIP program and offer early access to new collections.' : 'Send a personalized discount code to drive the next purchase.'}`;
};

/**
 * Copilot multi-turn chat
 */
const copilotChat = async (message, history) => {
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
    return getDemoCopilotResponse(message);
  }

  try {
    const model = getModel();
    const systemContext = `You are the XenoReach AI Copilot, an expert AI assistant for retail CRM and marketing. 
You help marketers with:
- Creating customer segments based on behavior
- Generating personalized campaign messages
- Analyzing customer data and identifying opportunities
- Recommending marketing strategies

When suggesting segments or campaigns, provide structured data that can be acted upon.
If asked to create a campaign or segment, provide a JSON block with the details.
Keep responses concise, actionable, and professional. Use markdown formatting.`;

    const chatHistory = history.map(h => ({
      role: h.role,
      parts: [{ text: h.content }],
    }));

    const chat = model.startChat({
      history: [{ role: 'user', parts: [{ text: systemContext }] }, { role: 'model', parts: [{ text: 'Understood! I am the XenoReach AI Copilot, ready to help with your CRM and marketing needs.' }] }, ...chatHistory],
    });

    const result = await chat.sendMessage(message);
    const responseText = result.response.text();

    const newHistory = [
      ...history,
      { role: 'user', content: message },
      { role: 'model', content: responseText },
    ];

    // Extract any actionable items from the response
    const actions = extractActions(responseText);

    return { response: responseText, actions, history: newHistory };
  } catch (err) {
    console.error('Copilot error:', err.message);
    return getDemoCopilotResponse(message);
  }
};

const extractActions = (text) => {
  const actions = [];
  if (text.toLowerCase().includes('create segment') || text.toLowerCase().includes('segment:')) {
    actions.push({ type: 'create_segment', label: 'Create Segment', icon: 'users' });
  }
  if (text.toLowerCase().includes('create campaign') || text.toLowerCase().includes('launch campaign')) {
    actions.push({ type: 'create_campaign', label: 'Create Campaign', icon: 'send' });
  }
  if (text.toLowerCase().includes('view analytics') || text.toLowerCase().includes('check performance')) {
    actions.push({ type: 'view_analytics', label: 'View Analytics', icon: 'chart' });
  }
  return actions;
};

const getDemoCopilotResponse = (message) => {
  const m = message.toLowerCase();
  let response = '';
  const actions = [];

  if (m.includes('inactive') || m.includes('win back') || m.includes('churn')) {
    response = `## Win-Back Campaign Strategy 🎯

I've analyzed your customer base and here's my recommendation:

**Target Segment:** Customers inactive for 90+ days with ₹5,000+ lifetime spend (~142 customers)

**Recommended Campaign:**
- **Channel:** Email + WhatsApp
- **Subject:** "We miss you, {customerName}! Here's 25% off 🎁"
- **Message:** Personalized re-engagement with exclusive discount code
- **Best Send Time:** Tuesday 10 AM

**Expected Results:**
- 📧 Open Rate: 28-35%
- 🖱️ Click Rate: 8-12%
- 💰 Conversion: 3-5%
- 📈 Revenue Impact: ₹45,000 - ₹85,000

Would you like me to create this campaign now?`;
    actions.push({ type: 'create_campaign', label: 'Create This Campaign', icon: 'send' });
    actions.push({ type: 'create_segment', label: 'Build Segment', icon: 'users' });
  } else if (m.includes('high value') || m.includes('premium') || m.includes('vip')) {
    response = `## High-Value Customer Strategy 💎

**VIP Segment Analysis:**
- Customers with ₹15,000+ spend: ~89 customers
- Average order value: ₹4,200
- Average orders per customer: 8.3

**Recommendations:**
1. 🎁 Launch a **VIP Loyalty Program** with exclusive benefits
2. 📦 Offer **Early Access** to new collections
3. 💬 Create a **WhatsApp VIP Group** for personalized service
4. 🏆 Introduce **Tiered Rewards** (Silver/Gold/Platinum)

**Campaign I'd suggest:**
- Name: "VIP Early Access — New Collection Drop"
- Channel: WhatsApp (highest engagement for VIPs)
- Goal: Maintain engagement + drive repeat purchase`;
    actions.push({ type: 'create_campaign', label: 'Launch VIP Campaign', icon: 'send' });
  } else {
    response = `## XenoReach AI Copilot 🤖

I'm your AI marketing assistant! I can help you:

- 🎯 **Create Segments** — "Show me customers who spent ₹10,000+ and haven't ordered in 60 days"
- 📧 **Generate Campaigns** — "Create a win-back email for inactive premium customers"  
- 📊 **Analyze Performance** — "Which campaign had the best ROI last month?"
- 💡 **Strategic Advice** — "How should I re-engage churned customers?"

Try asking me something like:
*"Launch a campaign for inactive shoppers in Mumbai"*
or
*"Find high-value customers likely to churn"*`;
  }

  return {
    response,
    actions,
    history: [
      { role: 'user', content: message },
      { role: 'model', content: response },
    ],
  };
};


// ─── Executive Insights ───────────────────────────────────────────────────────
const generateExecutiveInsights = async (metrics) => {
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
    return getDemoExecutiveInsights(metrics);
  }
  try {
    const model = getModel();
    const prompt = `You are a senior business consultant for a retail CRM platform. Generate 6 strategic executive insights.

Business Metrics:
- Active Customers: ${metrics.totalCustomers}
- Total Revenue Tracked: ₹${(metrics.totalRevenue || 0).toLocaleString()}
- Average Customer Spend: ₹${metrics.avgCustomerSpend || 0}
- Active Campaigns: ${metrics.totalCampaigns}
- Segments Built: ${metrics.totalSegments}

Return a JSON array of exactly 6 insights:
[{
  "title": "Short impactful title",
  "category": "retention|revenue|risk|optimization|growth|engagement",
  "impact": "Business impact description (1-2 sentences, specific to metrics above)",
  "estimatedRevenue": "₹X - ₹Y range",
  "action": "One specific recommended action",
  "confidence": 0.75 to 0.97,
  "priority": "high|medium|low"
}]

Make insights actionable and specific to Indian retail. Only return JSON.`;
    const result = await model.generateContent(prompt);
    const parsed = parseJSON(result.response.text());
    return parsed || getDemoExecutiveInsights(metrics);
  } catch (err) {
    console.error('Executive insights error:', err.message);
    return getDemoExecutiveInsights(metrics);
  }
};

const getDemoExecutiveInsights = (metrics) => [
  {
    title: 'High-Value Customers Not Recently Engaged',
    category: 'retention',
    impact: `${Math.round((metrics.totalCustomers || 150) * 0.15)} premium customers haven't received a campaign in 60+ days, representing ₹${Math.round((metrics.totalRevenue || 500000) * 0.35).toLocaleString()} in dormant revenue.`,
    estimatedRevenue: '₹85,000 - ₹2,40,000',
    action: 'Launch a personalized VIP re-engagement campaign with exclusive early access offers.',
    confidence: 0.92,
    priority: 'high',
  },
  {
    title: 'Seasonal Revenue Opportunity Window',
    category: 'revenue',
    impact: 'Festival season data shows 3.2x higher conversion rates. Your top segments are under-targeted during peak shopping periods.',
    estimatedRevenue: '₹1,50,000 - ₹4,20,000',
    action: 'Create seasonal campaign bundles for Premium VIP and Active Shopper segments before next festival.',
    confidence: 0.87,
    priority: 'high',
  },
  {
    title: 'Churn Risk in Mid-Tier Customer Segment',
    category: 'risk',
    impact: `${Math.round((metrics.totalCustomers || 150) * 0.22)} customers with ₹5,000-₹15,000 spend show 90+ day inactivity patterns indicating high churn probability.`,
    estimatedRevenue: '₹65,000 - ₹1,80,000 at risk',
    action: 'Deploy automated win-back workflow with progressive discount ladder (10% → 15% → 20%).',
    confidence: 0.89,
    priority: 'high',
  },
  {
    title: 'WhatsApp Channel Significantly Underutilized',
    category: 'optimization',
    impact: 'WhatsApp delivers 96% delivery rate vs 88% for email, yet only 23% of campaigns use WhatsApp as primary channel.',
    estimatedRevenue: '₹35,000 - ₹90,000 additional',
    action: 'Shift 40% of re-engagement campaigns to WhatsApp for improved delivery and open rates.',
    confidence: 0.84,
    priority: 'medium',
  },
  {
    title: 'Loyalty Program Revenue Uplift Opportunity',
    category: 'growth',
    impact: `Customers with 5+ orders represent 31% of your base but generate 67% of revenue. A loyalty tier system could significantly increase this ratio.`,
    estimatedRevenue: '₹2,00,000 - ₹5,50,000 annually',
    action: 'Implement a 3-tier loyalty program (Silver/Gold/Platinum) with exclusive benefits and early access.',
    confidence: 0.91,
    priority: 'medium',
  },
  {
    title: 'Data Enrichment for Precision Targeting',
    category: 'engagement',
    impact: '34% of customers are missing city data, limiting geographic segmentation and reducing localized campaign effectiveness by up to 40%.',
    estimatedRevenue: '₹25,000 - ₹70,000 from better targeting',
    action: 'Run a data enrichment campaign offering 50 loyalty points for profile completion.',
    confidence: 0.78,
    priority: 'low',
  },
];

// ─── Solution Recommendations ─────────────────────────────────────────────────
const generateSolutionRecommendations = async (context) => {
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
    return getDemoSolutionRecommendations(context);
  }
  try {
    const model = getModel();
    const prompt = `You are a Forward Deployed Engineer at XenoReach AI CRM. Create a comprehensive implementation plan.

Business Context:
- Type: ${context.businessType}
- Customer Count: ${context.customerCount}
- Monthly Orders: ${context.monthlyOrders || 'Not specified'}
- Challenges: ${context.challenges || 'General CRM implementation'}

Return a JSON object:
{
  "summary": "Executive summary (2-3 sentences)",
  "integrations": [{"name":"","priority":"high|medium|low","reason":""}],
  "segments": [{"name":"","description":"","estimatedSize":"X% of customers"}],
  "campaigns": [{"name":"","channel":"Email|SMS|WhatsApp|Push","goal":"","expectedROI":"XXX%"}],
  "workflows": [{"name":"","trigger":"","outcome":""}],
  "retentionStrategy": {"approach":"","tactics":["","",""]},
  "implementationTimeline": [{"week":1,"milestone":""}]
}

Be specific to the business type. Only return JSON.`;
    const result = await model.generateContent(prompt);
    const parsed = parseJSON(result.response.text());
    return parsed || getDemoSolutionRecommendations(context);
  } catch (err) {
    console.error('Solutions error:', err.message);
    return getDemoSolutionRecommendations(context);
  }
};

const getDemoSolutionRecommendations = (context) => ({
  summary: `For a ${context.businessType} with ${context.customerCount} customers, we recommend a phased CRM implementation starting with data consolidation and high-impact segmentation. Focus on WhatsApp-first engagement strategy given Indian market preferences, combined with AI-powered churn prediction to protect your most valuable customer relationships.`,
  integrations: [
    { name: 'Shopify / E-commerce Platform', priority: 'high', reason: 'Real-time order sync enables immediate behavioral triggers and purchase-based segmentation across your entire catalog.' },
    { name: 'WhatsApp Business API', priority: 'high', reason: '96% delivery rate, 3x higher engagement vs email — essential for Indian retail customers.' },
    { name: 'POS System Integration', priority: 'medium', reason: 'Unified online + offline customer view creates true Customer 360° profiles for better targeting.' },
    { name: 'Loyalty Platform', priority: 'medium', reason: 'Points-based retention drives 2.3x repeat purchase rates within the first 90 days.' },
  ],
  segments: [
    { name: 'High-Value Champions', description: 'Top 15% by lifetime spend with 3+ recent orders — your most profitable segment', estimatedSize: '15%' },
    { name: 'At-Risk Dormant', description: 'Previously active customers, 90+ days since last purchase — high churn probability', estimatedSize: '22%' },
    { name: 'New Customer Nurture', description: 'First purchase within last 30 days — critical window for second purchase conversion', estimatedSize: '18%' },
    { name: 'Loyal Mid-Tier', description: '5+ orders with growing spend trajectory — ready for loyalty tier upgrade', estimatedSize: '25%' },
  ],
  campaigns: [
    { name: 'Welcome Series (3-touch)', channel: 'WhatsApp', goal: 'Convert first-time buyers to repeat customers within 30 days', expectedROI: '340%' },
    { name: 'Win-Back Drive', channel: 'Email', goal: 'Reactivate dormant customers with exclusive personalized offer', expectedROI: '280%' },
    { name: 'VIP Early Access Drop', channel: 'WhatsApp', goal: 'Reward top customers with exclusive first access to new collection', expectedROI: '520%' },
    { name: 'Festival Flash Sale', channel: 'SMS', goal: 'Time-sensitive revenue spike leveraging seasonal shopping intent', expectedROI: '410%' },
  ],
  workflows: [
    { name: 'New Customer Onboarding', trigger: 'First purchase completed', outcome: 'Automated welcome + 3-touch nurture sequence driving second purchase' },
    { name: 'Churn Prevention Alert', trigger: 'Customer inactive for 60 days', outcome: 'Progressive re-engagement with escalating offers up to 20% discount' },
    { name: 'VIP Auto-Upgrade', trigger: 'Customer spend crosses ₹15,000', outcome: 'Automatic VIP tag assignment + exclusive benefits notification' },
  ],
  retentionStrategy: {
    approach: 'Implement a 3-tier loyalty program (Silver/Gold/Platinum) combined with behavioral-triggered campaigns to maximize customer lifetime value and reduce churn by 35% within 90 days.',
    tactics: [
      'Progressive discount ladder for win-back: 10% week 1 → 15% week 2 → 20% week 3',
      'Birthday and anniversary personalized campaigns with exclusive surprise offers',
      'Product recommendation engine based on purchase history and browse behavior analysis',
    ],
  },
  implementationTimeline: [
    { week: 1, milestone: 'Data audit, Shopify integration setup, initial segment creation (4 core segments)' },
    { week: 2, milestone: 'WhatsApp Business API activation, welcome campaign launch, POS integration' },
    { week: 3, milestone: 'Win-back campaign deployment, loyalty program configuration, workflow automation' },
    { week: 4, milestone: 'Performance review, A/B test analysis, segment refinement, Phase 2 planning' },
  ],
});

// ─── Data Quality AI Fixes ────────────────────────────────────────────────────
const generateDataQualityFixes = async (customers) => {
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
    return getDemoDataQualityFixes();
  }
  try {
    const model = getModel();
    const prompt = `Analyze these customer records for data quality issues. Return JSON array of 5 fix suggestions:
Records: ${JSON.stringify(customers.slice(0, 5))}

[{"type":"duplicate|missing|format|inconsistent","field":"field name","issue":"Description","suggestion":"Action","confidence":0.75-0.99,"affectedCount":N}]

Only return JSON.`;
    const result = await model.generateContent(prompt);
    const parsed = parseJSON(result.response.text());
    return parsed || getDemoDataQualityFixes();
  } catch (err) {
    return getDemoDataQualityFixes();
  }
};

const getDemoDataQualityFixes = () => [
  { type: 'missing', field: 'phone', issue: '23 customer records are missing phone numbers, limiting SMS and WhatsApp campaign reach by ~15%', suggestion: 'Run a profile completion campaign offering 50 loyalty points for verified phone number submission', confidence: 0.96, affectedCount: 23 },
  { type: 'format', field: 'phone', issue: 'Phone numbers stored in inconsistent formats (+91, 0, no prefix) causing WhatsApp API delivery failures', suggestion: 'Standardize all phone numbers to +91XXXXXXXXXX format using automated normalization script', confidence: 0.99, affectedCount: 47 },
  { type: 'missing', field: 'city', issue: '31 customers have no city data, reducing geographic targeting effectiveness and preventing city-based segment creation', suggestion: 'Infer city from shipping address in order records, or run targeted profile completion campaign', confidence: 0.88, affectedCount: 31 },
  { type: 'duplicate', field: 'email', issue: '3 potential duplicate customer profiles detected based on name similarity and matching city — could inflate customer count', suggestion: 'Review flagged profiles and merge duplicate records to consolidate purchase history and points', confidence: 0.82, affectedCount: 6 },
  { type: 'inconsistent', field: 'totalSpend', issue: '12 customers show ₹0 spend despite having order count > 0, indicating data sync failure between Order and Customer collections', suggestion: 'Re-calculate totalSpend by aggregating from Order collection and update Customer records in bulk', confidence: 0.97, affectedCount: 12 },
];

// ─── FDE Implementation Assistant ────────────────────────────────────────────
const generateImplementationAdvice = async (message, context, history) => {
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
    return getDemoImplementationAdvice(message, context, history);
  }
  try {
    const model = getModel();
    const systemPrompt = `You are an expert Forward Deployed Engineer (FDE) at XenoReach AI, helping enterprise retail clients implement and optimize their CRM platform.

Current client platform stats:
- ${context.customerCount} active customers
- ${context.campaignCount} campaigns created
- ${context.segmentCount} segments built
- ₹${(context.totalRevenue || 0).toLocaleString()} total revenue tracked

Your role: Provide specific, actionable implementation guidance referencing actual numbers above. Think like a consultant with deep product knowledge AND business acumen. Use markdown formatting. Be concise but thorough. Always end with a specific next step.`;

    const chatHistory = (history || []).map(h => ({ role: h.role, parts: [{ text: h.content }] }));
    const chat = model.startChat({
      history: [
        { role: 'user', parts: [{ text: systemPrompt }] },
        { role: 'model', parts: [{ text: 'Understood. I am your dedicated FDE from XenoReach AI. I have full context of your platform and I\'m ready to help maximize your CRM implementation value.' }] },
        ...chatHistory,
      ],
    });
    const result = await chat.sendMessage(message);
    const response = result.response.text();
    return { response, history: [...(history || []), { role: 'user', content: message }, { role: 'model', content: response }] };
  } catch (err) {
    console.error('FDE assistant error:', err.message);
    return getDemoImplementationAdvice(message, context, history);
  }
};

const getDemoImplementationAdvice = (message, context, history) => {
  const m = message.toLowerCase();
  // Normalize field names — backend sends totalCustomers, frontend sends customerCount
  context = {
    ...context,
    customerCount: context.customerCount || context.totalCustomers || 150,
    campaignCount: context.campaignCount || context.totalCampaigns || 5,
    segmentCount: context.segmentCount || context.totalSegments || 3,
    totalRevenue: context.totalRevenue || 500000,
  };
  let response = '';

  if (m.includes('onboard') || m.includes('import') || m.includes('data')) {
    response = `## Customer Data Onboarding Guide 📋

Based on your current **${context.customerCount} customers**, here's my recommended onboarding approach:

**Phase 1: Data Audit (Day 1-2)**
- Export existing customer data from all current systems
- Run duplicate detection and missing field analysis
- Establish your data quality baseline score (target: 85%+)

**Phase 2: Integration Setup (Day 3-5)**
1. Connect Shopify for real-time order and customer sync
2. Link your POS system for offline transaction data
3. Import loyalty platform members with point balances

**Phase 3: Validation (Day 6-7)**
- Run duplicate detection scan and merge profiles
- Verify phone number formats (+91 standard for WhatsApp)
- Confirm all 4 core segments populate correctly

**Expected Outcome:** 95%+ data completeness within 7 days ✅

**Next Step:** Start with the Data Quality page to see your current baseline score.`;
  } else if (m.includes('campaign') || m.includes('perform') || m.includes('underperform')) {
    response = `## Campaign Performance Analysis 📊

With **${context.campaignCount} campaigns** in your system, here are the key performance levers to optimize:

**Most Common Underperformance Causes:**
1. **Wrong channel selection** — Email for audiences that primarily use WhatsApp
2. **Suboptimal timing** — Sending outside 9-11AM or 6-9PM peak windows
3. **Segment too broad** — Targeting all ${context.customerCount} customers vs. behavioral micro-segments
4. **Generic messaging** — Missing personalization tokens (\`{customerName}\`, past purchase refs)

**Immediate Fixes (implement today):**
- A/B test WhatsApp vs Email on your next campaign
- Narrow target segment to customers with 2+ orders in last 90 days
- Add \`{customerName}\` and product reference personalization

**Expected improvement:** 40-60% higher open rates, 25% better conversion 🎯

**Next Step:** Go to Campaigns → select your last campaign → review segment size and channel choice.`;
  } else if (m.includes('segment') || m.includes('target') || m.includes('audience')) {
    response = `## Segmentation Strategy 🎯

For your **${context.customerCount} customer base**, I recommend building these 4 priority segments:

**1. Champions (~15% of base)**
- Filter: Spend > ₹15,000 AND orders > 5 AND active < 30 days
- Strategy: VIP early access, loyalty tier rewards
- Expected size: ~${Math.round(context.customerCount * 0.15)} customers

**2. At-Risk High-Value (~12%)**
- Filter: Spend > ₹10,000 AND inactive > 60 days
- Strategy: Immediate win-back with 20% exclusive discount
- Expected size: ~${Math.round(context.customerCount * 0.12)} customers

**3. Promising New (~20%)**
- Filter: First order < 30 days ago
- Strategy: 3-touch nurture series to drive second purchase
- Expected size: ~${Math.round(context.customerCount * 0.20)} customers

**4. Loyal Mid-Tier (~25%)**
- Filter: Orders 3-7 AND growing spend trend
- Strategy: Upgrade path toward Champions tier
- Expected size: ~${Math.round(context.customerCount * 0.25)} customers

**Next Step:** Go to AI Segments → click "Build AI Segment" → paste this query: *"customers with total spend over ₹10,000 inactive for 60 days"*`;
  } else if (m.includes('retention') || m.includes('churn')) {
    response = `## Retention & Churn Prevention Strategy 🛡️

Based on your platform data (${context.customerCount} customers, ${context.campaignCount} campaigns), here's a proven retention framework:

**3-Tier Retention Approach:**

**Tier 1: Early Warning (30-60 days inactive)**
- Trigger: Automated "We miss you" WhatsApp with personalized product recommendation
- Offer: 10% discount on next purchase
- Expected recovery: 25-35% reactivation

**Tier 2: At-Risk (60-90 days inactive)**
- Trigger: "Exclusive comeback offer" Email + WhatsApp sequence
- Offer: 15% discount + free shipping
- Expected recovery: 15-20% reactivation

**Tier 3: Critical (90+ days inactive)**
- Trigger: "Final offer before we lose touch" campaign
- Offer: 20% discount + loyalty bonus points
- Expected recovery: 8-12% reactivation

**Lifetime Value Protection:**
Customers who engage with win-back campaigns spend on average 2.4x more in the following 6 months 📈

**Next Step:** Go to Workflow Builder → create a "Churn Prevention" workflow with "Customer Inactive" trigger.`;
  } else {
    response = `## FDE Implementation Assistant 🚀

Hi! I'm your dedicated Forward Deployed Engineer from XenoReach AI. I have full context of your platform:

| Metric | Value |
|--------|-------|
| Active Customers | ${context.customerCount} |
| Campaigns Created | ${context.campaignCount} |
| Segments Built | ${context.segmentCount} |
| Revenue Tracked | ₹${(context.totalRevenue || 0).toLocaleString()} |

**How I can help you today:**

📊 **Data & Integrations**
- Onboarding customer data from multiple sources
- Integration setup (Shopify, POS, WhatsApp)
- Data quality improvement strategies

🎯 **Segmentation & Targeting**
- Building high-impact segments
- AI-powered audience recommendations
- Behavioral trigger configuration

📧 **Campaign Optimization**
- Diagnosing underperforming campaigns
- Channel selection for Indian retail
- A/B testing strategies

🔄 **Workflow Automation**
- Setting up win-back flows
- VIP upgrade automation
- Churn prevention triggers

**Try asking me:**
- *"Why are my campaigns underperforming?"*
- *"Which customers should I target first?"*
- *"How do I set up a win-back workflow?"*`;
  }

  return { response, history: [...(history || []), { role: 'user', content: message }, { role: 'model', content: response }] };
};

module.exports = {
  generateSegment,
  generateCampaign,
  generateCustomerInsights,
  copilotChat,
  generateExecutiveInsights,
  generateSolutionRecommendations,
  generateDataQualityFixes,
  generateImplementationAdvice,
};
