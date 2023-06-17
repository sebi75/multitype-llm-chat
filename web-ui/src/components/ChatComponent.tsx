import React, { useEffect } from "react";
import { type FunctionComponent } from "react";
import { type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "./ui/input";
import { api } from "@/utils/api";
import { useRouter } from "next/router";
import { Loader2 } from "lucide-react";
import { ChatRole } from "@prisma/client";
import { useToast } from "./ui/use-toast";
import { useChat } from "ai/react";

type ChatComponentProps = {
  children?: ReactNode;
};

const chatInputSchema = z.object({
  input: z.string().nonempty("Chat input is required"),
});

export const ChatComponent: FunctionComponent<ChatComponentProps> = ({
  children,
}) => {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: "/api/openai",
  });
  const router = useRouter();
  const toast = useToast();
  const { chatId } = router.query;
  const { data: messagesData, isFetching: isMessagesLoading } =
    api.chats.getMessages.useQuery(
      {
        chatId: chatId as string,
      },
      {
        enabled: !!chatId,
      }
    );

  const {
    register,
    handleSubmit: handleSubmitHookForm,
    formState,
  } = useForm({
    defaultValues: {
      input: "",
    },
    resolver: zodResolver(chatInputSchema),
  });

  const handleSubmitInFunction = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSubmit(e);
  };

  //   const onSubmit = (data: z.infer<typeof chatInputSchema>) => {
  //     // we want to call the custom api function and
  //     // make use of the vercel function to generate text
  //   };

  useEffect(() => {
    if (Object.keys(formState.errors).length === 0) return;
    // iterate the errors from the objects and show toast
    // if there is an error with the message form the error
    Object.values(formState.errors).forEach((error) => {
      toast.toast({
        title: "Error",
        variant: "destructive",
        description: error.message,
      });
    });
  }, [formState.errors]);

  // this is the main component that represents a chat
  // it is either empty or has messages
  // if we are on a page that has a chat id, then we
  // fetch the messages for that chatId
  return (
    <div className="relative h-full w-full">
      {/* the container that has all the messages */}
      <div className="flex w-full flex-col">
        {messages.map((message) => {
          const { content, id, role } = message;
          return (
            <div
              key={id}
              className={`${
                role !== ChatRole.assistant && "text-end"
              } my-2 w-full rounded-md border p-2`}
            >
              <h1>{role === ChatRole.assistant ? "Assistant" : "You"}</h1>
              <p className="text-sm">{content}</p>
            </div>
          );
        })}
        {isMessagesLoading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="animate-spin" size={64} />
          </div>
        ) : (
          messagesData &&
          messagesData.length > 0 &&
          messagesData.map((message) => {
            const { role, text, id } = message;

            return (
              <div
                key={id}
                className={`${
                  role !== ChatRole.assistant && "text-end"
                } w-full rounded-md border`}
              >
                <h1>{role === ChatRole.assistant ? "Assistat" : "You"}</h1>
                <p className="text-sm">{text}</p>
              </div>
            );
          })
        )}
      </div>
      {/* the main input into the chat */}
      <form
        className="absolute bottom-0 w-full"
        onSubmit={handleSubmitInFunction}
      >
        <Input
          className="w-full"
          placeholder="Say something..."
          value={input}
          onChange={handleInputChange}
        />
      </form>
      {/* <form
        onSubmit={handleSubmitHookForm(onSubmit)}
        className="absolute bottom-0 w-full"
      >
        <Input
          className="w-full"
          placeholder="Type a message..."
          {...register("input")}
        />
      </form> */}
    </div>
  );
};
