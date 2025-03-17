/**
 * 애플리케이션 설정 상수
 */
const Config = {
  // API 관련 설정
  API_URL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080',
  
  // 스토리지 키
  TOKEN_KEY: 'token',
  USER_DATA_KEY: 'userData',
  
  // 기타 설정
  DEFAULT_TIMEOUT: 15000,
};

export default Config;
