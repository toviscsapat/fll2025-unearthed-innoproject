import data from './wordselector.json';

export type WordSelectorConfig = {
  title: string;
  number_of_selectable_letters: number;
  correct_letters: string[];
  possible_letters_position_1: string[];
  possible_letters_position_2: string[];
  possible_letters_position_3: string[];
  possible_letters_position_4: string[];
  possible_letters_position_5: string[];
};

export const wordSelectorConfig = data as WordSelectorConfig;
export default wordSelectorConfig;
