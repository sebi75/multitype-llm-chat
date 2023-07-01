import { createTRPCRouter } from "@/server/api/trpc";
import { chatsRouter } from "./routers/chats";
import { objectsRouter } from "./routers/objects";

export const appRouter = createTRPCRouter({
  chats: chatsRouter,
  objects: objectsRouter,
});

export type AppRouter = typeof appRouter;
