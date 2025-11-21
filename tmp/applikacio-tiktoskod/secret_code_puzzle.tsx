import React, { useState } from 'react';
import { Lock, Key, RotateCw } from 'lucide-react';

export default function SecretCodePuzzle() {
  const [dice, setDice] = useState([1, 1, 1, 1]);
  const [result, setResult] = useState('');
  const correctAnswer = [1, 8, 5, 9];

  const updateDice = (index, value) => {
    const newDice = [...dice];
    newDice[index] = value;
    setDice(newDice);
    setResult('');
  };

  const rotateDice = (index) => {
    const newValue = dice[index] === 9 ? 1 : dice[index] + 1;
    updateDice(index, newValue);
  };

  const checkAnswer = () => {
    const isCorrect = dice.every((val, idx) => val === correctAnswer[idx]);
    setResult(isCorrect ? 'correct' : 'wrong');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Titkos üzenet */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 mb-8 border border-white/20 shadow-2xl">
          <div className="flex items-center gap-3 mb-4">
            <Lock className="text-yellow-300" size={28} />
            <h2 className="text-2xl font-bold text-white">Titkos Üzenet</h2>
          </div>
          <div className="bg-black/30 rounded-lg p-6 font-mono text-center">
            <p className="text-3xl text-green-400 tracking-wider">
              19-15-12-6-5-18-9-14-15-9
            </p>
          </div>
        </div>

        {/* Megoldó kulcs */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 mb-8 border border-white/20 shadow-2xl">
          <div className="flex items-center gap-3 mb-4">
            <Key className="text-yellow-300" size={28} />
            <h2 className="text-2xl font-bold text-white">Megoldó Kulcs</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-white/90">
            <div className="bg-black/20 p-3 rounded text-center">A=1, B=2, C=3</div>
            <div className="bg-black/20 p-3 rounded text-center">D=4, E=5, F=6</div>
            <div className="bg-black/20 p-3 rounded text-center">G=7, H=8, I=9</div>
            <div className="bg-black/20 p-3 rounded text-center">J=10, K=11, L=12</div>
            <div className="bg-black/20 p-3 rounded text-center">M=13, N=14, O=15</div>
            <div className="bg-black/20 p-3 rounded text-center">P=16, Q=17, R=18</div>
            <div className="bg-black/20 p-3 rounded text-center">S=19, T=20, U=21</div>
            <div className="bg-black/20 p-3 rounded text-center">V=22, W=23, X=24</div>
            <div className="bg-black/20 p-3 rounded text-center">Y=25, Z=26</div>
          </div>
        </div>

        {/* Kockák */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 mb-6 border border-white/20 shadow-2xl">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            Állítsd be a helyes kombinációt!
          </h2>
          <div className="flex justify-center gap-4 mb-6">
            {dice.map((value, index) => (
              <div key={index} className="flex flex-col items-center gap-2">
                <div className="w-20 h-20 bg-white rounded-xl shadow-lg flex items-center justify-center text-4xl font-bold text-purple-900">
                  {value}
                </div>
                <button
                  onClick={() => rotateDice(index)}
                  className="p-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
                  aria-label={`Forgasd a ${index + 1}. kockát`}
                >
                  <RotateCw className="text-white" size={20} />
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={checkAnswer}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-4 px-8 rounded-xl text-xl transition-all transform hover:scale-105 shadow-lg"
          >
            Beküldés
          </button>
        </div>

        {/* Eredmény */}
        {result && (
          <div className={`rounded-2xl p-6 text-center text-xl font-bold animate-pulse ${
            result === 'correct' 
              ? 'bg-green-500/90 text-white' 
              : 'bg-red-500/90 text-white'
          }`}>
            {result === 'correct' ? '🎉 Gratulálok, Megfejtetted! 🎉' : '❌ Rossz válasz!'}
          </div>
        )}
      </div>
    </div>
  );
}