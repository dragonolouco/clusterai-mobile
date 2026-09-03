import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Platform } from "react-native";
import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";

export default function TabLayout() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const bottomPadding = Platform.OS === "web" ? 12 : Math.max(insets.bottom, 8);
  return <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: colors.tint, tabBarButton: HapticTab, tabBarStyle: { paddingTop: 8, paddingBottom: bottomPadding, height: 56 + bottomPadding, backgroundColor: colors.background, borderTopColor: colors.border, borderTopWidth: 0.5 } }}>
    <Tabs.Screen name="index" options={{ title: "Cluster", tabBarIcon: ({ color }) => <IconSymbol size={24} name="hub" color={color} /> }} />
    <Tabs.Screen name="chat" options={{ title: "Chat", tabBarIcon: ({ color }) => <IconSymbol size={24} name="chat" color={color} /> }} />
    <Tabs.Screen name="model" options={{ title: "Modelos", tabBarIcon: ({ color }) => <IconSymbol size={24} name="memory" color={color} /> }} />
  </Tabs>;
}
