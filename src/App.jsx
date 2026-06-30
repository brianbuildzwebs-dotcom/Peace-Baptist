import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';

// Public pages
import Home from './pages/Home';
import About from './pages/About';
import WatchLive from './pages/WatchLive';
import Media from './pages/Media';
import BibleBelieversBroadcast from './pages/BibleBelieversBroadcast';
import Events from './pages/Events';
import PrayerRequests from './pages/PrayerRequests';
import Give from './pages/Give';
import Contact from './pages/Contact';
import Ministries from './pages/Ministries';
import DailyWalk from './pages/DailyWalk';

// Layouts
import PublicLayout from './components/church/PublicLayout';
import AdminLayout from './components/admin/AdminLayout';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminEvents from './pages/admin/AdminEvents';
import AdminForms from './pages/admin/AdminForms';
import AdminPrayers from './pages/admin/AdminPrayers';
import AdminMedia from './pages/admin/AdminMedia';
import AdminSettings from './pages/admin/AdminSettings';
import AdminDailyWalk from './pages/admin/AdminDailyWalk';
import AdminNotifications from './pages/admin/AdminNotifications';

// Auth pages
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

const AUTH_ROUTES = ['/login', '/register', '/forgot-password', '/reset-password'];

const AuthenticatedApp = () => {
  const { pathname } = useLocation();
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();
  const isAuthRoute = AUTH_ROUTES.includes(pathname);

  if ((isLoadingPublicSettings || isLoadingAuth) && !isAuthRoute) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-navy">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-gold flex items-center justify-center mx-auto mb-4">
            <span className="text-navy font-heading font-bold text-xl">P</span>
          </div>
          <div className="w-8 h-8 border-4 border-gold/20 border-t-gold rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      {/* Public pages */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/watch-live" element={<WatchLive />} />
        <Route path="/media" element={<Media />} />
        <Route path="/bible-believers-broadcast" element={<BibleBelieversBroadcast />} />
        <Route path="/events" element={<Events />} />
        <Route path="/prayer-requests" element={<PrayerRequests />} />
        <Route path="/give" element={<Give />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/ministries" element={<Ministries />} />
        <Route path="/daily-walk" element={<DailyWalk />} />
      </Route>

      {/* Auth pages */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Admin (protected) */}
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/events" element={<AdminEvents />} />
          <Route path="/admin/forms" element={<AdminForms />} />
          <Route path="/admin/prayers" element={<AdminPrayers />} />
          <Route path="/admin/media" element={<AdminMedia />} />
          <Route path="/admin/daily-walk" element={<AdminDailyWalk />} />
          <Route path="/admin/notifications" element={<AdminNotifications />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
        </Route>
      </Route>

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App