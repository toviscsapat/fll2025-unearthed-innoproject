import data from './italian-states-quiz.json';

export type ItalianStateAnswer = {
  id: number;
  text: string;
  startsWith: string;
  wordCount: number;
};

export type ItalianStatesQuizConfig = {
  answers: ItalianStateAnswer[];
  initialNumber: number;
  numberOptions: number[];
};

export const italianStatesQuizConfig = data as ItalianStatesQuizConfig;
export default italianStatesQuizConfig;
