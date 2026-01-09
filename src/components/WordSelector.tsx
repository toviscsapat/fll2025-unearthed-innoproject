import { ChevronDown, ChevronUp, Wrench } from 'lucide-react';
import React, { useEffect, useState } from 'react';
export const CONFIG_FILENAME = 'wordselector.json';

export interface WordSelectorConfig {
  title: string;
  number_of_selectable_letters: number;
  correct_letters: string[];
  possible_letters: string[][];
  question_descriptions: string[][];
}

interface WordSelectorProps {
  config: WordSelectorConfig;
  onSolved?: () => void;
  showUpload?: boolean;
}

const WordSelector: React.FC<WordSelectorProps> = ({ config, onSolved, showUpload }) => {
  const [currentConfig, setCurrentConfig] = useState<WordSelectorConfig>(config);
  const [configError, setConfigError] = useState<string | null>(null);

  const columns: string[][] = currentConfig.possible_letters.map((col) => ['-', ...col]);

  const [selectedLetters, setSelectedLetters] = useState<number[]>(
    Array(currentConfig.number_of_selectable_letters).fill(0)
  );
  const [submittedWord, setSubmittedWord] = useState<string>('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const handleUp = (index: number) => {
    setSelectedLetters((prev) => {
      const next = [...prev];
      const letters = columns[index];
      next[index] = (next[index] + 1) % letters.length;
      return next;
    });
    setIsCorrect(null);
  };

  const handleDown = (index: number) => {
    setSelectedLetters((prev) => {
      const next = [...prev];
      const letters = columns[index];
      next[index] = (next[index] - 1 + letters.length) % letters.length;
      return next;
    });
    setIsCorrect(null);
  };

  const handleSubmit = () => {
    const word = selectedLetters
      .map((letterIndex, idx) => {
        return columns[idx][letterIndex];
      })
      .join('');
    setSubmittedWord(word);
    const correct = word === currentConfig.correct_letters.join('');
    setIsCorrect(correct);
    if (!correct) {
      // Reset letters to initial (0 index) if incorrect
      setSelectedLetters(Array(currentConfig.number_of_selectable_letters).fill(0));
    }
  };


  useEffect(() => {
    if (isCorrect) {
      setTimeout(() => onSolved?.(), 500);
    }
  }, [isCorrect, onSolved]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full relative">
        <h1 className="text-3xl font-bold text-center text-indigo-600 mb-8">
          {currentConfig.title}
        </h1>

        <div className="bg-blue-50 border-2 border-indigo-200 rounded-lg p-6 mb-8">
          <p className="text-center text-indigo-900 font-semibold mb-4">
            Keresd meg a választ és olvasd össze a betűket! A helyes megoldást írd be a
            szövegdobozba.
          </p>

          <div className="space-y-4 text-sm text-gray-800">
            {currentConfig.question_descriptions.map((descriptions, idx) => (
              <div key={idx}>
                <p className="font-bold text-indigo-700 mb-2">{idx + 1}</p>
                {descriptions.map((desc, descIdx) => (
                  <p key={descIdx}>- {desc}</p>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Upload moved to bottom as icon-only button */}

        {configError && (
          <div className="mb-4 text-center text-red-700 bg-red-100 p-3 rounded-lg">
            {configError}
          </div>
        )}

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
                  {columns[index][selectedLetters[index]] || ' '}
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
            <p className="text-center text-lg">
              <span className={`font-semibold ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                {isCorrect ? 'Túlélted 😊' : 'Felrobbantál :('}
              </span>
              <br />
              <span
                className={`text-2xl font-bold ${isCorrect ? 'text-green-600' : 'text-red-600'}`}
              >
                {submittedWord || '(üres)'}
              </span>
            </p>
          </div>
        )}

        {showUpload && (
          <label
            className="absolute bottom-4 right-4 p-2 rounded-lg cursor-pointer text-indigo-600 hover:text-indigo-800 shadow-md bg-white/0"
            title="Konfiguráció betöltése"
          >
            <Wrench className="w-6 h-6" />
            <input
              type="file"
              accept=".json,.js"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                try {
                  const text = await file.text();
                  let parsed: unknown;
                  try {
                    parsed = JSON.parse(text);
                  } catch {
                    // eslint-disable-next-line no-eval
                    parsed = eval('(' + text + ')');
                  }
                  setCurrentConfig(parsed as WordSelectorConfig);
                  setConfigError(null);
                  setSelectedLetters(
                    Array((parsed as WordSelectorConfig).number_of_selectable_letters).fill(0)
                  );
                  setSubmittedWord('');
                  setIsCorrect(null);
                } catch (err: unknown) {
                  const message = err instanceof Error ? err.message : String(err);
                  setConfigError('Hiba a konfiguráció betöltésekor: ' + message);
                }
                e.currentTarget.value = '';
              }}
              className="hidden"
            />
          </label>
        )}
      </div>
    </div>
  );
};

export default WordSelector;
