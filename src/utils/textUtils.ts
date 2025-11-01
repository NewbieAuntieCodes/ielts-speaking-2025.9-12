export const cleanWord = (text: string): string | null => {
    const word = text.trim().toLowerCase()
        .replace(/[.,/#!$%^&*;:{}=\-_`~()?]/g, "")
        .replace(/’s|'s/g, '');
    
    if (word && !word.includes(' ')) {
        return word;
    }
    return null;
}