import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { THEME } from '../utils/theme';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

export default function AnalysisScreen({ route, navigation }) {
  const { transcript, aiData } = route.params || {
    transcript: "Spoke with agent claiming to be from Supreme Court. Demanded immediate verification fee of ₹50,000 regarding illegal parcel.",
    aiData: { 
      alert_triggered: true, 
      scam_probability: 94, 
      pattern: 'DIGITAL_ARREST', 
      explanation: 'Scammer used digital arrest tactic, demanding security deposits to prevent immediate custody.', 
      red_flags: ['Demand for money', 'Urgency', 'Impersonating law enforcement'],
      extracted_entities: [
        { type: 'PHONE', value: '+91 98765 43210' },
        { type: 'UPI_ID', value: 'cbi.verify@okaxis' }
      ],
      recommended_actions: ['Disconnect the call immediately', 'Do not transfer any money', 'Report to local cyber crime cell'],
      risk_level: 'CRITICAL'
    }
  };

  // State to hold accordion open status
  const [expanded, setExpanded] = useState({
    explanation: true,
    redFlags: true,
    entities: false,
    actions: false
  });

  const toggleSection = (section) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpanded(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Score counter animation
  const [scoreDisplay, setScoreDisplay] = useState(0);
  useEffect(() => {
    let current = 0;
    const target = aiData.scam_probability || 0;
    if (target === 0) return;
    const step = Math.max(1, Math.floor(target / 30));
    
    // Play error haptics if high/critical risk is loaded
    if (aiData.alert_triggered) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    const interval = setInterval(() => {
      current += step;
      if (current >= target) {
        setScoreDisplay(target);
        clearInterval(interval);
      } else {
        setScoreDisplay(current);
      }
    }, 20);

    return () => clearInterval(interval);
  }, [aiData.scam_probability]);

  const isHighRisk = aiData.alert_triggered || aiData.risk_level === 'CRITICAL' || aiData.risk_level === 'HIGH';
  const themeColor = isHighRisk ? THEME.highRisk : (aiData.risk_level === 'MEDIUM' ? THEME.suspicious : THEME.lowRisk);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      
      {/* SCANNING VERDICT HEADER */}
      <View style={[styles.verdictCard, isHighRisk && styles.verdictCardDanger, { borderColor: themeColor }]}>
        <View style={styles.verdictHeader}>
          <MaterialCommunityIcons 
            name={isHighRisk ? 'alert-octagon' : 'checkbox-marked-circle'} 
            size={36} 
            color={themeColor} 
          />
          <View style={styles.verdictTextWrapper}>
            <Text style={styles.verdictLabel}>SCAM DETECTION VERDICT</Text>
            <Text style={[styles.verdictTitle, { color: themeColor }]}>
              {isHighRisk ? `${aiData.risk_level} threat level` : 'No Scams Detected'}
            </Text>
          </View>
        </View>

        {/* METRICS ROW */}
        <View style={styles.riskMetricsRow}>
          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>Scam Probability</Text>
            <Text style={[styles.metricValue, { color: themeColor }]}>{scoreDisplay}%</Text>
          </View>
          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>Attack Category</Text>
            <Text style={styles.metricValueText}>{aiData.pattern?.replace('_', ' ') || 'NONE'}</Text>
          </View>
        </View>

        {isHighRisk && (
          <View style={styles.dangerAlertBanner}>
            <MaterialCommunityIcons name="shield-alert" size={16} color="#fff" />
            <Text style={styles.dangerAlertText}>CRITICAL: High probability of financial extortion or credential theft.</Text>
          </View>
        )}
      </View>

      {/* INPUT TRANSCRIPT EXTRACT */}
      <View style={styles.transcriptBox}>
        <View style={styles.boxHeader}>
          <MaterialCommunityIcons name="file-text-outline" size={16} color="#64748B" />
          <Text style={styles.boxTitle}>Scanned Communication Input</Text>
        </View>
        <Text style={styles.bodyText}>"{transcript}"</Text>
      </View>

      {/* ACCORDION CARDS */}
      <Text style={styles.sectionTitle}>Intelligence Details</Text>

      {/* 1. Explanation */}
      <View style={styles.accordionCard}>
        <TouchableOpacity style={styles.accordionHeader} onPress={() => toggleSection('explanation')}>
          <View style={styles.accordionHeaderTitleRow}>
            <MaterialCommunityIcons name="brain" size={18} color="#00F2FE" />
            <Text style={styles.accordionTitle}>AI Reasoning Explanation</Text>
          </View>
          <MaterialCommunityIcons 
            name={expanded.explanation ? 'chevron-up' : 'chevron-down'} 
            size={18} 
            color="#64748B" 
          />
        </TouchableOpacity>
        
        {expanded.explanation && (
          <View style={styles.accordionContent}>
            <Text style={styles.accordionBodyText}>{aiData.explanation || 'No details available.'}</Text>
          </View>
        )}
      </View>

      {/* 2. Red Flags */}
      <View style={styles.accordionCard}>
        <TouchableOpacity style={styles.accordionHeader} onPress={() => toggleSection('redFlags')}>
          <View style={styles.accordionHeaderTitleRow}>
            <MaterialCommunityIcons name="flag-triangle" size={18} color={THEME.suspicious} />
            <Text style={styles.accordionTitle}>Red Flags Detected</Text>
          </View>
          <MaterialCommunityIcons 
            name={expanded.redFlags ? 'chevron-up' : 'chevron-down'} 
            size={18} 
            color="#64748B" 
          />
        </TouchableOpacity>

        {expanded.redFlags && (
          <View style={styles.accordionContent}>
            {aiData.red_flags && aiData.red_flags.length > 0 ? (
              aiData.red_flags.map((flag, idx) => (
                <View key={idx} style={styles.bulletRow}>
                  <MaterialCommunityIcons name="alert-outline" size={14} color={THEME.suspicious} style={{ marginTop: 2 }} />
                  <Text style={styles.bulletText}>{flag}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.accordionBodyText}>No structural red flags flagged.</Text>
            )}
          </View>
        )}
      </View>

      {/* 3. Extracted Entities */}
      <View style={styles.accordionCard}>
        <TouchableOpacity style={styles.accordionHeader} onPress={() => toggleSection('entities')}>
          <View style={styles.accordionHeaderTitleRow}>
            <MaterialCommunityIcons name="key-variant" size={18} color="#00F2FE" />
            <Text style={styles.accordionTitle}>Extracted Entities ({aiData.extracted_entities?.length || 0})</Text>
          </View>
          <MaterialCommunityIcons 
            name={expanded.entities ? 'chevron-up' : 'chevron-down'} 
            size={18} 
            color="#64748B" 
          />
        </TouchableOpacity>

        {expanded.entities && (
          <View style={styles.accordionContent}>
            {aiData.extracted_entities && aiData.extracted_entities.length > 0 ? (
              aiData.extracted_entities.map((entity, idx) => (
                <View key={idx} style={styles.entityBadgeRow}>
                  <View style={styles.entityTypeBadge}>
                    <Text style={styles.entityTypeText}>{entity.type}</Text>
                  </View>
                  <Text style={styles.entityValueText}>{entity.value}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.accordionBodyText}>No entity identifiers (phone, UPI) parsed.</Text>
            )}
          </View>
        )}
      </View>

      {/* 4. Recommended Actions */}
      <View style={styles.accordionCard}>
        <TouchableOpacity style={styles.accordionHeader} onPress={() => toggleSection('actions')}>
          <View style={styles.accordionHeaderTitleRow}>
            <MaterialCommunityIcons name="shield-check" size={18} color="#10B981" />
            <Text style={styles.accordionTitle}>Safety Recommendations</Text>
          </View>
          <MaterialCommunityIcons 
            name={expanded.actions ? 'chevron-up' : 'chevron-down'} 
            size={18} 
            color="#64748B" 
          />
        </TouchableOpacity>

        {expanded.actions && (
          <View style={styles.accordionContent}>
            {aiData.recommended_actions && aiData.recommended_actions.length > 0 ? (
              aiData.recommended_actions.map((action, idx) => (
                <View key={idx} style={styles.bulletRow}>
                  <MaterialCommunityIcons name="check" size={14} color="#10B981" style={{ marginTop: 2 }} />
                  <Text style={styles.bulletText}>{action}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.accordionBodyText}>Maintain default cybersecurity awareness.</Text>
            )}
          </View>
        )}
      </View>

      {/* NAVIGATION ACTION BUTTONS */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.primaryBtn, { backgroundColor: isHighRisk ? '#EF4444' : '#0284C7' }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            navigation.navigate('Report', {
              prefilledText: transcript,
              phone: aiData.extracted_entities?.find(e => e.type === 'PHONE')?.value || '',
              upi: aiData.extracted_entities?.find(e => e.type === 'UPI_ID')?.value || ''
            });
          }}
        >
          <MaterialCommunityIcons name="shield-alert-outline" size={18} color="#fff" />
          <Text style={styles.btnText}>REPORT THREAT REGISTER</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.secondaryBtn}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            navigation.navigate('Graph');
          }}
        >
          <MaterialCommunityIcons name="lan" size={18} color="#94A3B8" />
          <Text style={styles.secondaryBtnText}>COGNITIVE GRAPH</Text>
        </TouchableOpacity>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  scrollContent: { padding: 20, paddingBottom: 60 },
  verdictCard: {
    backgroundColor: '#070E1E',
    borderWidth: 1,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    marginTop: 10,
  },
  verdictCardDanger: {
    backgroundColor: '#110C18',
  },
  verdictHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  verdictTextWrapper: {
    marginLeft: 15,
  },
  verdictLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 1,
  },
  verdictTitle: {
    fontSize: 20,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  riskMetricsRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderColor: '#1E293B',
    paddingTop: 15,
  },
  metricBox: {
    flex: 1,
  },
  metricLabel: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  metricValue: {
    fontSize: 28,
    fontWeight: '900',
    marginTop: 4,
  },
  metricValueText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 8,
  },
  dangerAlertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DC2626',
    borderRadius: 10,
    padding: 10,
    marginTop: 15,
  },
  dangerAlertText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 8,
    flex: 1,
  },
  transcriptBox: {
    backgroundColor: '#070E1E',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 14,
    padding: 16,
    marginBottom: 25,
  },
  boxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  boxTitle: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 8,
  },
  bodyText: {
    color: '#E2E8F0',
    fontSize: 13,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 15,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  accordionCard: {
    backgroundColor: '#070E1E',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 14,
    marginBottom: 12,
    overflow: 'hidden',
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  accordionHeaderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accordionTitle: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 10,
  },
  accordionContent: {
    padding: 16,
    borderTopWidth: 1,
    borderColor: '#1E293B',
    backgroundColor: '#020617',
  },
  accordionBodyText: {
    color: '#94A3B8',
    fontSize: 13,
    lineHeight: 20,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bulletText: {
    color: '#94A3B8',
    fontSize: 13,
    marginLeft: 8,
    lineHeight: 18,
    flex: 1,
  },
  entityBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  entityTypeBadge: {
    backgroundColor: 'rgba(0, 242, 254, 0.08)',
    borderWidth: 0.5,
    borderColor: 'rgba(0, 242, 254, 0.3)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginRight: 10,
    minWidth: 70,
    alignItems: 'center',
  },
  entityTypeText: {
    color: '#00F2FE',
    fontSize: 9,
    fontWeight: '800',
  },
  entityValueText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  buttonContainer: {
    marginTop: 25,
  },
  primaryBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 50,
    borderRadius: 12,
    marginBottom: 12,
  },
  btnText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 13,
    letterSpacing: 0.5,
    marginLeft: 8,
  },
  secondaryBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1E293B',
    backgroundColor: '#070E1E',
  },
  secondaryBtnText: {
    color: '#94A3B8',
    fontWeight: '800',
    fontSize: 13,
    letterSpacing: 0.5,
    marginLeft: 8,
  },
});