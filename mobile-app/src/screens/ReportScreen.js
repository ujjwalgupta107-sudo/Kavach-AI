import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { kavachAPI } from '../services/api';

export default function ReportScreen() {
  const [suspectNumber, setSuspectNumber] = useState('');
  const [upiId, setUpiId] = useState('');
  const [scamDetails, setScamDetails] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReportSubmit = async () => {
    if (!suspectNumber.trim() && !upiId.trim()) {
      Alert.alert("🛡️ Tactical Alert", "Please provide at least a Phone Number or UPI ID to index into the registry.");
      return;
    }
    if (!scamDetails.trim()) {
      Alert.alert("🛡️ Tactical Alert", "Please describe the incident for AI script extraction.");
      return;
    }

    setLoading(true);
    try {
      const data = await kavachAPI.submitIncidentReport({
          phone: suspectNumber,
          upi: upiId,
          details: scamDetails
      });
      
      if (data.success) {
        Alert.alert(
          "🛡️ FRAUD INTELLIGENCE LOGGED",
          `Case ID: ${data.case_id}\n\nEntities successfully pushed to central database. NetworkX graph engine is rebuilding fraud links.`,
          [{ text: "ACKNOWLEDGE SYSTEM", onPress: () => {
            setSuspectNumber('');
            setUpiId('');
            setScamDetails('');
          }}]
        );
      }
    } catch (err) {
      Alert.alert("Connection Error", "Could not connect to KAVACH Database Core. Check if server is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.brandingHeader}>INCIDENT <Text style={styles.glowText}>REGISTRY</Text></Text>
      <Text style={styles.subtext}>Report threat signatures to synchronize database across the collective node network.</Text>

      <View style={styles.glassCard}>
        <Text style={styles.label}>Suspect Phone Number</Text>
        <TextInput
          style={styles.input}
          placeholder="+91 XXXXX XXXXX"
          placeholderTextColor="#64748B"
          keyboardType="phone-pad"
          value={suspectNumber}
          onChangeText={setSuspectNumber}
        />

        <Text style={styles.label}>Rogue UPI ID / Bank Account</Text>
        <TextInput
          style={styles.input}
          placeholder="fraudster@upi"
          placeholderTextColor="#64748B"
          autoCapitalize="none"
          value={upiId}
          onChangeText={setUpiId}
        />

        <Text style={styles.label}>Extortion Script / Conversation Details</Text>
        <TextInput
          style={styles.multilineInput}
          placeholder="Paste threatening script messages, legal notices context, or demands..."
          placeholderTextColor="#64748B"
          multiline
          numberOfLines={4}
          value={scamDetails}
          onChangeText={setScamDetails}
        />

        <TouchableOpacity style={styles.fireButton} onPress={handleReportSubmit} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Push to Central Database</Text>}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617', padding: 20 },
  brandingHeader: { fontSize: 26, fontWeight: '900', color: '#fff', marginTop: 30, letterSpacing: 1 },
  glowText: { color: '#EF4444', textShadowColor: '#EF4444', textShadowRadius: 8 },
  subtext: { color: '#64748B', fontSize: 13, marginBottom: 25 },
  glassCard: { backgroundColor: '#0B1528', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#1E293B', marginBottom: 40 },
  label: { color: '#94A3B8', fontSize: 13, fontWeight: '700', marginBottom: 8 },
  input: { backgroundColor: '#020617', color: '#fff', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#334155', fontSize: 15, marginBottom: 20 },
  multilineInput: { backgroundColor: '#020617', color: '#fff', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#334155', fontSize: 15, minHeight: 100, textAlignVertical: 'top', marginBottom: 20 },
  fireButton: { backgroundColor: '#DC2626', padding: 15, borderRadius: 10, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 }
});