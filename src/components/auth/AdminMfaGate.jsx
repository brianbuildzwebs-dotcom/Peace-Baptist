import { Outlet } from 'react-router-dom';
import MfaGate from '@/components/auth/MfaGate';

export default function AdminMfaGate() {
  return (
    <MfaGate mode="admin">
      <Outlet />
    </MfaGate>
  );
}