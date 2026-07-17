import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { ErrorCard } from '../../components/ui/ErrorCard';
import { RiskBadge } from '../../components/ui/RiskBadge';
import { caseService } from '../../services/api/caseService';
import { colors, spacing, fontSize, fontWeight, borderRadius, shadows } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

export function ReportHistoryScreen() {
  const navigation = useNavigation<any>();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadReports() {
      try {
        setLoading(true);
        const data = await caseService.getMyCases();
        setReports(data.items || []);
      } catch (err: any) {
        setError(err.message || 'Failed to load report history');
      } finally {
        setLoading(false);
      }
    }
    loadReports();
  }, []);

  const renderReport = ({ item }: { item: any }) => {
    const isHighRisk = item.risk_level === 'CRITICAL' || item.risk_level === 'HIGH';
    return (
      <TouchableOpacity onPress={() => navigation.navigate('ReportResult', { caseId: item.id })}>
        <Card style={styles.reportCard} variant="glow">
          <CardContent style={styles.reportContent}>
            <View style={styles.reportRow}>
              <View style={[styles.iconCircle, { backgroundColor: isHighRisk ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)', borderColor: isHighRisk ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)' }]}>
                <Ionicons
                  name={isHighRisk ? 'shield' : 'checkmark-circle'}
                  size={24}
                  color={isHighRisk ? colors.status.critical : colors.status.safe}
                />
              </View>
              <View style={styles.reportInfo}>
                <Text style={styles.reportType}>{(item.scam_type || 'UNKNOWN').replace('_', ' ')}</Text>
                <View style={styles.dateRow}>
                  <Ionicons name="time-outline" size={14} color={colors.text.muted} />
                  <Text style={styles.dateText}>{new Date(item.created_at).toLocaleDateString()}</Text>
                </View>
              </View>
              <View style={styles.reportRight}>
                <RiskBadge level={item.risk_level} compact />
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>{item.status}</Text>
                </View>
              </View>
            </View>
          </CardContent>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Report History</Text>
          <Text style={styles.subtitle}>Track your previous analyses and reported incidents.</Text>
        </View>
        <Button size="sm" onPress={() => navigation.getParent()?.navigate('Shield')} variant="glass">
          New Analysis
        </Button>
      </View>

      {loading ? (
        <LoadingSpinner message="Loading your history..." />
      ) : error ? (
        <View style={styles.errorWrapper}>
          <ErrorCard message={error} />
        </View>
      ) : reports.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="document-text-outline" size={64} color={'rgba(255,255,255,0.1)'} style={{ marginBottom: spacing.md }} />
          <Text style={styles.emptyText}>You haven't submitted any reports yet.</Text>
          <Button variant="primary" onPress={() => navigation.getParent()?.navigate('Shield')}>
            Submit a Report
          </Button>
        </View>
      ) : (
        <FlatList
          data={reports}
          renderItem={renderReport}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface.base },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 56 : 40,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface.raised,
    backgroundColor: 'rgba(9, 9, 11, 0.95)',
  },
  title: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text.primary, letterSpacing: 0.5 },
  subtitle: { fontSize: fontSize.sm, color: colors.text.secondary, marginTop: 4 },
  list: { padding: spacing.lg, paddingBottom: 100 },
  reportCard: { marginBottom: spacing.md, backgroundColor: 'rgba(24, 24, 27, 0.7)' },
  reportContent: { paddingVertical: spacing.md },
  reportRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  iconCircle: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  reportInfo: { flex: 1 },
  reportType: { fontSize: fontSize.base, fontWeight: 'bold', color: colors.text.primary, textTransform: 'capitalize' },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  dateText: { fontSize: fontSize.sm, color: colors.text.muted },
  reportRight: { alignItems: 'flex-end', gap: 8 },
  statusBadge: { backgroundColor: 'rgba(255,255,255,0.05)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  statusText: { fontSize: 10, color: colors.text.secondary, fontWeight: 'bold', textTransform: 'uppercase' },
  errorWrapper: { padding: spacing.lg },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyText: { fontSize: fontSize.base, color: colors.text.secondary, marginBottom: spacing.lg },
});
