export const LINKS = {
  email: 'mailto:surendarrix@gmail.com',
  emailText: 'surendarrix@gmail.com',
  instagram: 'https://www.instagram.com/surendarcreates',
  linkedin: 'https://www.linkedin.com/in/surendar-a-1b4199218/',
  github: 'https://www.github.com/surendarrics',
}

// The order of this list is the order of the circuit.
// "road" is the side of the screen the track runs on through that section.
export const BLOCKS = [
  { id: 'start', kind: 'section', road: 'right' },
  { id: 'z1', kind: 'zone', shape: 'hairpins', name: 'Chennai Hairpins', word: 'HAIRPINS' },
  { id: 'about', kind: 'section', road: 'left' },
  { id: 'z2', kind: 'zone', shape: 'esses', name: 'Marina Esses', word: 'ESSES' },
  { id: 'skills', kind: 'section', road: 'right' },
  { id: 'z3', kind: 'zone', shape: 'hairpins', name: 'Kochi Loops', word: 'LOOPS' },
  { id: 'work', kind: 'section', road: 'left' },
  { id: 'zg', kind: 'zone', shape: 'esses', name: 'Garage Esses', word: 'GARAGE' },
  { id: 'garage', kind: 'section', road: 'right' },
  { id: 'z4', kind: 'zone', shape: 'straight', name: 'Collierville Straight', word: 'DRS' },
  { id: 'pit', kind: 'section', road: 'left' },
  { id: 'z5', kind: 'zone', shape: 'esses', name: 'Final Chicane', word: 'CHICANE' },
  { id: 'finish', kind: 'section', road: 'right' },
]

export const NAV = [
  { id: 'start', label: 'Start' },
  { id: 'about', label: 'About', s: 1 },
  { id: 'skills', label: 'Skills', s: 2 },
  { id: 'work', label: 'Work', s: 2 },
  { id: 'garage', label: 'Concepts', s: 2 },
  { id: 'pit', label: 'Pit stop', s: 3 },
]

export const PROFILE = [
  ['Driver', 'Surendar A'],
  ['Based', 'Chennai, India'],
  ['Builds', 'Mobile apps (Flutter, React Native), web apps (Next.js) and AI features'],
  ['Clients', 'Startups and small businesses'],
  ['Teaches', 'App building and freelancing on Instagram'],
  ['Off track', 'Gym, football and tech'],
]

export const WEEKEND = [
  {
    tag: 'Practice',
    title: 'The brief',
    text: 'Tell me what you want to build, who it is for and when you want it live. I reply with questions or a fixed quote.',
  },
  {
    tag: 'Qualifying',
    title: 'The build',
    text: 'You get a working demo every week, so you see real progress, not promises.',
  },
  {
    tag: 'Race day',
    title: 'The launch',
    text: 'I handle the Play Store and App Store launch, so your app reaches real users.',
  },
]

export const TOWERS = [
  {
    title: 'Mobile',
    rows: [
      ['FLU', 'Flutter 3', 'Android + iOS'],
      ['STM', 'Riverpod & Bloc', 'State'],
      ['RN', 'React Native', 'Expo'],
      ['IAP', 'In-app payments & subscriptions', ''],
      ['STR', 'Play Store & App Store launch', ''],
    ],
  },
  {
    title: 'Web',
    rows: [
      ['NXT', 'Next.js', ''],
      ['TS', 'TypeScript', ''],
      ['RCT', 'React', ''],
      ['TWD', 'Tailwind CSS & shadcn/ui', ''],
      ['ANI', 'Framer Motion & GSAP', 'Like this site'],
    ],
  },
  {
    title: 'AI',
    tag: 'New',
    rows: [
      ['LLM', 'AI features in apps', 'OpenAI · Claude · Gemini'],
      ['AUT', 'Business automations', 'Workflows'],
      ['DEV', 'AI-assisted development', 'Ships faster'],
    ],
  },
  {
    title: 'Backend & payments',
    rows: [
      ['SUP', 'Supabase', 'Postgres · Auth · Storage'],
      ['NOD', 'Node.js & Express', 'APIs'],
      ['PAY', 'Stripe & Razorpay', 'Payments'],
      ['VCL', 'Vercel & Cloudflare', 'Hosting'],
      ['GIT', 'Git & GitHub', ''],
    ],
  },
]

export const WORK = [
  {
    name: 'Ivorah',
    headline: 'The A–Z interior design app',
    kind: 'Client project app',
    meta: 'Interior design and remodeling · Collierville, Tennessee, USA',
    summary: 'Every step of a renovation in one app, so clients follow it all from one place instead of long email chains.',
    points: [
      'Private dashboard with design approvals and milestones',
      'Payments, progress photos and team details',
      'One message thread per project',
    ],
    link: 'https://ivorah.com',
    linkText: 'ivorah.com',
  },
  {
    name: 'Tenlly',
    headline: 'The 10-minute food delivery app',
    kind: 'Cloud kitchen app',
    meta: 'Food delivery · Kakkanad, Kochi, India',
    summary: 'A kitchen that cooks and delivers its own food, with ordering built to be fast.',
    points: [
      'Address check before ordering',
      'Live delivery estimates',
      'UPI, cards, net banking, cash on delivery and wallet credit',
    ],
    link: 'https://tenlly.in',
    linkText: 'tenlly.in',
  },
]

export const ALSO = ['Wedding invitation app', 'Business management app']

// Concept builds: ideas for common businesses. Clearly labelled as concepts on
// the page, never presented as client work.
export const CONCEPTS = [
  {
    id: 'clinic',
    title: 'Clinic booking app',
    for: 'Clinics, dentists and physios',
    points: [
      'Patients book by doctor and time slot',
      'Automatic reminders before every visit',
      'Online payments and digital prescriptions',
      'A daily schedule dashboard for doctors',
    ],
  },
  {
    id: 'restaurant',
    title: 'Restaurant ordering app',
    for: 'Restaurants, cafés and cloud kitchens',
    points: [
      'QR menu at the table, ordering from the phone',
      'Delivery and pickup with live order tracking',
      'Loyalty points that bring customers back',
      'Live kitchen screen for incoming orders',
    ],
  },
  {
    id: 'studio',
    title: 'Salon & studio booking app',
    for: 'Salons, gyms and fitness studios',
    points: [
      'Book services or classes in a few taps',
      'Memberships and subscriptions with in-app payments',
      'Staff and trainer schedules in one place',
      'Reminders and rebooking for regulars',
    ],
  },
  {
    id: 'property',
    title: 'Property management app',
    for: 'Landlords and property managers',
    points: [
      'Tenants pay rent online',
      'Maintenance requests with photos and status',
      'Owner dashboard for every unit',
      'An AI assistant that answers common tenant questions',
    ],
  },
]
