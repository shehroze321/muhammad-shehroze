import OpenAI from 'openai';
import { config } from '../../../config/env';
import { delay, estimateTokens } from '../../../shared/utils';
import { Iteration, GenerationResult } from '../../../shared/types';

export class OpenAIService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: config.openaiApiKey,
    });
  }

  async generatePost(
    userInput: string,
    _language: string,
    conversationHistory: Array<{ role: string; content: string }> = []
  ): Promise<string> {
    await delay(2000);

    const systemPrompt = `You are a professional social media content creator and copywriter. Your task is to create engaging, human-written social media posts that sound natural and authentic. 

Key guidelines:
- Write in a conversational, human tone
- Create longer, more detailed posts (aim for 3-5 paragraphs)
- Focus on storytelling and providing value
- Avoid excessive emojis (use sparingly, maximum 1-2 per post)
- Make content that people would actually want to read and share
- Include actionable insights or tips when relevant
- Write as if you're a knowledgeable expert sharing insights with your audience

Generate the best social media post possible for the user's request. If the user provides critique, respond with a revised version of your previous attempts.`;

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.map((msg) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
      { role: 'user', content: userInput },
    ];

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.7,
      max_tokens: 800,
    });

    return response.choices[0]?.message?.content || 'Failed to generate post';
  }

  async reflectOnPost(post: string, _language: string): Promise<string> {
    await delay(2000);

    const systemPrompt = `You are a professional social media strategist and content reviewer. Your task is to provide constructive feedback and recommendations for social media posts.

Key guidelines:
- Provide detailed, actionable feedback
- Focus on engagement, clarity, and value
- Suggest improvements for length, tone, and structure
- Recommend ways to make content more shareable
- Consider the target audience and platform best practices
- Be specific about what works and what could be improved
- Suggest alternative approaches or angles

Generate comprehensive critique and recommendations for the user's post.`;

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Critique this tweet and provide feedback: ${post}` },
    ];

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.7,
      max_tokens: 200,
    });

    return response.choices[0]?.message?.content || 'Failed to generate reflection';
  }

  async runGenerationCycle(
    userInput: string,
    language: string
  ): Promise<GenerationResult> {
    const iterations: Iteration[] = [];
    let currentGeneration = '';
    const conversationHistory: Array<{ role: string; content: string }> = [];

    for (let i = 0; i < 3; i++) {
      currentGeneration = await this.generatePost(
        i === 0 ? userInput : 'Improve based on the feedback',
        language,
        conversationHistory
      );

      const reflection = await this.reflectOnPost(currentGeneration, language);

      iterations.push({
        generation: currentGeneration,
        reflection,
      });

      conversationHistory.push({ role: 'assistant', content: currentGeneration });
      conversationHistory.push({ role: 'user', content: reflection });
    }

    const totalText = iterations
      .flatMap((iter) => [iter.generation, iter.reflection])
      .join(' ');
    const tokens = estimateTokens(totalText) + estimateTokens(userInput);

    return {
      finalPost: currentGeneration,
      iterations,
      tokens,
    };
  }
}

