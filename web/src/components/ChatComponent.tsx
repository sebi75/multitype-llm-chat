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
import { z } from "zod";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useSession } from "next-auth/react";
import AutoScrollContainer from "./AutoScrollContainer";
import {
  Form,
  FormField,
  FormLabel,
  FormControl,
  FormItem,
  FormDescription,
  FormMessage,
} from "./ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";

type ChatComponentProps = {
  children?: ReactNode;
};

export const customInstructionsSchema = z.object({
  text: z.string(),
});
export type CustomInstructionsSchemaFormType = z.infer<
  typeof customInstructionsSchema
>;

export const ChatComponent: FunctionComponent<ChatComponentProps> = () => {
  const toast = useToast();
  const { data: sessionData } = useSession();
  const router = useRouter();
  const { chatId } = router.query;
  const formMethods = useForm({
    resolver: zodResolver(customInstructionsSchema),
    defaultValues: {
      text: "",
    },
  });
  const { mutate: saveCustomInstructions } =
    api.chats.saveCustomInstructions.useMutation();
  const { mutate: saveChatMessage } = api.chats.saveChatMessage.useMutation();
  const { messages, input, handleInputChange, handleSubmit, setMessages } =
    useChat({
      api: `/api/openai`,
      body: {
        chatId: chatId as string,
        customInstructions: [
          {
            role: ChatRole.user,
            content: formMethods.getValues("text"), // send the custom instructions to apply them
          },
        ],
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

  const handleSaveCustomInstructions = (
    data: CustomInstructionsSchemaFormType
  ) => {
    saveCustomInstructions(
      {
        chatId: chatId as string,
        data: {
          text: data.text,
        },
      },
      {
        onSuccess() {
          toast.toast({
            title: "Success",
            description: "Custom instructions saved",
            variant: "success",
          });
        },
        onError(error) {
          toast.toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
        },
      }
    );
  };

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
    if (!selectedChat) return;
    if (!chatId) return;
    const customInstructions = selectedChat.customInstructions as [
      {
        content: string;
        role: ChatRole;
      }
    ];
    formMethods.reset({
      text: customInstructions[0].content ?? "",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChat, chatId]);

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

  return (
    <div className="flex h-screen max-h-screen w-full flex-col justify-between">
      {/* the chat component label */}
      <div className="flex flex-col border-b p-4">
        <div className="flex flex-row border-b p-4">
          Selected chat:
          <Label className="ml-2 font-bold">
            {selectedChat && selectedChat.name}
          </Label>
        </div>
        {/* container with additional settings for this specific chat */}
        <div className="">
          <Form {...formMethods}>
            <form
              onSubmit={formMethods.handleSubmit(handleSaveCustomInstructions)}
            >
              <FormField
                control={formMethods.control}
                name="text"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instructions</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={5}
                        placeholder="I want you to be very explicit and concise, give me complex answers and consider my capacity of understanding is very high and you don't have to simplify things..."
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Add custom instructions that will apply for every chat
                      message.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">Save settings</Button>
            </form>
          </Form>
        </div>
      </div>
      {/* the container that has all the messages */}
      <AutoScrollContainer>
        {messages.map((message) => {
          const { content, id, role } = message;
          return (
            <div
              key={id}
              className={`${
                role !== ChatRole.assistant && "bg-accent"
              } my-2 flex w-full flex-row items-center gap-3 rounded-md border p-2`}
            >
              {role === "assistant" ? (
                <Avatar>
                  <AvatarFallback>AI</AvatarFallback>
                </Avatar>
              ) : (
                <Avatar>
                  <AvatarImage src={sessionData?.user.image ?? ""} />
                  <AvatarFallback>
                    {sessionData?.user.email?.slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
              )}
              <div className="flex flex-col justify-center gap-3">
                <h1>{role === ChatRole.assistant ? "Assistant" : "You"}</h1>
                <p className="text-sm">{content}</p>
              </div>
            </div>
          );
        })}
        {isMessagesLoading && (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="animate-spin" size={64} />
          </div>
        )}
      </AutoScrollContainer>
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
