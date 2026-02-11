const CARTESIA_API_URL = "https://api.cartesia.ai/tts/bytes";
const CARTESIA_API_KEY = process.env.CARTESIA_API_KEY!;

// Warm, empathetic female voice suited for emotional student support
const VOICE_ID = process.env.CARTESIA_VOICE_ID || "a0e99841-438c-4a64-b679-ae501e7d6091";

export interface TTSRequest {
  text: string;
  voiceId?: string;
  speed?: "slow" | "normal" | "fast";
  emotion?: "empathetic" | "encouraging" | "calm";
}

const SPEED_MAP = {
  slow: -0.2,
  normal: 0,
  fast: 0.15,
};

const EMOTION_PRESETS = {
  empathetic: {
    speed: -0.1,
    emotion: ["positivity:low", "curiosity:medium"],
  },
  encouraging: {
    speed: 0,
    emotion: ["positivity:high", "surprise:low"],
  },
  calm: {
    speed: -0.15,
    emotion: ["positivity:medium", "anger:lowest"],
  },
};

export async function generateSpeech(request: TTSRequest): Promise<ArrayBuffer> {
  const emotionPreset = request.emotion
    ? EMOTION_PRESETS[request.emotion]
    : EMOTION_PRESETS.empathetic;

  const speedAdjustment = request.speed
    ? SPEED_MAP[request.speed]
    : emotionPreset.speed;

  const response = await fetch(CARTESIA_API_URL, {
    method: "POST",
    headers: {
      "Cartesia-Version": "2024-06-10",
      "Content-Type": "application/json",
      "X-API-Key": CARTESIA_API_KEY,
    },
    body: JSON.stringify({
      model_id: "sonic-2",
      transcript: request.text,
      voice: {
        mode: "id",
        id: request.voiceId || VOICE_ID,
        __experimental_controls: {
          speed: speedAdjustment > 0 ? "fast" : speedAdjustment < -0.1 ? "slow" : "normal",
          emotion: emotionPreset.emotion,
        },
      },
      output_format: {
        container: "wav",
        encoding: "pcm_f32le",
        sample_rate: 44100,
      },
      language: "en",
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Cartesia TTS failed: ${response.status} - ${error}`);
  }

  return response.arrayBuffer();
}

export async function generateSpeechStream(request: TTSRequest): Promise<ReadableStream<Uint8Array>> {
  const emotionPreset = request.emotion
    ? EMOTION_PRESETS[request.emotion]
    : EMOTION_PRESETS.empathetic;

  const response = await fetch("https://api.cartesia.ai/tts/sse", {
    method: "POST",
    headers: {
      "Cartesia-Version": "2024-06-10",
      "Content-Type": "application/json",
      "X-API-Key": CARTESIA_API_KEY,
    },
    body: JSON.stringify({
      model_id: "sonic-2",
      transcript: request.text,
      voice: {
        mode: "id",
        id: request.voiceId || VOICE_ID,
        __experimental_controls: {
          speed: "normal",
          emotion: emotionPreset.emotion,
        },
      },
      output_format: {
        container: "raw",
        encoding: "pcm_f32le",
        sample_rate: 44100,
      },
      language: "en",
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Cartesia TTS stream failed: ${response.status} - ${error}`);
  }

  return response.body as ReadableStream<Uint8Array>;
}
