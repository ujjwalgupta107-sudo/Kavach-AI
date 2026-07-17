import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity,
  ActivityIndicator, Alert, Platform, KeyboardAvoidingView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../stores/authStore';
import { apiClient, API_BASE_URL } from '../../services/api/client';
import { colors, spacing, fontSize, fontWeight, borderRadius, shadows } from '../../constants/theme';
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
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerBrand}>
          <Ionicons name="shield-checkmark" size={28} color={colors.brand.cyan} />
          <Text style={styles.headerTitle}>KAVACH</Text>
        </View>
        <Text style={styles.headerSubtitle}>Citizen Interface</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
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
                  size={28}
                  color={active ? colors.brand.cyan : colors.text.muted}
                  style={active && shadows.textGlow(colors.brand.cyan) as any}
                />
                <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{item.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Analysis input */}
        <Card style={styles.inputCard} variant="glow">
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
                    <View style={styles.uploadIconWrapper}>
                      <Ionicons name="cloud-upload-outline" size={32} color={colors.brand.cyan} />
                    </View>
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
                <Ionicons name="warning" size={16} color={colors.status.critical} style={{ marginRight: 8 }} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <View style={styles.actionRow}>
              <Text style={styles.charCount}>{text.length} characters</Text>
              <View style={styles.btnRow}>
                <Button
                  variant="glass"
                  size="sm"
                  onPress={() => { setText(''); setError(null); setFileName(null); }}
                  disabled={isAnalyzing || !text}
                  style={{ marginRight: spacing.sm }}
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
          <View style={styles.signInHintBox}>
            <Ionicons name="information-circle-outline" size={20} color={colors.text.muted} />
            <Text style={styles.signInHint}>
              Analysis results are not saved. Sign in to keep a personal history.
            </Text>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
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
    backgroundColor: 'rgba(9, 9, 11, 0.95)',
  },
  headerBrand: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text.primary, letterSpacing: 1 },
  headerSubtitle: { fontSize: fontSize.sm, color: colors.brand.cyan, fontWeight: '500' },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.lg, paddingBottom: 100 },
  title: { fontSize: fontSize['2xl'], fontWeight: fontWeight.bold, color: colors.text.primary, marginBottom: spacing.xs },
  subtitle: { fontSize: fontSize.base, color: colors.text.secondary, marginBottom: spacing.xl, lineHeight: 22 },
  tabRow: { marginBottom: spacing.xl, flexGrow: 0 },
  tabCard: {
    width: 120,
    height: 100,
    backgroundColor: 'rgba(24, 24, 27, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
    padding: spacing.sm,
  },
  tabCardActive: {
    borderColor: colors.brand.cyan,
    backgroundColor: 'rgba(56, 189, 248, 0.08)',
  },
  tabLabel: { fontSize: fontSize.sm, color: colors.text.secondary, marginTop: spacing.md, textAlign: 'center', fontWeight: '500' },
  tabLabelActive: { color: colors.brand.cyan, fontWeight: 'bold' },
  inputCard: { marginBottom: spacing.lg },
  inputHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  inputTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.text.primary },
  sampleBtn: { fontSize: fontSize.sm, color: colors.brand.cyan, fontWeight: '500' },
  textArea: {
    height: 150,
    backgroundColor: 'rgba(24, 24, 27, 0.5)',
    borderWidth: 1,
    borderColor: colors.surface.raised,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: fontSize.base,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  uploadBox: {
    height: 150,
    backgroundColor: 'rgba(24, 24, 27, 0.5)',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.surface.raised,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  uploadIconWrapper: {
    width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(56, 189, 248, 0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: spacing.sm,
  },
  uploadText: { fontSize: fontSize.base, color: colors.text.primary, fontWeight: '500' },
  uploadHint: { fontSize: fontSize.xs, color: colors.text.muted, marginTop: spacing.xs },
  disabledBox: {
    height: 150,
    backgroundColor: 'rgba(24, 24, 27, 0.5)',
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(244, 63, 94, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.3)',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  errorText: { flex: 1, fontSize: fontSize.sm, color: colors.status.critical },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.sm },
  charCount: { fontSize: fontSize.xs, color: colors.text.muted },
  btnRow: { flexDirection: 'row' },
  stageBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.2)',
    borderRadius: borderRadius.md,
  },
  stageText: { fontSize: fontSize.sm, color: colors.brand.cyan, fontWeight: '500' },
  signInHintBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'center', marginTop: spacing.lg, paddingHorizontal: spacing.xl,
  },
  signInHint: { fontSize: fontSize.sm, color: colors.text.muted, textAlign: 'center', flex: 1 },
});
