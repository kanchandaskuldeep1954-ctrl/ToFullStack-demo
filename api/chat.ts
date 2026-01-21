import { Groq } from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages, systemPrompt, currentCode } = req.body;

  try {
    const codeContext = `\n[CURRENT CODE]:\n\`\`\`html\n${currentCode}\n\`\`\``;
    const fullSystemPrompt = systemPrompt + codeContext;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: fullSystemPrompt },
        ...messages
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 1,
      max_tokens: 150,
    });

    const reply = completion.choices[0]?.message?.content || "My brain glitched 💀 Try again?";
    res.status(200).json({ text: reply });
  } catch (error: any) {
    console.error('Groq Chat Error:', error);
    res.status(500).json({ error: error.message || 'AI processing failed' });
  }
}
