import React, { useEffect } from "react";
import { type FunctionComponent } from "react";
import { type ReactNode } from "react";
import { Input } from "./ui/input";
import { api } from "@/utils/api";
import { useRouter } from "next/router";
import { Loader2 } from "lucide-react";
import { type Chat, ChatRole } from "@prisma/client";
import { useToast } from "./ui/use-toast";
import { useChat } from "ai/react";
import { Label } from "@radix-ui/react-label";

type ChatComponentProps = {
  children?: ReactNode;
};

export const ChatComponent: FunctionComponent<ChatComponentProps> = () => {
  const toast = useToast();
  const router = useRouter();
  const { chatId } = router.query;
  const { mutate: saveChatMessage } = api.chats.saveChatMessage.useMutation();
  const { messages, input, handleInputChange, handleSubmit, setMessages } =
    useChat({
      api: `/api/openai`,
      body: {
        chatId: chatId as string,
      },
      onFinish(message) {
        saveChatMessage(
          {
            chatId: chatId as string,
            role: ChatRole.assistant,
            text: message.content,
          },
          {
            onError(error) {
              toast.toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
              });
            },
          }
        );
      },
    });
  const { data: chatsData } = api.chats.getChats.useQuery();
  const { data: messagesData, isFetching: isMessagesLoading } =
    api.chats.getMessages.useQuery(
      {
        chatId: chatId as string,
      },
      {
        enabled: !!chatId,
      }
    );

  const selectedChat = chatsData?.find((chat) => chat.id === chatId) as Chat;

  const handleSubmitInFunction = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    saveChatMessage(
      {
        chatId: chatId as string,
        role: ChatRole.user,
        text: input,
      },
      {
        onError(error) {
          toast.toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
        },
      }
    );
    handleSubmit(e);
  };

  useEffect(() => {
    if (!messagesData) return;
    // take the presaved messages and add them to messages;
    setMessages(
      messagesData.map((message) => ({
        content: message.text,
        id: message.id,
        role: message.role,
        createdAt: message.createdAt,
      }))
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messagesData]);

  // this is the main component that represents a chat
  // it is either empty or has messages
  // if we are on a page that has a chat id, then we
  // fetch the messages for that chatId
  return (
    <div className="flex h-screen max-h-screen w-full flex-col justify-between">
      {/* the chat component label */}
      <div className="flex flex-row border-b p-4">
        Selected chat:
        <Label className="ml-2 font-bold">
          {selectedChat && selectedChat.name}
        </Label>
      </div>
      {/* the container that has all the messages */}
      <div className="flex h-full w-full flex-col overflow-y-scroll px-2">
        {messages.map((message) => {
          const { content, id, role } = message;
          return (
            <div
              key={id}
              className={`${
                role !== ChatRole.assistant && "bg-accent text-end"
              } my-2 w-full rounded-md border p-2`}
            >
              <h1>{role === ChatRole.assistant ? "Assistant" : "You"}</h1>
              <p className="text-sm">{content}</p>
            </div>
          );
        })}
        {isMessagesLoading && (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="animate-spin" size={64} />
          </div>
        )}
      </div>
      {/* the main input into the chat */}
      <div className="h-[55px] w-full bg-accent px-2">
        <form className="w-full" onSubmit={handleSubmitInFunction}>
          <Input
            className="h-[55px] w-full"
            placeholder="Say something..."
            value={input}
            onChange={handleInputChange}
          />
        </form>
      </div>
    </div>
  );
};
