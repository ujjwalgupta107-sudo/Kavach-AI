import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { ErrorCard } from '../../components/ui/ErrorCard';
import { RiskBadge } from '../../components/ui/RiskBadge';
import { caseService } from '../../services/api/caseService';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../constants/theme';
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
        <Card style={styles.reportCard}>
          <CardContent style={styles.reportContent}>
            <View style={styles.reportRow}>
              <View style={[styles.iconCircle, { backgroundColor: isHighRisk ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)' }]}>
                <Ionicons
                  name={isHighRisk ? 'shield' : 'checkmark-circle'}
                  size={22}
                  color={isHighRisk ? colors.status.critical : colors.status.safe}
                />
              </View>
              <View style={styles.reportInfo}>
                <Text style={styles.reportType}>{(item.scam_type || 'UNKNOWN').replace('_', ' ')}</Text>
                <View style={styles.dateRow}>
                  <Ionicons name="time-outline" size={12} color={colors.text.muted} />
                  <Text style={styles.dateText}>{new Date(item.created_at).toLocaleDateString()}</Text>
                </View>
              </View>
              <View style={styles.reportRight}>
                <RiskBadge level={item.risk_level} compact />
                <Text style={styles.statusText}>{item.status}</Text>
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
        <Button size="sm" onPress={() => navigation.getParent()?.navigate('Shield')}>
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
          <Text style={styles.emptyText}>You haven't submitted any reports yet.</Text>
          <Button variant="secondary" onPress={() => navigation.getParent()?.navigate('Shield')}>
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
  },
  title: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text.primary },
  subtitle: { fontSize: fontSize.sm, color: colors.text.secondary, marginTop: 4 },
  list: { padding: spacing.lg, paddingBottom: 100 },
  reportCard: { marginBottom: spacing.md },
  reportContent: { paddingVertical: spacing.md },
  reportRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  iconCircle: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  reportInfo: { flex: 1 },
  reportType: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.text.primary },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  dateText: { fontSize: fontSize.xs, color: colors.text.muted },
  reportRight: { alignItems: 'flex-end', gap: 4 },
  statusText: { fontSize: fontSize.xs, color: colors.text.muted },
  errorWrapper: { padding: spacing.lg },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyText: { fontSize: fontSize.base, color: colors.text.secondary, marginBottom: spacing.lg },
});
