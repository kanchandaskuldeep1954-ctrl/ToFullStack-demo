import { UniversalEdgeTTS } from 'edge-tts-universal';

export default async function handler(req: any, res: any) {
    const { text, voice = 'en-US-AndrewNeural' } = req.query;

    if (!text) {
        return res.status(400).json({ error: 'Text is required' });
    }

    try {
        const tts = new UniversalEdgeTTS(text, voice);
        const audioBuffer = await tts.synthesize();

        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        res.status(200).send(audioBuffer);
    } catch (error: any) {
        console.error('Edge TTS Error:', error);
        res.status(500).json({ error: 'Failed to generate speech' });
    }
}
