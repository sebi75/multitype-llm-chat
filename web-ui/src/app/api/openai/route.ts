import { HTTPMethod, fetcher } from "@/lib/fetcher";

import {
  type ChatCompletionRequestMessage,
  Configuration,
  OpenAIApi,
} from "openai-edge";
import { OpenAIStream, StreamingTextResponse } from "ai";

const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(config);

type Message = {
  role: string;
  content: string;
};

export async function POST(req: Request) {
  //   const body = await req.text();
  const { messages } = (await req.json()) as {
    messages: Message[];
  };

  const latestUserMessage = messages[messages.length - 1] as Message;
  // here we need to call the indexing service for searching
  // context and then package the context
  // with the user prompt and send a request to openai
  // and get the data to send the user streaming;

  //   const context = await fetcher<{ context: string }>(
  //     "/search",
  //     HTTPMethod.POST,
  //     false,
  //     {
  //       search: search,
  //     }
  //   );

  //   const prompt = getPromptWithContext(, context.context);

  const response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    stream: true,
    max_tokens: 1000,
    messages: messages as ChatCompletionRequestMessage[],
  });

  // Convert the response into a friendly text-stream

  const stream = OpenAIStream(response);

  return new StreamingTextResponse(stream);
}

const getPromptWithContext = (userPrompt: string, context: string) => {
  return `Considering the following context: ${context}, answer the following user prompt: ${userPrompt}. If you don't know the answer, type "I don't find anything useful for this question related to the data.`;
};
