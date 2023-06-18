import { ChatComponent } from "@/components/ChatComponent";
import { ChatLayoutWrapper } from "@/components/ChatLayoutWrapper";
import { CustomHead } from "@/components/CustomHead";
import React from "react";
import { useRouter } from "next/router";
import { api } from "@/utils/api";

export default function SpecificChat() {
  const router = useRouter();
  const { chatId } = router.query;
  const { data: chatsData } = api.chats.getChats.useQuery();
  const selectedChats = chatsData?.find((chat) => chat.id === chatId);

  return (
    <>
      <CustomHead title={selectedChats?.name ?? "Chat"}></CustomHead>
      <ChatLayoutWrapper>
        <ChatComponent />
      </ChatLayoutWrapper>
    </>
  );
}
