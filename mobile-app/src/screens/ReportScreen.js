import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { kavachAPI } from '../services/api';
import * as Haptics from 'expo-haptics';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { THEME } from '../utils/theme';

const SCAM_CATEGORIES = [
  { label: 'Digital Arrest', value: 'DIGITAL_ARREST' },
  { label: 'UPI Fraud', value: 'UPI_FRAUD' },
  { label: 'OTP Theft', value: 'OTP_THEFT' },
  { label: 'Phishing Alert', value: 'PHISHING' },
  { label: 'Investment Scam', value: 'INVESTMENT_SCAM' },
  { label: 'Customs Courier', value: 'COURIER_CUSTOMS_SCAM' },
  { label: 'Fake Job Offers', value: 'JOB_SCAM' },
  { label: 'Loan App Fraud', value: 'LOAN_APP_SCAM' },
  { label: 'Other', value: 'OTHER' }
];

export default function ReportScreen({ route, navigation }) {
  const params = route.params || {};
  
  const [suspectNumber, setSuspectNumber] = useState('');
  const [upiId, setUpiId] = useState('');
  const [scamDetails, setScamDetails] = useState('');
  const [scamType, setScamType] = useState('OTHER');
  const [city, setCity] = useState('New Delhi');
  const [loading, setLoading] = useState(false);

  // Prefill details if navigating from analysis results
  useEffect(() => {
    if (params.prefilledText) setScamDetails(params.prefilledText);
    if (params.phone) setSuspectNumber(params.phone);
    if (params.upi) setUpiId(params.upi);
  }, [params]);

  const handleReportSubmit = async () => {
    if (!scamDetails.trim()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert("Registry Warning", "Please describe the extortion conversation or details.");
      return;
    }

    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Prepare payload matching backend expectations
    const payload = {
      scam_type: scamType,
      description: `${scamDetails}${suspectNumber ? `\nSuspect Phone: ${suspectNumber}` : ''}${upiId ? `\nSuspect UPI: ${upiId}` : ''}`,
      city: city,
      lat: 28.6139, // Default New Delhi coordinates for geolocation registry
      lng: 77.2090
    };

    try {
      const data = await kavachAPI.submitIncidentReport(payload);
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        "🚨 LOGGED TO CENTRAL SHIELD",
        `Incident Registry Success.\n\nYour threat signature has been cataloged for law enforcement dashboard tracking.`,
        [{ 
          text: "RETURN TO HQ", 
          onPress: () => {
            setSuspectNumber('');
            setUpiId('');
            setScamDetails('');
            navigation.navigate('Home');
          }
        }]
      );
    } catch (err) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      console.error(err);
      Alert.alert("Sync Timeout", "Failed to reach backend cluster node. Try again shortly.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>REGISTRY PORTAL</Text>
      <Text style={styles.subtitle}>Index threat signatures directly onto investigator intelligence feeds</Text>

      <View style={styles.glassCard}>
        {/* Category selector */}
        <Text style={styles.label}>Scam Category</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryRow}>
          {SCAM_CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.value}
              style={[
                styles.categoryBadge,
                scamType === cat.value && styles.categoryActiveBadge
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setScamType(cat.value);
              }}
            >
              <Text style={[
                styles.categoryText,
                scamType === cat.value && styles.categoryActiveText
              ]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.label}>Threat Location (City)</Text>
        <View style={styles.inputWrapper}>
          <MaterialCommunityIcons name="map-marker-outline" size={20} color="#64748B" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="e.g. New Delhi, Mumbai, Pune"
            placeholderTextColor="#64748B"
            value={city}
            onChangeText={setCity}
          />
        </View>

        <Text style={styles.label}>Suspect Phone Identifier</Text>
        <View style={styles.inputWrapper}>
          <MaterialCommunityIcons name="phone-outline" size={20} color="#64748B" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="+91 XXXXX XXXXX"
            placeholderTextColor="#64748B"
            keyboardType="phone-pad"
            value={suspectNumber}
            onChangeText={setSuspectNumber}
          />
        </View>

        <Text style={styles.label}>Suspect UPI ID / Banking Details</Text>
        <View style={styles.inputWrapper}>
          <MaterialCommunityIcons name="bank-outline" size={20} color="#64748B" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="fraudster@upi"
            placeholderTextColor="#64748B"
            autoCapitalize="none"
            value={upiId}
            onChangeText={setUpiId}
          />
        </View>

        <Text style={styles.label}>Conversation / Threat Narrative</Text>
        <TextInput
          style={styles.multilineInput}
          placeholder="Paste extortion messages, call transcript details, or demands to assist investigator graph engines..."
          placeholderTextColor="#64748B"
          multiline
          numberOfLines={6}
          value={scamDetails}
          onChangeText={setScamDetails}
        />

        <TouchableOpacity style={styles.fireButton} onPress={handleReportSubmit} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <View style={styles.btnContent}>
              <MaterialCommunityIcons name="cloud-upload" size={18} color="#fff" />
              <Text style={styles.btnText}>UPLOAD THREAT LOGS</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  scrollContent: { padding: 20, paddingBottom: 50 },
  title: { fontSize: 24, fontWeight: '900', color: '#fff', marginTop: 15 },
  subtitle: { color: '#64748B', fontSize: 13, marginTop: 4, marginBottom: 20 },
  glassCard: { 
    backgroundColor: '#070E1E', 
    borderRadius: 20, 
    padding: 22, 
    borderWidth: 1, 
    borderColor: '#1E293B',
  },
  label: { 
    color: '#94A3B8', 
    fontSize: 11, 
    fontWeight: '700', 
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  categoryRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  categoryBadge: {
    backgroundColor: '#020617',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    height: 32,
  },
  categoryActiveBadge: {
    borderColor: 'rgba(0, 242, 254, 0.4)',
    backgroundColor: 'rgba(0, 242, 254, 0.06)',
  },
  categoryText: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '700',
  },
  categoryActiveText: {
    color: '#00F2FE',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#020617',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 20,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 48,
    color: '#fff',
    fontSize: 14,
  },
  multilineInput: { 
    backgroundColor: '#020617', 
    color: '#fff', 
    padding: 15, 
    borderRadius: 12, 
    borderWidth: 1, 
    borderColor: '#334155', 
    fontSize: 14, 
    minHeight: 120, 
    textAlignVertical: 'top', 
    marginBottom: 25,
    lineHeight: 20,
  },
  fireButton: { 
    backgroundColor: '#DC2626', 
    height: 50, 
    borderRadius: 12, 
    justifyContent: 'center', 
    alignItems: 'center',
    shadowColor: '#DC2626',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  btnContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  btnText: { 
    color: '#fff', 
    fontWeight: '800', 
    fontSize: 13, 
    letterSpacing: 0.5,
    marginLeft: 8,
  }
});