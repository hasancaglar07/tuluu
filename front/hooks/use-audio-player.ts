"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import axios from "axios";
import { Exercise } from "@/types";

/**
 * Custom hook for handling audio playback in lessons
 * Manages TTS generation and audio state
 */
export function useAudioPlayer() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const { getToken } = useAuth();

  /**
   * Play audio for the given exercise text
   */
  const playAudio = async (exercise: Exercise) => {
    if (!exercise?.sourceText) return;

    const token = await getToken();

    // Voice ID mapping for different languages
    const voiceIdEn = process.env.ELEVENLABS_VOICE_ID_EN;
    const voiceIdFr = process.env.ELEVENLABS_VOICE_ID_FR;
    const voiceIdHi = process.env.ELEVENLABS_VOICE_ID_HI;

    const VOICE_MAP = {
      en: voiceIdEn,
      fr: voiceIdFr,
      hi: voiceIdHi,
    };

    type SupportedLang = keyof typeof VOICE_MAP;
    const lang = exercise.sourceLanguage as string;

    // Check if language is supported
    if (!Object.keys(VOICE_MAP).includes(lang)) {
      console.error("Unsupported language:", lang);
      return;
    }

    try {
      // Generate TTS audio
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/generate-tts`,
        {
          text: exercise.sourceText,
          language_id: exercise.sourceLanguage,
          voice_id: VOICE_MAP[lang as SupportedLang],
        },
        {
          responseType: "blob",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Create and play audio
      const audioUrl = URL.createObjectURL(response.data);
      const audio = new Audio(audioUrl);

      setIsSpeaking(true);
      audio.play();
      audio.onended = () => {
        setIsSpeaking(false);
      };
    } catch (err) {
      console.error("Failed to play audio", err);
      setIsSpeaking(false);
    }
  };

  return {
    isSpeaking,
    playAudio,
  };
}
