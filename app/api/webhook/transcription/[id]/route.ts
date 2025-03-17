import { NextResponse } from 'next/server';
import { AssemblyAI } from 'assemblyai';

// Initialize AssemblyAI client
const assemblyClient = new AssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY || ""
});

/**
 * In-memory cache to store webhook results
 * In production, this would be a database or Redis cache
 */
const webhookResults = new Map<string, any>();

/**
 * Webhook endpoint to receive transcription completion notifications from AssemblyAI
 */
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const transcriptionId = params.id;
  console.log(`Received webhook for transcription ID: ${transcriptionId}`);
  
  try {
    // Verify webhook auth if configured (security check)
    const webhookSecret = process.env.WEBHOOK_SECRET || 'your-webhook-secret';
    const authHeader = request.headers.get('x-webhook-secret');
    
    if (process.env.NODE_ENV === 'production' && authHeader !== webhookSecret) {
      console.error('Invalid webhook authentication');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Parse the webhook payload
    const webhookData = await request.json();
    console.log(`Webhook data received for transcript: ${webhookData.transcript_id}`);
    
    // Validate webhook data
    if (!webhookData.transcript_id) {
      return NextResponse.json({ error: 'Invalid webhook data' }, { status: 400 });
    }
    
    // Get the full transcript data
    const transcriptData = await assemblyClient.transcripts.get(webhookData.transcript_id);
    console.log(`Retrieved transcript data for ID: ${webhookData.transcript_id}, status: ${transcriptData.status}`);
    
    // Store the result in our cache
    webhookResults.set(transcriptionId, transcriptData);
    
    // If webhook data indicates the transcript is ready, process it
    if (webhookData.status === 'completed' && transcriptData.text) {
      // Get summary if needed
      try {
        console.log('Requesting summary for completed transcription');
        const summaryConfig = {
          audio_url: transcriptData.audio_url,
          summarization: true,
          summary_type: "bullets" as const,
          summary_model: "informative" as const,
          speech_model: "nano" as const,
          language_code: "en"
        };
        
        const summaryTranscript = await assemblyClient.transcripts.transcribe(summaryConfig);
        console.log('Summary completed successfully via webhook!');
        
        // Store the complete result with summary
        webhookResults.set(transcriptionId, {
          ...transcriptData,
          summary: summaryTranscript.summary
        });
      } catch (summaryError) {
        console.error('Error creating summary via webhook:', summaryError);
      }
    }
    
    return NextResponse.json({ success: true, status: webhookData.status });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}

/**
 * Helper function to check if we have a cached result for a specific ID
 * This would be called from the main transcription API
 * 
 * @param id Transcription ID to check
 * @returns Cached transcription or null
 */
export function getWebhookResult(id: string): any | null {
  return webhookResults.get(id) || null;
}

/**
 * GET endpoint to retrieve results by ID
 * This is useful for polling from the client
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const transcriptionId = params.id;
  const result = webhookResults.get(transcriptionId);
  
  if (!result) {
    return NextResponse.json({ error: 'Result not found' }, { status: 404 });
  }
  
  return NextResponse.json({ success: true, result });
} 