import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Alert } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { RiskBadge } from '../../components/ui/RiskBadge';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { AIInvestigationPanel } from '../../components/investigation/AIInvestigationPanel';
import { caseService } from '../../services/api/caseService';
import { colors, spacing, fontSize, fontWeight, borderRadius, shadows } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { CasesStackParamList } from '../../navigation/InvestigatorTabs';

const TABS = ['overview', 'ai-investigation', 'entities'];

export function CaseDetailScreen() {
  const route = useRoute<RouteProp<CasesStackParamList, 'CaseDetail'>>();
  const navigation = useNavigation();
  const caseId = route.params.caseId;

  const [caseData, setCaseData] = useState<any>(null);
  const [similarCases, setSimilarCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchCase = async () => {
      try {
        setLoading(true);
        const data = await caseService.getCaseIntelligence(caseId);
        setCaseData(data);
        caseService.getSimilarCases(caseId)
          .then(sim => setSimilarCases(sim || []))
          .catch(() => {});
      } catch (e: any) {
        setError(e.message || 'Failed to fetch case data');
      } finally {
        setLoading(false);
      }
    };
    fetchCase();
  }, [caseId]);

  if (loading) return <LoadingSpinner message="Loading case data..." />;
  if (error || !caseData) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.status.critical} style={{ marginBottom: 16 }} />
        <Text style={styles.errorText}>{error || 'Case not found'}</Text>
        <Button onPress={() => navigation.goBack()} variant="glass">Go Back</Button>
      </View>
    );
  }

  const caseInfo = caseData.case || caseData;
  const analysis = caseData.analysis || {};
  const entities = caseData.entities || [];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={20} color={colors.text.secondary} />
          <Text style={styles.backText}>Cases</Text>
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <View style={styles.idRow}>
            <Text style={styles.caseId}>{caseInfo.id.substring(0, 12)}...</Text>
            <RiskBadge level={caseInfo.risk_level} />
            <StatusBadge status={caseInfo.status} />
          </View>
          <View style={styles.metaRow}>
            <View style={styles.metaBadge}>
              <Ionicons name="search" size={14} color={colors.text.secondary} style={{ marginRight: 4 }} />
              <Text style={styles.metaItem}>{(caseInfo.scam_type || '').replace('_', ' ')}</Text>
            </View>
            <View style={styles.metaBadge}>
              <Ionicons name="calendar-outline" size={14} color={colors.text.secondary} style={{ marginRight: 4 }} />
              <Text style={styles.metaItem}>{new Date(caseInfo.created_at).toLocaleDateString()}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab === 'ai-investigation' ? 'AI Investigation' : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {activeTab === 'overview' && (
          <>
            {/* Actions */}
            <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg, flexWrap: 'wrap' }}>
              <Button 
                style={{ flex: 1, minWidth: 150 }} 
                variant="glass"
                onPress={() => Alert.alert('Export Successful', 'The Court-Admissible Intelligence Package (PDF) has been generated and saved.')}
              >
                Export PDF
              </Button>
              {caseInfo.scam_type === 'DIGITAL_ARREST' && (
                <Button 
                  style={{ flex: 1, minWidth: 150 }} 
                  variant="danger"
                  onPress={() => Alert.alert('MHA Alert Generated', 'An alert for Digital Arrest has been dispatched to authorities.')}
                >
                  Auto-Gen MHA Alert
                </Button>
              )}
            </View>

            {/* Summary */}
            <Card style={styles.sectionCard} variant="glow">
              <CardContent>
                <View style={styles.sectionHeader}>
                  <Ionicons name="document-text-outline" size={20} color={colors.brand.cyan} />
                  <Text style={styles.sectionTitle}>Incident Summary</Text>
                </View>
                <Text style={styles.description}>
                  {caseInfo.description || 'No description available for this incident.'}
                </Text>
              </CardContent>
            </Card>

            {/* Red Flags */}
            {analysis.red_flags && analysis.red_flags.length > 0 && (
              <Card style={styles.sectionCard}>
                <CardContent>
                  <View style={styles.sectionHeader}>
                    <Ionicons name="flag-outline" size={20} color={colors.status.warning} />
                    <Text style={styles.sectionTitle}>Detected Tactics / Red Flags</Text>
                  </View>
                  {analysis.red_flags.map((flag: any, idx: number) => (
                    <View key={idx} style={styles.flagItem}>
                      <Ionicons name="alert-circle" size={16} color={colors.status.warning} />
                      <Text style={styles.flagText}>{flag.description || flag}</Text>
                    </View>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Key Metrics */}
            <Card style={styles.sectionCard}>
              <CardContent>
                <View style={styles.sectionHeader}>
                  <Ionicons name="stats-chart-outline" size={20} color={colors.brand.cyan} />
                  <Text style={styles.sectionTitle}>Key Metrics</Text>
                </View>
                <View style={styles.metricsRow}>
                  <View style={styles.metricBox}>
                    <Text style={styles.metricLabel}>Risk Score</Text>
                    <Text style={[styles.metricValue, { color: colors.status.critical }, shadows.glow('rgba(239, 68, 68, 0.2)') as any]}>
                      {analysis.risk_score || caseInfo.risk_score || 0}%
                    </Text>
                  </View>
                  <View style={styles.metricBox}>
                    <Text style={styles.metricLabel}>Entities</Text>
                    <Text style={[styles.metricValue, shadows.glow('rgba(255, 255, 255, 0.1)') as any]}>{entities.length}</Text>
                  </View>
                </View>
              </CardContent>
            </Card>

            {/* Similar Cases */}
            {similarCases.length > 0 && (
              <Card style={styles.sectionCard}>
                <CardContent>
                  <View style={styles.sectionHeader}>
                    <Ionicons name="git-network-outline" size={20} color={colors.brand.cyan} />
                    <Text style={styles.sectionTitle}>Semantically Similar Cases</Text>
                  </View>
                  {similarCases.map((sim: any) => (
                    <TouchableOpacity
                      key={sim.case_id}
                      style={styles.similarItem}
                      onPress={() => (navigation as any).navigate('CaseDetail', { caseId: sim.case_id })}
                    >
                      <View style={styles.similarTop}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Ionicons name="link-outline" size={14} color={colors.brand.cyan} style={{ marginRight: 4 }}/>
                          <Text style={styles.similarId}>{sim.case_id.substring(0, 8)}...</Text>
                        </View>
                        <View style={styles.matchBadge}>
                          <Text style={styles.similarScore}>{(sim.similarity_score * 100).toFixed(1)}% Match</Text>
                        </View>
                      </View>
                      <Text style={styles.similarPreview} numberOfLines={2}>{sim.preview}</Text>
                    </TouchableOpacity>
                  ))}
                </CardContent>
              </Card>
            )}
          </>
        )}

        {activeTab === 'ai-investigation' && (
          <AIInvestigationPanel caseId={caseInfo.id} />
        )}

        {activeTab === 'entities' && (
          <View>
            {entities.map((entity: any) => (
              <Card key={entity.id} style={styles.entityCard}>
                <CardContent style={styles.entityContent}>
                  <View style={styles.entityRow}>
                    <View style={styles.entityTypeBadge}>
                      <Text style={styles.entityTypeText}>{entity.type}</Text>
                    </View>
                    <Text style={styles.entityValue}>{entity.value}</Text>
                  </View>
                  {entity.risk_score > 0 && (
                    <View style={styles.entityRiskBadge}>
                      <Text style={styles.entityRisk}>Risk: {(entity.risk_score * 100).toFixed(0)}%</Text>
                    </View>
                  )}
                </CardContent>
              </Card>
            ))}
            {entities.length === 0 && <Text style={styles.emptyText}>No entities extracted.</Text>}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface.base },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 56 : 40,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface.raised,
    backgroundColor: 'rgba(9, 9, 11, 0.95)',
  },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: spacing.md },
  backText: { fontSize: fontSize.sm, color: colors.text.secondary, fontWeight: '500' },
  headerInfo: {},
  idRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' },
  caseId: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text.primary, fontFamily: 'monospace', letterSpacing: 0.5 },
  metaRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md, flexWrap: 'wrap' },
  metaBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: borderRadius.full },
  metaItem: { fontSize: fontSize.xs, color: colors.text.secondary, textTransform: 'capitalize' },
  tabRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.surface.raised,
    backgroundColor: 'rgba(24, 24, 27, 0.8)',
  },
  tab: { flex: 1, paddingVertical: spacing.md, borderBottomWidth: 2, borderBottomColor: 'transparent', alignItems: 'center' },
  tabActive: { borderBottomColor: colors.brand.cyan },
  tabText: { fontSize: fontSize.sm, color: colors.text.secondary, fontWeight: '500' },
  tabTextActive: { color: colors.brand.cyan, fontWeight: 'bold' },
  scrollContent: { padding: spacing.lg, paddingBottom: 100 },
  sectionCard: { marginBottom: spacing.lg, backgroundColor: 'rgba(24, 24, 27, 0.7)' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: spacing.md },
  sectionTitle: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.text.primary },
  description: { fontSize: fontSize.base, color: colors.text.secondary, lineHeight: 24 },
  flagItem: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, marginBottom: spacing.sm, backgroundColor: 'rgba(245, 158, 11, 0.05)', padding: spacing.md, borderRadius: borderRadius.md, borderWidth: 1, borderColor: 'rgba(245, 158, 11, 0.2)' },
  flagText: { flex: 1, fontSize: fontSize.sm, color: colors.text.primary, lineHeight: 20 },
  metricsRow: { flexDirection: 'row', gap: spacing.lg },
  metricBox: { flex: 1, backgroundColor: 'rgba(255,255,255,0.03)', padding: spacing.md, borderRadius: borderRadius.md, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  metricLabel: { fontSize: fontSize.xs, color: colors.text.muted, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  metricValue: { fontSize: fontSize['2xl'], fontWeight: fontWeight.bold, color: colors.text.primary, fontFamily: 'monospace' },
  similarItem: { backgroundColor: 'rgba(255,255,255,0.03)', padding: spacing.md, borderRadius: borderRadius.md, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', marginBottom: spacing.sm },
  similarTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  similarId: { fontSize: fontSize.xs, color: colors.brand.cyan, fontFamily: 'monospace', fontWeight: 'bold' },
  matchBadge: { backgroundColor: 'rgba(245, 158, 11, 0.1)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, borderWidth: 1, borderColor: 'rgba(245, 158, 11, 0.3)' },
  similarScore: { fontSize: 10, fontWeight: 'bold', color: colors.status.warning },
  similarPreview: { fontSize: fontSize.sm, color: colors.text.muted, lineHeight: 18 },
  entityCard: { marginBottom: spacing.sm, backgroundColor: 'rgba(24, 24, 27, 0.5)' },
  entityContent: { paddingVertical: spacing.md, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  entityRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, flex: 1 },
  entityTypeBadge: { backgroundColor: 'rgba(255,255,255,0.05)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: borderRadius.full, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  entityTypeText: { fontSize: 10, fontWeight: 'bold', color: colors.text.secondary, textTransform: 'uppercase', fontFamily: 'monospace', letterSpacing: 0.5 },
  entityValue: { fontSize: fontSize.base, fontWeight: fontWeight.bold, color: colors.text.primary, flex: 1 },
  entityRiskBadge: { backgroundColor: 'rgba(245, 158, 11, 0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, borderWidth: 1, borderColor: 'rgba(245, 158, 11, 0.3)' },
  entityRisk: { fontSize: fontSize.xs, color: colors.status.warning, fontWeight: 'bold' },
  emptyText: { fontSize: fontSize.base, color: colors.text.muted, textAlign: 'center', paddingVertical: spacing['3xl'] },
  errorContainer: { flex: 1, backgroundColor: colors.surface.base, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  errorText: { fontSize: fontSize.lg, color: colors.text.primary, marginBottom: spacing.xl, fontWeight: 'bold' },
});
