import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { dashboardService } from '../../services/api/dashboardService';
import { alertService } from '../../services/api/alertService';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

export function DashboardScreen() {
  const navigation = useNavigation<any>();
  const [metrics, setMetrics] = useState<any>(null);
  const [charts, setCharts] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        const [m, c, a] = await Promise.all([
          dashboardService.getMetrics(),
          dashboardService.getCharts(),
          alertService.getAlerts(),
        ]);
        setMetrics(m);
        setCharts(c);
        setAlerts(a.items || a || []);
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (loading || !metrics) {
    return <LoadingSpinner message="Loading intelligence dashboard..." />;
  }

  const kpis = [
    { label: 'Active High-Risk', value: metrics.active_high_risk_cases || 0, color: colors.status.critical, icon: 'alert-circle' },
    { label: 'Reports Today', value: metrics.reports_today || 0, color: colors.brand.cyan, icon: 'pulse' },
    { label: 'Suspicious Entities', value: metrics.suspicious_entities_tracked || 0, color: colors.status.warning, icon: 'people' },
    { label: 'Emerging Clusters', value: metrics.emerging_clusters || 0, color: colors.brand.cyan, icon: 'shield' },
  ];

  const scamTypes = charts?.scam_type_distribution || [];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Investigator Dashboard</Text>
          <Text style={styles.subtitle}>Overview of active threats, cases, and emerging clusters.</Text>
        </View>
        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>Live Feed</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* KPI Grid */}
        <View style={styles.kpiGrid}>
          {kpis.map((kpi, idx) => (
            <Card key={idx} style={styles.kpiCard}>
              <CardContent style={styles.kpiContent}>
                <View style={styles.kpiRow}>
                  <View>
                    <Text style={styles.kpiLabel}>{kpi.label}</Text>
                    <Text style={[styles.kpiValue, { color: kpi.color }]}>{kpi.value}</Text>
                  </View>
                  <View style={[styles.kpiIcon, { backgroundColor: `${kpi.color}15` }]}>
                    <Ionicons name={kpi.icon as any} size={20} color={kpi.color} />
                  </View>
                </View>
              </CardContent>
            </Card>
          ))}
        </View>

        {/* Scam Types */}
        <Card style={styles.sectionCard}>
          <CardHeader>
            <CardTitle>Cases by Scam Type</CardTitle>
          </CardHeader>
          <CardContent>
            {scamTypes.map((item: any, idx: number) => {
              const name = (item.type || item.name || '').replace('_', ' ');
              const value = item.count || item.value || 0;
              const maxVal = Math.max(...scamTypes.map((s: any) => s.count || s.value || 0), 1);
              const pct = (value / maxVal) * 100;
              return (
                <View key={idx} style={styles.barRow}>
                  <Text style={styles.barLabel}>{name}</Text>
                  <View style={styles.barTrack}>
                    <View style={[styles.barFill, { width: `${pct}%` }]} />
                  </View>
                  <Text style={styles.barValue}>{value}</Text>
                </View>
              );
            })}
            {scamTypes.length === 0 && <Text style={styles.emptyText}>No data available</Text>}
          </CardContent>
        </Card>

        {/* Recent Alerts */}
        <Card style={styles.sectionCard}>
          <CardHeader style={styles.alertHeader}>
            <CardTitle>Recent Alerts</CardTitle>
            <TouchableOpacity onPress={() => navigation.navigate('Alerts')}>
              <Text style={styles.viewAll}>View All</Text>
            </TouchableOpacity>
          </CardHeader>
          <CardContent>
            {alerts.slice(0, 5).map((alert) => (
              <TouchableOpacity
                key={alert.id}
                style={styles.alertItem}
                onPress={() => alert.case_id && navigation.navigate('Cases', { screen: 'CaseDetail', params: { caseId: alert.case_id } })}
              >
                <View style={[styles.alertDot, {
                  backgroundColor: alert.severity === 'CRITICAL' ? colors.status.critical : colors.status.warning,
                }]} />
                <View style={styles.alertContent}>
                  <Text style={styles.alertTitle} numberOfLines={2}>{alert.title || alert.text}</Text>
                  <Text style={styles.alertTime}>{new Date(alert.created_at || Date.now()).toLocaleString()}</Text>
                </View>
              </TouchableOpacity>
            ))}
            {alerts.length === 0 && <Text style={styles.emptyText}>No active alerts.</Text>}
          </CardContent>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b1120' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 56 : 40,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface.raised,
    backgroundColor: colors.surface.base,
  },
  title: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text.primary },
  subtitle: { fontSize: fontSize.sm, color: colors.text.secondary, marginTop: 4 },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surface.elevated,
    borderWidth: 1,
    borderColor: colors.surface.raised,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: borderRadius.md,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.status.safe },
  liveText: { fontSize: fontSize.xs, color: colors.text.muted },
  scrollContent: { padding: spacing.lg, paddingBottom: 100 },
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginBottom: spacing.xl },
  kpiCard: { width: (Dimensions.get('window').width - spacing.lg * 2 - spacing.md) / 2 - 1 },
  kpiContent: { paddingVertical: spacing.lg },
  kpiRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  kpiLabel: { fontSize: fontSize.sm, color: colors.text.secondary, fontWeight: fontWeight.medium },
  kpiValue: { fontSize: fontSize['2xl'], fontWeight: fontWeight.bold, marginTop: spacing.sm },
  kpiIcon: { padding: spacing.sm, borderRadius: borderRadius.md },
  sectionCard: { marginBottom: spacing.xl },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  barLabel: { width: 90, fontSize: fontSize.sm, color: colors.text.secondary },
  barTrack: { flex: 1, height: 20, backgroundColor: colors.surface.base, borderRadius: borderRadius.sm, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: colors.status.info, borderRadius: borderRadius.sm },
  barValue: { width: 30, fontSize: fontSize.sm, color: colors.text.primary, textAlign: 'right' },
  alertHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  viewAll: { fontSize: fontSize.xs, color: colors.brand.cyan },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingBottom: spacing.md,
    marginBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface.raised,
  },
  alertDot: { width: 8, height: 8, borderRadius: 4, marginTop: 6 },
  alertContent: { flex: 1 },
  alertTitle: { fontSize: fontSize.sm, fontWeight: fontWeight.medium, color: colors.text.primary, lineHeight: 20 },
  alertTime: { fontSize: fontSize.xs, color: colors.text.muted, marginTop: 4 },
  emptyText: { fontSize: fontSize.sm, color: colors.text.muted },
});
