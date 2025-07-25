import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { getApiUrl } from "./enhanced-deployment-config";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const originalUrl = queryKey[0] as string;
    const url = getApiUrl(originalUrl);
    
    console.log(`🔄 API Request: ${url}`);
    
    const res = await fetch(url, {
      credentials: "include",
    });

    console.log(`📡 API Response: ${res.status} for ${url}`);

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`❌ API Error ${res.status}: ${errorText}`);
      throw new Error(`${res.status}: ${errorText}`);
    }

    const data = await res.json();
    console.log(`✅ API Data received for ${url}:`, {
      type: data?.type,
      features: data?.features?.length
    });
    
    return data;
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
