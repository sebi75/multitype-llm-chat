import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const objectsRouter = createTRPCRouter({
  getChatObjects: protectedProcedure
    .input(
      z.object({
        chatId: z.string(),
      })
    )
    .query(({ ctx, input }) => {
      return ctx.prisma.objects.findMany({
        where: {
          chatId: input.chatId,
        },
      });
    }),
  createChatObject: protectedProcedure
    .input(
      z.object({
        chatId: z.string(),
        name: z.string(),
        fileType: z.string(),
      })
    )
    .mutation(({ ctx, input }) => {
      const { chatId, name, fileType } = input;

      return ctx.prisma.objects.create({
        data: {
          name,
          chatId,
          type: fileType,
        },
      });
    }),
});
