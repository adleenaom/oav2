import type { Creator, ForYouVideo, Bundle, LessonPlan, Chapter } from './types';
import {
  FOR_YOU_IMAGES,
  EXPLORE_LESSONS_IMAGES,
  ORIGINALS_IMAGES,
  LESSON_DETAIL_BACKGROUNDS,
  BUNDLE_THUMBNAILS,
  CREATOR_AVATARS,
  BANNER_IMAGES,
} from '../assets/images';
import {
  PLACEHOLDER_VIDEO_URL,
  DUIT_YOURSELF_VIDEO_URLS,
  FOR_YOU_VIDEO_URLS,
} from '../assets/videos';

// ============================================
// CREATORS
// ============================================
export const creators: Creator[] = [
  { id: 1, name: 'Celine Ting', title: 'Managing Director, OpenAcademy', bio: 'Celine comprises the extensive know-how on building digital brands from leading digital projects across various industries and markets.', avatar: CREATOR_AVATARS.celineTing },
  { id: 2, name: 'John Smith', title: 'Senior Instructor', bio: 'John is an experienced educator with over 15 years in digital marketing and content strategy.', avatar: CREATOR_AVATARS.johnSmith },
  { id: 3, name: 'Sarah Lee', title: 'Marketing Expert', bio: 'Sarah specializes in social media marketing and has helped numerous brands grow their online presence.', avatar: CREATOR_AVATARS.sarahLee },
  { id: 4, name: 'Michael Chen', title: 'SEO Specialist', bio: 'Michael is a certified SEO expert with a track record of improving search rankings for major brands.', avatar: CREATOR_AVATARS.michaelChen },
];

// ============================================
// FOR YOU VIDEOS
// ============================================
export const forYouVideos: ForYouVideo[] = [
  { id: 1, type: 'foryou', title: 'BEFORE I DO', fullTitle: 'Before I Do', category: 'RELATIONSHIPS', description: 'Essential conversations and preparations for couples before marriage. Build a strong foundation for your future together.', keywords: ['before', 'marriage', 'wedding', 'couples', 'relationships', 'love', 'commitment'], seriesCount: 7, totalMinutes: 42, thumbnail: FOR_YOU_IMAGES.contentCreation, videoUrl: FOR_YOU_VIDEO_URLS[1] || PLACEHOLDER_VIDEO_URL },
  { id: 2, type: 'foryou', title: 'SIMPAN ATAU MELABUR', fullTitle: 'Simpan atau Melabur', category: 'FINANCE', description: 'Understand the difference between saving and investing. Make informed decisions about your money.', keywords: ['simpan', 'melabur', 'saving', 'investing', 'finance', 'money', 'investment'], seriesCount: 9, totalMinutes: 55, thumbnail: FOR_YOU_IMAGES.socialMediaStrategy, videoUrl: FOR_YOU_VIDEO_URLS[2] || PLACEHOLDER_VIDEO_URL },
  { id: 3, type: 'foryou', title: 'MONEY TALK', fullTitle: 'Money Talk with Yuva', category: 'FINANCE', description: 'Real conversations about money management for young professionals. Learn practical financial tips.', keywords: ['money', 'talk', 'yuva', 'finance', 'financial', 'tips', 'young', 'professionals'], seriesCount: 6, totalMinutes: 35, thumbnail: FOR_YOU_IMAGES.emailMarketing, videoUrl: FOR_YOU_VIDEO_URLS[3] || PLACEHOLDER_VIDEO_URL },
  { id: 4, type: 'foryou', title: 'PDPA ACT', fullTitle: 'Understanding PDPA Act', category: 'LEGAL', description: 'Learn about the Personal Data Protection Act and how it affects you and your business.', keywords: ['pdpa', 'data', 'protection', 'privacy', 'legal', 'act', 'law', 'compliance'], seriesCount: 8, totalMinutes: 48, thumbnail: FOR_YOU_IMAGES.analyticsData, videoUrl: FOR_YOU_VIDEO_URLS[4] || PLACEHOLDER_VIDEO_URL },
];

// ============================================
// CHAPTERS — keyed by bundle ID
// ============================================
const chaptersMap: Record<number, Chapter[]> = {
  // --- Lesson Plan bundles (lessonId !== null) ---
  // Bundle 1: What's In Your Paycheque (Duit Yourself)
  1: [
    { id: 1, title: 'How Much Do I Actually Make', duration: '5 mins', coins: 0, thumbnail: BUNDLE_THUMBNAILS.howMuchDoIMake, parts: [{ type: 'video', videoUrl: DUIT_YOURSELF_VIDEO_URLS.howMuchDoIMake }, { type: 'survey', question: 'What surprised you most about paycheck deductions?', options: [{ id: 'tax', text: 'Tax deductions' }, { id: 'epf', text: 'EPF contributions' }, { id: 'socso', text: 'SOCSO deductions' }, { id: 'all', text: 'All of the above!' }] }, { type: 'image', imageUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80', caption: 'Understanding your paycheck breakdown: Gross pay vs. Net pay' }] },
    { id: 2, title: 'Understanding Deductions', duration: '5 mins', coins: 0, thumbnail: BUNDLE_THUMBNAILS.understandingDeductions, parts: [{ type: 'video', videoUrl: DUIT_YOURSELF_VIDEO_URLS.understandingDeductions }] },
  ],
  // Bundle 2: Personal Finances As A Gig Worker
  2: [
    { id: 5, title: 'Challengers Gig Workers Face', duration: '5 mins', coins: 5, thumbnail: BUNDLE_THUMBNAILS.contentPlanning, parts: [{ type: 'video', videoUrl: PLACEHOLDER_VIDEO_URL }, { type: 'survey', question: 'Which gig work challenge affects you most?', options: [{ id: 'income', text: 'Inconsistent income' }, { id: 'benefits', text: 'Lack of benefits' }, { id: 'planning', text: 'Financial planning' }, { id: 'taxes', text: 'Tax management' }] }] },
    { id: 6, title: 'Inconsistent Income Earners', duration: '5 mins', coins: 5, thumbnail: BUNDLE_THUMBNAILS.writingTips, parts: [{ type: 'video', videoUrl: PLACEHOLDER_VIDEO_URL }] },
    { id: 7, title: 'Gig Working Requires Goals & Motivations', duration: '5 mins', coins: 5, thumbnail: BUNDLE_THUMBNAILS.visualContent, parts: [{ type: 'video', videoUrl: PLACEHOLDER_VIDEO_URL }] },
    { id: 8, title: 'Securing Your Future - Retirement', duration: '5 mins', coins: 5, thumbnail: BUNDLE_THUMBNAILS.distribution, parts: [{ type: 'video', videoUrl: PLACEHOLDER_VIDEO_URL }, { type: 'survey', question: 'Have you started planning for retirement?', options: [{ id: 'yes', text: 'Yes, actively saving' }, { id: 'thinking', text: 'Thinking about it' }, { id: 'no', text: 'Not yet' }, { id: 'unsure', text: 'Not sure where to start' }] }] },
  ],
  // Bundle 3: Pengurusan Hutang & BNPL
  3: [
    { id: 9, title: 'Parangkap Hutang', duration: '5 mins', coins: 5, thumbnail: BUNDLE_THUMBNAILS.adPlatforms, parts: [{ type: 'video', videoUrl: PLACEHOLDER_VIDEO_URL }] },
    { id: 10, title: 'Hutang Pengguna di Malaysia', duration: '5 mins', coins: 5, thumbnail: BUNDLE_THUMBNAILS.targeting, parts: [{ type: 'video', videoUrl: PLACEHOLDER_VIDEO_URL }, { type: 'survey', question: 'Adakah anda menggunakan BNPL?', options: [{ id: 'yes', text: 'Ya, kerap' }, { id: 'sometimes', text: 'Kadang-kadang' }, { id: 'no', text: 'Tidak' }, { id: 'unsure', text: 'Tidak pasti' }] }] },
    { id: 11, title: 'Beli Sekarang Bayar Kemudian', duration: '5 mins', coins: 5, thumbnail: BUNDLE_THUMBNAILS.budgetManagement, parts: [{ type: 'video', videoUrl: PLACEHOLDER_VIDEO_URL }] },
    { id: 12, title: 'Manfaat menggunakan BNPL', duration: '5 mins', coins: 5, thumbnail: BUNDLE_THUMBNAILS.optimization, parts: [{ type: 'video', videoUrl: PLACEHOLDER_VIDEO_URL }] },
  ],
  // Bundle 4: Getting Started as a Creator (Make it Make Cents)
  4: [
    { id: 20, title: 'Finding Your Niche', duration: '5 mins', coins: 0, thumbnail: EXPLORE_LESSONS_IMAGES.financialPlanning, parts: [{ type: 'video', videoUrl: PLACEHOLDER_VIDEO_URL }, { type: 'survey', question: 'What type of content do you want to create?', options: [{ id: 'educational', text: 'Educational content' }, { id: 'entertainment', text: 'Entertainment' }, { id: 'lifestyle', text: 'Lifestyle & vlogs' }, { id: 'business', text: 'Business & finance' }] }] },
    { id: 21, title: 'Building Your Brand', duration: '5 mins', coins: 0, thumbnail: EXPLORE_LESSONS_IMAGES.financialPlanning, parts: [{ type: 'video', videoUrl: PLACEHOLDER_VIDEO_URL }] },
    { id: 22, title: 'Content That Connects', duration: '5 mins', coins: 0, thumbnail: EXPLORE_LESSONS_IMAGES.financialPlanning, parts: [{ type: 'video', videoUrl: PLACEHOLDER_VIDEO_URL }] },
  ],
  // Bundle 5: Monetising Your Content
  5: [
    { id: 23, title: 'Revenue Streams for Creators', duration: '5 mins', coins: 5, thumbnail: EXPLORE_LESSONS_IMAGES.financialPlanning, parts: [{ type: 'video', videoUrl: PLACEHOLDER_VIDEO_URL }, { type: 'survey', question: 'Which revenue stream interests you most?', options: [{ id: 'sponsorships', text: 'Brand sponsorships' }, { id: 'ads', text: 'Ad revenue' }, { id: 'products', text: 'Selling products' }, { id: 'courses', text: 'Online courses' }] }] },
    { id: 24, title: 'Brand Partnerships 101', duration: '5 mins', coins: 5, thumbnail: EXPLORE_LESSONS_IMAGES.financialPlanning, parts: [{ type: 'video', videoUrl: PLACEHOLDER_VIDEO_URL }] },
    { id: 25, title: 'Scaling Your Income', duration: '5 mins', coins: 5, thumbnail: EXPLORE_LESSONS_IMAGES.financialPlanning, parts: [{ type: 'video', videoUrl: PLACEHOLDER_VIDEO_URL }] },
  ],
  // Bundle 6: Build Your Brand Foundation (Beyond The Profile)
  6: [
    { id: 30, title: 'Defining Your Personal Brand', duration: '5 mins', coins: 0, thumbnail: EXPLORE_LESSONS_IMAGES.personalBrandingLinkedIn, parts: [{ type: 'video', videoUrl: PLACEHOLDER_VIDEO_URL }, { type: 'survey', question: 'What is your primary goal on LinkedIn?', options: [{ id: 'job', text: 'Finding a new job' }, { id: 'network', text: 'Building my network' }, { id: 'thought', text: 'Becoming a thought leader' }, { id: 'clients', text: 'Attracting clients' }] }] },
    { id: 31, title: 'Optimising Your LinkedIn Profile', duration: '5 mins', coins: 0, thumbnail: EXPLORE_LESSONS_IMAGES.personalBrandingLinkedIn, parts: [{ type: 'video', videoUrl: PLACEHOLDER_VIDEO_URL }] },
    { id: 32, title: 'Building a Compelling Headline', duration: '5 mins', coins: 0, thumbnail: EXPLORE_LESSONS_IMAGES.personalBrandingLinkedIn, parts: [{ type: 'video', videoUrl: PLACEHOLDER_VIDEO_URL }] },
  ],
  // Bundle 7: Content & Thought Leadership
  7: [
    { id: 33, title: 'Creating Content That Resonates', duration: '5 mins', coins: 5, thumbnail: EXPLORE_LESSONS_IMAGES.personalBrandingLinkedIn, parts: [{ type: 'video', videoUrl: PLACEHOLDER_VIDEO_URL }, { type: 'survey', question: 'What will you be adopting SEO for?', options: [{ id: 'blog', text: 'Blog' }, { id: 'website', text: 'Company Website' }, { id: 'ecommerce', text: 'E-Commerce' }, { id: 'all', text: 'All of the above!' }] }] },
    { id: 34, title: 'Strategic Networking on LinkedIn', duration: '5 mins', coins: 5, thumbnail: EXPLORE_LESSONS_IMAGES.personalBrandingLinkedIn, parts: [{ type: 'video', videoUrl: PLACEHOLDER_VIDEO_URL }] },
    { id: 35, title: 'Becoming a Thought Leader', duration: '5 mins', coins: 5, thumbnail: EXPLORE_LESSONS_IMAGES.personalBrandingLinkedIn, parts: [{ type: 'video', videoUrl: PLACEHOLDER_VIDEO_URL }] },
  ],

  // --- Standalone bundles (lessonId === null, shown in Originals) ---
  // IDs 101+ to avoid clashing with lesson-plan bundle IDs
  101: [
    { id: 101, title: 'Who is Nicky Lim?', duration: '8 mins', coins: 0, thumbnail: ORIGINALS_IMAGES.seoMasterclass, parts: [{ type: 'video', videoUrl: PLACEHOLDER_VIDEO_URL }] },
    { id: 102, title: 'The Fastlane Mindset', duration: '10 mins', coins: 5, thumbnail: ORIGINALS_IMAGES.seoMasterclass, parts: [{ type: 'video', videoUrl: PLACEHOLDER_VIDEO_URL }] },
  ],
  103: [
    { id: 103, title: 'Meet Dr. Munirah', duration: '7 mins', coins: 0, thumbnail: ORIGINALS_IMAGES.socialMediaMastery, parts: [{ type: 'video', videoUrl: PLACEHOLDER_VIDEO_URL }] },
    { id: 104, title: 'The Story Behind R.A.C.E', duration: '9 mins', coins: 5, thumbnail: ORIGINALS_IMAGES.socialMediaMastery, parts: [{ type: 'video', videoUrl: PLACEHOLDER_VIDEO_URL }] },
  ],
  104: [
    { id: 105, title: 'Meet Your Instructor', duration: '6 mins', coins: 0, thumbnail: ORIGINALS_IMAGES.analyticsPro, parts: [{ type: 'video', videoUrl: PLACEHOLDER_VIDEO_URL }] },
    { id: 106, title: 'What is Projection Mapping', duration: '8 mins', coins: 0, thumbnail: ORIGINALS_IMAGES.analyticsPro, parts: [{ type: 'video', videoUrl: PLACEHOLDER_VIDEO_URL }] },
  ],
  105: [
    { id: 107, title: 'Getting Started with Web Dev', duration: '10 mins', coins: 5, thumbnail: ORIGINALS_IMAGES.webDevelopment, parts: [{ type: 'video', videoUrl: PLACEHOLDER_VIDEO_URL }] },
  ],
  106: [
    { id: 108, title: 'Design Fundamentals', duration: '8 mins', coins: 0, thumbnail: ORIGINALS_IMAGES.graphicDesign, parts: [{ type: 'video', videoUrl: PLACEHOLDER_VIDEO_URL }] },
  ],
  107: [
    { id: 109, title: 'Transformative Leadership', duration: '10 mins', coins: 5, thumbnail: ORIGINALS_IMAGES.realTalk, parts: [{ type: 'video', videoUrl: PLACEHOLDER_VIDEO_URL }] },
    { id: 110, title: 'Leading Beyond The Short Term', duration: '8 mins', coins: 5, thumbnail: ORIGINALS_IMAGES.realTalk, parts: [{ type: 'video', videoUrl: PLACEHOLDER_VIDEO_URL }] },
  ],
  108: [
    { id: 111, title: 'Customer Experience Intro', duration: '7 mins', coins: 0, thumbnail: ORIGINALS_IMAGES.peopleFirst, parts: [{ type: 'video', videoUrl: PLACEHOLDER_VIDEO_URL }] },
    { id: 112, title: 'Personalisation and Why it Matters', duration: '9 mins', coins: 5, thumbnail: ORIGINALS_IMAGES.peopleFirst, parts: [{ type: 'video', videoUrl: PLACEHOLDER_VIDEO_URL }] },
  ],
};

// ============================================
// ALL BUNDLES — lesson-plan bundles + standalone originals
// ============================================

interface BundleRaw {
  id: number;
  lessonId: number | null;
  title: string;
  subtitle: string;
  description: string;
  category: string;
  seriesCount: number;
  totalMinutes: number;
  price: number;
  isFree: boolean;
  creatorId: number;
  thumbnail?: string; // override for standalone bundles
}

const bundleDefinitions: BundleRaw[] = [
  // --- Part of lesson plans ---
  { id: 1, lessonId: 1, title: "What's In Your Paycheque?", subtitle: 'Bundle 1', description: 'Understand your paycheck, deductions, and take-home pay', category: 'FINANCE', seriesCount: 2, totalMinutes: 20, price: 0, isFree: true, creatorId: 1 },
  { id: 2, lessonId: 1, title: 'Personal Finances As A Gig Worker', subtitle: 'Bundle 2', description: 'Calling your own shots sounds dreamy until paychecks bounce. Learn how to keep cash flowing and build a future that works for you.', category: 'FINANCE', seriesCount: 4, totalMinutes: 20, price: 50, isFree: false, creatorId: 1 },
  { id: 3, lessonId: 1, title: 'Pengurusan Hutang & BNPL', subtitle: 'Bundle 3', description: 'Hutang & BNPL di hujung jari, tapi risiko tersembunyi menanti. Ketahui cara bijak urus hutang, guna BNPL dengan disiplin, dan elak perangkap kewangan.', category: 'FINANCE', seriesCount: 4, totalMinutes: 20, price: 50, isFree: false, creatorId: 2 },
  { id: 4, lessonId: 2, title: 'Getting Started as a Creator', subtitle: 'Bundle 1', description: 'Lay the groundwork for your content creation journey. Learn how to find your niche, build your brand, and create content that stands out.', category: 'CONTENT CREATION', seriesCount: 3, totalMinutes: 15, price: 0, isFree: true, creatorId: 3 },
  { id: 5, lessonId: 2, title: 'Monetising Your Content', subtitle: 'Bundle 2', description: 'Turn your passion into profit. Learn the strategies top creators use to monetise their content across platforms.', category: 'CONTENT CREATION', seriesCount: 3, totalMinutes: 15, price: 50, isFree: false, creatorId: 3 },
  { id: 6, lessonId: 3, title: 'Build Your Brand Foundation', subtitle: 'Bundle 1', description: 'Craft a LinkedIn profile that stands out. Learn how to define your personal brand, optimise your headline and summary.', category: 'PERSONAL BRANDING', seriesCount: 3, totalMinutes: 15, price: 0, isFree: true, creatorId: 4 },
  { id: 7, lessonId: 3, title: 'Content & Thought Leadership', subtitle: 'Bundle 2', description: 'Turn your LinkedIn into a content engine. Learn to create posts that resonate, build your network, and position yourself as a thought leader.', category: 'PERSONAL BRANDING', seriesCount: 3, totalMinutes: 15, price: 50, isFree: false, creatorId: 4 },

  // --- Standalone bundles (Originals) — lessonId: null ---
  { id: 101, lessonId: null, title: 'Driven: Lessons From The Fastlane', subtitle: 'DRIVEN', description: 'A thoughtful series about resilience and purpose. Learn from successful entrepreneurs who built their dreams from the ground up.', category: 'ENTREPRENEURSHIP', seriesCount: 12, totalMinutes: 90, price: 10, isFree: false, creatorId: 1, thumbnail: ORIGINALS_IMAGES.seoMasterclass },
  { id: 103, lessonId: null, title: 'R.A.C.E Framework', subtitle: 'R.A.C.E', description: 'A comprehensive series exploring race, bias, and building inclusive workplaces.', category: 'DIVERSITY & INCLUSION', seriesCount: 10, totalMinutes: 75, price: 5, isFree: false, creatorId: 2, thumbnail: ORIGINALS_IMAGES.socialMediaMastery },
  { id: 104, lessonId: null, title: 'Illuminate: Projection Mapping', subtitle: 'ILLUMINATE', description: 'Discover the art and technology of projection mapping. From basics to advanced techniques.', category: 'CREATIVE', seriesCount: 9, totalMinutes: 68, price: 0, isFree: true, creatorId: 3, thumbnail: ORIGINALS_IMAGES.analyticsPro },
  { id: 105, lessonId: null, title: 'Web Development Fundamentals', subtitle: 'WEB DEV', description: 'Learn to build modern websites and web applications.', category: 'TECHNOLOGY', seriesCount: 15, totalMinutes: 120, price: 10, isFree: false, creatorId: 4, thumbnail: ORIGINALS_IMAGES.webDevelopment },
  { id: 106, lessonId: null, title: 'Graphic Design Essentials', subtitle: 'DESIGN', description: 'Master the fundamentals of visual design and branding.', category: 'CREATIVE', seriesCount: 8, totalMinutes: 55, price: 0, isFree: true, creatorId: 3, thumbnail: ORIGINALS_IMAGES.graphicDesign },
  { id: 107, lessonId: null, title: 'Real Talk Real Business', subtitle: 'REAL TALK', description: 'Authentic conversations about leadership, ethics, and building a positive workplace culture.', category: 'BUSINESS', seriesCount: 10, totalMinutes: 50, price: 10, isFree: false, creatorId: 2, thumbnail: ORIGINALS_IMAGES.realTalk },
  { id: 108, lessonId: null, title: 'People-First: Customer Experience', subtitle: 'PEOPLE FIRST', description: 'Put people at the center of your digital strategy. Learn to create meaningful customer journeys.', category: 'CUSTOMER EXPERIENCE', seriesCount: 8, totalMinutes: 55, price: 5, isFree: false, creatorId: 1, thumbnail: ORIGINALS_IMAGES.peopleFirst },
];

function getLessonThumbnail(lessonId: number): string {
  const map: Record<number, string> = {
    1: EXPLORE_LESSONS_IMAGES.duitYourself,
    2: EXPLORE_LESSONS_IMAGES.financialPlanning,
    3: EXPLORE_LESSONS_IMAGES.personalBrandingLinkedIn,
  };
  return map[lessonId] || EXPLORE_LESSONS_IMAGES.duitYourself;
}

export const bundles: Bundle[] = bundleDefinitions.map(b => ({
  ...b,
  type: 'bundle' as const,
  chapters: chaptersMap[b.id] || [],
  thumbnail: b.thumbnail || (b.lessonId ? getLessonThumbnail(b.lessonId) : EXPLORE_LESSONS_IMAGES.duitYourself),
  creator: creators.find(c => c.id === b.creatorId) || creators[0],
}));

// ============================================
// FILTERED VIEWS
// ============================================

/** Bundles that belong to a lesson plan */
export const lessonBundles = bundles.filter(b => b.lessonId !== null);

/** Standalone bundles shown in OpenAcademy Originals grid */
export const standaloneBundles = bundles.filter(b => b.lessonId === null);

/** Get bundles for a specific lesson plan */
export function getBundlesForLesson(lessonId: number): Bundle[] {
  return bundles.filter(b => b.lessonId === lessonId);
}

// ============================================
// LESSON PLANS
// ============================================
export const lessonPlans: LessonPlan[] = [
  {
    id: 1, type: 'lesson', title: 'Duit Yourself', fullTitle: 'Duit Yourself', category: 'FINANCE',
    description: "Money matters made simple, relatable and real! From first jobs to retirement dreams, we're breaking down personal finance for the modern hustle.",
    keywords: ['duit', 'yourself', 'finance', 'money', 'personal', 'budget', 'paycheque'],
    seriesCount: 11, totalMinutes: 2, rating: 4.8, reviews: 0, lessonPlanCoins: 2000,
    thumbnail: EXPLORE_LESSONS_IMAGES.duitYourself, background: LESSON_DETAIL_BACKGROUNDS.duitYourself,
    bundles: getBundlesForLesson(1),
    targetAudience: ['Young professionals looking to manage their income', 'Young adults looking to better plan their future and retirement', 'Anyone seeking to take control of their personal finances'],
    learningPoints: ['You will pick up practical ways to manage your income, structure your savings and protect yourself from bad financial habits', 'You will learn ways to handle financial pressure and responsibilities that come through personal relationships', 'You will have a better understanding of your financial rights along with ways to better plan for your future and retirement'],
    certificateOnCompletion: true,
  },
  {
    id: 2, type: 'lesson', title: 'Make it Make Cents', fullTitle: 'Make it Make Cents', category: 'CONTENT CREATION',
    description: "Whether you're just getting started or already dabbling in content creation, this series is your ultimate guide to building strong foundations, levelling up your skills, and turning your content into coin.",
    keywords: ['content', 'creation', 'make', 'cents', 'creator', 'social media', 'monetize'],
    seriesCount: 10, totalMinutes: 3, rating: 4.8, reviews: 124, lessonPlanCoins: 1500,
    thumbnail: EXPLORE_LESSONS_IMAGES.financialPlanning, background: LESSON_DETAIL_BACKGROUNDS.financialPlanning,
    bundles: getBundlesForLesson(2),
    targetAudience: ['Aspiring content creators looking to start their journey', 'Existing creators wanting to monetise and grow their audience', 'Anyone curious about turning their passion into a sustainable career'],
    learningPoints: ['You will learn how to identify your niche and build a personal brand that resonates with your target audience', 'You will discover proven strategies to create engaging content across multiple platforms', 'You will understand how to monetise your content through brand deals, sponsorships, and multiple revenue streams'],
    certificateOnCompletion: true,
  },
  {
    id: 3, type: 'lesson', title: 'Beyond The Profile', fullTitle: 'Beyond The Profile: Personal Branding on LinkedIn', category: 'PERSONAL BRANDING',
    description: "Your LinkedIn profile is more than a digital resume — it's your personal brand. This series teaches you how to craft a compelling presence, create content that positions you as a thought leader, and leverage LinkedIn to open doors.",
    keywords: ['personal', 'branding', 'linkedin', 'profile', 'networking', 'career'],
    seriesCount: 8, totalMinutes: 3, rating: 4.6, reviews: 87, lessonPlanCoins: 1800,
    thumbnail: EXPLORE_LESSONS_IMAGES.personalBrandingLinkedIn, background: LESSON_DETAIL_BACKGROUNDS.personalBrandingLinkedIn,
    bundles: getBundlesForLesson(3),
    targetAudience: ['Professionals looking to elevate their LinkedIn presence and personal brand', 'Job seekers wanting to stand out to recruiters and hiring managers', 'Entrepreneurs and freelancers aiming to attract clients through thought leadership'],
    learningPoints: ['You will learn how to craft a LinkedIn profile that tells a compelling story and attracts the right opportunities', 'You will discover content strategies that position you as a credible voice in your industry', 'You will understand how to build and nurture a professional network that opens doors for career growth'],
    certificateOnCompletion: true,
  },
];

// ============================================
// PROMOTIONS
// ============================================
export const promotions = [
  { id: 'p1', title: 'Duit Yourself', subtitle: 'Money matters made simple', image: BANNER_IMAGES.duitYourselfBanner, color: '#FFCD4B' },
  { id: 'p2', title: 'Level up your career', subtitle: 'New courses added weekly', image: BANNER_IMAGES.featuredBanner2, color: '#67C8FF' },
];
