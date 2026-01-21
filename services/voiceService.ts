let globalAudioContext: AudioContext | null = null;

/**
 * Initializes or resumes the global audio context on user gesture.
 */
export const initAudioContext = async () => {
    console.log("Initializing AudioContext...");
    if (!globalAudioContext) {
        globalAudioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });
    }
    if (globalAudioContext.state === 'suspended') {
        console.log("Resuming suspended AudioContext...");
        await globalAudioContext.resume();
    }
    console.log("AudioContext state:", globalAudioContext.state);
    return globalAudioContext;
};

/**
 * Generates natural speech using Microsoft Edge TTS via serverless function.
 */
export const generateNaturalSpeech = async (text: string): Promise<AudioBuffer | null> => {
    console.log("Generating Natural Speech for:", text.substring(0, 30) + "...");
    try {
        const response = await fetch(`/api/tts?text=${encodeURIComponent(text)}`);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `TTS request failed with status ${response.status}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        console.log("Audio data received, length:", arrayBuffer.byteLength);

        const ctx = await initAudioContext();
        const buffer = await ctx.decodeAudioData(arrayBuffer);
        console.log("Audio decoded successfully, duration:", buffer.duration);
        return buffer;

    } catch (error) {
        console.error("Natural TTS Error:", error);
        // Fallback to browser TTS if the API fails
        console.log("Falling back to Browser TTS...");
        speakWithBrowserTTS(text);
        return null;
    }
};

/**
 * Fallback browser TTS with better settings.
 */
export const speakWithBrowserTTS = (text: string) => {
    console.log("Executing Browser TTS...");
    const utterance = new SpeechSynthesisUtterance(text);

    // Ensure voices are loaded
    const voices = window.speechSynthesis.getVoices();
    console.log(`Available voices: ${voices.length}`);

    // Try to find a natural sounding voice
    const preferredVoice = voices.find(v =>
        v.name.includes('Google UK English Male') ||
        v.name.includes('Samantha') ||
        v.name.includes('Microsoft Andrew') ||
        v.name.includes('Microsoft David') ||
        v.name.includes('Natural')
    ) || voices[0];

    if (preferredVoice) {
        console.log("Selected voice:", preferredVoice.name);
        utterance.voice = preferredVoice;
    }

    utterance.rate = 1.0;
    utterance.pitch = 1.1;
    utterance.volume = 1.0;

    window.speechSynthesis.speak(utterance);
};

/**
 * Speak with emotion using browser TTS (for real-time hints).
 */
export const speakWithEmotion = (text: string, emotion: 'excited' | 'chill' | 'encouraging') => {
    console.log(`Speaking with emotion: ${emotion}`);
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
        v.name.includes('Samantha') ||
        v.name.includes('Natural')
    );
    if (preferredVoice) utterance.voice = preferredVoice;

    window.speechSynthesis.speak(utterance);
};
