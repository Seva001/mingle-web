import { Compass, MessageCircle, User, Users, type LucideIcon } from "lucide-react";

export type MemberNavItem = { href: string; label: string; icon: LucideIcon };

/** Brief §11: floating bottom navigation = Discover, Connections, Chats, Profile. */
export const memberNavItems: readonly MemberNavItem[] = [
  { href: "/discover", label: "Discover", icon: Compass },
  { href: "/connections", label: "Connections", icon: Users },
  { href: "/chats", label: "Chats", icon: MessageCircle },
  { href: "/profile", label: "Profile", icon: User },
];
