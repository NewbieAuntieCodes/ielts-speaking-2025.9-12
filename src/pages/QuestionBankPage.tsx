import React, { useState, useEffect } from 'react';
import { styled } from 'styled-components';
import { useNavigate, useLocation } from 'react-router-dom';
import TopicContainer from '../components/TopicContainer';
import TopicModal from '../components/modals/TopicModal';
import { CueCardData } from '../types';
import { initialPart1Data } from '../data/part1';
import { initialPart2Data } from '../data/part2';
import { BackArrowIcon } from '../components/shared/Icons';

const QuestionBankPage: React.FC = () => {
    const [activePage, setActivePage] = useState<'part1' | 'part2'>('part1');
    const [selectedCard, setSelectedCard] = useState<CueCardData | null>(null);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const state = location.state as { part?: 'part1' | 'part2', topicId?: string };
        if (state?.part) {
            setActivePage(state.part);
        }
        if (state?.topicId) {
            // Use timeout to allow the correct page content to render before scrolling
            setTimeout(() => {
                const element = document.getElementById(state.topicId!);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 100);
        }
    }, [location.state]);

    const handleCardClick = (card: CueCardData) => {
        setSelectedCard(card);
    };

    const handleCloseModal = () => {
        setSelectedCard(null);
    };

    return (
        <>
            <Header>
                <HeaderBackButton onClick={() => navigate('/')} aria-label="返回主页">
                    <BackArrowIcon />
                    <span>返回</span>
                </HeaderBackButton>
                <h1>雅思口语 2025 年 9-12 月题库</h1>
                <Nav>
                    <NavButton 
                        $active={activePage === 'part1'}
                        onClick={() => setActivePage('part1')}>
                        Part1
                    </NavButton>
                    <NavButton 
                        $active={activePage === 'part2'}
                        onClick={() => setActivePage('part2')}>
                        Part2+3
                    </NavButton>
                </Nav>
            </Header>

            <div id="page-part1" className={activePage === 'part1' ? '' : 'hidden'}>
                <TopicContainer 
                    key="part1" 
                    initialTopics={initialPart1Data} 
                    onCardClick={handleCardClick} 
                />
            </div>

            <div id="page-part2" className={activePage === 'part2' ? '' : 'hidden'}>
                <TopicContainer 
                    key="part2" 
                    initialTopics={initialPart2Data} 
                    onCardClick={handleCardClick} 
                />
            </div>

            {selectedCard && <TopicModal card={selectedCard} onClose={handleCloseModal} />}
        </>
    );
};

// --- STYLED COMPONENTS ---
const Header = styled.header`
    text-align: center;
    margin-bottom: 3rem;
    position: relative;

    h1 {
        font-size: 2.5rem;
        font-weight: 700;
        color: ${({ theme }) => theme.colors.header};
        margin: 0 6rem; /* Avoids overlap with back button */
    }
    @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
        margin-bottom: 2rem;
        h1 {
            font-size: 1.5rem;
            margin: 0 3.5rem;
        }
    }
`;

const Nav = styled.nav`
    display: flex;
    justify-content: center;
    gap: 1rem;
    margin-top: 1.5rem;
`;

const NavButton = styled.button<{ $active?: boolean }>`
    font-family: inherit;
    font-size: 1rem;
    font-weight: 600;
    padding: 0.75rem 1.5rem;
    border-radius: 9999px;
    border: 1px solid ${({ theme }) => theme.colors.border};
    background-color: ${({ theme }) => theme.colors.cardBg};
    color: ${({ theme }) => theme.colors.label};
    cursor: pointer;
    transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease;
    &:hover {
        background-color: ${({ theme }) => theme.colors.boxBg};
        color: ${({ theme }) => theme.colors.header};
    }
    ${({ $active, theme }) => $active && `
        background-color: ${theme.colors.header};
        color: white;
        border-color: ${theme.colors.header};
    `}
     @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
        padding: 0.6rem 1.2rem;
        font-size: 0.9rem;
    }
`;

const BackButton = styled.button`
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
    svg { width: 20px; height: 20px; }
    &:hover {
        background-color: ${({ theme }) => theme.colors.border};
        color: ${({ theme }) => theme.colors.header};
    }
`;

const HeaderBackButton = styled(BackButton)`
    position: absolute;
    top: 50%;
    left: 0;
    transform: translateY(-50%);
    @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
        padding: 0.6rem;
        top: 0;
        transform: none;
        span { display: none; }
    }
`;

export default QuestionBankPage;