/**
 * ============================================
 * OPENACADEMY CONTENT MANAGEMENT
 * ============================================
 *
 * This file centralizes ALL content data (titles, descriptions, categories, etc.)
 * for easy editing and search functionality.
 *
 * INSTRUCTIONS:
 * 1. Find the section for the content you want to edit
 * 2. Update the title, description, category, or keywords
 * 3. The change will automatically reflect across the app
 *
 * CONTENT ID NAMESPACING:
 * - Explore Lessons: 1-99
 * - Bundle Lessons: 1-99 (same as explore, linked by lesson ID)
 * - For You: 1001-1099
 * - OpenAcademy Originals: 2001-2099
 * - Creators: 3001-3099
 */

// Images are imported in data/mock.ts — content.ts is data-only

// ============================================
// CONTENT TYPES
// ============================================

export interface ContentItem {
  id: number;
  title: string; // Display title (often uppercase for thumbnails)
  fullTitle: string; // Full title for detail pages
  category: string; // Category label (e.g., "MARKETING", "FINANCE")
  description: string; // Full description
  keywords: string[]; // Search keywords
  seriesCount?: number; // Number of series/lessons
  totalMinutes?: number; // Total duration in minutes
  rating?: number; // Rating out of 5
  reviews?: number; // Number of reviews
  coins?: number | 'FREE'; // Cost in coins
  lessonPlanCoins?: number; // Cost to get the full lesson plan (displayed on detail page CTA)
}

// Part types for multi-part lessons
export type PartType = 'video' | 'survey' | 'image';

export interface VideoPart {
  type: 'video';
  videoUrl: string;
}

export interface SurveyPart {
  type: 'survey';
  question: string;
  options: Array<{id: string;text: string;}>;
}

export interface ImagePart {
  type: 'image';
  imageUrl: string;
  caption?: string;
}

export type LessonPart = VideoPart | SurveyPart | ImagePart;

export interface BundleContent {
  id: number;
  lessonId: number; // Which explore lesson this bundle belongs to
  title: string;
  subtitle: string;
  description: string;
  seriesCount: number;
  totalMinutes: number;
  price: number;
  isFree: boolean;
  lessons: BundleLessonContent[];
}

export interface BundleLessonContent {
  id: number;
  title: string;
  duration: string;
  coins: number;
  parts: LessonPart[]; // Multi-part structure: video, survey, image
}

export interface CreatorContent {
  id: number;
  name: string;
  title: string;
  bio: string;
}

// ============================================
// FOR YOU SECTION CONTENT
// ============================================
export const FOR_YOU_CONTENT: Record<number, ContentItem> = {
  1: {
    id: 1,
    title: 'BEFORE I DO',
    fullTitle: 'Before I Do',
    category: 'RELATIONSHIPS',
    description:
    'Essential conversations and preparations for couples before marriage. Build a strong foundation for your future together.',
    keywords: [
    'before',
    'marriage',
    'wedding',
    'couples',
    'relationships',
    'love',
    'commitment'],

    seriesCount: 7,
    totalMinutes: 42
  },
  2: {
    id: 2,
    title: 'SIMPAN ATAU MELABUR',
    fullTitle: 'Simpan atau Melabur',
    category: 'FINANCE',
    description:
    'Understand the difference between saving and investing. Make informed decisions about your money.',
    keywords: [
    'simpan',
    'melabur',
    'saving',
    'investing',
    'finance',
    'money',
    'investment'],

    seriesCount: 9,
    totalMinutes: 55
  },
  3: {
    id: 3,
    title: 'MONEY TALK',
    fullTitle: 'Money Talk with Yuva',
    category: 'FINANCE',
    description:
    'Real conversations about money management for young professionals. Learn practical financial tips.',
    keywords: [
    'money',
    'talk',
    'yuva',
    'finance',
    'financial',
    'tips',
    'young',
    'professionals'],

    seriesCount: 6,
    totalMinutes: 35
  },
  4: {
    id: 4,
    title: 'PDPA ACT',
    fullTitle: 'Understanding PDPA Act',
    category: 'LEGAL',
    description:
    'Learn about the Personal Data Protection Act and how it affects you and your business.',
    keywords: [
    'pdpa',
    'data',
    'protection',
    'privacy',
    'legal',
    'act',
    'law',
    'compliance'],

    seriesCount: 8,
    totalMinutes: 48
  }
};

// ============================================
// EXPLORE LESSONS CONTENT
// ============================================
export const EXPLORE_LESSONS_CONTENT: Record<number, ContentItem> = {
  1: {
    id: 1,
    title: 'Duit Yourself',
    fullTitle: 'Duit Yourself',
    category: 'FINANCE',
    description:
    "Money matters made simple, relatable and real! From first jobs to retirement dreams, we're breaking down personal finance for the modern hustle. Learn to budget, tackle debt, and build a future you're excited about, because adulting is easier when you're in control. Let's take charge, one bite-sized step at a time.",
    keywords: [
    'duit',
    'yourself',
    'finance',
    'money',
    'personal',
    'budget',
    'paycheque',
    'paycheck',
    'salary',
    'income'],

    seriesCount: 11,
    totalMinutes: 2,
    rating: 4.8,
    reviews: 0,
    lessonPlanCoins: 2000
  },
  2: {
    id: 2,
    title: 'Make it Make Cents',
    fullTitle: 'Make it Make Cents',
    category: 'CONTENT CREATION',
    description:
    "Whether you're just getting started or already dabbling in content creation, this series is your ultimate guide to building strong foundations, levelling up your skills, and turning your content into coin.",
    keywords: [
    'content',
    'creation',
    'make',
    'cents',
    'creator',
    'social media',
    'monetize',
    'influencer'],

    seriesCount: 10,
    totalMinutes: 3,
    rating: 4.8,
    reviews: 124,
    lessonPlanCoins: 1500
  },
  3: {
    id: 3,
    title: 'Beyond The Profile',
    fullTitle: 'Beyond The Profile: Personal Branding on LinkedIn',
    category: 'PERSONAL BRANDING',
    description:
    "Your LinkedIn profile is more than a digital resume — it's your personal brand. This series teaches you how to craft a compelling presence, create content that positions you as a thought leader, and leverage LinkedIn to open doors for career growth, partnerships, and opportunities. Whether you're job hunting or building authority, this is your playbook.",
    keywords: [
    'personal',
    'branding',
    'linkedin',
    'profile',
    'networking',
    'career',
    'thought leader',
    'professional',
    'content'],

    seriesCount: 8,
    totalMinutes: 3,
    rating: 4.6,
    reviews: 87,
    lessonPlanCoins: 1800
  }
};

// ============================================
// OPENACADEMY ORIGINALS CONTENT
// ============================================
export const ORIGINALS_CONTENT: Record<number, ContentItem> = {
  1: {
    id: 1,
    title: 'DRIVEN',
    fullTitle: 'Driven: Lessons From The Fastlane',
    category: 'ENTREPRENEURSHIP',
    description:
    'A thoughtful series about resilience and purpose. Learn from successful entrepreneurs who built their dreams from the ground up.',
    keywords: [
    'driven',
    'entrepreneurship',
    'business',
    'success',
    'motivation',
    'fastlane',
    'nicky',
    'lim'],

    seriesCount: 12,
    totalMinutes: 90,
    coins: 10
  },
  3: {
    id: 3,
    title: 'R.A.C.E',
    fullTitle: 'R.A.C.E Framework',
    category: 'DIVERSITY & INCLUSION',
    description:
    'A comprehensive series exploring race, bias, and building inclusive workplaces. Learn to recognize systemic issues and become an effective ally.',
    keywords: [
    'race',
    'diversity',
    'inclusion',
    'bias',
    'workplace',
    'munirah',
    'framework'],

    seriesCount: 10,
    totalMinutes: 75,
    coins: 5
  },
  4: {
    id: 4,
    title: 'ILLUMINATE',
    fullTitle: 'Illuminate: An Introduction to Projection Mapping',
    category: 'CREATIVE',
    description:
    'Discover the art and technology of projection mapping. From basics to advanced techniques, learn to create stunning visual experiences.',
    keywords: [
    'illuminate',
    'projection',
    'mapping',
    'creative',
    'visual',
    'art',
    'technology'],

    seriesCount: 9,
    totalMinutes: 68,
    coins: 'FREE'
  },
  5: {
    id: 5,
    title: 'WEB DEVELOPMENT',
    fullTitle: 'Web Development Fundamentals',
    category: 'TECHNOLOGY',
    description:
    'Learn to build modern websites and web applications. Fundamentals of web development.',
    keywords: [
    'web',
    'development',
    'coding',
    'programming',
    'html',
    'css',
    'javascript',
    'technology'],

    seriesCount: 15,
    totalMinutes: 120,
    coins: 10
  },
  6: {
    id: 6,
    title: 'GRAPHIC DESIGN',
    fullTitle: 'Graphic Design Essentials',
    category: 'CREATIVE',
    description:
    'Master the fundamentals of visual design and branding. Create stunning visual content.',
    keywords: [
    'graphic',
    'design',
    'visual',
    'branding',
    'creative',
    'art',
    'adobe'],

    seriesCount: 8,
    totalMinutes: 55,
    coins: 'FREE'
  },
  7: {
    id: 7,
    title: 'REAL TALK',
    fullTitle: 'Real Talk Real Business',
    category: 'BUSINESS',
    description:
    'Authentic conversations about leadership, ethics, and building a positive workplace culture. Real insights from real business leaders.',
    keywords: [
    'real',
    'talk',
    'business',
    'leadership',
    'ethics',
    'workplace',
    'culture'],

    seriesCount: 10,
    totalMinutes: 50,
    coins: 10
  },
  8: {
    id: 8,
    title: 'PEOPLE FIRST',
    fullTitle: 'People-First: Customer Experience in the Digital',
    category: 'CUSTOMER EXPERIENCE',
    description:
    'Put people at the center of your digital strategy. Learn to create meaningful customer journeys and empathetic service design.',
    keywords: [
    'people',
    'first',
    'customer',
    'experience',
    'digital',
    'journey',
    'empathy',
    'service'],

    seriesCount: 8,
    totalMinutes: 55,
    coins: 5
  }
};

// ============================================
// BUNDLE CONTENT (keyed by lessonId)
// ============================================
export const BUNDLES_CONTENT: BundleContent[] = [
// ---- Duit Yourself (lessonId: 1) ----
{
  id: 1,
  lessonId: 1,
  title: "What's In Your Paycheque?",
  subtitle: 'Bundle 1',
  description: 'Understand your paycheck, deductions, and take-home pay',
  seriesCount: 2,
  totalMinutes: 20,
  price: 0,
  isFree: true,
  lessons: [
  {
    id: 1,
    title: 'How Much Do I Actually Make',
    duration: '5 mins',
    coins: 0,
    parts: [
    {
      type: 'video',
      videoUrl:
      'https://magicpatterns.tos-ap-southeast-1.bytepluses.com/LP_DuitYourself_2025-B01C01_HowMuchDoIActuallyMake.mp4'
    },
    {
      type: 'survey',
      question: 'What surprised you most about paycheck deductions?',
      options: [
      { id: 'tax', text: 'Tax deductions' },
      { id: 'epf', text: 'EPF contributions' },
      { id: 'socso', text: 'SOCSO deductions' },
      { id: 'all', text: 'All of the above!' }]

    },
    {
      type: 'image',
      imageUrl:
      'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80',
      caption:
      'Understanding your paycheck breakdown: Gross pay vs. Net pay'
    }]

  },
  {
    id: 2,
    title: 'Understanding Deductions',
    duration: '5 mins',
    coins: 0,
    parts: [
    {
      type: 'video',
      videoUrl:
      'https://magicpatterns.tos-ap-southeast-1.bytepluses.com/LP_DuitYourself_2025-B01C02_UnderstandingDeductions.mp4'
    }]

  }]

},
{
  id: 2,
  lessonId: 1,
  title: 'Personal Finances As A Gig Worker',
  subtitle: 'Bundle 2',
  description:
  'Calling your own shots sounds dreamy until paychecks bounce. Learn how to keep cash flowing and build a future that works for you.',
  seriesCount: 4,
  totalMinutes: 20,
  price: 50,
  isFree: false,
  lessons: [
  {
    id: 5,
    title: 'Challengers Gig Workers Face',
    duration: '5 mins',
    coins: 5,
    parts: [
    {
      type: 'video',
      videoUrl:
      'https://magicpatterns.tos-ap-southeast-1.bytepluses.com/OA%20App%20-%20Launch%20Video.mp4'
    },
    {
      type: 'survey',
      question: 'Which gig work challenge affects you most?',
      options: [
      { id: 'income', text: 'Inconsistent income' },
      { id: 'benefits', text: 'Lack of benefits' },
      { id: 'planning', text: 'Financial planning' },
      { id: 'taxes', text: 'Tax management' }]

    }]

  },
  {
    id: 6,
    title: 'Inconsistent Income Earners',
    duration: '5 mins',
    coins: 5,
    parts: [
    {
      type: 'video',
      videoUrl:
      'https://magicpatterns.tos-ap-southeast-1.bytepluses.com/OA%20App%20-%20Launch%20Video.mp4'
    }]

  },
  {
    id: 7,
    title: 'Gig Working Requires Goals & Motivations',
    duration: '5 mins',
    coins: 5,
    parts: [
    {
      type: 'video',
      videoUrl:
      'https://magicpatterns.tos-ap-southeast-1.bytepluses.com/OA%20App%20-%20Launch%20Video.mp4'
    }]

  },
  {
    id: 8,
    title: 'Securing Your Future - Retirement',
    duration: '5 mins',
    coins: 5,
    parts: [
    {
      type: 'video',
      videoUrl:
      'https://magicpatterns.tos-ap-southeast-1.bytepluses.com/OA%20App%20-%20Launch%20Video.mp4'
    },
    {
      type: 'survey',
      question: 'Have you started planning for retirement?',
      options: [
      { id: 'yes', text: 'Yes, actively saving' },
      { id: 'thinking', text: 'Thinking about it' },
      { id: 'no', text: 'Not yet' },
      { id: 'unsure', text: 'Not sure where to start' }]

    }]

  }]

},
{
  id: 3,
  lessonId: 1,
  title: 'Pengurusan Hutang & BNPL',
  subtitle: 'Bundle 3',
  description:
  'Hutang & BNPL di hujung jari, tapi risiko tersembunyi menanti. Ketahui cara bijak urus hutang, guna BNPL dengan disiplin, dan elak perangkap kewangan.',
  seriesCount: 4,
  totalMinutes: 20,
  price: 50,
  isFree: false,
  lessons: [
  {
    id: 9,
    title: 'Parangkap Hutang',
    duration: '5 mins',
    coins: 5,
    parts: [
    {
      type: 'video',
      videoUrl:
      'https://magicpatterns.tos-ap-southeast-1.bytepluses.com/OA%20App%20-%20Launch%20Video.mp4'
    }]

  },
  {
    id: 10,
    title: 'Hutang Pengguna di Malaysia',
    duration: '5 mins',
    coins: 5,
    parts: [
    {
      type: 'video',
      videoUrl:
      'https://magicpatterns.tos-ap-southeast-1.bytepluses.com/OA%20App%20-%20Launch%20Video.mp4'
    },
    {
      type: 'survey',
      question: 'Adakah anda menggunakan BNPL?',
      options: [
      { id: 'yes', text: 'Ya, kerap' },
      { id: 'sometimes', text: 'Kadang-kadang' },
      { id: 'no', text: 'Tidak' },
      { id: 'unsure', text: 'Tidak pasti' }]

    }]

  },
  {
    id: 11,
    title: 'Beli Sekarang Bayar Kemudian',
    duration: '5 mins',
    coins: 5,
    parts: [
    {
      type: 'video',
      videoUrl:
      'https://magicpatterns.tos-ap-southeast-1.bytepluses.com/OA%20App%20-%20Launch%20Video.mp4'
    }]

  },
  {
    id: 12,
    title: 'Manfaat menggunakan BNPL',
    duration: '5 mins',
    coins: 5,
    parts: [
    {
      type: 'video',
      videoUrl:
      'https://magicpatterns.tos-ap-southeast-1.bytepluses.com/OA%20App%20-%20Launch%20Video.mp4'
    }]

  }]

},
// ---- Make it Make Cents (lessonId: 2) ----
{
  id: 4,
  lessonId: 2,
  title: 'Getting Started as a Creator',
  subtitle: 'Bundle 1',
  description:
  'Lay the groundwork for your content creation journey. Learn how to find your niche, build your brand, and create content that stands out.',
  seriesCount: 3,
  totalMinutes: 15,
  price: 0,
  isFree: true,
  lessons: [
  {
    id: 20,
    title: 'Finding Your Niche',
    duration: '5 mins',
    coins: 0,
    parts: [
    {
      type: 'video',
      videoUrl:
      'https://magicpatterns.tos-ap-southeast-1.bytepluses.com/OA%20App%20-%20Launch%20Video.mp4'
    },
    {
      type: 'survey',
      question: 'What type of content do you want to create?',
      options: [
      { id: 'educational', text: 'Educational content' },
      { id: 'entertainment', text: 'Entertainment' },
      { id: 'lifestyle', text: 'Lifestyle & vlogs' },
      { id: 'business', text: 'Business & finance' }]

    }]

  },
  {
    id: 21,
    title: 'Building Your Brand',
    duration: '5 mins',
    coins: 0,
    parts: [
    {
      type: 'video',
      videoUrl:
      'https://magicpatterns.tos-ap-southeast-1.bytepluses.com/OA%20App%20-%20Launch%20Video.mp4'
    }]

  },
  {
    id: 22,
    title: 'Content That Connects',
    duration: '5 mins',
    coins: 0,
    parts: [
    {
      type: 'video',
      videoUrl:
      'https://magicpatterns.tos-ap-southeast-1.bytepluses.com/OA%20App%20-%20Launch%20Video.mp4'
    }]

  }]

},
{
  id: 5,
  lessonId: 2,
  title: 'Monetising Your Content',
  subtitle: 'Bundle 2',
  description:
  'Turn your passion into profit. Learn the strategies top creators use to monetise their content across platforms.',
  seriesCount: 3,
  totalMinutes: 15,
  price: 50,
  isFree: false,
  lessons: [
  {
    id: 23,
    title: 'Revenue Streams for Creators',
    duration: '5 mins',
    coins: 5,
    parts: [
    {
      type: 'video',
      videoUrl:
      'https://magicpatterns.tos-ap-southeast-1.bytepluses.com/OA%20App%20-%20Launch%20Video.mp4'
    },
    {
      type: 'survey',
      question: 'Which revenue stream interests you most?',
      options: [
      { id: 'sponsorships', text: 'Brand sponsorships' },
      { id: 'ads', text: 'Ad revenue' },
      { id: 'products', text: 'Selling products' },
      { id: 'courses', text: 'Online courses' }]

    }]

  },
  {
    id: 24,
    title: 'Brand Partnerships 101',
    duration: '5 mins',
    coins: 5,
    parts: [
    {
      type: 'video',
      videoUrl:
      'https://magicpatterns.tos-ap-southeast-1.bytepluses.com/OA%20App%20-%20Launch%20Video.mp4'
    }]

  },
  {
    id: 25,
    title: 'Scaling Your Income',
    duration: '5 mins',
    coins: 5,
    parts: [
    {
      type: 'video',
      videoUrl:
      'https://magicpatterns.tos-ap-southeast-1.bytepluses.com/OA%20App%20-%20Launch%20Video.mp4'
    }]

  }]

},
// ---- Beyond The Profile: Personal Branding on LinkedIn (lessonId: 3) ----
{
  id: 6,
  lessonId: 3,
  title: 'Build Your Brand Foundation',
  subtitle: 'Bundle 1',
  description:
  'Craft a LinkedIn profile that stands out. Learn how to define your personal brand, optimise your headline and summary, and make a strong first impression.',
  seriesCount: 3,
  totalMinutes: 15,
  price: 0,
  isFree: true,
  lessons: [
  {
    id: 30,
    title: 'Defining Your Personal Brand',
    duration: '5 mins',
    coins: 0,
    parts: [
    {
      type: 'video',
      videoUrl:
      'https://magicpatterns.tos-ap-southeast-1.bytepluses.com/OA%20App%20-%20Launch%20Video.mp4'
    },
    {
      type: 'survey',
      question: 'What is your primary goal on LinkedIn?',
      options: [
      { id: 'job', text: 'Finding a new job' },
      { id: 'network', text: 'Building my network' },
      { id: 'thought', text: 'Becoming a thought leader' },
      { id: 'clients', text: 'Attracting clients' }]

    }]

  },
  {
    id: 31,
    title: 'Optimising Your LinkedIn Profile',
    duration: '5 mins',
    coins: 0,
    parts: [
    {
      type: 'video',
      videoUrl:
      'https://magicpatterns.tos-ap-southeast-1.bytepluses.com/OA%20App%20-%20Launch%20Video.mp4'
    }]

  },
  {
    id: 32,
    title: 'Building a Compelling Headline',
    duration: '5 mins',
    coins: 0,
    parts: [
    {
      type: 'video',
      videoUrl:
      'https://magicpatterns.tos-ap-southeast-1.bytepluses.com/OA%20App%20-%20Launch%20Video.mp4'
    }]

  }]

},
{
  id: 7,
  lessonId: 3,
  title: 'Content & Thought Leadership',
  subtitle: 'Bundle 2',
  description:
  'Turn your LinkedIn into a content engine. Learn to create posts that resonate, build your network strategically, and position yourself as a thought leader in your industry.',
  seriesCount: 3,
  totalMinutes: 15,
  price: 50,
  isFree: false,
  lessons: [
  {
    id: 33,
    title: 'Creating Content That Resonates',
    duration: '5 mins',
    coins: 5,
    parts: [
    {
      type: 'video',
      videoUrl:
      'https://magicpatterns.tos-ap-southeast-1.bytepluses.com/OA%20App%20-%20Launch%20Video.mp4'
    },
    {
      type: 'survey',
      question:
      'SEO is a great tool to utilise for relevancy. What will you be adopting SEO for?',
      options: [
      { id: 'blog', text: 'Blog' },
      { id: 'website', text: 'Company Website' },
      { id: 'ecommerce', text: 'E-Commerce' },
      { id: 'all', text: 'All of the above!' }]

    }]

  },
  {
    id: 34,
    title: 'Strategic Networking on LinkedIn',
    duration: '5 mins',
    coins: 5,
    parts: [
    {
      type: 'video',
      videoUrl:
      'https://magicpatterns.tos-ap-southeast-1.bytepluses.com/OA%20App%20-%20Launch%20Video.mp4'
    }]

  },
  {
    id: 35,
    title: 'Becoming a Thought Leader',
    duration: '5 mins',
    coins: 5,
    parts: [
    {
      type: 'video',
      videoUrl:
      'https://magicpatterns.tos-ap-southeast-1.bytepluses.com/OA%20App%20-%20Launch%20Video.mp4'
    }]

  }]

}];


// ============================================
// CREATORS CONTENT
// ============================================
export const CREATORS_CONTENT: Record<number, CreatorContent> = {
  1: {
    id: 1,
    name: 'Celine Ting',
    title: 'Managing Director, OpenAcademy',
    bio: 'Celine comprises the extensive know-how on building digital brands from leading digital projects across various industries and markets. With her experience and capabilities of OpenMinds. As a digital media consultant, she has worked on multiple digital marketing events, workshops and is currently a lecturer at Broadcast Media Station (BFM).'
  },
  2: {
    id: 2,
    name: 'John Smith',
    title: 'Senior Instructor',
    bio: 'John is an experienced educator with over 15 years in digital marketing and content strategy.'
  },
  3: {
    id: 3,
    name: 'Sarah Lee',
    title: 'Marketing Expert',
    bio: 'Sarah specializes in social media marketing and has helped numerous brands grow their online presence.'
  },
  4: {
    id: 4,
    name: 'Michael Chen',
    title: 'SEO Specialist',
    bio: 'Michael is a certified SEO expert with a track record of improving search rankings for major brands.'
  }
};

// ============================================
// LESSON DETAIL PAGE CONTENT (keyed by lesson ID)
// ============================================
export const LESSON_DETAIL_CONTENT: Record<
  number,
  {
    targetAudience: string[];
    learningPoints: string[];
  }> =
{
  1: {
    // Duit Yourself
    targetAudience: [
    'Young professionals looking to manage their income',
    'Young adults looking to better plan their future and retirement',
    'Anyone seeking to take control of their personal finances'],

    learningPoints: [
    'You will pick up practical ways to manage your income, structure your savings and protect yourself from bad financial habits',
    'You will learn ways to handle financial pressure and responsibilities that come through personal relationships',
    'You will have a better understanding of your financial rights along with ways to better plan for your future and retirement']

  },
  2: {
    // Make it Make Cents
    targetAudience: [
    'Aspiring content creators looking to start their journey',
    'Existing creators wanting to monetise and grow their audience',
    'Anyone curious about turning their passion into a sustainable career'],

    learningPoints: [
    'You will learn how to identify your niche and build a personal brand that resonates with your target audience',
    'You will discover proven strategies to create engaging content across multiple platforms',
    'You will understand how to monetise your content through brand deals, sponsorships, and multiple revenue streams']

  },
  3: {
    // Beyond The Profile: Personal Branding on LinkedIn
    targetAudience: [
    'Professionals looking to elevate their LinkedIn presence and personal brand',
    'Job seekers wanting to stand out to recruiters and hiring managers',
    'Entrepreneurs and freelancers aiming to attract clients through thought leadership'],

    learningPoints: [
    'You will learn how to craft a LinkedIn profile that tells a compelling story and attracts the right opportunities',
    'You will discover content strategies that position you as a credible voice in your industry',
    'You will understand how to build and nurture a professional network that opens doors for career growth and partnerships']

  }
};

// Default fallback for lessons without specific content
export const DEFAULT_LESSON_DETAIL_CONTENT = {
  targetAudience: [
  'Professionals looking to expand their skills',
  'Students seeking practical knowledge',
  'Anyone interested in personal development'],

  learningPoints: [
  'Gain practical skills you can apply immediately',
  'Learn from industry experts with real-world experience',
  'Build a foundation for continued learning and growth']

};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get For You content by ID
 */
export function getForYouContent(id: number): ContentItem | undefined {
  return FOR_YOU_CONTENT[id];
}

/**
 * Get Explore Lesson content by ID
 */
export function getExploreLessonContent(id: number): ContentItem | undefined {
  return EXPLORE_LESSONS_CONTENT[id];
}

/**
 * Get Originals content by ID
 */
export function getOriginalsContent(id: number): ContentItem | undefined {
  return ORIGINALS_CONTENT[id];
}

/**
 * Get Creator content by ID
 */
export function getCreatorContent(id: number): CreatorContent | undefined {
  return CREATORS_CONTENT[id];
}

/**
 * Get Bundles for a specific lesson by lesson ID
 */
export function getBundlesForLesson(lessonId: number): BundleContent[] {
  return BUNDLES_CONTENT.filter((b) => b.lessonId === lessonId);
}

/**
 * Get Bundle content by bundle ID
 */
export function getBundleContent(id: number): BundleContent | undefined {
  return BUNDLES_CONTENT.find((b) => b.id === id);
}

/**
 * Get lesson detail content by lesson ID
 */
export function getLessonDetailContentById(lessonId: number) {
  return LESSON_DETAIL_CONTENT[lessonId] || DEFAULT_LESSON_DETAIL_CONTENT;
}

/**
 * Search all content by keyword
 * Returns matching content items from all sections
 */
export function searchContent(query: string): {
  forYou: ContentItem[];
  exploreLessons: ContentItem[];
  originals: ContentItem[];
} {
  const normalizedQuery = query.toLowerCase().trim();

  const matchesQuery = (item: ContentItem) => {
    return (
      item.title.toLowerCase().includes(normalizedQuery) ||
      item.fullTitle.toLowerCase().includes(normalizedQuery) ||
      item.category.toLowerCase().includes(normalizedQuery) ||
      item.description.toLowerCase().includes(normalizedQuery) ||
      item.keywords.some((k) => k.toLowerCase().includes(normalizedQuery)));

  };

  return {
    forYou: Object.values(FOR_YOU_CONTENT).filter(matchesQuery),
    exploreLessons: Object.values(EXPLORE_LESSONS_CONTENT).filter(matchesQuery),
    originals: Object.values(ORIGINALS_CONTENT).filter(matchesQuery)
  };
}

/**
 * Get all content as a flat array for global search
 */
export function getAllSearchableContent(): Array<
  ContentItem & {type: 'forYou' | 'exploreLessons' | 'originals';}>
{
  return [
  ...Object.values(FOR_YOU_CONTENT).map((item) => ({
    ...item,
    type: 'forYou' as const
  })),
  ...Object.values(EXPLORE_LESSONS_CONTENT).map((item) => ({
    ...item,
    type: 'exploreLessons' as const
  })),
  ...Object.values(ORIGINALS_CONTENT).map((item) => ({
    ...item,
    type: 'originals' as const
  }))];

}