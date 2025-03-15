import { Text, View } from "@/components/Themed";
import Colors from "@/constants/Colors";
import Config from "@/constants/Config";
import ChatService from "@/services/ChatService";
import { FontAwesome } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Switch,
  TouchableOpacity,
  useColorScheme,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// 가상 데이터 - 실제 앱에서는 상태 관리나 API에서 가져옵니다
const USER = {
  name: "김동현",
  age: 29,
  job: "UI/UX 디자이너",
  location: "서울 서초구",
  image:
    "https://images.unsplash.com/photo-1555952517-2e8e729e0b44?q=80&w=1000",
  bio: "디자인과 커피를 좋아하는 평범한 디자이너입니다. 여행과 맛집 탐방도 좋아해요. 진정성 있는 만남을 기대합니다.",
  values: [
    { name: "가족관", userChoice: "가족 중심적", aiVerified: "가족 중심적" },
    { name: "여행 스타일", userChoice: "계획적", aiVerified: "즉흥적" },
    { name: "일과 삶", userChoice: "워라밸 중시", aiVerified: "워라밸 중시" },
    { name: "미래 계획", userChoice: "꿈 추구", aiVerified: "안정 추구" },
    { name: "소통 방식", userChoice: "솔직함", aiVerified: "솔직함" },
  ],
};

function ValueItem({ item }) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const isMatch = item.userChoice === item.aiVerified;

  return (
    <View style={[styles.valueItem, { borderColor: colors.border }]}>
      <View style={styles.valueHeader}>
        <Text style={styles.valueTitle}>{item.name}</Text>
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

      <View style={styles.valueCompare}>
        <View style={styles.valueBox}>
          <Text style={styles.valueLabel}>내 선택</Text>
          <Text style={styles.valueText}>{item.userChoice}</Text>
        </View>
        <FontAwesome name="arrows-h" size={16} color={colors.tabIconDefault} />
        <View style={styles.valueBox}>
          <Text style={styles.valueLabel}>AI 분석</Text>
          <Text style={styles.valueText}>{item.aiVerified}</Text>
        </View>
      </View>
    </View>
  );
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const router = useRouter();
  const [showRealValues, setShowRealValues] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 로그인 상태 확인
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const token = await AsyncStorage.getItem(Config.TOKEN_KEY);
        const isAuthenticated = !!token;
        setIsLoggedIn(isAuthenticated);

        // 로그인 되어 있지 않으면 홈 화면으로 리다이렉트
        if (!isAuthenticated) {
          console.log("로그인되지 않음: 홈 화면으로 리다이렉트");
          router.replace("/(tabs)");
          return;
        }

        setIsLoading(false);
      } catch (error) {
        console.error("로그인 상태 확인 중 오류:", error);
        setIsLoggedIn(false);
        router.replace("/(tabs)");
      }
    };

    checkLoginStatus();
  }, []);

  // 로딩 중이거나 로그인되지 않았으면 빈 화면 표시
  if (isLoading || !isLoggedIn) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <Text>로딩 중...</Text>
      </View>
    );
  }

  // 로그아웃 처리
  const handleLogout = async () => {
    Alert.alert("로그아웃", "정말 로그아웃 하시겠습니까?", [
      {
        text: "취소",
        style: "cancel",
      },
      {
        text: "로그아웃",
        style: "destructive",
        onPress: async () => {
          try {
            // WebSocket 연결 해제
            ChatService.disconnect();

            // 토큰 삭제
            await AsyncStorage.removeItem(Config.TOKEN_KEY);

            // 앱 재시작 (로그인 화면으로 이동)
            router.replace("/auth/login");
          } catch (error) {
            console.error("로그아웃 오류:", error);
            Alert.alert("오류", "로그아웃 중 문제가 발생했습니다.");
          }
        },
      },
    ]);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>내 프로필</Text>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => router.push("/settings")}
        >
          <FontAwesome name="cog" size={22} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={[styles.profileCard, { backgroundColor: colors.card }]}>
          <Image source={{ uri: USER.image }} style={styles.profileImage} />

          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>
              {USER.name}, {USER.age}
            </Text>
            <Text style={styles.profileMeta}>
              {USER.job} • {USER.location}
            </Text>

            <View style={styles.bioContainer}>
              <Text style={styles.bioText}>{USER.bio}</Text>
            </View>

            <View style={styles.actionRow}>
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  { backgroundColor: colors.primary },
                ]}
                onPress={() => router.push("/edit-profile")}
              >
                <FontAwesome
                  name="pencil"
                  size={18}
                  color="white"
                  style={styles.actionIcon}
                />
                <Text style={styles.actionText}>프로필 수정</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.actionButton,
                  { backgroundColor: colors.accent },
                ]}
                onPress={() => router.push("/survey")}
              >
                <FontAwesome
                  name="list-alt"
                  size={18}
                  color="white"
                  style={styles.actionIcon}
                />
                <Text style={styles.actionText}>가치관 조사</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.valuesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>가치관 분석</Text>
            <View style={styles.toggleContainer}>
              <Text
                style={[
                  styles.toggleLabel,
                  { color: !showRealValues ? colors.primary : "gray" },
                ]}
              >
                선택값만
              </Text>
              <Switch
                value={showRealValues}
                onValueChange={setShowRealValues}
                trackColor={{ false: "gray", true: colors.primary }}
                thumbColor="white"
              />
              <Text
                style={[
                  styles.toggleLabel,
                  { color: showRealValues ? colors.primary : "gray" },
                ]}
              >
                AI 분석 포함
              </Text>
            </View>
          </View>

          <View style={styles.valuesList}>
            {USER.values.map((value, index) => (
              <ValueItem key={index} item={value} />
            ))}
          </View>

          <TouchableOpacity
            style={[styles.aiButton, { backgroundColor: colors.subtle }]}
            onPress={() => router.push("/ai-verify")}
          >
            <FontAwesome
              name="magic"
              size={20}
              color={colors.accent}
              style={styles.aiIcon}
            />
            <Text style={[styles.aiText, { color: colors.accent }]}>
              AI 재검증 시작하기
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.menuSection}>
        <TouchableOpacity
          style={[styles.menuItem, { borderColor: colors.border }]}
          onPress={() => {}}
        >
          <FontAwesome name="user" size={20} color={colors.text} />
          <Text style={styles.menuText}>프로필 편집</Text>
          <FontAwesome
            name="chevron-right"
            size={16}
            color={colors.tabIconDefault}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuItem, { borderColor: colors.border }]}
          onPress={() => {}}
        >
          <FontAwesome name="bell" size={20} color={colors.text} />
          <Text style={styles.menuText}>알림 설정</Text>
          <FontAwesome
            name="chevron-right"
            size={16}
            color={colors.tabIconDefault}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuItem, { borderColor: colors.border }]}
          onPress={() => {}}
        >
          <FontAwesome name="lock" size={20} color={colors.text} />
          <Text style={styles.menuText}>개인정보 및 보안</Text>
          <FontAwesome
            name="chevron-right"
            size={16}
            color={colors.tabIconDefault}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuItem, { borderColor: colors.border }]}
          onPress={handleLogout}
        >
          <FontAwesome name="sign-out" size={20} color="crimson" />
          <Text style={[styles.menuText, { color: "crimson" }]}>로그아웃</Text>
          <FontAwesome
            name="chevron-right"
            size={16}
            color={colors.tabIconDefault}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  iconButton: {
    height: 36,
    width: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  profileCard: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 24,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  profileImage: {
    width: "100%",
    height: 200,
  },
  profileInfo: {
    padding: 16,
  },
  profileName: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 4,
  },
  profileMeta: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 12,
  },
  bioContainer: {
    marginBottom: 16,
  },
  bioText: {
    fontSize: 15,
    lineHeight: 22,
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 24,
    flex: 1,
    marginHorizontal: 4,
  },
  actionIcon: {
    marginRight: 6,
  },
  actionText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
  valuesSection: {
    marginBottom: 30,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
  },
  toggleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  toggleLabel: {
    fontSize: 12,
    marginHorizontal: 6,
  },
  valuesList: {
    marginBottom: 16,
  },
  valueItem: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  valueHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  valueTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  matchBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  matchText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  valueCompare: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  valueBox: {
    flex: 1,
    padding: 8,
  },
  valueLabel: {
    fontSize: 12,
    opacity: 0.6,
    marginBottom: 4,
  },
  valueText: {
    fontSize: 15,
  },
  aiButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
  },
  aiIcon: {
    marginRight: 8,
  },
  aiText: {
    fontWeight: "bold",
    fontSize: 15,
  },
  menuSection: {
    borderRadius: 12,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
  },
  menuText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
  },
});
