import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, Bell, Heart, CreditCard, Settings, Gift, LogOut, ChevronRight } from 'lucide-react';
import oaLogo from '../assets/OA-Logo.png';
import { useAuth } from '../hooks/useAuth';
import { useCredits } from '../hooks/useCredits';
import { useLikes } from '../hooks/useLikes';
import { cn } from '@/lib/utils';

const tabs = [
  { id: 'learn', label: 'Learn', path: '/' },
  { id: 'discover', label: 'Discover', path: '/discover' },
];

export default function TopNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isLoggedIn, logout } = useAuth();
  const { credits } = useCredits();
  const { likes } = useLikes();
  const [scrolled, setScrolled] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    const onNestedScroll = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.scrollTop > 8) setScrolled(true);
      else setScrolled(false);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    const scrollContainers = document.querySelectorAll('.overflow-y-auto');
    scrollContainers.forEach(el => el.addEventListener('scroll', onNestedScroll, { passive: true }));

    return () => {
      window.removeEventListener('scroll', onScroll);
      scrollContainers.forEach(el => el.removeEventListener('scroll', onNestedScroll));
    };
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    if (!profileOpen) return;
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [profileOpen]);

  // Close dropdown on route change
  useEffect(() => { setProfileOpen(false); }, [location.pathname]);

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/' || location.pathname.startsWith('/lesson') || location.pathname.startsWith('/bundle') || location.pathname.startsWith('/foryou');
    return location.pathname.startsWith(path);
  };

  const menuItems = [
    { icon: Heart, label: 'My Likes', path: '/liked', count: likes.length || undefined },
    { icon: CreditCard, label: 'Top Up Credits', path: '/subscription' },
    { icon: Gift, label: 'Redeem Code', path: '/redeem' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  return (
    <header
      className={cn(
        "hidden md:block w-full sticky top-0 z-50 transition-[background-color,border-color,box-shadow] duration-200",
        scrolled
          ? "bg-bg-base border-b border-border-default shadow-sm"
          : "bg-transparent border-b border-transparent"
      )}
    >
      <div className="flex items-center justify-between h-16 px-8 lg:px-12">
        {/* Logo */}
        <button onClick={() => navigate('/')} className="flex items-center gap-2 nav-item rounded-lg px-2 py-1">
          <img src={oaLogo} alt="OpenAcademy" className="h-8 w-auto" />
          <span className="type-headline-large text-text-primary">OpenAcademy</span>
        </button>

        {/* Nav tabs */}
        <nav className="flex items-center gap-1">
          {tabs.map(tab => {
            const active = isActive(tab.path);
            return (
              <button
                key={tab.id}
                onClick={() => navigate(tab.path)}
                className={`nav-item px-4 py-2 rounded-lg type-headline-small ${
                  active
                    ? 'text-text-primary bg-bg-secondary'
                    : 'text-text-secondary'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          <button className="nav-item w-9 h-9 rounded-full bg-bg-secondary flex items-center justify-center">
            <Search size={18} className="text-text-secondary" />
          </button>
          <button onClick={() => navigate('/notifications')} className="nav-item w-9 h-9 rounded-full bg-bg-secondary flex items-center justify-center">
            <Bell size={18} className="text-text-secondary" />
          </button>

          {isLoggedIn ? (
            <div ref={profileRef} className="relative">
              {/* Credits badge */}
              <div className="flex items-center gap-2">
                <div className="bg-bg-secondary rounded-lg px-3 py-1.5 flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-accent-yellow" />
                  <span className="type-description font-semibold text-text-primary">{credits}</span>
                </div>

                {/* Profile avatar button */}
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className={cn(
                    "flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors",
                    profileOpen ? "bg-bg-secondary" : "hover:bg-bg-secondary"
                  )}
                >
                  <div className="w-8 h-8 rounded-full bg-action-secondary flex items-center justify-center">
                    <span className="text-[12px] font-bold text-white">{user?.name?.charAt(0).toUpperCase()}</span>
                  </div>
                </button>
              </div>

              {/* Dropdown menu */}
              {profileOpen && (
                <div
                  className="absolute top-full right-0 mt-2 w-[260px] bg-bg-elevated rounded-[12px] py-2 z-50"
                  style={{ boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }}
                >
                  {/* User info */}
                  <button
                    onClick={() => navigate('/profile')}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-bg-secondary transition-colors text-left"
                  >
                    <div className="w-10 h-10 rounded-full bg-action-secondary flex items-center justify-center shrink-0">
                      <span className="text-[14px] font-bold text-white">{user?.name?.charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="type-headline-small text-text-primary truncate">{user?.name}</p>
                      <p className="type-pre-text text-text-tertiary truncate">{user?.email}</p>
                    </div>
                    <ChevronRight size={14} className="text-text-tertiary shrink-0" />
                  </button>

                  <div className="h-px bg-border-default my-1" />

                  {/* Menu items */}
                  {menuItems.map(item => (
                    <button
                      key={item.label}
                      onClick={() => navigate(item.path)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-bg-secondary transition-colors text-left"
                    >
                      <item.icon size={16} className="text-text-secondary shrink-0" />
                      <span className="type-body-default text-text-primary flex-1">{item.label}</span>
                      {item.count && item.count > 0 && (
                        <span className="type-pre-text text-text-tertiary">{item.count}</span>
                      )}
                    </button>
                  ))}

                  <div className="h-px bg-border-default my-1" />

                  {/* Sign out */}
                  <button
                    onClick={() => { logout(); navigate('/'); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-accent-magenta/5 transition-colors text-left"
                  >
                    <LogOut size={16} className="text-accent-magenta shrink-0" />
                    <span className="type-body-default text-accent-magenta">Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="nav-item px-4 py-2 rounded-lg bg-action-primary text-text-on-dark type-button hover:bg-[#333] transition-colors"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
