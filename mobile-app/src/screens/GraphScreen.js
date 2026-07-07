// src/screens/GraphScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, Dimensions } from 'react-native';
import { kavachAPI } from '../services/api';
import { THEME } from '../utils/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function GraphScreen() {
  const [loading, setLoading] = useState(true);
  const [graphData, setGraphData] = useState(null);
  const [liveAlerts, setLiveAlerts] = useState([
    { text: "New High-Risk Digital Arrest Pattern in FC-019", time: "10 mins ago", type: "critical" },
    { text: "Payment Endpoint Reused across 3 new cases", time: "1 hour ago", type: "warning" },
    { text: "Cross-City Pattern Emerging (Delhi-Mumbai)", time: "3 hours ago", type: "warning" }
  ]);

  useEffect(() => {
    // 1. Initial Core Graph Metrics Fetch
    kavachAPI.getGraphMatrix()
      .then(res => {
        setGraphData(res.data);
        setLoading(false);
      })
      .catch(err => {
        setLoading(false);
        console.log("Graph Metrics Link Offline");
      });

    // 2. Real-Time Background Alerts Auto-Polling Interval (Every 5 seconds)
    const alertsInterval = setInterval(() => {
      kavachAPI.getLiveAlerts()
        .then(res => {
          if (res.data && res.data.length > 0) {
            setLiveAlerts(prev => [res.data[0], ...prev].slice(0, 5));
          }
        })
        .catch(err => console.log("Live alerts engine polling offline"));
    }, 5000);

    return () => clearInterval(alertsInterval);
  }, []);

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={styles.loadingText}>Compiling Fraud Graph Matrix...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
      {/* DASHBOARD TITLE BLOCK */}
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Investigator Dashboard</Text>
        <Text style={styles.subTitle}>Overview of active threats, cases, and emerging clusters.</Text>
      </View>

      {/* HORIZONTAL METRICS BLOCK */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.metricsRow}>
        <View style={styles.metricCard}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.metricCardLbl}>Active High-Risk Cases</Text>
            <MaterialCommunityIcons name="alert-box-outline" size={16} color="#EF4444" />
          </View>
          <Text style={[styles.metricCardVal, { color: '#EF4444' }]}>142</Text>
          <Text style={styles.trendUp}>↗ +12% from last week</Text>
        </View>

        <View style={styles.metricCard}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.metricCardLbl}>New Reports Today</Text>
            <MaterialCommunityIcons name="pulse" size={16} color="#38BDF8" />
          </View>
          <Text style={styles.metricCardVal}>847</Text>
          <Text style={styles.trendUp}>↗ +4% from yesterday</Text>
        </View>

        <View style={styles.metricCard}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.metricCardLbl}>Suspicious Entities</Text>
            <MaterialCommunityIcons name="account-group-outline" size={16} color="#F59E0B" />
          </View>
          <Text style={[styles.metricCardVal, { color: '#F59E0B' }]}>3,240</Text>
          <Text style={styles.trendSub}>Across 8 categories</Text>
        </View>

        <View style={styles.metricCard}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.metricCardLbl}>Emerging Clusters</Text>
            <MaterialCommunityIcons name="shield-alert-outline" size={16} color="#10B981" />
          </View>
          <Text style={[styles.metricCardVal, { color: '#10B981' }]}>18</Text>
          <Text style={[styles.trendUp, { color: '#EF4444' }]}>3 require immediate review</Text>
        </View>
      </ScrollView>

      {/* CASES BY SCAM TYPE */}
      <Text style={styles.sectionTitle}>Cases by Scam Type</Text>
      <View style={styles.chartContainerCard}>
        <View style={styles.barContainer}>
          <Text style={styles.barLabel}>Digital Arrest</Text>
          <View style={styles.track}><View style={[styles.fillBar, { width: '85%' }]} /></View>
        </View>
        <View style={styles.barContainer}>
          <Text style={styles.barLabel}>OTP Theft</Text>
          <View style={styles.track}><View style={[styles.fillBar, { width: '65%' }]} /></View>
        </View>
        <View style={styles.barContainer}>
          <Text style={styles.barLabel}>UPI Fraud</Text>
          <View style={styles.track}><View style={[styles.fillBar, { width: '50%' }]} /></View>
        </View>
        <View style={styles.barContainer}>
          <Text style={styles.barLabel}>Investment</Text>
          <View style={styles.track}><View style={[styles.fillBar, { width: '40%' }]} /></View>
        </View>
        <View style={styles.barContainer}>
          <Text style={styles.barLabel}>Other</Text>
          <View style={styles.track}><View style={[styles.fillBar, { width: '15%' }]} /></View>
        </View>
      </View>

      {/* FULLY DYNAMIC RECENT ALERTS INTERFACE CARD */}
      <View style={styles.alertsCard}>
        <View style={styles.alertsHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.alertsTitleText}>Recent Alerts</Text>
            <View style={styles.liveIndicatorBadge}>
              <Text style={styles.liveIndicatorText}>LIVE AUTOMATED FEED</Text>
            </View>
          </View>
          <Text style={styles.viewAllText}>View All</Text>
        </View>

        {liveAlerts.map((alert, index) => (
          <View key={index} style={styles.alertItemRow}>
            <View style={[styles.alertDot, { backgroundColor: alert.type === 'critical' ? '#EF4444' : '#F59E0B' }]} />
            <View style={styles.alertContent}>
              <Text style={styles.alertMainText}>{alert.text}</Text>
              <Text style={styles.alertTimeText}>{alert.time}</Text>
            </View>
          </View>
        ))}
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617', padding: 20 },
  center: { justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#64748B', marginTop: 12, fontSize: 14 },
  
  titleContainer: { marginTop: 15, marginBottom: 20 },
  title: { fontSize: 24, fontWeight: '900', color: '#fff' },
  subTitle: { color: '#64748B', fontSize: 12, marginTop: 4 },

  metricsRow: { flexDirection: 'row', marginBottom: 25 },
  metricCard: { backgroundColor: '#0B1528', width: width * 0.44, padding: 16, borderRadius: 14, borderWidth: 1, borderColor: '#1E293B', marginRight: 12 },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  metricCardLbl: { color: '#94A3B8', fontSize: 11, fontWeight: '600' },
  metricCardVal: { fontSize: 24, fontWeight: '900', color: '#fff' },
  trendUp: { color: '#10B981', fontSize: 10, fontWeight: '700', marginTop: 6 },
  trendSub: { color: '#64748B', fontSize: 10, marginTop: 6 },

  sectionTitle: { color: '#fff', fontSize: 15, fontWeight: '700', marginBottom: 15 },
  chartContainerCard: { backgroundColor: '#0B1528', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#1E293B', marginBottom: 25 },
  barContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  barLabel: { color: '#94A3B8', width: 90, fontSize: 12, fontWeight: '600' },
  track: { flex: 1, height: 10, backgroundColor: '#1E293B', borderRadius: 5, overflow: 'hidden' },
  fillBar: { height: '100%', backgroundColor: '#3b82f6', borderRadius: 5 },

  alertsCard: { backgroundColor: '#0B1528', padding: 18, borderRadius: 16, borderWidth: 1, borderColor: '#1E293B', marginBottom: 20 },
  alertsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, borderBottomWidth: 1, borderColor: '#1E293B', paddingBottom: 10 },
  alertsTitleText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  liveIndicatorBadge: { backgroundColor: 'rgba(16, 185, 129, 0.1)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginLeft: 8, borderWidth: 0.5, borderColor: 'rgba(16, 185, 129, 0.3)' },
  liveIndicatorText: { color: '#10B981', fontSize: 8, fontWeight: '800' },
  viewAllText: { color: '#3b82f6', fontSize: 12, fontWeight: '700' },
  alertItemRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 15 },
  alertDot: { width: 8, height: 8, borderRadius: 4, marginTop: 5, marginRight: 12 },
  alertContent: { flex: 1 },
  alertMainText: { color: '#E2E8F0', fontSize: 13, lineHeight: 18, fontWeight: '500' },
  alertTimeText: { color: '#64748B', fontSize: 11, marginTop: 4 }
});