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
  testCases: JSON;
  codeSnippets: JSON;
  referenceSolutions: string;
}
