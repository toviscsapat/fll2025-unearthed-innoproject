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
  correct_letters: ['CS', 'A', 'T', 'A', ''],
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

  const [selectedLetters, setSelectedLetters] = useState<number[]>(
    Array(cfg.number_of_selectable_letters).fill(0)
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
  };

  const handleDown = (index: number) => {
    setSelectedLetters((prev) => {
      const next = [...prev];
      const letters = columns[index];
      next[index] = (next[index] - 1 + letters.length) % letters.length;
      return next;
    });
  };

  const handleSubmit = () => {
    const word = selectedLetters
      .map((letterIndex, idx) => {
        return columns[idx][letterIndex];
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

        <div className="bg-blue-50 border-2 border-indigo-200 rounded-lg p-6 mb-8">
          <p className="text-center text-indigo-900 font-semibold mb-4">
            Keresd meg a választ és olvasd össze a betűket! A helyes megoldást írd be a szövegdobozba.
          </p>
          
          <div className="space-y-4 text-sm text-gray-800">
            <div>
              <p className="font-bold text-indigo-700 mb-2">1</p>
              <p>Ha Itália a Fekete tenger mellett fekszik akkor- V</p>
              <p>Ha Németország szomszédos volt Olaszországgal akkor- Sz</p>
              <p>Ha a mostani Róma 1870-ben csatlakozott Olaszországhoz akkor- Cs</p>
              <p>Ha Pizza szomszédos Olaszországgal akkor- P</p>
            </div>

            <div>
              <p className="font-bold text-indigo-700 mb-2">2</p>
              <p>Ha a "Vörös sereget" Giuseppe Garibaldi vezette akkor- Á</p>
              <p>Giuseppe Garibaldi csak halála előtt pár évvel lett híres akkor- E</p>
              <p>Amikor számüzetésbe küldték éppen a Habsburg birodalomban tartózkodott- O</p>
              <p>Ha Garibaldi 1807-1882 ig élt akkor- A</p>
            </div>

            <div>
              <p className="font-bold text-indigo-700 mb-2">3</p>
              <p>Otto von Bismarck Franciaország egyik leghíresebb politikusa volt- R</p>
              <p>Bismarckot Vas kancellárnak "becézték"- T</p>
              <p>Garibaldi 1861-ben Szardíniába utazott- H</p>
              <p>Velence 1867-ben lett az olaszegység tagja- K</p>
            </div>

            <div>
              <p className="font-bold text-indigo-700 mb-2">4</p>
              <p>A salferóni csatát a Szárdok elvesztették- D</p>
              <p>A népek tavasza 1846-ban volt- T</p>
              <p>A közép-olasz területek egy része szövetséget kötött a szárd királlyal- A</p>
              <p>3. Napóleon Firenzénél csatázott 1859-ben- S</p>
            </div>
          </div>
        </div>

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
                {isCorrect ? 'Túl élted 😊' : 'Felrobbantál :('}
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
      </div>
    </div>
  );
};

export default WordSelector;
