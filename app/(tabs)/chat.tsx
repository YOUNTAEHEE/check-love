import { StyleSheet, FlatList, Image, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text, View } from "@/components/Themed";
import Colors from "@/constants/Colors";
import { useColorScheme } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";

// 가상 데이터
const CHATS = [
  {
    id: "1",
    name: "지민",
    image:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000",
    lastMessage: "안녕하세요! 지민님의 프로필이 정말 인상적이었어요.",
    time: "14:22",
    unread: 2,
  },
  {
    id: "2",
    name: "수현",
    image:
      "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=1000",
    lastMessage: "네, 좋아요. 내일 6시에 만나요!",
    time: "어제",
    unread: 0,
  },
  {
    id: "3",
    name: "준혁",
    image:
      "https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?q=80&w=1000",
    lastMessage: "저도 영화 보는 것을 좋아해요. 어떤 장르를 좋아하세요?",
    time: "어제",
    unread: 0,
  },
  {
    id: "4",
    name: "하은",
    image:
      "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=1000",
    lastMessage: "안녕하세요! 마침 저도 요리에 관심이 많아요.",
    time: "월요일",
    unread: 0,
  },
];

function ChatItem({ chat }) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const router = useRouter();

  return (
    <TouchableOpacity
      style={styles.chatItem}
      onPress={() => router.push(`/chat/${chat.id}`)}
    >
      <View style={styles.chatRow}>
        <View style={styles.avatarContainer}>
          <Image source={{ uri: chat.image }} style={styles.avatar} />
          {chat.unread > 0 && (
            <View
              style={[styles.unreadBadge, { backgroundColor: colors.primary }]}
            >
              <Text style={styles.unreadText}>{chat.unread}</Text>
            </View>
          )}
        </View>

        <View style={styles.chatContent}>
          <View style={styles.chatHeader}>
            <Text style={styles.chatName}>{chat.name}</Text>
            <Text style={styles.chatTime}>{chat.time}</Text>
          </View>
          <Text
            style={[
              styles.chatMessage,
              chat.unread > 0 ? styles.unreadMessage : null,
            ]}
            numberOfLines={1}
          >
            {chat.lastMessage}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>메시지</Text>
        <TouchableOpacity style={styles.iconButton}>
          <FontAwesome name="pencil" size={18} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {CHATS.length > 0 ? (
        <FlatList
          data={CHATS}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ChatItem chat={item} />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <FontAwesome
            name="comments-o"
            size={60}
            color={colors.tabIconDefault}
          />
          <Text style={styles.emptyTitle}>메시지가 없습니다</Text>
          <Text style={styles.emptySubtitle}>
            탐색 탭에서 프로필을 둘러보고 대화를 시작해보세요
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  iconButton: {
    height: 36,
    width: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  chatItem: {
    paddingVertical: 12,
  },
  chatRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    position: "relative",
    marginRight: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  unreadBadge: {
    position: "absolute",
    right: -2,
    top: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  unreadText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  chatContent: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  chatName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  chatTime: {
    fontSize: 12,
    opacity: 0.5,
  },
  chatMessage: {
    fontSize: 14,
    opacity: 0.7,
  },
  unreadMessage: {
    fontWeight: "500",
    opacity: 0.9,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    textAlign: "center",
    opacity: 0.6,
    lineHeight: 22,
  },
});
