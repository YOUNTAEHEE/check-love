import React, { useState } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  FlatList,
  Image,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Text, View } from "@/components/Themed";
import Colors from "@/constants/Colors";
import { useColorScheme } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";

// 더미 데이터
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

      <View>
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
  const user = USERS[id as string] || {
    name: "사용자",
    image: "https://via.placeholder.com/150",
  };

  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSend = () => {
    if (!inputText.trim()) return;

    setIsSending(true);

    const newMessage = {
      id: Date.now().toString(),
      text: inputText,
      senderId: "me",
      timestamp: Date.now(),
    };

    setMessages((prev) => [newMessage, ...prev]);
    setInputText("");

    // 자동 응답 시뮬레이션 (실제 앱에서는 서버 통신)
    setTimeout(() => {
      const autoReply = {
        id: (Date.now() + 1).toString(),
        text: "네, 알겠습니다. 더 이야기해볼까요?",
        senderId: "other",
        timestamp: Date.now() + 1,
      };

      setMessages((prev) => [autoReply, ...prev]);
      setIsSending(false);
    }, 1500);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <FontAwesome name="arrow-left" size={20} color={colors.text} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.profileContainer}
          onPress={() => router.push(`/profile/${id}`)}
        >
          <Image source={{ uri: user.image }} style={styles.headerAvatar} />
          <Text style={styles.headerName}>{user.name}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.moreButton}>
          <FontAwesome name="ellipsis-v" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <MessageBubble message={item} user={user} />}
        inverted
        contentContainerStyle={styles.messageList}
        showsVerticalScrollIndicator={false}
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 10,
  },
  backButton: {
    padding: 10,
  },
  moreButton: {
    padding: 10,
  },
  profileContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 8,
  },
  headerName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  messageList: {
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  messageRow: {
    flexDirection: "row",
    marginBottom: 16,
    maxWidth: "80%",
  },
  myMessageRow: {
    alignSelf: "flex-end",
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
});
