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

type ComponentKey = 'home' | 'wire' | 'secret' | 'word' | 'quiz' | 'kartyak' | 'audio' | 'diszlexia';
type ModuleKey = '' | '5-romai' | '7-olasz' | 'dev';

export default function App() {
  // moduleKey determines which config folder to use
  const params = new URLSearchParams(window.location.search);
  const initialModule = params.get('module') ?? '';
  const [moduleKey, setModuleKey] = useState<ModuleKey>(initialModule as ModuleKey);
  const [showDownloads, setShowDownloads] = useState(false);
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
    kartyak: false,
    audio: false,
    diszlexia: false,
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem('solvedModules');
      if (raw) setSolved(JSON.parse(raw));
    } catch {
      // ignore
    }
  }, []);

  const [time, setTime] = useState(0);
  const [timerStarted, setTimerStarted] = useState(false);
  const [timerRunning, setTimerRunning] = useState(false);
  const [resetCounter, setResetCounter] = useState(0);

  // Check if all available modules are solved
  const allModulesSolved =
    moduleKey !== '' &&
    (!hasWire || solved.wire) &&
    (!hasSecret || solved.secret) &&
    (!hasWord || solved.word) &&
    (!hasQuiz || solved.quiz);

  // Timer logic
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (timerRunning) {
      interval = setInterval(() => {
        setTime((t) => t + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerRunning]);

  // Stop timer when everything is solved
  useEffect(() => {
    if (allModulesSolved) {
      setTimerRunning(false);
    }
  }, [allModulesSolved]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const startTimer = () => {
    setTimerStarted(true);
    setTimerRunning(true);
    setTime(0);
  };

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

  const resetGame = () => {
    if (!window.confirm('Biztosan újra akarod kezdeni a teljes játékot? Minden haladás elvész.')) return;

    setSolved({ home: false, wire: false, secret: false, word: false, quiz: false, kartyak: false, audio: false, diszlexia: false });
    setTime(0);
    setTimerStarted(false);
    setTimerRunning(false);
    try {
      localStorage.removeItem('solvedModules');
    } catch {
      // ignore
    }
    setResetCounter((prev) => prev + 1);
    setActive('home');
  };

  const selectModule = (key: ModuleKey) => {
    setModuleKey(key);
    const p = new URLSearchParams(window.location.search);
    p.set('module', key);
    const url = window.location.pathname + '?' + p.toString();
    window.history.replaceState({}, '', url);
    try {
      localStorage.removeItem('solvedModules');
    } catch (err) {
      // ignore storage errors (e.g., private mode)
    }
    setSolved({ home: false, wire: false, secret: false, word: false, quiz: false, kartyak: false, audio: false, diszlexia: false });
    setTime(0);
    setTimerStarted(false);
    setTimerRunning(false);
    setResetCounter((prev) => prev + 1);
    setActive('home');
  };

  if (moduleKey === '') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
        <div className="max-w-4xl w-full">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-black text-indigo-900 mb-4 drop-shadow-sm">Bombajó Töri</h1>
            <p className="text-xl text-gray-600 font-medium">Válassz egy történelmi korszakot a küldetés megkezdéséhez!</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div
              onClick={() => selectModule('5-romai')}
              className="bg-white rounded-3xl shadow-xl overflow-hidden cursor-pointer hover:scale-[1.03] transition-all hover:shadow-2xl group border-4 border-transparent hover:border-orange-400"
            >
              <div className="h-64 bg-orange-50 flex items-center justify-center p-8 overflow-hidden">
                <img src="/assets/roma_module.png" alt="Római Birodalom" className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" />
              </div>
              <div className="p-8">
                <div className="flex items-center justify-between mb-2">
                  <span className="bg-orange-100 text-orange-700 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">5. Osztály</span>
                  <span className="text-orange-500 font-bold">Ókor</span>
                </div>
                <h2 className="text-3xl font-black text-gray-900 mb-3">Római Birodalom</h2>
                <p className="text-gray-600">Ismerd meg a birodalom tündöklését, a légiókat és a rómaiak mindennapjait izgalmas feladatokon keresztül.</p>
                <div className="mt-6 flex items-center text-orange-600 font-bold gap-2">
                  Kezdés <span className="text-xl">→</span>
                </div>
              </div>
            </div>

            <div
              onClick={() => selectModule('7-olasz')}
              className="bg-white rounded-3xl shadow-xl overflow-hidden cursor-pointer hover:scale-[1.03] transition-all hover:shadow-2xl group border-4 border-transparent hover:border-green-400"
            >
              <div className="h-64 bg-green-50 flex items-center justify-center p-8 overflow-hidden">
                <img src="/assets/italy_module.png" alt="Olasz Egység" className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" />
              </div>
              <div className="p-8">
                <div className="flex items-center justify-between mb-2">
                  <span className="bg-green-100 text-green-700 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">7. Osztály</span>
                  <span className="text-green-500 font-bold">19. Század</span>
                </div>
                <h2 className="text-3xl font-black text-gray-900 mb-3">Olasz Egység</h2>
                <p className="text-gray-600">Vegyél részt Garibaldi és Cavour forradalmi küzdelmeiben, és segíts egyesíteni az Itáliai-félszigetet.</p>
                <div className="mt-6 flex items-center text-green-600 font-bold gap-2">
                  Kezdés <span className="text-xl">→</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center">
            <button
              onClick={() => selectModule('dev')}
              className="text-gray-400 hover:text-gray-600 text-sm font-medium transition-colors underline underline-offset-4"
            >
              Belépés fejlesztői módban
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen relative transition-colors duration-1000 ${allModulesSolved ? 'bg-green-500' : 'bg-gray-50'}`}>
      <header className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-bold whitespace-nowrap">Bombajó Töri</h1>
            {timerStarted && (
              <div className={`px-4 py-1 rounded-full font-mono text-lg md:text-xl font-bold flex items-center gap-2 ${allModulesSolved ? 'bg-green-100 text-green-700 border-2 border-green-300' : 'bg-red-100 text-red-700 border-2 border-red-300 animate-pulse'}`}>
                <span className="text-xs md:text-sm uppercase tracking-wider opacity-70">Idő:</span>
                {formatTime(time)}
              </div>
            )}
          </div>
          {/* Module selector moved to footer */}
          <nav className="flex flex-wrap justify-center gap-2">
            <button
              onClick={() => setActive('home')}
              className={`px-3 py-2 rounded ${solved.home || allModulesSolved ? 'bg-green-100 border border-green-300' : 'hover:bg-gray-100'}`}
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
            {(moduleKey === '5-romai' || moduleKey === '7-olasz') && (
              <div
                className="relative group"
                onMouseEnter={() => setShowDownloads(true)}
                onMouseLeave={() => setShowDownloads(false)}
              >
                <button
                  className={`px-3 py-2 rounded flex items-center gap-1 ${(active === 'kartyak' || active === 'audio') ? 'bg-indigo-100 border border-indigo-300' : 'hover:bg-gray-100'}`}
                >
                  Letöltések <span className="text-[10px]">▼</span>
                </button>
                <div
                  className={`absolute right-0 top-full pt-2 z-50 transition-all origin-top-right ${showDownloads ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}
                >
                  <div className="bg-white shadow-xl border border-gray-100 rounded-xl py-2 min-w-[200px]">
                    <button
                      onClick={() => { setActive('kartyak'); setShowDownloads(false); }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm font-medium flex items-center gap-2"
                    >
                      📥 Kártyák letöltése
                    </button>
                    <button
                      onClick={() => { setActive('audio'); setShowDownloads(false); }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm font-medium flex items-center gap-2"
                    >
                      🔊 Kártyák felolvasása
                    </button>
                    <button
                      onClick={() => { setActive('diszlexia'); setShowDownloads(false); }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm font-medium flex items-center gap-2"
                    >
                      👓 Diszlexiás kártya
                    </button>
                  </div>
                </div>
              </div>
            )}
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 pb-28">
        {active === 'home' && (
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {/* Hero Image Section */}
            <div className="relative mb-8 rounded-3xl overflow-hidden shadow-xl border-4 border-white flex justify-center items-center">
              <img
                src="/assets/history_header_v2.png"
                alt="Történelmi Kaland"
                className="w-full h-[180px] md:h-[280px] object-cover"
              />
            </div>

            {!timerStarted && (
              <div className="mb-12 p-12 bg-white rounded-3xl shadow-xl text-center border-t-8 border-indigo-600 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 -mr-16 -mt-16 rounded-full opacity-50" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-50 -ml-12 -mb-12 rounded-full opacity-50" />

                <h2 className="text-3xl font-black mb-6 text-indigo-900 relative">Készen álltok a küldetésre?</h2>
                <p className="text-gray-600 mb-8 max-w-md mx-auto relative">
                  Kattints az indításra a visszaszámlálás megkezdéséhez. Minden feladatot hiba nélkül teljesítenetek kell!
                </p>
                <button
                  onClick={startTimer}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-black py-6 px-16 rounded-2xl text-2xl shadow-xl hover:scale-105 transition-all active:scale-95 flex items-center gap-3 mx-auto relative group"
                >
                  Játék Indítása 🚀
                  <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
                </button>
              </div>
            )}

            {allModulesSolved && (
              <div className="mb-8 p-8 bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl border-4 border-green-400 text-center animate-bounce">
                <h2 className="text-4xl font-black text-green-700 mb-2">GRATULÁLOK! 🎉</h2>
                <p className="text-xl text-green-800 font-bold mb-4">Minden küldetést sikeresen teljesítettetek!</p>
                <div className="inline-block px-6 py-3 bg-green-100 rounded-2xl border-2 border-green-200 shadow-inner">
                  <p className="text-2xl font-black text-green-700">
                    Végső idő: {Math.floor(time / 60) > 0 ? `${Math.floor(time / 60)} perc ` : ''}{time % 60} másodperc
                  </p>
                </div>
              </div>
            )}

            <h2 className={`text-2xl font-bold mb-4 ${allModulesSolved ? 'text-white drop-shadow-md' : ''}`}>Üdvözlet</h2>
            <p className={`mb-4 ${allModulesSolved ? 'text-white' : ''}`}>
              Válassz egy modult a fejlécből. A konfigurációk a <code>src/config/</code> mappában
              találhatók.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {hasWire && (
                <div
                  onClick={() => setActive('wire')}
                  className={`p-6 border rounded-xl shadow-sm transition-all cursor-pointer hover:shadow-md hover:scale-[1.02] active:scale-95 ${solved.wire ? 'bg-green-100 border-green-400' : 'bg-white border-gray-200'}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{solved.wire ? '✅' : '⚡'}</span>
                    <span className="font-bold text-lg">Drótvágó modul</span>
                  </div>
                  <p className="mt-2 text-gray-600 text-sm">Interaktív történelem modul, ahol a tudásoddal hatástalaníthatod a bombát.</p>
                </div>
              )}
              {hasSecret && (
                <div
                  onClick={() => setActive('secret')}
                  className={`p-6 border rounded-xl shadow-sm transition-all cursor-pointer hover:shadow-md hover:scale-[1.02] active:scale-95 ${solved.secret ? 'bg-green-100 border-green-400' : 'bg-white border-gray-200'}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{solved.secret ? '✅' : '🔒'}</span>
                    <span className="font-bold text-lg">Titkos kód</span>
                  </div>
                  <p className="mt-2 text-gray-600 text-sm">Fejtsd meg az elrejtett üzenetet és találd meg a helyes kombinációt.</p>
                </div>
              )}
              {hasWord && (
                <div
                  onClick={() => setActive('word')}
                  className={`p-6 border rounded-xl shadow-sm transition-all cursor-pointer hover:shadow-md hover:scale-[1.02] active:scale-95 ${solved.word ? 'bg-green-100 border-green-400' : 'bg-white border-gray-200'}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{solved.word ? '✅' : '🔤'}</span>
                    <span className="font-bold text-lg">Szóválasztó</span>
                  </div>
                  <p className="mt-2 text-gray-600 text-sm">Építs szavakat az oszlopokból és találd meg a keresett történelmi fogalmat.</p>
                </div>
              )}
              {hasQuiz && (
                <div
                  onClick={() => setActive('quiz')}
                  className={`p-6 border rounded-xl shadow-sm transition-all cursor-pointer hover:shadow-md hover:scale-[1.02] active:scale-95 ${solved.quiz ? 'bg-green-100 border-green-400' : 'bg-white border-gray-200'}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{solved.quiz ? '✅' : '❓'}</span>
                    <span className="font-bold text-lg">Kvíz</span>
                  </div>
                  <p className="mt-2 text-gray-600 text-sm">Teszteld a tudásod szabályalapú kérdésekkel és válaszokkal.</p>
                </div>
              )}
            </div>

            <div className={`mt-8 p-6 rounded shadow transition-all ${allModulesSolved ? 'bg-white/95 border-2 border-green-200' : 'bg-white'}`}>
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
          <div key={`wire-${resetCounter}`}>
            <WireCuttingModule
              config={wireModules || []}
              onSolved={() => markSolved('wire')}
              showUpload={moduleKey === 'dev'}
            />
          </div>
        )}
        {active === 'secret' && (
          <div key={`secret-${resetCounter}`}>
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
          <div key={`word-${resetCounter}`}>
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
          <div key={`quiz-${resetCounter}`}>
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
        {active === 'kartyak' && (
          <div className="bg-white rounded-3xl shadow-xl p-8 border-t-8 border-indigo-600 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-3xl font-black mb-6 text-indigo-900">Kártyák kiválasztása</h2>
            <p className="text-gray-600 mb-8">Ezen az oldalon megtekintheted és letöltheted a modulhoz tartozó kártyákat.</p>
            <div className="aspect-[1/1.414] w-full max-w-4xl mx-auto border-2 border-gray-200 rounded-3xl overflow-hidden shadow-inner bg-gray-50 flex items-center justify-center">
              <iframe
                src={`/assets/${moduleKey}/kartyak.pdf`}
                className="w-full h-full min-h-[600px]"
                title="Kártyák"
              />
            </div>
            <div className="mt-8 text-center">
              <a
                href={`/assets/${moduleKey}/kartyak.pdf`}
                download="kartyak.pdf"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-10 rounded-2xl shadow-xl transition-all hover:scale-105 active:scale-95 inline-flex items-center gap-2"
              >
                <span>📥 Letöltés PDF formátumban</span>
              </a>
            </div>
          </div>
        )}
        {active === 'audio' && (
          <div className="bg-white rounded-3xl shadow-xl p-8 border-t-8 border-indigo-600 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-3xl font-black mb-6 text-indigo-900">Kártyák felolvasása</h2>
            <p className="text-gray-600 mb-8">Hallgasd meg a modulhoz tartozó kártyák tartalmát hangfelvételen.</p>
            <div className="flex flex-col items-center justify-center p-12 bg-indigo-50 rounded-3xl border-4 border-white shadow-inner">
              <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mb-6 animate-pulse">
                <span className="text-4xl text-indigo-600">🔊</span>
              </div>
              <audio
                controls
                src={`/assets/${moduleKey === '5-romai' ? '5-romai/kartya-1-audio.m4a' : '7-olasz/kartyak_hang.m4a'}`}
                className="w-full max-w-md"
              >
                Sajnos a böngésződ nem támogatja a közvetlen lejátszást.
              </audio>
              <div className="mt-8 text-sm text-indigo-400 font-medium">
                {moduleKey === '5-romai' ? 'kartya-1-audio.m4a' : 'Hamarosan elérhető az olasz modulhoz is.'}
              </div>
            </div>
          </div>
        )}
        {active === 'diszlexia' && (
          <div className="bg-white rounded-3xl shadow-xl p-8 border-t-8 border-indigo-600 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-3xl font-black mb-6 text-indigo-900">Diszlexiás kártya</h2>
            <p className="text-gray-600 mb-4">Ezen az oldalon megtekintheted és letöltheted a diszlexia-barát kártyát.</p>
            <div className="mb-8 p-4 bg-orange-50 border-l-4 border-orange-400 text-orange-800 rounded-r-xl text-sm font-medium">
              💡 <strong>Tipp:</strong> A jobb eredmény érdekében újrahasznosított papírra nyomtatandó!
            </div>
            {moduleKey === '5-romai' ? (
              <>
                <div className="aspect-[1/1.414] w-full max-w-4xl mx-auto border-2 border-gray-200 rounded-3xl overflow-hidden shadow-inner bg-gray-50 flex items-center justify-center">
                  <iframe
                    src={`/assets/${moduleKey}/kartya-1-diszlexia.pdf`}
                    className="w-full h-full min-h-[600px]"
                    title="Diszlexiás Kártya"
                  />
                </div>
                <div className="mt-8 text-center border-t pt-8">
                  <a
                    href={`/assets/${moduleKey}/kartya-1-diszlexia.pdf`}
                    download="kartya-1-diszlexia.pdf"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-10 rounded-2xl shadow-xl transition-all hover:scale-105 active:scale-95 inline-flex items-center gap-2"
                  >
                    <span>📥 Letöltés (Diszlexia-barát)</span>
                  </a>
                </div>
              </>
            ) : (
              <div className="p-12 bg-indigo-50 rounded-3xl text-center">
                <div className="text-5xl mb-4">⏳</div>
                <h3 className="text-xl font-bold text-indigo-900 mb-2">Hamarosan elérhető</h3>
                <p className="text-indigo-600">Ez a verzió még nem készült el ehhez a modulhoz.</p>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="bg-white border-t mt-auto">
        <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600 font-semibold whitespace-nowrap">Modul:</label>
              <select
                value={moduleKey}
                onChange={(e) => {
                  const val = e.target.value as ModuleKey;
                  selectModule(val);
                }}
                className="border rounded-lg px-3 py-2 bg-gray-50 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              >
                <option value="">Válassz modult</option>
                <option value="5-romai">5 római</option>
                <option value="7-olasz">7 olasz egység</option>
                <option value="dev">Fejlesztői mód</option>
              </select>
            </div>

            <button
              onClick={resetGame}
              className="bg-red-50 hover:bg-red-100 text-red-600 text-sm font-bold py-2 px-4 rounded-lg border border-red-200 shadow-sm transition-all flex items-center gap-2 active:scale-95 w-full sm:w-auto justify-center"
            >
              🔄 Újrakezdés
            </button>
            {loading && (
              <div className="flex items-center justify-center">
                <svg
                  className="animate-spin h-5 w-5 text-indigo-600"
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

          <div className="text-sm text-gray-500 text-center md:text-right">
            <div className="font-semibold text-gray-700">TöviscsapatX</div>
            <a
              className="text-indigo-600 hover:text-indigo-800 transition-colors font-medium underline underline-offset-4"
              href="https://toviscsapat.hu"
              target="_blank"
              rel="noreferrer"
            >
              toviscsapat.hu
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
