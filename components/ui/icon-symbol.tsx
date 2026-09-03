import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { ComponentProps } from "react";
import { OpaqueColorValue, type StyleProp, type TextStyle } from "react-native";

type IconMapping = Record<string, ComponentProps<typeof MaterialIcons>["name"]>;

const MAPPING: IconMapping = {
  "house.fill": "home",
  "paperplane.fill": "send",
  "chevron.left.forwardslash.chevron.right": "code",
  "chevron.right": "chevron-right",
  wifi: "wifi",
  smartphone: "smartphone",
  search: "search",
  memory: "memory",
  hub: "hub",
  chat: "chat",
  router: "router",
  refresh: "refresh",
  lock: "lock",
  terminal: "terminal",
  folder: "folder",
  check: "check",
};

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: keyof typeof MAPPING;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: string;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
