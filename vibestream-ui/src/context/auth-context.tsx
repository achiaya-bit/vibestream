import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";
import type { User } from "@/lib/types";
import { meQuery, queryKeys } from "@/hooks/queries";
import { authApi } from "@/services/api";

type AuthCtx = {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { name: string; email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | null>(null);

function persistToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) localStorage.setItem("vibestream_token", token);
  else localStorage.removeItem("vibestream_token");
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const { data: user = null, isLoading } = useQuery(meQuery);

  const loginMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const { data } = await authApi.login(email, password);
      return data as { token: string; user: User };
    },
    onSuccess: (data) => {
      persistToken(data.token);
      queryClient.setQueryData(queryKeys.me, data.user);
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (body: { name: string; email: string; password: string }) => {
      const { data } = await authApi.register(body);
      return data as { token: string; user: User };
    },
    onSuccess: (data) => {
      persistToken(data.token);
      queryClient.setQueryData(queryKeys.me, data.user);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      persistToken(null);
      queryClient.setQueryData(queryKeys.me, null);
    },
  });

  const login = useCallback(
    async (email: string, password: string) => {
      await loginMutation.mutateAsync({ email, password });
    },
    [loginMutation],
  );

  const register = useCallback(
    async (data: { name: string; email: string; password: string }) => {
      await registerMutation.mutateAsync(data);
    },
    [registerMutation],
  );

  const logout = useCallback(async () => {
    await logoutMutation.mutateAsync();
  }, [logoutMutation]);

  const value = useMemo<AuthCtx>(
    () => ({ user, isLoading, login, register, logout }),
    [user, isLoading, login, register, logout],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useAuth = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth must be inside AuthProvider");
  return c;
};
