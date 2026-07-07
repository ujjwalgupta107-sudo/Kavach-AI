import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export function Register() {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('CITIZEN');
  const [investigatorCode, setInvestigatorCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (password !== confirmPassword) {
        throw new Error("Passwords do not match");
      }

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/v1/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          full_name: fullName, 
          password, 
          role,
          ...(role === 'INVESTIGATOR' && { investigator_code: investigatorCode }) 
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || errorData.detail || 'Registration failed');
      }

      // Automatically redirect to login after successful registration
      navigate('/login');
    } catch (err: any) {
      setError(err.message || 'An error occurred during registration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6 bg-surface-elevated/50 backdrop-blur border-surface-raised">
        <h2 className="text-2xl font-bold text-text-primary mb-6 text-center">Create Kavach Account</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-status-critical/10 border border-status-critical/50 text-status-critical text-sm rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Full Name</label>
            <Input 
              type="text" 
              value={fullName} 
              onChange={(e: any) => setFullName(e.target.value)} 
              required 
              placeholder="Enter your name" 
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Email</label>
            <Input 
              type="email" 
              value={email} 
              onChange={(e: any) => setEmail(e.target.value)} 
              required 
              placeholder="Enter your email" 
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Password</label>
            <Input 
              type="password" 
              value={password} 
              onChange={(e: any) => setPassword(e.target.value)} 
              required 
              placeholder="••••••••" 
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Confirm Password</label>
            <Input 
              type="password" 
              value={confirmPassword} 
              onChange={(e: any) => setConfirmPassword(e.target.value)} 
              required 
              placeholder="••••••••" 
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Account Type</label>
            <select 
              value={role} 
              onChange={(e: any) => setRole(e.target.value)}
              className="w-full bg-[#020617] text-white p-2 border border-surface-raised rounded-md"
            >
              <option value="CITIZEN">Citizen (Shield Platform)</option>
              <option value="INVESTIGATOR">Investigator (Intelligence Platform)</option>
            </select>
          </div>
          {role === 'INVESTIGATOR' && (
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Authorization Code</label>
              <Input 
                type="text" 
                value={investigatorCode} 
                onChange={(e: any) => setInvestigatorCode(e.target.value)} 
                required 
                placeholder="Enter access code" 
                className="w-full border-status-warning"
              />
            </div>
          )}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </Button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-sm text-text-secondary">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-cyan hover:underline">Sign In</Link>
          </p>
        </div>
      </Card>
    </div>
  );
}
