import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Play, X, ChevronRight, Check } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

const citizenSteps = [
  { path: '/shield', title: 'Citizen Shield', content: 'Input suspicious messages or audio here. The AI will analyze it in real-time.', target: '/shield' },
  { path: '/citizen/reports', title: 'Report History', content: 'Track your reported cases and analyses here.', target: '/citizen/reports' },
  { path: '/citizen/assistant', title: 'Citizen Assistant', content: 'Chat with KAVACH AI to ask questions about your safety.', target: '/citizen/assistant' }
];

const investigatorSteps = [
  { path: '/intelligence', title: 'Command Centre Dashboard', content: 'Investigators see a bird\'s eye view of all active threats and can immediately spot emerging clusters.', target: '/intelligence/cases' },
  { path: '/intelligence/cases', title: 'Cases', content: 'View list of all reported cases.', target: '/intelligence/network' },
  { path: '/intelligence/network', title: 'Fraud Network Graph', content: 'The graph reveals how cases connect through shared entities.', target: '/intelligence' }
];

export function DemoWorkflow() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();

  const demoSteps = isAuthenticated && user?.role === 'INVESTIGATOR' ? investigatorSteps : citizenSteps;

  useEffect(() => {
    if (currentStepIndex >= 0) {
      const step = demoSteps.find(s => s.path === location.pathname);
      if (step) {
         setCurrentStepIndex(demoSteps.indexOf(step));
      }
    }
  }, [location.pathname, currentStepIndex, demoSteps]);

  const startDemo = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setIsVisible(true);
    setCurrentStepIndex(0);
    navigate(demoSteps[0].path);
  };

  const endDemo = () => {
    setIsVisible(false);
    setCurrentStepIndex(-1);
  };

  const nextStep = () => {
    if (currentStepIndex < demoSteps.length - 1) {
      const next = demoSteps[currentStepIndex + 1];
      navigate(next.path);
    } else {
      endDemo();
    }
  };

  if (!isVisible && currentStepIndex === -1) {
    if (!isAuthenticated) return null; // Or show a button linking to login

    return (
      <button 
        onClick={startDemo}
        className="fixed bottom-4 right-4 z-[9999] bg-brand-cyan text-[#0F172A] px-4 py-2 rounded-full font-bold shadow-lg shadow-brand-cyan/20 hover:bg-brand-blue hover:text-white transition-all flex items-center gap-2 group"
      >
        <Play className="w-4 h-4" />
        <span className="group-hover:inline">Interactive Demo</span>
      </button>
    );
  }

  const step = demoSteps[currentStepIndex] || demoSteps[0];
  const isLast = currentStepIndex === demoSteps.length - 1;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] w-80 animate-in slide-in-from-bottom-5">
      <Card className="border-brand-cyan/50 shadow-xl shadow-brand-cyan/10 bg-surface-elevated/95 backdrop-blur">
        <div className="p-3 border-b border-surface-raised flex justify-between items-center bg-brand-cyan/5">
          <div className="text-xs font-bold text-brand-cyan uppercase tracking-wider">
            Guided Tour ({currentStepIndex + 1}/{demoSteps.length})
          </div>
          <button onClick={endDemo} className="text-text-muted hover:text-text-primary">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-4 space-y-3">
          <h3 className="font-bold text-text-primary">{step.title}</h3>
          <p className="text-sm text-text-secondary leading-relaxed">{step.content}</p>
          <div className="pt-2 flex justify-end">
            <Button size="sm" onClick={nextStep} className="flex items-center gap-1">
              {isLast ? 'Finish Tour' : 'Next Step'}
              {isLast ? <Check className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
