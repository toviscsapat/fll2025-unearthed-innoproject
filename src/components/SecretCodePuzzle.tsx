import { ChevronDown, ChevronUp, Wrench } from 'lucide-react';
import React, { useState } from 'react';
export const CONFIG_FILENAME = 'secret-code-puzzle.json';

export interface SecretCodePuzzleConfig {
  secretMessage: string;
  correctAnswer: number[];
  question?: string;
}

interface SecretCodePuzzleProps {
  config: SecretCodePuzzleConfig;
  onSolved?: () => void;
  showUpload?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
// eslint-disable-next-line react/prop-types
const SecretCodePuzzle: React.FC<SecretCodePuzzleProps> = ({ config, onSolved, showUpload }) => {
  const [currentConfig, setCurrentConfig] = useState<SecretCodePuzzleConfig>(config);
  const [configError, setConfigError] = useState<string | null>(null);

  const [cubes, setCubes] = useState(currentConfig.correctAnswer.map(() => 0));
  const [message, setMessage] = useState('');
  const [result, setResult] = useState<boolean | null>(null);

  const CHIPER = {
    A: '◐',
    B: '◑',
    C: '◒',
    D: '◓',
    E: '◔',
    F: '◕',
    G: '◖',
    H: '◗',
    I: '◘',
    J: '◙',
    K: '◚',
    L: '◛',
    M: '◜',
    N: '◝',
    O: '◞',
    P: '◟',
    Q: '◠',
    R: '◡',
    S: '◢',
    T: '◣',
    U: '◤',
    V: '◥',
    W: '◦',
    X: '◧',
    Y: '◨',
    Z: '◩',
    ' ': '⬚',
  };

  const encryptedWord = currentConfig.secretMessage;

  const rotateCube = (index: number, direction: 'up' | 'down') => {
    const newCubes = [...cubes];
    if (direction === 'up') {
      newCubes[index] = newCubes[index] === 9 ? 0 : newCubes[index] + 1;
    } else {
      newCubes[index] = newCubes[index] === 0 ? 9 : newCubes[index] - 1;
    }
    setCubes(newCubes);
    setMessage('');
    setResult(null);
  };

  const checkAnswer = () => {
    const correct = currentConfig.correctAnswer;
    const ok = cubes.length === correct.length && cubes.every((v, i) => v === correct[i]);
    if (ok) {
      setMessage('Gratulálok, megfejtetted!');
      setResult(true);
    } else {
      setMessage('Rossz válasz!');
      setResult(false);
      // Reset cubes to 0 after incorrect submission
      setCubes(currentConfig.correctAnswer.map(() => 0));
    }
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
        // try eval for JS exports
        // eslint-disable-next-line no-eval
        parsed = eval('(' + text + ')');
      }
      setCurrentConfig(parsed as SecretCodePuzzleConfig);
      setConfigError(null);
      setCubes((parsed as SecretCodePuzzleConfig).correctAnswer.map(() => 0));
      setMessage('');
      setResult(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setConfigError('Hiba a konfiguráció betöltésekor: ' + message);
    }
    e.currentTarget.value = '';
  };

  React.useEffect(() => {
    if (result) {
      const timer = setTimeout(() => onSolved?.(), 0);
      return () => clearTimeout(timer);
    }
  }, [result, onSolved]);

  return (
    <div className="min-h-screen bg-purple-600 flex items-center justify-center p-8">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-2xl w-full relative">
        <h1 className="text-3xl font-bold text-purple-800 mb-6 text-center">Fejtsd meg!</h1>

        <div className="bg-purple-50 p-6 rounded-lg mb-6">
          <p className="text-4xl text-center tracking-widest font-mono text-purple-900 mb-4">
            {encryptedWord}
          </p>
        </div>

        {/* Upload moved to bottom-right */}

        {configError && (
          <div className="mb-4 text-center text-red-700 bg-red-100 p-3 rounded-lg">
            {configError}
          </div>
        )}

        <div className="bg-gray-50 p-4 rounded-lg mb-8">
          <h3 className="font-semibold text-purple-800 mb-3">Megoldó kulcs:</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {Object.entries(CHIPER).map(([letter, symbol]) => (
              <div key={letter} className="flex items-center gap-2">
                <span className="font-bold text-purple-700">
                  {letter === ' ' ? 'SZÓKÖZ' : letter}:
                </span>
                <span className="text-2xl">{symbol}</span>
              </div>
            ))}
          </div>
        </div>

        <h2 className="text-2xl font-bold text-purple-800 mb-4 text-center">
          {currentConfig.question || 'Mikor történt?'}
        </h2>
        <p className="text-center text-purple-700 mb-6">Állítsd be a helyes kombinációt!</p>

        <div className="flex justify-center gap-4 mb-6">
          {cubes.map((value, index) => (
            <div key={index} className="flex flex-col items-center gap-2">
              <button
                onClick={() => rotateCube(index, 'up')}
                className="bg-purple-500 hover:bg-purple-600 text-white p-2 rounded-lg transition shadow-md"
                aria-label="Növelés"
              >
                <ChevronUp size={24} />
              </button>
              <div className="bg-purple-700 text-white text-4xl font-bold w-20 h-20 flex items-center justify-center rounded-xl shadow-inner border-2 border-purple-500">
                {value}
              </div>
              <button
                onClick={() => rotateCube(index, 'down')}
                className="bg-purple-500 hover:bg-purple-600 text-white p-2 rounded-lg transition shadow-md"
                aria-label="Csökkentés"
              >
                <ChevronDown size={24} />
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={checkAnswer}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition text-lg"
        >
          Beküldés
        </button>

        {message && (
          <div
            className={`mt-6 p-4 rounded-lg text-center font-bold text-lg ${
              message.includes('Gratulálok')
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {message}
          </div>
        )}

        {showUpload && (
          <label
            className="absolute bottom-4 right-4 p-2 rounded-lg cursor-pointer text-indigo-600 hover:text-indigo-800 shadow-md bg-white/0"
            title="Konfiguráció betöltése"
          >
            <Wrench className="w-6 h-6" />
            <input type="file" accept=".json,.js" onChange={handleFileUpload} className="hidden" />
          </label>
        )}
      </div>
    </div>
  );
};

export default SecretCodePuzzle;
