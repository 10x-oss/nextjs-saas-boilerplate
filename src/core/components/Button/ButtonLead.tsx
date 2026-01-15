"use client";

import { useState, useRef } from "react";
import toast from "@/shared/toast";
import { ArrowRightIcon } from "@/shared/svgs";
import { axiosInstance, handleApiError } from "@/shared/utils/api.utils";
import { logEvent } from "@/shared/utils/analytics";

// This component is used to collect the emails from the landing page
// You'd use this if your product isn't ready yet or you want to collect leads
// For instance: A popup to send a freebie, joining a waitlist, etc.
// It calls the /api/lead route and store a Lead document in the database
const ButtonLead = ({ extraStyle }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);

  const handleSubmit = async (e) => {
    e?.preventDefault();

    setIsLoading(true);
    try {
      await axiosInstance.post("/lead", { email });

      toast.success("Thanks for joining the waitlist!");
      logEvent("signup_flow_submitted");

      inputRef.current?.blur();
      setEmail("");
      setIsDisabled(true);
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <form
      className={`w-full max-w-xs space-y-3 ${extraStyle ? extraStyle : ""}`}
      onSubmit={handleSubmit}
    >
      <input
        required
        type="email"
        value={email}
        ref={inputRef}
        autoComplete="email"
        placeholder="tom@cruise.com"
        className="input input-bordered w-full placeholder:opacity-60"
        onChange={(e) => setEmail(e.target.value)}
      />

      <button
        className="btn btn-primary btn-block"
        type="submit"
        disabled={isDisabled}
      >
        Join waitlist
        {isLoading ? (
          <span className="loading loading-spinner loading-xs"></span>
        ) : (
          <ArrowRightIcon />
        )}
      </button>
    </form>
  );
};

export default ButtonLead;
