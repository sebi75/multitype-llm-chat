import { useRouter } from "next/router";
import { useEffect } from "react";

export default function NotFound() {
  const router = useRouter();

  useEffect(() => {
    router.push("/chats");
  }, [router]);

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <h2 className="text-2xl font-bold">Oops, page not found</h2>
    </div>
  );
}
