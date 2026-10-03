import { generateText } from 'ai';
import { gateway } from '@ai-sdk/gateway';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const business = typeof body.business === 'string' ? body.business.trim() : '';
    if (!business) return Response.json({ error: 'Describe your business first.' }, { status: 400 });

    const { text } = await generateText({
      model: gateway('openai/gpt-6.1-sol'),
      prompt: [
        'You are the strategy engine for AI Revenue OS.',
        'Create a concise, realistic revenue plan. Do not promise income.',
        'Return these sections: Best customer, Core offer, Suggested price, Acquisition channel, Funnel, First 7 actions, Metrics to track.',
        'Business description:',
        business,
      ].join('\n\n'),
    });

    return Response.json({ result: text });
  } catch (error) {
    console.error('AI audit failed', error);
    return Response.json({ error: 'AI audit failed. Check AI_GATEWAY_API_KEY and try again.' }, { status: 500 });
  }
}