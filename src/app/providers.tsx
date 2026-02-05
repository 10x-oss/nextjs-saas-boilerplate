// src/app/providers.tsx
"use client";

import React from "react";
import { SessionProvider, useSession } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { QueryClient } from "@tanstack/react-query";
import GlobalLayout from "@/features/layout/GlobalLayout";
import localForage from "localforage";

interface ProvidersProps {
  children: React.ReactNode;
  session: any;
}

const asyncPersister = createAsyncStoragePersister({
  storage: localForage,
});

function SessionKeyBridge({
  onChange,
}: {
  onChange: (value: string) => void;
}) {
  const { data: session } = useSession();
  const derivedKey = session?.user?.id ?? "guest";

  React.useEffect(() => {
    onChange(derivedKey);
  }, [derivedKey, onChange]);

  return null;
}

export function Providers({ children, session }: ProvidersProps) {
  const [sessionKey, setSessionKey] = React.useState(
    () => session?.user?.id ?? "guest"
  );
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 60 * 1000, retry: 1 },
          mutations: { retry: 2 },
        },
      })
  );

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister: asyncPersister,
        buster: sessionKey,
      }}
    >
      <SessionProvider
        session={session}
        key={sessionKey}
        refetchInterval={0}
        refetchOnWindowFocus={false}
      >
        <ThemeProvider
          attribute="data-theme"
          defaultTheme={process.env.NEXT_PUBLIC_COLORS_THEME || "dark"}
          enableSystem={false}
          storageKey="theme"
        >
          <SessionKeyBridge
            onChange={(key) =>
              setSessionKey((prev: string) => (prev === key ? prev : key))
            }
          />
          <GlobalLayout>{children}</GlobalLayout>
        </ThemeProvider>
      </SessionProvider>
    </PersistQueryClientProvider>
  );
}
