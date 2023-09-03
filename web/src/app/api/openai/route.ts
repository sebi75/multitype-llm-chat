import { HTTPMethod, fetcher } from "@/lib/fetcher";

import {
  type ChatCompletionRequestMessage,
  Configuration,
  OpenAIApi,
} from "openai-edge";
import { OpenAIStream, StreamingTextResponse } from "ai";
import { prisma } from "@/server/db";

const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(config);

export const runtime = "edge";

type Message = {
  role: string;
  content: string;
};

export async function POST(req: Request) {
  const { messages, chatId, customInstructions } = (await req.json()) as {
    messages: Message[];
    customInstructions: Message[];
    chatId: string;
  };

  const latestUserMessage = messages[messages.length - 1] as Message;
  const userPrompt = latestUserMessage.content;

  // get all the object ids that the user has added to this chat
  const objectIds = await prisma.objects.findMany({
    where: {
      chatId,
    },
    select: {
      id: true,
    },
  });

  // fetch the indexing service for the data context
  // this will get the most relevant data that the user added to this chat
  let context: { data: { text: string }[] } = { data: [] };
  try {
    // if this fails, just proceed without the context..?
    context = await fetcher<{
      data: {
        text: string;
      }[];
    }>("search", HTTPMethod.POST, {
      search_query: userPrompt,
      chat_id: chatId,
      object_ids: JSON.stringify(objectIds.map((item) => item.id)),
    });
  } catch (error) {
    console.error(error);
  }

  const contextText = context.data.map((item) => item.text).join(" ");

  const promptWithContext = getPromptWithContext(userPrompt, contextText);
  const customInstructionsPrompt = customInstructions
    .map((item) => item.content)
    .join(" ");
  const prompt = `These are some custom instructions that I want you to pay attention when responding to my prompt: ${customInstructionsPrompt}. Now, ${promptWithContext}`;

  // consider only the latest 3 messages
  const latestMessages = messages.slice(-3);
  // update the messages with the prompt with context
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  latestMessages[latestMessages.length - 1]!.content = prompt;

  const response = await openai.createChatCompletion({
    model: "gpt-4",
    stream: true,
    max_tokens: 2000,
    messages: latestMessages as ChatCompletionRequestMessage[],
  });

  const stream = OpenAIStream(response);

  return new StreamingTextResponse(stream);
}

const getPromptWithContext = (userPrompt: string, context: string) => {
  return `Considering the following context: ${context}, answer the following prompt: ${userPrompt} making refereces to the context I gave you. If you don't know the answer, type "I don't find anything useful for this question related to the data.`;
};
