import Config from "@/constants/Config";
import { convertApiError } from "@/utils/errors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { AxiosInstance } from "axios";
import { Configuration } from "../api-client/configuration";
// OpenAPI 자동 생성 클래스 가져오기
import {
  AuthApi,
  AuthApiAuthLoginRequest,
  LoginRequest,
  UserProfileResponse,
} from "../api-client/api";

/**
 * API 응답 인터페이스
 */
export interface ApiResponse<T = any> {
  data?: T;
  success: boolean;
  error?: string;
}

/**
 * 토큰을 가져오는 유틸리티 함수
 */
const getStoredToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(Config.TOKEN_KEY);
  } catch (error) {
    console.error("토큰 조회 오류:", error);
    return null;
  }
};

/**
 * API 서비스 클래스
 * - API 클라이언트 인스턴스 관리
 * - 인증 토큰 관리
 * - HTTP 요청 처리
 */
class ApiService {
  private static instance: ApiService;
  private axios: AxiosInstance;
  private token: string | null = null;
  private baseUrl: string = Config.API_URL;

  // OpenAPI 자동 생성 클라이언트
  public authApi: AuthApi;

  private constructor() {
    // Axios 인스턴스 초기화
    this.axios = axios.create({
      baseURL: this.baseUrl,
      timeout: Config.DEFAULT_TIMEOUT,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // API 클라이언트 설정
    const config = new Configuration({
      basePath: this.baseUrl,
      accessToken: () => this.token || "",
    });

    // API 클라이언트 초기화
    this.authApi = new AuthApi(config, this.baseUrl, this.axios);

    // 요청 인터셉터 설정
    this.axios.interceptors.request.use(
      async (config: any) => {
        // 토큰이 없으면 AsyncStorage에서 시도
        if (!this.token) {
          this.token = await getStoredToken();
        }

        // 토큰이 있으면 헤더에 추가
        if (this.token && config.headers) {
          config.headers["Authorization"] = `Bearer ${this.token}`;
        }

        return config;
      },
      (error: any) => Promise.reject(error)
    );

    // 응답 인터셉터 설정
    this.axios.interceptors.response.use(
      (response: any) => response,
      (error: any) => {
        const appError = convertApiError(error);

        // 인증 오류 (401) 처리
        if (appError.status === 401) {
          // 토큰 만료 처리 로직
          this.removeToken();
          // AuthContext에서 나머지 로그아웃 처리
        }

        return Promise.reject(appError);
      }
    );
  }

  /**
   * 싱글톤 인스턴스 반환
   */
  public static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  /**
   * 액세스 토큰 설정
   */
  public setToken(token: string): void {
    this.token = token;

    // API 클라이언트 설정 업데이트
    const config = new Configuration({
      basePath: this.baseUrl,
      accessToken: () => this.token || "",
    });

    this.authApi = new AuthApi(config, this.baseUrl, this.axios);
  }

  /**
   * 토큰 제거
   */
  public removeToken(): void {
    this.token = null;
    AsyncStorage.removeItem(Config.TOKEN_KEY).catch(console.error);
  }

  /**
   * 현재 토큰 반환
   */
  public getToken(): string | null {
    return this.token;
  }

  /**
   * API 기본 URL 설정
   */
  public setBaseUrl(url: string): void {
    this.baseUrl = url;
    this.axios.defaults.baseURL = url;

    // API 클라이언트 설정 업데이트
    const config = new Configuration({
      basePath: this.baseUrl,
      accessToken: () => this.token || "",
    });

    this.authApi = new AuthApi(config, this.baseUrl, this.axios);
  }

  /**
   * 요청 헤더 설정
   */
  public setHeader(key: string, value: string): void {
    this.axios.defaults.headers.common[key] = value;
  }

  /**
   * Axios 인스턴스 반환
   */
  public getAxiosInstance(): AxiosInstance {
    return this.axios;
  }

  /**
   * GET 요청 수행
   */
  public async get<T = any>(
    url: string,
    params?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.axios.get<T>(url, { params });
      return {
        data: response.data,
        success: true,
      };
    } catch (error) {
      const appError = convertApiError(error);
      return {
        success: false,
        error: appError.message,
      };
    }
  }

  /**
   * POST 요청 수행
   */
  public async post<T = any>(url: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response = await this.axios.post<T>(url, data);
      return {
        data: response.data,
        success: true,
      };
    } catch (error) {
      const appError = convertApiError(error);
      return {
        success: false,
        error: appError.message,
      };
    }
  }

  /**
   * PUT 요청 수행
   */
  public async put<T = any>(url: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response = await this.axios.put<T>(url, data);
      return {
        data: response.data,
        success: true,
      };
    } catch (error) {
      const appError = convertApiError(error);
      return {
        success: false,
        error: appError.message,
      };
    }
  }

  /**
   * DELETE 요청 수행
   */
  public async delete<T = any>(url: string): Promise<ApiResponse<T>> {
    try {
      const response = await this.axios.delete<T>(url);
      return {
        data: response.data,
        success: true,
      };
    } catch (error) {
      const appError = convertApiError(error);
      return {
        success: false,
        error: appError.message,
      };
    }
  }

  /**
   * 사용자 로그인
   */
  public async login(
    username: string,
    password: string
  ): Promise<{ token: string; userId: string }> {
    // 자동 생성된 API 클라이언트의 인터페이스에 맞게 호출
    const loginRequestData: LoginRequest = {
      accountInfo: {
        username,
        password,
      },
    };

    const requestParams: AuthApiAuthLoginRequest = {
      loginRequest: loginRequestData,
    };

    const response = await this.authApi.authLogin(requestParams);
    const token = response.data.authToken.token;
    // 사용자 ID는 로그인 응답에서 직접 가져올 수 없으므로 추가로 사용자 정보를 요청
    const userProfile = await this.authApi.getCurrentUser();
    const userId = String(userProfile.data.id || "");

    if (token) {
      this.setToken(token);
      await AsyncStorage.setItem(Config.TOKEN_KEY, token);
      await AsyncStorage.setItem(
        Config.USER_DATA_KEY,
        JSON.stringify({ userId })
      );
    }

    return { token, userId };
  }

  /**
   * 사용자 로그아웃
   */
  public async logout(): Promise<void> {
    try {
      // 백엔드 로그아웃 요청
      await this.authApi.authLogout();
    } catch (error) {
      console.error("로그아웃 API 오류:", error);
    } finally {
      // 로컬 토큰 제거
      this.removeToken();
      await AsyncStorage.removeItem(Config.USER_DATA_KEY);
    }
  }

  // 회원가입
  signup(userData: any): Promise<ApiResponse<any>> {
    return this.post("/users/signup", userData);
  }

  // 매칭 관련 API
  getMatches(): Promise<ApiResponse<any>> {
    return this.get("/matching/matches");
  }

  // 특정 매치의 메시지 가져오기
  getMessages(
    matchId: number,
    page: number = 0,
    size: number = 10
  ): Promise<ApiResponse<any>> {
    return this.get(`/messages/matches/${matchId}`, {
      page: page.toString(),
      size: size.toString(),
    });
  }

  // 메시지 읽음 처리
  markMessagesAsRead(matchId: number): Promise<ApiResponse<any>> {
    return this.put(`/messages/matches/${matchId}/read`);
  }

  // 좋아요 보내기
  sendLike(toUserId: number): Promise<ApiResponse<any>> {
    return this.post("/matching/likes", { toUserId });
  }

  // 사용자 프로필 가져오기
  getUserProfile(userId: number): Promise<ApiResponse<any>> {
    return this.get(`/users/${userId}`);
  }

  // 현재 사용자 정보 가져오기
  async getCurrentUser(): Promise<ApiResponse<UserProfileResponse>> {
    try {
      const response = await this.authApi.getCurrentUser();
      return {
        data: response.data,
        success: true,
      };
    } catch (error) {
      const appError = convertApiError(error);
      return {
        success: false,
        error: appError.message,
      };
    }
  }
}

// 싱글톤 인스턴스 익스포트
export default ApiService.getInstance();
