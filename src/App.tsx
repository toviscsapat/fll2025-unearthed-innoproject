import confetti from 'canvas-confetti';
import { useEffect, useState } from 'react';
import Quiz, {
  CONFIG_FILENAME as QUIZ_CONFIG,
  QuizConfig,
} from './components/Quiz';
import SecretCodePuzzle, {
  CONFIG_FILENAME as SECRET_CONFIG,
  SecretCodePuzzleConfig,
} from './components/SecretCodePuzzle';
import WireCuttingModule, {
  CONFIG_FILENAME as WIRE_CONFIG,
  WireCuttingConfig,
} from './components/WireCuttingModule';
import WordSelector, {
  CONFIG_FILENAME as WORD_CONFIG,
  WordSelectorConfig,
} from './components/WordSelector';

// configs will be loaded dynamically depending on selected module

type ComponentKey = 'home' | 'wire' | 'secret' | 'word' | 'quiz';
type ModuleKey = '' | '5-romai' | '7-olasz' | 'dev';

export default function App() {
  // moduleKey determines which config folder to use
  const params = new URLSearchParams(window.location.search);
  const initialModule = params.get('module') ?? '';
  const [moduleKey, setModuleKey] = useState<ModuleKey>(initialModule as ModuleKey);
  // runtime-loaded configs
  const [quizConfig, setQuizConfig] = useState<
    QuizConfig | undefined
  >(undefined);
  const [secretCodePuzzleConfig, setSecretCodePuzzleConfig] = useState<
    SecretCodePuzzleConfig | undefined
  >(undefined);
  const [wireModules, setWireModules] = useState<WireCuttingConfig[] | undefined>(undefined);
  const [wordSelectorConfig, setWordSelectorConfig] = useState<WordSelectorConfig | undefined>(
    undefined
  );
  const [loading, setLoading] = useState<boolean>(false);

  // dynamic load configs when moduleKey changes
  useEffect(() => {
    let mounted = true;
    async function loadConfigs() {
      setLoading(true);
      try {
        if (moduleKey === 'dev') {
          setQuizConfig(undefined);
          setSecretCodePuzzleConfig(undefined);
          setWireModules(undefined);
          setWordSelectorConfig(undefined);
          return;
        }

        const folder = moduleKey as string;

        // helper to try import a filename from selected folder
        const tryImport = async (filename: string) => {
          try {
            if (filename.endsWith('.json')) {
              // fetch JSON to avoid MIME/type module errors
              const url = new URL(`./config/${folder}/${filename}`, import.meta.url).href;
              const res = await fetch(url);
              if (!res.ok) return undefined;
              return await res.json();
            }
            const mod = await import(`./config/${folder}/${filename}`);
            return mod.default || mod;
          } catch (e) {
            return undefined;
          }
        };

        const [quizCfg, secretCfg, wireCfg, wordCfg] = await Promise.all([
          tryImport(QUIZ_CONFIG),
          tryImport(SECRET_CONFIG),
          tryImport(WIRE_CONFIG),
          tryImport(WORD_CONFIG),
        ]);

        if (!mounted) return;
        setQuizConfig(quizCfg);
        setSecretCodePuzzleConfig(secretCfg);
        setWireModules(wireCfg);
        setWordSelectorConfig(wordCfg);
      } catch (err) {
        console.error('Failed to load configs', err);
      } finally {
        setLoading(false);
      }
    }
    loadConfigs();
    return () => {
      mounted = false;
    };
  }, [moduleKey]);

  // determine availability (in dev mode all modules are available)
  const hasWire = moduleKey === 'dev' ? true : !!wireModules;
  const hasSecret = moduleKey === 'dev' ? true : !!secretCodePuzzleConfig;
  const hasWord = moduleKey === 'dev' ? true : !!wordSelectorConfig;
  const hasQuiz = moduleKey === 'dev' ? true : !!quizConfig;

  // dev mode will render modules even when configs are missing; inline simple fallbacks are used below
  const [active, setActive] = useState<ComponentKey>('home');
  const [solved, setSolved] = useState<Record<ComponentKey, boolean>>({
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

  const markSolved = (key: ComponentKey) => {
    console.log(`Module solved: ${key}`);

    setSolved((prev) => {
      if (prev[key]) return prev;
      const next = { ...prev, [key]: true };
      try {
        localStorage.setItem('solvedModules', JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });

    // Always trigger effects on success, even if already solved
    console.log('Triggering confetti...', typeof confetti);
    try {
      const confettiFunc = (confetti as unknown as { default?: typeof confetti }).default || confetti;
      if (typeof confettiFunc === 'function') {
        confettiFunc({
          particleCount: 400,
          spread: 90,
          origin: { y: 0.6 },
          zIndex: 9999,
        });
      } else {
        console.error('Confetti is not a function:', confettiFunc);
      }
    } catch (err) {
      console.error('Confetti error:', err);
    }

    setTimeout(() => {
      console.log('Navigating back home...');
      setActive('home');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <header className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">Bombajó Töri</h1>
          {/* Module selector moved to footer */}
          <nav className="flex gap-2">
            <button
              onClick={() => setActive('home')}
              className={`px-3 py-2 rounded ${solved.home ? 'bg-green-100 border border-green-300' : 'hover:bg-gray-100'}`}
            >
              Főoldal
            </button>
            {hasWire && (
              <button
                onClick={() => setActive('wire')}
                className={`px-3 py-2 rounded ${solved.wire ? 'bg-green-100 border border-green-300' : 'hover:bg-gray-100'}`}
              >
                Drótvágó modul
              </button>
            )}
            {hasSecret && (
              <button
                onClick={() => setActive('secret')}
                className={`px-3 py-2 rounded ${solved.secret ? 'bg-green-100 border border-green-300' : 'hover:bg-gray-100'}`}
              >
                Titkos kód
              </button>
            )}
            {hasWord && (
              <button
                onClick={() => setActive('word')}
                className={`px-3 py-2 rounded ${solved.word ? 'bg-green-100 border border-green-300' : 'hover:bg-gray-100'}`}
              >
                Szóválasztó
              </button>
            )}
            {hasQuiz && (
              <button
                onClick={() => setActive('quiz')}
                className={`px-3 py-2 rounded ${solved.quiz ? 'bg-green-100 border border-green-300' : 'hover:bg-gray-100'}`}
              >
                Kvíz
              </button>
            )}
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 pb-28">
        {active === 'home' && (
          <section>
            <h2 className="text-2xl font-bold mb-4">Üdvözlet</h2>
            <p className="mb-4">
              Válassz egy modult a fejlécből. A konfigurációk a <code>src/config/</code> mappában
              találhatók.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {hasWire && (
                <div className="p-4 border rounded">
                  Drótvágó modul — interaktív történelem modul.
                </div>
              )}
              {hasSecret && (
                <div className="p-4 border rounded">Titkos kód — fejtsd meg az üzenetet.</div>
              )}
              {hasWord && (
                <div className="p-4 border rounded">Szóválasztó — építs szavakat oszlopokból.</div>
              )}
              {hasQuiz && (
                <div className="p-4 border rounded">Kvíz — szabályalapú kvíz.</div>
              )}
            </div>

            <div className="mt-8 p-6 bg-white rounded shadow">
              <h3 className="text-xl font-semibold mb-3">Erről szól a játék</h3>
              <div className="prose max-w-none">
                <p>Bombajó Töri: Tövis Töri Tanár – FLL innovációs projekt bemutatása</p>
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
          <div>
            <WireCuttingModule
              config={wireModules || []}
              onSolved={() => markSolved('wire')}
              showUpload={moduleKey === 'dev'}
            />
          </div>
        )}
        {active === 'secret' && (
          <div>
            {secretCodePuzzleConfig || moduleKey === 'dev' ? (
              <SecretCodePuzzle
                config={
                  moduleKey === 'dev'
                    ? { secretMessage: 'DEV', correctAnswer: [1], question: 'Dev Question?' }
                    : secretCodePuzzleConfig!
                }
                onSolved={() => markSolved('secret')}
                showUpload={moduleKey === 'dev'}
              />
            ) : (
              <div className="p-4 bg-yellow-50 rounded">
                A titkos kód modul nem érhető el ebben a konfigurációban.
              </div>
            )}
          </div>
        )}
        {active === 'word' && (
          <div>
            {wordSelectorConfig || moduleKey === 'dev' ? (
              <WordSelector
                config={
                  moduleKey === 'dev'
                    ? {
                        title: 'Dev WordSelector',
                        number_of_selectable_letters: 1,
                        correct_letters: ['A'],
                        possible_letters: [['A', 'B']],
                        question_descriptions: [['Dev mode']],
                      }
                    : wordSelectorConfig!
                }
                onSolved={() => markSolved('word')}
                showUpload={moduleKey === 'dev'}
              />
            ) : (
              <div className="p-4 bg-yellow-50 rounded">
                A szóválasztó nem érhető el ebben a konfigurációban.
              </div>
            )}
          </div>
        )}
        {active === 'quiz' && (
          <div>
            {quizConfig || moduleKey === 'dev' ? (
              <Quiz
                config={
                  moduleKey === 'dev'
                    ? {
                        answers: [{ id: 1, text: 'Dev' }],
                        numberOptions: [1, 2, 3],
                        solution: { option: 1, answer: 1 },
                      }
                    : quizConfig!
                }
                onSolved={() => markSolved('quiz')}
                showUpload={moduleKey === 'dev'}
              />
            ) : (
              <div className="p-4 bg-yellow-50 rounded">
                A kvíz nem érhető el ebben a konfigurációban.
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="absolute bottom-0 left-0 right-0 bg-white border-t z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <label className="text-sm text-gray-600">Modul:</label>
            <select
              value={moduleKey}
              onChange={(e) => {
                const val = e.target.value as ModuleKey;
                setModuleKey(val);
                const p = new URLSearchParams(window.location.search);
                p.set('module', val);
                const url = window.location.pathname + '?' + p.toString();
                window.history.replaceState({}, '', url);
                try {
                  localStorage.removeItem('solvedModules');
                } catch (err) {
                  // ignore storage errors (e.g., private mode)
                }
                setSolved({ home: false, wire: false, secret: false, word: false, quiz: false });
              }}
              className="border rounded px-2 py-1"
            >
              <option value="">Válassz modult</option>
              <option value="5-romai">5 római</option>
              <option value="7-olasz">7 olasz egység</option>
              <option value="dev">Fejlesztői mód</option>
            </select>
            {loading && (
              <div className="flex items-center">
                <svg
                  className="animate-spin h-5 w-5 text-gray-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                </svg>
              </div>
            )}
          </div>

          <div className="text-sm text-gray-500">
            <div>
              TöviscsapatX{' '}
              <a
                className="text-blue-600 hover:underline"
                href="https://toviscsapat.hu"
                target="_blank"
                rel="noreferrer"
              >
                https://toviscsapat.hu
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
