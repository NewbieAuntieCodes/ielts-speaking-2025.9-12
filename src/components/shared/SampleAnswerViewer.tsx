import React, { useState, useEffect } from 'react';
import { styled, keyframes } from 'styled-components';
import { SampleAnswerData } from '../../types';
import { CheckIcon, CopyIcon } from './Icons';
import AnalyzedText from './AnalyzedText';
import AnalysisDetailCard, { AnalysisDetailsGrid } from './AnalysisDetailCard';

interface SampleAnswerViewerProps {
    sampleAnswers: SampleAnswerData[];
    totalQuestions: number; // This prop is no longer used but kept for compatibility
    initialScore?: string;
    questionNumbering?: (index: number, question: string) => string;
}

const SampleAnswerViewer: React.FC<SampleAnswerViewerProps> = ({ sampleAnswers, initialScore = '6.5', questionNumbering }) => {
    const [selectedScore, setSelectedScore] = useState(initialScore);
    const [copyStatus, setCopyStatus] = useState<{ [key: number]: 'idle' | 'copied' }>({});

    const hasSampleAnswers = sampleAnswers && sampleAnswers.length > 0;

    useEffect(() => {
        setSelectedScore(initialScore);
    }, [sampleAnswers, initialScore]);
    
    useEffect(() => {
        setCopyStatus({});
    }, [selectedScore]);
    
    const availableScores: string[] = hasSampleAnswers
        ? [...new Set<string>(sampleAnswers.flatMap(qa => qa.versions.map(v => v.score)))]
            .sort((a, b) => parseFloat(a) - parseFloat(b))
        : [];

    const handleCopy = (qa: SampleAnswerData, index: number) => {
        const version = qa.versions.find(v => v.score === selectedScore);
        if (!version || !version.answer) return;
    
        const questionText = questionNumbering
            ? questionNumbering(index, qa.question)
            : `${index + 1}. ${qa.question}`;
    
        let answerText = '';
        const answerString = Array.isArray(version.answer) ? version.answer.join(' ') : version.answer;
    
        const preRegex = /(\((?:Point|Reason|Example|Contrast|Conclusion)\))/i;
        const hasPreMarkers = /\((?:Point|Reason|Example|Contrast|Conclusion)\)/i.test(answerString);
    
        if (hasPreMarkers) {
            const rawParts = answerString.split(preRegex);
            const structuredParts: { type: string, text: string }[] = [];
            let tempText = '';
            let tempType = 'Point';
    
            for (const rawPart of rawParts) {
                if (!rawPart) continue;
                const markerMatch = rawPart.match(preRegex);
                if (markerMatch) {
                    if (tempText.trim()) {
                        structuredParts.push({ type: tempType, text: tempText.trim().replace(/<[^>]+>/g, '') });
                    }
                    tempType = markerMatch[0].replace(/[()]/g, '');
                    tempText = '';
                } else {
                    tempText += rawPart;
                }
            }
            if (tempText.trim()) {
                structuredParts.push({ type: tempType, text: tempText.trim().replace(/<[^>]+>/g, '') });
            }
            answerText = structuredParts.map(part => `${part.type.charAt(0)}: ${part.text}`).join('\n\n');
        } else {
            const paragraphs = answerString.split(/<br\s*\/?>\s*<br\s*\/?>/gi);
            answerText = paragraphs.map(p => p.replace(/<[^>]+>/g, "").trim()).join('\n\n');
        }
    
        const textToCopy = `**${questionText}**\n\n${answerText}`;
    
        navigator.clipboard.writeText(textToCopy).then(() => {
            setCopyStatus(prev => ({ ...prev, [index]: 'copied' }));
            setTimeout(() => setCopyStatus(prev => ({ ...prev, [index]: 'idle' })), 2000);
        }).catch(err => {
            console.error("Could not copy text: ", err);
        });
    };
    
    if (!hasSampleAnswers) {
        return <p style={{ marginTop: '1rem', color: '#8899a6' }}>暂无范文解析。</p>;
    }

    return (
        <>
            <ScoreSelector>
                {availableScores.map(score => (
                    <ScoreButton key={score} $active={score === selectedScore} onClick={() => setSelectedScore(score)}>
                        {score}分
                    </ScoreButton>
                ))}
            </ScoreSelector>

            <AnswersList>
                {sampleAnswers.map((qa, index) => {
                    const version = qa.versions.find(v => v.score === selectedScore);
                    return (
                        <QAWrapper key={index}>
                            <AnswerHeader>
                                <AnswerQuestion>
                                    {questionNumbering ? questionNumbering(index, qa.question) : `${index + 1}. ${qa.question}`}
                                </AnswerQuestion>
                                <CopyButton onClick={() => handleCopy(qa, index)} disabled={copyStatus[index] === 'copied'} aria-label="复制范文">
                                    {copyStatus[index] === 'copied' ? (
                                        <>
                                            <CheckIcon />
                                            <span>已复制</span>
                                        </>
                                    ) : (
                                        <>
                                            <CopyIcon />
                                            <span>复制</span>
                                        </>
                                    )}
                                </CopyButton>
                            </AnswerHeader>
                            {version ? (
                               <>
                                   <AnalyzedText answer={version.answer} analysis={version.analysis || []} />
                                   {version.analysis && version.analysis.length > 0 && (
                                       <AnalysisDetailsGrid>
                                           {version.analysis.map((item, idx) => (
                                               <AnalysisDetailCard key={idx} item={item} />
                                           ))}
                                       </AnalysisDetailsGrid>
                                   )}
                               </>
                            ) : (
                               <NoAnswerMessage>暂无此分数段范文。</NoAnswerMessage>
                            )}
                        </QAWrapper>
                    );
                })}
            </AnswersList>
        </>
    );
};

const fadeIn = keyframes`from { opacity: 0; } to { opacity: 1; }`;

const AnswersList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 2.5rem;
`;

const QAWrapper = styled.div`
    animation: ${fadeIn} 0.4s ease-out;
    padding-bottom: 2rem;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};

    &:last-child {
        border-bottom: none;
        padding-bottom: 0;
    }
`;

const NoAnswerMessage = styled.p`
    color: ${({ theme }) => theme.colors.label};
    font-style: italic;
    margin: 0;
`;

const AnswerHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1rem;
    margin-bottom: 1rem;
`;

const CopyButton = styled.button`
    display: flex;
    align-items: center;
    gap: 0.4rem;
    background-color: ${({ theme }) => theme.colors.boxBg};
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: 9999px;
    padding: 0.3rem 0.8rem;
    font-size: 0.8rem;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.label};
    cursor: pointer;
    transition: all 0.2s ease;
    flex-shrink: 0;
    white-space: nowrap;

    svg {
        width: 16px;
        height: 16px;
    }

    &:hover:not(:disabled) {
        background-color: ${({ theme }) => theme.colors.border};
        color: ${({ theme }) => theme.colors.header};
    }

    &:disabled {
        cursor: default;
        color: ${({ theme }) => theme.colors.placeText};
        border-color: ${({ theme }) => theme.colors.placeBg};
        background-color: ${({ theme }) => theme.colors.placeBg};

        svg {
            color: ${({ theme }) => theme.colors.placeText};
        }
    }
`;
const ScoreSelector = styled.div`
    display: flex; gap: 0.5rem; margin-bottom: 1.5rem; flex-wrap: wrap;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
    padding-bottom: 1.5rem;
`;
const ScoreButton = styled.button<{ $active: boolean }>`
    font-family: inherit; font-size: 0.9rem; font-weight: 600; padding: 0.5rem 1.2rem;
    border-radius: 9999px; border: 1px solid ${({ theme }) => theme.colors.border};
    background-color: ${({ theme, $active }) => $active ? theme.colors.primaryOrange : 'transparent'};
    color: ${({ theme, $active }) => $active ? 'white' : theme.colors.label};
    cursor: pointer; transition: all 0.2s ease;
    &:hover {
        border-color: ${({ theme, $active }) => $active ? theme.colors.primaryOrange : theme.colors.header};
        color: ${({ theme, $active }) => $active ? 'white' : theme.colors.header};
    }
`;

const AnswerQuestion = styled.p`
    font-weight: 600;
    color: ${({ theme }) => theme.colors.header};
    margin: 0;
    line-height: 1.5;
    flex-grow: 1;
`;

export default SampleAnswerViewer;