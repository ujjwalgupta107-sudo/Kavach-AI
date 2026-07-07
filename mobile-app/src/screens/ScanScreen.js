import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, Animated, Dimensions, ActivityIndicator, Alert } from 'react-native';
import { kavachAPI } from '../services/api';
import * as Haptics from 'expo-haptics';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { THEME } from '../utils/theme';

const { width, height } = Dimensions.get('window');

const MOCK_SCREENSHOTS = [
  {
    id: 'ss1',
    title: '💬 WhatsApp Arrest Threat',
    text: 'URGENT: This is CBI Cyber Division. An illegal cargo of contraband parcel was intercepted with your Aadhaar ID. A warrant is issued. Do not tell anyone. Connect to video call immediately or you will be arrested under section 340.',
    desc: 'Simulated digital arrest notification screenshot.'
  },
  {
    id: 'ss2',
    title: '🏦 Bank Account Suspended SMS',
    text: 'Dear HDFC Customer, your NetBanking account will be blocked today. Please click link immediately to update your PAN Card: https://hdfc-verification.net/pan-update. Failure to do so will result in permanent block.',
    desc: 'Simulated banking phishing text alert.'
  },
  {
    id: 'ss3',
    title: '🎁 Fake Lottery Winner',
    text: 'CONGRATULATIONS! You have won ₹25,00,000 in Kaun Banega Crorepati Lottery. To claim your prize money, contact KBC manager Mr. Rana Pratap at 9876543210. Processing fee of ₹12,500 must be paid to ubc-claim@upi.',
    desc: 'Simulated lottery winning scam message.'
  }
];

export default function ScanScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('TEXT'); 
  const [textInput, setTextInput] = useState('');
  const [selectedScreenshot, setSelectedScreenshot] = useState(null);
  const [focusedField, setFocusedField] = useState(null);
  
  // Audio state
  const [isRecording, setIsRecording] = useState(false);
  const [audioTranscript, setAudioTranscript] = useState('');
  
  // Loading & Animation states
  const [scanning, setScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState('Initializing KAVACH engine...');
  
  // Animation hooks
  const radarScale = useRef(new Animated.Value(0.5)).current;
  const radarOpacity = useRef(new Animated.Value(1)).current;
  const laserAnim = useRef(new Animated.Value(0)).current;
  const micRippleScale = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Pulsating Radar & Laser Scanner Animation
  useEffect(() => {
    let radarAnimation;
    let laserAnimation;
    
    if (scanning) {
      radarAnimation = Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(radarScale, {
              toValue: 2,
              duration: 2000,
              useNativeDriver: true,
            }),
            Animated.timing(radarScale, {
              toValue: 0.5,
              duration: 0,
              useNativeDriver: true,
            })
          ]),
          Animated.sequence([
            Animated.timing(radarOpacity, {
              toValue: 0,
              duration: 2000,
              useNativeDriver: true,
            }),
            Animated.timing(radarOpacity, {
              toValue: 1,
              duration: 0,
              useNativeDriver: true,
            })
          ])
        ])
      );
      radarAnimation.start();

      laserAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(laserAnim, {
            toValue: 1,
            duration: 1800,
            useNativeDriver: true,
          }),
          Animated.timing(laserAnim, {
            toValue: 0,
            duration: 1800,
            useNativeDriver: true,
          })
        ])
      );
      laserAnimation.start();
    } else {
      radarScale.setValue(0.5);
      radarOpacity.setValue(1);
      laserAnim.setValue(0);
    }
    return () => {
      if (radarAnimation) radarAnimation.stop();
      if (laserAnimation) laserAnimation.stop();
    };
  }, [scanning]);

  // Audio Recording Pulsing Ripple
  useEffect(() => {
    let micAnimation;
    if (isRecording) {
      micAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(micRippleScale, {
            toValue: 1.4,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(micRippleScale, {
            toValue: 1.0,
            duration: 1000,
            useNativeDriver: true,
          })
        ])
      );
      micAnimation.start();
    } else {
      micRippleScale.setValue(1.0);
    }
    return () => {
      if (micAnimation) micAnimation.stop();
    };
  }, [isRecording]);

  // Telemetry status update cycle during scanning
  useEffect(() => {
    if (!scanning) return;
    
    const statuses = [
      { text: 'Establishing secure pipeline connection...', delay: 0 },
      { text: 'Applying OCR text filters & cleanups...', delay: 1000 },
      { text: 'Extracting named entities (UPI, Phone)...', delay: 2000 },
      { text: 'Cross-referencing fraud cluster records...', delay: 3200 },
      { text: 'Generating AI risk metrics from Gemini...', delay: 4500 },
      { text: 'Packaging final telemetry report...', delay: 5800 }
    ];

    const timeouts = statuses.map(s => 
      setTimeout(() => {
        setScanStatus(s.text);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }, s.delay)
    );

    return () => timeouts.forEach(clearTimeout);
  }, [scanning]);

  const executeAnalysis = async (textToScan) => {
    setScanning(true);
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 6500,
      useNativeDriver: false,
    }).start();

    try {
      const result = await kavachAPI.analyzeSuspiciousText(textToScan);
      
      setTimeout(() => {
        setScanning(false);
        progressAnim.setValue(0);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        
        navigation.navigate('Analysis', {
          transcript: textToScan,
          aiData: {
            alert_triggered: result.risk_level === 'CRITICAL' || result.risk_level === 'HIGH',
            scam_probability: Math.round(result.risk_score),
            pattern: result.scam_category,
            explanation: result.explanation,
            red_flags: result.red_flags || [],
            extracted_entities: result.extracted_entities || [],
            recommended_actions: result.recommended_actions || [],
            risk_level: result.risk_level,
          }
        });
      }, 6500);

    } catch (error) {
      setScanning(false);
      progressAnim.setValue(0);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Scan Failed', 'KAVACH AI connection timed out. Ensure the backend is reachable.');
    }
  };

  const handleSubmit = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (activeTab === 'TEXT') {
      if (!textInput.trim() || textInput.trim().length < 10) {
        Alert.alert('Analysis Rejected', 'Please enter at least 10 characters to analyze scam risk.');
        return;
      }
      executeAnalysis(textInput.trim());
    } else if (activeTab === 'SCREENSHOT') {
      if (!selectedScreenshot) {
        Alert.alert('Selection Required', 'Please select a suspicious screenshot to extract text.');
        return;
      }
      executeAnalysis(selectedScreenshot.text);
    } else if (activeTab === 'AUDIO') {
      const demoAudio = "Alert! This is standard bank customer service. We have detected a suspicious login attempt on your netbanking. To prevent block, transfer security deposits of ₹35,000 to registry@upi. Do not share your OTP.";
      executeAnalysis(demoAudio);
    }
  };

  const handleAudioSim = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (!isRecording) {
      setIsRecording(true);
      setAudioTranscript('Listening to incoming voice telemetry stream...');
      
      setTimeout(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setAudioTranscript('"Hello, I am calling from Delhi Customs. An illegal parcel is registered on your ID. You must pay ₹50,000 clearance..."');
      }, 2000);
    } else {
      setIsRecording(false);
      setAudioTranscript('');
    }
  };

  // Interpolate laser line y position
  const laserTranslateY = laserAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [5, 185]
  });

  if (scanning) {
    const widthPercentage = progressAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0%', '100%']
    });

    return (
      <View style={styles.scanLoadingContainer}>
        <View style={styles.radarWrapper}>
          <Animated.View 
            style={[
              styles.radarRing, 
              { 
                transform: [{ scale: radarScale }], 
                opacity: radarOpacity 
              }
            ]} 
          />
          <View style={styles.radarCenter}>
            <MaterialCommunityIcons name="brain" size={48} color="#00F2FE" />
          </View>
          
          {/* Animated Laser Scanning Line */}
          <Animated.View 
            style={[
              styles.laserLine,
              { transform: [{ translateY: laserTranslateY }] }
            ]}
          />
        </View>

        <Text style={styles.scanHeadline}>KAVACH AI ENGINE ACTIVE</Text>
        <Text style={styles.scanStatusText}>{scanStatus}</Text>

        {/* ProgressBar */}
        <View style={styles.progressBarTrack}>
          <Animated.View style={[styles.progressBarFill, { width: widthPercentage }]} />
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>LAUNCH SCANNER</Text>
      <Text style={styles.subtitle}>Select threat signature vector for AI analysis</Text>

      {/* SLEEK SEGMENTED TABS */}
      <View style={styles.tabContainer}>
        {['TEXT', 'SCREENSHOT', 'AUDIO'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabButton, activeTab === tab && styles.tabActiveButton]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setActiveTab(tab);
            }}
          >
            <Text style={[styles.tabButtonText, activeTab === tab && styles.tabActiveButtonText]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* INPUT FORM DECK */}
      <View style={styles.glassCard}>
        {activeTab === 'TEXT' && (
          <View>
            <Text style={styles.label}>Suspicious Message/SMS Text</Text>
            <TextInput
              style={[
                styles.multilineInput,
                focusedField === 'text' && styles.inputFocused
              ]}
              placeholder="Paste suspicious text message, email snippet, or WhatsApp extortion prompt..."
              placeholderTextColor="#475569"
              multiline
              value={textInput}
              onChangeText={setTextInput}
              onFocus={() => setFocusedField('text')}
              onBlur={() => setFocusedField(null)}
            />
          </View>
        )}

        {activeTab === 'SCREENSHOT' && (
          <View>
            <Text style={styles.label}>Select Suspicious Screenshot</Text>
            <Text style={styles.descriptionText}>Simulate scanning local screenshots stored in photo library:</Text>
            
            {MOCK_SCREENSHOTS.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.screenshotItem,
                  selectedScreenshot?.id === item.id && styles.screenshotItemActive
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSelectedScreenshot(item);
                }}
              >
                <View style={styles.screenshotRow}>
                  <View style={[
                    styles.thumbnailSim,
                    selectedScreenshot?.id === item.id && styles.thumbnailActive
                  ]}>
                    <MaterialCommunityIcons 
                      name={selectedScreenshot?.id === item.id ? 'check' : 'image-outline'} 
                      size={18} 
                      color={selectedScreenshot?.id === item.id ? '#00F2FE' : '#64748B'} 
                    />
                  </View>
                  <View style={styles.screenshotDetails}>
                    <Text style={[styles.screenshotTitle, selectedScreenshot?.id === item.id && styles.screenshotTextActive]}>
                      {item.title}
                    </Text>
                    <Text style={styles.screenshotDesc}>{item.desc}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {activeTab === 'AUDIO' && (
          <View style={styles.audioContainer}>
            <Text style={styles.label}>Speech Telemetry Intercept</Text>
            <Text style={styles.descriptionText}>Records current call audio stream and maps threat script matching:</Text>

            <View style={styles.micButtonContainer}>
              {isRecording && (
                <Animated.View 
                  style={[
                    styles.micRipple, 
                    { transform: [{ scale: micRippleScale }] }
                  ]} 
                />
              )}
              <TouchableOpacity 
                style={[styles.audioMicButton, isRecording && styles.audioMicButtonActive]} 
                onPress={handleAudioSim}
              >
                <MaterialCommunityIcons 
                  name={isRecording ? 'stop' : 'microphone'} 
                  size={36} 
                  color="#fff" 
                />
              </TouchableOpacity>
            </View>

            <Text style={[styles.audioStatusText, isRecording && { color: '#FF007F' }]}>
              {isRecording ? 'STREAMING REAL-TIME AUDIO PORT' : 'MIC CHANNEL READY'}
            </Text>

            {audioTranscript ? (
              <View style={styles.transcriptPreview}>
                <Text style={styles.transcriptText}>{audioTranscript}</Text>
              </View>
            ) : null}
          </View>
        )}

        <TouchableOpacity 
          style={[styles.submitButton, activeTab === 'AUDIO' && !isRecording && styles.submitButtonDisabled]}
          onPress={handleSubmit}
        >
          <Text style={styles.submitButtonText}>EXECUTE THREAT SCAN</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#040814' },
  scrollContent: { padding: 20 },
  title: { fontSize: 24, fontWeight: '900', color: '#fff', marginTop: 15 },
  subtitle: { color: '#64748B', fontSize: 13, marginTop: 4, marginBottom: 20 },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#070E1E',
    padding: 4,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#1E293B',
    marginBottom: 25,
  },
  tabButton: {
    flex: 1,
    height: 42,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  tabActiveButton: {
    backgroundColor: 'rgba(0, 242, 254, 0.08)',
    borderWidth: 0.5,
    borderColor: 'rgba(0, 242, 254, 0.3)',
  },
  tabButtonText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '700',
  },
  tabActiveButtonText: {
    color: '#00F2FE',
  },
  glassCard: {
    backgroundColor: 'rgba(11, 19, 43, 0.4)',
    borderWidth: 1.5,
    borderColor: '#1E293B',
    borderRadius: 24,
    padding: 22,
    marginBottom: 40,
  },
  label: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  descriptionText: {
    color: '#64748B',
    fontSize: 12,
    marginBottom: 16,
    lineHeight: 18,
    fontWeight: '500',
  },
  multilineInput: {
    backgroundColor: '#020617',
    color: '#fff',
    borderWidth: 1.5,
    borderColor: '#1E293B',
    borderRadius: 14,
    padding: 16,
    fontSize: 15,
    minHeight: 150,
    textAlignVertical: 'top',
    lineHeight: 22,
    marginBottom: 20,
  },
  inputFocused: {
    borderColor: '#00F2FE',
  },
  screenshotItem: {
    backgroundColor: '#020617',
    borderWidth: 1.5,
    borderColor: '#1E293B',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },
  screenshotItemActive: {
    borderColor: 'rgba(0, 242, 254, 0.5)',
    backgroundColor: 'rgba(0, 242, 254, 0.02)',
  },
  screenshotRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  thumbnailSim: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: 'rgba(71, 85, 105, 0.1)',
    borderWidth: 1,
    borderColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnailActive: {
    backgroundColor: 'rgba(0, 242, 254, 0.05)',
    borderColor: 'rgba(0, 242, 254, 0.3)',
  },
  screenshotDetails: {
    marginLeft: 12,
    flex: 1,
  },
  screenshotTitle: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
  },
  screenshotTextActive: {
    color: '#00F2FE',
  },
  screenshotDesc: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 2,
    fontWeight: '500',
  },
  audioContainer: {
    alignItems: 'center',
    paddingVertical: 15,
  },
  micButtonContainer: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
  },
  micRipple: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 0, 127, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 127, 0.3)',
  },
  audioMicButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#0284C7',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0284C7',
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 2,
  },
  audioMicButtonActive: {
    backgroundColor: '#FF007F',
    shadowColor: '#FF007F',
  },
  audioStatusText: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.2,
    marginTop: 5,
  },
  transcriptPreview: {
    backgroundColor: '#020617',
    borderWidth: 1.5,
    borderColor: '#1E293B',
    borderRadius: 12,
    padding: 14,
    width: '100%',
    marginTop: 20,
  },
  transcriptText: {
    color: '#94A3B8',
    fontSize: 13,
    fontStyle: 'italic',
    lineHeight: 19,
    textAlign: 'center',
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: '#0284C7',
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#0284C7',
    shadowOpacity: 0.35,
    shadowRadius: 10,
  },
  submitButtonDisabled: {
    backgroundColor: '#1E293B',
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 13,
    letterSpacing: 0.8,
  },
  
  // Loading animations
  scanLoadingContainer: {
    flex: 1,
    backgroundColor: '#040814',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  radarWrapper: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  radarRing: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 2,
    borderColor: '#00F2FE',
    backgroundColor: 'rgba(0, 242, 254, 0.03)',
  },
  radarCenter: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#070E1E',
    borderWidth: 2.5,
    borderColor: '#00F2FE',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#00F2FE',
    shadowOpacity: 0.3,
    shadowRadius: 15,
  },
  laserLine: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    height: 3,
    backgroundColor: '#00F2FE',
    shadowColor: '#00F2FE',
    shadowOpacity: 0.9,
    shadowRadius: 8,
  },
  scanHeadline: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  scanStatusText: {
    color: '#64748B',
    fontSize: 13,
    marginBottom: 30,
    fontWeight: '600',
  },
  progressBarTrack: {
    width: '100%',
    height: 6,
    backgroundColor: '#1E293B',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#00F2FE',
  },
});