import React from 'react';
import { styled, ThemeProvider } from 'styled-components';
import { Routes, Route } from 'react-router-dom';

import HomePage from './pages/HomePage';
import QuestionBankPage from './pages/QuestionBankPage';
import TipsPage from './pages/TipsPage';
import AnalysisPage from './pages/AnalysisPage';
import ScoringPage from './pages/ScoringPage';

import { VocabularyProvider, useVocabulary } from './context/VocabularyContext';
import Toast from './components/Toast';
import VocabularyFab from './components/VocabularyFab';
import VocabularyModal from './components/VocabularyModal';
import SelectionAddButton from './components/SelectionAddButton';

import { theme, GlobalStyles } from './theme';

const AppWrapper = styled.div`
    padding: 2rem;

    @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
        padding: 1rem;
    }
`;

const VocabularyFeature: React.FC = () => {
    const {
        vocabulary,
        isVocabModalOpen,
        toastMessage,
        selectedWord,
        selectionPosition,
        setIsVocabModalOpen,
        handleAddWord,
        handleDeleteWord,
        handleClearVocabulary,
    } = useVocabulary();

    return (
        <>
            {selectedWord && selectionPosition && (
                <SelectionAddButton
                    position={selectionPosition}
                    onAdd={() => handleAddWord(selectedWord)}
                />
            )}
            <VocabularyFab count={vocabulary.length} onClick={() => setIsVocabModalOpen(true)} />
            {isVocabModalOpen && (
                <VocabularyModal
                    words={vocabulary}
                    onClose={() => setIsVocabModalOpen(false)}
                    onDelete={handleDeleteWord}
                    onClear={handleClearVocabulary}
                />
            )}
            <Toast message={toastMessage} />
        </>
    );
};


const App: React.FC = () => {
    return (
        <ThemeProvider theme={theme}>
            <GlobalStyles />
            <VocabularyProvider>
                <AppWrapper>
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/bank" element={<QuestionBankPage />} />
                        <Route path="/tips" element={<TipsPage />} />
                        <Route path="/scoring" element={<ScoringPage />} />
                        <Route path="/analysis/:cardId" element={<AnalysisPage />} />
                    </Routes>
                </AppWrapper>
                <VocabularyFeature />
            </VocabularyProvider>
        </ThemeProvider>
    );
};

export default App;