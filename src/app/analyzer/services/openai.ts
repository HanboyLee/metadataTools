import OpenAI from 'openai';
import { AnalysisResult } from '../types';

export async function analyzeImage(file: File, apiKey: string): Promise<AnalysisResult> {
  try {
    // Convert image to base64
    const bytes = await file.arrayBuffer();
    const base64Image = Buffer.from(bytes).toString('base64');
    const dataUrl = `data:${file.type};base64,${base64Image}`;

    const client = new OpenAI({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true,
      defaultHeaders: {
        'Content-Type': 'application/json',
      }
    });

    console.log('Making OpenAI API request...');
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: [
            { 
              type: 'text', 
              text: 'Analyze this image and provide a title, description, and keywords in JSON format.' 
            },
            {
              type: 'image_url',
              image_url: {
                url: dataUrl,
                detail: 'low'
              },
            },
          ],
        },
      ],
      max_tokens: 300,
      temperature: 0.3,
      response_format: { type: "json_object" }
    });

    console.log('OpenAI API response:', response);

    if (!response.choices?.[0]?.message?.content) {
      throw new Error('Invalid response from OpenAI');
    }

    const content = response.choices[0].message.content;
    const result = JSON.parse(content);

    if (!result.title || !result.description || !result.keywords) {
      throw new Error('Invalid response structure');
    }

    return result;
  } catch (error: any) {
    console.error('Error analyzing image:', error);
    
    // Handle specific API errors
    if (error.status === 401) {
      throw new Error('Invalid API key. Please check your OpenAI API key and try again.');
    } else if (error.status === 429) {
      throw new Error('Rate limit exceeded. Please wait a moment and try again.');
    } else if (error.message?.includes('API key')) {
      throw new Error('API key error: ' + error.message);
    }
    
    throw new Error(error.message || 'Failed to analyze image');
  }
}
