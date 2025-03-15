import Config from "@/constants/Config";
import { FontAwesome } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Tabs, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";

import Colors from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

/**
 * You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
 */
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>["name"];
  color: string;
}) {
  return <FontAwesome size={24} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  // 로그인 상태 확인
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const token = await AsyncStorage.getItem(Config.TOKEN_KEY);
        setIsLoggedIn(!!token);

        // 로그인이 되어있지 않은데 탐색, 채팅, 프로필 페이지에 접근하려고 할 경우 홈으로 리다이렉트
        if (!token) {
          const currentPath = router.pathname;
          if (
            currentPath.includes("/explore") ||
            currentPath.includes("/chat") ||
            currentPath.includes("/profile")
          ) {
            router.replace("/(tabs)");
          }
        }
      } catch (error) {
        console.error("로그인 상태 확인 중 오류:", error);
        setIsLoggedIn(false);
      }
    };

    checkLoginStatus();
  }, [router]);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].primary,
        tabBarInactiveTintColor: Colors[colorScheme ?? "light"].tabIconDefault,
        tabBarStyle: {
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "홈",
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
        }}
      />

      {isLoggedIn && (
        <>
          <Tabs.Screen
            name="explore"
            options={{
              title: "탐색",
              tabBarIcon: ({ color }) => (
                <TabBarIcon name="search" color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="chat"
            options={{
              title: "채팅",
              tabBarIcon: ({ color }) => (
                <TabBarIcon name="comments" color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="profile"
            options={{
              title: "프로필",
              tabBarIcon: ({ color }) => (
                <TabBarIcon name="user" color={color} />
              ),
            }}
          />
        </>
      )}
    </Tabs>
  );
}
