import React, { useState, useEffect } from 'react';
import { styled, keyframes } from 'styled-components';
import { CueCardData, SampleAnswerData } from '../../types';
import { BackArrowIcon, CopyIcon, CheckIcon } from '../shared/Icons';
import AnalyzedText from '../shared/AnalyzedText';
import AnalysisDetailCard, { AnalysisDetailsGrid } from '../shared/AnalysisDetailCard';

interface Part1ModalProps {
    card: CueCardData;
    onClose: () => void;
}

const Part1Modal: React.FC<Part1ModalProps> = ({ card, onClose }) => {
    const [showAnswersView, setShowAnswersView] = useState(false);
    const [initialScore, setInitialScore] = useState('6.5');

    // State for the answers view
    const [selectedScore, setSelectedScore] = useState(initialScore);
    const [copyStatus, setCopyStatus] = useState<{[key: number]: 'idle' | 'copied'}>({});
    const [copyAllStatus, setCopyAllStatus] = useState<'idle' | 'copied'>('idle');

    useEffect(() => {
        // Reset view when card changes
        setShowAnswersView(false);
    }, [card.id]);

    useEffect(() => {
        // When entering answer view, sync the selected score
        setSelectedScore(initialScore);
    }, [showAnswersView, initialScore]);
    
    useEffect(() => {
        // When score changes, reset all copy statuses
        setCopyStatus({});
        setCopyAllStatus('idle');
    }, [selectedScore]);

    const handleModalContentClick = (e: React.MouseEvent) => {
        e.stopPropagation();
    };

    const hasSampleAnswers = card.sampleAnswers && card.sampleAnswers.length > 0;
    
    const availableScores: string[] = hasSampleAnswers
        ? [...new Set<string>(card.sampleAnswers!.flatMap(qa => qa.versions.map(v => v.score)))]
            .sort((a, b) => parseFloat(a) - parseFloat(b))
        : [];

    const handleShowAnswers = (score: string) => {
        setInitialScore(score);
        setShowAnswersView(true);
    };

    const handleCopy = (qa: SampleAnswerData, index: number) => {
        const version = qa.versions.find(v => v.score === selectedScore);
        if (!version) return;

        const questionText = `${index + 1}. ${qa.question}`;
        
        let answerText = '';
        if (Array.isArray(version.answer)) {
            answerText = version.answer.join('\n\n');
        } else {
            const paragraphs = version.answer.split(/<br\s*\/?>\s*<br\s*\/?>/gi);
            answerText = paragraphs.map(p => p.replace(/<\/?[^>]+(>|$)/g, "").trim()).join('\n\n');
        }
    
        const textToCopy = `**${questionText}**\n\n${answerText}`;
    
        navigator.clipboard.writeText(textToCopy).then(() => {
            setCopyStatus(prev => ({ ...prev, [index]: 'copied' }));
            setTimeout(() => setCopyStatus(prev => ({...prev, [index]: 'idle'})), 2000);
        }).catch(err => {
            console.error("Could not copy text: ", err);
        });
    };
    
    const handleCopyAll = () => {
        if (!card.sampleAnswers) return;

        const allText = card.sampleAnswers.map((qa, index) => {
            const version = qa.versions.find(v => v.score === selectedScore);
            if (!version) return '';

            const questionText = `${index + 1}. ${qa.question}`;
            
            let answerText = '';
            if (Array.isArray(version.answer)) {
                answerText = version.answer.join('\n\n');
            } else {
                const paragraphs = version.answer.split(/<br\s*\/?>\s*<br\s*\/?>/gi);
                answerText = paragraphs.map(p => p.replace(/<\/?[^>]+(>|$)/g, "").trim()).join('\n\n');
            }
        
            return `**${questionText}**\n\n${answerText}`;
        }).filter(Boolean).join('\n\n\n');

        if (allText) {
            navigator.clipboard.writeText(allText).then(() => {
                setCopyAllStatus('copied');
                setTimeout(() => setCopyAllStatus('idle'), 2000);
            }).catch(err => {
                console.error("Could not copy all text: ", err);
            });
        }
    };

    // View 1: Question List
    if (!showAnswersView) {
        return (
            <ModalContainerP1 onClick={handleModalContentClick}>
                <ModalHeaderP1>
                    <div className="modal-header-content">
                        <ModalHeaderTag>【2025年 9-12月】</ModalHeaderTag>
                        <h2 id="modal-title-p1">{card.title}</h2>
                    </div>
                    {card.status === 'New' && <ModalNewTagP1>新题</ModalNewTagP1>}
                    <ModalCloseButtonP1 onClick={onClose} aria-label="关闭">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                    </ModalCloseButtonP1>
                </ModalHeaderP1>
                <ModalContentP1>
                    <QuestionsSectionP1>
                        <h3>问题列表</h3>
                        <ol>
                            {card.part1Questions?.map((q, index) => <li key={index}>{q}</li>)}
                        </ol>
                    </QuestionsSectionP1>

                    {hasSampleAnswers && availableScores.length > 0 && (
                        <ScoreNavContainer>
                            <h4>点击分数查看范文解析</h4>
                            <ScoreNavButtons>
                                {availableScores.map(score => (
                                    <ScoreNavButton key={score} onClick={() => handleShowAnswers(score)}>
                                        {score}分 范文
                                    </ScoreNavButton>
                                ))}
                            </ScoreNavButtons>
                        </ScoreNavContainer>
                    )}
                </ModalContentP1>
                <ModalFooterP1>
                    <SupplementaryAction>我要补充</SupplementaryAction>
                </ModalFooterP1>
            </ModalContainerP1>
        );
    }

    // View 2: Detailed Answers
    return (
        <ModalContainerP1 onClick={handleModalContentClick}>
            <ModalHeaderP1>
                <ModalBackButtonP1 onClick={() => setShowAnswersView(false)} aria-label="返回问题列表">
                     <BackArrowIcon />
                </ModalBackButtonP1>
                <div className="modal-header-content">
                     <ModalHeaderTag>【2025年 9-12月】</ModalHeaderTag>
                     <h2 id="modal-title-p1">{card.title}</h2>
                </div>
                 {card.status === 'New' && <ModalNewTagP1>新题</ModalNewTagP1>}
                <ModalCloseButtonP1 onClick={onClose} aria-label="关闭">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </ModalCloseButtonP1>
            </ModalHeaderP1>
            <ModalContentP1>
                <ScoreSelector>
                    <ScoreButtonsWrapper>
                        {availableScores.map(score => (
                            <ScoreButton key={score} $active={score === selectedScore} onClick={() => setSelectedScore(score)}>
                                {score}分
                            </ScoreButton>
                        ))}
                    </ScoreButtonsWrapper>
                    <CopyAllButton onClick={handleCopyAll} disabled={copyAllStatus === 'copied'}>
                        {copyAllStatus === 'copied' ? (
                            <>
                                <CheckIcon />
                                <span>已复制</span>
                            </>
                        ) : (
                            <>
                                <CopyIcon />
                                <span>复制整页</span>
                            </>
                        )}
                    </CopyAllButton>
                </ScoreSelector>

                <AnswersList>
                    {card.sampleAnswers?.map((qa, index) => {
                        const version = qa.versions.find(v => v.score === selectedScore);
                        if (!version) return null;

                        return (
                            <QAWrapper key={index}>
                                <AnswerHeader>
                                    <AnswerQuestion>{`${index + 1}. ${qa.question}`}</AnswerQuestion>
                                    <CopyButton onClick={() => handleCopy(qa, index)} disabled={copyStatus[index] === 'copied'}>
                                        {copyStatus[index] === 'copied' ? <CheckIcon /> : <CopyIcon />}
                                    </CopyButton>
                                </AnswerHeader>
                                <AnalyzedText answer={version.answer} analysis={version.analysis || []} />
                                {version.analysis && version.analysis.length > 0 && (
                                    <AnalysisDetailsGrid>
                                        {version.analysis.map((item, idx) => (
                                            <AnalysisDetailCard key={idx} item={item} />
                                        ))}
                                    </AnalysisDetailsGrid>
                                )}
                            </QAWrapper>
                        )
                    })}
                </AnswersList>

            </ModalContentP1>
             <ModalFooterP1>
                <SupplementaryAction>我要补充</SupplementaryAction>
            </ModalFooterP1>
        </ModalContainerP1>
    );
};

const slideIn = keyframes`from { transform: translateY(-30px); opacity: 0; } to { transform: translateY(0); opacity: 1; }`;
const slideInMobile = keyframes`from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; }`;

// --- PART 1 MODAL STYLES ---
const ModalContainerP1 = styled.div`
    background-color: #f0f3f8;
    border-radius: 24px;
    width: 90%;
    max-width: 800px;
    height: 90vh;
    max-height: 800px;
    display: flex;
    flex-direction: column;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    animation: ${slideIn} 0.3s ease-out;
    overflow: hidden;
    @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
        width: 100%;
        max-width: 100vw;
        height: 100%;
        max-height: 100vh;
        border-radius: 0;
        animation: ${slideInMobile} 0.35s ease-out;
    }
`;
const ModalHeaderP1 = styled.header`
    background: linear-gradient(135deg, #4a90e2, #2e6ab8);
    color: white;
    padding: 1rem 1.5rem;
    display: flex;
    align-items: center;
    flex-shrink: 0;
    gap: 1rem;
    .modal-header-content {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        flex-grow: 1;
        min-width: 0; /* Prevents text overflow issues */
    }
    h2 {
        font-size: 1.75rem;
        font-weight: 700;
        margin: 0;
        line-height: 1.2;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
        padding: 1rem;
        gap: 0.75rem;
        h2 { font-size: 1.25rem; }
    }
`;

const ModalBackButtonP1 = styled.button`
    background: none;
    border: none;
    color: white;
    cursor: pointer;
    padding: 0.5rem;
    margin: -0.5rem;
    border-radius: 50%;
    transition: background-color 0.2s;
    opacity: 0.8;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    svg { 
        display: block; 
        width: 28px;
        height: 28px;
    }

    &:hover {
        background-color: rgba(255, 255, 255, 0.2);
        opacity: 1;
    }
`;

const ModalHeaderTag = styled.div`
    font-size: 0.8rem;
    font-weight: 500;
    opacity: 0.8;
`;
const ModalNewTagP1 = styled.span`
    background-color: ${({ theme }) => theme.colors.primaryOrange};
    color: white;
    font-size: 0.75rem;
    font-weight: 700;
    padding: 0.2rem 0.6rem;
    border-radius: 999px;
    align-self: flex-start;
    margin-left: auto;
    flex-shrink: 0;
`;
const ModalCloseButtonP1 = styled.button`
    background: none;
    border: none;
    color: white;
    cursor: pointer;
    padding: 0.5rem;
    margin: -0.5rem;
    border-radius: 50%;
    transition: background-color 0.2s;
    opacity: 0.8;
    svg { display: block; }
    &:hover {
        background-color: rgba(255, 255, 255, 0.2);
        opacity: 1;
    }
`;
const ModalContentP1 = styled.main`
    padding: 1.5rem;
    overflow-y: auto;
    flex-grow: 1;
    background-color: ${({ theme }) => theme.colors.cardBg};
    @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
        padding: 1rem;
    }
`;
const QuestionsSectionP1 = styled.section`
    h3 {
        margin: 0 0 1rem 0;
        font-size: 1.1rem;
        padding-left: 0.5rem;
        border-left: 4px solid ${({ theme }) => theme.colors.primaryBlue};
    }
    ol { margin: 0; padding-left: 1.5rem; }
    li { margin-bottom: 0.75rem; line-height: 1.6; color: ${({ theme }) => theme.colors.text}; }
`;
const ModalFooterP1 = styled.footer`
    padding: 0.75rem 1.5rem;
    border-top: 1px solid ${({ theme }) => theme.colors.border};
    flex-shrink: 0;
    background-color: #f0f3f8;
    text-align: center;
`;
const SupplementaryAction = styled.button`
  background: none; border: none; color: #1da1f2; font-weight: 600;
  cursor: pointer;
  &:hover { text-decoration: underline; }
`;
const ScoreNavContainer = styled.div`
    margin-top: 2rem;
    padding-top: 1.5rem;
    border-top: 1px solid ${({ theme }) => theme.colors.border};
    text-align: center;
    h4 {
        margin: 0 0 1rem 0;
        font-size: 1.1rem;
        font-weight: 600;
        color: ${({ theme }) => theme.colors.label};
    }
`;
const ScoreNavButtons = styled.div`
    display: flex;
    justify-content: center;
    gap: 1rem;
    flex-wrap: wrap;
`;
const ScoreNavButton = styled.button`
    background-color: ${({ theme }) => theme.colors.primaryOrange};
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 9999px;
    font-weight: 600;
    font-size: 1rem;
    cursor: pointer;
    transition: background-color 0.2s ease, transform 0.2s ease;
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);

    &:hover {
        background-color: #e88f33;
        transform: translateY(-2px);
    }
`;

// --- NEW STYLES for Answer View ---

const ScoreSelector = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
    padding-bottom: 1.5rem;
`;

const ScoreButtonsWrapper = styled.div`
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
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

const CopyAllButton = styled.button`
    display: flex;
    align-items: center;
    gap: 0.4rem;
    background-color: ${({ theme }) => theme.colors.boxBg};
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: 9999px;
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
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

const AnswersList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 2rem;
`;

const QAWrapper = styled.div`
    animation: ${keyframes`from { opacity: 0; } to { opacity: 1; }`} 0.4s ease-out;
`;

const AnswerHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1rem;
    margin-bottom: 1rem;
`;

const AnswerQuestion = styled.p`
    font-weight: 600;
    color: ${({ theme }) => theme.colors.header};
    margin: 0;
    line-height: 1.5;
    flex-grow: 1;
`;

const CopyButton = styled.button`
    display: flex;
    align-items: center;
    gap: 0.4rem;
    background-color: transparent;
    border: none;
    border-radius: 9999px;
    padding: 0.3rem;
    font-size: 0.8rem;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.label};
    cursor: pointer;
    transition: all 0.2s ease;
    flex-shrink: 0;

    svg {
        width: 18px;
        height: 18px;
    }

    &:hover:not(:disabled) {
        color: ${({ theme }) => theme.colors.header};
        background-color: ${({ theme }) => theme.colors.boxBg};
    }

    &:disabled {
        cursor: default;
        color: ${({ theme }) => theme.colors.placeText};
    }
`;

export default Part1Modal;