import data from './secret-code-puzzle.json';

export interface SecretCodePuzzleConfig {
  secretMessage: string;
  correctAnswer: number[];
}

export const secretCodePuzzleConfig = data as SecretCodePuzzleConfig;
export default secretCodePuzzleConfig;
