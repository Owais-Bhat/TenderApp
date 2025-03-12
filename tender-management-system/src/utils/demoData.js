import { formatISO, addDays, addHours } from 'date-fns';

// Simple ID generator function
const generateId = (prefix) => {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}-${Date.now()}`;
};

// Demo user accounts
export const demoUsers = [
  {
    id: 'admin-1',
    name: 'Admin User',
    email: 'admin@demo.com',
    password: 'admin123',
    companyName: 'System Admin Inc.',
    role: 'admin',
    isAdmin: true,
    phone: '+1 (555) 123-4567',
    company: 'System Admin Inc.',
    createdAt: formatISO(new Date())
  },
  {
    id: 'user-1',
    name: 'Demo User',
    email: 'user@demo.com',
    password: 'user123',
    companyName: 'Demo Company',
    role: 'user',
    isAdmin: false,
    phone: '+1 (555) 987-6543',
    company: 'Demo Company',
    createdAt: formatISO(new Date())
  }
];

// Categories for tenders
const tenderCategories = [
  'Construction',
  'IT Services',
  'Healthcare',
  'Education',
  'Transportation',
  'Food & Beverages',
  'Consulting',
  'Energy',
  'Manufacturing',
  'Telecommunications'
];

// Locations
const locations = [
  'New York, NY',
  'Los Angeles, CA',
  'Chicago, IL',
  'Houston, TX',
  'Phoenix, AZ',
  'Philadelphia, PA',
  'San Antonio, TX',
  'San Diego, CA',
  'Dallas, TX',
  'San Jose, CA'
];

// Generate a random date in the future (1-30 days)
const getRandomFutureDate = (minDays = 1, maxDays = 30) => {
  const randomDays = Math.floor(Math.random() * (maxDays - minDays + 1)) + minDays;
  return addDays(new Date(), randomDays);
};

// Generate a random date range (start and end)
const getRandomDateRange = () => {
  const startDate = getRandomFutureDate(1, 7);
  const endDate = addDays(startDate, Math.floor(Math.random() * 14) + 7);
  return { startDate, endDate };
};

// Generate a random budget range
const getRandomBudget = () => {
  const min = Math.floor(Math.random() * 50000) + 10000;
  const max = min + Math.floor(Math.random() * 200000) + 50000;
  return { minBudget: min, maxBudget: max };
};

// Generate random requirements
const getRandomRequirements = () => {
  const requirements = [
    'Minimum 5 years of experience in the field',
    'Certified professionals required',
    'Must have completed at least 3 similar projects',
    'ISO 9001 certification required',
    'Local presence preferred',
    'Ability to start immediately',
    'References from previous clients required',
    'Compliance with industry standards',
    'Availability for weekly progress meetings',
    'Detailed project timeline required with proposal'
  ];
  
  const count = Math.floor(Math.random() * 5) + 3; // 3-7 requirements
  const selected = [];
  
  for (let i = 0; i < count; i++) {
    const randomIndex = Math.floor(Math.random() * requirements.length);
    selected.push(requirements[randomIndex]);
    requirements.splice(randomIndex, 1); // Remove selected requirement
  }
  
  return selected;
};

// Generate a list of demo tenders
export const generateDemoTenders = (count = 20) => {
  const tenders = [];
  const now = new Date();
  
  for (let i = 1; i <= count; i++) {
    const { startDate, endDate } = getRandomDateRange();
    const { minBudget, maxBudget } = getRandomBudget();
    const category = tenderCategories[Math.floor(Math.random() * tenderCategories.length)];
    const location = locations[Math.floor(Math.random() * locations.length)];
    const requirements = getRandomRequirements();
    
    // Some tenders will be active, some will be ending soon for testing
    let statusOptions = ['active'];
    if (i % 5 === 0) { // Every 5th tender will be ending soon
      statusOptions = ['ending_soon'];
    }
    if (i % 7 === 0) { // Every 7th tender will be completed
      statusOptions = ['completed'];
    }
    
    const status = statusOptions[Math.floor(Math.random() * statusOptions.length)];
    
    // Create tender object
    const tender = {
      id: generateId('tender'),
      name: `${category} Project ${i}`,
      description: `This is a demo tender for ${category} services in ${location}. The project involves providing high-quality services within the specified timeframe and budget.`,
      category,
      location,
      minBudget,
      maxBudget,
      requirements,
      startTime: formatISO(startDate),
      endTime: formatISO(endDate),
      createdBy: 'admin-1', // Admin created all demo tenders
      createdAt: formatISO(now),
      status: status === 'completed' ? 'completed' : 'active',
      completed: status === 'completed',
      cancelled: false,
      notificationSent: false,
      documents: [],
      bidCount: Math.floor(Math.random() * 8)
    };
    
    tenders.push(tender);
  }
  
  return tenders;
};

// Generate demo bids for tenders
export const generateDemoBids = (tenders) => {
  const bids = [];
  const now = new Date();
  
  tenders.forEach(tender => {
    // Skip generating bids for some tenders
    if (Math.random() > 0.7) return;
    
    const bidCount = Math.floor(Math.random() * 5) + 1; // 1-5 bids per tender
    
    for (let i = 0; i < bidCount; i++) {
      const bidAmount = tender.minBudget + Math.floor(Math.random() * (tender.maxBudget - tender.minBudget));
      const timeframe = Math.floor(Math.random() * 90) + 30; // 30-120 days
      
      const bid = {
        id: generateId('bid'),
        tenderId: tender.id,
        bidderId: 'user-1', // Demo user is the bidder
        bidderName: 'Demo User',
        bidderCompany: 'Demo Company',
        amount: bidAmount,
        timeframe,
        proposal: `We offer our services for this project with a proposed timeframe of ${timeframe} days and a competitive price of $${bidAmount.toLocaleString()}.`,
        status: tender.completed ? 'accepted' : 'pending',
        createdAt: formatISO(addHours(now, -Math.floor(Math.random() * 72)))
      };
      
      bids.push(bid);
    }
  });
  
  return bids;
};

// Initialize demo data
export const initializeDemoData = async (AsyncStorage) => {
  try {
    // Check if demo data already exists
    const users = await AsyncStorage.getItem('users');
    const tenders = await AsyncStorage.getItem('tenders');
    
    if (!users) {
      await AsyncStorage.setItem('users', JSON.stringify(demoUsers));
      console.log('Demo users initialized');
    }
    
    if (!tenders) {
      const demoTenders = generateDemoTenders(20);
      await AsyncStorage.setItem('tenders', JSON.stringify(demoTenders));
      
      // Generate and save demo bids
      const demoBids = generateDemoBids(demoTenders);
      await AsyncStorage.setItem('bids', JSON.stringify(demoBids));
      
      console.log('Demo tenders and bids initialized');
    }
    
    return true;
  } catch (error) {
    console.error('Error initializing demo data:', error);
    return false;
  }
}; 