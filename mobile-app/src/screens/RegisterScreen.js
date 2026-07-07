import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useAuth } from '../context/AuthContext';
import * as Haptics from 'expo-haptics';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function RegisterScreen({ navigation }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('CITIZEN'); // CITIZEN or INVESTIGATOR
  const [investigatorCode, setInvestigatorCode] = useState('');
  const [focusedField, setFocusedField] = useState(null);
  
  const { register, loading } = useAuth();

  const handleRegister = async () => {
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Validation Error', 'Please fill in all required fields.');
      return;
    }

    if (role === 'INVESTIGATOR' && !investigatorCode.trim()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Authorization Error', 'Investigators must enter their authorization credentials.');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const result = await register(
      email.trim(),
      password,
      fullName.trim(),
      role,
      investigatorCode.trim()
    );

    if (result.success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Registration Failed', result.error || 'Please double check input parameters.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      {/* Decorative background glow blobs */}
      <View style={[styles.glowBlob, styles.blobCyan]} />
      <View style={[styles.glowBlob, styles.blobPurple]} />

      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.logoContainer}>
          <Text style={styles.title}>SHIELD <Text style={styles.glowText}>REGISTRY</Text></Text>
          <Text style={styles.subtitle}>Enlist in the citizen protection collective</Text>
        </View>

        <View style={styles.formContainer}>
          {/* Role selector */}
          <Text style={styles.inputLabel}>Select Your Role</Text>
          <View style={styles.roleContainer}>
            <TouchableOpacity 
              style={[styles.roleTab, role === 'CITIZEN' && styles.roleActiveTab]} 
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setRole('CITIZEN');
              }}
            >
              <MaterialCommunityIcons name="account-outline" size={18} color={role === 'CITIZEN' ? '#00F2FE' : '#64748B'} />
              <Text style={[styles.roleText, role === 'CITIZEN' && styles.roleActiveText]}>Citizen</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.roleTab, role === 'INVESTIGATOR' && styles.roleActiveTab]} 
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setRole('INVESTIGATOR');
              }}
            >
              <MaterialCommunityIcons name="shield-account-outline" size={18} color={role === 'INVESTIGATOR' ? '#00F2FE' : '#64748B'} />
              <Text style={[styles.roleText, role === 'INVESTIGATOR' && styles.roleActiveText]}>Investigator</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.inputLabel}>Full Name</Text>
          <View style={[
            styles.inputWrapper, 
            focusedField === 'fullName' && styles.inputWrapperFocused
          ]}>
            <MaterialCommunityIcons 
              name="account-box-outline" 
              size={20} 
              color={focusedField === 'fullName' ? '#00F2FE' : '#64748B'} 
              style={styles.inputIcon} 
            />
            <TextInput
              style={styles.input}
              placeholder="Arjun Kumar"
              placeholderTextColor="#475569"
              autoCapitalize="words"
              value={fullName}
              onChangeText={setFullName}
              onFocus={() => setFocusedField('fullName')}
              onBlur={() => setFocusedField(null)}
            />
          </View>

          <Text style={styles.inputLabel}>Email Address</Text>
          <View style={[
            styles.inputWrapper, 
            focusedField === 'email' && styles.inputWrapperFocused
          ]}>
            <MaterialCommunityIcons 
              name="email-outline" 
              size={20} 
              color={focusedField === 'email' ? '#00F2FE' : '#64748B'} 
              style={styles.inputIcon} 
            />
            <TextInput
              style={styles.input}
              placeholder="name@example.com"
              placeholderTextColor="#475569"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={setEmail}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField(null)}
            />
          </View>

          <Text style={styles.inputLabel}>Password</Text>
          <View style={[
            styles.inputWrapper, 
            focusedField === 'password' && styles.inputWrapperFocused
          ]}>
            <MaterialCommunityIcons 
              name="lock-outline" 
              size={20} 
              color={focusedField === 'password' ? '#00F2FE' : '#64748B'} 
              style={styles.inputIcon} 
            />
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#475569"
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              value={password}
              onChangeText={setPassword}
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField(null)}
            />
          </View>

          {role === 'INVESTIGATOR' && (
            <View>
              <Text style={[styles.inputLabel, { color: '#FF9F43' }]}>Investigator Registration Secret Code</Text>
              <View style={[
                styles.inputWrapper, 
                focusedField === 'code' && { borderColor: '#FF9F43' },
                focusedField !== 'code' && { borderColor: 'rgba(255, 159, 67, 0.3)' }
              ]}>
                <MaterialCommunityIcons 
                  name="security" 
                  size={20} 
                  color={focusedField === 'code' ? '#FF9F43' : 'rgba(255, 159, 67, 0.6)'} 
                  style={styles.inputIcon} 
                />
                <TextInput
                  style={styles.input}
                  placeholder="Enter secret authorization key..."
                  placeholderTextColor="#475569"
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={investigatorCode}
                  onChangeText={setInvestigatorCode}
                  onFocus={() => setFocusedField('code')}
                  onBlur={() => setFocusedField(null)}
                />
              </View>
            </View>
          )}

          <TouchableOpacity style={styles.registerButton} onPress={handleRegister} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.registerButtonText}>REGISTER SYSTEM ACCOUNT</Text>
            )}
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already registered?</Text>
            <TouchableOpacity onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navigation.navigate('Login');
            }}>
              <Text style={styles.loginText}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#040814',
  },
  glowBlob: {
    position: 'absolute',
    borderRadius: 150,
    opacity: 0.08,
  },
  blobCyan: {
    width: 200,
    height: 200,
    backgroundColor: '#00F2FE',
    top: -30,
    right: -30,
  },
  blobPurple: {
    width: 250,
    height: 250,
    backgroundColor: '#A855F7',
    bottom: -60,
    left: -60,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 1.5,
  },
  glowText: {
    color: '#00F2FE',
    textShadowColor: 'rgba(0, 242, 254, 0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '600',
  },
  formContainer: {
    backgroundColor: 'rgba(11, 19, 43, 0.6)',
    padding: 26,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(30, 41, 59, 0.8)',
  },
  roleContainer: {
    flexDirection: 'row',
    backgroundColor: '#020617',
    padding: 4,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#1E293B',
    marginBottom: 22,
  },
  roleTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    borderRadius: 10,
  },
  roleActiveTab: {
    backgroundColor: 'rgba(0, 242, 254, 0.08)',
    borderWidth: 0.5,
    borderColor: 'rgba(0, 242, 254, 0.3)',
  },
  roleText: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 6,
  },
  roleActiveText: {
    color: '#00F2FE',
  },
  inputLabel: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#020617',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#1E293B',
    marginBottom: 22,
    paddingHorizontal: 14,
    height: 52,
  },
  inputWrapperFocused: {
    borderColor: '#00F2FE',
    shadowColor: '#00F2FE',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: '100%',
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  registerButton: {
    backgroundColor: '#0284C7',
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  registerButtonText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 13,
    letterSpacing: 0.8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 22,
  },
  footerText: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '500',
  },
  loginText: {
    color: '#00F2FE',
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 6,
    textShadowColor: 'rgba(0, 242, 254, 0.4)',
    textShadowRadius: 4,
  },
});
