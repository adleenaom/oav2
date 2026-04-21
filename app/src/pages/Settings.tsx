import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, User, Lock, Bell, FileText, HelpCircle, Trash2, CreditCard, Gift, Share2, Mail } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function Settings() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const sections = [
    {
      title: 'Account',
      items: [
        { icon: User, label: 'Edit Profile', path: '/profile/edit' },
        { icon: Lock, label: 'Change Password', path: '/change-password' },
        { icon: Bell, label: 'Notifications', path: '/notifications' },
      ],
    },
    {
      title: 'Credits',
      items: [
        { icon: CreditCard, label: 'Top Up Credits', path: '/subscription' },
        { icon: Gift, label: 'Redeem Gift Code', path: '/redeem' },
        { icon: Share2, label: 'Invite Friends', path: '/referral' },
      ],
    },
    {
      title: 'Support',
      items: [
        { icon: HelpCircle, label: 'FAQ', path: '/faq' },
        { icon: Mail, label: 'Contact Us', path: '/contact' },
        { icon: FileText, label: 'Terms of Use', path: '/terms' },
        { icon: FileText, label: 'Privacy Policy', path: '/privacy' },
      ],
    },
  ];

  return (
    <div className="flex flex-col h-full bg-bg-base">
      <div className="flex-1 overflow-y-auto hide-scrollbar pb-[106px] md:pb-0">
        <div className="bg-bg-secondary">
          <div className="container-content py-6 md:py-8">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors mb-4">
              <ChevronLeft size={18} />
              <span className="type-headline-small">Back</span>
            </button>
            <h1 className="type-headline-large text-text-primary md:text-[24px]">Settings</h1>
          </div>
        </div>

        <div className="container-content section-tight">
          <div className="max-w-[480px] flex flex-col gap-8">
            {sections.map(section => (
              <div key={section.title}>
                <h2 className="type-headline-small text-text-tertiary mb-3">{section.title}</h2>
                <div className="flex flex-col gap-2">
                  {section.items.map(item => (
                    <button
                      key={item.label}
                      onClick={() => navigate(item.path)}
                      className="flex items-center gap-4 p-4 rounded-[12px] bg-bg-secondary hover:bg-gray-4/20 transition-colors text-left"
                    >
                      <item.icon size={20} className="text-text-secondary shrink-0" />
                      <span className="type-body-default text-text-primary flex-1">{item.label}</span>
                      <ChevronRight size={16} className="text-text-tertiary" />
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {/* Sign out */}
            <div>
              <h2 className="type-headline-small text-text-tertiary mb-3">Danger Zone</h2>
              <button
                onClick={() => { logout(); navigate('/'); }}
                className="flex items-center gap-4 p-4 rounded-[12px] bg-bg-secondary hover:bg-accent-magenta/10 transition-colors text-left w-full"
              >
                <Trash2 size={20} className="text-accent-magenta shrink-0" />
                <span className="type-body-default text-accent-magenta">Sign Out & Clear Data</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
