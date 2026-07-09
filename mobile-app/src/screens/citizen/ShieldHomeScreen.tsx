import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity,
  ActivityIndicator, Alert, Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../stores/authStore';
import { apiClient, API_BASE_URL } from '../../services/api/client';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { ShieldStackParamList } from '../../navigation/CitizenTabs';

type ShieldNavProp = NativeStackNavigationProp<ShieldStackParamList, 'ShieldHome'>;

const SAMPLE_SCAM_MESSAGE =
  'Your Aadhaar has been linked to an illegal parcel. A CBI case has been registered. Do not disconnect this call or inform your family. Transfer ₹50,000 to the verification account immediately.';

const tabs = [
  { icon: 'chatbubble-alert-outline' as const, label: 'Suspicious Message' },
  { icon: 'image-outline' as const, label: 'Screenshot' },
  { icon: 'mic-outline' as const, label: 'Call Recording' },
  { icon: 'document-text-outline' as const, label: 'Describe Incident' },
];

export function ShieldHomeScreen() {
  const [activeTab, setActiveTab] = useState(0);
  const [text, setText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStage, setAnalysisStage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const navigation = useNavigation<ShieldNavProp>();
  const { isAuthenticated } = useAuthStore();

  const handleImagePick = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Please grant camera roll access to upload screenshots.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });

    if (result.canceled) return;

    const asset = result.assets[0];
    setFileName(asset.fileName || 'screenshot.jpg');
    setIsAnalyzing(true);
    setError(null);
    setAnalysisStage('Extracting text from image via OCR...');

    try {
      const formData = new FormData();
      formData.append('file', {
        uri: asset.uri,
        name: asset.fileName || 'screenshot.jpg',
        type: asset.mimeType || 'image/jpeg',
      } as any);

      const response = await fetch(`${API_BASE_URL}/api/v1/public/analyze-image`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response.ok) throw new Error('Image analysis failed');

      const data = await response.json();
      setIsAnalyzing(false);
      const adapted = {
        id: 'public-analysis',
        riskScore: data.risk_score,
        riskLevel: data.risk_level,
        predictedType: data.scam_category,
        explanation: data.explanation,
        redFlags: data.red_flags,
        extractedEntities: data.extracted_entities?.map((ent: any) => ({
          type: ent.type,
          value: ent.value,
          maskedValue: null,
          connectedCaseIds: [],
        })) || [],
        recommendedActions: data.recommended_actions,
      };
      navigation.navigate('AnalyzeResult', { resultData: adapted });
    } catch (err: any) {
      setError(err.message || 'Image processing failed');
      setIsAnalyzing(false);
    }
  };

  const handleAnalyze = async () => {
    if (!text.trim()) return;
    if (text.trim().length < 10) {
      setError('Please provide at least 10 characters for a meaningful analysis.');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setAnalysisStage('Reading content...');

    setTimeout(() => setAnalysisStage('Detecting scam patterns...'), 700);
    setTimeout(() => setAnalysisStage('Extracting suspicious entities...'), 1400);
    setTimeout(() => setAnalysisStage('Checking related intelligence...'), 2000);

    try {
      if (isAuthenticated) {
        const result = await apiClient.post<any>('/api/v1/cases/', {
          description: text,
          source: 'MOBILE',
          status: 'OPEN',
        });
        navigation.navigate('AnalyzeResult', { resultData: result, caseId: result.id });
      } else {
        const response = await fetch(`${API_BASE_URL}/api/v1/public/analyze`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text }),
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData?.detail || errData?.error?.message || 'Analysis failed.');
        }

        const result = await response.json();
        const adapted = {
          id: 'public-analysis',
          riskScore: result.risk_score,
          riskLevel: result.risk_level,
          predictedType: result.scam_category,
          explanation: result.explanation,
          redFlags: result.red_flags,
          extractedEntities: result.extracted_entities?.map((e: any) => ({
            type: e.type,
            value: e.value,
            maskedValue: null,
            connectedCaseIds: [],
          })) || [],
          recommendedActions: result.recommended_actions,
        };
        navigation.navigate('AnalyzeResult', { resultData: adapted });
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
      setIsAnalyzing(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🛡️ KAVACH Shield</Text>
        <Text style={styles.headerSubtitle}>Citizen Interface</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>What would you like KAVACH to check?</Text>
        <Text style={styles.subtitle}>Analyze suspicious content to get an immediate risk assessment.</Text>

        {/* Tab selector */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabRow}>
          {tabs.map((item, i) => {
            const active = activeTab === i;
            return (
              <TouchableOpacity
                key={i}
                style={[styles.tabCard, active && styles.tabCardActive]}
                onPress={() => { setActiveTab(i); setFileName(null); if (i !== 1 && i !== 2) setText(''); }}
              >
                <Ionicons
                  name={item.icon as any}
                  size={24}
                  color={active ? colors.brand.cyan : colors.text.muted}
                />
                <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{item.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Analysis input */}
        <Card style={styles.inputCard}>
          <CardContent>
            <View style={styles.inputHeader}>
              <Text style={styles.inputTitle}>{tabs[activeTab].label} Analysis</Text>
              {(activeTab === 0 || activeTab === 3) && (
                <TouchableOpacity onPress={() => setText(SAMPLE_SCAM_MESSAGE)}>
                  <Text style={styles.sampleBtn}>Use sample</Text>
                </TouchableOpacity>
              )}
            </View>

            {activeTab === 2 ? (
              <View style={styles.disabledBox}>
                <Ionicons name="mic-off-outline" size={32} color={colors.text.muted} />
                <Text style={styles.disabledText}>
                  Call recording analysis is not available in this version.
                </Text>
              </View>
            ) : activeTab === 1 ? (
              <TouchableOpacity style={styles.uploadBox} onPress={handleImagePick} disabled={isAnalyzing}>
                {isAnalyzing ? (
                  <>
                    <ActivityIndicator size="small" color={colors.brand.cyan} />
                    <Text style={styles.stageText}>{analysisStage}</Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="cloud-upload-outline" size={32} color={colors.text.muted} />
                    <Text style={styles.uploadText}>Tap to upload Screenshot</Text>
                    <Text style={styles.uploadHint}>(Real OCR Extraction)</Text>
                  </>
                )}
              </TouchableOpacity>
            ) : (
              <TextInput
                style={styles.textArea}
                value={text}
                onChangeText={setText}
                placeholder={
                  activeTab === 3
                    ? 'Describe the incident or phone call in detail...'
                    : 'Paste the suspicious SMS, WhatsApp message, email here...'
                }
                placeholderTextColor={colors.text.muted}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
                editable={!isAnalyzing}
              />
            )}

            {error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <View style={styles.actionRow}>
              <Text style={styles.charCount}>{text.length} characters</Text>
              <View style={styles.btnRow}>
                <Button
                  variant="ghost"
                  size="sm"
                  onPress={() => { setText(''); setError(null); setFileName(null); }}
                  disabled={isAnalyzing || !text}
                >
                  Clear
                </Button>
                <Button
                  size="sm"
                  onPress={handleAnalyze}
                  disabled={isAnalyzing || text.trim().length < 10}
                  loading={isAnalyzing && activeTab !== 1}
                >
                  {isAnalyzing ? 'Analyzing...' : 'Analyze'}
                </Button>
              </View>
            </View>

            {isAnalyzing && activeTab !== 1 && (
              <View style={styles.stageBar}>
                <ActivityIndicator size="small" color={colors.brand.cyan} />
                <Text style={styles.stageText}>{analysisStage}</Text>
              </View>
            )}
          </CardContent>
        </Card>

        {!isAuthenticated && (
          <Text style={styles.signInHint}>
            Analysis results are not saved. Sign in to keep a personal history.
          </Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface.base },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 56 : 40,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface.raised,
  },
  headerTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.brand.cyan },
  headerSubtitle: { fontSize: fontSize.sm, color: colors.text.muted },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.lg, paddingBottom: 100 },
  title: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text.primary, marginBottom: spacing.xs },
  subtitle: { fontSize: fontSize.base, color: colors.text.secondary, marginBottom: spacing.xl },
  tabRow: { marginBottom: spacing.xl, flexGrow: 0 },
  tabCard: {
    width: 110,
    height: 90,
    backgroundColor: colors.surface.elevated,
    borderWidth: 1,
    borderColor: colors.surface.raised,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
    padding: spacing.sm,
  },
  tabCardActive: {
    borderColor: colors.brand.cyan,
    backgroundColor: 'rgba(6, 182, 212, 0.05)',
  },
  tabLabel: { fontSize: fontSize.xs, color: colors.text.secondary, marginTop: spacing.xs, textAlign: 'center' },
  tabLabelActive: { color: colors.brand.cyan },
  inputCard: { marginBottom: spacing.lg },
  inputHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  inputTitle: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text.primary },
  sampleBtn: { fontSize: fontSize.xs, color: colors.brand.cyan },
  textArea: {
    height: 140,
    backgroundColor: colors.surface.base,
    borderWidth: 1,
    borderColor: colors.surface.raised,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: fontSize.base,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  uploadBox: {
    height: 140,
    backgroundColor: colors.surface.base,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.surface.raised,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  uploadText: { fontSize: fontSize.sm, color: colors.text.secondary, marginTop: spacing.sm },
  uploadHint: { fontSize: fontSize.xs, color: colors.text.muted, marginTop: spacing.xs },
  disabledBox: {
    height: 140,
    backgroundColor: colors.surface.base,
    borderWidth: 1,
    borderColor: colors.surface.raised,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    padding: spacing.lg,
  },
  disabledText: { fontSize: fontSize.sm, color: colors.text.secondary, textAlign: 'center', marginTop: spacing.sm },
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.5)',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  errorText: { fontSize: fontSize.sm, color: colors.status.critical },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  charCount: { fontSize: fontSize.xs, color: colors.text.muted },
  btnRow: { flexDirection: 'row', gap: spacing.sm },
  stageBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: 'rgba(6, 182, 212, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.2)',
    borderRadius: borderRadius.md,
  },
  stageText: { fontSize: fontSize.sm, color: colors.brand.cyan },
  signInHint: { fontSize: fontSize.xs, color: colors.text.muted, textAlign: 'center', marginTop: spacing.lg },
});
