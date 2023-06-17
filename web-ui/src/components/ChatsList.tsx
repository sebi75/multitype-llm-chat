import { useEffect, type FunctionComponent, useState } from "react";
import { type Chat } from "@prisma/client";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DeleteIcon, Loader2, PlusIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "./ui/use-toast";
import { api } from "@/utils/api";
import { useRouter } from "next/router";

type ChatsListProps = {
  chats: Chat[];
};

export const createChatSchema = z.object({
  name: z.string().nonempty("Chat name is required"),
});

export const ChatsList: FunctionComponent<ChatsListProps> = ({ chats }) => {
  const [isCreateChatOpen, setIsCreateChatOpen] = useState(false);
  const toast = useToast();
  const router = useRouter();
  const utils = api.useContext();
  const { chatId } = router.query;
  const { register, formState, handleSubmit } = useForm({
    defaultValues: {
      name: "",
    },
    resolver: zodResolver(createChatSchema),
  });
  const { mutate: deleteChat } = api.chats.deleteChat.useMutation();
  const { mutate: createChat, isLoading: isCreateChatLoading } =
    api.chats.createChat.useMutation();

  const handleChatClick = (chatId: string) => {
    router.push(`/chats/${chatId}`);
  };

  const onSubmit = (data: z.infer<typeof createChatSchema>) => {
    createChat(
      {
        name: data.name,
      },
      {
        onSuccess: () => {
          utils.chats.getChats.invalidate();
          setIsCreateChatOpen(false);
        },
        onError: () => {
          toast.toast({
            title: "Chat creation failed",
            variant: "success",
            description: "Chat creation failed",
          });
        },
      }
    );
  };

  const handleDeleteChat = (id: string) => {
    deleteChat(
      {
        chatId: chatId as string,
      },
      {
        onError(error) {
          toast.toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
        },
        onSuccess() {
          toast.toast({
            title: "Chat deleted",
            description: "Chat was deleted successfully",
            variant: "success",
          });
          utils.chats.getChats.invalidate();
          if (chatId === id) {
            router.push("/chats");
          }
        },
      }
    );
  };

  useEffect(() => {
    if (Object.keys(formState.errors).length === 0) return;
    // map the errors from formState and display
    // error toasts for each errr:
    Object.values(formState.errors).forEach((error) => {
      toast.toast({
        title: "Inpur error",
        description: error.message,
        variant: "destructive",
      });
    });
  }, [formState.errors]);

  return (
    <div className="flex flex-col items-center">
      <div className="flex w-full flex-row items-center justify-center gap-3 border-b py-2">
        <Label>Chats</Label>
        <Popover
          open={isCreateChatOpen}
          onOpenChange={(open) => {
            setIsCreateChatOpen(open);
          }}
        >
          {!isCreateChatLoading ? (
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-10 rounded-full p-0">
                <PlusIcon className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
          ) : (
            <Button
              disabled={isCreateChatLoading}
              variant="outline"
              className="w-10 rounded-full p-0"
            >
              <Loader2 className="h-4 w-4 animate-spin" />
            </Button>
          )}
          <PopoverContent className="w-80">
            <div className="my-2 grid gap-4">
              <div className="space-y-2">
                <h4 className="font-medium leading-none">New Chat</h4>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <form onSubmit={handleSubmit(onSubmit)}>
                <Input placeholder="Chat name" {...register("name")} />
              </form>
              <Button variant="outline" onClick={handleSubmit(onSubmit)}>
                Create
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      {/* map all the chats and display them in column */}
      <div className="w-full p-2">
        {chats.map((chat) => {
          const { createdAt, createdByUserId, id, name } = chat;
          return (
            <div
              className={`${
                chatId === id
                  ? "my-2 flex w-full flex-row justify-between gap-3 rounded-md border bg-accent p-3 duration-150 hover:text-accent-foreground"
                  : "my-2 flex w-full flex-row justify-between gap-3 rounded-md border p-3 duration-150 hover:bg-accent hover:text-accent-foreground"
              }`}
              key={id}
              onClick={() => handleChatClick(id)}
            >
              <div className="flex flex-col gap-3">
                <Label>{name}</Label>
                <p className="text-xs text-gray-400">{formatDate(createdAt)}</p>
              </div>
              <Button
                variant="destructive"
                onClick={() => handleDeleteChat(id)}
              >
                <DeleteIcon className="h-4 w-4" />
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
