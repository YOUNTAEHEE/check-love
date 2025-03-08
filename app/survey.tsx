import React, { useState } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { Text, View } from "@/components/Themed";
import Colors from "@/constants/Colors";
import { useColorScheme } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";

// 가치관 설문 질문 데이터
const QUESTIONS = [
  {
    id: 1,
    question: "가족에 대해 어떻게 생각하시나요?",
    options: [
      {
        id: "a",
        text: "가족이 가장 중요하다",
        description: "가족 중심적인 가치관",
      },
      {
        id: "b",
        text: "개인의 삶과 균형이 필요하다",
        description: "개인 생활과 가족의 균형",
      },
      {
        id: "c",
        text: "개인의 성장이 우선이다",
        description: "개인주의적 가치관",
      },
    ],
    image:
      "https://images.unsplash.com/photo-1607962837359-5e7e89f86776?q=80&w=1000",
  },
  {
    id: 2,
    question: "여행 스타일은 어떤가요?",
    options: [
      { id: "a", text: "꼼꼼하게 계획을 세운다", description: "계획적인 성향" },
      {
        id: "b",
        text: "대략적인 계획만 세우고 현지에서 결정한다",
        description: "유연한 계획성",
      },
      {
        id: "c",
        text: "계획 없이 즉흥적으로 여행한다",
        description: "즉흥적인 성향",
      },
    ],
    image:
      "https://images.unsplash.com/photo-1504195342853-e41bf3e3fac5?q=80&w=1000",
  },
  {
    id: 3,
    question: "업무와 일상 생활의 균형에 대해 어떻게 생각하시나요?",
    options: [
      {
        id: "a",
        text: "경력 발전을 최우선시한다",
        description: "일 중심적 성향",
      },
      {
        id: "b",
        text: "일과 삶의 균형이 중요하다",
        description: "워라밸 중시",
      },
      {
        id: "c",
        text: "삶의 즐거움이 더 중요하다",
        description: "삶 중심적 성향",
      },
    ],
    image:
      "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?q=80&w=1000",
  },
  {
    id: 4,
    question: "미래에 대한 계획은 어떻게 세우시나요?",
    options: [
      { id: "a", text: "안정적인 삶을 추구한다", description: "안정 추구" },
      {
        id: "b",
        text: "도전적인 목표를 세우고 추진한다",
        description: "도전 추구",
      },
      { id: "c", text: "꿈을 따라 자유롭게 살고 싶다", description: "꿈 추구" },
    ],
    image:
      "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=1000",
  },
  {
    id: 5,
    question: "상대방과 대화할 때 어떤 스타일을 선호하시나요?",
    options: [
      { id: "a", text: "직설적이고 솔직하게 소통한다", description: "솔직함" },
      { id: "b", text: "상대방의 감정을 고려해 말한다", description: "공감적" },
      {
        id: "c",
        text: "대화보다는 행동으로 보여준다",
        description: "행동 중심적",
      },
    ],
    image:
      "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=1000",
  },
];

// 옵션 컴포넌트
function OptionCard({ option, selected, onSelect }) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  return (
    <TouchableOpacity
      style={[
        styles.optionCard,
        {
          backgroundColor: selected ? colors.primary : colors.card,
          borderColor: selected ? colors.primary : colors.border,
        },
      ]}
      onPress={() => onSelect(option.id)}
    >
      <Text
        style={[styles.optionText, { color: selected ? "white" : undefined }]}
      >
        {option.text}
      </Text>
      <Text
        style={[
          styles.optionDescription,
          { color: selected ? "rgba(255,255,255,0.8)" : undefined },
        ]}
      >
        {option.description}
      </Text>

      {selected && (
        <View style={styles.checkIcon}>
          <FontAwesome name="check" size={16} color="white" />
        </View>
      )}
    </TouchableOpacity>
  );
}

// 진행 상태 표시 컴포넌트
function ProgressBar({ current, total }) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  return (
    <View style={styles.progressContainer}>
      <View style={[styles.progressBar, { backgroundColor: colors.subtle }]}>
        <View
          style={[
            styles.progressFill,
            {
              backgroundColor: colors.primary,
              width: `${(current / total) * 100}%`,
            },
          ]}
        />
      </View>
      <Text style={styles.progressText}>
        {current}/{total}
      </Text>
    </View>
  );
}

export default function SurveyScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentQuestion = QUESTIONS[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === QUESTIONS.length - 1;

  const handleSelectOption = (optionId) => {
    setAnswers({
      ...answers,
      [currentQuestion.id]: optionId,
    });
  };

  const handleNext = () => {
    if (isLastQuestion) {
      handleSubmit();
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    } else {
      router.back();
    }
  };

  const handleSubmit = () => {
    setIsSubmitting(true);

    // 실제 앱에서는 여기서 서버에 데이터를 보내거나 상태 관리를 통해 처리합니다.
    // 여기서는 시뮬레이션을 위해 setTimeout을 사용합니다.
    setTimeout(() => {
      setIsSubmitting(false);
      // AI 검증 페이지로 이동
      router.push("/ai-verify");
    }, 2000);
  };

  const isAnswered = !!answers[currentQuestion.id];

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <FontAwesome name="arrow-left" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>가치관 설문</Text>
        <View style={styles.placeholder} />
      </View>

      <ProgressBar
        current={currentQuestionIndex + 1}
        total={QUESTIONS.length}
      />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Image
          source={{ uri: currentQuestion.image }}
          style={styles.questionImage}
        />

        <Text style={styles.questionText}>{currentQuestion.question}</Text>

        <View style={styles.optionsContainer}>
          {currentQuestion.options.map((option) => (
            <OptionCard
              key={option.id}
              option={option}
              selected={answers[currentQuestion.id] === option.id}
              onSelect={handleSelectOption}
            />
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.nextButton,
            {
              backgroundColor: isAnswered ? colors.primary : colors.subtle,
              opacity: isAnswered ? 1 : 0.7,
            },
          ]}
          onPress={handleNext}
          disabled={!isAnswered || isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <>
              <Text style={styles.nextButtonText}>
                {isLastQuestion ? "완료" : "다음"}
              </Text>
              {!isLastQuestion && (
                <FontAwesome
                  name="arrow-right"
                  size={16}
                  color="white"
                  style={styles.nextIcon}
                />
              )}
            </>
          )}
        </TouchableOpacity>
      </View>
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
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  progressBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  questionImage: {
    width: "100%",
    height: 200,
    borderRadius: 16,
    marginBottom: 24,
  },
  questionText: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 24,
    lineHeight: 30,
  },
  optionsContainer: {
    gap: 16,
  },
  optionCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    position: "relative",
  },
  optionText: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  optionDescription: {
    fontSize: 14,
    opacity: 0.7,
  },
  checkIcon: {
    position: "absolute",
    top: 16,
    right: 16,
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  nextButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 30,
  },
  nextButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  nextIcon: {
    marginLeft: 8,
  },
});
