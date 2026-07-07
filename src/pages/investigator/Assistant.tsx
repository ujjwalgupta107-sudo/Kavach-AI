import { useState, useRef, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { apiClient } from '../../services/api/client';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
}

export function Assistant() {
  const { user } = useAuthStore();
  const isCitizen = user?.role === 'CITIZEN';
  
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'assistant', content: isCitizen ? 
        'Hello Citizen. I am the KAVACH AI assistant. I can guide you on reporting scams and staying safe. How can I help?' : 
        'Hello Investigator. I am the KAVACH AI assistant. I have access to all cases, entity graphs, and live alerts. How can I assist you today?' 
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const data = await apiClient.post<any>('/api/v1/assistant/chat', { message: userMsg });
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: data.reply }]);
    } catch (error) {
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: 'Connection Error: Could not reach the assistant service.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-4xl mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-brand-cyan/20 text-brand-cyan rounded-lg">
          <Sparkles className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">KAVACH AI Assistant</h2>
          <p className="text-text-secondary">{isCitizen ? 'Your safety companion.' : 'Your intelligent investigation partner.'}</p>
        </div>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden bg-[#0b1120] border-surface-raised">
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6"
        >
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-4 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-brand-blue text-white' : 'bg-surface-raised text-brand-cyan border border-brand-cyan/30'}`}>
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-5 h-5" />}
              </div>
              
              <div className={`p-4 rounded-xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-brand-blue text-white rounded-tr-sm' : 'bg-surface-elevated border border-surface-raised rounded-tl-sm text-text-primary'}`}>
                {msg.content}
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="flex gap-4 max-w-[85%]">
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-surface-raised text-brand-cyan border border-brand-cyan/30">
                <Bot className="w-5 h-5" />
              </div>
              <div className="p-4 rounded-xl bg-surface-elevated border border-surface-raised rounded-tl-sm flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-brand-cyan animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-brand-cyan animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-brand-cyan animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
        </div>

        <div className="p-4 bg-surface-elevated border-t border-surface-raised">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about cases, entities, or ask to summarize cluster FC-019..." 
              className="flex-1 bg-surface-base"
              disabled={loading}
            />
            <Button type="submit" disabled={!input.trim() || loading} className="shrink-0 flex items-center gap-2">
              <Send className="w-4 h-4" /> 
              <span className="hidden sm:inline">Send</span>
            </Button>
          </form>
          <div className="mt-2 text-center text-xs text-text-muted">
            AI Assistant can make mistakes. Verify critical intelligence.
          </div>
        </div>
      </Card>
    </div>
  );
}
