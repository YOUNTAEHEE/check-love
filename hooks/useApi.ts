import { useAuth } from "@/contexts/AuthContext";
import ApiService from "@/services/ApiService";
import { AppError, safeApiCall } from "@/utils/errors";
import { useEffect } from "react";

/**
 * API 서비스를 React 훅으로 제공하는 커스텀 훅
 *
 * 이 훅은 AuthContext의 토큰과 자동으로 동기화되며,
 * 컴포넌트에 타입 안전한 API 클라이언트를 제공합니다.
 */
export function useApi() {
  const { token } = useAuth();

  // 토큰 자동 동기화
  useEffect(() => {
    if (token) {
      ApiService.setToken(token);
    }
  }, [token]);

  /**
   * 안전한 API 호출 유틸리티
   * 에러를 AppError 형식으로 변환하여 [데이터, 에러] 형태로 반환합니다.
   */
  const callSafely = async <T>(
    apiCall: () => Promise<T>
  ): Promise<[T | null, AppError | null]> => {
    return safeApiCall(apiCall);
  };

  return {
    // API 클라이언트
    authApi: ApiService.authApi,

    // 원시 axios 인스턴스
    axios: ApiService.getAxiosInstance(),

    // 유틸리티 메서드
    login: ApiService.login.bind(ApiService),
    logout: ApiService.logout.bind(ApiService),

    // 헤더 설정 등 유틸리티
    setHeader: ApiService.setHeader.bind(ApiService),
    setBaseUrl: ApiService.setBaseUrl.bind(ApiService),

    // 에러 처리 유틸리티
    callSafely,
  };
}

export default useApi;
