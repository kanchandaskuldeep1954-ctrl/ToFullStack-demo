import { Message, Lesson } from '../types';
import { SYSTEM_PROMPT } from '../constants';

/**
 * Validates the user's code against the lesson objective using Groq.
 */
export const validateCodeWithAI = async (
    code: string,
    lesson: Lesson
): Promise<{ passed: boolean; feedback: string }> => {
    try {
        const response = await fetch('/api/validate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code, lesson }),
        });

        if (!response.ok) throw new Error('Validation failed');
        return await response.json();
    } catch (error) {
        console.error("Validation Error:", error);
        return { passed: false, feedback: "My brain glitched checking that. Try again?" };
    }
};

/**
 * Chat response generation using Groq.
 */
export const generateAIResponse = async (
    history: Message[],
    currentCode: string,
    userPrompt: string
): Promise<string> => {
    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messages: [
                    ...history.slice(-4).map(m => ({
                        role: m.role === 'ai' ? 'assistant' : 'user',
                        content: m.text
                    })),
                    { role: 'user', content: userPrompt }
                ],
                systemPrompt: SYSTEM_PROMPT,
                currentCode
            }),
        });

        if (!response.ok) throw new Error('Chat failed');
        const data = await response.json();
        return data.text;
    } catch (error) {
        console.error("Chat Error:", error);
        return "Connection error. Check your vibe!";
    }
};
