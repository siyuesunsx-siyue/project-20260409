import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const { sceneDescription, userRole = 'wife' } = await request.json();

    if (!sceneDescription) {
      return NextResponse.json(
        { error: 'Missing scene description' },
        { status: 400 }
      );
    }

    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const client = new LLMClient(config, customHeaders);

    const isWife = userRole === 'wife';
    const partnerPronoun = isWife ? '他' : '她';
    const userPronoun = isWife ? '我' : '你';
    const partnerPersonality = isWife 
      ? 'introverted, stubborn, teaches, expects to be cared for' 
      : 'sensitive, desires understanding, likes compliments';

    const systemPrompt = 'You are a marriage communication coach. Partner personality: ' + partnerPersonality + '. ' +
      'Generate 6 response options as JSON array: ' +
      '[{"id":"1","text":"..."},...] ' +
      'The user is the ' + (isWife ? 'wife' : 'husband') + '. ' +
      'Each option should be 20-50 Chinese characters, representing what the user would say to their partner. ' +
      '3 should be positive, 2 neutral, 1 negative. ' +
      'Use ' + (isWife ? 'he/him' : 'she/her') + ' pronouns for the partner. ' +
      'Only pure dialogue, no actions, no emojis, no parenthetical content.';

    const userPrompt = 'Scenario: ' + sceneDescription + ' ' +
      'Generate 6 response options for what the ' + (isWife ? 'wife' : 'husband') + ' would say.';

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      { role: 'user' as const, content: userPrompt }
    ];

    const response = await client.invoke(messages, {
      model: 'doubao-seed-2-0-mini-260215',
      temperature: 0.8,
    });

    let options;
    try {
      options = JSON.parse(response.content);
    } catch {
      const jsonMatch = response.content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        options = JSON.parse(jsonMatch[0]);
      } else {
        options = [
          { id: '1', text: '选项生成失败，请重试' }
        ];
      }
    }

    return NextResponse.json({ options });
  } catch (error) {
    console.error('Failed to generate options:', error);
    return NextResponse.json(
      { error: 'Failed to generate options' },
      { status: 500 }
    );
  }
}
