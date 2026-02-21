import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const processVideo = async (url: string) => {
    const res = await api.post('/process-video', { url });
    return res.data;
};

export const processPDF = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const res = await api.post('/process-pdf', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return res.data;
};

export const generateFlashcards = async (sourceId: string) => {
    const res = await api.post('/generate-flashcards', { source_id: sourceId });
    return res.data;
};

export const generateQuiz = async (sourceId: string) => {
    const res = await api.post('/generate-quiz', { source_id: sourceId });
    return res.data;
};

// Note: Streaming chat response handled directly via fetch for SSE in components.
