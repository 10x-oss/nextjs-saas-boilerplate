import axios from "axios";
import toast from "@/shared/toast";

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

// Use this if you want to make a call to OpenAI GPT-4 for instance. userId is used to identify the user on openAI side.
export const sendOpenAi = async (
  messages: ChatMessage[],
  userId: string,
  max = 100,
  temp = 1
): Promise<string | null> => {
  const url = "https://api.openai.com/v1/chat/completions";

  toast.info("Ask GPT >>>");
  messages.map((m) =>
    toast.info(" - " + m.role.toUpperCase() + ": " + m.content)
  );

  const body = JSON.stringify({
    model: "gpt-4",
    messages,
    max_tokens: max,
    temperature: temp,
    user: userId,
  });

  const options = {
    headers: {
      Authorization: `Bearer ${process.env["OPENAI_API_KEY"]}`,
      "Content-Type": "application/json",
    },
  };

  try {
    const res = await axios.post(url, body, options);

    const answer = res.data.choices[0].message.content;
    const usage = res?.data?.usage;

    toast.info(">>> " + answer);
    toast.info(
      "TOKENS USED: " +
        usage?.total_tokens +
        " (prompt: " +
        usage?.prompt_tokens +
        " / response: " +
        usage?.completion_tokens +
        ")"
    );
    toast.info("\n");

    return answer;
  } catch (e) {
    console.error(
      "GPT Error: " +
        (e as { response?: { status: number; data: any } })?.response?.status,
      (e as { response?: { data: any } })?.response?.data
    );
    return null;
  }
};
