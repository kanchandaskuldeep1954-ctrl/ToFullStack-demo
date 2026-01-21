import { UniversalEdgeTTS } from 'edge-tts-universal';

export const config = {
    runtime: 'edge',
};

export default async function handler(req: Request) {
    const url = new URL(req.url);
    const text = url.searchParams.get('text');
    const voice = url.searchParams.get('voice') || 'en-US-AriaNeural';

    if (!text) {
        return new Response(JSON.stringify({ error: 'Text is required' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        const tts = new UniversalEdgeTTS(text, voice);
        const audioBuffer = await tts.synthesize();

        if (!audioBuffer || audioBuffer.length === 0) {
            return new Response(JSON.stringify({ error: 'TTS produced no audio' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        return new Response(audioBuffer, {
            status: 200,
            headers: {
                'Content-Type': 'audio/mpeg',
                'Cache-Control': 'public, max-age=31536000, immutable',
            },
        });
    } catch (error: any) {
        console.error('Edge TTS Error:', error);
        return new Response(JSON.stringify({ error: error.message || 'Failed to generate speech' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
