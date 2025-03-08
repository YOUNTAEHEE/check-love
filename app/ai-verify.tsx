import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { Text, View } from "@/components/Themed";
import Colors from "@/constants/Colors";
import { useColorScheme } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";

// 더미 질문 데이터
const QUESTIONS = [
  {
    id: 1,
    question: "가족 모임보다 친구와의 약속이 더 중요할 때가 있나요?",
    type: "가족관",
  },
  {
    id: 2,
    question: "계획한 일정이 갑자기 바뀌면 스트레스를 받나요?",
    type: "여행 스타일",
  },
  {
    id: 3,
    question: "퇴근 후 업무 연락을 받으면 어떤 기분이 드나요?",
    type: "일과 삶",
  },
  {
    id: 4,
    question: "5년 후 자신의 모습을 구체적으로 그려본 적이 있나요?",
    type: "미래 계획",
  },
  {
    id: 5,
    question:
      "다른 사람의 감정을 상하게 할까봐 의견을 말하지 못한 적이 있나요?",
    type: "소통 방식",
  },
  {
    id: 6,
    question: "가족을 위해 자신의 꿈을 포기할 수 있나요?",
    type: "가족관",
  },
  {
    id: 7,
    question: "갑작스러운 여행 제안을 받으면 기분이 어떤가요?",
    type: "여행 스타일",
  },
  {
    id: 8,
    question: "일에 몰입하면 시간 가는 줄 모를 때가 있나요?",
    type: "일과 삶",
  },
];

// 더미 결과 데이터
const RESULTS = [
  {
    type: "가족관",
    userChoice: "가족 중심적",
    aiVerified: "개인주의적",
    explanation:
      "응답 패턴을 분석한 결과, 실제로는 개인의 독립성과 자유를 중시하는 성향이 강합니다.",
  },
  {
    type: "여행 스타일",
    userChoice: "계획적",
    aiVerified: "유연한 계획성",
    explanation:
      "완전히 계획적이기보다는 기본 계획을 세우고 상황에 따라 유연하게 조정하는 스타일입니다.",
  },
  {
    type: "일과 삶",
    userChoice: "워라밸 중시",
    aiVerified: "워라밸 중시",
    explanation: "일과 삶의 균형을 중요하게 생각하는 것으로 확인됩니다.",
  },
  {
    type: "미래 계획",
    userChoice: "꿈 추구",
    aiVerified: "안정 추구",
    explanation:
      "이상적으로는 꿈을 추구하고 싶지만, 실제로는 안정적인 선택을 선호하는 경향이 있습니다.",
  },
  {
    type: "소통 방식",
    userChoice: "솔직함",
    aiVerified: "솔직함",
    explanation: "솔직하고 직설적인 소통 방식을 사용하는 것으로 확인됩니다.",
  },
];

// ChatBubble 컴포넌트
function ChatBubble({ text, isUser, delay = 0 }) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const [visible, setVisible] = useState(delay === 0);

  useEffect(() => {
    if (delay > 0) {
      const timer = setTimeout(() => {
        setVisible(true);
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [delay]);

  if (!visible) return null;

  return (
    <View
      style={[
        styles.bubble,
        isUser ? styles.userBubble : styles.aiBubble,
        {
          backgroundColor: isUser ? colors.primary : colors.card,
          borderColor: isUser ? colors.primary : colors.border,
        },
      ]}
    >
      <Text
        style={[styles.bubbleText, { color: isUser ? "white" : colors.text }]}
      >
        {text}
      </Text>
    </View>
  );
}

// 결과 카드 컴포넌트
function ResultCard({ result }) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const isMatch = result.userChoice === result.aiVerified;

  return (
    <View
      style={[
        styles.resultCard,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <View style={styles.resultHeader}>
        <Text style={styles.resultType}>{result.type}</Text>
        {isMatch ? (
          <View
            style={[styles.matchBadge, { backgroundColor: colors.success }]}
          >
            <Text style={styles.matchText}>일치</Text>
          </View>
        ) : (
          <View
            style={[styles.matchBadge, { backgroundColor: colors.warning }]}
          >
            <Text style={styles.matchText}>불일치</Text>
          </View>
        )}
      </View>

      <View style={styles.resultCompare}>
        <View style={styles.resultItem}>
          <Text style={styles.resultLabel}>내 선택</Text>
          <Text style={styles.resultValue}>{result.userChoice}</Text>
        </View>

        <View
          style={[styles.resultDivider, { backgroundColor: colors.border }]}
        />

        <View style={styles.resultItem}>
          <Text style={styles.resultLabel}>AI 분석</Text>
          <Text
            style={[
              styles.resultValue,
              { color: isMatch ? colors.success : colors.warning },
            ]}
          >
            {result.aiVerified}
          </Text>
        </View>
      </View>

      <Text style={styles.explanation}>{result.explanation}</Text>
    </View>
  );
}

export default function AIVerifyScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const [step, setStep] = useState("chat"); // 'chat', 'analyzing', 'results'
  const [chatStep, setChatStep] = useState(0);
  const [analyzingProgress, setAnalyzingProgress] = useState(0);

  useEffect(() => {
    if (step === "chat") {
      const timer = setTimeout(() => {
        if (chatStep < QUESTIONS.length - 1) {
          setChatStep(chatStep + 1);
        } else {
          setStep("analyzing");
          startAnalyzing();
        }
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [chatStep, step]);

  const startAnalyzing = () => {
    const interval = setInterval(() => {
      setAnalyzingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setStep("results");
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  const renderChat = () => {
    return (
      <ScrollView
        style={styles.chatContainer}
        contentContainerStyle={styles.chatContent}
        showsVerticalScrollIndicator={false}
      >
        <ChatBubble
          text="안녕하세요! AI 심리 분석사입니다. 가치관을 더 정확하게 분석하기 위해 몇 가지 추가 질문을 드리겠습니다."
          isUser={false}
          delay={300}
        />

        {QUESTIONS.slice(0, chatStep + 1).map((question, index) => (
          <React.Fragment key={question.id}>
            <ChatBubble
              text={`${question.question} (${question.type})`}
              isUser={false}
              delay={(index + 1) * 800}
            />
            <ChatBubble
              text="네, 그렇습니다."
              isUser={true}
              delay={(index + 1) * 800 + 500}
            />
          </React.Fragment>
        ))}
      </ScrollView>
    );
  };

  const renderAnalyzing = () => {
    return (
      <View style={styles.analyzingContainer}>
        <View style={[styles.progressCircle, { borderColor: colors.border }]}>
          <Text style={styles.progressText}>{analyzingProgress}%</Text>
        </View>

        <Text style={styles.analyzingTitle}>분석 중...</Text>
        <Text style={styles.analyzingDescription}>
          AI가 당신의 응답을 바탕으로 진정한 가치관을 분석하고 있습니다.
        </Text>

        <View style={[styles.progressBar, { backgroundColor: colors.subtle }]}>
          <View
            style={[
              styles.progressFill,
              {
                backgroundColor: colors.primary,
                width: `${analyzingProgress}%`,
              },
            ]}
          />
        </View>
      </View>
    );
  };

  const renderResults = () => {
    return (
      <ScrollView
        style={styles.resultsContainer}
        contentContainerStyle={styles.resultsContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.resultsTitle}>분석 결과</Text>
        <Text style={styles.resultsDescription}>
          AI가 당신의 응답 패턴과 심리 상태를 분석한 결과입니다. 아래 결과는
          당신이 선택한 가치관과 AI가 판단한 실제 가치관을 비교해 보여줍니다.
        </Text>

        {RESULTS.map((result, index) => (
          <ResultCard key={index} result={result} />
        ))}

        <TouchableOpacity
          style={[styles.completeButton, { backgroundColor: colors.accent }]}
          onPress={() => router.replace("/(tabs)/profile")}
        >
          <Text style={styles.completeButtonText}>프로필에 적용하기</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <FontAwesome name="arrow-left" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI 가치관 검증</Text>
        <View style={styles.placeholder} />
      </View>

      {step === "chat" && renderChat()}
      {step === "analyzing" && renderAnalyzing()}
      {step === "results" && renderResults()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
  },
  backButton: {
    padding: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  placeholder: {
    width: 40,
  },
  // Chat styles
  chatContainer: {
    flex: 1,
  },
  chatContent: {
    padding: 16,
    paddingBottom: 40,
  },
  bubble: {
    maxWidth: "85%",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
    marginBottom: 12,
    borderWidth: 1,
  },
  userBubble: {
    alignSelf: "flex-end",
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    alignSelf: "flex-start",
    borderBottomLeftRadius: 4,
  },
  bubbleText: {
    fontSize: 15,
    lineHeight: 22,
  },
  // Analyzing styles
  analyzingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  progressCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 5,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
  },
  progressText: {
    fontSize: 24,
    fontWeight: "bold",
  },
  analyzingTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  analyzingDescription: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 32,
    opacity: 0.7,
    lineHeight: 24,
  },
  progressBar: {
    width: "100%",
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
  },
  // Results styles
  resultsContainer: {
    flex: 1,
  },
  resultsContent: {
    padding: 16,
    paddingBottom: 40,
  },
  resultsTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  resultsDescription: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 24,
    opacity: 0.7,
  },
  resultCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  resultHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  resultType: {
    fontSize: 18,
    fontWeight: "bold",
  },
  matchBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  matchText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  resultCompare: {
    flexDirection: "row",
    marginBottom: 12,
  },
  resultItem: {
    flex: 1,
    padding: 8,
  },
  resultDivider: {
    width: 1,
    marginVertical: 4,
  },
  resultLabel: {
    fontSize: 13,
    opacity: 0.6,
    marginBottom: 6,
  },
  resultValue: {
    fontSize: 16,
    fontWeight: "bold",
  },
  explanation: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
    opacity: 0.8,
  },
  completeButton: {
    marginTop: 20,
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: "center",
    marginBottom: 40,
  },
  completeButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
