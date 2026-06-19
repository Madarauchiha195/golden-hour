import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import parseLLMJson from '@/lib/jsonParser'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || ''

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          response: { status: 'error', result: {}, message: 'GEMINI_API_KEY not configured' },
          error: 'GEMINI_API_KEY not configured on server',
        },
        { status: 500 }
      )
    }

    // Since we made Gemini synchronous, any lingering polls for an unknown task ID return 404
    if (body.task_id) {
      return NextResponse.json(
        { success: false, status: 'failed', error: 'Task expired or not found' },
        { status: 404 }
      )
    }

    return submitTask(body)
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Server error'
    return NextResponse.json(
      {
        success: false,
        response: { status: 'error', result: {}, message: errorMsg },
        error: errorMsg,
      },
      { status: 500 }
    )
  }
}

async function submitTask(body: any) {
  const { message, agent_id, user_id, session_id } = body

  if (!message) {
    return NextResponse.json(
      {
        success: false,
        response: { status: 'error', result: {}, message: 'message is required' },
        error: 'message is required',
      },
      { status: 400 }
    )
  }

  const finalUserId = user_id || `user-${generateUUID()}`
  const finalSessionId = session_id || `${agent_id || 'agent'}-${generateUUID().substring(0, 12)}`
  const task_id = generateUUID()

  try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
    
    const prompt = `You are an expert medical emergency coordination AI agent.
You must process the following incident report and return a JSON object containing triage results, risk assessment, and recommended actions.
Your output MUST be ONLY valid JSON, without any markdown formatting blocks.

Message:
${message}

Desired JSON Structure (Return only this structure, populated based on the message):
{
  "summary": "Brief summary of the incident",
  "risk_score": 8,
  "recommended_action": "Immediate dispatch of Advanced Life Support",
  "hospital": "City General Hospital",
  "priority": "HIGH",
  "status": "success"
}`

    const result = await model.generateContent(prompt)
    const text = result.response.text()
    
    // Attempt to parse the text as JSON, fallback to raw text if it fails
    let parsed
    try {
      parsed = parseLLMJson(text)
    } catch {
      parsed = { text: text.replace(/```json/g, '').replace(/```/g, '').trim() }
    }

    const normalizedResponse = {
      status: 'success',
      result: parsed || {},
      message: 'Successfully generated via Gemini'
    }

    // Return the completed task immediately to skip polling
    return NextResponse.json({
      success: true,
      status: 'completed',
      task_id,
      agent_id,
      user_id: finalUserId,
      session_id: finalSessionId,
      response: normalizedResponse,
      timestamp: new Date().toISOString(),
      raw_response: text
    })

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Gemini API Error'
    return NextResponse.json(
      {
        success: false,
        status: 'failed',
        response: { status: 'error', result: {}, message: errorMsg },
        error: errorMsg,
      },
      { status: 500 }
    )
  }
}
