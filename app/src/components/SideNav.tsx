import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { BookOpen, Search, Heart, Bell, Settings, LogOut, ChevronLeft, ChevronRight, User } from 'lucide-react';
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
  const { user, isLoggedIn, logout } = useAuth();
  const { credits } = useCredits();
  const { likes } = useLikes();
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem(NAV_KEY) === '1');

  const toggle = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem(NAV_KEY, next ? '1' : '0');
  };

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
      {/* Logo + collapse */}
      <div className={cn('flex items-center h-16 px-4 shrink-0', collapsed ? 'justify-center' : 'justify-between')}>
        <button onClick={() => navigate('/')} className="flex items-center gap-2.5 min-w-0">
          <img src={oaLogo} alt="OA" className="h-8 w-8 shrink-0" />
          {!collapsed && <span className="type-headline-medium text-text-primary truncate">OpenAcademy</span>}
        </button>
        {!collapsed && (
          <button onClick={toggle} className="w-7 h-7 rounded-md hover:bg-bg-secondary flex items-center justify-center shrink-0">
            <ChevronLeft size={16} className="text-text-tertiary" />
          </button>
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
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      {/* Credits */}
      {isLoggedIn && (
        <div className={cn('px-3 mb-2', collapsed && 'flex justify-center')}>
          <button
            onClick={() => navigate('/subscription')}
            className={cn(
              'flex items-center gap-2 rounded-[10px] transition-colors',
              collapsed ? 'justify-center py-2.5 px-0 w-full hover:bg-bg-secondary' : 'px-3 py-2 bg-bg-secondary w-full'
            )}
            title={collapsed ? `${credits} credits` : undefined}
          >
            <CoinIcon size={16} />
            {!collapsed && (
              <>
                <span className="type-description font-semibold text-text-primary">{credits}</span>
                <span className="type-pre-text text-text-tertiary">credits</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* User / Sign in */}
      <div className="px-3 pb-4">
        {isLoggedIn ? (
          <div className={cn('flex flex-col gap-1')}>
            <button
              onClick={() => navigate('/profile')}
              className={cn(
                'flex items-center gap-3 rounded-[10px] transition-colors',
                collapsed ? 'justify-center py-2.5' : 'px-3 py-2.5',
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
                  <p className="type-pre-text text-text-tertiary truncate">{user?.email}</p>
                </div>
              )}
            </button>

            {!collapsed && (
              <div className="flex gap-1">
                <button
                  onClick={() => navigate('/settings')}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-[8px] text-text-tertiary hover:bg-bg-secondary hover:text-text-primary transition-colors"
                >
                  <Settings size={14} />
                  <span className="type-pre-text">Settings</span>
                </button>
                <button
                  onClick={() => { logout(); navigate('/'); }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-[8px] text-text-tertiary hover:bg-accent-magenta/10 hover:text-accent-magenta transition-colors"
                >
                  <LogOut size={14} />
                  <span className="type-pre-text">Sign Out</span>
                </button>
              </div>
            )}

            {collapsed && (
              <>
                <button
                  onClick={() => navigate('/settings')}
                  className="flex items-center justify-center py-2.5 rounded-[10px] text-text-tertiary hover:bg-bg-secondary transition-colors"
                  title="Settings"
                >
                  <Settings size={18} />
                </button>
                <button
                  onClick={() => { logout(); navigate('/'); }}
                  className="flex items-center justify-center py-2.5 rounded-[10px] text-text-tertiary hover:bg-accent-magenta/10 hover:text-accent-magenta transition-colors"
                  title="Sign Out"
                >
                  <LogOut size={18} />
                </button>
              </>
            )}
          </div>
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
