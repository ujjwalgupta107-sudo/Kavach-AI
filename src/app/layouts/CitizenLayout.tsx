import { Outlet, Navigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

/**
 * ShieldLayout — public layout for Kavach Shield pages.
 * NO authentication required. Any visitor can access /shield and /shield/result/:id.
 */
export function ShieldLayout() {
  const { isAuthenticated, user } = useAuthStore();

  const handleLogout = () => {
    useAuthStore.getState().logout();
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface-base">
      <header className="border-b border-surface-raised p-4 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold text-brand-cyan hover:opacity-80 transition-opacity">
          KAVACH Shield
        </Link>
        <div className="flex items-center gap-4">
          <div className="text-sm text-text-muted">Citizen Interface</div>
          {isAuthenticated ? (
            <button
              className="text-sm text-text-secondary hover:text-white transition-colors"
              onClick={handleLogout}
            >
              Logout ({user?.email})
            </button>
          ) : (
            <Link to="/login" className="text-sm text-text-secondary hover:text-white transition-colors">
              Sign In
            </Link>
          )}
        </div>
      </header>
      
      <main className="flex-1 p-4 md:p-8 max-w-4xl mx-auto w-full">
        <Outlet />
      </main>
    </div>
  );
}

/**
 * CitizenLayout — protected layout for citizen-specific pages that require auth.
 * Used for /shield/reports (personal history) etc.
 */
export function CitizenLayout() {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return <div className="min-h-screen bg-surface-base flex items-center justify-center text-brand-cyan">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-surface-base">
      <header className="border-b border-surface-raised p-4 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold text-brand-cyan hover:opacity-80 transition-opacity">
          KAVACH Shield
        </Link>
        <div className="flex items-center gap-4">
          <div className="text-sm text-text-muted">Citizen Interface</div>
          <Link to="/citizen/assistant" className="text-sm text-text-secondary hover:text-brand-cyan transition-colors">
            AI Assistant
          </Link>
          <button
            className="text-sm text-text-secondary hover:text-white transition-colors"
            onClick={() => useAuthStore.getState().logout()}
          >
            Logout
          </button>
        </div>
      </header>
      
      <main className="flex-1 p-4 md:p-8 max-w-4xl mx-auto w-full">
        <Outlet />
      </main>
    </div>
  );
}
