import axios from "axios";
import toast from "@/shared/toast";
import { signIn } from "next-auth/react";

// Create axios instance with default config
export const axiosInstance = axios.create({
  baseURL: "/api",
});

// Custom error handler
export const handleApiError = (error: any) => {
  let message = "";

  if (error.response?.status === 401) {
    toast.error("Please login");
    return signIn("google", {
      callbackUrl: process.env["NEXT_PUBLIC_CALLBACK_URL"],
      prompt: "select_account",
    });
  } else if (error.response?.status === 403) {
    message = "Pick a plan to use this feature";
  } else {
    message = error?.response?.data?.error || error.message || error.toString();
  }

  const finalMessage =
    typeof message === "string" ? message : JSON.stringify(message);
  console.error(finalMessage);
  toast.error(finalMessage || "Something went wrong...");
  return Promise.reject(error);
};
