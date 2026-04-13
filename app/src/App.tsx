import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import TopNav from './components/TopNav';
import BottomNav from './components/BottomNav';
import { AuthProvider } from './hooks/useAuth';

// Pages
import LearnHome from './pages/LearnHome';
import ForYouPlayer from './pages/ForYouPlayer';
import BundleDetail from './pages/BundleDetail';
import LessonDetail from './pages/LessonDetail';
import ViewAll from './pages/ViewAll';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import ChangePassword from './pages/ChangePassword';
import Discover from './pages/Discover';
import CreatorProfile from './pages/CreatorProfile';
import Notifications from './pages/Notifications';
import Magazine from './pages/Magazine';
import Liked from './pages/Liked';
import Subscription from './pages/Subscription';
import RedeemCode from './pages/RedeemCode';
import Referral from './pages/Referral';
import Settings from './pages/Settings';
import ChapterPlayer from './pages/ChapterPlayer';
import { TermsOfUse, PrivacyPolicy, FAQ, ContactUs, Intro, BecomeCreator } from './pages/StaticPage';

function AppLayout() {
  const location = useLocation();
  const isFullscreen = location.pathname.startsWith('/foryou') || location.pathname.startsWith('/play');
  const isAuthPage = ['/login', '/register', '/forgot-password', '/intro'].includes(location.pathname);
  const hideChrome = isFullscreen || isAuthPage;

  return (
    <div className="h-full relative flex flex-col">
      {!hideChrome && <TopNav />}
      <div className="flex-1 min-h-0 relative">
        <Routes>
          {/* Core */}
          <Route path="/" element={<LearnHome />} />
          <Route path="/foryou/:index" element={<ForYouPlayer />} />
          <Route path="/play/:bundleId/:chapterIndex" element={<ChapterPlayer />} />
          <Route path="/bundle/:id" element={<BundleDetail />} />
          <Route path="/lesson/:id" element={<LessonDetail />} />
          <Route path="/viewall/:type" element={<ViewAll />} />

          {/* Auth */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/intro" element={<Intro />} />

          {/* Navigation tabs */}
          <Route path="/discover" element={<Discover />} />
          <Route path="/notifications" element={<Notifications />} />

          {/* Profile & account */}
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/edit" element={<EditProfile />} />
          <Route path="/change-password" element={<ChangePassword />} />
          <Route path="/settings" element={<Settings />} />

          {/* Content */}
          <Route path="/creator/:id" element={<CreatorProfile />} />
          <Route path="/magazine" element={<Magazine />} />
          <Route path="/liked" element={<Liked />} />

          {/* Commerce */}
          <Route path="/subscription" element={<Subscription />} />
          <Route path="/redeem" element={<RedeemCode />} />
          <Route path="/referral" element={<Referral />} />

          {/* Legal & support */}
          <Route path="/terms" element={<TermsOfUse />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/become-creator" element={<BecomeCreator />} />
        </Routes>
        {!hideChrome && <BottomNav />}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppLayout />
      </AuthProvider>
    </BrowserRouter>
  );
}
