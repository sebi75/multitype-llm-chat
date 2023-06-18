import { ChatsList } from "@/components/ChatsList";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { api } from "@/utils/api";
import React, { type FunctionComponent, type ReactNode } from "react";
import { ObjectsList } from "./ObjectsList";
import { useRouter } from "next/router";

type ChatLayoutWrapperProps = {
  children: ReactNode;
};

export const ChatLayoutWrapper: FunctionComponent<ChatLayoutWrapperProps> = ({
  children,
}) => {
  const router = useRouter();
  const { chatId } = router.query;
  const { data: chatsData, isLoading: isChatsLoading } =
    api.chats.getChats.useQuery();

  return (
    <div className="flex max-h-screen min-h-screen flex-row justify-between">
      {/* the section of the chats */}
      <div className="w-[25%] min-w-[300px] border-r">
        {isChatsLoading || !chatsData ? (
          <div>
            <LoadingSpinner />
          </div>
        ) : (
          <ChatsList chats={chatsData} />
        )}
      </div>
      {/* The section of the currently open chat */}
      {/* here we want to insetr the chat component */}
      <div className="h-ful w-full">{children}</div>
      {/* the section of the chat objects list */}
      {chatId && (
        <div className="w-[30%] border-l">
          <ObjectsList />
        </div>
      )}
    </div>
  );
};
