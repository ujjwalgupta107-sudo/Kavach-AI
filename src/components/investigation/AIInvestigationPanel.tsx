import { useEffect, useState, useRef } from 'react';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { agentService } from '../../services/api/agentService';
import type { AgentRun } from '../../services/api/agentService';
import { Loader2, Bot, AlertTriangle, CheckCircle2, Activity, ServerCrash } from 'lucide-react';

interface Props {
  caseId: string;
}

export function AIInvestigationPanel({ caseId }: Props) {
  const [runs, setRuns] = useState<AgentRun[]>([]);
  const [currentRun, setCurrentRun] = useState<AgentRun | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const pollingRef = useRef<any>(null);

  const fetchRuns = async () => {
    try {
      const data = await agentService.getCaseRuns(caseId);
      setRuns(data);
      if (data.length > 0) {
        // If there's no explicitly selected run, select the most recent one
        if (!currentRun) {
          setCurrentRun(data[0]);
        } else {
          // Update the current run if it exists in the new data
          const updated = data.find(r => r.id === currentRun.id);
          if (updated) setCurrentRun(updated);
        }
      }
    } catch (e: any) {
      console.error(e);
      if (!runs.length) setError('Failed to load AI investigations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRuns();
  }, [caseId]);

  useEffect(() => {
    // Polling logic
    if (currentRun && (currentRun.status === 'PENDING' || currentRun.status === 'RUNNING')) {
      pollingRef.current = setInterval(async () => {
        try {
          const updated = await agentService.getRun(currentRun.id);
          setCurrentRun(updated);
          setRuns(prev => prev.map(r => r.id === updated.id ? updated : r));
          if (updated.status === 'COMPLETED' || updated.status === 'FAILED') {
            if (pollingRef.current) clearInterval(pollingRef.current);
          }
        } catch (e) {
          console.error("Polling error", e);
          // Don't kill polling on single network error, but we could add a retry counter
        }
      }, 2000);
    }

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [currentRun?.id, currentRun?.status]);

  const handleStart = async () => {
    try {
      setStarting(true);
      setError(null);
      const res = await agentService.startInvestigation(caseId);
      // Immediately set it as the current run and start polling
      const newRun: AgentRun = {
        id: res.id,
        case_id: caseId,
        status: res.status,
        provider: 'system',
        model: 'system',
        started_at: null,
        completed_at: null,
        error_message: null,
        final_brief: null,
        findings: []
      };
      setCurrentRun(newRun);
      setRuns(prev => [newRun, ...prev]);
    } catch (e: any) {
      console.error(e);
      setError('Failed to start investigation due to an internal system error. Please try again.');
    } finally {
      setStarting(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-text-muted flex justify-center"><Loader2 className="w-6 h-6 animate-spin" /></div>;

  const hasRuns = runs.length > 0;
  
  if (!hasRuns && !currentRun) {
    return (
      <Card>
        <CardContent className="p-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-brand-cyan/10 rounded-full flex items-center justify-center mb-4">
            <Bot className="w-8 h-8 text-brand-cyan" />
          </div>
          <h3 className="text-xl font-semibold text-text-primary mb-2">AI Investigator</h3>
          <p className="text-text-secondary max-w-md mb-6">
            Run an autonomous AI investigation to analyze facts, entities, network graphs, and evidence automatically.
          </p>
          {error && <div className="text-status-critical mb-4 text-sm">{error}</div>}
          <Button onClick={handleStart} disabled={starting} className="bg-brand-cyan hover:bg-brand-cyan-light text-surface-base">
            {starting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Bot className="w-4 h-4 mr-2" />}
            Investigate with AI
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!currentRun) return null;

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface-elevated p-4 rounded-lg border border-surface-raised">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${currentRun.status === 'COMPLETED' ? 'bg-brand-cyan/20 text-brand-cyan' : currentRun.status === 'FAILED' ? 'bg-status-critical/20 text-status-critical' : 'bg-brand-cyan-dim text-brand-cyan animate-pulse'}`}>
             <Bot className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-lg flex items-center gap-2">
              AI Investigation
              <span className={`text-xs px-2 py-0.5 rounded font-mono ${
                currentRun.status === 'COMPLETED' ? 'bg-status-success/20 text-status-success border border-status-success/50' :
                currentRun.status === 'FAILED' ? 'bg-status-critical/20 text-status-critical border border-status-critical/50' :
                'bg-status-warning/20 text-status-warning border border-status-warning/50'
              }`}>
                {currentRun.status}
              </span>
            </h3>
            <div className="text-xs text-text-muted mt-1">
              Provider: {currentRun.provider} • Model: {currentRun.model}
              {currentRun.completed_at && ` • Completed: ${new Date(currentRun.completed_at).toLocaleString()}`}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {runs.length > 1 && (
            <select 
              className="bg-surface-base border border-surface-raised text-text-primary text-sm rounded p-2 focus:border-brand-cyan outline-none"
              value={currentRun.id}
              onChange={(e) => {
                const r = runs.find(x => x.id === e.target.value);
                if (r) setCurrentRun(r);
              }}
            >
              {runs.map((r, i) => (
                <option key={r.id} value={r.id}>
                  Run {runs.length - i} ({new Date(r.started_at || r.created_at || '').toLocaleDateString()}) - {r.status}
                </option>
              ))}
            </select>
          )}
          {(currentRun.status === 'COMPLETED' || currentRun.status === 'FAILED') && (
            <Button onClick={handleStart} disabled={starting} variant="secondary" className="whitespace-nowrap">
              {starting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Bot className="w-4 h-4 mr-2" />}
              New Run
            </Button>
          )}
        </div>
      </div>

      {error && (
         <div className="bg-status-critical/10 border border-status-critical/50 text-status-critical p-4 rounded-lg flex items-start gap-3">
           <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
           <p className="text-sm">{error}</p>
         </div>
      )}

      {/* Progress State */}
      {(currentRun.status === 'PENDING' || currentRun.status === 'RUNNING') && (
        <Card className="border-brand-cyan/30 bg-surface-elevated overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-surface-raised overflow-hidden">
             <div className="h-full bg-brand-cyan w-1/2 animate-[progress_2s_ease-in-out_infinite]" style={{ animationDirection: 'alternate' }}></div>
          </div>
          <CardContent className="p-8">
            <h4 className="text-lg font-medium mb-6 text-center text-text-primary flex justify-center items-center gap-2">
              <Activity className="w-5 h-5 text-brand-cyan animate-pulse" /> Orchestrating AI Analysis...
            </h4>
            <div className="space-y-4 max-w-md mx-auto">
               <div className="flex items-center justify-between p-3 rounded bg-surface-base border border-brand-cyan/50 text-brand-cyan shadow-[0_0_15px_rgba(0,255,255,0.1)]">
                 <span className="text-sm font-medium">1. Case & Network Analysis</span>
                 <Loader2 className="w-4 h-4 animate-spin" />
               </div>
               <div className="flex items-center justify-between p-3 rounded bg-surface-base border border-surface-raised text-text-muted">
                 <span className="text-sm">2. Evidence & Timeline Review</span>
                 <span className="text-xs">Waiting...</span>
               </div>
               <div className="flex items-center justify-between p-3 rounded bg-surface-base border border-surface-raised text-text-muted">
                 <span className="text-sm">3. Supervisor Investigation Brief</span>
                 <span className="text-xs">Waiting...</span>
               </div>
            </div>
            <p className="text-center text-xs text-text-muted mt-6">This may take 30-60 seconds depending on the model provider.</p>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {currentRun.status === 'FAILED' && (
        <Card className="border-status-critical/50 bg-status-critical/5">
          <CardContent className="p-8 text-center flex flex-col items-center">
            <ServerCrash className="w-12 h-12 text-status-critical mb-4" />
            <h3 className="text-lg font-bold text-text-primary mb-2">Investigation Failed</h3>
            <p className="text-status-critical text-sm mb-6 max-w-lg bg-surface-base p-4 rounded border border-status-critical/20 font-mono">
              The investigation encountered a system error and could not complete. Please retry or contact support if the issue persists.
            </p>
            <Button onClick={handleStart} disabled={starting} variant="primary" className="bg-status-critical hover:bg-status-critical/80 text-white border-none">
              Retry Investigation
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Completed State */}
      {currentRun.status === 'COMPLETED' && currentRun.final_brief && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            
            {/* Executive Summary */}
            <Card className="border-brand-cyan/20">
              <CardContent className="p-6">
                <h3 className="text-sm font-semibold mb-3 text-brand-cyan uppercase flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Executive Summary
                </h3>
                <p className="text-text-primary leading-relaxed text-sm">
                  {currentRun.final_brief.executive_summary}
                </p>
                {currentRun.final_brief.priority && (
                  <div className="mt-4 inline-block px-3 py-1 bg-surface-raised text-text-primary text-xs font-bold rounded">
                    PRIORITY: {currentRun.final_brief.priority}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Findings Columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              <div className="space-y-6">
                {currentRun.final_brief.confirmed_facts && currentRun.final_brief.confirmed_facts.length > 0 && (
                  <Card>
                    <CardContent className="p-5">
                      <h4 className="text-xs font-bold text-text-secondary uppercase mb-3">Confirmed Facts</h4>
                      <ul className="space-y-2">
                        {currentRun.final_brief.confirmed_facts.map((f, i) => (
                          <li key={i} className="text-sm text-text-primary pl-4 relative before:content-[''] before:absolute before:left-0 before:top-2 before:w-1.5 before:h-1.5 before:bg-brand-cyan before:rounded-full">{f}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
                {currentRun.final_brief.key_system_signals && currentRun.final_brief.key_system_signals.length > 0 && (
                  <Card>
                    <CardContent className="p-5">
                      <h4 className="text-xs font-bold text-text-secondary uppercase mb-3">System Signals</h4>
                      <ul className="space-y-2">
                        {currentRun.final_brief.key_system_signals.map((f, i) => (
                          <li key={i} className="text-sm text-text-primary pl-4 relative before:content-[''] before:absolute before:left-0 before:top-2 before:w-1.5 before:h-1.5 before:bg-status-warning before:rounded-full">{f}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </div>

              <div className="space-y-6">
                {currentRun.final_brief.ai_assessment && currentRun.final_brief.ai_assessment.length > 0 && (
                  <Card>
                    <CardContent className="p-5">
                      <h4 className="text-xs font-bold text-text-secondary uppercase mb-3">AI Assessment</h4>
                      <ul className="space-y-2">
                        {currentRun.final_brief.ai_assessment.map((f, i) => (
                          <li key={i} className="text-sm text-text-primary pl-4 relative before:content-[''] before:absolute before:left-0 before:top-2 before:w-1.5 before:h-1.5 before:bg-brand-purple before:rounded-full">{f}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
                {currentRun.final_brief.evidence_gaps && currentRun.final_brief.evidence_gaps.length > 0 && (
                  <Card>
                    <CardContent className="p-5">
                      <h4 className="text-xs font-bold text-text-secondary uppercase mb-3">Evidence Gaps</h4>
                      <ul className="space-y-2">
                        {currentRun.final_brief.evidence_gaps.map((f, i) => (
                          <li key={i} className="text-sm text-text-primary pl-4 relative before:content-[''] before:absolute before:left-0 before:top-2 before:w-1.5 before:h-1.5 before:bg-status-critical before:rounded-full">{f}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            {/* Recommendations */}
            {currentRun.final_brief.recommended_next_actions && currentRun.final_brief.recommended_next_actions.length > 0 && (
               <Card>
                 <CardContent className="p-5 bg-surface-raised/30">
                   <h4 className="text-xs font-bold text-text-primary uppercase mb-3">Recommended Actions</h4>
                   <div className="grid gap-2">
                     {currentRun.final_brief.recommended_next_actions.map((act, i) => (
                       <div key={i} className="bg-surface-base p-3 rounded border border-surface-raised text-sm text-text-primary flex items-start gap-3">
                         <div className="text-brand-cyan font-mono font-bold mt-0.5">{i+1}.</div>
                         <div>{act}</div>
                       </div>
                     ))}
                   </div>
                 </CardContent>
               </Card>
            )}
          </div>

          <div className="space-y-6">
             {/* Source References */}
             <Card>
               <CardContent className="p-5">
                 <h4 className="text-xs font-bold text-text-secondary uppercase mb-3">Traceability / Source Refs</h4>
                 <div className="flex flex-wrap gap-2">
                   {currentRun.final_brief.source_refs && currentRun.final_brief.source_refs.length > 0 ? (
                     currentRun.final_brief.source_refs.map((ref, i) => (
                       <span key={i} className="px-2 py-1 text-[10px] font-mono bg-surface-raised text-text-secondary rounded border border-surface-raised/50 flex items-center gap-1">
                         {ref.substring(0, 8)}...
                       </span>
                     ))
                   ) : (
                     <span className="text-xs text-text-muted">No specific references cited.</span>
                   )}
                 </div>
               </CardContent>
             </Card>

             {/* Deep Dive Raw Findings Toggle */}
             <Card>
               <CardContent className="p-5">
                 <h4 className="text-xs font-bold text-text-secondary uppercase mb-3">Raw Agent Findings</h4>
                 {currentRun.findings && currentRun.findings.length > 0 ? (
                   <div className="space-y-2">
                     {currentRun.findings.map(finding => (
                       <div key={finding.id} className="text-xs p-2 rounded bg-surface-raised border border-surface-raised/50 cursor-help" title={finding.content}>
                         <div className="font-bold text-brand-cyan mb-1">{finding.agent_type}</div>
                         <div className="text-text-muted">{finding.finding_type.replace('_', ' ')}</div>
                       </div>
                     ))}
                   </div>
                 ) : (
                   <span className="text-xs text-text-muted">No raw findings recorded.</span>
                 )}
               </CardContent>
             </Card>
          </div>
        </div>
      )}

    </div>
  );
}
