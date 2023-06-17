/* eslint-disable @typescript-eslint/no-non-null-assertion */
import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from "next";
import { getProviders, getSession } from "next-auth/react";
import React from "react";
import { CustomHead } from "@/components/CustomHead";
import { SigninForm } from "@/components/SigninForm";

const Signin = ({}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  return (
    <>
      <CustomHead title="Sign In">
        <meta
          name="desciption"
          content="Authentication page for the marketing assistant tool"
        />
      </CustomHead>
      <div className="gradient-bg flex h-screen w-full items-center justify-center">
        <div className="min-h-1/2 container flex w-full flex-col items-center space-y-10 rounded-lg border p-6 shadow-lg sm:max-w-[550px]">
          <SigninForm />
        </div>
      </div>
    </>
  );
};

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const providers = await getProviders();
  const session = await getSession({ req: ctx.req });

  if (session && session.user) {
    return {
      redirect: {
        destination: "/app",
        permanent: false,
      },
    };
  }

  if (!!ctx.query.referral) {
    return {
      props: {
        providers,
        referralCode: ctx.query.referral,
      },
    };
  }

  return {
    props: {
      providers,
      referralCode: null,
    },
  };
};

export default Signin;
