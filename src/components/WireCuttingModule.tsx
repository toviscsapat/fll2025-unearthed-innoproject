import { Check, RotateCcw, Scissors, Upload, X } from 'lucide-react';
import React, { useState } from 'react';

export interface WireLabel {
  identifier: string;
  label: string;
}

export interface QuestionGroup {
  question: string;
  wires: WireLabel[];
}

export interface SubModuleConfig {
  id: string;
  identifiers: string; // concatenated list of possible identifiers
  correctAnswers: string; // concatenated list of identifiers that are correct
  baseColor: string;
  wireColors: string[];
  questionGroups?: QuestionGroup[];
  // Alternate shape (will be normalized if provided)
  questions?: string[];
  wireLabels?: Record<string, string>;
}

interface WireCuttingModuleProps {
  config?: SubModuleConfig[];
  onSolved?: () => void;
}

const DEFAULT_CONFIG: SubModuleConfig[] = [
  {
    id: 'module-1',
    identifiers: '12456790',
    correctAnswers: '70',
    baseColor: 'piros',
    wireColors: ['piros', 'narancs'],
    questionGroups: [
      {
        question: 'Ki volt Giuseppe Garibaldi?',
        wires: [
          { identifier: '1', label: 'Lengyel politikus' },
          { identifier: '9', label: 'Olasz feltaláló' },
          { identifier: '7', label: 'Olasz forradalmár' },
          { identifier: '2', label: 'Orosz kovács' },
        ],
      },
      {
        question: 'Szicília melyik államhoz tartozott?',
        wires: [
          { identifier: '6', label: 'Szicília állam' },
          { identifier: '5', label: 'Szárd-Habsburg királyság' },
          { identifier: '4', label: 'Pápai állam' },
          { identifier: '0', label: 'Szicíliai- és Nápolyi királyság' },
        ],
      },
    ],
  },
  {
    id: 'module-2',
    identifiers: 'ABCD',
    correctAnswers: 'B',
    baseColor: 'kék',
    wireColors: ['kék'],
    questionGroups: [
      {
        question: '18… -ban mi történt?',
        wires: [
          { identifier: 'A', label: 'A Bécsi kongresszus' },
          { identifier: 'B', label: 'Itália egyesítése' },
          { identifier: 'C', label: 'Solferinói csata' },
          { identifier: 'D', label: 'Osztrák-Magyar Monarchia' },
        ],
      },
    ],
  },
];

const colorMap: Record<string, { bg: string; border: string; light: string }> = {
  piros: { bg: 'bg-red-500', border: '#ef4444', light: 'bg-red-900' },
  narancs: { bg: 'bg-orange-500', border: '#f97316', light: 'bg-orange-900' },
  kék: { bg: 'bg-blue-500', border: '#3b82f6', light: 'bg-blue-900' },
  zöld: { bg: 'bg-green-500', border: '#22c55e', light: 'bg-green-900' },
  sárga: { bg: 'bg-yellow-500', border: '#eab308', light: 'bg-yellow-900' },
  fehér: { bg: 'bg-gray-100', border: '#f3f4f6', light: 'bg-gray-700' },
  fekete: { bg: 'bg-gray-900', border: '#111827', light: 'bg-gray-800' },
};

function normalizeConfig(incoming: SubModuleConfig[]): SubModuleConfig[] {
  return incoming.map((m) => {
    if (m.wireLabels && !m.questionGroups) {
      const question = m.questions?.[0] || 'Válaszd ki a helyes választ!';
      const wires = Object.entries(m.wireLabels).map(([identifier, label]) => ({
        identifier,
        label,
      }));
      return { ...m, questionGroups: [{ question, wires }] };
    }
    return m;
  });
}

const WireCuttingModule: React.FC<WireCuttingModuleProps> = ({ config, onSolved }) => {
  const initial = normalizeConfig(config || DEFAULT_CONFIG);
  const [subModules, setSubModules] = useState<SubModuleConfig[]>(initial);
  const [cutWires, setCutWires] = useState<Record<string, Set<string>>>(
    initial.reduce(
      (acc, m) => {
        acc[m.id] = new Set();
        return acc;
      },
      {} as Record<string, Set<string>>
    )
  );
  const [result, setResult] = useState<boolean | null>(null);
  const [configError, setConfigError] = useState<string | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      let parsed: unknown;
      try {
        parsed = JSON.parse(text);
      } catch {
        let cleaned = text
          .replace(/const\s+\w+\s*:\s*\w+\[\]\s*=\s*/, '')
          .replace(/const\s+\w+\s*=\s*/, '')
          .trim();
        if (cleaned.endsWith(';')) cleaned = cleaned.slice(0, -1);
        // eslint-disable-next-line no-eval
        parsed = eval('(' + cleaned + ')');
      }
      if (!Array.isArray(parsed) || parsed.length === 0)
        throw new Error('Érvénytelen konfiguráció: tömb szükséges.');
      const normalized = normalizeConfig(parsed as SubModuleConfig[]);
      setSubModules(normalized);
      setCutWires(
        normalized.reduce(
          (acc, m) => {
            acc[m.id] = new Set();
            return acc;
          },
          {} as Record<string, Set<string>>
        )
      );
      setResult(null);
      setConfigError(null);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      setConfigError('Hiba a konfiguráció betöltésekor: ' + message);
    }
    event.target.value = '';
  };

  const toggleWire = (moduleId: string, identifier: string) => {
    setCutWires((prev) => {
      const next = { ...prev };
      const set = new Set(next[moduleId]);
      set.has(identifier) ? set.delete(identifier) : set.add(identifier);
      next[moduleId] = set;
      return next;
    });
    setResult(null);
  };

  const checkSolution = () => {
    const allCorrect = subModules.every((m) => {
      const cut = cutWires[m.id];
      const correct = new Set(m.correctAnswers.split(''));
      if (cut.size !== correct.size) return false;
      for (const id of correct) if (!cut.has(id)) return false;
      return true;
    });
    setResult(allCorrect);
  };

  React.useEffect(() => {
    if (result) setTimeout(() => onSolved?.(), 0);
  }, [result, onSolved]);

  const reset = () => {
    setCutWires(
      subModules.reduce(
        (acc, m) => {
          acc[m.id] = new Set();
          return acc;
        },
        {} as Record<string, Set<string>>
      )
    );
    setResult(null);
  };

  const getWireColor = (module: SubModuleConfig, index: number) => {
    const color = module.wireColors[index % module.wireColors.length];
    return colorMap[color] ? color : 'fehér';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8 text-center flex items-center justify-center gap-3">
          <Scissors className="w-10 h-10" /> Bomba Lefegyverzés - Történelem Modul
        </h1>

        <div className="mb-8 flex justify-center">
          <label className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-xl cursor-pointer transition-all shadow-lg shadow-purple-500/50 flex items-center gap-2 hover:scale-105">
            <Upload className="w-5 h-5" /> Konfiguráció betöltése
            <input type="file" accept=".json,.js" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>

        {configError && (
          <div className="mb-6 bg-red-600 text-white p-4 rounded-lg text-center">{configError}</div>
        )}

        <div className="grid grid-cols-1 gap-8 mb-8">
          {subModules.map((module, moduleIndex) => {
            const theme = colorMap[module.baseColor] || colorMap.fehér;
            return (
              <div
                key={module.id}
                className={`${theme.light} border-4 rounded-xl p-6 backdrop-blur-sm shadow-2xl`}
                style={{ borderColor: theme.border }}
              >
                <div className="bg-black bg-opacity-40 rounded-lg p-4 mb-6">
                  <h2 className="text-2xl font-bold text-white mb-2">Almodul-{moduleIndex + 1}</h2>
                  <p className="text-gray-300 text-sm">
                    Alapszín: <span className="font-semibold">{module.baseColor}</span>
                  </p>
                  <p className="text-gray-300 text-sm">
                    Drótszínek:{' '}
                    <span className="font-semibold">{module.wireColors.join(', ')}</span>
                  </p>
                </div>
                {module.questionGroups?.map((group, gi) => (
                  <div key={gi} className="mb-6 last:mb-0">
                    <div className="bg-black bg-opacity-50 rounded-lg p-4 mb-4">
                      <h3 className="text-xl font-bold text-white">{group.question}</h3>
                    </div>
                    <div className="space-y-3">
                      {group.wires.map((wire, wi) => {
                        const isCut = cutWires[module.id].has(wire.identifier);
                        const wireColorName = getWireColor(module, wi);
                        const wireTheme = colorMap[wireColorName];
                        return (
                          <div
                            key={wire.identifier}
                            className="flex items-center gap-3 bg-black bg-opacity-30 rounded-lg p-4 transition-all hover:bg-opacity-40"
                          >
                            <div className="flex-1 flex items-center gap-3">
                              <div
                                className={`w-16 h-4 rounded-full ${wireTheme.bg} ${isCut ? 'opacity-30' : 'opacity-100'} transition-opacity relative flex items-center justify-center`}
                              >
                                {isCut && (
                                  <X className="w-8 h-8 text-red-600 absolute" strokeWidth={4} />
                                )}
                              </div>
                              <span className="text-white text-lg flex-1">{wire.label}</span>
                            </div>
                            <button
                              onClick={() => toggleWire(module.id, wire.identifier)}
                              className={`px-5 py-3 rounded-lg font-bold text-xl transition-all min-w-[60px] ${isCut ? 'bg-red-600 text-white shadow-lg shadow-red-500/50 scale-95' : 'bg-gray-700 text-white hover:bg-gray-600 hover:scale-105'}`}
                            >
                              {wire.identifier}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>

        <div className="flex gap-4 justify-center items-center">
          <button
            onClick={checkSolution}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-xl text-xl transition-all shadow-lg shadow-green-500/50 flex items-center gap-2 hover:scale-105"
          >
            <Check className="w-6 h-6" /> Beküldés
          </button>
          <button
            onClick={reset}
            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-4 px-8 rounded-xl text-xl transition-all shadow-lg flex items-center gap-2 hover:scale-105"
          >
            <RotateCcw className="w-6 h-6" /> Újrakezd
          </button>
        </div>

        {result !== null && (
          <div
            className={`mt-8 p-6 rounded-xl text-center text-2xl font-bold animate-pulse ${result ? 'bg-green-600 text-white shadow-lg shadow-green-500/50' : 'bg-red-600 text-white shadow-lg shadow-red-500/50'}`}
          >
            {result ? (
              <div className="flex items-center justify-center gap-3">
                <Check className="w-8 h-8" /> Helyes! A bomba lefegyverezve!
              </div>
            ) : (
              <div className="flex items-center justify-center gap-3">
                <X className="w-8 h-8" /> Helytelen! A bomba felrobban! Próbáld újra!
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default WireCuttingModule;
