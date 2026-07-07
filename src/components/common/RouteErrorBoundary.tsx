import { useRouteError, Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';

export function RouteErrorBoundary() {
  const error = useRouteError() as any;

  return (
    <div className="min-h-screen bg-[#060b14] flex flex-col items-center justify-center p-4 text-center">
      <AlertTriangle className="w-16 h-16 text-status-critical mb-4" />
      <h1 className="text-3xl font-bold text-white mb-2">Oops! Something went wrong</h1>
      <p className="text-text-secondary max-w-md mb-8">
        {error?.statusText || error?.message || "An unexpected error occurred while loading this page."}
      </p>
      <Link 
        to="/" 
        className="px-6 py-2 bg-brand-cyan text-[#0F172A] rounded font-bold hover:bg-brand-blue hover:text-white transition-colors"
      >
        Return to Home
      </Link>
    </div>
  );
}
