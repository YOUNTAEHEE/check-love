import { Text, View } from "@/components/Themed";
import Colors from "@/constants/Colors";
import Config from "@/constants/Config";
import { FontAwesome } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
} from "react-native";

const { width } = Dimensions.get("window");

// 설문 질문 데이터
const QUESTIONS = [
  {
    id: 1,
    question: "결혼에 대해 어떻게 생각하시나요?",
    options: [
      "반드시 해야 한다고 생각한다",
      "하고 싶지만 필수는 아니다",
      "별로 관심이 없다",
      "결혼 제도에 반대한다",
    ],
  },
  {
    id: 2,
    question: "자녀 계획에 대해 어떻게 생각하시나요?",
    options: [
      "반드시 자녀를 갖고 싶다",
      "상황에 따라 생각해볼 수 있다",
      "자녀 계획은 없다",
      "아직 결정하지 못했다",
    ],
  },
  {
    id: 3,
    question: "일과 가정의 균형에 대해 어떻게 생각하시나요?",
    options: [
      "가정이 최우선이다",
      "일과 가정의 균형이 중요하다",
      "일이 더 중요하다",
      "상황에 따라 다르다",
    ],
  },
  {
    id: 4,
    question: "경제적 가치관에 대해 어떻게 생각하시나요?",
    options: [
      "저축과 안정성을 중요시한다",
      "적절한 소비와 투자의 균형을 추구한다",
      "현재의 만족과 경험을 중요시한다",
      "경제적 성공과 부를 중요시한다",
    ],
  },
  {
    id: 5,
    question: "종교나 신앙에 대해 어떻게 생각하시나요?",
    options: [
      "종교/신앙이 내 삶의 중심이다",
      "종교가 있지만 강하게 실천하지는 않는다",
      "무신론자/불가지론자이다",
      "영적이지만 특정 종교는 없다",
    ],
  },
];

export default function SurveyScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 페이지 로드 확인용 로그
  console.log("설문조사 페이지 로드됨");

  const handleAnswer = (questionId: number, answerIndex: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answerIndex,
    }));

    // 다음 질문으로 이동
    if (currentQuestion < QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handleComplete = async () => {
    setIsSubmitting(true);

    try {
      // 설문 응답 데이터 준비 (로그로 기록)
      const surveyData = {
        answers: Object.entries(answers).map(([questionId, answerIndex]) => ({
          questionId: parseInt(questionId),
          answerIndex: answerIndex,
        })),
      };

      console.log("설문 응답 데이터:", JSON.stringify(surveyData));

      // 개발 모드에서는 API 호출 없이 바로 탐색 페이지로 이동
      console.log("설문 완료: 탐색 페이지로 이동 시도");

      // 로그인 상태를 localStorage에 저장 (개발용)
      await AsyncStorage.setItem(
        Config.TOKEN_KEY,
        "dummy-token-for-development"
      );

      // 1초 후 탐색 페이지로 이동 (잠시 지연 추가)
      setTimeout(() => {
        setIsSubmitting(false);
        router.replace("/(tabs)/explore");
      }, 1000);

      // 원래 코드는 주석 처리
    } catch (error) {
      console.error("설문 제출 오류:", error);

      // 오류가 발생해도 탐색 페이지로 이동 (개발 모드)
      Alert.alert(
        "알림",
        "개발 모드: 설문이 제출되어 탐색 화면으로 이동합니다.",
        [
          {
            text: "확인",
            onPress: () => {
              setIsSubmitting(false);
              router.replace("/(tabs)/explore");
            },
          },
        ]
      );
    }
  };

  const isLastQuestion = currentQuestion === QUESTIONS.length - 1;
  const currentQuestionData = QUESTIONS[currentQuestion];
  const progress = ((currentQuestion + 1) / QUESTIONS.length) * 100;

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            if (currentQuestion > 0) {
              setCurrentQuestion(currentQuestion - 1);
            } else {
              router.back();
            }
          }}
        >
          <FontAwesome name="arrow-left" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>가치관 설문조사</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.progressContainer}>
        <View
          style={[
            styles.progressBar,
            { width: `${progress}%`, backgroundColor: colors.primary },
          ]}
        />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.questionNumber}>
          질문 {currentQuestion + 1}/{QUESTIONS.length}
        </Text>
        <Text style={styles.question}>{currentQuestionData.question}</Text>

        <View style={styles.optionsContainer}>
          {currentQuestionData.options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.optionButton,
                answers[currentQuestionData.id] === index && {
                  backgroundColor: colors.primary,
                },
              ]}
              onPress={() => handleAnswer(currentQuestionData.id, index)}
            >
              <Text
                style={[
                  styles.optionText,
                  answers[currentQuestionData.id] === index && {
                    color: "white",
                  },
                ]}
              >
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {isLastQuestion && Object.keys(answers).length === QUESTIONS.length && (
          <TouchableOpacity
            style={[styles.completeButton, { backgroundColor: colors.primary }]}
            onPress={handleComplete}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text style={styles.completeButtonText}>설문 완료</Text>
            )}
          </TouchableOpacity>
        )}
      </ScrollView>
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
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 50 : 20,
    paddingBottom: 10,
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
  progressContainer: {
    height: 6,
    backgroundColor: "#E0E0E0",
    width: "100%",
  },
  progressBar: {
    height: 6,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  questionNumber: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 8,
  },
  question: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 30,
  },
  optionsContainer: {
    marginTop: 10,
  },
  optionButton: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  optionText: {
    fontSize: 16,
  },
  completeButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 30,
  },
  completeButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
