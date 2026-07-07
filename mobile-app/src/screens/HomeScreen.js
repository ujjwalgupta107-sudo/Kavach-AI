import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Dimensions } from 'react-native';
import KavachLogo from '../components/KavachLogo';
import { THEME } from '../utils/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { kavachAPI } from '../services/api';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  const [isListening, setIsListening] = useState(false);
  const [waveHeights, setWaveHeights] = useState([14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14]);

  // Premium audio visualization waves matching the core interface
  useEffect(() => {
    let interval;
    if (isListening) {
      interval = setInterval(() => {
        setWaveHeights(waveHeights.map(() => Math.floor(Math.random() * 55) + 8));
      }, 100);
    } else {
      setWaveHeights([16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16]);
    }
    return () => clearInterval(interval);
  }, [isListening]);

  const triggerAdvancedVoiceIntercept = () => {
    if (!isListening) {
      setIsListening(true);
      
      const userConversationMock = "Your Aadhaar has been linked to an illegal parcel. A CBI case has been registered. Do not disconnect this call or inform your family. Transfer ₹50,000 to the verification account immediately.";
      
      setTimeout(async () => {
        try {
          const data = await kavachAPI.analyzeSuspiciousText(userConversationMock);
          setIsListening(false);

          if (data.risk_level !== 'LOW') {
            Alert.alert(
              "🛑 KAVACH TA-AI REAL-TIME INTERCEPT",
              `CRITICAL THREAT FLAG: ${data.risk_score}% Risk Probability!\n\nCategory: ${data.scam_category}`,
              [
                { 
                  text: "VIEW FULL AI ANALYSIS", 
                  onPress: () => navigation.navigate('Analysis', { 
                    transcript: userConversationMock, 
                    aiData: data 
                  }) 
                },
                { text: "DISCONNECT", style: "destructive" }
              ]
            );
          }
        } catch (error) {
          setIsListening(false);
          Alert.alert("Link Offline", "Make sure your FastAPI engine is running.");
        }
      }, 3500);
    } else {
      setIsListening(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* GLOSSY HEADER BAR */}
      <View style={styles.header}>
        <KavachLogo />
        {/* Investigator Dashboard Access Removed for Citizen App */}
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* WEBPAGE STYLE HERO MODULE */}
        <View style={styles.heroCard}>
          <Text style={styles.heroTitle}>Detect fraud before {"\n"}the <Text style={styles.cyanText}>damage is done.</Text></Text>
          <Text style={styles.heroSub}>Analyzing suspicious interactions, protecting citizens with real-time risk intelligence feeds.</Text>
        </View>

        {/* NATIVE INTERCEPTOR GRAPH COMPONENT DECK */}
        <View style={[styles.scannerDeck, isListening && styles.scannerListening]}>
          <View style={styles.deckHeader}>
            <View style={[styles.liveDot, isListening && { backgroundColor: '#FF007F' }]} />
            <Text style={[styles.deckStatus, isListening && { color: '#FF007F' }]}>
              {isListening ? "REAL-TIME SPEECH TELEMETRY STREAM ACTIVE" : "NATIVE VOICE TELEPHONY INTERCEPTOR"}
            </Text>
          </View>

          {/* Waveform Wrapper */}
          <View style={styles.wavePanel}>
            {waveHeights.map((height, idx) => (
              <View 
                key={idx} 
                style={[
                  styles.barNode, 
                  { height: height, backgroundColor: isListening ? '#FF007F' : '#00F2FE' }
                ]} 
              />
            ))}
          </View>
          
          <Text style={styles.deckFooterText}>
            {isListening ? "Processing streaming chunks via Whisper NLP logic mapping..." : "Tap the floating brain module below to start live automated background scanning."}
          </Text>
        </View>

        {/* PLATFORM ARCHITECTURE GRID */}
        <Text style={styles.sectionHeaderTitle}>Platform Modules</Text>
        <View style={styles.gridContainer}>
          <TouchableOpacity style={styles.moduleBox} onPress={() => navigation.navigate('Scan')}>
            <View style={[styles.iconBoxFrame, { backgroundColor: 'rgba(0, 242, 254, 0.08)', borderColor: '#00F2FE' }]}>
              <MaterialCommunityIcons name="shield-lock-outline" size={24} color="#00F2FE" />
            </View>
            <Text style={styles.boxTitle}>KAVACH Shield</Text>
            <Text style={styles.boxSub}>Analyze communications/SMS transcripts.</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.moduleBox, { borderColor: 'rgba(255, 0, 127, 0.3)' }]} onPress={() => navigation.navigate('Report')}>
            <View style={[styles.iconBoxFrame, { backgroundColor: 'rgba(255, 0, 127, 0.08)', borderColor: '#FF007F' }]}>
              <MaterialCommunityIcons name="alert-octagon-outline" size={24} color="#FF007F" />
            </View>
            <Text style={styles.boxTitle}>Emergency Desk</Text>
            <Text style={styles.boxSub}>Instant incident logging to network cluster.</Text>
          </TouchableOpacity>
        </View>

        {/* Fraud Network Intelligence Link Removed for Citizen App */}
      </ScrollView>

      {/* BRAIN CONTROLLER KEY MODULE */}
      <TouchableOpacity 
        style={[styles.actionWidgetFloating, isListening && styles.widgetActiveStop]} 
        onPress={triggerAdvancedVoiceIntercept}
      >
        {isListening ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <MaterialCommunityIcons name="brain" size={26} color="#fff" />
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617', paddingTop: 50 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 15, borderBottomWidth: 1, borderColor: '#1E293B' },
  radarBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0B1528', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1, borderColor: '#1E293B' },
  liveIndicatorPulse: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#00F2FE', marginRight: 6 },
  badgeTextLive: { color: '#00F2FE', fontSize: 10, fontWeight: '800', marginLeft: 4, letterSpacing: 0.5 },
  content: { padding: 20 },
  
  heroCard: { marginBottom: 25, paddingVertical: 10 },
  heroTitle: { fontSize: 26, fontWeight: '900', color: '#fff', lineHeight: 34, letterSpacing: -0.5 },
  cyanText: { color: '#38BDF8' },
  heroSub: { color: '#64748B', fontSize: 13, lineHeight: 20, marginTop: 10 },

  scannerDeck: { backgroundColor: '#070E1E', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(0, 242, 254, 0.25)', marginBottom: 25, shadowColor: '#00F2FE', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 5 },
  scannerListening: { borderColor: 'rgba(255, 0, 127, 0.6)', backgroundColor: '#0E0712', shadowColor: '#FF007F' },
  deckHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10B981', marginRight: 8 },
  deckStatus: { color: '#10B981', fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  wavePanel: { flexDirection: 'row', height: 50, alignItems: 'center', justifyContent: 'center', marginVertical: 10 },
  barNode: { width: 5, borderRadius: 2.5, marginHorizontal: 3 },
  deckFooterText: { color: '#64748B', fontSize: 12, lineHeight: 18, textAlign: 'center', marginTop: 10 },

  sectionHeaderTitle: { color: '#fff', fontSize: 15, fontWeight: '700', marginBottom: 15, letterSpacing: 0.2 },
  gridContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
  moduleBox: { backgroundColor: '#070E1E', width: '48%', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#1E293B' },
  iconBoxFrame: { padding: 8, borderRadius: 10, alignSelf: 'flex-start', marginBottom: 12, borderWidth: 1 },
  boxTitle: { color: '#fff', fontSize: 14, fontWeight: '700' },
  boxSub: { color: '#64748B', fontSize: 11, marginTop: 5, lineHeight: 15 },

  networkOverviewCard: { backgroundColor: '#070E1E', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#1E293B', marginBottom: 30 },
  networkHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  networkTitleText: { color: '#fff', fontWeight: '700', fontSize: 13, marginLeft: 8 },
  networkBodyText: { color: '#64748B', fontSize: 12, lineHeight: 18 },

  actionWidgetFloating: { position: 'absolute', bottom: 30, right: 25, backgroundColor: '#6366F1', width: 58, height: 58, borderRadius: 29, justifyContent: 'center', alignItems: 'center', shadowColor: '#6366F1', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 8, borderWidth: 2, borderColor: '#818CF8' },
  widgetActiveStop: { backgroundColor: '#FF007F', borderColor: '#FF66B2', shadowColor: '#FF007F' }
});