import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';

export default function ScanScreen() {
  const [phone, setPhone] = useState('');
  const [callTranscript, setCallTranscript] = useState('');
  const [loading, setLoading] = useState(false);
  const [truecallerData, setTruecallerData] = useState(null);
  const [liveAIResult, setLiveAIResult] = useState(null);

  // Feature 1: Truecaller 5+ Reports System Verification
  const verifyIncomingNumber = async () => {
    if (!phone.trim()) return;
    setLoading(true);
    try {
      // Direct Live API Hit to Backend Engine
      const res = await fetch(`http://10.0.2.2:8000/api/phone/check/${phone}`);
      const data = await res.json();
      setTruecallerData(data);
      
      if (data.trigger_emergency_ui) {
        Alert.alert(
          "🚨 CRITICAL SCAMMER WARNING",
          `KAVACH-Truecaller Intel: This number has ${data.total_reports} ACTIVE Fraud Complaints! Block Immediately.`,
          [{ text: "BLOCK NUMBER", style: "destructive" }, { text: "DISMISS" }]
        );
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  // Feature 2: Real-time Voice to Text AI Analysis Simulator
  const startLiveCallAnalysis = async () => {
    if (!callTranscript.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('http://10.0.2.2:8000/api/call/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phone || "9998887771", audio_transcript_chunk: callTranscript })
      });
      const data = await res.json();
      setLiveAIResult(data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.brandingHeader}>KAVACH <Text style={styles.glowText}>TACTICAL AI</Text></Text>
      <Text style={styles.subtext}>Military-grade intercept protection & fraud intelligence.</Text>

      {/* Box 1: Phone Reputation Tracker */}
      <View style={styles.glassCard}>
        <Text style={styles.sectionTitle}>📞 Truecaller Intel Check</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Unknown Incoming Number..."
          placeholderTextColor="#64748B"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
        />
        <TouchableOpacity style={styles.neonButton} onPress={verifyIncomingNumber}>
          <Text style={styles.btnText}>Scan Number Registry</Text>
        </TouchableOpacity>

        {truecallerData && (
          <View style={styles.intelStatusGrid}>
            <Text style={{color: '#fff'}}>Total Reports System-Wide: <Text style={{color: '#EF4444', fontWeight:'bold'}}>{truecallerData.total_reports}</Text></Text>
            <Text style={{color: '#94A3B8', marginTop: 4}}>Status: {truecallerData.action}</Text>
          </View>
        )}
      </View>

      {/* Box 2: Live Call Intercept Audio Voice Stream Simulator */}
      <View style={styles.glassCard}>
        <Text style={styles.sectionTitle}>🧠 Real-Time Call Voice Stream</Text>
        <Text style={styles.hintText}>Simulate incoming live audio stream transcription:</Text>
        <TextInput
          style={styles.multilineInput}
          placeholder="Paste scammer script chunk here (e.g., 'Transfer 50,000 for investigation')..."
          placeholderTextColor="#64748B"
          multiline
          value={callTranscript}
          onChangeText={setCallTranscript}
        />
        <TouchableOpacity style={[styles.neonButton, {backgroundColor: '#10B981'}]} onPress={startLiveCallAnalysis}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Analyze Live Stream</Text>}
        </TouchableOpacity>

        {liveAIResult && (
          <View style={[styles.resultMatrix, {borderColor: liveAIResult.color}]}>
            <View style={styles.flexRow}>
              <Text style={styles.verdictTitle}>{liveAIResult.level}</Text>
              <Text style={[styles.threatScore, {color: liveAIResult.color}]}>{liveAIResult.score}</Text>
            </View>
            <Text style={styles.actionText}>{liveAIResult.action_required}</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617', padding: 20 },
  brandingHeader: { fontSize: 26, fontWeight: '900', color: '#fff', marginTop: 30, letterSpacing: 1 },
  glowText: { color: '#38BDF8', textShadowColor: '#38BDF8', textShadowRadius: 8 },
  subtext: { color: '#64748B', fontSize: 13, marginBottom: 25 },
  glassCard: { backgroundColor: '#0B1528', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#1E293B', marginBottom: 20, shadowColor: '#38BDF8', shadowOpacity: 0.05, shadowRadius: 10 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#F1F5F9', marginBottom: 15 },
  hintText: { fontSize: 12, color: '#64748B', marginBottom: 10 },
  input: { backgroundColor: '#020617', color: '#fff', padding: 14, borderRadius: 10, borderWidth: 1, borderColor: '#334155', fontSize: 15 },
  multilineInput: { backgroundColor: '#020617', color: '#fff', padding: 14, borderRadius: 10, borderWidth: 1, borderColor: '#334155', fontSize: 15, minHeight: 90, textAlignVertical: 'top' },
  neonButton: { backgroundColor: '#0284C7', padding: 14, borderRadius: 10, alignItems: 'center', marginTop: 15 },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  intelStatusGrid: { marginTop: 15, padding: 12, backgroundColor: '#020617', borderRadius: 8, borderWidth: 1, borderColor: '#1E293B' },
  resultMatrix: { marginTop: 15, padding: 15, backgroundColor: '#020617', borderRadius: 10, borderWidth: 2 },
  flexRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  verdictTitle: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  threatScore: { fontSize: 20, fontWeight: 'bold' },
  actionText: { color: '#94A3B8', fontSize: 13, marginTop: 10, lineHeight: 18 }
});