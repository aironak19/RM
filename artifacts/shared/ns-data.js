/* ==========================================================================
   Northstar Labs · ns-data.js
   One coherent, deterministic, FICTIONAL organisation shared by every tool
   in the family. ~1,040 people, 10 departments, 12 locations, 3 regions.
   Requires ns.js (NS.rng, NS.util).  Exposes window.NSData.
   --------------------------------------------------------------------------
   NSData.company · .locations · .regions · .departments · .levels · .levelMap
   NSData.people (array) · .byId(id) · .reports(id) · .allReports(id) · .chain(id)
   NSData.managers · .teams · .team(name) · .dept(name) · .personas
   NSData.series (attrition, headcount, enps, hiresExits, engagement)
   NSData.cycle (FY26 review cycle) · .competencies · .values · .ratingScale
   NSData.risk (bands, weights) · .skills · .summary()
   ========================================================================== */
(function () {
  'use strict';
  const U = NS.util;
  const rng = NS.rng(20260924);
  const R = () => rng();
  const pick = (a) => a[Math.floor(R() * a.length)];
  const between = (a, b) => a + R() * (b - a);
  const gauss = () => NS.gauss(rng);
  const chance = (p) => R() < p;

  /* ---------- company ---------- */
  const company = { name: 'Northstar Labs', legal: 'Northstar Labs, Inc.', tagline: 'Cloud data platform for modern product teams', founded: 2014, hq: 'Austin, TX', domain: 'northstarlabs.example', fy: 'FY26', fyStart: '2026-01-01', currency: 'USD' };

  const regions = { NA: 'North America', EU: 'Europe', APAC: 'Asia-Pacific' };
  const locations = [
    { id: 'MUM', city: 'Mumbai', country: 'India', region: 'APAC', tier: 0.34, tz: 'IST', note: 'India HQ' },
    { id: 'BLR', city: 'Bengaluru', country: 'India', region: 'APAC', tier: 0.34, tz: 'IST' },
    { id: 'PUN', city: 'Pune', country: 'India', region: 'APAC', tier: 0.31, tz: 'IST' },
    { id: 'AUS', city: 'Austin', country: 'United States', region: 'NA', tier: 1.0, tz: 'CT', note: 'Global HQ' },
    { id: 'SJC', city: 'San Jose', country: 'United States', region: 'NA', tier: 1.18, tz: 'PT' },
    { id: 'NYC', city: 'New York', country: 'United States', region: 'NA', tier: 1.15, tz: 'ET' },
    { id: 'TOR', city: 'Toronto', country: 'Canada', region: 'NA', tier: 0.78, tz: 'ET' },
    { id: 'LON', city: 'London', country: 'United Kingdom', region: 'EU', tier: 0.86, tz: 'GMT' },
    { id: 'BER', city: 'Berlin', country: 'Germany', region: 'EU', tier: 0.74, tz: 'CET' },
    { id: 'AMS', city: 'Amsterdam', country: 'Netherlands', region: 'EU', tier: 0.78, tz: 'CET' },
    { id: 'SIN', city: 'Singapore', country: 'Singapore', region: 'APAC', tier: 0.72, tz: 'SGT' },
    { id: 'SYD', city: 'Sydney', country: 'Australia', region: 'APAC', tier: 0.83, tz: 'AEST' },
  ];
  const locMap = Object.fromEntries(locations.map((l) => [l.id, l]));

  /* ---------- levels (aligned with the Engineering Competency Framework) ---------- */
  const levels = [
    { code: 'P0', title: 'Intern', short: 'Intern', track: 'IC', order: 0, mid: 58000 },
    { code: 'P1', title: 'Associate Engineer', short: 'Associate', track: 'IC', order: 1, mid: 96000 },
    { code: 'P2', title: 'Software Engineer', short: 'Engineer', track: 'IC', order: 2, mid: 128000 },
    { code: 'P3', title: 'Senior Software Engineer', short: 'Senior', track: 'IC', order: 3, mid: 162000 },
    { code: 'P4', title: 'Principal Engineer', short: 'Principal', track: 'IC', order: 4, mid: 202000 },
    { code: 'P4.5', title: 'Tech Lead', short: 'Tech Lead', track: 'IC', order: 4.5, mid: 216000 },
    { code: 'P5', title: 'Technical Architect', short: 'Architect', track: 'IC', order: 5, mid: 242000 },
    { code: 'P5.5', title: 'Fellow', short: 'Fellow', track: 'IC', order: 5.5, mid: 278000 },
    { code: 'P6', title: 'Senior Fellow', short: 'Sr Fellow', track: 'IC', order: 6, mid: 325000 },
    { code: 'M1', title: 'Team Lead', short: 'Team Lead', track: 'M', order: 3.5, mid: 172000 },
    { code: 'M2', title: 'Associate Engineering Manager', short: 'Assoc. Manager', track: 'M', order: 4, mid: 192000 },
    { code: 'M3', title: 'Engineering Manager', short: 'Manager', track: 'M', order: 4.5, mid: 218000 },
    { code: 'M4', title: 'Senior Engineering Manager', short: 'Sr Manager', track: 'M', order: 5, mid: 248000 },
    { code: 'M4.5', title: 'Associate Director', short: 'Assoc. Director', track: 'M', order: 5.5, mid: 272000 },
    { code: 'M5', title: 'Director', short: 'Director', track: 'M', order: 6, mid: 305000 },
    { code: 'M6', title: 'Senior Director', short: 'Sr Director', track: 'M', order: 6.5, mid: 345000 },
    { code: 'E1', title: 'Vice President', short: 'VP', track: 'E', order: 7, mid: 410000 },
    { code: 'E2', title: 'Chief Officer', short: 'C-level', track: 'E', order: 8, mid: 520000 },
  ];
  const levelMap = Object.fromEntries(levels.map((l) => [l.code, l]));
  // Non-engineering functions reuse the P/M ladder with function-specific titles.
  const titleFor = (level, dept, team) => {
    const L = levelMap[level];
    if (dept === 'Engineering' || dept === 'IT & Workplace') { if (dept === 'IT & Workplace' && L.track === 'IC') return { P1: 'IT Support Analyst', P2: 'IT Engineer', P3: 'Senior IT Engineer', P4: 'Principal IT Engineer' }[level] || L.title; return L.title; }
    const ic = {
      Product: { P1: 'Associate Product Manager', P2: 'Product Manager', P3: 'Senior Product Manager', P4: 'Principal Product Manager', P5: 'Group Product Manager' },
      Design: { P1: 'Associate Designer', P2: 'Product Designer', P3: 'Senior Product Designer', P4: 'Staff Designer', P5: 'Principal Designer' },
      People: { P1: 'People Coordinator', P2: 'People Specialist', P3: 'Senior People Partner', P4: 'Lead People Partner', P5: 'Principal People Partner' },
      Finance: { P1: 'Financial Analyst', P2: 'Senior Analyst', P3: 'Finance Manager', P4: 'Senior Finance Manager', P5: 'Finance Lead' },
      Sales: { P1: 'Sales Development Rep', P2: 'Account Executive', P3: 'Senior Account Executive', P4: 'Enterprise Account Executive', P5: 'Strategic Account Director' },
      'Customer Success': { P1: 'Support Specialist', P2: 'Customer Success Manager', P3: 'Senior CSM', P4: 'Principal CSM', P5: 'Solutions Architect' },
      Marketing: { P1: 'Marketing Associate', P2: 'Marketing Manager', P3: 'Senior Marketing Manager', P4: 'Principal Marketer', P5: 'Marketing Lead' },
      'Legal & Compliance': { P1: 'Legal Coordinator', P2: 'Legal Counsel', P3: 'Senior Counsel', P4: 'Associate General Counsel', P5: 'Deputy General Counsel' },
    }[dept] || {};
    if (L.track === 'IC') { if (team === 'Talent Acquisition') return { P1: 'Sourcing Specialist', P2: 'Technical Recruiter', P3: 'Senior Technical Recruiter', P4: 'Lead Recruiter' }[level] || L.title; return ic[level] || L.title; }
    if (L.track === 'M') { const n = dept === 'Customer Success' ? 'Customer Success' : dept === 'Legal & Compliance' ? 'Legal' : dept; return { M1: `${n} Team Lead`, M2: `${n} Manager`, M3: `${n} Manager`, M4: `Senior ${n} Manager`, 'M4.5': `Associate Director, ${n}`, M5: `Director, ${n}`, M6: `Senior Director, ${n}` }[level] || L.title; }
    return L.title;
  };
  const fnMult = { Engineering: 1, Product: 0.96, Design: 0.86, People: 0.7, Finance: 0.76, Sales: 0.8, 'Customer Success': 0.66, Marketing: 0.74, 'Legal & Compliance': 0.98, 'IT & Workplace': 0.7 };

  /* ---------- org structure ---------- */
  const SK = {
    backend: ['Go', 'Java', 'Kubernetes', 'gRPC', 'PostgreSQL', 'Kafka', 'Redis', 'AWS', 'Distributed systems', 'System design'],
    data: ['Python', 'Spark', 'Airflow', 'dbt', 'Snowflake', 'SQL', 'ML Ops', 'PyTorch', 'Feature stores', 'Data modelling'],
    frontend: ['TypeScript', 'React', 'Next.js', 'Design systems', 'Accessibility', 'Web performance', 'GraphQL', 'Testing Library'],
    mobile: ['Swift', 'Kotlin', 'SwiftUI', 'Jetpack Compose', 'Mobile CI', 'Offline sync'],
    infra: ['Terraform', 'Kubernetes', 'AWS', 'GCP', 'Observability', 'Incident response', 'SLOs', 'Linux', 'Networking'],
    security: ['AppSec', 'Threat modelling', 'IAM', 'SOC 2', 'Pen testing', 'Cloud security', 'Zero trust'],
    devex: ['Bazel', 'CI/CD', 'Developer tooling', 'Monorepos', 'Internal platforms'],
    qa: ['Test automation', 'Playwright', 'Performance testing', 'Release management'],
    product: ['Roadmapping', 'Discovery', 'Analytics', 'Pricing', 'PRDs', 'Experimentation'],
    design: ['Figma', 'Prototyping', 'UX research', 'Design systems', 'Motion', 'Accessibility'],
    people: ['HRBP', 'Org design', 'Talent management', 'Comp & benefits', 'HRIS', 'Employee relations', 'L&D design', 'People analytics'],
    ta: ['Sourcing', 'Structured interviewing', 'Offer negotiation', 'Employer brand', 'ATS admin'],
    finance: ['FP&A', 'Forecasting', 'GAAP', 'NetSuite', 'Procurement', 'SaaS metrics'],
    sales: ['Enterprise sales', 'MEDDIC', 'Negotiation', 'Territory planning', 'CRM hygiene', 'Demos'],
    cs: ['Onboarding', 'Renewals', 'Escalations', 'Health scoring', 'Technical support', 'Solutions'],
    marketing: ['Positioning', 'Demand gen', 'Content', 'SEO', 'Events', 'Marketing ops'],
    legal: ['Contracts', 'Privacy', 'GDPR', 'Employment law', 'Compliance'],
    it: ['Endpoint management', 'SSO/IdP', 'Helpdesk', 'Networking', 'Workplace tech'],
  };
  const departments = [
    { name: 'Engineering', head: 'CTO', vp: 'VP Engineering', women: 0.27, scale: 1.42, orgs: [
      { name: 'Platform', teams: [['API Gateway', 12, 'backend'], ['Identity & Access', 9, 'backend'], ['Billing Platform', 11, 'backend'], ['Workflow Engine', 11, 'backend'], ['Developer APIs', 10, 'backend']] },
      { name: 'Core Services', teams: [['Storage', 13, 'backend'], ['Search', 11, 'backend'], ['Messaging', 10, 'backend'], ['Compute', 12, 'backend'], ['Caching & Edge', 9, 'backend']] },
      { name: 'Data & ML', teams: [['Data Pipelines', 13, 'data'], ['Analytics Platform', 11, 'data'], ['ML Platform', 12, 'data'], ['Applied AI', 11, 'data'], ['Data Governance', 8, 'data'], ['Recommendations', 10, 'data']] },
      { name: 'Frontend', teams: [['Web App', 14, 'frontend'], ['Design Systems', 8, 'frontend'], ['Growth Engineering', 10, 'frontend'], ['Console', 11, 'frontend'], ['Onboarding Experience', 9, 'frontend']] },
      { name: 'Mobile', teams: [['iOS', 11, 'mobile'], ['Android', 11, 'mobile'], ['Mobile Platform', 8, 'mobile']] },
      { name: 'Infrastructure & SRE', teams: [['Cloud Infrastructure', 13, 'infra'], ['SRE', 12, 'infra'], ['Observability', 10, 'infra'], ['Release Engineering', 9, 'devex'], ['Database Reliability', 9, 'infra'], ['Cost Engineering', 7, 'infra']] },
      { name: 'Security', teams: [['Application Security', 10, 'security'], ['Security Operations', 9, 'security'], ['Identity Security', 8, 'security']] },
      { name: 'Developer Experience', teams: [['Developer Productivity', 11, 'devex'], ['Internal Tools', 10, 'devex'], ['Build & CI', 9, 'devex']] },
      { name: 'Quality Engineering', teams: [['QA Automation', 12, 'qa'], ['Performance & Reliability', 8, 'qa'], ['Test Infrastructure', 8, 'qa']] },
    ] },
    { name: 'Product', head: 'CPO', women: 0.46, orgs: [{ name: 'Product Management', teams: [['Core Product', 12, 'product'], ['Platform Product', 9, 'product'], ['Growth Product', 8, 'product']] }, { name: 'Product Operations', teams: [['Product Ops', 7, 'product'], ['Documentation', 8, 'product']] }] },
    { name: 'Design', head: 'CPO', women: 0.52, orgs: [{ name: 'Design', teams: [['Product Design', 18, 'design'], ['UX Research', 8, 'design'], ['Brand & Creative', 7, 'design']] }] },
    { name: 'People', head: 'CPeO', women: 0.68, orgs: [{ name: 'People', teams: [['People Partners', 7, 'people'], ['Talent Acquisition', 9, 'ta'], ['People Operations', 6, 'people'], ['Learning & Development', 4, 'people'], ['Total Rewards', 4, 'people']] }] },
    { name: 'Finance', head: 'CFO', women: 0.5, orgs: [{ name: 'Finance', teams: [['FP&A', 8, 'finance'], ['Accounting', 10, 'finance'], ['Procurement', 5, 'finance'], ['Revenue Operations', 7, 'finance']] }] },
    { name: 'Sales', head: 'CRO', women: 0.38, orgs: [{ name: 'Sales', teams: [['Enterprise Sales — NA', 20, 'sales'], ['Enterprise Sales — Europe', 15, 'sales'], ['Enterprise Sales — APAC', 13, 'sales'], ['Mid-Market Sales', 18, 'sales'], ['Sales Development', 22, 'sales'], ['Sales Engineering', 13, 'sales'], ['Partnerships', 8, 'sales']] }] },
    { name: 'Customer Success', head: 'CRO', women: 0.52, orgs: [{ name: 'Customer Success', teams: [['Customer Success Management', 20, 'cs'], ['Technical Support', 26, 'cs'], ['Solutions Architecture', 12, 'cs'], ['Customer Education', 6, 'cs'], ['Renewals', 8, 'cs']] }] },
    { name: 'Marketing', head: 'CMO', women: 0.58, orgs: [{ name: 'Marketing', teams: [['Product Marketing', 9, 'marketing'], ['Demand Generation', 10, 'marketing'], ['Content & Community', 8, 'marketing'], ['Events & Field', 6, 'marketing'], ['Marketing Operations', 5, 'marketing']] }] },
    { name: 'Legal & Compliance', head: 'GC', women: 0.55, orgs: [{ name: 'Legal', teams: [['Legal', 6, 'legal'], ['Privacy & Compliance', 5, 'legal']] }] },
    { name: 'IT & Workplace', head: 'CFO', women: 0.3, orgs: [{ name: 'IT & Workplace', teams: [['Corporate IT', 9, 'it'], ['Workplace Experience', 5, 'it']] }] },
  ];

  /* ---------- names ---------- */
  const NAMES = {
    IN: { F: ['Priya', 'Ananya', 'Kavya', 'Sneha', 'Meera', 'Neha', 'Divya', 'Pooja', 'Aishwarya', 'Shreya', 'Riya', 'Isha', 'Nandini', 'Tanvi', 'Aditi', 'Ritika', 'Swati', 'Anjali', 'Lakshmi', 'Deepika', 'Radhika', 'Sanjana', 'Bhavya', 'Kritika', 'Madhuri', 'Vidya', 'Sunita', 'Pallavi', 'Nisha', 'Gauri'], M: ['Arjun', 'Rohan', 'Vikram', 'Aditya', 'Karthik', 'Siddharth', 'Rahul', 'Nikhil', 'Varun', 'Manish', 'Amit', 'Rajesh', 'Suresh', 'Harish', 'Kiran', 'Pranav', 'Sanjay', 'Vivek', 'Abhishek', 'Anand', 'Deepak', 'Gaurav', 'Naveen', 'Rakesh', 'Sameer', 'Tarun', 'Yash', 'Akash', 'Dhruv', 'Ishaan'], L: ['Sharma', 'Iyer', 'Nair', 'Patel', 'Reddy', 'Menon', 'Kulkarni', 'Desai', 'Joshi', 'Rao', 'Banerjee', 'Chatterjee', 'Gupta', 'Singh', 'Verma', 'Pillai', 'Bhat', 'Krishnan', 'Malhotra', 'Shah', 'Raman', 'Srinivasan', 'Naidu', 'Kapoor', 'Chauhan', 'Mishra', 'Saxena', 'Bose', 'Dutta', 'Khanna', 'Sethi', 'Agarwal', 'Jain', 'Mukherjee', 'Choudhury', 'Venkatesh', 'Subramanian', 'Hegde', 'Shetty', 'Pandey'] },
    US: { F: ['Emily', 'Sarah', 'Jessica', 'Ashley', 'Olivia', 'Sophia', 'Ava', 'Grace', 'Chloe', 'Hannah', 'Madison', 'Lauren', 'Rachel', 'Megan', 'Natalie', 'Samantha', 'Victoria', 'Zoe', 'Lily', 'Abigail', 'Brianna', 'Kayla', 'Alexis', 'Maya', 'Nora', 'Isabella', 'Camila', 'Jasmine', 'Aaliyah', 'Nicole'], M: ['Michael', 'James', 'David', 'Daniel', 'Ethan', 'Noah', 'Liam', 'Marcus', 'Tyler', 'Brandon', 'Justin', 'Ryan', 'Kevin', 'Andrew', 'Joshua', 'Matthew', 'Nathan', 'Christopher', 'Jordan', 'Aaron', 'Caleb', 'Dylan', 'Evan', 'Isaac', 'Jason', 'Logan', 'Mason', 'Owen', 'Xavier', 'Zachary'], L: ['Johnson', 'Williams', 'Brown', 'Miller', 'Davis', 'Garcia', 'Rodriguez', 'Martinez', 'Anderson', 'Taylor', 'Thomas', 'Moore', 'Jackson', 'Lee', 'Nguyen', 'Kim', 'Okafor', 'Washington', 'Cohen', 'Rivera', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Clark', 'Lewis', 'Walker', 'Hall', 'Young', 'Allen', 'Wright', 'Scott', 'Torres', 'Hill', 'Adams', 'Nelson', 'Carter', 'Mitchell', 'Perez', 'Roberts', 'Campbell', 'Parker', 'Evans', 'Edwards', 'Collins', 'Reyes', 'Morgan', 'Bell', 'Murphy', 'Cooper'] },
    EU: { F: ['Sophie', 'Emma', 'Lena', 'Clara', 'Anna', 'Sanne', 'Amelia', 'Isla', 'Freya', 'Elena', 'Marta', 'Julia', 'Laura', 'Charlotte', 'Eva', 'Mia', 'Hanna', 'Ines', 'Nina', 'Alice', 'Chiara', 'Zoë', 'Luisa', 'Maja', 'Katrin', 'Elise', 'Fleur', 'Greta', 'Ida', 'Rosa'], M: ['Lukas', 'Jonas', 'Felix', 'Hugo', 'Mateo', 'Pieter', 'Oliver', 'Harry', 'Tomasz', 'Nikolaj', 'Leon', 'Max', 'Finn', 'Noah', 'Louis', 'Arthur', 'Sebastian', 'Jan', 'Bram', 'Daan', 'Thijs', 'Marco', 'Luca', 'Paul', 'Tobias', 'Jakob', 'Erik', 'Oscar', 'Victor', 'Sam'], L: ['Müller', 'Schmidt', 'Fischer', 'Weber', 'Dubois', 'Martin', 'Rossi', 'Bianchi', 'de Vries', 'Jansen', 'Smith', 'Jones', 'Taylor', 'Kowalski', 'Nowak', 'Andersen', 'Nielsen', 'Petrov', 'Ivanova', 'García', 'Lindqvist', 'Bakker', 'Visser', 'Meyer', 'Wagner', 'Becker', 'Hoffmann', 'Schulz', 'Koch', 'Richter', 'Laurent', 'Moreau', 'Lefèvre', 'Fontaine', 'Marchetti', 'Conti', 'Greco', 'Novak', 'Horvat', 'O’Connor', 'Murray', 'Hughes', 'Evans', 'Bennett', 'Whitaker', 'Hale', 'Dawson', 'Fletcher', 'Harding', 'Marsh'] },
    AP: { F: ['Wei', 'Mei Lin', 'Hui', 'Xin Yi', 'Charlotte', 'Grace', 'Jia', 'Yuki', 'Sakura', 'Hana', 'Min-ji', 'Seo-yeon', 'Nadia', 'Aisyah', 'Siti', 'Chloe', 'Olivia', 'Ella', 'Amara', 'Tara'], M: ['Jun', 'Kai', 'Ryan', 'Nathan', 'Jack', 'Wei Jie', 'Ming', 'Hiroshi', 'Kenji', 'Ji-ho', 'Min-jun', 'Arif', 'Farhan', 'Lucas', 'Oliver', 'Ethan', 'Liam', 'Cooper', 'Hamish', 'Rafael'], L: ['Tan', 'Lim', 'Lee', 'Ng', 'Wong', 'Chen', 'Goh', 'Teo', 'Ong', 'Koh', 'Wilson', 'Thompson', 'Walker', 'White', 'Harris', 'Nakamura', 'Sato', 'Kim', 'Park', 'Rahman', 'Yusof', 'Abdullah', 'Nguyen', 'Tran', 'Mitchell', 'Kelly', 'Fraser', 'Chan', 'Ho', 'Yeo'] },
  };
  const poolFor = (loc) => (loc.country === 'India' ? 'IN' : loc.region === 'NA' ? 'US' : loc.region === 'EU' ? 'EU' : 'AP');
  const usedNames = new Set();
  const makeName = (loc, gender) => {
    for (let k = 0; k < 40; k++) {
      // some mobility: 18% of people carry a name pool from another region (relocations)
      const pool = k < 30 && chance(0.82) ? poolFor(loc) : pick(['IN', 'US', 'EU', 'AP']);
      const g = gender === 'X' ? (chance(0.5) ? 'F' : 'M') : gender;
      const first = pick(NAMES[pool][g]), last = pick(NAMES[pool].L);
      const full = `${first} ${last}`;
      if (!usedNames.has(full)) { usedNames.add(full); return { first, last, full }; }
    }
    const f = pick(NAMES.US.F), l = pick(NAMES.US.L) + ' ' + Math.floor(R() * 90 + 10); usedNames.add(f + ' ' + l); return { first: f, last: l, full: f + ' ' + l };
  };

  /* ---------- people generation ---------- */
  const people = [];
  let nextId = 2000; // auto ids start at NS-2000; fixed persona ids stay below
  const NOW = new Date('2026-09-24T09:00:00');
  const yearsAgo = (y) => new Date(NOW.getTime() - y * 365.25 * 86400000);
  const iso = (d) => d.toISOString().slice(0, 10);
  const tenureDraw = () => { const u = R(); if (u < 0.2) return between(0.05, 1); if (u < 0.5) return between(1, 3); if (u < 0.8) return between(3, 6); return Math.min(11.5, between(6, 11.5)); };
  const locDraw = (dept, teamName) => {
    if (/NA$/.test(teamName)) return pick(['AUS', 'AUS', 'SJC', 'NYC', 'TOR']);
    if (/Europe$/.test(teamName)) return pick(['LON', 'LON', 'BER', 'AMS']);
    if (/APAC$/.test(teamName)) return pick(['SIN', 'SYD', 'MUM']);
    const u = R();
    if (dept === 'Engineering') return u < 0.46 ? pick(['MUM', 'MUM', 'MUM', 'BLR', 'BLR', 'PUN']) : u < 0.74 ? pick(['AUS', 'AUS', 'SJC', 'NYC', 'TOR']) : u < 0.9 ? pick(['LON', 'BER', 'AMS']) : pick(['SIN', 'SYD']);
    if (dept === 'Customer Success' || dept === 'Sales') return u < 0.3 ? pick(['MUM', 'BLR']) : u < 0.65 ? pick(['AUS', 'AUS', 'NYC', 'TOR']) : u < 0.88 ? pick(['LON', 'AMS', 'BER']) : pick(['SIN', 'SYD']);
    return u < 0.38 ? pick(['MUM', 'MUM', 'BLR']) : u < 0.72 ? pick(['AUS', 'AUS', 'SJC', 'NYC']) : u < 0.9 ? pick(['LON', 'BER', 'AMS']) : pick(['SIN', 'SYD']);
  };
  const icLevelDraw = (dept, teamName) => {
    const u = R();
    if (dept === 'Engineering') return u < 0.03 ? 'P0' : u < 0.17 ? 'P1' : u < 0.53 ? 'P2' : u < 0.85 ? 'P3' : u < 0.95 ? 'P4' : u < 0.98 ? 'P4.5' : u < 0.995 ? 'P5' : 'P5.5';
    if (teamName === 'Sales Development' || teamName === 'Technical Support') return u < 0.55 ? 'P1' : u < 0.9 ? 'P2' : 'P3';
    return u < 0.14 ? 'P1' : u < 0.54 ? 'P2' : u < 0.87 ? 'P3' : u < 0.97 ? 'P4' : 'P5';
  };
  const ratingDraw = () => { const u = R(); return u < 0.04 ? 1 : u < 0.16 ? 2 : u < 0.7 ? 3 : u < 0.93 ? 4 : 5; };

  const addPerson = (o) => {
    const loc = locMap[o.loc];
    const Lv = levelMap[o.level];
    const womenP = (o.women ?? 0.4) * (Lv.order >= 5 ? 0.38 : Lv.order >= 4 ? 0.58 : Lv.order >= 3 ? 0.85 : 1); // representation thins at senior levels (illustrative)
    const gender = o.gender || (chance(womenP) ? 'F' : chance(0.012) ? 'X' : 'M');
    const nm = o.name ? { first: o.name.split(' ')[0], last: o.name.split(' ').slice(1).join(' '), full: o.name } : makeName(loc, gender);
    if (o.name) usedNames.add(o.name);
    const tenure = o.tenure ?? tenureDraw();
    const L = levelMap[o.level];
    const id = o.id || `NS-${nextId++}`;
    if (people.some((q) => q.id === id)) throw new Error('duplicate id ' + id);
    const p = {
      id, name: nm.full, first: nm.first, last: nm.last, gender,
      email: `${nm.first.toLowerCase().replace(/[^a-z]/g, '')}.${nm.last.toLowerCase().replace(/[^a-z]/g, '')}@${company.domain}`,
      dept: o.dept, org: o.org, team: o.team, level: o.level, track: L.track, title: o.title || titleFor(o.level, o.dept, o.team),
      location: loc.id, city: loc.city, country: loc.country, region: loc.region, remote: o.remote ?? chance(0.22),
      managerId: o.managerId || null, hireDate: iso(yearsAgo(tenure)), tenure: U.round(tenure, 2),
      type: o.type || (chance(0.05) && L.track === 'IC' && L.order <= 3 ? 'Contract' : 'FTE'),
      status: 'Active', skills: o.skills || U.uniq([pick(SK[o.sk]), pick(SK[o.sk]), pick(SK[o.sk]), pick(SK[o.sk])]).slice(0, 4), skillKey: o.sk,
    };
    people.push(p);
    return p;
  };

  // Executives
  const ceo = addPerson({ id: 'NS-1000', name: 'Marcus Hale', gender: 'M', dept: 'Executive', org: 'Executive', team: 'Executive', level: 'E2', title: 'Chief Executive Officer', loc: 'AUS', tenure: 11.6, sk: 'product' });
  const execs = {
    CTO: addPerson({ id: 'NS-1001', name: 'David Lindqvist', gender: 'M', dept: 'Engineering', org: 'Engineering Leadership', team: 'Office of the CTO', level: 'E2', title: 'Chief Technology Officer', loc: 'SJC', tenure: 8.9, managerId: ceo.id, sk: 'backend' }),
    CPO: addPerson({ id: 'NS-1002', name: 'Anjali Bhatt', gender: 'F', dept: 'Product', org: 'Product Leadership', team: 'Office of the CPO', level: 'E2', title: 'Chief Product Officer', loc: 'AUS', tenure: 6.2, managerId: ceo.id, sk: 'product' }),
    CFO: addPerson({ id: 'NS-1004', name: 'Robert Chen', gender: 'M', dept: 'Finance', org: 'Finance Leadership', team: 'Office of the CFO', level: 'E2', title: 'Chief Financial Officer', loc: 'AUS', tenure: 5.1, managerId: ceo.id, sk: 'finance' }),
    CRO: addPerson({ id: 'NS-1005', name: 'Sofia Marchetti', gender: 'F', dept: 'Sales', org: 'Revenue Leadership', team: 'Office of the CRO', level: 'E2', title: 'Chief Revenue Officer', loc: 'NYC', tenure: 4.4, managerId: ceo.id, sk: 'sales' }),
    CPeO: addPerson({ id: 'NS-1006', name: 'Grace Adeyemi', gender: 'F', dept: 'People', org: 'People Leadership', team: 'Office of the CPeO', level: 'E2', title: 'Chief People Officer', loc: 'LON', tenure: 3.8, managerId: ceo.id, sk: 'people' }),
    CMO: addPerson({ id: 'NS-1007', name: 'Hana Sato', gender: 'F', dept: 'Marketing', org: 'Marketing Leadership', team: 'Office of the CMO', level: 'E1', title: 'VP Marketing', loc: 'SJC', tenure: 2.9, managerId: ceo.id, sk: 'marketing' }),
    GC: addPerson({ id: 'NS-1008', name: 'Jonathan Reyes', gender: 'M', dept: 'Legal & Compliance', org: 'Legal', team: 'Legal', level: 'E1', title: 'General Counsel', loc: 'AUS', tenure: 4.9, managerId: ceo.id, sk: 'legal' }),
  };
  const vpEng = addPerson({ id: 'NS-1003', name: 'Elena Fischer', gender: 'F', dept: 'Engineering', org: 'Engineering Leadership', team: 'Office of the CTO', level: 'E1', title: 'VP Engineering', loc: 'BER', tenure: 5.6, managerId: execs.CTO.id, sk: 'backend' });
  const vpCS = addPerson({ id: 'NS-1009', name: 'Tom Whitaker', gender: 'M', dept: 'Customer Success', org: 'Revenue Leadership', team: 'Office of the CRO', level: 'E1', title: 'VP Customer Success', loc: 'LON', tenure: 3.3, managerId: execs.CRO.id, sk: 'cs' });

  // Fixed persona records (created first so they land in the right teams)
  const fixed = {
    'Identity & Access': { manager: { id: 'NS-1180', name: 'Aditya Kulkarni', gender: 'M', level: 'M3', loc: 'MUM', tenure: 5.4, remote: false }, members: [
      { id: 'NS-1207', name: 'Priya Raman', gender: 'F', level: 'P3', loc: 'MUM', tenure: 3.2, remote: false, skills: ['Go', 'Kubernetes', 'OAuth 2.0', 'PostgreSQL'] },
      { id: 'NS-1208', name: 'Rohan Deshpande', gender: 'M', level: 'P2', loc: 'MUM', tenure: 1.7 },
      { id: 'NS-1209', name: 'Kavya Nair', gender: 'F', level: 'P4', loc: 'BLR', tenure: 6.1, remote: true },
      { id: 'NS-1210', name: 'Lukas Weber', gender: 'M', level: 'P3', loc: 'BER', tenure: 2.4, remote: true },
      { id: 'NS-1211', name: 'Siddharth Rao', gender: 'M', level: 'P2', loc: 'MUM', tenure: 0.6 },
      { id: 'NS-1212', name: 'Ananya Menon', gender: 'F', level: 'P1', loc: 'MUM', tenure: 0.9 },
      { id: 'NS-1213', name: 'Nikhil Verma', gender: 'M', level: 'P3', loc: 'PUN', tenure: 4.6 },
      { id: 'NS-1214', name: 'Tanvi Joshi', gender: 'F', level: 'P2', loc: 'MUM', tenure: 2.1 },
    ] },
    'People Partners': { manager: { id: 'NS-1901', name: 'Laura Bennett', gender: 'F', level: 'M4', loc: 'AUS', tenure: 4.2 }, members: [
      { id: 'NS-1902', name: 'Meera Iyer', gender: 'F', level: 'P4', loc: 'MUM', tenure: 3.9, title: 'Senior HR Business Partner', skills: ['HRBP', 'Org design', 'People analytics', 'Employee relations'] },
    ] },
    'People Operations': { manager: { id: 'NS-1910', name: 'Sam Whitfield', gender: 'M', level: 'M2', loc: 'AUS', tenure: 2.8, title: 'People Operations Lead' }, members: [] },
    'Talent Acquisition': { manager: { id: 'NS-1919', name: 'Nora Castillo', gender: 'F', level: 'M3', loc: 'AUS', tenure: 3.1 }, members: [
      { id: 'NS-1920', name: 'Daniel Okafor', gender: 'M', level: 'P3', loc: 'LON', tenure: 2.2, title: 'Senior Technical Recruiter' },
    ] },
    'Total Rewards': { manager: { id: 'NS-1930', name: 'Yuki Nakamura', gender: 'F', level: 'M2', loc: 'SIN', tenure: 2.0, title: 'Total Rewards Lead' }, members: [] },
  };

  // Build departments → orgs → teams
  const teams = [];
  departments.forEach((d) => {
    const deptHead = execs[d.head];
    d.orgs.forEach((org) => {
      // director for the org
      const dirLevel = d.name === 'Engineering' ? (org.teams.length >= 4 ? 'M5' : 'M4.5') : (org.teams.length >= 4 ? 'M5' : 'M4');
      const dirLoc = locDraw(d.name, org.name);
      const director = addPerson({ dept: d.name, org: org.name, team: `${org.name} Leadership`, level: dirLevel, loc: dirLoc, tenure: between(3, 9), managerId: d.name === 'Engineering' ? vpEng.id : d.name === 'Customer Success' ? vpCS.id : deptHead.id, women: d.women, sk: org.teams[0][2] });
      director.isDirector = true;
      org.teams.forEach(([tname, size0, sk]) => {
        const fx = fixed[tname];
        const size = fx ? size0 : Math.round(size0 * (d.scale || 1));
        const mgrLevel = size >= 14 ? 'M3' : size >= 9 ? (chance(0.6) ? 'M3' : 'M2') : chance(0.5) ? 'M2' : 'M1';
        const mgrLoc = fx ? fx.manager.loc : locDraw(d.name, tname);
        const mgr = addPerson({ ...(fx ? fx.manager : {}), dept: d.name, org: org.name, team: tname, level: fx ? fx.manager.level : mgrLevel, loc: mgrLoc, managerId: director.id, women: d.women, sk });
        mgr.quality = U.round(U.clamp(0.78 + gauss() * 0.11, 0.45, 1), 2); // hidden manager-effectiveness factor
        if (fx && fx.manager.id === 'NS-1180') mgr.quality = 0.9;
        if (tname === 'Billing Platform' || tname === 'Technical Support' || tname === 'Mid-Market Sales') mgr.quality = Math.min(mgr.quality, 0.6);
        mgr.teamSize = size;
        const team = { name: tname, dept: d.name, org: org.name, managerId: mgr.id, skillKey: sk, size };
        teams.push(team);
        (fx ? fx.members : []).forEach((m) => addPerson({ ...m, dept: d.name, org: org.name, team: tname, managerId: mgr.id, women: d.women, sk }));
        const remaining = size - (fx ? fx.members.length : 0);
        for (let i = 0; i < remaining; i++) {
          const sameLoc = chance(0.62);
          addPerson({ dept: d.name, org: org.name, team: tname, level: icLevelDraw(d.name, tname), loc: sameLoc ? mgrLoc : locDraw(d.name, tname), managerId: mgr.id, women: d.women, sk });
        }
      });
    });
  });

  /* ---------- derived attributes: comp, performance, engagement, risk ---------- */
  const byId = Object.fromEntries(people.map((p) => [p.id, p]));
  const isManager = new Set(people.filter((p) => p.managerId).map((p) => p.managerId));
  const hotSkills = new Set(['ML Ops', 'PyTorch', 'Applied AI', 'AppSec', 'Cloud security', 'Kubernetes', 'Distributed systems']);
  people.forEach((p) => {
    const L = levelMap[p.level], loc = locMap[p.location];
    const mid = Math.round((L.mid * (fnMult[p.dept] || 0.9) * loc.tier) / 500) * 500;
    p.band = { min: Math.round(mid * 0.8), mid, max: Math.round(mid * 1.2) };
    // compa-ratio: tenure-in-level pulls toward/above mid; a modest structural gap for women in three departments (illustrative)
    let compa = 1 + gauss() * 0.085 + (p.tenure > 4 ? 0.03 : p.tenure < 1 ? -0.05 : 0);
    if (p.gender === 'F' && ['Engineering', 'Sales', 'Finance', 'Product'].includes(p.dept)) compa -= 0.036;
    if (p.id === 'NS-1207') compa = 0.87; if (p.id === 'NS-1209') compa = 0.92; if (p.id === 'NS-1213') compa = 1.17;
    p.compa = U.round(U.clamp(compa, 0.72, 1.34), 3);
    p.salary = Math.round((mid * p.compa) / 100) * 100;
    // performance
    const mgr = byId[p.managerId]; const mq = mgr ? mgr.quality || 0.8 : 0.85;
    const base = ratingDraw();
    p.ratings = [U.clamp(base + (chance(0.3) ? pick([-1, 1]) : 0), 1, 5), U.clamp(base + (chance(0.25) ? pick([-1, 1]) : 0), 1, 5), base]; // FY23, FY24, FY25
    if (p.tenure < 1) p.ratings = [null, null, null]; else if (p.tenure < 2) p.ratings[0] = null; else if (p.tenure < 3) p.ratings[0] = null;
    p.rating = p.ratings[2];
    if (p.id === 'NS-1207') { p.ratings = [4, 4, 5]; p.rating = 5; }
    if (p.id === 'NS-1209') { p.ratings = [4, 5, 4]; p.rating = 4; }
    if (p.id === 'NS-1208') { p.ratings = [null, 3, 3]; p.rating = 3; }
    p.trend = p.ratings[1] == null || p.rating == null ? 'flat' : p.rating > p.ratings[1] ? 'up' : p.rating < p.ratings[1] ? 'down' : 'flat';
    // promotions
    const promoAge = p.tenure < 1.2 ? null : Math.min(p.tenure, Math.abs(gauss()) * 1.6 + 0.4);
    p.lastPromo = promoAge == null ? null : iso(yearsAgo(promoAge));
    p.timeInLevel = U.round(promoAge == null ? p.tenure : promoAge, 1);
    if (p.id === 'NS-1207') { p.lastPromo = iso(yearsAgo(2.6)); p.timeInLevel = 2.6; }
    // engagement & pulse
    let eng = 82 + (mq - 0.8) * 80 + (p.rating ? (p.rating - 3) * 3.5 : 0) + (p.compa - 1) * 40 + gauss() * 8.5 - (p.tenure > 1.5 && p.tenure < 3.5 ? 3 : 0);
    if (p.location === 'PUN') eng -= 3; if (p.team === 'Design Systems' || p.team === 'Applied AI') eng += 5;
    p.engagement = Math.round(U.clamp(eng, 22, 97));
    p.enps = U.clamp(Math.round((p.engagement >= 82 ? 10 : p.engagement >= 71 ? 9 : p.engagement >= 62 ? 8 : p.engagement >= 54 ? 7 : p.engagement >= 46 ? 6 : 4) + (chance(0.2) ? pick([-1, 1]) : 0)), 0, 10);
    const dv = (b) => U.round(U.clamp(b + gauss() * 0.5, 1, 5), 1);
    p.drivers = { growth: dv(2.6 + p.engagement / 40), manager: dv(1.4 + mq * 3.4), recognition: dv(2.5 + p.engagement / 45), workload: dv(3.9 - (p.team === 'SRE' || p.team === 'Technical Support' ? 0.7 : 0) - (p.engagement < 50 ? 0.5 : 0)), pay: dv(2.2 + p.compa * 1.5), belonging: dv(2.7 + p.engagement / 42), clarity: dv(2.6 + mq * 1.6) };
    p.pulse = U.range(6).map((i) => Math.round(U.clamp(p.engagement + (i - 5) * (p.trend === 'down' ? 1.6 : p.trend === 'up' ? -1.2 : 0.2) + gauss() * 4, 15, 99)));
    p.oneOnOnes = mq > 0.85 ? pick(['weekly', 'weekly', 'biweekly']) : mq > 0.7 ? pick(['weekly', 'biweekly', 'biweekly', 'monthly']) : pick(['biweekly', 'monthly', 'rare']);
    p.managerChanged = chance(0.09);
    // flight risk — explainable
    const drivers = [];
    let risk = 17 + gauss() * 10;
    if (p.compa < 0.9) { risk += 18; drivers.push({ k: 'pay', label: 'Paid below 90% of band midpoint', w: 18 }); }
    else if (p.compa < 0.95 && p.rating >= 4) { risk += 12; drivers.push({ k: 'pay', label: 'High performer under midpoint', w: 12 }); }
    if (p.timeInLevel > 3 && L.track === 'IC' && L.order <= 3) { risk += 15; drivers.push({ k: 'growth', label: `${p.timeInLevel.toFixed(1)} yrs since last promotion`, w: 15 }); }
    if (p.engagement < 64) { risk += 20; drivers.push({ k: 'engagement', label: `Engagement ${p.engagement} (below 64)`, w: 20 }); }
    else if (p.engagement < 72) { risk += 9; drivers.push({ k: 'engagement', label: `Engagement ${p.engagement} (soft)`, w: 9 }); }
    if (mq < 0.65) { risk += 10; drivers.push({ k: 'manager', label: 'Low manager-effectiveness signal', w: 10 }); }
    if (p.managerChanged) { risk += 8; drivers.push({ k: 'change', label: 'Manager changed in last 6 months', w: 8 }); }
    if (p.tenure > 1.5 && p.tenure < 3.5) { risk += 9; drivers.push({ k: 'tenure', label: 'Tenure in the 18–42 month window', w: 7 }); }
    if (p.skills.some((s) => hotSkills.has(s))) { risk += 6; drivers.push({ k: 'market', label: 'In-demand skill set (hot market)', w: 6 }); }
    if (p.pulse[5] < p.pulse[2] - 8) { risk += 10; drivers.push({ k: 'pulse', label: 'Pulse dropped 8+ pts in 3 months', w: 10 }); }
    if (p.rating >= 4 && p.compa >= 1.05) { risk -= 8; drivers.push({ k: 'protect', label: 'Recognised and paid above mid', w: -8 }); }
    if (p.lastPromo && p.timeInLevel < 1) { risk -= 12; drivers.push({ k: 'protect', label: 'Promoted in the last 12 months', w: -12 }); }
    if (p.id === 'NS-1207') { risk = 71; }
    p.risk = Math.round(U.clamp(risk, 3, 97));
    p.riskBand = p.risk >= 65 ? 'High' : p.risk >= 40 ? 'Medium' : 'Low';
    p.riskDrivers = drivers.sort((a, b) => b.w - a.w);
    p.regrettable = p.rating >= 4;
    // misc
    p.isManager = isManager.has(p.id);
    p.hue = NS.hashStr(p.name) % 10;
    if (chance(0.012) && p.track === 'IC') p.status = 'Notice period';
    else if (chance(0.02)) p.status = 'On leave';
  });
  // status overrides for demo personas
  ['NS-1207', 'NS-1180', 'NS-1902', 'NS-1910', 'NS-1920', 'NS-1003', 'NS-1930', 'NS-1901'].forEach((id) => { if (byId[id]) byId[id].status = 'Active'; });

  /* ---------- lookups ---------- */
  const reports = (id) => people.filter((p) => p.managerId === id);
  const allReports = (id) => { const out = []; const walk = (m) => reports(m).forEach((p) => { out.push(p); walk(p.id); }); walk(id); return out; };
  const chain = (id) => { const out = []; let p = byId[id]; while (p && p.managerId) { p = byId[p.managerId]; if (p) out.push(p); } return out; };
  people.forEach((p) => { p.directs = reports(p.id).length; p.span = p.directs; });
  people.forEach((p) => { if (p.isManager) p.orgSize = allReports(p.id).length; });

  /* ---------- personas (shared across tools) ---------- */
  const personas = {
    employee: { id: 'employee', label: 'Employee view', personId: 'NS-1207' },
    manager: { id: 'manager', label: 'Manager view', personId: 'NS-1180' },
    hrbp: { id: 'hrbp', label: 'HR Business Partner', personId: 'NS-1902' },
    peopleops: { id: 'peopleops', label: 'People Operations', personId: 'NS-1910' },
    recruiter: { id: 'recruiter', label: 'Recruiter', personId: 'NS-1920' },
    rewards: { id: 'rewards', label: 'Total Rewards', personId: 'NS-1930' },
    exec: { id: 'exec', label: 'Executive view', personId: 'NS-1003' },
    cpo: { id: 'cpo', label: 'Chief People Officer', personId: 'NS-1006' },
  };
  Object.values(personas).forEach((ps) => { const p = byId[ps.personId]; ps.name = p.name; ps.title = p.title; ps.team = p.team; ps.person = p; ps.hue = p.hue; });

  /* ---------- history series ---------- */
  const quarters = []; for (let y = 2022; y <= 2026; y++) for (let q = 1; q <= 4; q++) { if (y === 2026 && q > 3) break; quarters.push(`Q${q} ’${String(y).slice(2)}`); }
  const attrition = [17.6, 16.8, 15.1, 13.4, 11.9, 10.4, 9.6, 9.1, 9.3, 8.8, 8.5, 8.1, 7.9, 7.6, 7.4, 7.5, 7.2, 7.4, 7.1].slice(0, quarters.length);
  const attritionByRegion = { NA: attrition.map((v, i) => U.round(v * 1.08 + Math.sin(i) * 0.4, 1)), EU: attrition.map((v, i) => U.round(v * 0.86 + Math.cos(i) * 0.3, 1)), APAC: attrition.map((v, i) => U.round(v * 1.04 - Math.sin(i / 2) * 0.3, 1)) };
  const months = []; const mDate = new Date('2023-10-01'); while (mDate <= NOW) { months.push(mDate.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' }).replace(' ', ' ’')); mDate.setMonth(mDate.getMonth() + 1); }
  const headcount = months.map((_, i) => Math.round(722 + (people.length - 722) * (i / (months.length - 1)) + Math.sin(i / 2) * 6));
  const halves = ['H1 ’23', 'H2 ’23', 'H1 ’24', 'H2 ’24', 'H1 ’25', 'H2 ’25', 'H1 ’26'];
  const enps = [31, 42, 51, 58, 62, 65, 67];
  const participation = [71, 78, 84, 86, 88, 89, 91];
  const last12 = months.slice(-12);
  const hires = last12.map((_, i) => Math.round(18 + Math.sin(i / 1.7) * 6 + (i % 3 === 0 ? 5 : 0)));
  const exits = last12.map((_, i) => Math.round(7 + Math.cos(i / 2) * 2));
  const engagementTrend = last12.map((_, i) => Math.round(66 + i * 0.55 + Math.sin(i) * 1.2));
  const series = { quarters, attrition, attritionByRegion, months, headcount, halves, enps, participation, last12, hires, exits, engagementTrend, threshold: 10 };

  /* ---------- FY26 review cycle ---------- */
  const cycle = {
    name: 'FY26 Annual Review', short: 'FY26', year: 2026,
    phases: [
      { id: 'goals', label: 'Goal setting', start: '2026-01-12', end: '2026-02-06' },
      { id: 'midyear', label: 'Mid-year check-in', start: '2026-06-15', end: '2026-07-10' },
      { id: 'self', label: 'Self review', start: '2026-09-14', end: '2026-10-02' },
      { id: 'manager', label: 'Manager review', start: '2026-10-05', end: '2026-10-16' },
      { id: 'calibration', label: 'Calibration', start: '2026-10-19', end: '2026-10-30' },
      { id: 'release', label: 'Release & increments', start: '2026-11-09', end: '2026-11-13' },
    ],
    current: 'self', selfReviewCloses: '2026-10-02T18:00:00',
  };
  const ratingScale = [
    { v: 1, label: 'Needs improvement', short: 'NI', desc: 'Falls short of expectations for the level in most areas; a structured improvement plan is required.' },
    { v: 2, label: 'Developing', short: 'DEV', desc: 'Meets some expectations; inconsistent delivery or impact for the level. Clear growth areas.' },
    { v: 3, label: 'Meets expectations', short: 'ME', desc: 'Consistently delivers what the level demands — the solid, reliable core of the team.' },
    { v: 4, label: 'Exceeds expectations', short: 'EE', desc: 'Regularly delivers beyond the level; visible impact across the team or adjacent teams.' },
    { v: 5, label: 'Outstanding', short: 'OUT', desc: 'Rare, sustained, organisation-level impact; a role model for the next level.' },
  ];
  const competencies = [
    { id: 'tech', name: 'Technical Excellence', icon: 'code', desc: 'Writes clean, tested, scalable code and makes sound technical choices.' },
    { id: 'design', name: 'System Design', icon: 'network', desc: 'Designs subsystems and services with clear contracts, trade-offs and operability.' },
    { id: 'delivery', name: 'Delivery & Execution', icon: 'rocket', desc: 'Ships reliably, plans realistically and unblocks work.' },
    { id: 'impact', name: 'Product Impact', icon: 'target', desc: 'Connects work to customer and business outcomes; measures what ships.' },
    { id: 'ownership', name: 'Ownership', icon: 'shield', desc: 'Owns services end-to-end: reliability, cost, security and follow-through.' },
    { id: 'comms', name: 'Communication', icon: 'message-square', desc: 'Writes and speaks with clarity; keeps stakeholders informed; gives and takes feedback.' },
    { id: 'leadership', name: 'Leadership & Mentoring', icon: 'users', desc: 'Raises the bar for others through mentoring, reviews and culture.' },
  ];
  const values = [
    { id: 'customer', name: 'Customer obsession', icon: 'heart', desc: 'Start from the customer’s problem and work backwards.' },
    { id: 'own', name: 'Own it', icon: 'shield', desc: 'Take responsibility end-to-end; no hand-offs without follow-through.' },
    { id: 'bar', name: 'Raise the bar', icon: 'trending-up', desc: 'Leave every system, doc and teammate better than you found them.' },
    { id: 'transparent', name: 'Default to transparency', icon: 'eye', desc: 'Share context early; write things down; disagree in the open.' },
    { id: 'together', name: 'Win together', icon: 'users', desc: 'Optimise for the company’s outcome, not the team’s.' },
  ];
  const risk = { bands: [{ id: 'High', min: 65, cls: 'bad' }, { id: 'Medium', min: 40, cls: 'warn' }, { id: 'Low', min: 0, cls: 'ok' }], factors: [
    { k: 'pay', label: 'Compensation position', desc: 'Compa-ratio vs band midpoint, weighted higher for strong performers.' },
    { k: 'growth', label: 'Time since promotion', desc: 'Stagnation risk for early-career levels after 3 years in level.' },
    { k: 'engagement', label: 'Engagement score', desc: 'Latest engagement index; strong signal below 55.' },
    { k: 'manager', label: 'Manager effectiveness', desc: 'Team-level manager signal from pulse and 1:1 cadence.' },
    { k: 'change', label: 'Recent re-org / manager change', desc: 'Disruption in the last six months.' },
    { k: 'tenure', label: 'Tenure window', desc: 'Historical exit peak between 18 and 42 months.' },
    { k: 'market', label: 'External demand', desc: 'Skill sets currently in a hot hiring market.' },
    { k: 'pulse', label: 'Pulse trajectory', desc: 'A sharp drop over the last quarter.' },
  ] };

  const summary = () => ({
    headcount: people.length, engineers: people.filter((p) => p.dept === 'Engineering').length, managers: people.filter((p) => p.isManager).length,
    women: U.round((people.filter((p) => p.gender === 'F').length / people.length) * 100, 1),
    avgTenure: U.round(U.avg(people, 'tenure'), 1), avgEngagement: Math.round(U.avg(people, 'engagement')),
    enps: (() => { const pr = people.filter((p) => p.enps >= 9).length, de = people.filter((p) => p.enps <= 6).length; return Math.round(((pr - de) / people.length) * 100); })(),
    highRisk: people.filter((p) => p.riskBand === 'High').length, payroll: U.sum(people, 'salary'),
    byRegion: U.countBy(people, 'region'), byDept: U.countBy(people, 'dept'), byLocation: U.countBy(people, 'city'),
  });

  window.NSData = {
    company, regions, locations, locMap, departments, levels, levelMap, titleFor, skills: SK, people, byId: (id) => byId[id], reports, allReports, chain, teams, team: (n) => people.filter((p) => p.team === n), dept: (n) => people.filter((p) => p.dept === n), managers: people.filter((p) => p.isManager), personas, series, cycle, ratingScale, competencies, values, risk, summary, now: NOW,
    levelLabel: (code) => (levelMap[code] ? `${code} · ${levelMap[code].short}` : code),
    rng: NS.rng(777), // app-local extra randomness, still deterministic
  };
})();
