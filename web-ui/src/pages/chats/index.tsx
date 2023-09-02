import { ChatComponent } from "@/components/ChatComponent";
import { ChatLayoutWrapper } from "@/components/ChatLayoutWrapper";
import { type GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import { useRouter } from "next/router";
import React from "react";

export default function Chats() {
  const router = useRouter();
  const { chatId } = router.query;

  return (
    <ChatLayoutWrapper>
      {!chatId ? (
        <div>
          <h1>Create a new chat to use the app.</h1>
        </div>
      ) : (
        <ChatComponent />
      )}
    </ChatLayoutWrapper>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const session = await getSession({ req });
  if (!session) {
    return {
      redirect: {
        destination: "/auth/signin",
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
};
