import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { inspirations, messages, mode } = await req.json();

  const inspirationContext = inspirations?.length > 0
    ? `The user has provided the following inspirations:\n${inspirations.map((ins: { type: string; label: string; content: string }, i: number) =>
        `[${ins.type.toUpperCase()} ${i + 1}] ${ins.label}: ${ins.content}`
      ).join('\n\n')}`
    : 'No inspirations provided yet.';

  const conversationHistory = messages?.length > 0
    ? `\n\nConversation history:\n${messages.map((m: { role: string; content: string }) => `${m.role === 'user' ? 'User' : 'ilhum'}: ${m.content}`).join('\n\n')}`
    : '';

  let systemPrompt = '';
  let userMessage = '';

  if (mode === 'chat') {
    systemPrompt = `You are ilhum, a creative story architect. You help writers build original stories inspired by existing works.

${inspirationContext}

Use these inspirations as creative fuel — not to copy, but to inspire. Help the user develop their story ideas through conversation. Be specific, creative, and thoughtful.`;
    userMessage = messages[messages.length - 1].content;
  } else if (mode === 'characters') {
    systemPrompt = `You are ilhum, a creative story architect.

${inspirationContext}
${conversationHistory}

Based on the conversation above, generate detailed character profiles. For each character include:
- Name
- Role (Main Character / Side Character / Villain / NPC)
- Background
- Personality
- Character arc
- Key relationships

Generate at least 4-5 characters that fit the story being developed.`;
    userMessage = 'Generate detailed character profiles based on our conversation and inspirations.';
  } else if (mode === 'flowchart_json') {
    systemPrompt = `You are ilhum, a creative story architect.

${inspirationContext}
${conversationHistory}

Based on the conversation above, generate a story flowchart as JSON.

Return ONLY a valid JSON object with this exact structure, no explanation, no markdown, no backticks:
{
  "nodes": [
    { "id": "1", "data": { "label": "Story Beginning" }, "position": { "x": 400, "y": 0 }, "style": { "background": "#1a1508", "color": "#e8e0d0", "border": "1px solid #c9a96e", "borderRadius": "8px", "padding": "10px", "fontSize": "12px", "width": 180 } },
    { "id": "2", "data": { "label": "Plot Point 1" }, "position": { "x": 400, "y": 120 }, "style": { "background": "#1a1508", "color": "#e8e0d0", "border": "1px solid #c9a96e", "borderRadius": "8px", "padding": "10px", "fontSize": "12px", "width": 180 } }
  ],
  "edges": [
    { "id": "e1-2", "source": "1", "target": "2", "style": { "stroke": "#c9a96e" }, "animated": true }
  ]
}

Rules:
- Generate 8-15 nodes covering the full story arc
- Include branching paths for different endings
- Branch nodes should have x positions offset (e.g. x: 200, x: 600) to show divergence
- Each node label should be short (3-6 words max)
- Connect all nodes with edges
- Return ONLY the JSON, nothing else`;
    userMessage = 'Generate a flowchart JSON for the story.';
  }

  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openrouter/free',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
      }),
    });

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      console.error('Unexpected response:', JSON.stringify(data));
      return NextResponse.json({ story: 'No response generated.' }, { status: 500 });
    }

    if (mode === 'flowchart_json') {
      try {
        const clean = content.replace(/```json|```/g, '').trim();
        const parsed = JSON.parse(clean);
        return NextResponse.json(parsed);
      } catch {
        console.error('Failed to parse flowchart JSON:', content);
        return NextResponse.json({ story: 'Flowchart generation failed.' }, { status: 500 });
      }
    }

    return NextResponse.json({ story: content });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ story: 'Generation failed.' }, { status: 500 });
  }
}