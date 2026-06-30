import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ADMIN_MFA_REQUIRED_EVENT,
  getMfaAssuranceLevel,
  listTotpFactors,
  needsMfaChallenge,
  resolveAdminMfaGateState,
} from '@/lib/mfa';
import MfaChallenge from '@/components/auth/MfaChallenge';
import MfaSettings from '@/components/auth/MfaSettings';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { withTimeout } from '@/lib/with-timeout';

const Loading = () => (
  <div className="min-h-screen bg-[#0B1120] flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-gold/20 border-t-gold rounded-full animate-spin" />
  </div>
);

export default function MfaGate({ children, mode = 'default' }) {
  const [status, setStatus] = useState('loading');
  const [gateError, setGateError] = useState('');
  const statusRef = useRef('loading');

  const setGateStatus = useCallback((nextStatus) => {
    statusRef.current = nextStatus;
    setStatus(nextStatus);
  }, []);

  const refresh = useCallback(
    async ({ silent = false } = {}) => {
      if (!silent) {
        setGateError('');
        setGateStatus('loading');
      }

      try {
        if (mode === 'admin') {
          const [level, factors] = await Promise.all([
            withTimeout(
              getMfaAssuranceLevel(),
              10000,
              'Security check timed out. Check your connection and try again.'
            ),
            listTotpFactors(),
          ]);
          setGateStatus(resolveAdminMfaGateState(level, factors));
          return;
        }

        const level = await withTimeout(
          getMfaAssuranceLevel(),
          10000,
          'Security check timed out. Check your connection and try again.'
        );
        setGateStatus(needsMfaChallenge(level) ? 'challenge' : 'ready');
      } catch (error) {
        setGateError(error.message || 'Security check failed');
        setGateStatus('error');
      }
    },
    [mode, setGateStatus]
  );

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        setGateStatus('loading');
        return;
      }
      if (event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        const silent = statusRef.current === 'ready' || statusRef.current === 'challenge';
        refresh({ silent });
      }
    });

    return () => subscription.unsubscribe();
  }, [refresh, setGateStatus]);

  useEffect(() => {
    if (mode !== 'admin') return undefined;

    const handleMfaRequired = () => {
      setGateStatus('challenge');
    };

    window.addEventListener(ADMIN_MFA_REQUIRED_EVENT, handleMfaRequired);
    return () => window.removeEventListener(ADMIN_MFA_REQUIRED_EVENT, handleMfaRequired);
  }, [mode, setGateStatus]);

  if (status === 'loading') return <Loading />;

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-[#0B1120] flex items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 space-y-4 text-center">
          <p className="text-sm text-red-300">{gateError}</p>
          <div className="flex flex-col gap-2">
            <Button onClick={() => refresh()}>Retry security check</Button>
            <Link to="/login" className="text-sm text-gold hover:underline">
              Sign in again
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'enroll') {
    return (
      <div className="min-h-screen bg-[#0B1120] flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-lg space-y-4">
          <div className="text-center space-y-2">
            <h1 className="text-xl font-semibold text-white font-heading">Set up admin MFA</h1>
            <p className="text-sm text-white/50">
              The admin panel requires an authenticator app before it can load data.
            </p>
          </div>
          <MfaSettings variant="admin" emphasizeAdmin onEnrolled={() => refresh()} />
        </div>
      </div>
    );
  }

  if (status === 'challenge') {
    return <MfaChallenge onVerified={() => refresh()} />;
  }

  return children;
}