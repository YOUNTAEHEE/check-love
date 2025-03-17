import { Text, View } from "@/components/Themed";
import Colors from "@/constants/Colors";
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
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    useColorScheme,
} from "react-native";

export default function SignupScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [gender, setGender] = useState("MALE"); // MALE 또는 FEMALE
  const [birthDate, setBirthDate] = useState(new Date(1990, 0, 1));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [secureEntry, setSecureEntry] = useState(true);
  const [secureConfirmEntry, setSecureConfirmEntry] = useState(true);

  const formatToYYYYMMDD = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const formatToKoreanDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}년 ${month}월 ${day}일`;
  };

  const handleSignup = async () => {
    // 입력 검증
    if (
      !email.trim() ||
      !password.trim() ||
      !confirmPassword.trim() ||
      !nickname.trim()
    ) {
      Alert.alert("오류", "모든 필수 항목을 입력해주세요.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("오류", "비밀번호가 일치하지 않습니다.");
      return;
    }

    if (password.length < 6) {
      Alert.alert("오류", "비밀번호는 6자 이상이어야 합니다.");
      return;
    }

    setLoading(true);

    try {
      const userData = {
        email: email.trim(),
        password: password,
        nickname: nickname.trim(),
        gender: gender,
        birthDate: formatToYYYYMMDD(birthDate),
        bio: "",
        location: "",
        height: null,
        job: "",
        education: "",
      };

      // API 호출 - 회원가입
      console.log("회원가입 API 호출:", userData);
      const response = await ApiService.signup(userData);

      if (response.success) {
        console.log("회원가입 성공:", response.data);

        // 회원 정보를 AsyncStorage에 임시 저장
        await AsyncStorage.setItem("temp_user_email", email.trim());
        await AsyncStorage.setItem("temp_user_password", password);

        // 성공 메시지 표시 후 설문조사 페이지로 이동
        Alert.alert(
          "회원가입 성공",
          "회원가입이 완료되었습니다. 이제 가치관 설문조사를 진행해주세요.",
          [
            {
              text: "설문조사 시작하기",
              onPress: () => {
                // 설문조사 페이지로 이동
                router.push("/survey");
              },
            },
          ]
        );
      } else {
        // API 호출은 성공했지만 서버에서 오류 응답이 온 경우
        console.error("회원가입 실패:", response.error);
        Alert.alert(
          "회원가입 실패",
          response.error || "회원가입 중 오류가 발생했습니다."
        );
        setLoading(false);
      }
    } catch (error) {
      // API 호출 자체가 실패한 경우 (네트워크 오류 등)
      console.error("회원가입 API 오류:", error);
      Alert.alert(
        "오류",
        "서버 연결에 문제가 있습니다. 네트워크 연결을 확인하고 다시 시도해주세요."
      );
      setLoading(false);

      // 개발 목적으로 API 호출 실패시에도 계속 진행할 경우 아래 코드 주석 해제
      // router.push("/survey");
    }
  };

  // 개선된 날짜 선택 UI
  const ImprovedDatePicker = () => {
    if (!showDatePicker) return null;

    // 현재 년도부터 100년 전까지의 년도 목록
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

    // 월 목록
    const months = [
      { value: 0, label: "1월" },
      { value: 1, label: "2월" },
      { value: 2, label: "3월" },
      { value: 3, label: "4월" },
      { value: 4, label: "5월" },
      { value: 5, label: "6월" },
      { value: 6, label: "7월" },
      { value: 7, label: "8월" },
      { value: 8, label: "9월" },
      { value: 9, label: "10월" },
      { value: 10, label: "11월" },
      { value: 11, label: "12월" },
    ];

    // 선택된 년도와 월에 따른 일 수 계산
    const getDaysInMonth = (year, month) => {
      return new Date(year, month + 1, 0).getDate();
    };

    // 임시 날짜 상태 (모달 내에서만 사용)
    const [tempDate, setTempDate] = useState(new Date(birthDate));

    const daysInMonth = getDaysInMonth(
      tempDate.getFullYear(),
      tempDate.getMonth()
    );
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    // 날짜 변경 핸들러 (모달 내에서만 임시로 적용)
    const handleYearChange = (year) => {
      const newDate = new Date(tempDate);
      newDate.setFullYear(year);

      // 2월 29일인 경우 해당 년도에 맞게 조정
      const maxDays = getDaysInMonth(year, newDate.getMonth());
      if (newDate.getDate() > maxDays) {
        newDate.setDate(maxDays);
      }

      setTempDate(newDate);
    };

    const handleMonthChange = (month) => {
      const newDate = new Date(tempDate);
      newDate.setMonth(month);

      // 해당 월의 마지막 날짜보다 현재 선택된 날짜가 크면 마지막 날짜로 조정
      const maxDays = getDaysInMonth(newDate.getFullYear(), month);
      if (newDate.getDate() > maxDays) {
        newDate.setDate(maxDays);
      }

      setTempDate(newDate);
    };

    const handleDayChange = (day) => {
      const newDate = new Date(tempDate);
      newDate.setDate(day);
      setTempDate(newDate);
    };

    // 확인 버튼 클릭 시 실제 birthDate 상태 업데이트
    const handleConfirm = () => {
      setBirthDate(tempDate);
      setShowDatePicker(false);
    };

    // 취소 버튼 클릭 시 변경 사항 취소
    const handleCancel = () => {
      setShowDatePicker(false);
    };

    return (
      <Modal
        transparent={true}
        animationType="slide"
        visible={showDatePicker}
        onRequestClose={handleCancel}
      >
        <View style={styles.modalContainer}>
          <View style={styles.pickerContainer}>
            <Text style={styles.pickerTitle}>생년월일 선택</Text>

            <View style={styles.dateSelectionContainer}>
              {/* 년도 선택 */}
              <View style={styles.dateColumn}>
                <Text style={styles.dateColumnTitle}>년도</Text>
                <ScrollView
                  style={styles.dateScrollView}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.dateScrollContent}
                >
                  {years.map((year) => (
                    <TouchableOpacity
                      key={`year-${year}`}
                      style={[
                        styles.dateOption,
                        tempDate.getFullYear() === year &&
                          styles.selectedDateOption,
                      ]}
                      onPress={() => handleYearChange(year)}
                    >
                      <Text
                        style={[
                          styles.dateOptionText,
                          tempDate.getFullYear() === year &&
                            styles.selectedDateOptionText,
                        ]}
                      >
                        {year}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* 월 선택 */}
              <View style={styles.dateColumn}>
                <Text style={styles.dateColumnTitle}>월</Text>
                <ScrollView
                  style={styles.dateScrollView}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.dateScrollContent}
                >
                  {months.map((month) => (
                    <TouchableOpacity
                      key={`month-${month.value}`}
                      style={[
                        styles.dateOption,
                        tempDate.getMonth() === month.value &&
                          styles.selectedDateOption,
                      ]}
                      onPress={() => handleMonthChange(month.value)}
                    >
                      <Text
                        style={[
                          styles.dateOptionText,
                          tempDate.getMonth() === month.value &&
                            styles.selectedDateOptionText,
                        ]}
                      >
                        {month.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* 일 선택 */}
              <View style={styles.dateColumn}>
                <Text style={styles.dateColumnTitle}>일</Text>
                <ScrollView
                  style={styles.dateScrollView}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.dateScrollContent}
                >
                  {days.map((day) => (
                    <TouchableOpacity
                      key={`day-${day}`}
                      style={[
                        styles.dateOption,
                        tempDate.getDate() === day && styles.selectedDateOption,
                      ]}
                      onPress={() => handleDayChange(day)}
                    >
                      <Text
                        style={[
                          styles.dateOptionText,
                          tempDate.getDate() === day &&
                            styles.selectedDateOptionText,
                        ]}
                      >
                        {day}일
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            <View style={styles.dateDisplay}>
              <Text style={styles.dateText}>
                {formatToKoreanDate(tempDate)}
              </Text>
            </View>

            <View style={styles.pickerButtons}>
              <TouchableOpacity
                style={[styles.pickerButton, { backgroundColor: "#ccc" }]}
                onPress={handleCancel}
              >
                <Text style={styles.pickerButtonText}>취소</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.pickerButton,
                  { backgroundColor: colors.primary },
                ]}
                onPress={handleConfirm}
              >
                <Text style={[styles.pickerButtonText, { color: "white" }]}>
                  확인
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
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
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <FontAwesome name="arrow-left" size={20} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>회원가입</Text>
            <View style={styles.placeholder} />
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

            <View
              style={[
                styles.inputContainer,
                { backgroundColor: colors.subtle },
              ]}
            >
              <FontAwesome name="lock" size={20} color={colors.primary} />
              <TextInput
                style={styles.input}
                placeholder="비밀번호 확인"
                placeholderTextColor={colors.tabIconDefault}
                secureTextEntry={secureConfirmEntry}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
              <TouchableOpacity
                onPress={() => setSecureConfirmEntry(!secureConfirmEntry)}
                style={styles.eyeIcon}
              >
                <FontAwesome
                  name={secureConfirmEntry ? "eye" : "eye-slash"}
                  size={20}
                  color={colors.tabIconDefault}
                />
              </TouchableOpacity>
            </View>

            <View
              style={[
                styles.inputContainer,
                { backgroundColor: colors.subtle },
              ]}
            >
              <FontAwesome name="user" size={20} color={colors.primary} />
              <TextInput
                style={styles.input}
                placeholder="닉네임"
                placeholderTextColor={colors.tabIconDefault}
                value={nickname}
                onChangeText={setNickname}
                maxLength={12}
              />
            </View>

            <View style={styles.genderContainer}>
              <Text style={styles.genderLabel}>성별</Text>
              <View style={styles.genderOptions}>
                <TouchableOpacity
                  style={[
                    styles.genderOption,
                    gender === "MALE" && {
                      backgroundColor: colors.primary,
                    },
                  ]}
                  onPress={() => setGender("MALE")}
                >
                  <Text
                    style={[
                      styles.genderText,
                      gender === "MALE" && { color: "white" },
                    ]}
                  >
                    남성
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.genderOption,
                    gender === "FEMALE" && {
                      backgroundColor: colors.primary,
                    },
                  ]}
                  onPress={() => setGender("FEMALE")}
                >
                  <Text
                    style={[
                      styles.genderText,
                      gender === "FEMALE" && { color: "white" },
                    ]}
                  >
                    여성
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.inputContainer,
                { backgroundColor: colors.subtle },
              ]}
              onPress={() => setShowDatePicker(true)}
            >
              <FontAwesome name="calendar" size={20} color={colors.primary} />
              <Text style={[styles.input, { paddingTop: 18 }]}>
                {formatToKoreanDate(birthDate)}
              </Text>
            </TouchableOpacity>

            <ImprovedDatePicker />

            <TouchableOpacity
              style={[
                styles.signupButton,
                { backgroundColor: colors.primary },
                loading && { opacity: 0.7 },
              ]}
              onPress={() => {
                // 간단한 유효성 검사
                if (
                  !email.trim() ||
                  !password.trim() ||
                  !confirmPassword.trim() ||
                  !nickname.trim()
                ) {
                  Alert.alert("오류", "모든 필수 항목을 입력해주세요.");
                  return;
                }

                if (password !== confirmPassword) {
                  Alert.alert("오류", "비밀번호가 일치하지 않습니다.");
                  return;
                }

                // 로딩 표시
                setLoading(true);

                // 임시 회원 정보 저장 (실제로는 서버에서 발급받은 토큰을 저장해야 함)
                const saveUserInfo = async () => {
                  try {
                    await AsyncStorage.setItem("temp_user_email", email.trim());
                    await AsyncStorage.setItem("temp_user_password", password);

                    console.log("임시 회원 정보 저장 완료");
                    setLoading(false);

                    // 설문조사 페이지로 이동
                    console.log("설문조사 페이지로 이동 시도");
                    router.navigate("/survey");
                  } catch (error) {
                    console.error("회원 정보 저장 오류:", error);
                    setLoading(false);
                    Alert.alert(
                      "오류",
                      "회원 정보 저장 중 문제가 발생했습니다."
                    );
                  }
                };

                saveUserInfo();
              }}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.signupButtonText}>회원가입</Text>
              )}
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>이미 계정이 있으신가요?</Text>
              <Link href="/auth/login" asChild>
                <TouchableOpacity>
                  <Text style={[styles.loginText, { color: colors.primary }]}>
                    로그인
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
    padding: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 30,
    paddingTop: Platform.OS === "ios" ? 20 : 0,
  },
  backButton: {
    padding: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  placeholder: {
    width: 40,
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
  genderContainer: {
    marginBottom: 16,
  },
  genderLabel: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: "500",
  },
  genderOptions: {
    flexDirection: "row",
    gap: 12,
  },
  genderOption: {
    flex: 1,
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e5e5",
  },
  genderText: {
    fontSize: 16,
    fontWeight: "500",
  },
  signupButton: {
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },
  signupButtonText: {
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
  loginText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  pickerContainer: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
  },
  dateSelectionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 20,
  },
  dateColumn: {
    width: "30%",
    alignItems: "center",
  },
  dateColumnTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  dateScrollView: {
    height: 200,
    width: "100%",
  },
  dateScrollContent: {
    paddingVertical: 10,
  },
  dateOption: {
    padding: 10,
    alignItems: "center",
    borderRadius: 8,
    marginVertical: 2,
  },
  selectedDateOption: {
    backgroundColor: "#f0f0f0",
  },
  dateOptionText: {
    fontSize: 16,
  },
  selectedDateOptionText: {
    fontWeight: "bold",
    color: "#007AFF",
  },
  dateDisplay: {
    padding: 15,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 20,
    width: "100%",
    alignItems: "center",
  },
  dateText: {
    fontSize: 18,
  },
  pickerButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 20,
  },
  pickerButton: {
    padding: 12,
    borderRadius: 8,
    width: "48%",
    alignItems: "center",
  },
  pickerButtonText: {
    fontSize: 16,
    fontWeight: "500",
  },
});
