import Head from "next/head";
import React from "react";
import type { FunctionComponent, ReactNode } from "react";

export type CustomHeadProps = {
  title: string;
  children?: ReactNode;
};

export const CustomHead: FunctionComponent<CustomHeadProps> = ({
  title,
  children,
}) => {
  return (
    <Head>
      <title>{title}</title>
      {/* meta tags */}
      {/* seo */}
      {/* other stuff */}
      {children}
    </Head>
  );
};
