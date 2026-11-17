import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { clearAccessToken, getAccessToken } from "@/lib/token";

export const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api").replace(/\/+$/, "");

export const api = axios.create({ baseURL: API_URL, timeout: 20_000 });

// The AuthProvider flips this once the BetterAuth session is known, so anonymous visitors never ask for a token.
let signedIn = false;
export const setApiSignedIn = (value: boolean) => {
  signedIn = value;
};

api.interceptors.request.use(async (config) => {
  if (signedIn) {
    const token = await getAccessToken();
    if (token) config.headers.set("Authorization", `Bearer ${token}`);
  }
  return config;
});

type Retryable = InternalAxiosRequestConfig & { _retried?: boolean };

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as Retryable | undefined;
    if (error.response?.status === 401 && signedIn && original && !original._retried) {
      original._retried = true;
      clearAccessToken();
      const fresh = await getAccessToken(true);
      if (fresh) {
        original.headers.set("Authorization", `Bearer ${fresh}`);
        return api(original);
      }
    }
    return Promise.reject(error);
  },
);

/** Turn any thrown value into a message that is safe and friendly to show in a toast. */
export function errorMessage(err: unknown, fallback = "Something went wrong. Please try again.") {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { message?: string } | undefined;
    if (data?.message) return data.message;
    if (err.code === "ERR_NETWORK") return "We can't reach the server right now. Check your connection and try again.";
    if (err.code === "ECONNABORTED") return "The request took too long. Please try again.";
  }
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}

export const unwrap = <T,>(res: { data: { data: T } }) => res.data.data;
