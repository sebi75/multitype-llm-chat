import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const chatsRouter = createTRPCRouter({
  getChats: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.chat.findMany({
      where: {
        createdByUserId: ctx.session?.user.id,
      },
    });
  }),
  createChat: protectedProcedure
    .input(
      z.object({
        name: z.string(),
      })
    )
    .mutation(({ ctx, input }) => {
      const { name } = input;
      return ctx.prisma.chat.create({
        data: {
          name,
          createdByUserId: ctx.session.user.id,
        },
      });
    }),
  getMessages: protectedProcedure
    .input(
      z.object({
        chatId: z.string(),
      })
    )
    .query(({ ctx, input }) => {
      const { chatId } = input;

      return ctx.prisma.messages.findMany({
        where: {
          chatId: chatId,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    }),
});
