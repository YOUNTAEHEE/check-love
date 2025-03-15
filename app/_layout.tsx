import Config from "@/constants/Config";
import ChatService from "@/services/ChatService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/useColorScheme";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [fontsLoaded, setFontsLoaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });
  const [isReady, setIsReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // 앱 초기화 및 인증 상태 확인
  useEffect(() => {
    async function prepare() {
      try {
        // 사용자 토큰 확인
        const token = await AsyncStorage.getItem(Config.TOKEN_KEY);
        setIsAuthenticated(!!token);

        // 인증 상태에 따라 WebSocket 연결 설정
        if (token) {
          // userData에서 사용자 ID 가져오기
          const userDataStr = await AsyncStorage.getItem("userData");
          let userId = 1; // 기본값

          if (userDataStr) {
            try {
              const userData = JSON.parse(userDataStr);
              if (userData && userData.userId) {
                userId = userData.userId;
              }
            } catch (err) {
              console.error("사용자 데이터 파싱 오류:", err);
            }
          }

          // 채팅 서비스 초기화
          ChatService.setUserId(userId);
          ChatService.initialize();
        }
      } catch (e) {
        console.warn(e);
      } finally {
        // 준비 상태로 설정
        setIsReady(true);
      }
    }

    prepare();
  }, []);

  useEffect(() => {
    if (fontsLoaded && isReady) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, isReady]);

  if (!fontsLoaded || !isReady || isAuthenticated === null) {
    return null;
  }

  // 인증 상태에 따라 리디렉션
  if (!isAuthenticated) {
    return (
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack
          screenOptions={{
            headerShown: false,
            animation: "slide_from_right", // 화면 전환 애니메이션 추가
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen
            name="survey"
            options={{
              animation: "slide_from_right",
              gestureEnabled: false, // 뒤로 스와이프 제스처 비활성화
            }}
          />
          <Stack.Screen name="auth/login" />
          <Stack.Screen name="auth/signup" />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="chat/[id]"
          options={{
            headerTitle: "", // chat/[id].tsx 내부에서 동적으로 설정
            headerBackTitle: "뒤로",
          }}
        />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
