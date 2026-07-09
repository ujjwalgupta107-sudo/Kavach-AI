import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { RiskBadge } from '../../components/ui/RiskBadge';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { AIInvestigationPanel } from '../../components/investigation/AIInvestigationPanel';
import { caseService } from '../../services/api/caseService';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../constants/theme';
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
        <Text style={styles.errorText}>{error || 'Case not found'}</Text>
        <Button onPress={() => navigation.goBack()}>Go Back</Button>
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
            <Text style={styles.metaItem}>🔍 {(caseInfo.scam_type || '').replace('_', ' ')}</Text>
            <Text style={styles.metaItem}>📅 {new Date(caseInfo.created_at).toLocaleDateString()}</Text>
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
            {/* Summary */}
            <Card style={styles.sectionCard}>
              <CardContent>
                <Text style={styles.sectionTitle}>Incident Summary</Text>
                <Text style={styles.description}>
                  {caseInfo.description || 'No description available for this incident.'}
                </Text>
              </CardContent>
            </Card>

            {/* Red Flags */}
            {analysis.red_flags && analysis.red_flags.length > 0 && (
              <Card style={styles.sectionCard}>
                <CardContent>
                  <Text style={styles.sectionTitle}>Detected Tactics / Red Flags</Text>
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
                <Text style={styles.sectionTitle}>Key Metrics</Text>
                <View style={styles.metricsRow}>
                  <View style={styles.metricBox}>
                    <Text style={styles.metricLabel}>Risk Score</Text>
                    <Text style={[styles.metricValue, { color: colors.status.critical }]}>
                      {analysis.risk_score || caseInfo.risk_score || 0}%
                    </Text>
                  </View>
                  <View style={styles.metricBox}>
                    <Text style={styles.metricLabel}>Entities</Text>
                    <Text style={styles.metricValue}>{entities.length}</Text>
                  </View>
                </View>
              </CardContent>
            </Card>

            {/* Similar Cases */}
            {similarCases.length > 0 && (
              <Card style={styles.sectionCard}>
                <CardContent>
                  <Text style={styles.sectionTitle}>Semantically Similar Cases</Text>
                  {similarCases.map((sim: any) => (
                    <TouchableOpacity
                      key={sim.case_id}
                      style={styles.similarItem}
                      onPress={() => (navigation as any).navigate('CaseDetail', { caseId: sim.case_id })}
                    >
                      <View style={styles.similarTop}>
                        <Text style={styles.similarId}>{sim.case_id.substring(0, 8)}...</Text>
                        <Text style={styles.similarScore}>{(sim.similarity_score * 100).toFixed(1)}% Match</Text>
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
                    <Text style={styles.entityRisk}>Risk: {(entity.risk_score * 100).toFixed(0)}%</Text>
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
  container: { flex: 1, backgroundColor: '#0b1120' },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 56 : 40,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface.raised,
    backgroundColor: colors.surface.base,
  },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: spacing.sm },
  backText: { fontSize: fontSize.sm, color: colors.text.secondary },
  headerInfo: {},
  idRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' },
  caseId: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text.primary, fontFamily: 'monospace' },
  metaRow: { flexDirection: 'row', gap: spacing.lg, marginTop: spacing.sm },
  metaItem: { fontSize: fontSize.sm, color: colors.text.secondary },
  tabRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.surface.raised,
    backgroundColor: colors.surface.base,
  },
  tab: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: colors.brand.cyan },
  tabText: { fontSize: fontSize.sm, color: colors.text.secondary, fontWeight: fontWeight.medium },
  tabTextActive: { color: colors.brand.cyan },
  scrollContent: { padding: spacing.lg, paddingBottom: 100 },
  sectionCard: { marginBottom: spacing.lg },
  sectionTitle: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text.primary, marginBottom: spacing.md },
  description: { fontSize: fontSize.base, color: colors.text.secondary, lineHeight: 22 },
  flagItem: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, marginBottom: spacing.sm, backgroundColor: colors.surface.base, padding: spacing.md, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.surface.raised },
  flagText: { flex: 1, fontSize: fontSize.sm, color: colors.text.primary },
  metricsRow: { flexDirection: 'row', gap: spacing.lg },
  metricBox: {},
  metricLabel: { fontSize: fontSize.xs, color: colors.text.muted, marginBottom: 4 },
  metricValue: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text.primary, fontFamily: 'monospace' },
  similarItem: { backgroundColor: colors.surface.base, padding: spacing.md, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.surface.raised, marginBottom: spacing.sm },
  similarTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  similarId: { fontSize: fontSize.xs, color: colors.brand.cyan, fontFamily: 'monospace' },
  similarScore: { fontSize: fontSize.xs, fontWeight: fontWeight.bold, color: colors.status.warning },
  similarPreview: { fontSize: fontSize.xs, color: colors.text.muted, lineHeight: 16 },
  entityCard: { marginBottom: spacing.sm },
  entityContent: { paddingVertical: spacing.md, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  entityRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  entityTypeBadge: { backgroundColor: colors.surface.base, paddingHorizontal: 8, paddingVertical: 3, borderRadius: borderRadius.sm, borderWidth: 1, borderColor: colors.surface.raised },
  entityTypeText: { fontSize: 9, fontWeight: fontWeight.bold, color: colors.text.muted, textTransform: 'uppercase', fontFamily: 'monospace' },
  entityValue: { fontSize: fontSize.base, fontWeight: fontWeight.medium, color: colors.text.primary },
  entityRisk: { fontSize: fontSize.sm, color: colors.status.warning },
  emptyText: { fontSize: fontSize.base, color: colors.text.muted, textAlign: 'center', paddingVertical: spacing['3xl'] },
  errorContainer: { flex: 1, backgroundColor: colors.surface.base, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  errorText: { fontSize: fontSize.base, color: colors.status.critical, marginBottom: spacing.lg },
});
