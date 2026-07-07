import { Outlet, Navigate, Link } from 'react-router-dom';
import { Sidebar } from '../../components/common/Sidebar';
import { useAuthStore } from '../../stores/authStore';

export function InvestigatorLayout() {
  const { user, isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return <div className="min-h-screen bg-surface-base flex items-center justify-center text-brand-cyan">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'INVESTIGATOR' && user?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-surface-base flex items-center justify-center">
        <div className="bg-surface-raised p-8 rounded-xl border border-red-500 max-w-md text-center">
          <h2 className="text-2xl font-bold text-red-500 mb-4">Access Denied</h2>
          <p className="text-gray-300 mb-6">Investigator access required. Your account does not have clearance for the Intelligence Platform.</p>
          <Link to="/shield" className="px-4 py-2 bg-brand-blue text-white rounded hover:bg-opacity-80 transition-opacity">
            Return to Citizen Tools
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-surface-base">
      <Sidebar />
      
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="border-b border-surface-raised p-4 flex justify-between items-center md:hidden shrink-0">
           <h1 className="text-xl font-bold text-brand-cyan">Command Centre</h1>
        </header>
        <main className="flex-1 p-4 md:p-8 overflow-auto bg-[#0b1120]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
