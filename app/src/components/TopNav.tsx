import { useLocation, useNavigate } from 'react-router-dom';
import { Search, Bell, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const tabs = [
  { id: 'learn', label: 'Learn', path: '/' },
  { id: 'discover', label: 'Discover', path: '/discover' },
];

export default function TopNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isLoggedIn, logout } = useAuth();

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/' || location.pathname.startsWith('/lesson') || location.pathname.startsWith('/bundle') || location.pathname.startsWith('/foryou');
    return location.pathname.startsWith(path);
  };

  return (
    <header className="hidden md:block bg-bg-base border-b border-border-default sticky top-0 z-50">
      <div className="container-content flex items-center justify-between h-16">
        {/* Logo */}
        <button onClick={() => navigate('/')} className="flex items-center gap-2 nav-item rounded-lg px-2 py-1">
          <div className="flex items-center gap-1.5">
            <div className="flex gap-0.5">
              <div className="w-2.5 h-4 bg-accent-blue rounded-[3px] border-2 border-action-secondary" />
              <div className="w-2.5 h-4 bg-accent-blue rounded-[3px] border-2 border-action-secondary" />
            </div>
            <span className="type-headline-large text-text-primary">OpenAcademy</span>
          </div>
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
          <button className="nav-item w-9 h-9 rounded-full bg-bg-secondary flex items-center justify-center">
            <Bell size={18} className="text-text-secondary" />
          </button>

          {isLoggedIn ? (
            <div className="flex items-center gap-2">
              {/* Credits badge */}
              <div className="bg-bg-secondary rounded-lg px-3 py-1.5 flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-accent-yellow" />
                <span className="type-description font-semibold text-text-primary">{user?.credits ?? 0}</span>
              </div>
              {/* User avatar / name */}
              <button
                onClick={logout}
                className="nav-item flex items-center gap-2 px-3 py-1.5 rounded-lg bg-bg-secondary hover:bg-gray-4/30 transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-action-secondary flex items-center justify-center">
                  <span className="text-[10px] font-bold text-white">{user?.name?.charAt(0).toUpperCase()}</span>
                </div>
                <span className="type-description font-semibold text-text-primary hidden lg:inline">{user?.name}</span>
                <LogOut size={14} className="text-text-tertiary" />
              </button>
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
