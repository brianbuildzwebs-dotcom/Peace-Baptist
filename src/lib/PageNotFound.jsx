import { Link, useLocation } from 'react-router-dom';

const ADMIN_TYPOS = new Set(['adnin', 'admim', 'amdin', 'adim']);

export default function PageNotFound() {
  const location = useLocation();
  const pageName = location.pathname.replace(/^\//, '') || 'home';
  const looksLikeAdminTypo = ADMIN_TYPOS.has(pageName.toLowerCase());

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-navy">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-7xl font-heading font-light text-white/20">404</h1>
          <div className="h-0.5 w-16 bg-gold/40 mx-auto" />
        </div>

        <div className="space-y-3">
          <h2 className="text-2xl font-heading font-semibold text-white">Page not found</h2>
          <p className="text-white/60 leading-relaxed">
            {looksLikeAdminTypo ? (
              <>
                Did you mean <strong className="text-gold">/admin</strong>? That&apos;s the admin dashboard — you&apos;ll need to log in first.
              </>
            ) : (
              <>
                <span className="font-medium text-white/80">/{pageName}</span> isn&apos;t a page on this site.
              </>
            )}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link
            to="/"
            className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium text-navy bg-gold rounded-xl hover:bg-gold-light transition-colors"
          >
            Go home
          </Link>
          {looksLikeAdminTypo ? (
            <Link
              to="/login"
              className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium text-white border border-white/20 rounded-xl hover:bg-white/10 transition-colors"
            >
              Admin login
            </Link>
          ) : (
            <Link
              to="/admin"
              className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium text-white border border-white/20 rounded-xl hover:bg-white/10 transition-colors"
            >
              Admin
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}