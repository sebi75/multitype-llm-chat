import { ChatComponent } from "@/components/ChatComponent";
import { ChatLayoutWrapper } from "@/components/ChatLayoutWrapper";
import { useRouter } from "next/router";
import React from "react";

export default function Chats() {
  const router = useRouter();
  const { chatId } = router.query;

  return (
    <ChatLayoutWrapper>
      {!chatId ? (
        <div>
          <h1>Create a new chat to use the app.</h1>
        </div>
      ) : (
        <ChatComponent />
      )}
    </ChatLayoutWrapper>
  );
}
