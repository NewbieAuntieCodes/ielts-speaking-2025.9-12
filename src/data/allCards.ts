import { CueCardData } from '../types';
import { initialPart1Data } from './part1';
import { initialPart2Data } from './part2';

const allCards: CueCardData[] = [];
initialPart1Data.forEach(topic => allCards.push(...topic.cards));
initialPart2Data.forEach(topic => allCards.push(...topic.cards));

const cardsById = new Map<string, CueCardData>(allCards.map(card => [card.id, card]));

export const getCardById = (id: string): CueCardData | undefined => {
    return cardsById.get(id);
};
