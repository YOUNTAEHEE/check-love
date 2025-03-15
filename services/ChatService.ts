import AsyncStorage from "@react-native-async-storage/async-storage";
// import { Client } from "@stomp/stompjs"; // 패키지 설치 시 주석 해제
import Config from "../constants/Config";

// Message type definition
export interface ChatMessage {
  type: "CHAT" | "JOIN" | "LEAVE";
  matchId: number;
  senderId: number;
  receiverId: number;
  content: string;
  timestamp?: string;
}

// 임시 모의 클라이언트 (패키지 설치 전까지만 사용)
class MockClient {
  onConnect: () => void = () => {};
  onDisconnect: () => void = () => {};
  onStompError: (frame: any) => void = () => {};

  activate() {
    console.log("MockClient: 연결 시도 (실제 연결되지 않음)");
    // 연결 시뮬레이션 - 지연 시간 단축
    setTimeout(() => this.onConnect(), 100);
  }

  deactivate() {
    console.log("MockClient: 연결 해제 (모의 구현)");
    this.onDisconnect();
  }

  subscribe(destination: string, callback: any) {
    console.log(`MockClient: ${destination} 구독 (모의 구현)`);
    // 구독 시 자동 메시지 없음
    return {
      unsubscribe: () => {
        console.log(`MockClient: ${destination} 구독 해제 (모의 구현)`);
      },
    };
  }

  publish(options: { destination: string; body: string }) {
    console.log(`MockClient: 메시지 전송 (모의 구현)`, options);
    // 성공 여부만 반환, 자동 응답 없음
    return true;
  }
}

class ChatService {
  private client: any = null;
  private subscriptions: { [key: string]: any } = {};
  private connected: boolean = false;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private userId: number | null = null;

  // 연결 상태 확인
  isConnected(): boolean {
    return this.connected;
  }

  // 사용자 ID 설정
  setUserId(userId: number) {
    this.userId = userId;
  }

  // WebSocket 연결 초기화
  async initialize() {
    try {
      // 토큰 가져오기
      const token = await AsyncStorage.getItem(Config.TOKEN_KEY);

      if (!token) {
        console.error("인증 토큰이 없습니다.");
        return;
      }

      // STOMP 클라이언트 대신 모의 클라이언트 사용
      this.client = new MockClient();

      // 연결 이벤트 핸들러
      this.client.onConnect = this.onConnect.bind(this);
      this.client.onDisconnect = this.onDisconnect.bind(this);
      this.client.onStompError = this.onError.bind(this);

      // 연결 시작
      this.client.activate();

      // 모의 연결 성공 알림 - 실제 환경에서는 필요 없음
      console.log(
        "임시 구현: WebSocket 패키지가 설치되지 않아 모의 클라이언트를 사용합니다."
      );
      console.log("실제 메시지 전송은 되지 않지만 UI 테스트는 가능합니다.");
    } catch (error) {
      console.error("WebSocket 초기화 오류:", error);
      this.scheduleReconnect();
    }
  }

  // 연결 성공 핸들러
  private onConnect() {
    console.log("WebSocket 연결 성공");
    this.connected = true;

    // 사용자 ID가 설정된 경우 개인 메시지 구독
    if (this.userId) {
      this.subscribeToPersonalMessages(this.userId);
    }
  }

  // 연결 해제 핸들러
  private onDisconnect() {
    console.log("WebSocket 연결 해제");
    this.connected = false;
    this.scheduleReconnect();
  }

  // 오류 핸들러
  private onError(frame: any) {
    console.error("STOMP 오류:", frame);
    this.connected = false;
    this.scheduleReconnect();
  }

  // 재연결 스케줄링
  private scheduleReconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    this.reconnectTimer = setTimeout(() => {
      console.log("WebSocket 재연결 시도...");
      this.initialize();
    }, 5000);
  }

  // 개인 메시지 구독
  subscribeToPersonalMessages(userId: number) {
    if (!this.client || !this.connected) {
      console.error("WebSocket이 연결되지 않았습니다.");
      return;
    }

    this.userId = userId;
    const destination = `/user/${userId}/queue/messages`;

    // 기존 구독이 있으면 해제
    if (this.subscriptions[destination]) {
      this.subscriptions[destination].unsubscribe();
    }

    // 새 구독 생성
    this.subscriptions[destination] = this.client.subscribe(
      destination,
      (message) => {
        try {
          const receivedMessage = JSON.parse(message.body);
          // 메시지 수신 이벤트를 상위 컴포넌트로 전달할 수 있습니다
          if (this.onMessageCallback) {
            this.onMessageCallback(receivedMessage);
          }
        } catch (error) {
          console.error("메시지 파싱 오류:", error);
        }
      }
    );

    console.log(`사용자 ${userId}의 메시지 구독 완료`);
  }

  // 메시지 수신 콜백
  private onMessageCallback: ((message: ChatMessage) => void) | null = null;

  // 메시지 수신 핸들러 등록
  onMessage(callback: (message: ChatMessage) => void) {
    this.onMessageCallback = callback;
  }

  // 메시지 전송
  sendMessage(message: ChatMessage) {
    if (!this.client || !this.connected) {
      console.error("WebSocket이 연결되지 않았습니다.");
      return false;
    }

    try {
      this.client.publish({
        destination: "/app/chat",
        body: JSON.stringify(message),
      });
      return true;
    } catch (error) {
      console.error("메시지 전송 오류:", error);
      return false;
    }
  }

  // 연결 해제
  disconnect() {
    if (this.client) {
      // 모든 구독 해제
      Object.values(this.subscriptions).forEach((subscription) => {
        subscription.unsubscribe();
      });
      this.subscriptions = {};

      // 클라이언트 비활성화
      this.client.deactivate();
      this.client = null;
      this.connected = false;
    }

    // 재연결 타이머 취소
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }
}

// 싱글톤 인스턴스
export default new ChatService();
