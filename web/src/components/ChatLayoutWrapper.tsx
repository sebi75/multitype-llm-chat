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
      <div className="w-[20%] min-w-[200px] border-r">
        {isChatsLoading || !chatsData ? (
          <div>
            <LoadingSpinner />
          </div>
        ) : (
          <ChatsList chats={chatsData} />
        )}
      </div>
      <div className="h-ful w-full">{children}</div>
      {chatId && (
        <div className="w-[35%] border-l">
          <ObjectsList />
        </div>
      )}
    </div>
  );
};
