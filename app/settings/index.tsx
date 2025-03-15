import { Text, View } from "@/components/Themed";
import Colors from "@/constants/Colors";
import { FontAwesome } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
} from "react-native";

export default function SettingsScreen() {
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
            // 로그인 정보 삭제
            await AsyncStorage.removeItem("userToken");
            await AsyncStorage.removeItem("userData");
            // 로그인 화면으로 이동
            router.replace("/auth/login");
          } catch (error) {
            console.error("로그아웃 오류:", error);
            Alert.alert("오류", "로그아웃 중 문제가 발생했습니다.");
          }
        },
      },
    ]);
  };

  // 회원 탈퇴 처리
  const handleDeleteAccount = () => {
    Alert.alert(
      "회원 탈퇴",
      "정말 탈퇴하시겠습니까? 모든 데이터가 삭제되며 복구할 수 없습니다.",
      [
        { text: "취소", style: "cancel" },
        {
          text: "탈퇴하기",
          style: "destructive",
          onPress: () => {
            Alert.alert(
              "확인",
              "정말 탈퇴하시겠습니까? 이 작업은 취소할 수 없습니다.",
              [
                { text: "취소", style: "cancel" },
                {
                  text: "탈퇴하기",
                  style: "destructive",
                  onPress: async () => {
                    try {
                      // TODO: 실제 API 호출로 회원 탈퇴 처리
                      // await ApiService.deleteAccount();

                      // 로그인 정보 삭제
                      await AsyncStorage.removeItem("userToken");
                      await AsyncStorage.removeItem("userData");

                      // 로그인 화면으로 이동
                      router.replace("/auth/login");
                    } catch (error) {
                      console.error("회원 탈퇴 오류:", error);
                      Alert.alert("오류", "회원 탈퇴 중 문제가 발생했습니다.");
                    }
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  // 설정 항목 렌더링 함수
  const renderSettingsItem = (
    icon,
    label,
    onPress,
    color = colors.text,
    isLast = false
  ) => (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.settingsItem,
        !isLast && { borderBottomWidth: 1, borderBottomColor: colors.border },
      ]}
    >
      <View style={styles.settingsItemIcon}>
        <FontAwesome name={icon} size={20} color={color} />
      </View>
      <Text style={[styles.settingsItemText, { color }]}>{label}</Text>
      <FontAwesome name="angle-right" size={18} color={colors.subtle} />
    </TouchableOpacity>
  );

  // 설정 섹션 렌더링 함수
  const renderSettingsSection = (title, items) => (
    <View style={styles.settingsSection}>
      <Text style={[styles.sectionTitle, { color: colors.subtle }]}>
        {title}
      </Text>
      <View style={[styles.sectionContainer, { backgroundColor: colors.card }]}>
        {items.map((item, index) =>
          renderSettingsItem(
            item.icon,
            item.label,
            item.onPress,
            item.color || colors.text,
            index === items.length - 1
          )
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />

      <ScrollView style={styles.scrollView}>
        {/* 계정 및 프로필 섹션 */}
        {renderSettingsSection("계정 및 프로필", [
          {
            icon: "user-circle",
            label: "프로필 편집",
            onPress: () => router.push("/profile/edit"),
          },
          {
            icon: "id-card",
            label: "계정 설정",
            onPress: () => router.push("/settings/account"),
          },
          {
            icon: "bell",
            label: "알림 설정",
            onPress: () => router.push("/settings/notifications"),
          },
          {
            icon: "eye",
            label: "공개 범위 설정",
            onPress: () => router.push("/settings/privacy"),
          },
        ])}

        {/* 매칭 및 검색 설정 */}
        {renderSettingsSection("매칭 및 검색", [
          {
            icon: "sliders",
            label: "매칭 조건 설정",
            onPress: () => router.push("/settings/matching"),
          },
          {
            icon: "ban",
            label: "차단된 사용자 관리",
            onPress: () => router.push("/settings/blocked"),
          },
          {
            icon: "eye-slash",
            label: "비활성화 모드",
            onPress: () => router.push("/settings/deactivate"),
          },
          {
            icon: "map-marker",
            label: "위치 설정",
            onPress: () => router.push("/settings/location"),
          },
        ])}

        {/* 결제 및 멤버십 */}
        {renderSettingsSection("결제 및 멤버십", [
          {
            icon: "credit-card",
            label: "구독 관리",
            onPress: () => router.push("/settings/subscription"),
          },
          {
            icon: "coins",
            label: "포인트/코인 관리",
            onPress: () => router.push("/settings/points"),
          },
          {
            icon: "diamond",
            label: "프리미엄 기능",
            onPress: () => router.push("/settings/premium"),
          },
        ])}

        {/* 보안 및 개인정보 */}
        {renderSettingsSection("보안 및 개인정보", [
          {
            icon: "shield",
            label: "개인정보 및 보안",
            onPress: () => router.push("/settings/security"),
          },
          {
            icon: "lock",
            label: "계정 보안",
            onPress: () => router.push("/settings/account-security"),
          },
          {
            icon: "mobile",
            label: "로그인 관리",
            onPress: () => router.push("/settings/login-management"),
          },
        ])}

        {/* 지원 및 서비스 */}
        {renderSettingsSection("지원 및 서비스", [
          {
            icon: "question-circle",
            label: "고객 지원",
            onPress: () => router.push("/settings/support"),
          },
          {
            icon: "file-text",
            label: "이용약관 및 개인정보처리방침",
            onPress: () => router.push("/settings/terms"),
          },
          {
            icon: "info-circle",
            label: "앱 정보",
            onPress: () => router.push("/settings/app-info"),
          },
        ])}

        {/* 기타 설정 */}
        {renderSettingsSection("기타", [
          {
            icon: "language",
            label: "언어 설정",
            onPress: () => router.push("/settings/language"),
          },
          {
            icon: "moon-o",
            label: "테마 설정",
            onPress: () => router.push("/settings/theme"),
          },
          {
            icon: "share-alt",
            label: "친구 초대",
            onPress: () => router.push("/settings/invite"),
          },
          {
            icon: "comment",
            label: "피드백",
            onPress: () => router.push("/settings/feedback"),
          },
        ])}

        {/* 계정 관리 */}
        {renderSettingsSection("계정 관리", [
          {
            icon: "sign-out",
            label: "로그아웃",
            onPress: handleLogout,
            color: colors.error,
          },
          {
            icon: "trash",
            label: "회원 탈퇴",
            onPress: handleDeleteAccount,
            color: colors.error,
          },
        ])}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  settingsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  sectionContainer: {
    borderRadius: 10,
    marginHorizontal: 16,
    overflow: "hidden",
  },
  settingsItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  settingsItemIcon: {
    width: 30,
    alignItems: "center",
    marginRight: 12,
  },
  settingsItemText: {
    flex: 1,
    fontSize: 16,
  },
});
