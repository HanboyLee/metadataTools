import { NextResponse, NextRequest } from 'next/server';
import OpenAI from 'openai';
import https from 'https';

interface AnalysisResult {
  title: string;
  description: string;
  keywords: string;
}

const httpsAgent = new https.Agent({
  keepAlive: true,
  timeout: 60000,
  rejectUnauthorized: false // Only for debugging
});

async function makeOpenAIRequest(apiKey: string, dataUrl: string, prompt: string) {
  if (!apiKey?.startsWith('sk-')) {
    throw new Error('Invalid OpenAI API key format');
  }

  const client = new OpenAI({
    apiKey: apiKey,
    maxRetries: 3,
    timeout: 60000,
    httpAgent: httpsAgent,
    baseURL: 'https://api.openai.com/v1'
  });

  try {
    console.log('Making OpenAI API request with configuration:', {
      model: 'gpt-4o-mini',
      maxTokens: 300,
      temperature: 0.3
    });

    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: [
            { 
              type: 'text', 
              text: prompt
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

    console.log('Response received, request ID:', response.id);
    return response;
  } catch (error: any) {
    console.error('OpenAI API error details:', {
      message: error.message,
      type: error.type,
      code: error.code,
      name: error.name,
      status: error.status,
      stack: error.stack
    });

    if (error.code === 'ECONNREFUSED') {
      throw new Error('Failed to connect to OpenAI API. Please check your network connection and proxy settings.');
    }

    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    console.log('Received form data keys:', Array.from(formData.keys()));
    
    const apiKey = process.env.OPENAI_API_KEY;
    const imageFile = formData.get('image') as File;
    const prompt = formData.get('prompt') as string;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key is required' },
        { status: 400 }
      );
    }

    if (!imageFile || !prompt) {
      return NextResponse.json(
        { error: 'Image and prompt are required' },
        { status: 400 }
      );
    }

    // Convert image to base64
    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString('base64');
    const dataUrl = `data:${imageFile.type};base64,${base64Image}`;

    console.log('Image converted to base64');
    console.log('Making OpenAI API request...');
    
    const response = await makeOpenAIRequest(apiKey, dataUrl, prompt);
    console.log('OpenAI API response received');
    
    if (!response.choices?.[0]?.message?.content) {
      throw new Error('Invalid response format from OpenAI');
    }

    const content = response.choices[0].message.content;

    // Parse the JSON response from GPT-4
    let result: AnalysisResult;
    try {
      result = JSON.parse(content);
      
      if (!result.title || !result.description || !result.keywords) {
        throw new Error('Invalid response structure');
      }
      
    } catch (error) {
      console.error('Failed to parse GPT-4 response:', error);
      console.error('Raw content that failed to parse:', content);
      return NextResponse.json(
        { 
          error: 'Failed to parse AI response',
          details: content 
        },
        { status: 500 }
      );
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error in analyze route:', {
      message: error.message,
      type: error.type,
      code: error.code,
      name: error.name,
      status: error.status,
      stack: error.stack
    });
    
    const errorMessage = error.message || 'Unknown error';
    const statusCode = error.status || 500;
    
    return NextResponse.json(
      { 
        error: 'Failed to process request',
        details: errorMessage,
        code: error.code,
        type: error.type,
        name: error.name
      },
      { status: statusCode }
    );
  }
}
