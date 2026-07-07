import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { caseService } from '../../services/api/caseService';
import { AIInvestigationPanel } from '../../components/investigation/AIInvestigationPanel';
import { ChevronLeft, MapPin, Calendar, AlertTriangle, ShieldAlert, Loader2 } from 'lucide-react';

export function CaseDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState<any>(null);
  const [similarCases, setSimilarCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [similarLoading, setSimilarLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchCase = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await caseService.getCaseIntelligence(id);
        setCaseData(data);
        
        // Fetch similar cases in parallel or after
        setSimilarLoading(true);
        caseService.getSimilarCases(id)
          .then(sim => setSimilarCases(sim || []))
          .catch(e => console.error('Failed to load similar cases', e))
          .finally(() => setSimilarLoading(false));

      } catch (e: any) {
        console.error(e);
        setError(e.message || 'Failed to fetch case data');
      } finally {
        setLoading(false);
      }
    };
    fetchCase();
  }, [id]);

  if (loading) return <div className="p-12 flex flex-col items-center justify-center text-text-muted"><Loader2 className="w-8 h-8 animate-spin mb-4" /><p>Loading case data...</p></div>;
  if (error || !caseData) return <div className="p-8 text-center text-status-critical">{error || 'Case not found'}</div>;

  const tabs = ['overview', 'ai-investigation', 'evidence', 'entities', 'connections', 'timeline', 'notes'];
  const caseInfo = caseData.case || caseData;
  const analysis = caseData.analysis || {};
  const entities = caseData.entities || [];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary cursor-pointer transition-colors w-max" onClick={() => navigate('/intelligence/cases')}>
        <ChevronLeft className="w-4 h-4" /> Back to Cases
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-surface-raised pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold font-mono">{caseInfo.id}</h1>
            <span className={`px-2.5 py-1 rounded text-xs font-bold border ${caseInfo.risk_level === 'CRITICAL' ? 'bg-status-critical/10 text-status-critical border-status-critical/50' : 'bg-status-warning/10 text-status-warning border-status-warning/50'}`}>
              {caseInfo.risk_level} RISK
            </span>
            <span className="px-2.5 py-1 rounded text-xs font-semibold bg-surface-raised/50 text-text-secondary">
              {caseInfo.status}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm text-text-secondary">
             <span className="flex items-center gap-1 text-brand-cyan"><ShieldAlert className="w-4 h-4"/> {(caseInfo.scam_type || '').replace('_', ' ')}</span>
             <span className="flex items-center gap-1"><Calendar className="w-4 h-4"/> {new Date(caseInfo.created_at).toLocaleString()}</span>
             <span className="flex items-center gap-1"><MapPin className="w-4 h-4"/> {caseInfo.report_location || 'Unknown'}</span>
             {caseInfo.cluster_id && <span className="flex items-center gap-1 bg-brand-cyan/10 text-brand-cyan px-2 py-0.5 rounded font-mono text-xs border border-brand-cyan/20">CLUSTER: {caseInfo.cluster_id}</span>}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="primary" onClick={() => setActiveTab('ai-investigation')} className="bg-brand-purple hover:bg-brand-purple-light text-white border-none">
            Investigate with AI
          </Button>
          <Button variant="secondary">Update Status</Button>
          <Button variant="danger">Escalate</Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-surface-raised overflow-x-auto no-scrollbar">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 font-medium text-sm capitalize whitespace-nowrap border-b-2 transition-colors ${activeTab === tab ? 'border-brand-cyan text-brand-cyan' : 'border-transparent text-text-secondary hover:text-text-primary'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="pt-4">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Incident Summary</h3>
                  <p className="text-text-secondary leading-relaxed">
                    {caseInfo.description || 'No description available for this incident.'}
                  </p>
                </CardContent>
              </Card>

              {analysis.red_flags && analysis.red_flags.length > 0 && (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Detected Tactics / Red Flags</h3>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {analysis.red_flags.map((flag: any, idx: number) => (
                        <div key={idx} className="bg-surface-base border border-surface-raised p-3 rounded-lg flex items-start gap-3">
                          <AlertTriangle className="w-4 h-4 text-status-warning shrink-0 mt-0.5" />
                          <span className="text-sm text-text-primary">{flag.description || flag}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
            
            <div className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-sm font-semibold mb-4 text-text-secondary uppercase">Key Metrics</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="text-xs text-text-muted mb-1">Risk Score</div>
                      <div className="text-2xl font-bold font-mono text-status-critical">{analysis.risk_score || caseInfo.risk_score || 0}%</div>
                    </div>
                    <div>
                      <div className="text-xs text-text-muted mb-1">Extracted Entities</div>
                      <div className="text-xl font-bold font-mono">{entities.length}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Semantically Similar Cases */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-sm font-semibold mb-4 text-text-secondary uppercase">Semantically Similar Cases</h3>
                  <div className="space-y-4">
                    {similarLoading ? (
                      <div className="flex items-center gap-2 text-sm text-text-muted">
                        <Loader2 className="w-4 h-4 animate-spin" /> Analyzing semantic similarity...
                      </div>
                    ) : similarCases.length > 0 ? (
                      similarCases.map(sim => (
                        <div key={sim.case_id} className="bg-surface-base border border-surface-raised p-3 rounded-lg hover:border-brand-cyan transition-colors cursor-pointer" onClick={() => navigate(`/intelligence/cases/${sim.case_id}`)}>
                          <div className="flex justify-between items-start mb-1">
                            <span className="text-xs font-mono text-brand-cyan truncate max-w-[150px]" title={sim.case_id}>{sim.case_id.split('-')[0]}...</span>
                            <span className="text-xs font-bold text-status-warning">{(sim.similarity_score * 100).toFixed(1)}% Match</span>
                          </div>
                          <div className="text-xs text-text-primary mb-1">{(sim.scam_type || '').replace('_', ' ')}</div>
                          <div className="text-xs text-text-muted line-clamp-2" title={sim.preview}>{sim.preview}</div>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-text-muted">No highly similar cases found.</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'ai-investigation' && (
          <AIInvestigationPanel caseId={caseInfo.id} />
        )}

        {activeTab === 'evidence' && (
          <div className="p-8 text-center bg-surface-elevated border border-surface-raised rounded-lg text-text-muted">
            Evidence view placeholder (Screenshots, Audio, Transcripts)
          </div>
        )}
        
        {activeTab === 'entities' && (
           <div className="space-y-4">
             {entities.map((entity: any) => (
               <Card key={entity.id}>
                 <CardContent className="p-4 flex justify-between items-center">
                   <div>
                     <span className="text-xs font-mono text-text-muted bg-surface-base px-2 py-1 rounded border border-surface-raised mr-3 uppercase">
                       {entity.type}
                     </span>
                     <span className="font-medium">{entity.value}</span>
                   </div>
                   {entity.risk_score > 0 && (
                     <div className="text-sm text-status-warning">
                       Risk: {(entity.risk_score * 100).toFixed(0)}%
                     </div>
                   )}
                 </CardContent>
               </Card>
             ))}
             {entities.length === 0 && <div className="text-center text-text-muted p-8">No entities extracted.</div>}
           </div>
        )}

        {activeTab === 'connections' && (
           <div className="p-8 text-center bg-surface-elevated border border-surface-raised rounded-lg text-text-muted">
             Fraud graph relationships placeholder
           </div>
        )}

        {activeTab === 'timeline' && (
          <div className="p-8 text-center bg-surface-elevated border border-surface-raised rounded-lg text-text-muted">
            Timeline placeholder
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="p-8 text-center bg-surface-elevated border border-surface-raised rounded-lg text-text-muted">
            Investigator notes placeholder
          </div>
        )}
      </div>
    </div>
  );
}
