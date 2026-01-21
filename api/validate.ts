import { Groq } from 'groq-sdk';

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { code, lesson } = req.body;

    try {
        const prompt = `
      Act as a code reviewer.
      Lesson Objective: "${lesson.objective}"
      Validation Criteria: "${lesson.validationCriteria}"
      
      User Code:
      \`\`\`html
      ${code}
      \`\`\`
      
      Task: Check if the code meets the objective.
      Output: JSON object with keys: "passed" (boolean) and "feedback" (string, max 2 sentences, encouraging slang).
    `;

        const completion = await groq.chat.completions.create({
            messages: [
                { role: 'user', content: prompt }
            ],
            model: 'llama-3.3-70b-versatile',
            response_format: { type: 'json_object' },
            temperature: 0.5,
        });

        const text = completion.choices[0]?.message?.content || "{}";
        const result = JSON.parse(text);

        res.status(200).json(result);
    } catch (error: any) {
        console.error('Groq Validation Error:', error);
        res.status(500).json({ passed: false, feedback: "My brain glitched checking that. Try again?" });
    }
}
