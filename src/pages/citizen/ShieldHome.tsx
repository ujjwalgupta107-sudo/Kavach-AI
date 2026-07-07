import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { MessageSquareWarning, Image as ImageIcon, Mic, FileText, Loader2, Upload } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { apiClient, API_BASE_URL } from '../../services/api/client';

const SAMPLE_SCAM_MESSAGE = "Your Aadhaar has been linked to an illegal parcel. A CBI case has been registered. Do not disconnect this call or inform your family. Transfer ₹50,000 to the verification account immediately.";

export function ShieldHome() {
  const [activeTab, setActiveTab] = useState(0); // 0: Message, 1: Screenshot, 2: Audio, 3: Describe
  const [text, setText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStage, setAnalysisStage] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  // Simulated file states
  const [fileName, setFileName] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const tabs = [
    { icon: MessageSquareWarning, label: 'Suspicious Message' },
    { icon: ImageIcon, label: 'Screenshot' },
    { icon: Mic, label: 'Call Recording' },
    { icon: FileText, label: 'Describe Incident' },
  ];

  const handleSimulatedUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setFileName(file.name);
    setIsAnalyzing(true);
    setError(null);
    
    if (activeTab === 1) {
      setAnalysisStage('Extracting text from image via OCR...');
      setTimeout(() => {
        setText("SIMULATED OCR RESULT:\nDear customer, your bank account is blocked. Update KYC immediately at http://kyc-update-bank.in or account will be frozen.");
        setIsAnalyzing(false);
        setAnalysisStage('');
      }, 1500);
    } else if (activeTab === 2) {
      setAnalysisStage('Transcribing audio via Speech-to-Text...');
      setTimeout(() => {
        setText("SIMULATED TRANSCRIPTION:\nHello sir, I am calling from TRAI. Your number will be blocked in 2 hours because of illegal activities. Please press 9 for verification.");
        setIsAnalyzing(false);
        setAnalysisStage('');
      }, 2000);
    }
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  const handleAnalyze = async () => {
    if (!text.trim()) return;
    
    setIsAnalyzing(true);
    setError(null);
    setAnalysisStage('Reading content...');
    
    setTimeout(() => setAnalysisStage('Detecting scam patterns...'), 700);
    setTimeout(() => setAnalysisStage('Extracting suspicious entities...'), 1400);
    setTimeout(() => setAnalysisStage('Checking related intelligence...'), 2000);
    
    try {
      if (isAuthenticated) {
        // Authenticated: create a real case through the pipeline
        const result = await apiClient.post<any>('/api/v1/cases/', {
          description: text,
          source: 'WEB',
          status: 'OPEN'
        });
        navigate(`/shield/result/${result.id}`, { state: { result } });
      } else {
        // Public: stateless analysis — no case created, no auth required
        const response = await fetch(`${API_BASE_URL}/api/v1/public/analyze`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text }),
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData?.detail || errData?.error?.message || 'Analysis failed. Please try again.');
        }

        const result = await response.json();
        // Adapt public result to the shape AnalyzeResult expects
        const adapted = {
          id: 'public-analysis',
          riskScore: result.risk_score,
          riskLevel: result.risk_level,
          predictedType: result.scam_category,
          explanation: result.explanation,
          redFlags: result.red_flags,
          extractedEntities: result.extracted_entities.map((e: any) => ({
            type: e.type,
            value: e.value,
            maskedValue: null,
            connectedCaseIds: [],
          })),
          recommendedActions: result.recommended_actions,
        };
        navigate('/shield/result/public', { state: { result: adapted } });
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold mb-2">What would you like KAVACH to check?</h2>
        <p className="text-text-secondary">Analyze suspicious content to get an immediate risk assessment.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {tabs.map((item, i) => {
          const Icon = item.icon;
          const active = activeTab === i;
          return (
            <Card 
              key={i} 
              onClick={() => { setActiveTab(i); setFileName(null); if(i!==1 && i!==2) setText(''); }}
              className={`cursor-pointer transition-colors ${active ? 'border-brand-cyan bg-brand-cyan/5' : 'hover:border-surface-raised/80'}`}
            >
              <CardContent className="p-6 flex flex-col items-center justify-center text-center gap-4 h-32">
                <Icon className={`w-8 h-8 ${active ? 'text-brand-cyan' : 'text-text-muted'}`} />
                <span className={`font-medium ${active ? 'text-brand-cyan' : 'text-text-secondary'}`}>{item.label}</span>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="border-surface-raised bg-surface-base shadow-lg">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">{tabs[activeTab].label} Analysis</h3>
            {(activeTab === 0 || activeTab === 3) && (
              <button 
                onClick={() => setText(SAMPLE_SCAM_MESSAGE)}
                className="text-xs text-brand-cyan hover:underline"
              >
                Use sample message
              </button>
            )}
          </div>
          
          {(activeTab === 1 || activeTab === 2) && !text ? (
            <div className="w-full h-40 bg-surface-elevated border border-dashed border-surface-raised rounded-md flex flex-col items-center justify-center mb-4 cursor-pointer hover:border-brand-cyan transition-colors" onClick={triggerUpload}>
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-8 h-8 text-brand-cyan animate-spin mb-2" />
                  <p className="text-text-secondary text-sm">{analysisStage}</p>
                </>
              ) : (
                <>
                  <Upload className="w-8 h-8 text-text-muted mb-2" />
                  <p className="text-text-secondary text-sm">Click to upload {activeTab === 1 ? 'Screenshot (.jpg, .png)' : 'Call Recording (.mp3, .wav)'}</p>
                  <p className="text-text-muted text-xs mt-1">(Simulated upload & extraction)</p>
                </>
              )}
              <input type="file" className="hidden" ref={fileInputRef} onChange={handleSimulatedUpload} accept={activeTab === 1 ? "image/*" : "audio/*"} />
            </div>
          ) : (
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={isAnalyzing || (activeTab === 1 || activeTab === 2)}
              placeholder={activeTab === 3 ? "Describe the incident or phone call in detail..." : "Paste the suspicious SMS, WhatsApp message, email, or conversation here."}
              className="w-full h-40 bg-surface-elevated border border-surface-raised rounded-md p-4 text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-cyan resize-none mb-4"
            />
          )}

          {fileName && text && (activeTab === 1 || activeTab === 2) && (
            <div className="mb-4 text-sm text-brand-cyan flex items-center justify-between bg-brand-cyan/10 p-2 rounded">
              <span>Extracted from: {fileName}</span>
              <button onClick={() => {setText(''); setFileName(null);}} className="hover:underline">Clear File</button>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-status-critical/10 border border-status-critical/50 text-status-critical text-sm rounded">
              {error}
            </div>
          )}
          
          <div className="flex justify-between items-center">
            <div className="text-xs text-text-muted">
              {text.length} characters
            </div>
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                onClick={() => { setText(''); setError(null); setFileName(null); }}
                disabled={isAnalyzing || !text}
              >
                Clear
              </Button>
              <Button 
                onClick={handleAnalyze} 
                disabled={isAnalyzing || !text.trim()}
                className="w-32"
              >
                {isAnalyzing && (activeTab === 0 || activeTab === 3 || (text && fileName)) ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyzing
                  </div>
                ) : 'Analyze'}
              </Button>
            </div>
          </div>
          
          {isAnalyzing && (activeTab === 0 || activeTab === 3 || (text && fileName)) && (
            <div className="mt-4 p-3 bg-brand-cyan/10 border border-brand-cyan/20 rounded-md text-sm text-brand-cyan flex items-center justify-center gap-3">
               <Loader2 className="w-4 h-4 animate-spin" />
               {analysisStage}
            </div>
          )}
        </CardContent>
      </Card>

      {!isAuthenticated && (
        <p className="text-xs text-text-muted text-center">
          Analysis results are not saved. <a href="/login" className="text-brand-cyan hover:underline">Sign in</a> to keep a personal history of your analyses.
        </p>
      )}
    </div>
  );
}
