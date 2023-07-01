import Head from "next/head";

export default function Home() {
  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Empty page" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex h-screen w-full items-center justify-center">
        <h1 className="text-2xl">Empty page</h1>
      </main>
    </>
  );
}
