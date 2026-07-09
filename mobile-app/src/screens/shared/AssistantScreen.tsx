import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../stores/authStore';
import { apiClient } from '../../services/api/client';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { ChatMessage } from '../../types';

export function AssistantScreen() {
  const { user } = useAuthStore();
  const isCitizen = user?.role === 'CITIZEN';

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: isCitizen
        ? 'Hello Citizen. I am the KAVACH AI assistant. I can guide you on reporting scams and staying safe. How can I help?'
        : 'Hello Investigator. I am the KAVACH AI assistant. I have access to all cases, entity graphs, and live alerts. How can I assist you today?',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const data = await apiClient.post<any>('/api/v1/assistant/chat', { message: userMsg });
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: data.reply }]);
    } catch (error) {
      setMessages(prev => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: 'assistant', content: 'Connection Error: Could not reach the assistant service.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isUser = item.role === 'user';
    return (
      <View style={[styles.msgRow, isUser && styles.msgRowUser]}>
        <View style={[styles.avatar, isUser ? styles.avatarUser : styles.avatarBot]}>
          <Ionicons
            name={isUser ? 'person' : 'hardware-chip'}
            size={16}
            color={isUser ? colors.white : colors.brand.cyan}
          />
        </View>
        <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleBot]}>
          <Text style={[styles.msgText, isUser && styles.msgTextUser]}>{item.content}</Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Ionicons name="sparkles" size={22} color={colors.brand.cyan} />
        </View>
        <View>
          <Text style={styles.headerTitle}>KAVACH AI Assistant</Text>
          <Text style={styles.headerSubtitle}>
            {isCitizen ? 'Your safety companion.' : 'Your intelligent investigation partner.'}
          </Text>
        </View>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.messageList}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={
          loading ? (
            <View style={[styles.msgRow]}>
              <View style={[styles.avatar, styles.avatarBot]}>
                <Ionicons name="hardware-chip" size={16} color={colors.brand.cyan} />
              </View>
              <View style={[styles.bubble, styles.bubbleBot, styles.typingBubble]}>
                <View style={styles.typingDots}>
                  {[0, 1, 2].map(i => (
                    <View key={i} style={styles.dot} />
                  ))}
                </View>
              </View>
            </View>
          ) : null
        }
      />

      {/* Input */}
      <View style={styles.inputBar}>
        <TextInput
          style={styles.textInput}
          value={input}
          onChangeText={setInput}
          placeholder="Ask about cases, entities, or safety..."
          placeholderTextColor={colors.text.muted}
          editable={!loading}
          returnKeyType="send"
          onSubmitEditing={handleSend}
        />
        <TouchableOpacity
          style={[styles.sendBtn, (!input.trim() || loading) && styles.sendBtnDisabled]}
          onPress={handleSend}
          disabled={!input.trim() || loading}
        >
          <Ionicons name="send" size={18} color={colors.white} />
        </TouchableOpacity>
      </View>
      <Text style={styles.disclaimer}>AI Assistant can make mistakes. Verify critical intelligence.</Text>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface.base },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 56 : 40,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface.raised,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.lg,
    backgroundColor: 'rgba(6, 182, 212, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.text.primary },
  headerSubtitle: { fontSize: fontSize.sm, color: colors.text.secondary },
  messageList: { padding: spacing.lg, paddingBottom: spacing.xl },
  msgRow: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm, marginBottom: spacing.lg, maxWidth: '85%' },
  msgRowUser: { alignSelf: 'flex-end', flexDirection: 'row-reverse' },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarUser: { backgroundColor: colors.brand.blue },
  avatarBot: {
    backgroundColor: colors.surface.raised,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.3)',
  },
  bubble: {
    maxWidth: '80%',
    padding: spacing.md,
    borderRadius: borderRadius.xl,
  },
  bubbleUser: {
    backgroundColor: colors.brand.blue,
    borderBottomRightRadius: 4,
  },
  bubbleBot: {
    backgroundColor: colors.surface.elevated,
    borderWidth: 1,
    borderColor: colors.surface.raised,
    borderBottomLeftRadius: 4,
  },
  msgText: { fontSize: fontSize.base, color: colors.text.primary, lineHeight: 22 },
  msgTextUser: { color: colors.white },
  typingBubble: { paddingVertical: spacing.md },
  typingDots: { flexDirection: 'row', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.brand.cyan, opacity: 0.6 },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface.elevated,
    borderTopWidth: 1,
    borderTopColor: colors.surface.raised,
  },
  textInput: {
    flex: 1,
    height: 44,
    backgroundColor: colors.surface.base,
    borderWidth: 1,
    borderColor: colors.surface.raised,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    fontSize: fontSize.base,
    color: colors.text.primary,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    backgroundColor: colors.brand.blue,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: { opacity: 0.5 },
  disclaimer: {
    fontSize: fontSize.xs,
    color: colors.text.muted,
    textAlign: 'center',
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
    paddingTop: 4,
    backgroundColor: colors.surface.elevated,
  },
});
