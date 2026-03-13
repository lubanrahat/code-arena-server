export interface IProblemCreate {
  title: string;
  description: string;
  difficulty: string;
  tags: string[];
  example: JSON;
  constraints: string;
  hints?: string;
  editorial: string;
  testCases: JSON;
  codeSnippets: JSON;
  referenceSolutions: string;
}
