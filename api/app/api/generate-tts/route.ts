import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import axios from "axios";

/**
 * @swagger
 * /api/generate-tts:
 *   post:
 *     summary: Convert text to speech
 *     description: |
 *       Converts the provided text to speech using ElevenLabs API.
 *       Requires user authentication.
 *     tags:
 *       - Text-to-Speech
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TTSRequest'
 *           examples:
 *             basicExample:
 *               summary: Basic text-to-speech request
 *               value:
 *                 text: "Hello, this is a test message for text-to-speech conversion."
 *             multilingualExample:
 *               summary: Text-to-speech with specific language
 *               value:
 *                 text: "Bonjour, comment allez-vous?"
 *                 language_id: "fr"
 *     responses:
 *       '200':
 *         description: Successfully generated audio
 *         content:
 *           audio/mpeg:
 *             schema:
 *               type: string
 *               format: binary
 *             examples:
 *               audioResponse:
 *                 summary: MP3 audio file
 *                 description: Binary audio data in MP3 format
 *       '401':
 *         description: Unauthorized - User not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               unauthorizedExample:
 *                 value:
 *                   error: "Unauthorized"
 *       '500':
 *         description: Internal server error - TTS generation failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               serverErrorExample:
 *                 value:
 *                   error: "Failed to generate TTS"
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     TTSRequest:
 *       type: object
 *       required:
 *         - text
 *       properties:
 *         text:
 *           type: string
 *           description: The text to convert to speech
 *           minLength: 1
 *           maxLength: 5000
 *           example: "Hello, this is a test message."
 *         language_id:
 *           type: string
 *           description: Optional language identifier for multilingual support
 *           example: "en"
 *           enum:
 *             - "en"
 *             - "es"
 *             - "fr"
 *             - "de"
 *             - "it"
 *             - "pt"
 *             - "pl"
 *             - "tr"
 *             - "ru"
 *             - "nl"
 *             - "cs"
 *             - "ar"
 *             - "zh"
 *             - "ja"
 *             - "hi"
 *             - "ko"
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           description: Error message describing what went wrong
 *           example: "Unauthorized"
 *
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *       description: Authentication token required for API access
 *
 *   examples:
 *     TTSUsageExample:
 *       summary: How to use the Text-to-Speech API
 *       description: |
 *         **Step 1: Authenticate**
 *         Ensure you have a valid authentication token.
 *
 *         **Step 2: Make TTS Request**
 *         ```javascript
 *         const response = await fetch('/api/text-to-speech', {
 *           method: 'POST',
 *           headers: {
 *             'Content-Type': 'application/json',
 *             'Authorization': 'Bearer YOUR_TOKEN_HERE'
 *           },
 *           body: JSON.stringify({
 *             text: 'Hello, this is a test message.',
 *             language_id: 'en' // optional
 *           })
 *         });
 *
 *         if (response.ok) {
 *           const audioBlob = await response.blob();
 *           const audioUrl = URL.createObjectURL(audioBlob);
 *
 *           // Play the audio
 *           const audio = new Audio(audioUrl);
 *           audio.play();
 *         } else {
 *           const error = await response.json();
 *           console.error('TTS Error:', error);
 *         }
 *         ```
 *
 *         **Step 3: Handle Audio Response**
 *         The API returns binary MP3 data that can be:
 *         - Played directly in the browser
 *         - Saved as a file
 *         - Streamed to audio elements
 *
 *     ClientSideExample:
 *       summary: Complete client-side implementation
 *       description: |
 *         ```typescript
 *         interface TTSResponse {
 *           error?: string;
 *         }
 *
 *         async function generateSpeech(text: string, languageId?: string): Promise<Blob | null> {
 *           try {
 *             const response = await fetch('/api/text-to-speech', {
 *               method: 'POST',
 *               headers: {
 *                 'Content-Type': 'application/json',
 *               },
 *               body: JSON.stringify({
 *                 text,
 *                 ...(languageId && { language_id: languageId })
 *               })
 *             });
 *
 *             if (!response.ok) {
 *               const errorData: TTSResponse = await response.json();
 *               throw new Error(errorData.error || 'Failed to generate speech');
 *             }
 *
 *             return await response.blob();
 *           } catch (error) {
 *             console.error('TTS Generation failed:', error);
 *             return null;
 *           }
 *         }
 *
 *         // Usage
 *         const audioBlob = await generateSpeech('Hello world!', 'en');
 *         if (audioBlob) {
 *           const audioUrl = URL.createObjectURL(audioBlob);
 *           const audio = new Audio(audioUrl);
 *           await audio.play();
 *         }
 *         ```
 *
 *     ReactHookExample:
 *       summary: React hook for TTS functionality
 *       description: |
 *         ```typescript
 *         import { useState, useCallback } from 'react';
 *
 *         interface UseTTSReturn {
 *           generateSpeech: (text: string, languageId?: string) => Promise<void>;
 *           isLoading: boolean;
 *           error: string | null;
 *           audioUrl: string | null;
 *         }
 *
 *         export function useTTS(): UseTTSReturn {
 *           const [isLoading, setIsLoading] = useState(false);
 *           const [error, setError] = useState<string | null>(null);
 *           const [audioUrl, setAudioUrl] = useState<string | null>(null);
 *
 *           const generateSpeech = useCallback(async (text: string, languageId?: string) => {
 *             setIsLoading(true);
 *             setError(null);
 *
 *             try {
 *               const response = await fetch('/api/text-to-speech', {
 *                 method: 'POST',
 *                 headers: { 'Content-Type': 'application/json' },
 *                 body: JSON.stringify({ text, language_id: languageId })
 *               });
 *
 *               if (!response.ok) {
 *                 const errorData = await response.json();
 *                 throw new Error(errorData.error);
 *               }
 *
 *               const audioBlob = await response.blob();
 *               const url = URL.createObjectURL(audioBlob);
 *               setAudioUrl(url);
 *             } catch (err) {
 *               setError(err instanceof Error ? err.message : 'Unknown error');
 *             } finally {
 *               setIsLoading(false);
 *             }
 *           }, []);
 *
 *           return { generateSpeech, isLoading, error, audioUrl };
 *         }
 *         ```
 *
 * tags:
 *   - name: Text-to-Speech
 *     description: Operations related to text-to-speech conversion
 */

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { text, language_id } = await req.json();

  const apiKey = process.env.ELEVENLABS_API_KEY;
  const voiceId = process.env.ELEVENLABS_VOICE_ID;

  try {
    const elevenLabsResponse = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        text,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
        ...(language_id && { language_id }),
      },
      {
        headers: {
          "xi-api-key": apiKey!,
          "Content-Type": "application/json",
        },
        responseType: "arraybuffer", // 👈 important for audio data
      }
    );

    return new Response(elevenLabsResponse.data, {
      headers: {
        "Content-Type": "audio/mpeg",
      },
    });
  } catch (error) {
    console.error("TTS error:", error);
    return NextResponse.json(
      { error: "Failed to generate TTS" },
      { status: 500 }
    );
  }
}
