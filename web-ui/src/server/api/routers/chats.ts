import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { type ChatRole } from "@prisma/client";

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
          createdAt: "asc",
        },
      });
    }),
  saveChatMessage: protectedProcedure
    .input(
      z.object({
        chatId: z.string(),
        text: z.string(),
        role: z.string(),
      })
    )
    .mutation(({ ctx, input }) => {
      const { chatId, text, role } = input;

      return ctx.prisma.messages.create({
        data: {
          text: text,
          role: role as ChatRole,
          chatId: chatId,
        },
      });
    }),

  deleteChat: protectedProcedure
    .input(
      z.object({
        chatId: z.string(),
      })
    )
    .mutation(({ ctx, input }) => {
      const { chatId } = input;

      return ctx.prisma.chat.delete({
        where: {
          id: chatId,
        },
      });
    }),
});
