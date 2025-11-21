import { Check, RefreshCw, X } from 'lucide-react';
import React, { useState } from 'react';

export interface ItalianStateAnswer {
  id: number;
  text: string;
  startsWith: string;
  wordCount: number;
}

export interface ItalianStatesQuizConfig {
  answers: ItalianStateAnswer[];
  initialNumber: number;
  numberOptions: number[];
}

interface ItalianStatesQuizProps {
  config?: ItalianStatesQuizConfig;
  onSolved?: () => void;
}

const DEFAULT_CONFIG: ItalianStatesQuizConfig = {
  answers: [
    { id: 1, text: 'Pápai Állam', startsWith: 'P', wordCount: 2 },
    { id: 2, text: 'Szardínia-Piemont Királyság', startsWith: 'Sz', wordCount: 2 },
    { id: 3, text: 'Lombardia-Velence Királyság', startsWith: 'L', wordCount: 2 },
    { id: 4, text: 'Parmai Hercegség', startsWith: 'P', wordCount: 2 },
    { id: 5, text: 'Toszkánai Nagy Hercegség', startsWith: 'T', wordCount: 3 },
    { id: 6, text: 'Nápoly és Szicília Királysága', startsWith: 'N', wordCount: 4 },
    { id: 7, text: 'Modenai és Reggiói Hercegség', startsWith: 'M', wordCount: 4 },
    { id: 8, text: 'Lukkai Hercegség', startsWith: 'L', wordCount: 2 },
  ],
  initialNumber: 7,
  numberOptions: [3, 4, 5, 6, 7, 8, 9, 10, 12, 15],
};

const ItalianStatesQuiz: React.FC<ItalianStatesQuizProps> = ({ config, onSolved }) => {
  const cfg = config || DEFAULT_CONFIG;
  const [number, setNumber] = useState<number>(cfg.initialNumber);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState<boolean>(false);

  const getCorrectAnswer = (): ItalianStateAnswer => {
    if (number % 2 === 0) {
      return cfg.answers.find((a) => a.startsWith === 'P')!;
    } else if (number % 3 === 0) {
      return cfg.answers.find((a) => a.wordCount === 4)!;
    } else if (number % 5 === 0) {
      return cfg.answers.find((a) => a.startsWith === 'Sz')!;
    } else {
      return cfg.answers.find((a) => a.startsWith === 'L')!;
    }
  };

  const correctAnswer = getCorrectAnswer();

  const getAnswerOptions = (): ItalianStateAnswer[] => {
    const correct = correctAnswer;
    const pAnswer = cfg.answers.find((a) => a.startsWith === 'P' && a.id !== correct.id);
    const lAnswer = cfg.answers.find((a) => a.startsWith === 'L' && a.id !== correct.id);
    const fourWordAnswer = cfg.answers.find((a) => a.wordCount === 4 && a.id !== correct.id);
    const szAnswer = cfg.answers.find((a) => a.startsWith === 'Sz' && a.id !== correct.id);

    const allOptions = [correct, pAnswer, lAnswer, fourWordAnswer, szAnswer].filter(
      Boolean
    ) as ItalianStateAnswer[];
    if (allOptions.length < 5) {
      const remaining = cfg.answers.filter((a) => !allOptions.includes(a));
      allOptions.push(...remaining.slice(0, 5 - allOptions.length));
    }
    return allOptions.sort(() => Math.random() - 0.5);
  };

  const [answerOptions, setAnswerOptions] = useState<ItalianStateAnswer[]>(getAnswerOptions());

  const selectAnswer = (answerId: number) => {
    if (showResult) return;
    setSelectedAnswer(answerId);
  };

  const checkAnswer = () => setShowResult(true);

  const reset = () => {
    setSelectedAnswer(null);
    setShowResult(false);
    setAnswerOptions(getAnswerOptions());
  };

  const changeNumber = (newNumber: number) => {
    setNumber(newNumber);
    setSelectedAnswer(null);
    setShowResult(false);
    setAnswerOptions(getAnswerOptions());
  };

  const isCorrect = showResult && selectedAnswer === correctAnswer.id;

  React.useEffect(() => {
    if (isCorrect) setTimeout(() => onSolved?.(), 0);
  }, [isCorrect, onSolved]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border-t-4 border-blue-600">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
              🇮🇹 Olasz Államok Kvíz
            </h1>
            <p className="text-gray-600">Válaszd ki a helyes választ!</p>
          </div>

          <div className="bg-blue-50 rounded-xl p-6 mb-6 border-2 border-blue-200">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Változtasd meg az olasz államok számát:
            </label>
            <div className="flex gap-2 flex-wrap">
              {cfg.numberOptions.map((num) => (
                <button
                  key={num}
                  onClick={() => changeNumber(num)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${number === num ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-700 hover:bg-blue-100 border border-gray-300'}`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 mb-6 border-2 border-green-300">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">
              A(z) <span className="text-blue-700 text-3xl font-black">{number}</span> db olasz
              államból melyiknek volt a vezetője II. Viktor Emánuel?
            </h2>
          </div>

          <div className="bg-yellow-50 rounded-xl p-4 md:p-6 mb-6 border-2 border-yellow-200">
            <h3 className="font-bold text-gray-800 mb-3 text-lg">📋 Döntési szabályok:</h3>
            <ul className="space-y-2 text-sm md:text-base text-gray-700">
              <li>
                ✓ Ha a szám <strong>páros</strong>, akkor a válasz <strong>&quot;P&quot;</strong>{' '}
                betűvel kezdődik
              </li>
              <li>
                ✓ Különben ha <strong>hárommal osztható</strong>, a válasz{' '}
                <strong>négy szóból</strong> áll
              </li>
              <li>
                ✓ Különben ha <strong>öttel osztható</strong>, a válasz{' '}
                <strong>&quot;Sz&quot;</strong> betűvel kezdődik
              </li>
              <li>
                ✓ Különben <strong>&quot;L&quot;</strong> betűvel kezdődik
              </li>
            </ul>
          </div>

          <div className="space-y-3 mb-6">
            <h3 className="font-bold text-gray-800 text-lg mb-4">Válaszd ki a helyes választ:</h3>
            {answerOptions.map((answer) => {
              const isSelected = selectedAnswer === answer.id;
              const isThisCorrect = answer.id === correctAnswer.id;
              let containerClass = 'bg-white border-2 border-gray-300';
              let radioClass = 'border-gray-400';
              if (showResult) {
                if (isThisCorrect) {
                  containerClass = 'bg-green-100 border-green-500';
                  if (isSelected) radioClass = 'border-green-600 bg-green-600';
                } else if (isSelected) {
                  containerClass = 'bg-red-100 border-red-500';
                  radioClass = 'border-red-600 bg-red-600';
                }
              } else if (isSelected) {
                containerClass = 'bg-blue-50 border-blue-500';
                radioClass = 'border-blue-600 bg-blue-600';
              }
              return (
                <div
                  key={answer.id}
                  onClick={() => selectAnswer(answer.id)}
                  className={`${containerClass} rounded-xl p-4 cursor-pointer transition-all duration-200 hover:shadow-md flex items-center gap-4`}
                >
                  <div
                    className={`w-6 h-6 rounded-full border-2 ${radioClass} flex items-center justify-center flex-shrink-0 transition-all`}
                  >
                    {isSelected && <div className="w-3 h-3 rounded-full bg-white" />}
                  </div>
                  <span className="text-gray-800 font-medium text-base md:text-lg flex-grow">
                    {answer.text}
                  </span>
                  {showResult && isThisCorrect && !isSelected && (
                    <Check className="text-green-600" size={24} />
                  )}
                  {showResult && !isThisCorrect && isSelected && (
                    <X className="text-red-600" size={24} />
                  )}
                </div>
              );
            })}
          </div>

          {showResult && (
            <div
              className={`rounded-xl p-6 mb-6 border-2 ${isCorrect ? 'bg-green-50 border-green-400' : 'bg-red-50 border-red-400'}`}
            >
              <h3 className={`text-2xl font-bold ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                {isCorrect ? '✅ Helyes válasz!' : '❌ Nem helyes, próbáld újra!'}
              </h3>
            </div>
          )}

          <div className="flex gap-3 flex-col sm:flex-row">
            {!showResult ? (
              <button
                onClick={checkAnswer}
                disabled={selectedAnswer === null}
                className={`flex-1 py-4 rounded-xl font-bold text-lg transition-all ${selectedAnswer === null ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'}`}
              >
                Ellenőrzés
              </button>
            ) : (
              <button
                onClick={reset}
                className="flex-1 bg-gray-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-gray-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                <RefreshCw size={20} /> Újra próbálom
              </button>
            )}
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600">
              <strong>💡 Történelmi tény:</strong> II. Viktor Emánuel a Szardínia-Piemont Királyság
              uralkodója volt (1849-1861), majd Olaszország első királya lett (1861-1878) az
              egyesítés után.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItalianStatesQuiz;
