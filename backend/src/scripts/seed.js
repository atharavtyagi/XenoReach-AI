/**
 * XenoReach AI — Seed Script
 * Generates realistic mock retail data for demonstration
 */
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const { User, Customer, Order, Segment, Campaign, Communication } = require('../models');
const bcrypt = require('bcryptjs');

const INDIAN_NAMES = [
  'Arjun Sharma', 'Priya Patel', 'Rohit Kumar', 'Anita Singh', 'Vijay Mehta',
  'Sunita Gupta', 'Rahul Joshi', 'Pooja Agarwal', 'Amit Verma', 'Kavita Nair',
  'Suresh Reddy', 'Deepika Chandra', 'Manoj Trivedi', 'Sneha Pillai', 'Rajesh Iyer',
  'Meera Bose', 'Akash Malhotra', 'Divya Kapoor', 'Sanjay Rao', 'Lakshmi Krishnan',
  'Vishal Pandey', 'Neha Saxena', 'Gaurav Mishra', 'Ritu Bhatt', 'Nikhil Desai',
  'Asha Mukherjee', 'Kiran Srivastava', 'Mohan Thakur', 'Rekha Dubey', 'Farhan Sheikh',
  'Zara Khan', 'Aditya Bansal', 'Pallavi Jain', 'Tushar Shah', 'Shruti Doshi',
  'Vikram Singh', 'Nandini Roy', 'Kartik Arora', 'Swati Gupta', 'Harsh Vardhan',
  'Tanvi Mehrotra', 'Rohan Bajaj', 'Preeti Yadav', 'Sandeep Chauhan', 'Alka Tiwari',
  'Deepak Chaudhary', 'Renu Shukla', 'Vivek Pandey', 'Mamta Soni', 'Chetan Shah',
  'Shalini Aggarwal', 'Ankur Rastogi', 'Bhavna Desai', 'Manish Goyal', 'Usha Verma',
  'Shailesh Nair', 'Vandana Misra', 'Girish Menon', 'Pratima Pillai', 'Hemant Sinha',
  'Geeta Rawat', 'Sunil Choudhury', 'Rashmi Patil', 'Arun Kulkarni', 'Kamla Hebbar',
  'Ranjit Sawant', 'Lata Naik', 'Shankar Pawar', 'Shobha Rane', 'Yash Gaikwad',
  'Mina Tambe', 'Omkar Kulkarni', 'Vaishali Mane', 'Sachin Jadhav', 'Ruchira Bapat',
  'Ninad Deshpande', 'Ashwini Joshi', 'Vinayak Patil', 'Sudha Gosavi', 'Milind Kulkarni',
  'Sayali Deshmukh', 'Devendra Waghmare', 'Smita Thakare', 'Prasad Kale', 'Madhuri Pawar',
  'Abhijit Chavan', 'Archana Shinde', 'Santosh Gawde', 'Ujjwala Mhatre', 'Dattatray Kadam',
  'Varsha Raut', 'Sudhir Nimbalkar', 'Rupali Bhosale', 'Ganesh Patil', 'Seema Sonawane',
  'Aarav Shah', 'Ananya Reddy', 'Ishaan Khanna', 'Diya Nair', 'Vihaan Singh',
  'Saanvi Patel', 'Reyansh Kumar', 'Pari Sharma', 'Vivaan Joshi', 'Aanya Gupta',
  'Kabir Malhotra', 'Myra Kapoor', 'Shaurya Mehta', 'Aria Agarwal', 'Aditya Verma',
  'Avni Reddy', 'Aryan Iyer', 'Kiara Bose', 'Dhruv Pillai', 'Navya Krishnan',
  'Krish Trivedi', 'Eva Pandey', 'Ahaan Chandra', 'Zoe Desai', 'Rudra Saxena',
  'Sia Mishra', 'Aadit Thakur', 'Nila Bhatt', 'Yuvan Rao', 'Tara Srivastava',
];

const CITIES = [
  { name: 'Mumbai', state: 'Maharashtra' },
  { name: 'Delhi', state: 'Delhi' },
  { name: 'Bangalore', state: 'Karnataka' },
  { name: 'Chennai', state: 'Tamil Nadu' },
  { name: 'Hyderabad', state: 'Telangana' },
  { name: 'Kolkata', state: 'West Bengal' },
  { name: 'Pune', state: 'Maharashtra' },
  { name: 'Ahmedabad', state: 'Gujarat' },
  { name: 'Jaipur', state: 'Rajasthan' },
  { name: 'Lucknow', state: 'Uttar Pradesh' },
  { name: 'Surat', state: 'Gujarat' },
  { name: 'Kochi', state: 'Kerala' },
];

const PRODUCT_CATEGORIES = ['Clothing', 'Electronics', 'Home & Kitchen', 'Beauty', 'Sports', 'Books', 'Footwear', 'Jewellery'];

const PRODUCTS = {
  Clothing: ['Ethnic Kurti', 'Formal Shirt', 'Denim Jeans', 'Saree', 'T-Shirt', 'Kurta Set'],
  Electronics: ['Bluetooth Earbuds', 'Phone Case', 'Power Bank', 'Smart Watch', 'Tablet Stand'],
  'Home & Kitchen': ['Air Fryer', 'Coffee Maker', 'Bed Sheets', 'Cushion Cover', 'Wall Clock'],
  Beauty: ['Skincare Kit', 'Perfume', 'Lipstick Set', 'Face Serum', 'Hair Mask'],
  Sports: ['Yoga Mat', 'Running Shoes', 'Gym Gloves', 'Water Bottle', 'Resistance Bands'],
  Books: ['Self-Help Guide', 'Fiction Novel', 'Cookbook', 'Business Book', 'Children Story'],
  Footwear: ['Formal Shoes', 'Sneakers', 'Sandals', 'Heels', 'Loafers'],
  Jewellery: ['Gold Earrings', 'Silver Necklace', 'Bracelet Set', 'Ring', 'Anklet'],
};

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randFloat = (min, max) => parseFloat((Math.random() * (max - min) + min).toFixed(2));
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randDate = (daysAgo) => new Date(Date.now() - rand(0, daysAgo) * 24 * 60 * 60 * 1000);

const generateEmail = (name) => {
  const parts = name.toLowerCase().split(' ');
  const domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'rediffmail.com'];
  return `${parts[0]}.${parts[1]}${rand(1, 99)}@${pick(domains)}`;
};

const generatePhone = () => {
  const prefixes = ['98', '97', '96', '95', '94', '93', '92', '91', '90', '89', '88', '87', '86', '85'];
  return `+91 ${pick(prefixes)}${rand(10000000, 99999999)}`;
};

const seedDatabase = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/xenoreach');
    console.log('✅ Connected');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Customer.deleteMany({}),
      Order.deleteMany({}),
      Segment.deleteMany({}),
      Campaign.deleteMany({}),
      Communication.deleteMany({}),
    ]);
    console.log('🗑️  Cleared existing data');

    // Create demo user
    const passwordHash = await bcrypt.hash('demo123', 12);
    const adminUser = await User.create({
      name: 'Demo Marketer',
      email: 'demo@xenoreach.ai',
      passwordHash,
      role: 'admin',
      company: 'XenoReach Demo Store',
    });
    console.log('👤 Demo user created: demo@xenoreach.ai / demo123');

    // Generate customers
    console.log('👥 Generating 150 customers...');
    const customers = [];
    const usedEmails = new Set();

    for (let i = 0; i < 150; i++) {
      const name = pick(INDIAN_NAMES);
      const city = pick(CITIES);
      const orderCount = rand(0, 25);
      const avgOrderVal = rand(500, 8000);
      const totalSpend = orderCount * avgOrderVal;
      const lastOrderDaysAgo = orderCount > 0 ? rand(1, 365) : null;
      const firstOrderDaysAgo = lastOrderDaysAgo ? lastOrderDaysAgo + rand(30, 365) : null;

      let email;
      let attempts = 0;
      do {
        email = generateEmail(name) + (attempts > 0 ? attempts : '');
        attempts++;
      } while (usedEmails.has(email) && attempts < 100);
      usedEmails.add(email);

      const tags = [];
      if (totalSpend > 20000) tags.push('premium');
      if (totalSpend > 50000) tags.push('vip');
      if (orderCount === 0) tags.push('never-purchased');
      if (lastOrderDaysAgo && lastOrderDaysAgo > 120) tags.push('at-risk');
      if (lastOrderDaysAgo && lastOrderDaysAgo < 30) tags.push('active');
      if (orderCount > 10) tags.push('loyal');

      customers.push({
        name,
        email,
        phone: generatePhone(),
        city: city.name,
        state: city.state,
        country: 'India',
        gender: Math.random() > 0.5 ? 'Female' : 'Male',
        age: rand(18, 65),
        tags,
        totalSpend,
        orderCount,
        avgOrderValue: orderCount > 0 ? avgOrderVal : 0,
        lastOrderDate: lastOrderDaysAgo ? randDate(lastOrderDaysAgo) : null,
        firstOrderDate: firstOrderDaysAgo ? randDate(firstOrderDaysAgo) : null,
        preferredChannel: pick(['Email', 'SMS', 'WhatsApp', 'Push']),
        dataQualityScore: rand(70, 100),
        source: 'seed',
        isActive: true,
      });
    }

    const savedCustomers = await Customer.insertMany(customers);
    console.log(`✅ ${savedCustomers.length} customers created`);


    // Generate orders
    console.log('📦 Generating orders...');
    const orders = [];
    for (const customer of savedCustomers) {
      const orderCount = customer.orderCount;
      for (let j = 0; j < orderCount; j++) {
        const category = pick(PRODUCT_CATEGORIES);
        const products = PRODUCTS[category];
        const itemCount = rand(1, 4);
        const items = [];
        for (let k = 0; k < itemCount; k++) {
          items.push({
            name: pick(products),
            quantity: rand(1, 3),
            price: rand(200, 3000),
            category,
          });
        }
        const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

        orders.push({
          customerId: customer._id,
          orderNumber: `ORD-${Date.now()}-${Math.floor(Math.random() * 999999)}`,
          items,
          totalAmount,
          status: pick(['delivered', 'delivered', 'delivered', 'shipped', 'processing', 'cancelled']),
          channel: pick(['Online', 'Online', 'App', 'In-Store', 'Phone']),
          city: customer.city,
          createdAt: customer.lastOrderDate ? new Date(customer.lastOrderDate.getTime() - j * 30 * 24 * 60 * 60 * 1000) : new Date(),
        });
      }
    }

    await Order.insertMany(orders);
    console.log(`✅ ${orders.length} orders created`);

    // Create segments
    console.log('🎯 Creating segments...');
    const premiumCustomers = savedCustomers.filter(c => c.totalSpend > 15000);
    const inactiveCustomers = savedCustomers.filter(c => {
      if (!c.lastOrderDate) return false;
      const days = (Date.now() - new Date(c.lastOrderDate)) / (1000 * 60 * 60 * 24);
      return days > 90;
    });
    const newCustomers = savedCustomers.filter(c => {
      if (!c.lastOrderDate) return false;
      const days = (Date.now() - new Date(c.lastOrderDate)) / (1000 * 60 * 60 * 24);
      return days < 30;
    });

    const segments = await Segment.insertMany([
      {
        name: 'Premium VIP Customers',
        description: 'High-value customers with ₹15,000+ lifetime spend',
        filters: { minSpend: 15000 },
        naturalLanguageQuery: 'customers who spent more than ₹15,000',
        customerIds: premiumCustomers.map(c => c._id),
        customerCount: premiumCustomers.length,
        estimatedRevenue: premiumCustomers.reduce((s, c) => s + c.totalSpend, 0),
        avgSpend: premiumCustomers.length > 0 ? Math.round(premiumCustomers.reduce((s, c) => s + c.totalSpend, 0) / premiumCustomers.length) : 0,
        isAiGenerated: true,
        color: '#7C3AED',
        createdBy: adminUser._id,
      },
      {
        name: 'At-Risk Inactive Customers',
        description: 'Customers inactive for 90+ days — high churn risk',
        filters: { inactiveDays: 90 },
        naturalLanguageQuery: 'customers who have not ordered in 90 days',
        customerIds: inactiveCustomers.map(c => c._id),
        customerCount: inactiveCustomers.length,
        estimatedRevenue: inactiveCustomers.reduce((s, c) => s + c.totalSpend, 0),
        avgSpend: inactiveCustomers.length > 0 ? Math.round(inactiveCustomers.reduce((s, c) => s + c.totalSpend, 0) / inactiveCustomers.length) : 0,
        isAiGenerated: true,
        color: '#EF4444',
        createdBy: adminUser._id,
      },
      {
        name: 'Recent Active Shoppers',
        description: 'Customers who purchased within the last 30 days',
        filters: { lastActiveDays: 30 },
        naturalLanguageQuery: 'customers who ordered in the last 30 days',
        customerIds: newCustomers.map(c => c._id),
        customerCount: newCustomers.length,
        estimatedRevenue: newCustomers.reduce((s, c) => s + c.totalSpend, 0),
        avgSpend: newCustomers.length > 0 ? Math.round(newCustomers.reduce((s, c) => s + c.totalSpend, 0) / newCustomers.length) : 0,
        isAiGenerated: false,
        color: '#10B981',
        createdBy: adminUser._id,
      },
    ]);
    console.log(`✅ ${segments.length} segments created`);

    // Create campaigns with realistic analytics
    console.log('📧 Creating campaigns...');
    const campaignDefs = [
      {
        name: 'Diwali Mega Sale 2024',
        channel: 'Email',
        segmentIndex: 0,
        deliveryRate: 0.89, openRate: 0.42, clickRate: 0.28, conversionRate: 0.12,
        revenue: 145000, daysAgo: 45, status: 'completed',
      },
      {
        name: 'Win-Back Inactive Customers',
        channel: 'WhatsApp',
        segmentIndex: 1,
        deliveryRate: 0.94, openRate: 0.61, clickRate: 0.38, conversionRate: 0.18,
        revenue: 89500, daysAgo: 20, status: 'completed',
      },
      {
        name: 'Summer Collection Launch',
        channel: 'Email',
        segmentIndex: 2,
        deliveryRate: 0.91, openRate: 0.35, clickRate: 0.22, conversionRate: 0.09,
        revenue: 67800, daysAgo: 10, status: 'completed',
      },
      {
        name: 'VIP Early Access - New Arrivals',
        channel: 'Push',
        segmentIndex: 0,
        deliveryRate: 0.96, openRate: 0.55, clickRate: 0.41, conversionRate: 0.22,
        revenue: 234500, daysAgo: 5, status: 'completed',
      },
      {
        name: 'Monsoon Flash Sale',
        channel: 'SMS',
        segmentIndex: 2,
        deliveryRate: 0.87, openRate: 0.48, clickRate: 0.31, conversionRate: 0.14,
        revenue: 52300, daysAgo: 3, status: 'running',
      },
    ];

    for (const def of campaignDefs) {
      const segment = segments[def.segmentIndex];
      const sent = segment.customerCount;
      const delivered = Math.round(sent * def.deliveryRate);
      const opened = Math.round(delivered * def.openRate);
      const clicked = Math.round(opened * def.clickRate);
      const converted = Math.round(clicked * def.conversionRate);

      await Campaign.create({
        name: def.name,
        description: `AI-powered ${def.channel} campaign targeting ${segment.name}`,
        segmentId: segment._id,
        segmentName: segment.name,
        channel: def.channel,
        message: `Hi {customerName}! Check out our amazing ${def.name} offer. Exclusive deals await you! Shop now and save big with code XENO25. Valid for 48 hours only. 🎉`,
        subject: `${def.name} — Exclusive Offer Just For You!`,
        goal: 'Drive revenue and re-engagement',
        audienceSize: sent,
        status: def.status,
        isAiGenerated: true,
        createdBy: adminUser._id,
        launchedAt: new Date(Date.now() - def.daysAgo * 24 * 60 * 60 * 1000),
        completedAt: def.status === 'completed' ? new Date(Date.now() - (def.daysAgo - 1) * 24 * 60 * 60 * 1000) : null,
        stats: { sent, delivered, failed: sent - delivered, opened, read: Math.round(opened * 0.7), clicked, converted, revenue: def.revenue },
      });
    }
    console.log(`✅ ${campaignDefs.length} campaigns created`);

    console.log('\n🎉 Seed complete! Summary:');
    console.log(`   👤 Demo Login: demo@xenoreach.ai / demo123`);
    console.log(`   👥 Customers: 200`);
    console.log(`   📦 Orders: ${orders.length}`);
    console.log(`   🎯 Segments: ${segments.length}`);
    console.log(`   📧 Campaigns: ${campaignDefs.length}`);
    console.log('\n✨ XenoReach AI is ready!');

    if (require.main === module) process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err);
    if (require.main === module) process.exit(1);
    throw err;
  }
};

// Export for auto-seed and run directly
if (require.main === module) {
  seedDatabase();
} else {
  module.exports = seedDatabase;
}
