import { RefreshCw, Wrench } from 'lucide-react';
import React, { useState } from 'react';
export const CONFIG_FILENAME = 'italian-states-quiz.json';

interface ItalianStateAnswer {
  id: number;
  text: string;
}

export interface ItalianStatesQuizConfig {
  answers: ItalianStateAnswer[];
  numberOptions: number[];
  solution: { answer: number; option: number };
  // optional UI metadata coming from newer config format
  title?: string;
  numberTitle?: string;
  questionTemplate?: string; // use '#' as placeholder for number
  hints?: string[];
}

interface ItalianStatesQuizProps {
  config: ItalianStatesQuizConfig;
  onSolved?: () => void;
  showUpload?: boolean;
}

const ItalianStatesQuiz: React.FC<ItalianStatesQuizProps> = ({ config, onSolved, showUpload }) => {
  const normalize = (cfg: unknown): ItalianStatesQuizConfig => {
    if (!cfg) {
      return {
        answers: [],
        numberOptions: [5],
        solution: { answer: 1, option: 5 },
      };
    }
    // try narrowing
    const asObj = cfg as Record<string, unknown>;
    // already normalized
    if (
      asObj.answers &&
      Array.isArray(asObj.answers) &&
      asObj.numberOptions &&
      Array.isArray(asObj.numberOptions)
    ) {
      return asObj as unknown as ItalianStatesQuizConfig;
    }

    // new nested format
    const answers =
      (asObj.followup && (asObj.followup as Record<string, unknown>).answers) ??
      (asObj.answers as ItalianStateAnswer[] | undefined);
    const numberOptions = ((asObj.number_choice &&
      (asObj.number_choice as Record<string, unknown>).options) ??
      (asObj.numberOptions as number[] | undefined) ?? [5]) as number[];
    let solutionVal: { answer: number; option: number } | undefined = undefined;
    if (asObj.solution && typeof asObj.solution === 'object') {
      const sol = asObj.solution as Record<string, unknown>;
      const ans = typeof sol.answer === 'number' ? (sol.answer as number) : undefined;
      const opt = typeof sol.option === 'number' ? (sol.option as number) : undefined;
      if (typeof ans === 'number' && typeof opt === 'number') {
        solutionVal = { answer: ans, option: opt };
      }
    }
    const solution = solutionVal ?? { answer: 1, option: 5 };
    const title = asObj.title as string | undefined;
    const numberTitle = (asObj.number_choice &&
      (asObj.number_choice as Record<string, unknown>).title) as string | undefined;
    const questionTemplate = (asObj.followup &&
      (asObj.followup as Record<string, unknown>).question) as string | undefined;
    const hints = ((asObj.followup && (asObj.followup as Record<string, unknown>).hints) ??
      (asObj.hints as string[] | undefined)) as string[] | undefined;
    return {
      answers: answers ?? [],
      numberOptions,
      solution,
      title,
      numberTitle,
      questionTemplate,
      hints,
    } as ItalianStatesQuizConfig;
  };

  const [currentConfig, setCurrentConfig] = useState<ItalianStatesQuizConfig>(normalize(config));
  const [configError, setConfigError] = useState<string | null>(null);

  const [number, setNumber] = useState<number | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);

  // A helyes válasz MINDIG a Szárd-Piemonti Királyság
  const correctAnswer = currentConfig.answers.find((a) => a.id === currentConfig.solution.answer)!;

  const isCorrectNumber = number === currentConfig.solution.option;

  const computeOptionsByCount = React.useCallback(
    (count: number | null): ItalianStateAnswer[] => {
      const actual = count === null ? currentConfig.answers.length : count;
      return computeOptionsFrom(currentConfig, actual);
    },
    [currentConfig]
  );

  const computeOptionsFrom = (
    cfg: ItalianStatesQuizConfig,
    count: number
  ): ItalianStateAnswer[] => {
    const all = [...(cfg.answers || [])];
    const clamped = Math.max(0, Math.min(count, all.length));
    if (all.length <= clamped) return all.slice();

    const correctId = cfg.solution?.answer;
    const correct = all.find((a) => a.id === correctId);
    const others = all.filter((a) => a.id !== correctId);

    // shuffle others
    for (let i = others.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [others[i], others[j]] = [others[j], others[i]];
    }

    const needed = clamped - (correct ? 1 : 0);
    const picked = others.slice(0, Math.max(0, needed));

    const result = correct ? [correct, ...picked] : picked;

    // shuffle final so correct isn't always first
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  };

  const getAnswerOptions = React.useCallback((): ItalianStateAnswer[] => {
    return computeOptionsByCount(number);
  }, [computeOptionsByCount, number]);

  const [answerOptions, setAnswerOptions] = useState<ItalianStateAnswer[]>(() =>
    // when no number selected, show all answers
    currentConfig.answers.slice()
  );

  // when the configuration object changes, reset number and options
  React.useEffect(() => {
    // do not pre-select a number; show all answers until user chooses
    setNumber(null);
    setAnswerOptions(currentConfig.answers.slice());
  }, [currentConfig]);

  const selectAnswer = (answerId: number) => {
    if (showResult) return;
    setSelectedAnswer(answerId);
  };

  const checkAnswer = () => {
    const correct = selectedAnswer === correctAnswer?.id && isCorrectNumber;
    setIsCorrect(!!correct);
    setShowResult(true);
    if (correct && typeof onSolved === 'function') {
      try {
        onSolved();
      } catch (err) {
        // ignore callback errors
      }
    }
  };

  const reset = () => {
    setSelectedAnswer(null);
    setShowResult(false);
    // always show all answers regardless of previously selected number
    setAnswerOptions(currentConfig.answers.slice());
  };

  const changeNumber = (newNumber: number) => {
    setNumber(newNumber);
    setSelectedAnswer(null);
    setShowResult(false);
    // keep showing all answers even when a number is chosen
    setAnswerOptions(currentConfig.answers.slice());
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      let parsed: unknown;
      try {
        parsed = JSON.parse(text);
      } catch {
        // try to evaluate JS-like exports
        const cleaned = text.trim();
        if (cleaned.startsWith('const') || cleaned.startsWith('export')) {
          // eslint-disable-next-line no-eval
          parsed = eval('(' + cleaned + ')');
        } else {
          throw new Error('Nem sikerült JSON-ként olvasni a fájlt.');
        }
      }
      const parsedCfg = normalize(parsed);
      setCurrentConfig(parsedCfg);
      setConfigError(null);
      // do not preselect a number after upload — show all answers
      setNumber(null);
      setSelectedAnswer(null);
      setShowResult(false);
      setAnswerOptions(parsedCfg.answers.slice());
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setConfigError('Hiba a konfiguráció betöltésekor: ' + message);
    }
    e.currentTarget.value = '';
  };

  // Csak akkor helyes, ha a Szárd-Piemonti Királyságot választották ÉS a szám 5
  // isCorrect state set when checking the answer

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border-t-4 border-blue-600 relative">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
              {currentConfig.title ?? ''}
            </h1>
            <p className="text-gray-600">Válaszd ki a helyes választ!</p>
          </div>

          <div className="bg-blue-50 rounded-xl p-6 mb-6 border-2 border-blue-200">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              {currentConfig.numberTitle ?? 'Változtasd meg a számot:'}
            </label>
            <div className="flex gap-2 flex-wrap">
              {currentConfig.numberOptions.map((num) => (
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

          {/* Upload moved to bottom-right */}

          {configError && (
            <div className="mb-6 bg-red-100 text-red-800 p-3 rounded-lg text-center">
              {configError}
            </div>
          )}

          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 mb-6 border-2 border-green-300">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">
              {currentConfig.questionTemplate ? (
                <span
                  dangerouslySetInnerHTML={{
                    __html: (currentConfig.questionTemplate as string).replace(
                      '#',
                      `<span class="text-blue-700 text-3xl font-black">${number === null ? '—' : number}</span>`
                    ),
                  }}
                />
              ) : (
                '(Kérdés)'
              )}
            </h2>
          </div>

          {currentConfig.hints && currentConfig.hints.length > 0 && (
            <div className="bg-yellow-50 rounded-xl p-4 md:p-6 mb-6 border-2 border-yellow-200">
              <h3 className="font-bold text-gray-800 mb-3 text-lg">📋 Döntési segítség:</h3>
              <ul className="space-y-2 text-sm md:text-base text-gray-700">
                {currentConfig.hints.map((h, i) => (
                  <li key={i} dangerouslySetInnerHTML={{ __html: h }} />
                ))}
              </ul>
            </div>
          )}

          <div className="space-y-3 mb-6">
            <h3 className="font-bold text-gray-800 text-lg mb-4">Válaszd ki a helyes választ:</h3>
            {answerOptions.map((answer) => {
              const isSelected = selectedAnswer === answer.id;
              let containerClass = 'bg-white border-2 border-gray-300';
              let radioClass = 'border-gray-400';

              if (isSelected) {
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
                </div>
              );
            })}
          </div>

          {showResult && (
            <div
              className={`rounded-xl p-6 mb-6 border-2 ${isCorrect ? 'bg-green-50 border-green-400' : 'bg-red-50 border-red-400'}`}
            >
              <h3 className={`text-2xl font-bold ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                {isCorrect ? '✅ Túlélted!' : '💣 Felrobbantál!'}
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

          {showUpload && (
            <label
              className="absolute bottom-4 right-4 p-2 rounded-lg cursor-pointer text-indigo-600 hover:text-indigo-800 shadow-md bg-white/0"
              title="Konfiguráció betöltése"
            >
              <Wrench className="w-6 h-6" />
              <input
                type="file"
                accept=".json,.js"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          )}
        </div>
      </div>
    </div>
  );
};

export default ItalianStatesQuiz;
