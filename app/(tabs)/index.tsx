import { StyleSheet, Image, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Text, View } from "@/components/Themed";
import Colors from "@/constants/Colors";
import { useColorScheme } from "react-native";
import { FontAwesome } from "@expo/vector-icons";

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const colors = Colors[colorScheme ?? "light"];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>CheckLove</Text>
        <Text style={styles.subtitle}>진실된 만남을 위한 가치관 소개팅</Text>
      </View>

      <View style={styles.cardContainer}>
        <View
          style={[
            styles.card,
            { backgroundColor: colors.card, shadowColor: colors.cardShadow },
          ]}
        >
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1516195851954-27440a45944a?q=80&w=1000",
            }}
            style={styles.cardImage}
          />
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>진정한 나의 가치관</Text>
            <Text style={styles.cardDescription}>
              AI가 실제 당신의 가치관을 검증하여 더 의미있는 만남을 찾을 수
              있습니다.
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.featuresContainer}>
        <Text style={styles.sectionTitle}>CheckLove 특징</Text>

        <View style={styles.featureRow}>
          <View
            style={[styles.featureIcon, { backgroundColor: colors.primary }]}
          >
            <FontAwesome name="check-circle" size={24} color="white" />
          </View>
          <View style={styles.featureTextContainer}>
            <Text style={styles.featureTitle}>가치관 설문조사</Text>
            <Text style={styles.featureDescription}>
              당신의 가치관을 파악하는 다양한 질문
            </Text>
          </View>
        </View>

        <View style={styles.featureRow}>
          <View
            style={[styles.featureIcon, { backgroundColor: colors.accent }]}
          >
            <FontAwesome name="magic" size={24} color="white" />
          </View>
          <View style={styles.featureTextContainer}>
            <Text style={styles.featureTitle}>AI 재검증</Text>
            <Text style={styles.featureDescription}>
              인공지능이 실제 당신의 성향을 분석
            </Text>
          </View>
        </View>

        <View style={styles.featureRow}>
          <View
            style={[styles.featureIcon, { backgroundColor: colors.secondary }]}
          >
            <FontAwesome name="heart" size={24} color="white" />
          </View>
          <View style={styles.featureTextContainer}>
            <Text style={styles.featureTitle}>투명한 만남</Text>
            <Text style={styles.featureDescription}>
              선택한 가치관과 AI 분석 결과 모두 공개
            </Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.primary }]}
        onPress={() => router.push("/onboarding")}
      >
        <Text style={styles.buttonText}>시작하기</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  cardContainer: {
    marginBottom: 25,
  },
  card: {
    borderRadius: 16,
    overflow: "hidden",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  cardImage: {
    width: "100%",
    height: 180,
  },
  cardContent: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    opacity: 0.8,
    lineHeight: 20,
  },
  featuresContainer: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  featureIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    opacity: 0.7,
  },
  button: {
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: "center",
    marginHorizontal: 25,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
