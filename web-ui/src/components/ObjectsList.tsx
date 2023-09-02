/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { useState, type FunctionComponent, type ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, PlusIcon, YoutubeIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HTTPMethod, fetcher } from "@/lib/fetcher";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useRouter } from "next/router";
import { api } from "@/utils/api";
import { Input } from "./ui/input";
import { useToast } from "./ui/use-toast";

export const ObjectsList: FunctionComponent = () => {
  const router = useRouter();
  const toast = useToast();
  const utils = api.useContext();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [resourceType, setResourceType] = useState("url");
  const [url, setUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isIndexing, setIsIndexing] = useState(false);
  const { chatId } = router.query;
  const { data: objectsData } = api.objects.getChatObjects.useQuery(
    {
      chatId: chatId as string,
    },
    {
      enabled: !!chatId,
    }
  );
  const { mutateAsync: createObject } =
    api.objects.createChatObject.useMutation();

  const hasObjectsData = objectsData && objectsData?.length > 0;

  const handleAddURL = async (url: string) => {
    const path = "/index-url";

    try {
      setIsIndexing(true);
      await fetcher(path, HTTPMethod.POST, {
        url: url,
        chat_id: chatId as string,
      });
      await createObject(
        {
          chatId: chatId as string,
          fileType: "youtube",
          name: url,
        },
        {
          onSuccess: () => {
            utils.objects.invalidate();
            setIsDialogOpen(false);
          },
        }
      );
      toast.toast({
        title: "Indexing successful",
        description:
          "The URL has been indexed successfully, go chat with the info.",
      });
      setIsIndexing(false);
    } catch (error) {
      toast.toast({
        title: "Indexing failed",
        description: "Indexing of the information failed",
        variant: "destructive",
      });
    }
  };

  /**
   * @description This function will add a file to the API and then index it.
   * We are doing this from the frontend because of the limitations of the tRPC API
   */
  const handleAddFileToAPI = async (file: File) => {
    try {
      const form = new FormData();
      form.append("chat_id", chatId as string);
      form.append("file", file);
      const response = await fetch("http://localhost:5050/index-file", {
        method: "POST",
        body: form,
      });

      if (!response.ok) {
        toast.toast({
          title: "Indexing failed",
          description: "Indexing of the information failed",
          variant: "destructive",
        });
        return;
      }

      toast.toast({
        title: "Indexing successful",
        description:
          "The file has been indexed successfully, go chat with the info.",
      });
    } catch (error) {
      toast.toast({
        title: "Indexing failed",
        description: "Indexing of the information failed",
        variant: "destructive",
      });
    }
  };

  const handleAddFile = (event: ChangeEvent<HTMLInputElement>) => {
    //@ts-ignore
    const file = event.target.files[0];
    if (!file) return;
    setFile(file);
  };

  const resolveIcon = (type: string) => {
    if (type === "youtube") {
      return <YoutubeIcon className="h-6 w-6" />;
    } else {
      return <div></div>;
    }
  };

  const handleAddObject = async () => {
    if (resourceType === "url") {
      await handleAddURL(url);
    } else {
      if (!file) return;
      await handleAddFileToAPI(file);
    }
  };

  return (
    <div>
      <div className="flex w-full flex-row items-center justify-center gap-3 border-b py-2">
        <Label>Objects</Label>
        <Dialog
          open={isDialogOpen}
          onOpenChange={(open: boolean) => {
            if (isIndexing) return;
            setIsDialogOpen(open);
          }}
        >
          <DialogTrigger asChild>
            <Button variant="outline" className="w-10 rounded-full p-0">
              <PlusIcon className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="flex flex-col items-center gap-4 sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Add new object to chat</DialogTitle>
              <DialogDescription>
                Add new objects to interact with them here.
              </DialogDescription>
            </DialogHeader>
            <Tabs defaultValue="url" className="w-[400px]">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger
                  value="url"
                  onClick={() => {
                    setFile(null);
                    setResourceType("url");
                  }}
                >
                  URL
                </TabsTrigger>
                <TabsTrigger
                  value="file"
                  onClick={() => {
                    setUrl("");
                    setResourceType("file");
                  }}
                >
                  FILE
                </TabsTrigger>
              </TabsList>
              <TabsContent value="url">
                <div className="grid w-full max-w-sm items-center gap-1.5">
                  <Label htmlFor="url">URL</Label>
                  <Input
                    placeholder="https://youtube.com/"
                    value={url}
                    onChange={(event) => setUrl(event.target.value)}
                    id="url"
                    type="text"
                  />
                </div>
              </TabsContent>
              <TabsContent value="file">
                <div className="grid w-full max-w-sm items-center gap-1.5">
                  <Label htmlFor="picture">Picture</Label>
                  <Input onChange={handleAddFile} id="picture" type="file" />
                </div>
              </TabsContent>
            </Tabs>
            <DialogFooter>
              <Button
                disabled={isIndexing}
                onClick={() => handleAddObject()}
                type="submit"
              >
                {isIndexing && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Add Object
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      {isIndexing && (
        <div className="my-2 flex w-full flex-row justify-between gap-3 rounded-md border p-3 duration-150 hover:bg-accent hover:text-accent-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
        </div>
      )}
      {/* chat objects list */}
      {hasObjectsData ? (
        <div className="flex flex-col p-2">
          {objectsData?.map((object) => {
            const { chatId, id, name, type } = object;
            return (
              <div
                className={`${
                  chatId === id
                    ? "my-2 flex w-full flex-row justify-between gap-3 rounded-md border bg-accent p-3 duration-150 hover:text-accent-foreground"
                    : "my-2 flex w-full flex-row justify-between gap-3 rounded-md border p-3 duration-150 hover:bg-accent hover:text-accent-foreground"
                }`}
                key={id}
              >
                <div className="flex flex-col items-center gap-3">
                  {object.preview && object.preview.image && (
                    <div className="relative h-auto w-full">
                      <img
                        src={object.preview?.image ?? ""}
                        alt={name}
                        className="h-full w-full"
                      />
                    </div>
                  )}
                  <div className="flex-col">
                    <div className="flex flex-row gap-3">
                      {resolveIcon(type)}
                      <Label>{name}</Label>
                    </div>
                    <p className="text-sm text-gray-500">
                      {object.preview?.description ?? ""}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex w-full justify-center">
          <h1 className="text-sm text-gray-400">
            Add new objects to interact with them.
          </h1>
        </div>
      )}
    </div>
  );
};
