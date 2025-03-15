import { Text, View } from "@/components/Themed";
import Colors from "@/constants/Colors";
import ApiService from "@/services/ApiService";
import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
} from "react-native";

// 임시 사용자 정보
const USER = {
  id: 1,
  name: "김동현",
  age: 28,
  location: "서울시 강남구",
  introduction:
    "안녕하세요! 여행과 맛집 탐방을 좋아하는 개발자입니다. 주말에는 주로 산책이나 전시회 관람을 즐겨요. 편안한 대화 나눌 수 있는 친구 찾고 있어요 :)",
  job: "소프트웨어 개발자",
  education: "서울대학교",
  interests: ["여행", "음악", "영화", "독서", "요리"],
  photos: [
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1000",
    "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?q=80&w=1000",
    "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=1000",
  ],
  profileImage:
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1000",
  aiVerification: {
    score: 98,
    status: "인증됨",
    lastVerified: "2023.10.15",
  },
  surveyResults: {
    personality: ["친절함", "성실함", "창의적"],
    communicationStyle: "적극적",
    datePreference: ["카페", "영화관", "전시회"],
  },
};

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const router = useRouter();

  // 로그아웃 처리
  const handleLogout = () => {
    Alert.alert("로그아웃", "정말 로그아웃 하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "로그아웃",
        style: "destructive",
        onPress: async () => {
          try {
            // ApiService를 사용하여 로그아웃 처리
            const response = await ApiService.logout();

            if (response.success) {
              // 로그인 화면으로 이동
              router.replace("/auth/login");
            } else {
              Alert.alert(
                "오류",
                response.error || "로그아웃 중 문제가 발생했습니다."
              );
            }
          } catch (error) {
            console.error("로그아웃 오류:", error);
            Alert.alert("오류", "로그아웃 중 문제가 발생했습니다.");
          }
        },
      },
    ]);
  };

  // 설정 페이지로 이동
  const goToSettings = () => {
    router.push("/settings");
  };

  return (
    <View style={styles.container}>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />

      {/* 상단 헤더 (설정 버튼 포함) */}
      <View style={styles.header}>
        <View style={{ flex: 1 }} />
        <TouchableOpacity onPress={goToSettings} style={styles.settingsButton}>
          <FontAwesome name="cog" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* 상단 프로필 헤더 */}
        <View style={styles.profileHeader}>
          <Image
            source={{ uri: USER.profileImage }}
            style={styles.profileImage}
          />

          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>
              {USER.name}, {USER.age}
            </Text>
            <Text style={styles.profileLocation}>{USER.location}</Text>

            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>23</Text>
                <Text style={styles.statLabel}>매치</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>156</Text>
                <Text style={styles.statLabel}>받은 좋아요</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>89%</Text>
                <Text style={styles.statLabel}>응답률</Text>
              </View>
            </View>
          </View>
        </View>

        {/* AI 인증 결과 */}
        <View
          style={[styles.sectionContainer, { backgroundColor: colors.card }]}
        >
          <Text style={styles.sectionTitle}>AI 신원 검증</Text>

          <View style={styles.verificationContainer}>
            <View style={styles.verificationItem}>
              <FontAwesome
                name="check-circle"
                size={20}
                color={colors.primary}
              />
              <Text
                style={[styles.verificationText, { color: colors.primary }]}
              >
                신뢰도 점수: {USER.aiVerification.score}%
              </Text>
            </View>

            <View style={styles.verificationItem}>
              <FontAwesome name="shield" size={20} color={colors.primary} />
              <Text
                style={[styles.verificationText, { color: colors.primary }]}
              >
                상태: {USER.aiVerification.status}
              </Text>
            </View>

            <View style={styles.verificationItem}>
              <FontAwesome name="calendar" size={20} color={colors.primary} />
              <Text style={styles.verificationText}>
                검증일: {USER.aiVerification.lastVerified}
              </Text>
            </View>
          </View>
        </View>

        {/* 자기소개 */}
        <View
          style={[styles.sectionContainer, { backgroundColor: colors.card }]}
        >
          <Text style={styles.sectionTitle}>자기소개</Text>
          <Text style={styles.introductionText}>{USER.introduction}</Text>
        </View>

        {/* 설문조사 결과 */}
        <View
          style={[styles.sectionContainer, { backgroundColor: colors.card }]}
        >
          <Text style={styles.sectionTitle}>설문조사 결과</Text>

          <View style={styles.surveyItem}>
            <Text style={styles.surveyLabel}>성격</Text>
            <View style={styles.tagsContainer}>
              {USER.surveyResults.personality.map((trait, index) => (
                <View
                  key={index}
                  style={[
                    styles.interestTag,
                    { backgroundColor: colors.primary + "20" },
                  ]}
                >
                  <Text
                    style={[styles.interestText, { color: colors.primary }]}
                  >
                    {trait}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.surveyItem}>
            <Text style={styles.surveyLabel}>의사소통 스타일</Text>
            <Text style={styles.surveyValue}>
              {USER.surveyResults.communicationStyle}
            </Text>
          </View>

          <View style={styles.surveyItem}>
            <Text style={styles.surveyLabel}>선호하는 데이트</Text>
            <View style={styles.tagsContainer}>
              {USER.surveyResults.datePreference.map((pref, index) => (
                <View
                  key={index}
                  style={[
                    styles.interestTag,
                    { backgroundColor: colors.primary + "20" },
                  ]}
                >
                  <Text
                    style={[styles.interestText, { color: colors.primary }]}
                  >
                    {pref}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* 기본 정보 */}
        <View
          style={[styles.sectionContainer, { backgroundColor: colors.card }]}
        >
          <Text style={styles.sectionTitle}>기본 정보</Text>

          <View style={styles.infoItem}>
            <FontAwesome
              name="briefcase"
              size={18}
              color={colors.primary}
              style={styles.infoIcon}
            />
            <Text style={styles.infoText}>직업: {USER.job}</Text>
          </View>

          <View style={styles.infoItem}>
            <FontAwesome
              name="graduation-cap"
              size={18}
              color={colors.primary}
              style={styles.infoIcon}
            />
            <Text style={styles.infoText}>학력: {USER.education}</Text>
          </View>
        </View>

        {/* 관심사 */}
        <View
          style={[styles.sectionContainer, { backgroundColor: colors.card }]}
        >
          <Text style={styles.sectionTitle}>관심사</Text>

          <View style={styles.interestsContainer}>
            {USER.interests.map((interest, index) => (
              <View
                key={index}
                style={[
                  styles.interestTag,
                  { backgroundColor: colors.primary + "20" },
                ]}
              >
                <Text style={[styles.interestText, { color: colors.primary }]}>
                  {interest}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* 갤러리 */}
        <View
          style={[styles.sectionContainer, { backgroundColor: colors.card }]}
        >
          <Text style={styles.sectionTitle}>갤러리</Text>

          <View style={styles.galleryContainer}>
            {USER.photos.map((photo, index) => (
              <Image
                key={index}
                source={{ uri: photo }}
                style={styles.galleryImage}
              />
            ))}
          </View>
        </View>

        <View style={styles.footer} />
      </ScrollView>

      {/* 하단 탭 네비게이션 */}
      <View
        style={[
          styles.tabBar,
          { backgroundColor: colors.card, borderTopColor: colors.border },
        ]}
      >
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => router.push("/home")}
        >
          <FontAwesome name="home" size={24} color={colors.subtle} />
          <Text style={[styles.tabLabel, { color: colors.subtle }]}>홈</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => router.push("/discover")}
        >
          <FontAwesome name="search" size={24} color={colors.subtle} />
          <Text style={[styles.tabLabel, { color: colors.subtle }]}>탐색</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => router.push("/chat")}
        >
          <FontAwesome name="comment" size={24} color={colors.subtle} />
          <Text style={[styles.tabLabel, { color: colors.subtle }]}>채팅</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem}>
          <FontAwesome name="user" size={24} color={colors.primary} />
          <Text style={[styles.tabLabel, { color: colors.primary }]}>
            프로필
          </Text>
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
    justifyContent: "flex-end",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  settingsButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
    marginBottom: 60, // 탭바 높이만큼 마진 추가
  },
  profileHeader: {
    flexDirection: "row",
    padding: 20,
    alignItems: "center",
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profileInfo: {
    flex: 1,
    marginLeft: 20,
  },
  profileName: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 4,
  },
  profileLocation: {
    fontSize: 16,
    opacity: 0.7,
    marginBottom: 12,
  },
  statsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
  },
  statDivider: {
    width: 1,
    height: 30,
    opacity: 0.2,
    backgroundColor: "#000",
  },
  sectionContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  introductionText: {
    fontSize: 15,
    lineHeight: 22,
  },
  verificationContainer: {
    marginTop: 4,
  },
  verificationItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  verificationText: {
    fontSize: 15,
    marginLeft: 12,
  },
  surveyItem: {
    marginBottom: 14,
  },
  surveyLabel: {
    fontSize: 15,
    fontWeight: "500",
    marginBottom: 6,
  },
  surveyValue: {
    fontSize: 15,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  infoIcon: {
    width: 24,
    textAlign: "center",
    marginRight: 12,
  },
  infoText: {
    fontSize: 15,
  },
  interestsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  interestTag: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  interestText: {
    fontSize: 14,
  },
  galleryContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  galleryImage: {
    width: "32%",
    height: 100,
    borderRadius: 8,
    marginBottom: 8,
  },
  footer: {
    height: 20,
  },
  tabBar: {
    flexDirection: "row",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    borderTopWidth: 1,
  },
  tabItem: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  tabLabel: {
    fontSize: 12,
    marginTop: 4,
  },
});
