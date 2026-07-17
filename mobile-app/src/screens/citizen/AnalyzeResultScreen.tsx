import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { RiskBadge } from '../../components/ui/RiskBadge';
import { caseService } from '../../services/api/caseService';
import { colors, spacing, fontSize, fontWeight, borderRadius, shadows } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

type ResultRouteParams = {
  AnalyzeResult: { resultData?: any; caseId?: string };
};

export function AnalyzeResultScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<ResultRouteParams, 'AnalyzeResult'>>();

  const normalizeResult = (res: any) => {
    if (!res) return null;
    return {
      ...res,
      redFlags: res.redFlags || [],
      extractedEntities: res.extractedEntities || [],
      recommendedActions: res.recommendedActions || [],
      explanation: res.explanation || 'No detailed explanation available.',
      predictedType: res.predictedType || 'UNKNOWN',
    };
  };

  const [result, setResult] = useState<any>(normalizeResult(route.params?.resultData));
  const [loading, setLoading] = useState(!route.params?.resultData);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchIntelligence() {
      const caseId = route.params?.caseId;
      if (!caseId || result) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const data = await caseService.getCaseIntelligence(caseId);
        const adapted = {
          id: data.case.id,
          riskScore: data.analysis?.risk_score || data.case.risk_score || 0,
          riskLevel: data.analysis?.risk_level || data.case.risk_level || 'LOW',
          predictedType: data.analysis?.predicted_type || data.case.scam_category || 'OTHER',
          explanation: data.analysis?.explanation || '',
          redFlags: data.analysis?.red_flags?.map((r: any) => r.description) || [],
          extractedEntities: data.entities?.map((e: any) => ({
            type: e.type, value: e.value, maskedValue: e.masked_value,
            connectedCaseIds: e.cluster_id ? ['cluster-connected'] : [],
          })) || [],
          recommendedActions: data.analysis?.recommended_actions?.map((r: any) => r.action) || [],
        };
        setResult(normalizeResult(adapted));
      } catch (err: any) {
        setError(err.message || 'Failed to fetch case intelligence');
      } finally {
        setLoading(false);
      }
    }
    fetchIntelligence();
  }, []);

  if (loading) return <LoadingSpinner message="Loading case intelligence..." />;
  if (error || !result) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.status.critical} style={{ marginBottom: 16 }} />
        <Text style={styles.errorTitle}>Result not found</Text>
        {error && <Text style={styles.errorMsg}>{error}</Text>}
        <Button onPress={() => navigation.goBack()} variant="glass">Return to Shield</Button>
      </View>
    );
  }

  const isHighRisk = result.riskLevel === 'CRITICAL' || result.riskLevel === 'HIGH';
  const isInsufficient = result.riskLevel === 'INSUFFICIENT_TEXT' || result.riskLevel === 'UNABLE_TO_ANALYZE';

  const getVerdictColor = () => {
    if (isHighRisk) return colors.status.critical;
    if (isInsufficient) return colors.status.warning;
    return colors.status.safe;
  };

  const verdictColor = getVerdictColor();
  const glowStyle = shadows.glow(`${verdictColor}40`);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={20} color={colors.text.secondary} />
          <Text style={styles.backText}>Back to Shield</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Verdict Card */}
        <Card style={[styles.verdictCard, { borderColor: `${verdictColor}80` }, glowStyle as any]} variant="glow">
          <View style={[styles.verdictStripe, { backgroundColor: verdictColor }]} />
          <CardContent style={styles.verdictContent}>
            <View style={styles.verdictRow}>
              <View style={[styles.verdictIcon, { backgroundColor: `${verdictColor}15`, borderWidth: 1, borderColor: `${verdictColor}30` }]}>
                <Ionicons
                  name={isHighRisk ? 'shield' : isInsufficient ? 'alert-circle' : 'checkmark-circle'}
                  size={36}
                  color={verdictColor}
                />
              </View>
              <View style={styles.verdictText}>
                <Text style={[styles.verdictTitle, { color: verdictColor }]}>
                  {isInsufficient ? result.riskLevel.replace(/_/g, ' ') : `${result.riskLevel} RISK`}
                </Text>
                {!isInsufficient && (
                  <Text style={styles.verdictScore}>{result.riskScore}% Scam Probability</Text>
                )}
              </View>
            </View>
            {isHighRisk && (
              <View style={styles.scamTypeBox}>
                <Ionicons name="warning-outline" size={16} color={colors.status.critical} style={{ marginRight: 6 }} />
                <Text style={styles.scamTypeLabel}>Likely Scam Type:</Text>
                <Text style={styles.scamTypeValue}>{(result.predictedType || '').replace(/_/g, ' ')}</Text>
              </View>
            )}
            {isInsufficient && result.explanation && (
              <View style={styles.explanationBox}>
                <Text style={styles.explanationText}>{result.explanation}</Text>
              </View>
            )}
          </CardContent>
        </Card>

        {/* Red Flags */}
        {result.redFlags.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="flag-outline" size={18} color={colors.brand.cyan} />
              <Text style={styles.sectionTitle}>WHY KAVACH FLAGGED THIS</Text>
            </View>
            {result.redFlags.map((flag: string, idx: number) => (
              <View key={idx} style={styles.flagItem}>
                <Ionicons name="alert-circle" size={18} color={colors.status.warning} />
                <Text style={styles.flagText}>{flag}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Extracted Entities */}
        {result.extractedEntities.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="people-outline" size={18} color={colors.brand.cyan} />
              <Text style={styles.sectionTitle}>EXTRACTED ENTITIES</Text>
            </View>
            <Card style={styles.entitiesCard} variant="glow">
              {result.extractedEntities.map((entity: any, idx: number) => (
                <View key={idx} style={[styles.entityRow, idx > 0 && styles.entityBorder]}>
                  <View style={styles.entityInfo}>
                    <View style={styles.entityTypeBadge}>
                      <Text style={styles.entityTypeText}>{entity.type}</Text>
                    </View>
                    <Text style={styles.entityValue}>{entity.maskedValue || entity.value}</Text>
                  </View>
                  {entity.connectedCaseIds?.length > 0 && (
                    <View style={styles.linkedBadge}>
                      <Text style={styles.linkedText}>Linked to {entity.connectedCaseIds.length} cases</Text>
                    </View>
                  )}
                </View>
              ))}
            </Card>
          </View>
        )}

        {/* Recommended Actions */}
        {result.recommendedActions.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="list-outline" size={18} color={colors.brand.cyan} />
              <Text style={styles.sectionTitle}>WHAT YOU SHOULD DO NOW</Text>
            </View>
            <Card style={styles.actionsCard} variant="glow">
              <CardContent>
                {result.recommendedActions.map((action: string, idx: number) => (
                  <View key={idx} style={styles.actionItem}>
                    <View style={styles.actionNumberBox}>
                        <Text style={styles.actionNumber}>{idx + 1}</Text>
                    </View>
                    <Text style={styles.actionText}>{action}</Text>
                  </View>
                ))}
              </CardContent>
            </Card>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.buttonSection}>
          <Button variant="danger" onPress={() => Alert.alert('Report Submitted', 'Incident reported successfully.')} style={shadows.glow('rgba(239, 68, 68, 0.4)') as any}>
            Report This Incident
          </Button>
          <Button variant="glass" onPress={() => Alert.alert('Saved', 'Analysis saved to your reports.')}>
            Save Analysis
          </Button>
        </View>

        <Text style={styles.disclaimer}>
          * Based on available evidence. AI assessment is not legally definitive.
        </Text>
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
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  backText: { fontSize: fontSize.sm, color: colors.text.secondary, fontWeight: '500' },
  scrollContent: { padding: spacing.lg, paddingBottom: 100 },
  verdictCard: { borderWidth: 1, marginBottom: spacing.xl, overflow: 'hidden', backgroundColor: 'rgba(24, 24, 27, 0.8)' },
  verdictStripe: { height: 4, width: '100%' },
  verdictContent: { paddingTop: spacing.lg },
  verdictRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  verdictIcon: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center' },
  verdictText: { flex: 1 },
  verdictTitle: { fontSize: fontSize['2xl'], fontWeight: fontWeight.bold, letterSpacing: 0.5 },
  verdictScore: { fontSize: fontSize.md, fontWeight: fontWeight.medium, color: colors.text.primary, marginTop: 4 },
  scamTypeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.lg,
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  scamTypeLabel: { fontSize: fontSize.sm, color: colors.text.secondary, marginRight: 8 },
  scamTypeValue: { fontSize: fontSize.base, fontWeight: 'bold', color: colors.text.primary, textTransform: 'capitalize' },
  explanationBox: {
    marginTop: spacing.lg,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  explanationText: { fontSize: fontSize.base, color: colors.text.primary, lineHeight: 24 },
  section: { marginBottom: spacing.xl },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: spacing.md },
  sectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: 'bold',
    color: colors.brand.cyan,
    letterSpacing: 1,
  },
  flagItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    backgroundColor: 'rgba(245, 158, 11, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
  },
  flagText: { flex: 1, fontSize: fontSize.sm, color: colors.text.primary, lineHeight: 22 },
  entitiesCard: { backgroundColor: 'rgba(24, 24, 27, 0.7)' },
  entityRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.md },
  entityBorder: { borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' },
  entityInfo: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, flex: 1 },
  entityTypeBadge: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  entityTypeText: { fontSize: 10, fontWeight: 'bold', color: colors.text.secondary, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: 0.5 },
  entityValue: { fontSize: fontSize.base, fontWeight: fontWeight.bold, color: colors.text.primary, flex: 1 },
  linkedBadge: { backgroundColor: 'rgba(245, 158, 11, 0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: borderRadius.sm, borderWidth: 1, borderColor: 'rgba(245, 158, 11, 0.3)' },
  linkedText: { fontSize: 10, color: colors.status.warning, fontWeight: 'bold' },
  actionsCard: { backgroundColor: 'rgba(14, 165, 233, 0.05)', borderColor: 'rgba(14, 165, 233, 0.2)' },
  actionItem: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md, alignItems: 'flex-start' },
  actionNumberBox: { width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(14, 165, 233, 0.2)', justifyContent: 'center', alignItems: 'center' },
  actionNumber: { fontSize: fontSize.xs, fontWeight: 'bold', color: colors.brand.cyan },
  actionText: { flex: 1, fontSize: fontSize.base, color: colors.text.primary, lineHeight: 24 },
  buttonSection: { gap: spacing.md, marginTop: spacing.md, marginBottom: spacing.xl },
  disclaimer: { fontSize: fontSize.xs, color: colors.text.muted, textAlign: 'center', paddingBottom: spacing.xl },
  errorContainer: { flex: 1, backgroundColor: colors.surface.base, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  errorTitle: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text.primary, marginBottom: spacing.md },
  errorMsg: { fontSize: fontSize.base, color: colors.status.critical, marginBottom: spacing.xl, textAlign: 'center' },
});
