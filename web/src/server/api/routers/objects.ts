import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import fetchWebsite from "@/lib/fetchWebsite";

export const objectsRouter = createTRPCRouter({
  getChatObjects: protectedProcedure
    .input(
      z.object({
        chatId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const objects = await ctx.prisma.objects.findMany({
        where: {
          chatId: input.chatId,
        },
      });

      const responseObjects = [];
      for (const object of objects) {
        if (object.type === "url" || object.type === "youtube") {
          const preview = await fetchWebsite(object.name);
          responseObjects.push({
            ...object,
            preview,
          });
        }
      }

      return responseObjects;
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

  deleteObject: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(({ ctx, input }) => {
      const { id } = input;

      return ctx.prisma.objects.delete({
        where: {
          id,
        },
      });
    }),

  getUrlPreview: protectedProcedure
    .input(
      z.object({
        url: z.string(),
      })
    )
    .query(({ input }) => {
      const { url } = input;
      return fetchWebsite(url);
    }),
});
