import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, Dimensions, RefreshControl } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { kavachAPI } from '../services/api';
import * as Haptics from 'expo-haptics';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { THEME } from '../utils/theme';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  const { user, logout } = useAuth();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch Cases from API
  const fetchMyCases = useCallback(async (showRefreshingIndicator = false) => {
    if (showRefreshingIndicator) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    try {
      const data = await kavachAPI.getMyCases();
      if (data && data.items) {
        setCases(data.items);
      }
    } catch (error) {
      console.error('[HomeScreen] Error fetching cases:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchMyCases();
  }, [fetchMyCases]);

  const handleRefresh = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    fetchMyCases(true);
  };

  const handleLogout = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      'Secure Logout',
      'Are you sure you want to end your secure KAVACH session?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Log Out', 
          style: 'destructive', 
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            logout();
          } 
        }
      ]
    );
  };

  const getRiskColor = (level) => {
    switch (level?.toUpperCase()) {
      case 'CRITICAL':
      case 'HIGH':
        return THEME.highRisk; 
      case 'MEDIUM':
      case 'SUSPICIOUS':
        return THEME.suspicious; 
      default:
        return THEME.lowRisk; 
    }
  };

  const getScamIcon = (type) => {
    switch (type?.toUpperCase()) {
      case 'DIGITAL_ARREST':
        return 'account-cancel';
      case 'OTP_THEFT':
        return 'cellphone-lock';
      case 'UPI_FRAUD':
        return 'bank-transfer';
      case 'INVESTMENT_SCAM':
        return 'trending-down';
      default:
        return 'shield-alert-outline';
    }
  };

  const renderCaseCard = ({ item }) => {
    const riskColor = getRiskColor(item.risk_level);
    const dateStr = new Date(item.created_at).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: '2-digit',
    });

    return (
      <TouchableOpacity 
        style={[styles.caseCard, { borderLeftColor: riskColor }]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          navigation.navigate('Analysis', {
            transcript: item.description,
            aiData: {
              alert_triggered: item.risk_score > 0.6,
              scam_probability: Math.round(item.risk_score * 100),
              pattern: item.scam_type,
              explanation: item.description,
              red_flags: ['Registry verification record flag'],
              extracted_entities: [],
              recommended_actions: ['Monitor financial transactions closely'],
              risk_level: item.risk_level,
            }
          });
        }}
      >
        <View style={styles.caseCardHeader}>
          <View style={styles.caseTypeContainer}>
            <View style={[styles.caseIconBox, { backgroundColor: 'rgba(0, 242, 254, 0.05)', borderColor: 'rgba(0, 242, 254, 0.15)' }]}>
              <MaterialCommunityIcons name={getScamIcon(item.scam_type)} size={18} color="#00F2FE" />
            </View>
            <View>
              <Text style={styles.caseTypeName}>{item.scam_type.replace(/_/g, ' ')}</Text>
              <Text style={styles.caseDate}>{dateStr}</Text>
            </View>
          </View>
          <View style={[styles.riskBadge, { backgroundColor: `${riskColor}10`, borderColor: `${riskColor}30` }]}>
            <Text style={[styles.riskBadgeText, { color: riskColor }]}>{item.risk_level}</Text>
          </View>
        </View>
        
        <Text style={styles.caseDescription} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={styles.caseCardFooter}>
          <View style={styles.locationContainer}>
            <MaterialCommunityIcons name="map-marker-outline" size={13} color="#64748B" />
            <Text style={styles.locationText}>{item.report_location || item.city || 'Delhi/NCR'}</Text>
          </View>
          <View style={styles.statusContainer}>
            <View style={[styles.statusDot, { backgroundColor: item.status === 'CLOSED' ? '#475569' : '#00F2FE' }]} />
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const highRiskCount = cases.filter(c => c.risk_level === 'HIGH' || c.risk_level === 'CRITICAL').length;
  const recentCity = cases.length > 0 ? cases[0].report_location || cases[0].city || 'Delhi' : 'New Delhi';

  return (
    <View style={styles.container}>
      {/* Decorative Blur Blobs */}
      <View style={[styles.glowBlob, styles.blobPurple]} />

      {/* HEADER SECTION */}
      <View style={styles.header}>
        <View style={styles.profileRow}>
          <View style={styles.avatarWrapper}>
            <MaterialCommunityIcons name="account-circle-outline" size={24} color="#00F2FE" />
          </View>
          <View style={styles.profileTextWrapper}>
            <Text style={styles.greetingText}>SECURE TERMINAL ACTIVE</Text>
            <Text style={styles.userEmail}>{user?.full_name || user?.email}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <MaterialCommunityIcons name="logout" size={20} color="#EF4444" />
        </TouchableOpacity>
      </View>

      {/* METRICS HEADER CARD (GLOW EFFECT) */}
      <View style={styles.heroCard}>
        <View style={styles.heroHeader}>
          <View style={styles.heroIconWrapper}>
            <MaterialCommunityIcons name="radar" size={20} color="#00F2FE" />
          </View>
          <Text style={styles.heroGlowTitle}>THREAT PERIMETER MONITOR</Text>
          <View style={styles.liveIndicatorBadge}>
            <Text style={styles.liveIndicatorText}>LIVE</Text>
          </View>
        </View>
        
        <View style={styles.metricsGrid}>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Total Threats</Text>
            <Text style={styles.metricVal}>{cases.length}</Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>High Severity</Text>
            <Text style={[styles.metricVal, { color: THEME.highRisk }]}>{highRiskCount}</Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Focus Hub</Text>
            <Text style={styles.metricValText}>{recentCity}</Text>
          </View>
        </View>
      </View>

      {/* CASES FLATLIST */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionHeaderTitle}>Indexed Incident Records</Text>
        <MaterialCommunityIcons name="database-sync" size={16} color="#64748B" />
      </View>
      
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#00F2FE" />
          <Text style={styles.loadingText}>Synchronizing secure data packets...</Text>
        </View>
      ) : cases.length === 0 ? (
        <FlatList
          data={[]}
          renderItem={null}
          ListEmptyComponent={
            <View style={styles.emptyCard}>
              <View style={styles.emptyIconWrapper}>
                <MaterialCommunityIcons name="shield-check-outline" size={44} color="#10B981" />
              </View>
              <Text style={styles.emptyTitle}>Threat Perimeter Secure</Text>
              <Text style={styles.emptySubtitle}>No fraud incidents logged on this terminal. Launch scanner to analyze suspicious incoming interactions.</Text>
            </View>
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#00F2FE"
            />
          }
        />
      ) : (
        <FlatList
          data={cases}
          renderItem={renderCaseCard}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#00F2FE"
            />
          }
        />
      )}

      {/* PRIMARY FLOAT SCAN BUTTON WITH GLOW */}
      <TouchableOpacity 
        style={styles.actionWidgetFloating} 
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          navigation.navigate('Scan');
        }}
      >
        <View style={styles.floatingButtonInner}>
          <MaterialCommunityIcons name="shield-search" size={26} color="#fff" />
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#040814', 
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  glowBlob: {
    position: 'absolute',
    borderRadius: 150,
    opacity: 0.05,
    width: 250,
    height: 250,
    backgroundColor: '#A855F7',
    top: 250,
    right: -100,
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingVertical: 16, 
    borderBottomWidth: 1, 
    borderColor: '#1E293B',
    marginBottom: 20,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 242, 254, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(0, 242, 254, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  profileTextWrapper: {
    justifyContent: 'center',
  },
  greetingText: { 
    fontSize: 9, 
    fontWeight: '900', 
    color: '#64748B', 
    letterSpacing: 1.5,
  },
  userEmail: { 
    fontSize: 15, 
    fontWeight: '800', 
    color: '#fff', 
    marginTop: 2,
  },
  logoutButton: { 
    width: 38, 
    height: 38, 
    borderRadius: 12, 
    backgroundColor: 'rgba(239, 68, 68, 0.05)', 
    justifyContent: 'center', 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.15)',
  },
  heroCard: { 
    backgroundColor: 'rgba(11, 19, 43, 0.5)', 
    padding: 20, 
    borderRadius: 24, 
    borderWidth: 1.5, 
    borderColor: 'rgba(0, 242, 254, 0.15)', 
    marginBottom: 25, 
    shadowColor: '#00F2FE', 
    shadowOffset: { width: 0, height: 10 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 15, 
    elevation: 8,
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  heroIconWrapper: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 242, 254, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  heroGlowTitle: { 
    color: '#00F2FE', 
    fontSize: 10, 
    fontWeight: '900', 
    letterSpacing: 1.2,
    flex: 1,
  },
  liveIndicatorBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderWidth: 0.5,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  liveIndicatorText: {
    color: '#10B981',
    fontSize: 8,
    fontWeight: '900',
  },
  metricsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricLabel: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  metricVal: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '900',
  },
  metricValText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
  },
  metricDivider: {
    width: 1.5,
    height: 28,
    backgroundColor: '#1E293B',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionHeaderTitle: { 
    color: '#fff', 
    fontSize: 13, 
    fontWeight: '800', 
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  listContent: {
    paddingBottom: 110,
  },
  caseCard: { 
    backgroundColor: '#070E1E', 
    padding: 18, 
    borderRadius: 20, 
    borderWidth: 1.5, 
    borderColor: '#1E293B',
    borderLeftWidth: 4, // Thickness vertical edge indicator
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 3,
  },
  caseCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  caseTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  caseIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  caseTypeName: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'capitalize',
  },
  caseDate: {
    color: '#64748B',
    fontSize: 10,
    marginTop: 2,
    fontWeight: '500',
  },
  riskBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  riskBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  caseDescription: {
    color: '#94A3B8',
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 16,
    fontWeight: '500',
  },
  caseCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: '#1E293B',
    paddingTop: 12,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    color: '#64748B',
    fontSize: 11,
    marginLeft: 4,
    fontWeight: '600',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '800',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    color: '#64748B',
    fontSize: 13,
    marginTop: 12,
    fontWeight: '500',
  },
  emptyCard: {
    backgroundColor: '#070E1E',
    borderWidth: 1.5,
    borderColor: '#1E293B',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  emptyIconWrapper: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    marginTop: 18,
    marginBottom: 6,
  },
  emptySubtitle: {
    color: '#64748B',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    fontWeight: '500',
  },
  actionWidgetFloating: { 
    position: 'absolute', 
    bottom: 30, 
    right: 25, 
    width: 62, 
    height: 62, 
    borderRadius: 31, 
    backgroundColor: '#0284C7', 
    justifyContent: 'center', 
    alignItems: 'center', 
    shadowColor: '#0284C7', 
    shadowOffset: { width: 0, height: 6 }, 
    shadowOpacity: 0.45, 
    shadowRadius: 12, 
    elevation: 8, 
    borderWidth: 2, 
    borderColor: '#38BDF8',
  },
  floatingButtonInner: {
    width: '100%',
    height: '100%',
    borderRadius: 29,
    justifyContent: 'center',
    alignItems: 'center',
  },
});