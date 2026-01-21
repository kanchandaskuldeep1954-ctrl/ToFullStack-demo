import { UniversalEdgeTTS } from 'edge-tts-universal';

export default async function handler(req: any, res: any) {
    const { text, voice = 'en-US-AriaNeural' } = req.query;

    if (!text) {
        return res.status(400).json({ error: 'Text is required' });
    }

    console.log(`TTS Request: "${text.substring(0, 50)}..." Voice: ${voice}`);

    try {
        const tts = new UniversalEdgeTTS(text, voice);
        const audioBuffer = await tts.synthesize();

        if (!audioBuffer || audioBuffer.length === 0) {
            console.error('TTS produced empty buffer');
            return res.status(500).json({ error: 'TTS produced no audio' });
        }

        console.log(`TTS Success: Generated ${audioBuffer.length} bytes`);

        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');

        // Ensure we send it as a Buffer for Vercel compat
        return res.status(200).send(Buffer.from(audioBuffer));
    } catch (error: any) {
        console.error('Edge TTS Error:', error);
        return res.status(500).json({ error: error.message || 'Failed to generate speech' });
    }
}
