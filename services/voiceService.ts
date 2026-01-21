/**
 * Generates natural speech using Microsoft Edge TTS via serverless function.
 */
export const generateNaturalSpeech = async (text: string): Promise<AudioBuffer | null> => {
    try {
        const response = await fetch(`/api/tts?text=${encodeURIComponent(text)}`);

        if (!response.ok) throw new Error("TTS request failed");

        const arrayBuffer = await response.arrayBuffer();

        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        return await audioContext.decodeAudioData(arrayBuffer);

    } catch (error) {
        console.error("TTS Error:", error);
        // Fallback to browser TTS if the API fails
        speakWithBrowserTTS(text);
        return null;
    }
};

/**
 * Fallback browser TTS with better settings.
 */
export const speakWithBrowserTTS = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);

    // Use best available voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v =>
        v.name.includes('Google UK English Male') ||
        v.name.includes('Samantha') ||
        v.name.includes('Microsoft David')
    );

    if (preferredVoice) utterance.voice = preferredVoice;
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    window.speechSynthesis.speak(utterance);
};

/**
 * Speak with emotion using browser TTS (for real-time hints).
 */
export const speakWithEmotion = (text: string, emotion: 'excited' | 'chill' | 'encouraging') => {
    const utterance = new SpeechSynthesisUtterance(text);

    switch (emotion) {
        case 'excited':
            utterance.rate = 1.3;
            utterance.pitch = 1.2;
            utterance.volume = 1.0;
            break;
        case 'chill':
            utterance.rate = 0.9;
            utterance.pitch = 0.9;
            utterance.volume = 0.8;
            break;
        case 'encouraging':
            utterance.rate = 1.1;
            utterance.pitch = 1.1;
            utterance.volume = 1.0;
            break;
    }

    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v =>
        v.name.includes('Google UK English Male') ||
        v.name.includes('Samantha')
    );
    if (preferredVoice) utterance.voice = preferredVoice;

    window.speechSynthesis.speak(utterance);
};
