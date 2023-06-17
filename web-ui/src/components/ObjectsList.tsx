import { type FunctionComponent } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PlusIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useRouter } from "next/router";
import { api } from "@/utils/api";

export const ObjectsList: FunctionComponent = () => {
  const router = useRouter();
  const { chatId } = router.query;
  const { data: objectsData, isLoading: isObjectsLoading } =
    api.objects.getChatObjects.useQuery(
      {
        chatId: chatId as string,
      },
      {
        enabled: !!chatId,
      }
    );
  return (
    <div>
      <div className="flex w-full flex-row items-center justify-center gap-3 border-b py-2">
        <Label>Objects</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-10 rounded-full p-0">
              <PlusIcon className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          {/* {!isCreateChatLoading ? (
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
          )} */}
          <PopoverContent className="w-80">
            <div className="my-2 grid gap-4">
              <div className="space-y-2">
                <h4 className="font-medium leading-none">Add Object</h4>
                <p className="text-xs text-gray-400">
                  Add your custom data that the chat will use:
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              {/* <form onSubmit={handleSubmit(onSubmit)}>
                <Input placeholder="Chat name" {...register("name")} />
              </form> */}
              {/* <Button variant="outline" onClick={handleSubmit(onSubmit)}>
                Create
              </Button> */}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};
