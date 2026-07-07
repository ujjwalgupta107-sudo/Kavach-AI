import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Shield, LogOut } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

export function Navbar() {
  const { isAuthenticated, user, logout } = useAuthStore();
  return (
    <header className="sticky top-0 z-50 w-full border-b border-surface-raised bg-surface-base/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-brand-cyan">
          <Shield className="h-6 w-6" />
          <span className="font-bold text-xl tracking-tight">KAVACH AI</span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-text-secondary">
          <Link to="/platform" className="hover:text-text-primary transition-colors">Platform</Link>
          <Link to="/how-it-works" className="hover:text-text-primary transition-colors">How It Works</Link>
          <Link to="/fraud-awareness" className="hover:text-text-primary transition-colors">Fraud Intelligence</Link>
          <Link to="/about" className="hover:text-text-primary transition-colors">About</Link>
        </nav>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-text-secondary hidden sm:block">
                {user?.email} ({user?.role})
              </span>
              {user?.role === 'INVESTIGATOR' && (
                <Link to="/intelligence" className="text-sm font-medium text-text-secondary hover:text-brand-cyan hidden sm:block">
                  Intelligence Platform
                </Link>
              )}
              {user?.role === 'CITIZEN' && (
                <>
                  <Link to="/shield" className="text-sm font-medium text-text-secondary hover:text-brand-cyan hidden sm:block">
                    Shield
                  </Link>
                  <Link to="/citizen/assistant" className="text-sm font-medium text-text-secondary hover:text-brand-cyan hidden sm:block">
                    AI Assistant
                  </Link>
                </>
              )}
              <button onClick={() => logout()} className="text-sm font-medium text-text-secondary hover:text-brand-cyan flex items-center gap-1">
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-sm font-medium text-text-secondary hover:text-text-primary hidden sm:block">
                Sign In
              </Link>
              <Link to="/register" className="text-sm font-medium text-text-secondary hover:text-text-primary hidden sm:block">
                Register
              </Link>
              <Link to="/shield">
                <Button size="sm">Open KAVACH Shield</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
