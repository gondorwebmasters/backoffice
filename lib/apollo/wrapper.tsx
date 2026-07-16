"use client";

import { ApolloProvider } from "@apollo/client";
import type { ReactNode } from "react";

import { getApolloClient } from "./client";

export function ApolloWrapper({ children }: { children: ReactNode }) {
  return <ApolloProvider client={getApolloClient()}>{children}</ApolloProvider>;
}
