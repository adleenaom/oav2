import { useLocation, useNavigate } from 'react-router-dom';
import { Search, User } from 'lucide-react';

const tabs = [
  { id: 'learn', label: 'LEARN', path: '/', icon: LearnIcon },
  { id: 'discover', label: 'DISCOVER', path: '/discover', icon: DiscoverIcon },
  { id: 'profile', label: 'PROFILE', path: '/profile', icon: ProfileIcon },
];

function LearnIcon({ active }: { active: boolean }) {
  const color = active ? '#5496F7' : '#CED3D9';
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
      <rect x="3" y="7" width="10" height="16" rx="2" fill={color} stroke={color} strokeWidth="2" />
      <rect x="17" y="7" width="10" height="16" rx="2" fill={color} stroke={color} strokeWidth="2" />
    </svg>
  );
}

function DiscoverIcon({ active }: { active: boolean }) {
  return <Search size={24} color={active ? 'var(--color-gray-1)' : 'var(--color-gray-4)'} strokeWidth={2.5} />;
}

function ProfileIcon({ active }: { active: boolean }) {
  return <User size={24} color={active ? 'var(--color-gray-1)' : 'var(--color-gray-4)'} strokeWidth={2.5} />;
}

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/' || location.pathname.startsWith('/bundle') || location.pathname.startsWith('/lesson') || location.pathname.startsWith('/viewall');
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="absolute bottom-0 left-0 right-0 bg-bg-base z-50 md:hidden" style={{ boxShadow: '0px -4px 14px rgba(0,0,0,0.05)' }}>
      <div className="flex items-start justify-between">
        {tabs.map(tab => {
          const active = isActive(tab.path);
          const IconComponent = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              className="flex flex-col items-center justify-center w-[81px] h-[69px]"
            >
              <div className="flex items-center justify-center w-9 h-9">
                <IconComponent active={active} />
              </div>
              <span className={`type-tags ${active ? 'text-text-secondary' : 'text-text-disabled'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
      <div className="h-[34px] flex items-end justify-center pb-2">
        <div className="w-[134px] h-[5px] bg-label-light-primary rounded-full" />
      </div>
    </nav>
  );
}
