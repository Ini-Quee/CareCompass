import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { api } from '../../services/api';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function AIAssistantScreen({ navigation }: any) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi! I'm your health assistant. I can help you:\n\n• Summarize your symptoms\n• Generate questions for your doctor\n• Explain your lab results\n• Track medication patterns\n\n⚠️ I can organize your data, but I cannot diagnose. Always consult your provider.\n\nHow can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const quickPrompts = [
    { icon: '📊', label: 'Summarize my symptoms this week' },
    { icon: '💊', label: 'How is my medication adherence?' },
    { icon: '📋', label: 'Generate questions for my doctor' },
    { icon: '💉', label: 'Explain my BP trend' },
  ];

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const pregnancyRes = await api.getCurrentPregnancy();
      const pregnancyId = pregnancyRes.data.id;

      // Simulate AI response based on the question
      const response = await generateAIResponse(input.trim(), pregnancyId);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm sorry, I couldn't process that request. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const generateAIResponse = async (question: string, pregnancyId: string): Promise<string> => {
    const lowerQuestion = question.toLowerCase();

    if (lowerQuestion.includes('symptom') || lowerQuestion.includes('how am i')) {
      try {
        const trends = await api.getSymptomTrends(pregnancyId, 7);
        const trendData = trends.data;

        if (!trendData || !trendData.trends) {
          return "I don't have enough symptom data yet. Start logging your symptoms daily, and I'll be able to provide insights.";
        }

        const symptoms = Object.entries(trendData.trends)
          .map(([name, data]: [string, any]) => {
            const trend = data.trendDirection === 'increasing' ? '↑ increasing' : 
                         data.trendDirection === 'decreasing' ? '↓ decreasing' : '→ stable';
            return `• ${name}: avg ${data.average}/10, ${trend}`;
          })
          .join('\n');

        return `Here's your symptom summary for the past 7 days:\n\n${symptoms}\n\n${trendData.totalEntries} total entries recorded.`;
      } catch (error) {
        return "I couldn't retrieve your symptom data. Please try again.";
      }
    }

    if (lowerQuestion.includes('medication') || lowerQuestion.includes('adherence')) {
      try {
        const adherence = await api.getMedicationAdherence(pregnancyId);
        const meds = adherence.data;

        if (!meds || meds.length === 0) {
          return "No active medications found. Add your medications in the Medications tab.";
        }

        const medList = meds
          .map((m: any) => `• ${m.medication}: ${m.adherencePercent}% (${m.taken}/${m.total} doses)`)
          .join('\n');

        return `Here's your medication adherence this week:\n\n${medList}\n\nKeep up the good work! Consistency is important for you and your baby.`;
      } catch (error) {
        return "I couldn't retrieve your medication data. Please try again.";
      }
    }

    if (lowerQuestion.includes('question') || lowerQuestion.includes('doctor') || lowerQuestion.includes('ask')) {
      try {
        const concerns = await api.getConcerns(pregnancyId);
        const symptoms = await api.getSymptomTrends(pregnancyId, 14);

        const questions: string[] = [];

        if (concerns.data && concerns.data.length > 0) {
          concerns.data.forEach((c: any) => {
            questions.push(c.concernText);
          });
        }

        if (symptoms.data?.trends) {
          const increasing = Object.entries(symptoms.data.trends)
            .filter(([_, data]: [string, any]) => data.trendDirection === 'increasing');

          increasing.forEach(([name, _]: [string, any]) => {
            questions.push(`My ${name.toLowerCase()} has been increasing. Should we be concerned?`);
          });
        }

        if (questions.length === 0) {
          return "Based on your recent data, I don't see any specific concerns to raise. Keep logging, and I'll flag patterns as they emerge.";
        }

        const questionList = questions.slice(0, 5).map((q, i) => `${i + 1}. ${q}`).join('\n');
        return `Here are suggested questions for your next appointment:\n\n${questionList}\n\nWould you like me to add these to your provider report?`;
      } catch (error) {
        return "I couldn't generate questions. Please try again.";
      }
    }

    if (lowerQuestion.includes('bp') || lowerQuestion.includes('blood pressure')) {
      try {
        const bpTrends = await api.getBPTrends(pregnancyId);
        const data = bpTrends.data;

        if (!data || !data.averages) {
          return "No blood pressure readings found. Start logging your BP in the Vitals tab.";
        }

        return `Here's your blood pressure summary:\n\n• Average: ${data.averages.systolic}/${data.averages.diastolic} mmHg\n• Highest: ${data.maximums.systolic}/${data.maximums.diastolic} mmHg\n• Trend: ${data.trendDirection}\n• Flagged readings: ${data.flaggedReadings}\n\n${data.trendDirection === 'rising' ? '⚠️ Your BP has been rising. Consider resting and discussing with your provider.' : 'Your BP looks stable. Keep monitoring.'}`;
      } catch (error) {
        return "I couldn't retrieve your BP data. Please try again.";
      }
    }

    return "I can help you with:\n\n• Symptom summaries\n• Medication adherence\n• Doctor questions\n• BP/blood sugar trends\n\nTry asking about one of these topics!";
  };

  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      {/* Disclaimer */}
      <View style={styles.disclaimer}>
        <Text style={styles.disclaimerText}>
          ⚠️ I can organize your data, but I cannot diagnose. Always consult your provider.
        </Text>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map((message) => (
          <View
            key={message.id}
            style={[
              styles.messageBubble,
              message.role === 'user' ? styles.userBubble : styles.assistantBubble,
            ]}
          >
            <Text style={[
              styles.messageText,
              message.role === 'user' && styles.userMessageText,
            ]}>
              {message.content}
            </Text>
          </View>
        ))}
        {loading && (
          <View style={[styles.messageBubble, styles.assistantBubble]}>
            <ActivityIndicator size="small" color="#DB2777" />
          </View>
        )}
      </ScrollView>

      {/* Quick Prompts */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.quickPromptsContainer}
      >
        {quickPrompts.map((prompt, index) => (
          <TouchableOpacity
            key={index}
            style={styles.quickPrompt}
            onPress={() => handleQuickPrompt(prompt.label)}
          >
            <Text style={styles.quickPromptIcon}>{prompt.icon}</Text>
            <Text style={styles.quickPromptText}>{prompt.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Ask about your health data..."
          placeholderTextColor="#A8A29E"
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.sendButton, !input.trim() && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!input.trim() || loading}
        >
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDF2F8',
  },
  disclaimer: {
    backgroundColor: '#FFFBEB',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#FDE68A',
  },
  disclaimerText: {
    fontSize: 12,
    color: '#92400E',
    textAlign: 'center',
    lineHeight: 18,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
  },
  messageBubble: {
    maxWidth: '85%',
    padding: 14,
    borderRadius: 18,
    marginBottom: 12,
  },
  userBubble: {
    backgroundColor: '#DB2777',
    borderBottomRightRadius: 4,
    alignSelf: 'flex-end',
  },
  assistantBubble: {
    backgroundColor: '#FCE7F3',
    borderBottomLeftRadius: 4,
    alignSelf: 'flex-start',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#1C1917',
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  quickPromptsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  quickPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F5E6D3',
    marginRight: 8,
  },
  quickPromptIcon: {
    fontSize: 16,
  },
  quickPromptText: {
    fontSize: 13,
    color: '#1C1917',
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#F5E6D3',
    backgroundColor: '#FFFFFF',
  },
  input: {
    flex: 1,
    backgroundColor: '#FDF2F8',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1C1917',
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#DB2777',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 15,
  },
});
