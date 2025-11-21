import data from './wire-modules.json';

export type WireLabel = { identifier: string; label: string };
export type QuestionGroup = { question: string; wires: WireLabel[] };
export type SubModuleConfig = {
  id: string;
  identifiers: string;
  correctAnswers: string;
  baseColor: string;
  wireColors: string[];
  questionGroups?: QuestionGroup[];
  questions?: string[];
  wireLabels?: Record<string, string>;
};

const normalize = (arr: any[]): SubModuleConfig[] =>
  arr.map((m) => {
    if (m.wireLabels && !m.questionGroups) {
      const question = m.questions?.[0] || 'Válaszd ki a helyes választ!';
      const wires = Object.entries(m.wireLabels).map(([identifier, label]) => ({
        identifier,
        label,
      }));
      return { ...m, questionGroups: [{ question, wires }] };
    }
    return m as SubModuleConfig;
  });

export const wireModules = normalize(data as any[]);
export default wireModules;
