"use client";

import { useQuery } from "@apollo/client";
import { createContext, useContext, type ReactNode } from "react";

import { ME } from "@/lib/graphql/auth";
import type { Company, User } from "@/lib/graphql/types";

interface SessionData {
  user: User | null;
  companies: Company[];
  loading: boolean;
  refetch: () => void;
}

const SessionContext = createContext<SessionData>({
  user: null,
  companies: [],
  loading: true,
  refetch: () => {},
});

export function useSession() {
  return useContext(SessionContext);
}

type MeData = {
  me: { success: boolean; user: User | null; companies: Company[] | null } | null;
};

export function SessionProvider({ children }: { children: ReactNode }) {
  const { data, loading, refetch } = useQuery<MeData>(ME);

  return (
    <SessionContext.Provider
      value={{
        user: data?.me?.user ?? null,
        companies: data?.me?.companies ?? [],
        loading,
        refetch,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}
