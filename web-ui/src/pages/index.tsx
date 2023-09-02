import { type GetServerSideProps } from "next";
import Head from "next/head";

export default function Home() {
  return (
    <>
      <Head>
        <title>MultitypeLLMChat</title>
        <meta name="description" content="MultitypeLLMChat" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex h-screen w-full items-center justify-center">
        <h1>Empty page</h1>
      </main>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  return new Promise((resolve) => {
    const returnObj = {
      redirect: {
        destination: "/chats",
        permanent: true,
      },
      props: {},
    };
    resolve(returnObj);
  });
};
