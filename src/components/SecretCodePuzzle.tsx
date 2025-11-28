import React, { useState } from 'react';
import { RotateCw } from 'lucide-react';

export default function CipherPuzzle() {
  const [cubes, setCubes] = useState([1, 1, 1, 1]);
  const [message, setMessage] = useState('');

  const cipher = {
    'A': '◐', 'B': '◑', 'C': '◒', 'D': '◓', 'E': '◔',
    'F': '◕', 'G': '◖', 'H': '◗', 'I': '◘', 'J': '◙',
    'K': '◚', 'L': '◛', 'M': '◜', 'N': '◝', 'O': '◞',
    'P': '◟', 'Q': '◠', 'R': '◡', 'S': '◢', 'T': '◣',
    'U': '◤', 'V': '◥', 'W': '◦', 'X': '◧', 'Y': '◨',
    'Z': '◩'
  };

  const encryptedWord = '◢◞◛◕◔◡◞◝◘';

  const rotateCube = (index) => {
    const newCubes = [...cubes];
    newCubes[index] = newCubes[index] === 9 ? 1 : newCubes[index] + 1;
    setCubes(newCubes);
    setMessage('');
  };

  const checkAnswer = () => {
    if (cubes[0] === 1 && cubes[1] === 8 && cubes[2] === 5 && cubes[3] === 9) {
      setMessage('Gratulálok, megfejtetted!');
    } else {
      setMessage('Rossz válasz!');
    }
  };

  return (
    <div className="min-h-screen bg-purple-600 flex items-center justify-center p-8">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-2xl w-full">
        <h1 className="text-3xl font-bold text-purple-800 mb-6 text-center">
          Fejdsd meg!
        </h1>

        <div className="bg-purple-50 p-6 rounded-lg mb-6">
          <p className="text-4xl text-center tracking-widest font-mono text-purple-900 mb-4">
            {encryptedWord}
          </p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg mb-8">
          <h3 className="font-semibold text-purple-800 mb-3">Megoldó kulcs:</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {Object.entries(cipher).map(([letter, symbol]) => (
              <div key={letter} className="flex items-center gap-2">
                <span className="font-bold text-purple-700">{letter}:</span>
                <span className="text-2xl">{symbol}</span>
              </div>
            ))}
          </div>
        </div>

        <h2 className="text-2xl font-bold text-purple-800 mb-4 text-center">
          Mikor történt?
        </h2>
        <p className="text-center text-purple-700 mb-6">
          Állítsd be a helyes kombinációt!
        </p>

        <div className="flex justify-center gap-4 mb-6">
          {cubes.map((value, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className="bg-purple-700 text-white text-4xl font-bold w-20 h-20 flex items-center justify-center rounded-lg shadow-lg mb-2">
                {value}
              </div>
              <button
                onClick={() => rotateCube(index)}
                className="bg-purple-500 hover:bg-purple-600 text-white p-2 rounded-full transition"
              >
                <RotateCw size={20} />
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
          <div className={`mt-6 p-4 rounded-lg text-center font-bold text-lg ${
            message.includes('Gratulálok') 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
