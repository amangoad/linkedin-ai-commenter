import OpenAI from 'openai';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { post = '', style = 'professional', instruction = '' } = req.body || {};
    if (!post.trim()) return res.status(400).json({ error: 'Missing post text' });

    const prompt = `You write authentic LinkedIn comments for a human professional. Read the post below and produce exactly 3 distinct comments. They must directly relate to the post, add a useful thought or natural question, and avoid generic praise. Do not mention AI. Do not use hashtags unless truly relevant. Do not sound like a salesperson. Style: ${style}. Extra instruction: ${instruction || 'None'}. Keep each comment concise (normally 15-45 words).\n\nPOST:\n${post.slice(0, 12000)}`;
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.8,
      messages: [
        { role: 'system', content: 'Return only valid JSON: {"comments":["comment 1","comment 2","comment 3"]}.' },
        { role: 'user', content: prompt }
      ]
    });

    let raw = response.choices?.[0]?.message?.content || '';
    raw = raw.replace(/^```json\s*/, '').replace(/```$/, '').trim();
    const data = JSON.parse(raw);
    if (!Array.isArray(data.comments)) throw new Error('Invalid model response');
    return res.status(200).json({ comments: data.comments.slice(0, 3) });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Generation failed' });
  }
}
