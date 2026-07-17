import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { dashboardService } from '../../services/api/dashboardService';
import { alertService } from '../../services/api/alertService';
import { colors, spacing, fontSize, fontWeight, borderRadius, shadows } from '../../constants/theme';
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
                  <View style={[styles.kpiIcon, { backgroundColor: `${kpi.color}15`, borderColor: `${kpi.color}30` }]}>
                    <Ionicons name={kpi.icon as any} size={22} color={kpi.color} />
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
  container: { flex: 1, backgroundColor: colors.surface.base },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 56 : 40,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface.raised,
    backgroundColor: 'rgba(9, 9, 11, 0.95)',
  },
  title: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text.primary, letterSpacing: 0.5 },
  subtitle: { fontSize: fontSize.sm, color: colors.text.secondary, marginTop: 4 },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.status.safe },
  liveText: { fontSize: fontSize.xs, color: colors.status.safe, fontWeight: fontWeight.bold },
  scrollContent: { padding: spacing.lg, paddingBottom: 100 },
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginBottom: spacing.xl },
  kpiCard: { width: (Dimensions.get('window').width - spacing.lg * 2 - spacing.md) / 2 },
  kpiContent: { paddingVertical: spacing.lg, paddingHorizontal: spacing.md },
  kpiRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  kpiLabel: { fontSize: fontSize.sm, color: colors.text.secondary, fontWeight: '500' },
  kpiValue: { fontSize: fontSize['2xl'], fontWeight: fontWeight.bold, marginTop: spacing.sm, ...shadows.textGlow('rgba(255,255,255,0.1)') },
  kpiIcon: { padding: spacing.sm, borderRadius: borderRadius.lg, borderWidth: 1 },
  sectionCard: { marginBottom: spacing.xl },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  barLabel: { width: 90, fontSize: fontSize.sm, color: colors.text.secondary, textTransform: 'capitalize' },
  barTrack: { flex: 1, height: 12, backgroundColor: 'rgba(24, 24, 27, 0.5)', borderRadius: borderRadius.full, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: colors.brand.blue, borderRadius: borderRadius.full },
  barValue: { width: 30, fontSize: fontSize.sm, color: colors.text.primary, textAlign: 'right', fontWeight: fontWeight.bold },
  alertHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  viewAll: { fontSize: fontSize.xs, color: colors.brand.cyan, fontWeight: fontWeight.bold, textTransform: 'uppercase' },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingBottom: spacing.md,
    marginBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  alertDot: { width: 8, height: 8, borderRadius: 4, marginTop: 6, ...shadows.glow('rgba(255,255,255,0.1)') },
  alertContent: { flex: 1 },
  alertTitle: { fontSize: fontSize.sm, fontWeight: '500', color: colors.text.primary, lineHeight: 20 },
  alertTime: { fontSize: fontSize.xs, color: colors.text.muted, marginTop: 6 },
  emptyText: { fontSize: fontSize.sm, color: colors.text.muted },
});
