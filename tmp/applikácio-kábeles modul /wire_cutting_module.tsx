import React, { useState } from 'react';
import { Scissors, Check, X, RotateCcw, Upload } from 'lucide-react';

const WireCuttingModule = () => {
  // Alapértelmezett konfiguráció
  const defaultConfig = [
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
            { identifier: '2', label: 'Orosz kovács' }
          ]
        },
        {
          question: 'Szicília melyik államhoz tartozott?',
          wires: [
            { identifier: '6', label: 'Szicília állam' },
            { identifier: '5', label: 'Szárd-Habsburg királyság' },
            { identifier: '4', label: 'Pápai állam' },
            { identifier: '0', label: 'Szicíliai- és Nápolyi királyság' }
          ]
        }
      ]
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
            { identifier: 'D', label: 'Osztrák-Magyar Monarchia' }
          ]
        }
      ]
    }
  ];

  const [subModules, setSubModules] = useState(defaultConfig);
  const [configError, setConfigError] = useState(null);
  const [cutWires, setCutWires] = useState(
    defaultConfig.reduce((acc, module) => {
      acc[module.id] = new Set();
      return acc;
    }, {})
  );
  const [result, setResult] = useState(null);

  // Színek mapping
  const colorMap = {
    'piros': { bg: 'bg-red-500', border: '#ef4444', light: 'bg-red-900' },
    'narancs': { bg: 'bg-orange-500', border: '#f97316', light: 'bg-orange-900' },
    'kék': { bg: 'bg-blue-500', border: '#3b82f6', light: 'bg-blue-900' },
    'zöld': { bg: 'bg-green-500', border: '#22c55e', light: 'bg-green-900' },
    'sárga': { bg: 'bg-yellow-500', border: '#eab308', light: 'bg-yellow-900' },
    'fehér': { bg: 'bg-gray-100', border: '#f3f4f6', light: 'bg-gray-700' },
    'fekete': { bg: 'bg-gray-900', border: '#111827', light: 'bg-gray-800' }
  };

  // Konfiguráció betöltése fájlból
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      let config;
      
      // Először próbáljuk meg tiszta JSON-ként
      try {
        config = JSON.parse(text);
      } catch {
        // Ha nem JSON, akkor JavaScript formátum
        // Távolítsuk el a TypeScript típusokat és a const deklarációt
        let cleanedText = text
          .replace(/const\s+\w+\s*:\s*\w+\[\]\s*=/, '') // const subModules: SubModuleConfig[] =
          .replace(/const\s+\w+\s*=/, '') // const subModules =
          .trim();
        
        // Ha van záró pontosvessző, távolítsuk el
        if (cleanedText.endsWith(';')) {
          cleanedText = cleanedText.slice(0, -1);
        }
        
        // Próbáljuk meg evalálni a tömböt
        config = eval('(' + cleanedText + ')');
      }

      if (!Array.isArray(config) || config.length === 0) {
        throw new Error('A konfiguráció nem megfelelő formátumú! Egy tömb szükséges.');
      }

      // Konfiguráció validálása és normalizálása
      const normalizedConfig = config.map((module, index) => {
        if (!module.id || !module.identifiers || !module.correctAnswers || 
            !module.baseColor || !module.wireColors) {
          throw new Error(`Hiányos konfiguráció a(z) ${index + 1}. modulnál!`);
        }

        // Ha van wireLabels object, alakítsuk át questionGroups formátumra
        if (module.wireLabels && !module.questionGroups) {
          const question = module.questions?.[0] || 'Válaszd ki a helyes választ!';
          const wires = Object.entries(module.wireLabels).map(([identifier, label]) => ({
            identifier,
            label
          }));
          
          return {
            ...module,
            questionGroups: [{ question, wires }]
          };
        }

        if (!module.questionGroups) {
          throw new Error(`Hiányzik a questionGroups vagy wireLabels a(z) ${index + 1}. modulnál!`);
        }

        return module;
      });

      setSubModules(normalizedConfig);
      setCutWires(
        normalizedConfig.reduce((acc, module) => {
          acc[module.id] = new Set();
          return acc;
        }, {})
      );
      setResult(null);
      setConfigError(null);
    } catch (error) {
      setConfigError('Hiba a konfiguráció betöltésekor: ' + error.message);
      console.error('Config load error:', error);
      console.log('File content:', await file.text());
    }

    // Input reset
    event.target.value = '';
  };

  // Kábel vágása (gomb megnyomása)
  const toggleWire = (moduleId, identifier) => {
    setCutWires(prev => {
      const newCutWires = { ...prev };
      const moduleSet = new Set(newCutWires[moduleId]);
      
      if (moduleSet.has(identifier)) {
        moduleSet.delete(identifier);
      } else {
        moduleSet.add(identifier);
      }
      
      newCutWires[moduleId] = moduleSet;
      return newCutWires;
    });
    setResult(null);
  };

  // Ellenőrzés
  const checkSolution = () => {
    let allCorrect = true;
    
    for (const module of subModules) {
      const cutSet = cutWires[module.id];
      const correctSet = new Set(module.correctAnswers.split(''));
      
      if (cutSet.size !== correctSet.size) {
        allCorrect = false;
        break;
      }
      
      for (const wire of correctSet) {
        if (!cutSet.has(wire)) {
          allCorrect = false;
          break;
        }
      }
    }
    
    setResult(allCorrect);
  };

  // Reset
  const reset = () => {
    setCutWires(
      subModules.reduce((acc, module) => {
        acc[module.id] = new Set();
        return acc;
      }, {})
    );
    setResult(null);
  };

  // Véletlenszerű kábel szín kiválasztása
  const getWireColor = (module, index) => {
    const color = module.wireColors[index % module.wireColors.length];
    // Ha a szín nem található a colorMap-ben, használjunk fehéret alapértelmezettként
    return colorMap[color] ? color : 'fehér';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8 text-center flex items-center justify-center gap-3">
          <Scissors className="w-10 h-10" />
          Bomba Lefegyverzés - Történelem Modul
        </h1>

        {/* Fájl feltöltés */}
        <div className="mb-8 flex justify-center">
          <label className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-xl cursor-pointer transition-all shadow-lg shadow-purple-500/50 flex items-center gap-2 hover:scale-105">
            <Upload className="w-5 h-5" />
            Konfiguráció betöltése
            <input
              type="file"
              accept=".json,.js"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>

        {/* Hiba üzenet */}
        {configError && (
          <div className="mb-6 bg-red-600 text-white p-4 rounded-lg text-center">
            {configError}
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 mb-8">
          {subModules.map((module, moduleIndex) => {
            const colorTheme = colorMap[module.baseColor] || colorMap['fehér'];
            
            return (
              <div
                key={module.id}
                className={`${colorTheme.light} border-4 rounded-xl p-6 backdrop-blur-sm shadow-2xl`}
                style={{ borderColor: colorTheme.border }}
              >
                <div className="bg-black bg-opacity-40 rounded-lg p-4 mb-6">
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Almodul-{moduleIndex + 1}
                  </h2>
                  <p className="text-gray-300 text-sm">
                    Alapszín: <span className="font-semibold">{module.baseColor}</span>
                  </p>
                  <p className="text-gray-300 text-sm">
                    Drótszínek: <span className="font-semibold">{module.wireColors.join(', ')}</span>
                  </p>
                </div>

                {module.questionGroups.map((group, groupIndex) => (
                  <div key={groupIndex} className="mb-6 last:mb-0">
                    <div className="bg-black bg-opacity-50 rounded-lg p-4 mb-4">
                      <h3 className="text-xl font-bold text-white">
                        {group.question}
                      </h3>
                    </div>

                    <div className="space-y-3">
                      {group.wires.map((wire, index) => {
                        const isCut = cutWires[module.id].has(wire.identifier);
                        const wireColor = getWireColor(module, index);
                        const wireColorTheme = colorMap[wireColor];
                        
                        return (
                          <div
                            key={wire.identifier}
                            className="flex items-center gap-3 bg-black bg-opacity-30 rounded-lg p-4 transition-all hover:bg-opacity-40"
                          >
                            <div className="flex-1 flex items-center gap-3">
                              <div className={`w-16 h-4 rounded-full ${wireColorTheme.bg} ${isCut ? 'opacity-30' : 'opacity-100'} transition-opacity relative flex items-center justify-center`}>
                                {isCut && (
                                  <X className="w-8 h-8 text-red-600 absolute" strokeWidth={4} />
                                )}
                              </div>
                              <span className="text-white text-lg flex-1">
                                {wire.label}
                              </span>
                            </div>
                            
                            <button
                              onClick={() => toggleWire(module.id, wire.identifier)}
                              className={`px-5 py-3 rounded-lg font-bold text-xl transition-all min-w-[60px] ${
                                isCut
                                  ? 'bg-red-600 text-white shadow-lg shadow-red-500/50 scale-95'
                                  : 'bg-gray-700 text-white hover:bg-gray-600 hover:scale-105'
                              }`}
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
            <Check className="w-6 h-6" />
            Beküldés
          </button>
          
          <button
            onClick={reset}
            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-4 px-8 rounded-xl text-xl transition-all shadow-lg flex items-center gap-2 hover:scale-105"
          >
            <RotateCcw className="w-6 h-6" />
            Újrakezd
          </button>
        </div>

        {result !== null && (
          <div className={`mt-8 p-6 rounded-xl text-center text-2xl font-bold animate-pulse ${
            result
              ? 'bg-green-600 text-white shadow-lg shadow-green-500/50'
              : 'bg-red-600 text-white shadow-lg shadow-red-500/50'
          }`}>
            {result ? (
              <div className="flex items-center justify-center gap-3">
                <Check className="w-8 h-8" />
                Helyes! A bomba lefegyverezve!
              </div>
            ) : (
              <div className="flex items-center justify-center gap-3">
                <X className="w-8 h-8" />
                Helytelen! A bomba felrobban! Próbáld újra!
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default WireCuttingModule;