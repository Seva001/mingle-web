import type { Metadata } from "next";
import { LiveChatsView } from "@/components/member/live-chats-view";
import { getCurrentMemberContext, getMyConversations } from "@/lib/messaging/server";

export const metadata: Metadata = { title: "Chats" };

export default async function Page() {
  const [member, conversations] = await Promise.all([getCurrentMemberContext(), getMyConversations()]);
  if (!member) return <div className="flex flex-col gap-8"><h1 className="font-display text-headline">Chats</h1><p className="text-sm text-muted">Sign in with an eligible MINGLE member account to view your conversations.</p></div>;
  return <div className="flex flex-col gap-8"><h1 className="font-display text-headline">Chats</h1><LiveChatsView conversations={conversations} memberId={member.id} locale={member.locale} timezone={member.timezone} /></div>;
}
