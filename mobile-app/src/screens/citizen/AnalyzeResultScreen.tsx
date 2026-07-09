import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { RiskBadge } from '../../components/ui/RiskBadge';
import { caseService } from '../../services/api/caseService';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../constants/theme';
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
        <Text style={styles.errorTitle}>Result not found</Text>
        {error && <Text style={styles.errorMsg}>{error}</Text>}
        <Button onPress={() => navigation.goBack()}>Return to Shield</Button>
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={20} color={colors.text.secondary} />
          <Text style={styles.backText}>Back to Shield</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Verdict Card */}
        <Card style={[styles.verdictCard, { borderColor: verdictColor }]}>
          <View style={[styles.verdictStripe, { backgroundColor: verdictColor }]} />
          <CardContent style={styles.verdictContent}>
            <View style={styles.verdictRow}>
              <View style={[styles.verdictIcon, { backgroundColor: `${verdictColor}15` }]}>
                <Ionicons
                  name={isHighRisk ? 'shield' : isInsufficient ? 'alert-circle' : 'checkmark-circle'}
                  size={36}
                  color={verdictColor}
                />
              </View>
              <View style={styles.verdictText}>
                <Text style={[styles.verdictTitle, { color: verdictColor }]}>
                  {isInsufficient ? result.riskLevel.replace('_', ' ') : `${result.riskLevel} RISK`}
                </Text>
                {!isInsufficient && (
                  <Text style={styles.verdictScore}>{result.riskScore}% Scam Probability</Text>
                )}
              </View>
            </View>
            {isHighRisk && (
              <View style={styles.scamTypeBox}>
                <Text style={styles.scamTypeLabel}>Likely Scam Type:</Text>
                <Text style={styles.scamTypeValue}>{(result.predictedType || '').replace('_', ' ')}</Text>
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
            <Text style={styles.sectionTitle}>WHY KAVACH FLAGGED THIS</Text>
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
            <Text style={styles.sectionTitle}>EXTRACTED ENTITIES</Text>
            <Card>
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
            <Text style={styles.sectionTitle}>WHAT YOU SHOULD DO NOW</Text>
            <Card style={styles.actionsCard}>
              <CardContent>
                {result.recommendedActions.map((action: string, idx: number) => (
                  <View key={idx} style={styles.actionItem}>
                    <Text style={styles.actionNumber}>{idx + 1}.</Text>
                    <Text style={styles.actionText}>{action}</Text>
                  </View>
                ))}
              </CardContent>
            </Card>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.buttonSection}>
          <Button variant="danger" onPress={() => Alert.alert('Report Submitted', 'Incident reported successfully.')}>
            Report This Incident
          </Button>
          <Button variant="secondary" onPress={() => Alert.alert('Saved', 'Analysis saved to your reports.')}>
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
  },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  backText: { fontSize: fontSize.sm, color: colors.text.secondary },
  scrollContent: { padding: spacing.lg, paddingBottom: 100 },
  verdictCard: { borderWidth: 2, marginBottom: spacing.xl },
  verdictStripe: { height: 4, width: '100%' },
  verdictContent: { paddingTop: spacing.lg },
  verdictRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  verdictIcon: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center' },
  verdictText: { flex: 1 },
  verdictTitle: { fontSize: fontSize['2xl'], fontWeight: fontWeight.bold },
  verdictScore: { fontSize: fontSize.md, fontWeight: fontWeight.medium, color: colors.text.primary, marginTop: 4 },
  scamTypeBox: {
    marginTop: spacing.lg,
    backgroundColor: colors.surface.base,
    borderWidth: 1,
    borderColor: colors.surface.raised,
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  scamTypeLabel: { fontSize: fontSize.xs, color: colors.text.muted, marginBottom: 4 },
  scamTypeValue: { fontSize: fontSize.base, fontWeight: fontWeight.bold, color: colors.text.primary },
  explanationBox: {
    marginTop: spacing.lg,
    backgroundColor: colors.surface.base,
    borderWidth: 1,
    borderColor: colors.surface.raised,
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  explanationText: { fontSize: fontSize.base, color: colors.text.primary, lineHeight: 22 },
  section: { marginBottom: spacing.xl },
  sectionTitle: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.text.secondary,
    letterSpacing: 1,
    marginBottom: spacing.md,
  },
  flagItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    backgroundColor: colors.surface.elevated,
    borderWidth: 1,
    borderColor: colors.surface.raised,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
  },
  flagText: { flex: 1, fontSize: fontSize.sm, color: colors.text.primary, lineHeight: 20 },
  entityRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.md },
  entityBorder: { borderTopWidth: 1, borderTopColor: colors.surface.raised },
  entityInfo: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1 },
  entityTypeBadge: {
    backgroundColor: colors.surface.base,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.surface.raised,
  },
  entityTypeText: { fontSize: 9, fontWeight: fontWeight.bold, color: colors.text.muted, fontFamily: 'monospace', textTransform: 'uppercase' },
  entityValue: { fontSize: fontSize.base, fontWeight: fontWeight.medium, color: colors.text.primary },
  linkedBadge: { backgroundColor: 'rgba(245, 158, 11, 0.1)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: borderRadius.sm },
  linkedText: { fontSize: fontSize.xs, color: colors.status.warning },
  actionsCard: { backgroundColor: 'rgba(30, 58, 138, 0.1)', borderColor: 'rgba(30, 58, 138, 0.3)' },
  actionItem: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  actionNumber: { fontSize: fontSize.base, fontWeight: fontWeight.bold, color: colors.text.primary },
  actionText: { flex: 1, fontSize: fontSize.base, color: colors.text.primary, lineHeight: 22 },
  buttonSection: { gap: spacing.md, marginTop: spacing.lg, marginBottom: spacing.lg },
  disclaimer: { fontSize: fontSize.xs, color: colors.text.muted, textAlign: 'center', paddingVertical: spacing.xl },
  errorContainer: { flex: 1, backgroundColor: colors.surface.base, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  errorTitle: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text.primary, marginBottom: spacing.lg },
  errorMsg: { fontSize: fontSize.base, color: colors.status.critical, marginBottom: spacing.lg, textAlign: 'center' },
});
