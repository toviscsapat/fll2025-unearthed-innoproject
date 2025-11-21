import React, { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

const WordSelector = () => {
  const firstColumn = ['V', 'SZ', 'CS', 'P', ''];
  const secondColumn = ['Á', 'E', 'O', 'A', ''];
  const thirdColumn = ['R', 'T', 'H', 'K', ''];
  const fourthColumn = ['D', 'T', 'A', 'S', ''];
  const fifthColumn = ['A', 'O', 'J', 'S', ''];
  const alphabet = 'AÁBCDEÉFGHIÍJKLMNOÓÖŐPQRSTUÚÜŰVWXYZ-'.split('');
  
  const [selectedLetters, setSelectedLetters] = useState([0, 0, 0, 0, 0]);
  const [submittedWord, setSubmittedWord] = useState('');
  const [isCorrect, setIsCorrect] = useState(null);
  const correctWord = 'CSATA-';

  const handleUp = (index) => {
    setSelectedLetters(prev => {
      const newLetters = [...prev];
      const letters = index === 0 ? firstColumn : index === 1 ? secondColumn : index === 2 ? thirdColumn : index === 3 ? fourthColumn : alphabet;
      newLetters[index] = (newLetters[index] + 1) % letters.length;
      return newLetters;
    });
  };

  const handleDown = (index) => {
    setSelectedLetters(prev => {
      const newLetters = [...prev];
      const letters = index === 0 ? firstColumn : index === 1 ? secondColumn : index === 2 ? thirdColumn : index === 3 ? fourthColumn : alphabet;
      newLetters[index] = (newLetters[index] - 1 + letters.length) % letters.length;
      return newLetters;
    });
  };

  const handleSubmit = () => {
    const word = selectedLetters.map((letterIndex, index) => {
      const letters = index === 0 ? firstColumn : index === 1 ? secondColumn : index === 2 ? thirdColumn : index === 3 ? fourthColumn : alphabet;
      return letters[letterIndex];
    }).join('');
    setSubmittedWord(word);
    setIsCorrect(word === correctWord);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full">
        <h1 className="text-3xl font-bold text-center text-indigo-600 mb-8">
          Szó kiválasztó
        </h1>
        
        <div className="flex justify-center gap-4 mb-8">
          {[0, 1, 2, 3, 4].map((index) => (
            <div key={index} className="flex flex-col items-center">
              <button
                onClick={() => handleUp(index)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors mb-2"
              >
                <ChevronUp className="w-6 h-6 text-indigo-600" />
              </button>
              
              <div className="w-16 h-20 bg-indigo-500 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-4xl font-bold text-white">
                  {index === 0 ? firstColumn[selectedLetters[index]] : 
                   index === 1 ? secondColumn[selectedLetters[index]] : 
                   index === 2 ? thirdColumn[selectedLetters[index]] : 
                   index === 3 ? fourthColumn[selectedLetters[index]] :
                   alphabet[selectedLetters[index]]}
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
          <div className={`mt-8 p-4 border-2 rounded-lg ${
            isCorrect 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <p className="text-center text-lg">
              <span className={`font-semibold ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                {isCorrect ? 'Helyes! 🎉' : 'Helytelen'}
              </span>
              <br />
              <span className={`text-2xl font-bold ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
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