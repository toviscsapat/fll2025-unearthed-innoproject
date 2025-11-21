import { ChevronDown, ChevronUp } from 'lucide-react';
import React, { useEffect, useState } from 'react';

export interface WordSelectorConfig {
  title: string;
  number_of_selectable_letters: number;
  correct_letters: string[];
  possible_letters_position_1: string[];
  possible_letters_position_2: string[];
  possible_letters_position_3: string[];
  possible_letters_position_4: string[];
  possible_letters_position_5: string[];
}

interface WordSelectorProps {
  config?: WordSelectorConfig;
  onSolved?: () => void;
}

const DEFAULT_CONFIG: WordSelectorConfig = {
  title: 'Szó kiválasztó',
  number_of_selectable_letters: 5,
  correct_letters: ['CS', 'A', 'T', 'A', '-'],
  possible_letters_position_1: ['V', 'SZ', 'CS', 'P', ''],
  possible_letters_position_2: ['Á', 'E', 'O', 'A', ''],
  possible_letters_position_3: ['R', 'T', 'H', 'K', ''],
  possible_letters_position_4: ['D', 'T', 'A', 'S', ''],
  possible_letters_position_5: ['A', 'O', 'J', 'S', ''],
};

const WordSelector: React.FC<WordSelectorProps> = ({ config, onSolved }) => {
  const cfg = config || DEFAULT_CONFIG;

  const columns: string[][] = [
    cfg.possible_letters_position_1,
    cfg.possible_letters_position_2,
    cfg.possible_letters_position_3,
    cfg.possible_letters_position_4,
    cfg.possible_letters_position_5,
  ];

  const alphabet = 'AÁBCDEÉFGHIÍJKLMNOÓÖŐPQRSTUÚÜŰVWXYZ-'.split('');

  const [selectedLetters, setSelectedLetters] = useState<number[]>(
    Array(cfg.number_of_selectable_letters).fill(0)
  );
  const [submittedWord, setSubmittedWord] = useState<string>('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const handleUp = (index: number) => {
    setSelectedLetters((prev) => {
      const next = [...prev];
      const letters = index < 4 ? columns[index] : alphabet;
      next[index] = (next[index] + 1) % letters.length;
      return next;
    });
  };

  const handleDown = (index: number) => {
    setSelectedLetters((prev) => {
      const next = [...prev];
      const letters = index < 4 ? columns[index] : alphabet;
      next[index] = (next[index] - 1 + letters.length) % letters.length;
      return next;
    });
  };

  const handleSubmit = () => {
    const word = selectedLetters
      .map((letterIndex, idx) => {
        const letters = idx < 4 ? columns[idx] : alphabet;
        return letters[letterIndex];
      })
      .join('');
    setSubmittedWord(word);
    const correct = word === cfg.correct_letters.join('');
    setIsCorrect(correct);
  };

  useEffect(() => {
    if (isCorrect) setTimeout(() => onSolved?.(), 0);
  }, [isCorrect, onSolved]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full">
        <h1 className="text-3xl font-bold text-center text-indigo-600 mb-8">{cfg.title}</h1>

        <div className="flex justify-center gap-4 mb-8">
          {selectedLetters.map((_, index) => (
            <div key={index} className="flex flex-col items-center">
              <button
                onClick={() => handleUp(index)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors mb-2"
              >
                <ChevronUp className="w-6 h-6 text-indigo-600" />
              </button>

              <div className="w-16 h-20 bg-indigo-500 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-4xl font-bold text-white">
                  {index < 4
                    ? columns[index][selectedLetters[index]]
                    : alphabet[selectedLetters[index]]}
                </span>
              </div>

              <button
                onClick={() => handleDown(index)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors mt-2"
              >
                <ChevronDown className="w-6 h-6 text-indigo-600" />
              </button>
            </div>
          ))}
        </div>

        <div className="flex justify-center">
          <button
            onClick={handleSubmit}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-8 rounded-lg shadow-lg transition-colors"
          >
            Beküldés
          </button>
        </div>

        {submittedWord && (
          <div
            className={`mt-8 p-4 border-2 rounded-lg ${isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}
          >
            {' '}
            <p className="text-center text-lg">
              <span className={`font-semibold ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                {isCorrect ? 'Helyes! 🎉' : 'Helytelen'}
              </span>
              <br />
              <span
                className={`text-2xl font-bold ${isCorrect ? 'text-green-600' : 'text-red-600'}`}
              >
                {submittedWord}
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WordSelector;
