import { Text, View } from "@/components/Themed";
import Colors from "@/constants/Colors";
import Config from "@/constants/Config";
import { FontAwesome } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// 가상 데이터 - 실제 앱에서는 API에서 가져오거나 상태 관리를 통해 처리해야 합니다
const USERS = [
  {
    id: "1",
    name: "지민",
    age: 28,
    job: "그래픽 디자이너",
    location: "서울 강남구",
    image:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000",
    values: [
      { name: "가족관", userChoice: "가족 중심적", aiVerified: "개인주의적" },
      { name: "일과 삶", userChoice: "워라밸 중시", aiVerified: "워라밸 중시" },
      { name: "성격", userChoice: "활발함", aiVerified: "조용함" },
    ],
  },
  {
    id: "2",
    name: "수현",
    age: 26,
    job: "마케팅 전문가",
    location: "서울 마포구",
    image:
      "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=1000",
    values: [
      { name: "여행 스타일", userChoice: "계획적", aiVerified: "계획적" },
      { name: "취미", userChoice: "독서", aiVerified: "영화 감상" },
      { name: "미래 계획", userChoice: "안정 추구", aiVerified: "안정 추구" },
    ],
  },
  {
    id: "3",
    name: "준혁",
    age: 31,
    job: "소프트웨어 개발자",
    location: "성남시 분당구",
    image:
      "https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?q=80&w=1000",
    values: [
      { name: "취미", userChoice: "헬스", aiVerified: "헬스" },
      { name: "소통 방식", userChoice: "직설적", aiVerified: "공감적" },
      { name: "관계 스타일", userChoice: "독립적", aiVerified: "독립적" },
    ],
  },
  {
    id: "4",
    name: "하은",
    age: 27,
    job: "간호사",
    location: "서울 송파구",
    image:
      "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=1000",
    values: [
      { name: "가치관", userChoice: "봉사 정신", aiVerified: "봉사 정신" },
      { name: "취미", userChoice: "요리", aiVerified: "여행" },
      { name: "생활방식", userChoice: "계획적", aiVerified: "즉흥적" },
    ],
  },
];

// 가치관 일치 여부를 표시하는 컴포넌트
function ValueMatch({ item }) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const isMatch = item.userChoice === item.aiVerified;

  return (
    <View style={styles.valueContainer}>
      <Text style={styles.valueName}>{item.name}</Text>
      <View style={styles.valueRow}>
        <View style={[styles.valueTag, { backgroundColor: colors.subtle }]}>
          <Text style={styles.valueChoice}>선택: {item.userChoice}</Text>
        </View>
        <View
          style={[
            styles.valueTag,
            { backgroundColor: isMatch ? colors.success : colors.warning },
          ]}
        >
          <Text style={[styles.valueVerified, { color: "white" }]}>
            AI: {item.aiVerified}
          </Text>
        </View>
      </View>
    </View>
  );
}

// 사용자 카드 컴포넌트
function UserCard({ user }) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const router = useRouter();

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.card, shadowColor: colors.cardShadow },
      ]}
    >
      <Image source={{ uri: user.image }} style={styles.userImage} />

      <View style={styles.userInfo}>
        <View style={styles.nameRow}>
          <Text style={styles.userName}>
            {user.name}, {user.age}
          </Text>
          <TouchableOpacity
            style={[styles.likeButton, { backgroundColor: colors.primary }]}
            onPress={() => console.log("Liked", user.id)}
          >
            <FontAwesome name="heart" size={14} color="white" />
          </TouchableOpacity>
        </View>

        <Text style={styles.userMeta}>
          {user.job} • {user.location}
        </Text>

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>가치관 분석</Text>

        {user.values.map((value, index) => (
          <ValueMatch key={index} item={value} />
        ))}

        <TouchableOpacity
          style={[styles.contactButton, { backgroundColor: colors.accent }]}
          onPress={() => router.push(`/chat/${user.id}`)}
        >
          <Text style={styles.contactButtonText}>메세지 보내기</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function ExploreScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const router = useRouter();
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

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>찾아보기</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconButton}>
            <FontAwesome name="filter" size={18} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <FontAwesome name="sliders" size={18} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={USERS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <UserCard user={item} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
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
  headerActions: {
    flexDirection: "row",
  },
  iconButton: {
    marginLeft: 15,
    height: 36,
    width: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    borderRadius: 16,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: "hidden",
  },
  userImage: {
    width: "100%",
    height: 240,
  },
  userInfo: {
    padding: 16,
  },
  nameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  userName: {
    fontSize: 22,
    fontWeight: "bold",
  },
  likeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  userMeta: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 4,
  },
  divider: {
    height: 1,
    opacity: 0.1,
    marginVertical: 16,
    backgroundColor: "#000",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
  },
  valueContainer: {
    marginBottom: 10,
  },
  valueName: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  valueTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  valueChoice: {
    fontSize: 12,
  },
  valueVerified: {
    fontSize: 12,
    fontWeight: "500",
  },
  contactButton: {
    marginTop: 16,
    paddingVertical: 10,
    borderRadius: 25,
    alignItems: "center",
  },
  contactButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});
