import { Text, View } from "@/components/Themed";
import Colors from "@/constants/Colors";
import Config from "@/constants/Config";
import ApiService from "@/services/ApiService";
import { FontAwesome } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Link, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    useColorScheme,
} from "react-native";

export default function LoginScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [secureEntry, setSecureEntry] = useState(true);

  const handleLogin = async () => {
    // 입력 검증
    if (!email.trim()) {
      Alert.alert("오류", "이메일을 입력해주세요.");
      return;
    }

    if (!password.trim()) {
      Alert.alert("오류", "비밀번호를 입력해주세요.");
      return;
    }

    setLoading(true);

    try {
      const response = await ApiService.login(email.trim(), password);

      if (response.success && response.data) {
        // 로그인 성공
        await AsyncStorage.setItem(Config.TOKEN_KEY, response.data.accessToken);
        console.log("로그인 성공:", response.data.userId);

        // 홈 화면으로 이동
        router.replace("/(tabs)");
      } else {
        // 로그인 실패
        Alert.alert(
          "로그인 실패",
          response.error || "이메일 또는 비밀번호가 올바르지 않습니다."
        );
      }
    } catch (error) {
      console.error("로그인 오류:", error);
      Alert.alert(
        "오류",
        "로그인 중 문제가 발생했습니다. 나중에 다시 시도해주세요."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.logoContainer}>
            <FontAwesome name="heart" size={64} color={colors.primary} />
            <Text style={styles.title}>Check Love</Text>
            <Text style={styles.subtitle}>당신의 완벽한 만남을 찾아보세요</Text>
          </View>

          <View style={styles.formContainer}>
            <View
              style={[
                styles.inputContainer,
                { backgroundColor: colors.subtle },
              ]}
            >
              <FontAwesome name="envelope" size={20} color={colors.primary} />
              <TextInput
                style={styles.input}
                placeholder="이메일"
                placeholderTextColor={colors.tabIconDefault}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View
              style={[
                styles.inputContainer,
                { backgroundColor: colors.subtle },
              ]}
            >
              <FontAwesome name="lock" size={20} color={colors.primary} />
              <TextInput
                style={styles.input}
                placeholder="비밀번호"
                placeholderTextColor={colors.tabIconDefault}
                secureTextEntry={secureEntry}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity
                onPress={() => setSecureEntry(!secureEntry)}
                style={styles.eyeIcon}
              >
                <FontAwesome
                  name={secureEntry ? "eye" : "eye-slash"}
                  size={20}
                  color={colors.tabIconDefault}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[
                styles.loginButton,
                { backgroundColor: colors.primary },
                loading && { opacity: 0.7 },
              ]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.loginButtonText}>로그인</Text>
              )}
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>계정이 없으신가요?</Text>
              <Link href="/auth/signup" asChild>
                <TouchableOpacity>
                  <Text style={[styles.signupText, { color: colors.primary }]}>
                    회원가입
                  </Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: "center",
  },
  formContainer: {
    width: "100%",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    height: 56,
  },
  input: {
    flex: 1,
    height: 56,
    marginLeft: 12,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 8,
  },
  loginButton: {
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
  },
  loginButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },
  footerText: {
    fontSize: 14,
    marginRight: 4,
  },
  signupText: {
    fontSize: 14,
    fontWeight: "bold",
  },
});
