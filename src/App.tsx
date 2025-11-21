import { useEffect, useState } from 'react';
import ItalianStatesQuiz from './components/ItalianStatesQuiz';
import SecretCodePuzzle from './components/SecretCodePuzzle';
import WireCuttingModule from './components/WireCuttingModule';
import WordSelector from './components/WordSelector';

import italianStatesQuizConfig from './config/italianStatesQuiz';
import secretCodePuzzleConfig from './config/secretCodePuzzle';
import wireModules from './config/wireModules';
import wordSelectorConfig from './config/wordSelector';

type ModuleKey = 'home' | 'wire' | 'secret' | 'word' | 'quiz';

export default function App() {
  const [active, setActive] = useState<ModuleKey>('home');
  const [solved, setSolved] = useState<Record<ModuleKey, boolean>>({
    home: false,
    wire: false,
    secret: false,
    word: false,
    quiz: false,
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem('solvedModules');
      if (raw) setSolved(JSON.parse(raw));
    } catch {
      // ignore
    }
  }, []);

  const markSolved = (key: ModuleKey) => {
    setSolved((prev) => {
      const next = { ...prev, [key]: true };
      try {
        localStorage.setItem('solvedModules', JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">Tövis Töri Tanár</h1>
          <nav className="flex gap-2">
            <button
              onClick={() => setActive('home')}
              className={`px-3 py-2 rounded ${solved.home ? 'bg-green-100 border border-green-300' : 'hover:bg-gray-100'}`}
            >
              Főoldal
            </button>
            <button
              onClick={() => setActive('wire')}
              className={`px-3 py-2 rounded ${solved.wire ? 'bg-green-100 border border-green-300' : 'hover:bg-gray-100'}`}
            >
              Drótvágó modul
            </button>
            <button
              onClick={() => setActive('secret')}
              className={`px-3 py-2 rounded ${solved.secret ? 'bg-green-100 border border-green-300' : 'hover:bg-gray-100'}`}
            >
              Titkos kód
            </button>
            <button
              onClick={() => setActive('word')}
              className={`px-3 py-2 rounded ${solved.word ? 'bg-green-100 border border-green-300' : 'hover:bg-gray-100'}`}
            >
              Szóválasztó
            </button>
            <button
              onClick={() => setActive('quiz')}
              className={`px-3 py-2 rounded ${solved.quiz ? 'bg-green-100 border border-green-300' : 'hover:bg-gray-100'}`}
            >
              Olasz kvíz
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        {active === 'home' && (
          <section>
            <h2 className="text-2xl font-bold mb-4">Üdvözlet</h2>
            <p className="mb-4">
              Válassz egy modult a fejlécből. A konfigurációk a <code>src/config/</code> mappában
              találhatók.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded">
                Drótvágó modul — interaktív történelem modul.
              </div>
              <div className="p-4 border rounded">Titkos kód — fejtsd meg az üzenetet.</div>
              <div className="p-4 border rounded">Szóválasztó — építs szavakat oszlopokból.</div>
              <div className="p-4 border rounded">Olasz államok kvíz — szabályalapú kvíz.</div>
            </div>

            <div className="mt-8 p-6 bg-white rounded shadow">
              <h3 className="text-xl font-semibold mb-3">Erről szól a játék</h3>
              <div className="prose max-w-none">
                <p>Tövis Töri Tanár – FLL innovációs projekt bemutatása</p>
                <p>
                  Mi egy 11-15 korú First Lego League csapat vagyunk, és egy online/offline formában
                  játszható, 7. osztályos történelem tanulást segítő társasjátékot fejlesztünk. A
                  játék moduláris (4–5 modul), négyfős csoportok játsszák, és célja, hogy a tanulást
                  érthetőbbé és élvezetesebbé tegye.
                </p>
                <p>
                  Jelenleg az olasz egység kialakulásának korszakát dolgozzuk fel; a rendszer online
                  felülettel működik, ahol folyamatosan érkeznek a feladatok. A játék együttműködést
                  és szereposztást igényel, így fejleszti a csapatmunkát és a történelmi
                  gondolkodást.
                </p>
                <p>
                  Ha egy modult megoldottatok, a modul gombja zöldre vált a fejlécben, jelezve a
                  sikeres teljesítést.
                </p>
                <p>
                  Később egy bomba időzítő is bekerül a játékba, amely növeli a feszültséget és
                  izgalmat, miközben a csapatok versenyeznek az idővel a feladatok megoldásában....
                </p>
                <p>
                  További információk és elérhetőségek megtalálhatók a projekt linkjein és közösségi
                  csatornáin.
                </p>
              </div>
            </div>
          </section>
        )}

        {active === 'wire' && (
          <WireCuttingModule config={wireModules} onSolved={() => markSolved('wire')} />
        )}
        {active === 'secret' && (
          <SecretCodePuzzle config={secretCodePuzzleConfig} onSolved={() => markSolved('secret')} />
        )}
        {active === 'word' && (
          <WordSelector config={wordSelectorConfig} onSolved={() => markSolved('word')} />
        )}
        {active === 'quiz' && (
          <ItalianStatesQuiz config={italianStatesQuizConfig} onSolved={() => markSolved('quiz')} />
        )}
      </main>
    </div>
  );
}
