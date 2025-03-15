import { Text, View } from "@/components/Themed";
import Colors from "@/constants/Colors";
import { FontAwesome } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  View as RNView,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
} from "react-native";

const { width } = Dimensions.get("window");

// 온보딩 페이지 데이터
const PAGES = [
  {
    icon: "heart",
    title: "참된 만남을 찾으세요",
    description: "CheckLove에서는 진정한 가치관 기반의 소개팅을 제공합니다.",
    color: "#FF4B6E",
  },
  {
    icon: "check-circle",
    title: "당신의 가치관을 공유하세요",
    description:
      "당신의 가치관에 대한 질문에 답하고 이를 프로필에 공유해보세요.",
    color: "#FF8FA0",
  },
  {
    icon: "magic",
    title: "AI가 진정한 당신을 분석합니다",
    description:
      "인공지능이 당신이 생각하는 가치관과 실제 가치관 사이의 일치도를 파악합니다.",
    color: "#6F5CE5",
  },
  {
    icon: "comments",
    title: "투명한 관계를 시작하세요",
    description: "가치관이 일치하는 상대와 더 깊고 의미있는 대화를 나눠보세요.",
    color: "#54C8FF",
  },
];

// 온보딩 페이지 컴포넌트
function OnboardingPage({ data, index, scrollX }) {
  const inputRange = [(index - 1) * width, index * width, (index + 1) * width];

  const opacity = scrollX.interpolate({
    inputRange,
    outputRange: [0, 1, 0],
  });

  const translateY = scrollX.interpolate({
    inputRange,
    outputRange: [50, 0, 50],
  });

  return (
    <View style={styles.pageContainer}>
      <Animated.View
        style={[
          styles.iconContainer,
          {
            backgroundColor: data.color,
            opacity,
            transform: [{ translateY }],
          },
        ]}
      >
        <FontAwesome name={data.icon} size={70} color="white" />
      </Animated.View>

      <Animated.View style={{ opacity, transform: [{ translateY }] }}>
        <Text style={styles.title}>{data.title}</Text>
        <Text style={styles.description}>{data.description}</Text>
      </Animated.View>
    </View>
  );
}

// 페이지 인디케이터 컴포넌트
function Indicator({ scrollX }) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  return (
    <RNView style={styles.indicatorContainer}>
      {PAGES.map((_, i) => {
        const inputRange = [(i - 1) * width, i * width, (i + 1) * width];

        const scale = scrollX.interpolate({
          inputRange,
          outputRange: [0.8, 1.2, 0.8],
          extrapolate: "clamp",
        });

        const opacity = scrollX.interpolate({
          inputRange,
          outputRange: [0.4, 1, 0.4],
          extrapolate: "clamp",
        });

        return (
          <Animated.View
            key={`indicator-${i}`}
            style={[
              styles.indicator,
              {
                backgroundColor: colors.primary,
                opacity,
                transform: [{ scale }],
              },
            ]}
          />
        );
      })}
    </RNView>
  );
}

export default function OnboardingScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const scrollX = useRef(new Animated.Value(0)).current;
  const [currentPage, setCurrentPage] = useState(0);
  const flatListRef = useRef(null);

  const isLastPage = currentPage === PAGES.length - 1;

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    {
      useNativeDriver: true,
      listener: (event) => {
        const offsetX = event.nativeEvent.contentOffset.x;
        const page = Math.round(offsetX / width);
        setCurrentPage(page);
      },
    }
  );

  const handleNext = () => {
    if (isLastPage) {
      router.push("/auth/signup");
    } else {
      const nextPage = currentPage + 1;
      if (flatListRef.current) {
        flatListRef.current.scrollToOffset({
          offset: nextPage * width,
          animated: true,
        });
        setCurrentPage(nextPage);
      }
    }
  };

  const handleSkip = () => {
    router.replace("/(tabs)");
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <Animated.FlatList
        ref={flatListRef}
        data={PAGES}
        keyExtractor={(_, index) => index.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        renderItem={({ item, index }) => (
          <OnboardingPage data={item} index={index} scrollX={scrollX} />
        )}
      />

      <RNView style={styles.bottomContainer}>
        <Indicator scrollX={scrollX} />

        <RNView style={styles.buttonContainer}>
          {!isLastPage && (
            <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
              <Text style={styles.skipText}>건너뛰기</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.nextButton, { backgroundColor: colors.primary }]}
            onPress={handleNext}
          >
            <Text style={styles.nextText}>
              {isLastPage ? "시작하기" : "다음"}
            </Text>
            <FontAwesome
              name={isLastPage ? "check" : "arrow-right"}
              size={16}
              color="white"
              style={styles.nextIcon}
            />
          </TouchableOpacity>
        </RNView>
      </RNView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  pageContainer: {
    width,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    paddingTop: 80,
  },
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    opacity: 0.7,
    lineHeight: 24,
  },
  bottomContainer: {
    position: "absolute",
    bottom: 50,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
  },
  indicatorContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 40,
  },
  indicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  skipButton: {
    padding: 12,
  },
  skipText: {
    fontSize: 16,
    opacity: 0.7,
  },
  nextButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 30,
  },
  nextText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  nextIcon: {
    marginLeft: 8,
  },
});
