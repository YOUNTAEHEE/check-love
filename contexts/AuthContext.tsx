import ApiService from "@/services/ApiService";
import { AppError } from "@/utils/errors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter, useSegments } from "expo-router";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

interface AuthContextType {
  isLoading: boolean;
  isAuthenticated: boolean;
  userId: string | null;
  token: string | null;
  login: (
    username: string,
    password: string
  ) => Promise<[boolean, AppError | null]>;
  logout: () => Promise<void>;
}

// 기본 컨텍스트 값
const defaultContext: AuthContextType = {
  isLoading: true,
  isAuthenticated: false,
  userId: null,
  token: null,
  login: async () => [
    false,
    { code: "NOT_IMPLEMENTED", message: "로그인 기능이 구현되지 않았습니다." },
  ],
  logout: async () => {},
};

// 인증 컨텍스트 생성
const AuthContext = createContext<AuthContextType>(defaultContext);

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * 인증 상태를 관리하는 Provider 컴포넌트
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();
  const segments = useSegments();

  // 인증 상태 초기화
  useEffect(() => {
    const loadStoredToken = async () => {
      try {
        // AsyncStorage에서 토큰과 사용자 ID 로드
        const storedToken = await AsyncStorage.getItem("token");
        const storedUserId = await AsyncStorage.getItem("userId");

        // 토큰이 있으면 상태 업데이트
        if (storedToken) {
          setToken(storedToken);
          setUserId(storedUserId);
          ApiService.setToken(storedToken);
        }
      } catch (error) {
        console.error("토큰 로드 오류:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStoredToken();
  }, []);

  // 인증 상태 변경 시 리디렉션
  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "(auth)";

    // 인증되지 않았으면 로그인 페이지로 이동
    if (!token && !inAuthGroup) {
      router.replace("/login");
    } else if (token && inAuthGroup) {
      // 인증되었으면 메인 페이지로 이동
      router.replace("/");
    }
  }, [isLoading, token, segments]);

  /**
   * 로그인 함수
   */
  const login = async (
    username: string,
    password: string
  ): Promise<[boolean, AppError | null]> => {
    try {
      const { token: newToken, userId: newUserId } = await ApiService.login(
        username,
        password
      );

      // 상태 업데이트
      setToken(newToken);
      setUserId(newUserId);

      return [true, null];
    } catch (error) {
      console.error("로그인 오류:", error);
      const appError = error as AppError;
      return [false, appError];
    }
  };

  /**
   * 로그아웃 함수
   */
  const logout = async (): Promise<void> => {
    try {
      // API 서비스 로그아웃
      await ApiService.logout();
    } catch (error) {
      console.error("로그아웃 오류:", error);
    } finally {
      // 로컬 상태 초기화
      setToken(null);
      setUserId(null);

      // 로그인 페이지로 리디렉션
      router.replace("/login");
    }
  };

  const value: AuthContextType = {
    isLoading,
    isAuthenticated: !!token,
    userId,
    token,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * 인증 컨텍스트를 사용하기 위한 커스텀 훅
 */
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}

export default AuthContext;
