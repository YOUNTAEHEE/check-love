import Config from "@/constants/Config";
import { FontAwesome } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Tabs, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { useColorScheme } from "react-native";

import Colors from "@/constants/Colors";

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
  const colorScheme = useColorScheme() ?? "light";
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // 로그인 상태 확인
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        setIsLoading(true);
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
        } else {
          // 로그인 된 상태에서 홈 화면에 접근하면 탐색 화면으로 리다이렉트
          if (
            router.pathname === "/(tabs)" ||
            router.pathname === "/(tabs)/index"
          ) {
            router.replace("/(tabs)/explore");
          }
        }
      } catch (error) {
        console.error("로그인 상태 확인 중 오류:", error);
        setIsLoggedIn(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkLoginStatus();
  }, [router]);

  // 로딩 중일 때는 아무것도 표시하지 않음
  if (isLoading) {
    return null;
  }

  // 로그인 안 된 상태에서는 홈 화면으로 리다이렉트 (탭바 없이)
  if (!isLoggedIn) {
    return (
      <Tabs
        screenOptions={{
          tabBarStyle: {
            display: "none", // 탭바 숨김
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
      </Tabs>
    );
  }

  // 로그인 된 상태에서는 탐색, 채팅, 프로필 메뉴만 표시 (홈 제외)
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
      {/* 로그인 후에는 홈 탭을 제외하고 표시 */}
      <Tabs.Screen
        name="explore"
        options={{
          title: "탐색",
          tabBarIcon: ({ color }) => <TabBarIcon name="search" color={color} />,
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
          tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />,
        }}
      />

      {/* 로그인 후에도 홈 화면은 필요하지만 탭에는 표시하지 않음 */}
      <Tabs.Screen
        name="index"
        options={{
          href: null, // 탭바에서 숨김
        }}
      />
    </Tabs>
  );
}
