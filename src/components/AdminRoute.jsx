import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import ProtectedRoute from '@/components/ProtectedRoute';

const Loading = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-[#0B1120]">
    <div className="w-8 h-8 border-4 border-gold/20 border-t-gold rounded-full animate-spin" />
  </div>
);

function AdminRoleGate() {
  const [state, setState] = useState('loading');

  useEffect(() => {
    let cancelled = false;

    base44.auth.me()
      .then((user) => {
        if (cancelled) return;
        setState(user?.role === 'admin' ? 'allowed' : 'denied');
      })
      .catch(() => {
        if (!cancelled) setState('denied');
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (state === 'loading') return <Loading />;
  if (state === 'denied') return <Navigate to="/login" replace />;
  return <Outlet />;
}

export default function AdminRoute({ unauthenticatedElement }) {
  return (
    <ProtectedRoute unauthenticatedElement={unauthenticatedElement}>
      <AdminRoleGate />
    </ProtectedRoute>
  );
}