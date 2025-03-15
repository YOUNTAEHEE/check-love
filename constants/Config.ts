// 개발 환경에서 사용할 API 연결 설정
// 실제 환경에서는 실제 서버 URL로 교체해야 합니다

// localhost는 디바이스에서 실행할 때 다른 IP로 접근해야 할 수 있습니다
// Android 에뮬레이터: 10.0.2.2
// iOS 시뮬레이터: localhost
// 실제 디바이스: 네트워크 상의 컴퓨터 IP (예: 192.168.0.xxx)

// 다음 중 사용하는 환경에 맞게 선택하세요:
const DEV_API_URL_ANDROID = "http://10.0.2.2:8080/api"; // Android 에뮬레이터 기준
const DEV_API_URL_IOS = "http://localhost:8080/api"; // iOS 시뮬레이터 기준
const DEV_API_URL_DEVICE = "http://localhost:8080/api"; // 실제 디바이스 (로컬 서버 기준)

const DEV_WS_URL_ANDROID = "ws://10.0.2.2:8080/ws"; // WebSocket Android 에뮬레이터 기준
const DEV_WS_URL_IOS = "ws://localhost:8080/ws"; // WebSocket iOS 시뮬레이터 기준
const DEV_WS_URL_DEVICE = "ws://localhost:8080/ws"; // WebSocket 실제 디바이스 (로컬 서버 기준)

// 배포 환경 URL (예시)
const PROD_API_URL = "https://api.checklove.com/api";
const PROD_WS_URL = "wss://api.checklove.com/ws";

// 현재 환경에 따라 URL 선택
const IS_PRODUCTION = false; // 개발 중에는 false로 설정

// 현재 사용할 API URL 선택 (환경에 맞게 수정하세요)
const CURRENT_DEV_API_URL = DEV_API_URL_DEVICE; // 현재 환경에 맞는 URL 선택
const CURRENT_DEV_WS_URL = DEV_WS_URL_DEVICE; // 현재 환경에 맞는 WebSocket URL 선택

export default {
  API_URL: IS_PRODUCTION ? PROD_API_URL : CURRENT_DEV_API_URL,
  WS_URL: IS_PRODUCTION ? PROD_WS_URL : CURRENT_DEV_WS_URL,
  TOKEN_KEY: "auth_token",
};
