import { createTRPCRouter } from "@/server/api/trpc";
import { chatsRouter } from "./routers/chats";
import { objectsRouter } from "./routers/objects";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  chats: chatsRouter,
  objects: objectsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
