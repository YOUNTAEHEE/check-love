import { Text, View } from "@/components/Themed";
import Colors from "@/constants/Colors";
import ApiService from "@/services/ApiService";
import ChatService from "@/services/ChatService";
import { FontAwesome } from "@expo/vector-icons";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  useColorScheme,
} from "react-native";

// 더미 데이터 - 실제 구현 시 서버에서 가져오는 데이터로 교체할 예정
const USERS = {
  "1": {
    name: "지민",
    image:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000",
  },
  "2": {
    name: "수현",
    image:
      "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=1000",
  },
  "3": {
    name: "준혁",
    image:
      "https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?q=80&w=1000",
  },
  "4": {
    name: "하은",
    image:
      "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=1000",
  },
};

// 더미 메시지 데이터
const INITIAL_MESSAGES = [
  {
    id: "1",
    text: "안녕하세요! 프로필을 보고 연락드립니다.",
    senderId: "me",
    timestamp: Date.now() - 5 * 60000,
  },
  {
    id: "2",
    text: "안녕하세요! 반갑습니다 :)",
    senderId: "other",
    timestamp: Date.now() - 4 * 60000,
  },
  {
    id: "3",
    text: "프로필에서 취미가 여행이라고 하셨는데, 어떤 여행을 좋아하시나요?",
    senderId: "me",
    timestamp: Date.now() - 3 * 60000,
  },
  {
    id: "4",
    text: "저는 자연을 느낄 수 있는 여행을 좋아해요. 특히 산이나 바다가 있는 곳이면 더 좋아요! 동현님은 어떤 여행을 좋아하시나요?",
    senderId: "other",
    timestamp: Date.now() - 2 * 60000,
  },
];

// 메시지 버블 컴포넌트
function MessageBubble({ message, user }) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const isMe = message.senderId === "me";

  // 타임스탬프를 시간 형식으로 변환
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "오후" : "오전";
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;

    return `${ampm} ${formattedHours}:${formattedMinutes}`;
  };

  return (
    <View
      style={[
        styles.messageRow,
        isMe ? styles.myMessageRow : styles.otherMessageRow,
      ]}
    >
      {!isMe && <Image source={{ uri: user.image }} style={styles.avatar} />}

      <View
        style={{
          maxWidth: "80%",
          alignItems: isMe ? "flex-end" : "flex-start",
          alignSelf: isMe ? "flex-end" : "flex-start",
        }}
      >
        <View
          style={[
            styles.messageBubble,
            isMe
              ? [styles.myBubble, { backgroundColor: colors.primary }]
              : [
                  styles.otherBubble,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ],
          ]}
        >
          <Text
            style={[
              styles.messageText,
              { color: isMe ? "white" : colors.text },
            ]}
            numberOfLines={0}
          >
            {message.text}
          </Text>
        </View>

        <Text style={styles.timestamp}>{formatTime(message.timestamp)}</Text>
      </View>
    </View>
  );
}

// 날짜 구분선 컴포넌트
function DateDivider({ date }) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  return (
    <View style={styles.dateDividerContainer}>
      <View style={[styles.dateLine, { backgroundColor: colors.border }]} />
      <View style={[styles.dateContainer, { backgroundColor: colors.subtle }]}>
        <Text style={styles.dateText}>{date}</Text>
      </View>
      <View style={[styles.dateLine, { backgroundColor: colors.border }]} />
    </View>
  );
}

export default function ChatDetailScreen() {
  const { id } = useLocalSearchParams();
  const matchId = typeof id === "string" ? parseInt(id, 10) : 1;

  // 실제 환경에서는 API에서 사용자 정보를 가져옵니다
  const user = USERS[id as string] || {
    name: "사용자",
    image: "https://via.placeholder.com/150",
  };

  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const flatListRef = useRef<FlatList>(null);

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const navigation = useNavigation();

  // 화면 타이틀 설정
  useLayoutEffect(() => {
    navigation.setOptions({
      title: user.name,
    });
  }, [navigation, user.name]);

  // 채팅 서비스 초기화 및 메시지 수신 설정
  useEffect(() => {
    const currentUserId = 1; // 임시, 실제로는 로그인 정보에서 가져옵니다

    // 실시간 메시지 수신 설정
    ChatService.setUserId(currentUserId);

    if (!ChatService.isConnected()) {
      ChatService.initialize();
    }

    // 메시지 수신 이벤트 핸들러 등록
    ChatService.onMessage((receivedMessage) => {
      setMessages((prevMessages) => [receivedMessage, ...prevMessages]);
    });

    // 초기 메시지 로드
    loadMessages(true);

    // 메시지를 읽음으로 표시
    markMessagesAsRead();

    return () => {
      // 필요한 경우 정리 작업 수행
    };
  }, [matchId]);

  // 초기 메시지 로드 또는 추가 메시지 로드
  const loadMessages = async (initial = false) => {
    if (initial) {
      setLoading(true);
      setPage(0);
    }

    if (!hasMore && !initial) return;

    try {
      const currentPage = initial ? 0 : page;
      const response = await ApiService.getMessages(matchId, currentPage);

      if (response.success && response.data) {
        const newMessages = response.data.messages || [];
        setMessages((prevMessages) =>
          initial ? newMessages : [...prevMessages, ...newMessages]
        );
        setHasMore(
          newMessages.length > 0 && currentPage < response.data.totalPages - 1
        );
        setPage(currentPage + 1);
      } else {
        // API 오류 또는 개발 테스트용 더미 데이터 사용
        console.log("API 응답 없음, 더미 데이터 사용");
        // 첫 로드 시에만 더미 데이터 사용, 추가 로드 시에는 빈 배열
        setMessages(initial ? INITIAL_MESSAGES : [...messages]);
        setHasMore(false);
      }
    } catch (error) {
      console.error("메시지 로딩 오류:", error);
      // 오류 발생 시 더미 데이터 사용
      console.log("API 오류, 더미 데이터 사용");
      setMessages(initial ? INITIAL_MESSAGES : [...messages]);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  // 메시지를 읽음으로 표시
  const markMessagesAsRead = async () => {
    try {
      await ApiService.markMessagesAsRead(matchId);
    } catch (error) {
      console.error("메시지 읽음 표시 오류:", error);
    }
  };

  // 메시지 전송
  const handleSend = async () => {
    if (!inputText.trim()) return;

    setIsSending(true);
    const messageText = inputText.trim();
    setInputText("");

    // 현재 사용자 ID (실제로는 로그인한 사용자 ID)
    const currentUserId = 1;
    // 상대방 ID (매치 정보에서 가져와야 함)
    const otherUserId = 2;

    // 로컬 UI 업데이트를 위한 메시지 객체
    const localMessage = {
      id: Date.now().toString(),
      text: messageText,
      senderId: "me",
      timestamp: Date.now(),
    };

    // UI 업데이트
    setMessages((prev) => [localMessage, ...prev]);

    try {
      // 실제 메시지 전송 (WebSocket)
      const chatMessage: ChatMessage = {
        type: "CHAT",
        matchId,
        senderId: currentUserId,
        receiverId: otherUserId,
        content: messageText,
      };

      const sent = ChatService.sendMessage(chatMessage);

      if (!sent) {
        throw new Error("메시지 전송 실패");
      }

      // 실제 WebSocket이 연결되면 자동 응답 코드는 제거해야 합니다
      // 현재는 임시로 주석 처리합니다
      /* 
      setTimeout(() => {
        const autoReply = {
          id: (Date.now() + 1).toString(),
          text: "네, 알겠습니다. 더 이야기해볼까요?",
          senderId: "other",
          timestamp: Date.now() + 1,
        };
        setMessages((prev) => [autoReply, ...prev]);
      }, 1500);
      */
    } catch (error) {
      console.error("메시지 전송 오류:", error);
      Alert.alert(
        "오류",
        "메시지를 보낼 수 없습니다. 나중에 다시 시도해주세요."
      );

      // 실패 시 메시지 제거 또는 표시 변경
      setMessages((prev) => prev.filter((msg) => msg.id !== localMessage.id));
    } finally {
      setIsSending(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <MessageBubble message={item} user={user} />}
        inverted
        contentContainerStyle={styles.messageList}
        showsVerticalScrollIndicator={false}
        onEndReached={() => !loading && hasMore && loadMessages()}
        onEndReachedThreshold={0.3}
        ListFooterComponent={
          hasMore ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.loadingText}>메시지 로딩 중...</Text>
            </View>
          ) : null
        }
        ListHeaderComponent={
          <View style={styles.typingContainer}>
            {isSending && (
              <View
                style={[
                  styles.typingBubble,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
              >
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.typingText}>입력 중...</Text>
              </View>
            )}
          </View>
        }
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={100}
        style={[styles.inputContainer, { borderColor: colors.border }]}
      >
        <TouchableOpacity style={styles.attachButton}>
          <FontAwesome name="plus" size={20} color={colors.primary} />
        </TouchableOpacity>

        <TextInput
          style={[styles.input, { backgroundColor: colors.subtle }]}
          placeholder="메시지를 입력하세요..."
          placeholderTextColor={colors.tabIconDefault}
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={500}
        />

        <TouchableOpacity
          style={[
            styles.sendButton,
            {
              backgroundColor: inputText.trim()
                ? colors.primary
                : colors.subtle,
              opacity: inputText.trim() ? 1 : 0.7,
            },
          ]}
          onPress={handleSend}
          disabled={!inputText.trim() || isSending}
        >
          <FontAwesome
            name="paper-plane"
            size={16}
            color={inputText.trim() ? "white" : colors.tabIconDefault}
          />
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messageList: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    paddingTop: 10,
  },
  messageRow: {
    flexDirection: "row",
    marginBottom: 16,
    width: "100%",
  },
  myMessageRow: {
    alignSelf: "flex-end",
    justifyContent: "flex-end",
  },
  otherMessageRow: {
    alignSelf: "flex-start",
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    alignSelf: "flex-end",
  },
  messageBubble: {
    padding: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "transparent",
  },
  myBubble: {
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
    flexWrap: "wrap",
  },
  timestamp: {
    fontSize: 11,
    opacity: 0.5,
    marginTop: 4,
    alignSelf: "flex-end",
  },
  typingContainer: {
    alignItems: "flex-start",
    marginBottom: 16,
  },
  typingBubble: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  typingText: {
    fontSize: 13,
    marginLeft: 6,
    opacity: 0.7,
  },
  dateDividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 16,
  },
  dateLine: {
    flex: 1,
    height: 1,
  },
  dateContainer: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginHorizontal: 8,
  },
  dateText: {
    fontSize: 12,
    fontWeight: "500",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  attachButton: {
    padding: 10,
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 120,
    marginHorizontal: 8,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
  },
  loadingText: {
    fontSize: 13,
    marginLeft: 6,
    opacity: 0.7,
  },
});
