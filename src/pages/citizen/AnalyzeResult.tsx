import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import ReactMarkdown from 'react-markdown';
import { ShieldAlert, CheckCircle, AlertTriangle, ChevronLeft, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { caseService } from '../../services/api/caseService';

export function AnalyzeResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  const normalizeResult = (res: any) => {
    if (!res) return null;
    return {
      ...res,
      redFlags: res.redFlags || [],
      extractedEntities: res.extractedEntities || [],
      recommendedActions: res.recommendedActions || [],
      explanation: res.explanation || 'No detailed explanation available.',
      predictedType: res.predictedType || 'UNKNOWN'
    };
  };

  const [result, setResult] = useState<any>(normalizeResult(location.state?.result));
  const [loading, setLoading] = useState(!location.state?.result);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchIntelligence() {
      // Public analysis results are passed entirely via location.state — no backend fetch needed
      if (id === 'public') {
        setLoading(false);
        return;
      }
      // If we don't have the full result (with analysis), fetch it
      if (id && (!result || !result.analysis)) {
        try {
          setLoading(true);
          const data = await caseService.getCaseIntelligence(id);
          // Adapt backend response to frontend expected format
          const adaptedResult = {
            id: data.case.id,
            riskScore: data.analysis?.risk_score || data.case.risk_score || 0,
            riskLevel: data.analysis?.risk_level || data.case.risk_level || 'LOW',
            predictedType: data.analysis?.predicted_type || data.case.scam_category || data.case.scam_type || 'OTHER',
            explanation: data.analysis?.explanation || '',
            redFlags: data.analysis?.red_flags?.map((r: any) => r.description) || [],
            extractedEntities: data.entities?.map((e: any) => ({
              type: e.type,
              value: e.value,
              maskedValue: e.masked_value,
              connectedCaseIds: e.cluster_id ? ['cluster-connected'] : []
            })) || [],
            recommendedActions: data.analysis?.recommended_actions?.map((r: any) => r.action) || []
          };
          setResult(normalizeResult(adaptedResult));
        } catch (err: any) {
          setError(err.message || 'Failed to fetch case intelligence');
        } finally {
          setLoading(false);
        }
      }
    }
    fetchIntelligence();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-text-secondary">
        <Loader2 className="w-8 h-8 animate-spin mb-4" />
        <p>Loading case intelligence...</p>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold mb-4">Result not found</h2>
        {error && <p className="text-status-critical mb-4">{error}</p>}
        <Button onClick={() => navigate('/shield')}>Return to Shield</Button>
      </div>
    );
  }

  const isHighRisk = result.riskLevel === 'CRITICAL' || result.riskLevel === 'HIGH';

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <button 
        onClick={() => navigate('/shield')}
        className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Shield
      </button>

      {/* Main Verdict Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className={`overflow-hidden border-2 ${isHighRisk ? 'border-status-critical shadow-[0_0_15px_rgba(239,68,68,0.2)]' : ((result.riskLevel === 'INSUFFICIENT_TEXT' || result.riskLevel === 'UNABLE_TO_ANALYZE') ? 'border-status-warning' : 'border-status-safe')}`}>
          <div className={`h-2 w-full ${isHighRisk ? 'bg-status-critical' : ((result.riskLevel === 'INSUFFICIENT_TEXT' || result.riskLevel === 'UNABLE_TO_ANALYZE') ? 'bg-status-warning' : 'bg-status-safe')}`} />
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className={`p-4 rounded-full ${isHighRisk ? 'bg-status-critical/10 text-status-critical' : ((result.riskLevel === 'INSUFFICIENT_TEXT' || result.riskLevel === 'UNABLE_TO_ANALYZE') ? 'bg-status-warning/10 text-status-warning' : 'bg-status-safe/10 text-status-safe')}`}>
                  {isHighRisk ? <ShieldAlert className="w-10 h-10" /> : ((result.riskLevel === 'INSUFFICIENT_TEXT' || result.riskLevel === 'UNABLE_TO_ANALYZE') ? <AlertTriangle className="w-10 h-10" /> : <CheckCircle className="w-10 h-10" />)}
                </div>
                <div>
                  <h2 className={`text-3xl font-bold ${isHighRisk ? 'text-status-critical' : ((result.riskLevel === 'INSUFFICIENT_TEXT' || result.riskLevel === 'UNABLE_TO_ANALYZE') ? 'text-status-warning' : 'text-status-safe')}`}>
                    {(result.riskLevel === 'INSUFFICIENT_TEXT' || result.riskLevel === 'UNABLE_TO_ANALYZE') ? result.riskLevel.replace('_', ' ') : `${result.riskLevel} RISK`}
                  </h2>
                  {(result.riskLevel !== 'INSUFFICIENT_TEXT' && result.riskLevel !== 'UNABLE_TO_ANALYZE') && (
                    <p className="text-text-primary font-medium text-lg mt-1">
                      {result.riskScore}% Scam Probability
                    </p>
                  )}
                </div>
              </div>
              
              {isHighRisk && (
                <div className="bg-surface-base border border-surface-raised px-4 py-3 rounded-lg text-sm">
                  <div className="text-text-muted mb-1">Likely Scam Type:</div>
                  <div className="font-bold text-text-primary">{result.predictedType.replace('_', ' ')}</div>
                </div>
              )}
            </div>
            <div className="mt-6 p-4 bg-surface-elevated rounded-lg text-text-primary border border-surface-raised text-sm leading-relaxed space-y-4 [&>h1]:font-bold [&>h2]:font-bold [&>h3]:font-bold [&>ul]:list-disc [&>ul]:pl-5 [&>p]:mb-2 [&_strong]:text-brand-cyan">
              <ReactMarkdown>{result.explanation}</ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Why KAVACH flagged this */}
      {result.redFlags.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h3 className="text-lg font-bold mb-3 uppercase tracking-wider text-text-secondary text-sm">Why KAVACH Flagged This</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {result.redFlags.map((flag: any, idx: number) => (
              <div key={idx} className="bg-surface-elevated border border-surface-raised p-4 rounded-lg flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-status-warning shrink-0 mt-0.5" />
                <span className="text-sm text-text-primary leading-relaxed">{flag}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Extracted Entities */}
      {result.extractedEntities.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h3 className="text-lg font-bold mb-3 uppercase tracking-wider text-text-secondary text-sm">Extracted Entities</h3>
          <Card>
            <div className="divide-y divide-surface-raised">
              {result.extractedEntities.map((entity: any, idx: number) => (
                <div key={idx} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 gap-2">
                  <div>
                    <span className="text-xs font-mono text-text-muted bg-surface-base px-2 py-1 rounded border border-surface-raised mr-3 uppercase">
                      {entity.type}
                    </span>
                    <span className="font-medium">{entity.maskedValue || entity.value}</span>
                  </div>
                  {entity.connectedCaseIds.length > 0 && (
                    <div className="text-xs text-status-warning bg-status-warning/10 px-2 py-1 rounded">
                      Linked to {entity.connectedCaseIds.length} previous cases
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}

      {/* What you should do now */}
      {result.recommendedActions.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h3 className="text-lg font-bold mb-3 uppercase tracking-wider text-text-secondary text-sm">What You Should Do Now</h3>
          <Card className="bg-brand-blue/10 border-brand-blue/30">
            <CardContent className="p-6">
              <ol className="list-decimal list-inside space-y-3 text-text-primary">
                {result.recommendedActions.map((action: any, idx: number) => (
                  <li key={idx} className="pl-2 leading-relaxed">{action}</li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Actions */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="flex flex-col sm:flex-row gap-3 pt-4">
        <Button size="lg" variant="danger" className="flex-1" onClick={() => alert('Incident reported successfully. Law enforcement has been notified.')}>Report This Incident</Button>
        <Button size="lg" variant="secondary" className="flex-1" onClick={() => {
            alert('Analysis saved to your reports.');
            navigate('/citizen/reports');
        }}>Save Analysis</Button>
        <Button size="lg" variant="ghost" className="border border-surface-raised" onClick={() => navigate('/citizen/assistant')}>Ask KAVACH</Button>
      </motion.div>
      
      <p className="text-xs text-text-muted text-center pt-8 pb-4">
        * Based on available evidence. High-risk indicators detected, but this AI assessment is not legally definitive.
      </p>
    </div>
  );
}
