import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  urlOrOptions: string | RequestInfo | URL | {
    method?: string;
    url?: string;
    body?: string;
    headers?: Record<string, string>;
  },
  init?: RequestInit,
): Promise<Response> {
  let url: string;
  let options: RequestInit = init || {};
  
  if (typeof urlOrOptions === 'string') {
    // First overload: apiRequest(url, options)
    url = urlOrOptions;
    options = init || {};
  } else if (urlOrOptions instanceof URL || urlOrOptions instanceof Request) {
    // Handle URL or Request object
    url = urlOrOptions.toString();
  } else {
    // Second overload: apiRequest(options)
    const { method = 'GET', url: optionsUrl = '', body, headers } = urlOrOptions;
    url = optionsUrl;
    options = {
      ...options,
      method,
      body,
      headers: {
        ...options.headers,
        ...headers
      }
    };
  }
  
  const res = await fetch(url, {
    ...options,
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
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
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
