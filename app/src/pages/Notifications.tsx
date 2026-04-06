import { useNavigate } from 'react-router-dom';
import { Bell, BellOff } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import OAButton from '../components/OAButton';

export default function Notifications() {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col h-full bg-bg-base">
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="flex flex-col items-center gap-6 max-w-[300px]">
            <BellOff size={40} className="text-text-tertiary" />
            <h2 className="type-headline-large text-text-primary text-center">Sign in for notifications</h2>
            <OAButton variant="primary" size="medium" fullWidth onClick={() => navigate('/login')}>Sign In</OAButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-bg-base">
      <div className="flex-1 overflow-y-auto hide-scrollbar pb-[106px] md:pb-0">
        <div className="bg-bg-secondary">
          <div className="container-content py-6 md:py-8">
            <h1 className="type-headline-large text-text-primary md:text-[24px]">Notifications</h1>
          </div>
        </div>
        <div className="container-content section-tight">
          <div className="flex flex-col items-center gap-4 py-12">
            <Bell size={40} className="text-text-tertiary" />
            <p className="type-body-default text-text-tertiary text-center">No notifications yet</p>
            <p className="type-description text-text-tertiary text-center max-w-[260px]">When you get updates about your courses or new content, they'll appear here.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
