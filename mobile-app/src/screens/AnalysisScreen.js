// src/screens/AnalysisScreen.js
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function AnalysisScreen({ route, navigation }) {
  const { transcript, aiData } = route.params || {
    transcript: "Spoke with agent claiming to be from Supreme Court. Demanded immediate verification fee of ₹50,000 regarding illegal parcel.",
    aiData: { alert_triggered: true, scam_probability: 94, pattern: "Digital Arrest Variant", recommendation: "Stop communication immediately." }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>AI STREAM <Text style={styles.glowText}>TRANSCRIPTION</Text></Text>
      <Text style={styles.subText}>Natively parsed audio chunks decoded into standard text streams.</Text>

      {/* CONVERSATION BOX */}
      <View style={styles.transcriptBox}>
        <View style={styles.boxHeader}>
          <MaterialCommunityIcons name="text-to-speech" size={18} color="#6366F1" />
          <Text style={styles.boxHeaderTitle}>Decoded Audio Log</Text>
        </View>
        <Text style={styles.bodyText}>"{transcript}"</Text>
      </View>

      {/* AI FRAUD IDENTIFICATION EVALUATION CARD */}
      <Text style={styles.sectionTitle}>AI Fraud Risk Assessment</Text>
      <View style={[styles.aiCard, aiData.alert_triggered && styles.dangerCard]}>
        <View style={styles.aiHeader}>
          <MaterialCommunityIcons name="robot" size={24} color={aiData.alert_triggered ? "#EF4444" : "#10B981"} />
          <Text style={[styles.aiTitle, { color: aiData.alert_triggered ? "#EF4444" : "#10B981" }]}>
            {aiData.alert_triggered ? "CRITICAL FRAUD TARGET IDENTIFIED" : "CLEAN CONVERSATION PROTOCOL"}
          </Text>
        </View>

        <View style={styles.rowMetric}>
          <Text style={styles.metricLabel}>Scam Probability:</Text>
          <Text style={[styles.metricValue, { color: '#EF4444' }]}>{aiData.scam_probability}%</Text>
        </View>

        <Text style={styles.aiDesc}><Text style={{ fontWeight: 'bold' }}>Pattern Detected:</Text> {aiData.pattern}</Text>
        <Text style={styles.aiDesc}><Text style={{ fontWeight: 'bold' }}>AI Recommendation:</Text> {aiData.recommendation}</Text>
      </View>

      <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Graph')}>
        <Text style={styles.actionBtnText}>EXPLORE RELATIONAL SEGMENTS</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617', padding: 20 },
  title: { fontSize: 22, fontWeight: '900', color: '#fff', marginTop: 20 },
  glowText: { color: '#6366F1' },
  subText: { color: '#64748B', fontSize: 12, marginTop: 4, marginBottom: 20 },
  transcriptBox: { backgroundColor: '#070E1E', padding: 16, borderRadius: 14, borderWidth: 1, borderColor: '#1E293B', marginBottom: 25 },
  boxHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  boxHeaderTitle: { color: '#6366F1', fontWeight: 'bold', marginLeft: 8, fontSize: 13 },
  bodyText: { color: '#94A3B8', fontSize: 14, lineHeight: 22, fontStyle: 'italic' },
  sectionTitle: { color: '#fff', fontSize: 15, fontWeight: '700', marginBottom: 15 },
  aiCard: { backgroundColor: '#070E1E', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#1E293B', marginBottom: 30 },
  dangerCard: { borderColor: 'rgba(239, 68, 68, 0.4)', backgroundColor: '#110C18' },
  aiHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  aiTitle: { fontWeight: '800', fontSize: 14, marginLeft: 10 },
  rowMetric: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12, borderBottomWidth: 1, borderColor: '#1E293B', paddingBottom: 10 },
  metricLabel: { color: '#64748B', fontSize: 13 },
  metricValue: { fontSize: 18, fontWeight: '900' },
  aiDesc: { color: '#94A3B8', fontSize: 13, lineHeight: 18, marginTop: 8 },
  actionBtn: { backgroundColor: '#6366F1', padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 50 },
  actionBtnText: { color: '#fff', fontWeight: '800', fontSize: 13 }
});