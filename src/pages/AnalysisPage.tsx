import React from 'react';
import { styled } from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
import { getCardById } from '../data/allCards';
import { BackArrowIcon } from '../components/shared/Icons';
import SampleAnswerViewer from '../components/shared/SampleAnswerViewer';
import { initialPart1Data } from '../data/part1';
import { initialPart2Data } from '../data/part2';

const AnalysisPage: React.FC = () => {
    const { cardId } = useParams<{ cardId: string }>();
    const navigate = useNavigate();
    const card = cardId ? getCardById(cardId) : null;

    const handleBackToBank = () => {
        if (card) {
            let topicId: string | null = null;
            let part: 'part1' | 'part2' = 'part1';
            
            for (const topic of initialPart2Data) {
                if (topic.cards.some(c => c.id === card.id)) {
                    topicId = topic.id;
                    part = 'part2';
                    break;
                }
            }
            if (!topicId) {
                for (const topic of initialPart1Data) {
                    if (topic.cards.some(c => c.id === card.id)) {
                        topicId = topic.id;
                        part = 'part1';
                        break;
                    }
                }
            }
            navigate('/bank', { state: { part, topicId } });
        } else {
            navigate('/bank');
        }
    };

    if (!card) {
        return (
            <PageContainer>
                 <PageHeader>
                    <BackButton onClick={() => navigate('/bank')} aria-label="返回题库">
                        <BackArrowIcon />
                        <span>返回题库</span>
                    </BackButton>
                    <h1>错误</h1>
                </PageHeader>
                <p>未找到对应的题库卡片。</p>
            </PageContainer>
        );
    }

    const isPart2Card = !!card.part2Title;
    // For Part 2 cards, skip the first answer which belongs to Part 2
    const sampleAnswers = (isPart2Card ? card?.sampleAnswers?.slice(1) : card?.sampleAnswers) || [];
    const totalQuestions = sampleAnswers.length;

    const getQuestionNumbering = (index: number, question: string) => {
        if (isPart2Card) {
            return `${index + 1}. ${question}`;
        }
        if (question.startsWith('Part 2')) {
            return question;
        }
        return `${index + 1}. ${question}`;
    };

    return (
        <PageContainer>
            <PageHeader>
                <BackButton onClick={handleBackToBank} aria-label="返回题库">
                    <BackArrowIcon />
                    <span>返回题库</span>
                </BackButton>
                <h1>{card.title}{isPart2Card ? ' - Part 3 精讲' : ''}</h1>
            </PageHeader>
            <main>
                {sampleAnswers.length > 0 ? (
                    <AnswerContent>
                         <AnswerContentHeader>
                            <h4>{isPart2Card ? 'Part 3 范文精讲' : '范文精讲'}</h4>
                        </AnswerContentHeader>
                        <SampleAnswerViewer 
                            sampleAnswers={sampleAnswers}
                            totalQuestions={totalQuestions}
                            questionNumbering={getQuestionNumbering}
                        />
                    </AnswerContent>
                ) : (
                    <p>暂无范文解析。</p>
                )}
            </main>
        </PageContainer>
    );
};

const PageContainer = styled.div`
    max-width: 900px;
    margin: 0 auto;
    animation: fadeIn 0.5s ease;
`;

const PageHeader = styled.header`
    position: relative;
    text-align: center;
    margin-bottom: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;

    h1 {
        margin: 0;
        font-size: 2rem;
        font-weight: 700;
        color: ${({ theme }) => theme.colors.header};
    }
    
    @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
        margin-bottom: 2rem;
        h1 {
            font-size: 1.5rem;
            margin: 0 3.5rem; /* Space for back button */
        }
    }
`;

const BackButton = styled.button`
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background-color: ${({ theme }) => theme.colors.boxBg};
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: 9999px;
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.label};
    cursor: pointer;
    transition: all 0.2s ease;

    svg {
        width: 20px;
        height: 20px;
    }

    &:hover {
        background-color: ${({ theme }) => theme.colors.border};
        color: ${({ theme }) => theme.colors.header};
    }
    @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
        padding: 0.6rem;
        gap: 0;
        span {
            display: none;
        }
    }
`;

const AnswerContent = styled.div`
    background-color: ${({ theme }) => theme.colors.cardBg};
    border: 1px solid ${({ theme }) => theme.colors.border};
    padding: 1.5rem;
    border-radius: 16px;
    box-shadow: 0 4px 12px ${({ theme }) => theme.colors.shadow};

    @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
        padding: 1rem;
    }
`;

const AnswerContentHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    gap: 1rem;

    h4 {
        margin: 0;
        font-size: 1rem;
        font-weight: 600;
        color: #2e6ab8;
        flex-grow: 1;
    }
`;

export default AnalysisPage;