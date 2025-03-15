import AsyncStorage from "@react-native-async-storage/async-storage";
import Config from "../constants/Config";

// API 응답 타입
interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}

class ApiService {
  private token: string | null = null;

  // 토큰 설정
  async setToken(token: string) {
    this.token = token;
    await AsyncStorage.setItem(Config.TOKEN_KEY, token);
  }

  // 토큰 가져오기
  async getToken(): Promise<string | null> {
    if (!this.token) {
      this.token = await AsyncStorage.getItem(Config.TOKEN_KEY);
    }
    return this.token;
  }

  // 토큰 제거 (로그아웃)
  async removeToken() {
    this.token = null;
    await AsyncStorage.removeItem(Config.TOKEN_KEY);
    await AsyncStorage.removeItem("userData");
  }

  // 기본 HTTP 요청 메서드
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const token = await this.getToken();
      const url = `${Config.API_URL}${endpoint}`;

      const headers: HeadersInit = {
        "Content-Type": "application/json",
        ...options.headers,
      };

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (response.ok) {
        const data = await response.json();
        return { data, success: true };
      } else if (response.status === 401) {
        // 인증 오류 처리
        await this.removeToken();
        return {
          error: "인증이 필요합니다. 다시 로그인해주세요.",
          success: false,
        };
      } else {
        const errorData = await response.json().catch(() => ({}));
        return {
          error: errorData.message || "서버 오류가 발생했습니다.",
          success: false,
        };
      }
    } catch (error) {
      console.error("API 요청 오류:", error);
      return {
        error: "네트워크 오류가 발생했습니다.",
        success: false,
      };
    }
  }

  // GET 요청
  get<T>(
    endpoint: string,
    params?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    const url = params
      ? `${endpoint}?${new URLSearchParams(params)}`
      : endpoint;
    return this.request<T>(url, { method: "GET" });
  }

  // POST 요청
  post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PUT 요청
  put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // DELETE 요청
  delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }

  // 인증 관련 API
  async login(
    email: string,
    password: string
  ): Promise<ApiResponse<{ accessToken: string; userId: number }>> {
    const response = await this.post<{ accessToken: string; userId: number }>(
      "/auth/login",
      { email, password }
    );

    if (response.success && response.data?.accessToken) {
      await this.setToken(response.data.accessToken);

      // 사용자 정보 저장
      if (response.data.userId) {
        await AsyncStorage.setItem(
          "userData",
          JSON.stringify({
            userId: response.data.userId,
          })
        );
      }
    }

    return response;
  }

  // 로그아웃
  async logout(): Promise<ApiResponse<any>> {
    try {
      // 클라이언트에서 토큰 제거
      await this.removeToken();

      // 서버에 로그아웃 요청 - 필요한 경우 주석 해제
      // const response = await this.post<any>('/auth/logout');
      // return response;

      // 서버 엔드포인트가 없는 경우 클라이언트 측에서만 처리
      return { success: true };
    } catch (error) {
      console.error("로그아웃 오류:", error);
      return {
        error: "로그아웃 중 오류가 발생했습니다.",
        success: false,
      };
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
}

// 싱글톤 인스턴스
export default new ApiService();
