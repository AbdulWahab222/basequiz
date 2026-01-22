import { NextRequest, NextResponse } from 'next/server'

// Ollama configuration
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434'
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2:3b'

interface Question {
  id: number
  question: string
  options: string[]
  correctAnswer: number
  explanation?: string
}

interface QuizResponse {
  questions: Question[]
}

export async function POST(request: NextRequest) {
  try {
    const { topic } = await request.json()

    if (!topic || typeof topic !== 'string') {
      return NextResponse.json(
        { error: 'Topic is required' },
        { status: 400 }
      )
    }

    // Construct the prompt for Ollama
    const prompt = `Generate a JSON response with 5 multiple-choice quiz questions about "${topic}". 
The response must be valid JSON with this exact structure:
{
  "questions": [
    {
      "id": 1,
      "question": "Your question text here",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Brief explanation of why this is correct"
    }
  ]
}

Requirements:
- Generate 5 questions about the topic "${topic}"
- Make questions educational and accurate
- correctAnswer should be 0, 1, 2, or 3 (index of correct option)
- Provide clear explanations for each correct answer
- Return ONLY valid JSON, no markdown formatting, no code blocks

Respond with valid JSON only:`

    // Call Ollama API
    const ollamaResponse = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.7,
          num_predict: 2000,
        }
      })
    })

    if (!ollamaResponse.ok) {
      const errorText = await ollamaResponse.text()
      console.error('Ollama API error:', errorText)
      return NextResponse.json(
        { error: 'Failed to generate quiz from Ollama' },
        { status: 500 }
      )
    }

    const ollamaData = await ollamaResponse.json()
    let responseText = ollamaData.response

    // Clean up the response - remove markdown code blocks if present
    responseText = responseText
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim()

    // Parse the JSON response
    let quizData: QuizResponse
    try {
      quizData = JSON.parse(responseText)
    } catch (parseError) {
      console.error('Failed to parse Ollama response:', responseText)
      
      // Fallback: try to extract JSON from the response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        try {
          quizData = JSON.parse(jsonMatch[0])
        } catch (e) {
          return NextResponse.json(
            { error: 'Failed to parse quiz data from Ollama response' },
            { status: 500 }
          )
        }
      } else {
        return NextResponse.json(
          { error: 'Invalid response format from Ollama' },
          { status: 500 }
        )
      }
    }

    // Validate the response structure
    if (!quizData.questions || !Array.isArray(quizData.questions)) {
      return NextResponse.json(
        { error: 'Invalid quiz structure from Ollama' },
        { status: 500 }
      )
    }

    // Ensure each question has required fields
    const validatedQuestions = quizData.questions.map((q: any, index: number) => ({
      id: q.id || index + 1,
      question: q.question || `Question about ${topic}`,
      options: Array.isArray(q.options) && q.options.length === 4 
        ? q.options 
        : ['Option A', 'Option B', 'Option C', 'Option D'],
      correctAnswer: typeof q.correctAnswer === 'number' && q.correctAnswer >= 0 && q.correctAnswer < 4
        ? q.correctAnswer
        : 0,
      explanation: q.explanation || ''
    }))

    return NextResponse.json({
      questions: validatedQuestions
    })

  } catch (error) {
    console.error('Error generating quiz:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
