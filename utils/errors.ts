import axios, { AxiosError } from "axios";

/**
 * 앱 전체에서 사용할 오류 인터페이스
 */
export interface AppError {
  /** 오류 코드 */
  code: string;
  /** 오류 메시지 */
  message: string;
  /** HTTP 상태 코드 */
  status?: number;
  /** 추가 오류 상세 정보 */
  details?: Record<string, any>;
}

/**
 * API 오류를 앱 오류 형식으로 변환
 */
export function convertApiError(error: unknown): AppError {
  // axios 오류 처리
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<any>;
    const status = axiosError.response?.status;

    // 상태 코드별 오류 처리
    switch (status) {
      case 401:
        return {
          code: "UNAUTHORIZED",
          message: "인증이 필요합니다. 다시 로그인해주세요.",
          status,
          details: axiosError.response?.data,
        };
      case 403:
        return {
          code: "FORBIDDEN",
          message: "이 작업을 수행할 권한이 없습니다.",
          status,
          details: axiosError.response?.data,
        };
      case 404:
        return {
          code: "NOT_FOUND",
          message: "요청한 리소스를 찾을 수 없습니다.",
          status,
          details: axiosError.response?.data,
        };
      case 500:
      case 502:
      case 503:
        return {
          code: "SERVER_ERROR",
          message: "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
          status,
          details: axiosError.response?.data,
        };
      default:
        // 응답 데이터에서 메시지 추출 시도
        const responseMessage =
          axiosError.response?.data?.message ||
          axiosError.response?.data?.error;
        return {
          code: "API_ERROR",
          message: responseMessage || "요청 처리 중 오류가 발생했습니다.",
          status,
          details: axiosError.response?.data,
        };
    }
  }

  // 일반 오류 처리
  if (error instanceof Error) {
    return {
      code: "UNKNOWN_ERROR",
      message: error.message || "알 수 없는 오류가 발생했습니다.",
    };
  }

  // 그 외 모든 오류
  return {
    code: "UNKNOWN_ERROR",
    message: "알 수 없는 오류가 발생했습니다.",
  };
}

/**
 * API 호출을 안전하게 실행하고 결과와 오류를 반환
 */
export async function safeApiCall<T>(
  apiCall: () => Promise<T>
): Promise<[T | null, AppError | null]> {
  try {
    const data = await apiCall();
    return [data, null];
  } catch (error) {
    console.error("API 호출 오류:", error);
    const appError = convertApiError(error);
    return [null, appError];
  }
}
