enum Difficulty {
  EASY = "EASY",
  MEDIUM = "MEDIUM",
  HARD = "HARD",
}

enum Language {
  JAVASCRIPT = "JAVASCRIPT",
  PYTHON = "PYTHON",
  CPP = "CPP",
  GO = "GO",
}

export interface IProblemCreate {
  title: string;
  description: string;
  difficulty: Difficulty;
  tags: string[];
  example: JSON;
  constraints: string;
  hints?: string;
  editorial: string;
  videoUrl?: string;
  testCases: JSON;

  codeSnippets: JSON;
  referenceSolutions: string;
  topic?: string;
  askedIn?: string[];
}

export interface IProblemFilterRequest {
  search?: string;
  difficulty?: Difficulty;
  topic?: string;
  askedIn?: string;
  status?: "SOLVED" | "UNSOLVED" | "ATTEMPTED";
  sortBy?:
    | "recentlyAdded"
    | "difficulty_asc"
    | "difficulty_desc"
    | "title_asc"
    | "title_desc";
  page?: number;
  limit?: number;
}

export interface IPaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}
