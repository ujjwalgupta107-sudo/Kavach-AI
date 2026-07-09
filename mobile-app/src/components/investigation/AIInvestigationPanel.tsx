import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { StatusBadge } from '../ui/StatusBadge';
import { agentService } from '../../services/api/agentService';
import { AgentRun } from '../../types';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  caseId: string;
}

export function AIInvestigationPanel({ caseId }: Props) {
  const [runs, setRuns] = useState<AgentRun[]>([]);
  const [activeRun, setActiveRun] = useState<AgentRun | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    loadRuns();
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [caseId]);

  const loadRuns = async () => {
    try {
      setLoading(true);
      const data = await agentService.getCaseRuns(caseId);
      const runsList = Array.isArray(data) ? data : (data as any)?.data || [];
      setRuns(runsList);
      if (runsList.length > 0) {
        const latest = runsList[0];
        setActiveRun(latest);
        if (latest.status === 'RUNNING' || latest.status === 'PENDING') {
          startPolling(latest.id);
        }
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const startPolling = (runId: string) => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      try {
        const run = await agentService.getRun(runId);
        const runData = (run as any)?.data || run;
        setActiveRun(runData);
        if (runData.status === 'COMPLETED' || runData.status === 'FAILED') {
          if (pollRef.current) clearInterval(pollRef.current);
          loadRuns();
        }
      } catch {
        if (pollRef.current) clearInterval(pollRef.current);
      }
    }, 3000);
  };

  const handleStart = async () => {
    setStarting(true);
    setError(null);
    try {
      const result = await agentService.startInvestigation(caseId);
      const resultData = (result as any)?.data || result;
      startPolling(resultData.id);
      setActiveRun({ id: resultData.id, case_id: caseId, status: 'PENDING', provider: '', model: '', started_at: null, completed_at: null, error_message: null, final_brief: null });
    } catch (e: any) {
      setError(e.message || 'Failed to start investigation');
    } finally {
      setStarting(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading investigation data..." />;

  const brief = activeRun?.final_brief;
  const isRunning = activeRun?.status === 'RUNNING' || activeRun?.status === 'PENDING';

  return (
    <View style={styles.container}>
      {/* Start / Status */}
      <Card style={styles.statusCard}>
        <CardContent>
          {!activeRun ? (
            <View style={styles.startSection}>
              <Ionicons name="sparkles" size={32} color={colors.brand.cyan} />
              <Text style={styles.startTitle}>AI Investigation</Text>
              <Text style={styles.startDesc}>
                Launch a multi-stage AI analysis to investigate this case.
              </Text>
              <Button onPress={handleStart} loading={starting} style={styles.startBtn}>
                Start AI Investigation
              </Button>
            </View>
          ) : (
            <View>
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Status</Text>
                <StatusBadge status={activeRun.status} />
              </View>
              {isRunning && (
                <View style={styles.progressBar}>
                  <View style={styles.progressFill} />
                  <Text style={styles.progressText}>Investigation in progress...</Text>
                </View>
              )}
              {activeRun.status === 'FAILED' && (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{activeRun.error_message || 'Investigation failed.'}</Text>
                </View>
              )}
              {activeRun.status === 'COMPLETED' && !brief && (
                <Text style={styles.noDataText}>Investigation completed but no brief available.</Text>
              )}
            </View>
          )}
          {error && <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View>}
        </CardContent>
      </Card>

      {/* Final Brief */}
      {brief && (
        <View style={styles.briefSection}>
          {brief.executive_summary && (
            <Card style={styles.briefCard}>
              <CardContent>
                <Text style={styles.briefTitle}>📋 Executive Summary</Text>
                <Text style={styles.briefText}>{brief.executive_summary}</Text>
              </CardContent>
            </Card>
          )}

          {brief.confirmed_facts && brief.confirmed_facts.length > 0 && (
            <Card style={styles.briefCard}>
              <CardContent>
                <Text style={styles.briefTitle}>✅ Confirmed Facts</Text>
                {brief.confirmed_facts.map((fact, i) => (
                  <View key={i} style={styles.listItem}>
                    <Text style={styles.bullet}>•</Text>
                    <Text style={styles.listText}>{fact}</Text>
                  </View>
                ))}
              </CardContent>
            </Card>
          )}

          {brief.key_system_signals && brief.key_system_signals.length > 0 && (
            <Card style={styles.briefCard}>
              <CardContent>
                <Text style={styles.briefTitle}>📡 Key Signals</Text>
                {brief.key_system_signals.map((sig, i) => (
                  <View key={i} style={styles.listItem}>
                    <Text style={styles.bullet}>•</Text>
                    <Text style={styles.listText}>{sig}</Text>
                  </View>
                ))}
              </CardContent>
            </Card>
          )}

          {brief.recommended_next_actions && brief.recommended_next_actions.length > 0 && (
            <Card style={styles.briefCard}>
              <CardContent>
                <Text style={styles.briefTitle}>🎯 Recommended Actions</Text>
                {brief.recommended_next_actions.map((action, i) => (
                  <View key={i} style={styles.listItem}>
                    <Text style={styles.actionNum}>{i + 1}.</Text>
                    <Text style={styles.listText}>{action}</Text>
                  </View>
                ))}
              </CardContent>
            </Card>
          )}

          {brief.priority && (
            <Card style={styles.briefCard}>
              <CardContent>
                <Text style={styles.briefTitle}>⚡ Priority</Text>
                <Text style={[styles.briefText, { color: colors.status.warning, fontWeight: fontWeight.bold }]}>{brief.priority}</Text>
              </CardContent>
            </Card>
          )}
        </View>
      )}

      {/* New Investigation */}
      {activeRun && !isRunning && (
        <Button variant="secondary" onPress={handleStart} loading={starting} style={styles.newRunBtn}>
          Run New Investigation
        </Button>
      )}

      {/* Previous Runs */}
      {runs.length > 1 && (
        <View style={styles.prevSection}>
          <Text style={styles.prevTitle}>Previous Runs</Text>
          {runs.slice(1).map(run => (
            <TouchableOpacity key={run.id} style={styles.prevItem} onPress={() => setActiveRun(run)}>
              <StatusBadge status={run.status} />
              <Text style={styles.prevDate}>{new Date(run.created_at || run.started_at || '').toLocaleString()}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.lg },
  statusCard: {},
  startSection: { alignItems: 'center', paddingVertical: spacing.xl },
  startTitle: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text.primary, marginTop: spacing.md },
  startDesc: { fontSize: fontSize.sm, color: colors.text.secondary, textAlign: 'center', marginTop: spacing.sm, marginBottom: spacing.xl },
  startBtn: { width: '100%' },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusLabel: { fontSize: fontSize.sm, color: colors.text.secondary, fontWeight: fontWeight.medium },
  progressBar: {
    marginTop: spacing.lg,
    height: 32,
    backgroundColor: 'rgba(6, 182, 212, 0.1)',
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '60%',
    backgroundColor: 'rgba(6, 182, 212, 0.2)',
    borderRadius: borderRadius.md,
  },
  progressText: { fontSize: fontSize.sm, color: colors.brand.cyan, fontWeight: fontWeight.medium },
  errorBox: { backgroundColor: 'rgba(239,68,68,0.1)', padding: spacing.md, borderRadius: borderRadius.md, marginTop: spacing.md },
  errorText: { fontSize: fontSize.sm, color: colors.status.critical },
  noDataText: { fontSize: fontSize.sm, color: colors.text.muted, marginTop: spacing.md },
  briefSection: { gap: spacing.md },
  briefCard: {},
  briefTitle: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text.primary, marginBottom: spacing.md },
  briefText: { fontSize: fontSize.base, color: colors.text.secondary, lineHeight: 22 },
  listItem: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
  bullet: { fontSize: fontSize.base, color: colors.brand.cyan, fontWeight: fontWeight.bold },
  actionNum: { fontSize: fontSize.base, color: colors.brand.cyan, fontWeight: fontWeight.bold },
  listText: { flex: 1, fontSize: fontSize.base, color: colors.text.primary, lineHeight: 22 },
  newRunBtn: { marginTop: spacing.sm },
  prevSection: { marginTop: spacing.lg },
  prevTitle: { fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: colors.text.secondary, textTransform: 'uppercase', marginBottom: spacing.md },
  prevItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.surface.raised },
  prevDate: { fontSize: fontSize.xs, color: colors.text.muted },
});
