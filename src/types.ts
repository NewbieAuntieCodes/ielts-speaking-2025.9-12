export type Page = 'home' | 'bank' | 'tips' | 'analysis' | 'scoring';

export interface AnalysisData {
  type: 'vocab' | 'phrase' | 'sentence';
  text: string;
  explanation: string;
}

export interface AnswerVersion {
  score: string;
  answer: string | string[];
  analysis?: AnalysisData[];
}

export interface SampleAnswerData {
  question: string;
  versions: AnswerVersion[];
}

export interface CueCardData {
  id: string;
  title: string;
  category: string;
  categoryClass: string;
  status?: 'New';
  // Part 1
  part1Questions?: string[];
  sampleAnswers?: SampleAnswerData[];
  // Part 2+3
  part2Title?: string;
  part2Description?: string;
  part2Prompts?: string[];
  part3Questions?: string[];
}

export interface TopicData {
  id: string;
  title: string;
  cards: CueCardData[];
  isNew?: boolean;
}
