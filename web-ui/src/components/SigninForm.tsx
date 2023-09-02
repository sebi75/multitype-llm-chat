import React from "react";
import type { FunctionComponent, MouseEvent } from "react";
import { signIn } from "next-auth/react";
import { Button } from "./ui/button";

export const SigninForm: FunctionComponent = () => {
  const handleGoogleSignin = (event: MouseEvent) => {
    event.preventDefault();
    signIn("google", {
      redirect: true,
      callbackUrl: "/chats",
    });
  };

  return (
    <>
      <h1 className="text-3xl font-bold">Sign in</h1>
      <div className="flex flex-col space-y-5 sm:p-3">
        <div className="grid w-full items-center gap-3"></div>
        <span className="min-h-[20px]"></span>

        <Button variant="outline" onClick={handleGoogleSignin}>
          Sign In With Google
        </Button>
      </div>
    </>
  );
};
