import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

interface StaticPageProps {
  title: string;
  children: React.ReactNode;
}

export default function StaticPage({ title, children }: StaticPageProps) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-full bg-bg-base">
      <div className="flex-1 overflow-y-auto hide-scrollbar pb-[106px] md:pb-0">
        <div className="bg-bg-secondary">
          <div className="container-content py-6 md:py-8">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors mb-4">
              <ChevronLeft size={18} /><span className="type-headline-small">Back</span>
            </button>
            <h1 className="type-headline-large text-text-primary md:text-[24px]">{title}</h1>
          </div>
        </div>
        <div className="container-content section-tight">
          <div className="max-w-[720px] type-body-default text-text-secondary leading-relaxed flex flex-col gap-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---- Concrete pages ----

export function TermsOfUse() {
  return (
    <StaticPage title="Terms of Use">
      <p>Welcome to OpenAcademy. By accessing or using our service, you agree to be bound by these terms.</p>
      <h2 className="type-headline-medium text-text-primary mt-4">1. Use of Service</h2>
      <p>OpenAcademy provides online learning content including video courses, lesson plans, and educational materials. You must be at least 13 years old to use this service.</p>
      <h2 className="type-headline-medium text-text-primary mt-4">2. Credits & Purchases</h2>
      <p>OA Credits are a virtual currency used to unlock premium content. Credits are non-refundable and non-transferable. Purchased content is accessible as long as your account remains active.</p>
      <h2 className="type-headline-medium text-text-primary mt-4">3. Content Ownership</h2>
      <p>All content on OpenAcademy is owned by or licensed to OpenMinds Resources. You may not reproduce, distribute, or create derivative works without permission.</p>
      <h2 className="type-headline-medium text-text-primary mt-4">4. Account Responsibility</h2>
      <p>You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account.</p>
    </StaticPage>
  );
}

export function PrivacyPolicy() {
  return (
    <StaticPage title="Privacy Policy">
      <p>Your privacy is important to us. This policy explains how we collect, use, and protect your information.</p>
      <h2 className="type-headline-medium text-text-primary mt-4">Information We Collect</h2>
      <p>We collect information you provide directly (name, email, profile data) and usage data (courses viewed, progress, preferences).</p>
      <h2 className="type-headline-medium text-text-primary mt-4">How We Use It</h2>
      <p>To provide and improve our service, personalise content recommendations, track learning progress, and communicate updates.</p>
      <h2 className="type-headline-medium text-text-primary mt-4">Data Protection</h2>
      <p>We implement appropriate security measures to protect your personal data. We do not sell your information to third parties.</p>
      <h2 className="type-headline-medium text-text-primary mt-4">Your Rights</h2>
      <p>You can access, update, or delete your personal data at any time through your account settings or by contacting us.</p>
    </StaticPage>
  );
}

export function FAQ() {
  const faqs = [
    { q: 'What are OA Credits?', a: 'OA Credits are our virtual currency. Use them to unlock bundles, lesson plans, and premium content.' },
    { q: 'How do I earn credits?', a: 'You start with 1000 credits. Top up via the Credits page, or earn them through referrals and gift codes.' },
    { q: 'What is a Bundle?', a: 'A Bundle is a series of video chapters on a specific topic. Some are free, others cost credits.' },
    { q: 'What is a Lesson Plan?', a: 'A Lesson Plan is a curated collection of Bundles forming a complete course. Complete all to earn a certificate.' },
    { q: 'Can I get a refund?', a: 'Credits are non-refundable once purchased. However, you can contact us for exceptional circumstances.' },
    { q: 'How do certificates work?', a: 'Complete all bundles in a Lesson Plan to unlock your certificate. Certificates are issued digitally.' },
  ];

  return (
    <StaticPage title="Frequently Asked Questions">
      <div className="flex flex-col gap-4">
        {faqs.map((faq, i) => (
          <details key={i} className="bg-bg-secondary rounded-[12px] p-6 group">
            <summary className="type-headline-small text-text-primary cursor-pointer list-none flex items-center justify-between">
              {faq.q}
              <ChevronLeft size={16} className="text-text-tertiary -rotate-90 group-open:rotate-90 transition-transform shrink-0 ml-2" />
            </summary>
            <p className="type-body-default text-text-secondary mt-3">{faq.a}</p>
          </details>
        ))}
      </div>
    </StaticPage>
  );
}

export function ContactUs() {
  return (
    <StaticPage title="Contact Us">
      <p>We'd love to hear from you. Reach out through any of these channels:</p>
      <div className="bg-bg-secondary rounded-[12px] p-6 flex flex-col gap-4 mt-2">
        <div>
          <p className="type-headline-small text-text-primary">Email</p>
          <a href="mailto:hello@theopenacademy.org" className="type-body-default text-action-secondary hover:underline">hello@theopenacademy.org</a>
        </div>
        <div>
          <p className="type-headline-small text-text-primary">Website</p>
          <a href="https://theopenacademy.org" target="_blank" rel="noopener noreferrer" className="type-body-default text-action-secondary hover:underline">theopenacademy.org</a>
        </div>
      </div>
    </StaticPage>
  );
}

export function Intro() {
  return (
    <StaticPage title="Welcome to OpenAcademy">
      <div className="flex flex-col items-center gap-6 py-8">
        <div className="bg-accent-yellow rounded-full p-4">
          <span className="text-[40px]">🎓</span>
        </div>
        <h2 className="type-display-large text-text-primary text-center">Learn at your own pace</h2>
        <p className="type-body-default text-text-secondary text-center max-w-[320px]">
          Watch short videos, complete quizzes, and earn certificates. All in bite-sized chunks that fit your schedule.
        </p>
      </div>
    </StaticPage>
  );
}

export function BecomeCreator() {
  return (
    <StaticPage title="Become a Creator">
      <div className="flex flex-col gap-6">
        <p>Share your knowledge with thousands of learners on OpenAcademy. As a creator, you can upload courses, earn from your content, and build your audience.</p>
        <div className="bg-bg-secondary rounded-[12px] p-6 flex flex-col gap-3">
          <h3 className="type-headline-small text-text-primary">What you get</h3>
          <ul className="flex flex-col gap-2 pl-5">
            <li className="type-body-default text-text-secondary list-disc">Upload and manage video courses</li>
            <li className="type-body-default text-text-secondary list-disc">Earn credits from your content</li>
            <li className="type-body-default text-text-secondary list-disc">Analytics dashboard for your courses</li>
            <li className="type-body-default text-text-secondary list-disc">Featured creator profile</li>
          </ul>
        </div>
        <p className="type-description text-text-tertiary">Creator applications are currently handled manually. Contact us at <a href="mailto:creators@theopenacademy.org" className="text-action-secondary hover:underline">creators@theopenacademy.org</a> to get started.</p>
      </div>
    </StaticPage>
  );
}

export function SuggestedCreators() {
  return <StaticPage title="Suggested Creators"><p>Discover creators is available on the Discover page.</p></StaticPage>;
}
