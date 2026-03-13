import config from "../config/env";

export function getJudgeOLanguageId(language: string) {
  const languageMap: Record<string, number> = {
    PYTHON: 71,
    JAVASCRIPT: 63,
    CPP: 54,
    GO: 60,
  };
  return languageMap[language.toUpperCase()] || 71;
}

export async function submitToJudge0(
  submissions: any[],
): Promise<Judge0Submission[] | Judge0BatchResponse> {
  const response = await fetch(
    "https://judge0-ce.p.rapidapi.com/submissions/batch?base64_encoded=false",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-RapidAPI-Key": config.judge0.apiKey,
        "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
      },
      body: JSON.stringify({
        submissions,
      }),
    },
  );
  const data = (await response.json()) as
    | Judge0Submission[]
    | Judge0BatchResponse;
  console.log(data);
  return data;
}

interface Judge0Status {
  id: number;
  description: string;
}

export interface Judge0Submission {
  token: string;
  status: Judge0Status;
  [key: string]: any;
}

export interface Judge0BatchResponse {
  submissions: Judge0Submission[];
}

export async function poolBatchResult(tokens: string[]) {
  while (true) {
    const response = await fetch(
      `https://judge0-ce.p.rapidapi.com/submissions/batch?base64_encoded=false&tokens=${tokens.join(",")}`,
      {
        method: "GET",
        headers: {
          "X-RapidAPI-Key": config.judge0.apiKey,
          "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
        },
      },
    );

    const data = (await response.json()) as
      | Judge0Submission[]
      | Judge0BatchResponse;
    console.log(data);
    const result = Array.isArray(data) ? data : data.submissions || [];

    if (result.length === 0) {
      return result;
    }

    const isAllDone = result.every(
      (r: any) => r.status && r.status.id !== 1 && r.status.id !== 2,
    );
    if (isAllDone) {
      return result;
    }

    await sleep(1000);
  }
}

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));
