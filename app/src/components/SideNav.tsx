import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { BookOpen, Search, Heart, Bell, MoreHorizontal, Settings, PanelLeft, User } from 'lucide-react';
import oaLogo from '../assets/OA-Logo.png';
import { useAuth } from '../hooks/useAuth';
import { useCredits } from '../hooks/useCredits';
import { useLikes } from '../hooks/useLikes';
import CoinIcon from './CoinIcon';
import { cn } from '@/lib/utils';

const NAV_KEY = 'oa_sidenav_collapsed';

export default function SideNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();
  const { credits } = useCredits();
  const { likes } = useLikes();
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem(NAV_KEY) === '1');
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const toggle = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem(NAV_KEY, next ? '1' : '0');
    setMenuOpen(false);
  };

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  // Close menu on route change
  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/' || location.pathname.startsWith('/lesson') || location.pathname.startsWith('/bundle') || location.pathname.startsWith('/foryou') || location.pathname.startsWith('/viewall');
    return location.pathname.startsWith(path);
  };

  const mainNav = [
    { icon: BookOpen, label: 'Learn', path: '/' },
    { icon: Search, label: 'Discover', path: '/discover' },
  ];

  const secondaryNav = [
    { icon: Heart, label: 'My Likes', path: '/liked', count: likes.length || undefined },
    { icon: Bell, label: 'Notifications', path: '/notifications' },
  ];

  return (
    <aside
      className={cn(
        'hidden md:flex flex-col h-full bg-bg-base border-r border-border-default shrink-0 transition-[width] duration-200 z-40',
        collapsed ? 'w-[72px]' : 'w-[240px]'
      )}
    >
      {/* Logo + three-dots menu */}
      <div className={cn('flex items-center h-16 px-4 shrink-0', collapsed ? 'justify-center' : 'justify-between')}>
        <button onClick={() => navigate('/')} className="flex items-center gap-2.5 min-w-0">
          <img src={oaLogo} alt="OA" className="h-8 w-8 shrink-0" />
          {!collapsed && <span className="type-headline-medium text-text-primary truncate">OpenAcademy</span>}
        </button>
        {!collapsed && (
          <div ref={menuRef} className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="w-7 h-7 rounded-md hover:bg-bg-secondary flex items-center justify-center shrink-0"
            >
              <MoreHorizontal size={16} className="text-text-tertiary" />
            </button>
            {menuOpen && (
              <div className="absolute top-8 left-0 bg-bg-elevated rounded-[10px] py-1.5 min-w-[180px] z-50" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.12)' }}>
                <button
                  onClick={toggle}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-bg-secondary transition-colors text-left"
                >
                  <PanelLeft size={16} className="text-text-secondary" />
                  <span className="type-body-default text-text-primary">Toggle Sidebar</span>
                </button>
                <button
                  onClick={() => { setMenuOpen(false); navigate('/settings'); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-bg-secondary transition-colors text-left"
                >
                  <Settings size={16} className="text-text-secondary" />
                  <span className="type-body-default text-text-primary">Settings</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main navigation */}
      <nav className="flex flex-col gap-1 px-3 mt-2">
        {mainNav.map(item => {
          const active = isActive(item.path);
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                'flex items-center gap-3 rounded-[10px] transition-colors text-left',
                collapsed ? 'justify-center px-0 py-2.5' : 'px-3 py-2.5',
                active
                  ? 'bg-action-secondary/10 text-action-secondary'
                  : 'text-text-secondary hover:bg-bg-secondary hover:text-text-primary'
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon size={20} className="shrink-0" />
              {!collapsed && <span className="type-body-default font-medium">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="h-px bg-border-default mx-4 my-3" />

      {/* Secondary */}
      <nav className="flex flex-col gap-1 px-3">
        {secondaryNav.map(item => {
          const active = isActive(item.path);
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                'flex items-center gap-3 rounded-[10px] transition-colors text-left relative',
                collapsed ? 'justify-center px-0 py-2.5' : 'px-3 py-2.5',
                active
                  ? 'bg-action-secondary/10 text-action-secondary'
                  : 'text-text-secondary hover:bg-bg-secondary hover:text-text-primary'
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon size={20} className="shrink-0" />
              {!collapsed && <span className="type-body-default">{item.label}</span>}
              {item.count && item.count > 0 && (
                <span className={cn(
                  'bg-accent-magenta text-white text-[10px] font-bold rounded-full flex items-center justify-center',
                  collapsed ? 'absolute -top-0.5 -right-0.5 w-4 h-4' : 'ml-auto w-5 h-5'
                )}>
                  {item.count > 9 ? '9+' : item.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Collapse toggle (when collapsed) */}
      {collapsed && (
        <div className="px-3 mb-2">
          <button
            onClick={toggle}
            className="w-full flex items-center justify-center py-2.5 rounded-[10px] text-text-tertiary hover:bg-bg-secondary hover:text-text-primary transition-colors"
            title="Expand sidebar"
          >
            <PanelLeft size={18} />
          </button>
        </div>
      )}

      {/* User / Sign in */}
      <div className="px-3 pb-4">
        {isLoggedIn ? (
          <button
            onClick={() => navigate('/profile')}
            className={cn(
              'flex items-center gap-3 rounded-[10px] transition-colors w-full',
              collapsed ? 'flex-col justify-center py-2.5' : 'px-3 py-2.5',
              'text-text-secondary hover:bg-bg-secondary hover:text-text-primary'
            )}
            title={collapsed ? user?.name : undefined}
          >
            <div className="w-8 h-8 rounded-full bg-action-secondary flex items-center justify-center shrink-0">
              <span className="text-[12px] font-bold text-white">{user?.name?.charAt(0).toUpperCase()}</span>
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0 text-left">
                <p className="type-description font-semibold text-text-primary truncate">{user?.name}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <CoinIcon size={12} />
                  <span className="type-pre-text text-text-tertiary">{credits} credits</span>
                </div>
              </div>
            )}
            {collapsed && (
              <div className="flex items-center gap-1">
                <CoinIcon size={10} />
                <span className="text-[9px] text-text-tertiary font-semibold">{credits}</span>
              </div>
            )}
          </button>
        ) : (
          <button
            onClick={() => navigate('/login')}
            className={cn(
              'flex items-center gap-3 rounded-[10px] bg-action-primary text-white transition-colors hover:bg-[#333] w-full',
              collapsed ? 'justify-center py-2.5' : 'px-3 py-2.5'
            )}
          >
            <User size={18} />
            {!collapsed && <span className="type-button">Sign In</span>}
          </button>
        )}
      </div>
    </aside>
  );
}
