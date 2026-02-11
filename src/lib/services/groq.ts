import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export interface TriageRequest {
  exam: string;
  subjects: string[];
  daysAbsent: number;
  absenceReason: string;
  stressLevel: number;
  worryText: string;
}

export interface PlanGenerationRequest {
  exam: string;
  subjects: string[];
  daysAbsent: number;
  absenceReason: string;
  stressLevel: number;
  triageResult: {
    subjects: Array<{
      name: string;
      status: "critical" | "warning" | "on-track";
      priority: number;
    }>;
  };
  mode: "survival" | "thriving";
}

const TRIAGE_SYSTEM_PROMPT = `You are CatchUp AI, an empathetic academic recovery assistant for Indian students preparing for competitive exams (NEET, JEE, CBSE/ICSE boards, college semesters).

Your role is to:
1. Acknowledge the student's stress and situation with genuine empathy
2. Analyze which subjects need the most urgent attention
3. Provide a clear, actionable triage of their academic situation
4. Give them hope and a concrete first step

Respond in a warm, supportive tone. Use simple language. Reference Indian exam patterns and syllabi when relevant.

Output your response in the following JSON format:
{
  "narrative": "A 2-3 paragraph empathetic message addressing the student directly...",
  "subjects": [
    {
      "name": "Physics",
      "status": "critical|warning|on-track",
      "priority": 1,
      "hoursNeeded": 45,
      "topicsToFocus": ["Mechanics", "Thermodynamics"],
      "reason": "Why this subject needs attention"
    }
  ],
  "quickWin": {
    "title": "A quick, achievable task",
    "description": "What to do and why it helps",
    "timeMinutes": 15,
    "subject": "Physics"
  }
}`;

const PLAN_SYSTEM_PROMPT = `You are CatchUp AI's study plan generator. Create a detailed 14-day recovery plan for an Indian student.

For "survival" mode: Focus on passing - cover minimum viable topics, prioritize high-weightage areas.
For "thriving" mode: Aim for excellence - comprehensive coverage with deeper understanding.

Each day should have 4-6 tasks with realistic time estimates. Tasks should be specific (not generic like "study physics").

Output as JSON:
{
  "days": [
    {
      "day": 1,
      "theme": "Foundation Reset",
      "tasks": [
        {
          "id": "d1t1",
          "subject": "Physics",
          "title": "Review Newton's Laws - Force diagrams",
          "duration": "45 min",
          "type": "revision|practice|test",
          "completed": false
        }
      ],
      "keyInsight": "Why this day matters",
      "tradeoff": "What we're skipping and why it's okay"
    }
  ]
}`;

export async function generateTriage(request: TriageRequest) {
  const userPrompt = `Student Profile:
- Exam: ${request.exam}
- Subjects: ${request.subjects.join(", ")}
- Days absent: ${request.daysAbsent}
- Reason: ${request.absenceReason}
- Stress level: ${request.stressLevel}/10
- Their worry: "${request.worryText}"

Please analyze their situation and provide a triage assessment.`;

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: TRIAGE_SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.7,
    max_tokens: 2000,
    response_format: { type: "json_object" },
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) throw new Error("No response from Groq");

  return JSON.parse(content);
}

export async function generateTriageStream(request: TriageRequest) {
  const userPrompt = `Student Profile:
- Exam: ${request.exam}
- Subjects: ${request.subjects.join(", ")}
- Days absent: ${request.daysAbsent}
- Reason: ${request.absenceReason}
- Stress level: ${request.stressLevel}/10
- Their worry: "${request.worryText}"

Please provide an empathetic, encouraging triage message directly to the student. Speak to them in second person. Do NOT use JSON format - just write the narrative message naturally.`;

  const stream = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: TRIAGE_SYSTEM_PROMPT.split("Output your response")[0] },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.7,
    max_tokens: 1500,
    stream: true,
  });

  return stream;
}

export async function generatePlan(request: PlanGenerationRequest) {
  const userPrompt = `Create a ${request.mode} mode 14-day recovery plan.

Student Profile:
- Exam: ${request.exam}
- Subjects: ${request.subjects.join(", ")}
- Days absent: ${request.daysAbsent}
- Reason: ${request.absenceReason}

Subject Triage:
${request.triageResult.subjects
  .map((s) => `- ${s.name}: ${s.status} (priority ${s.priority})`)
  .join("\n")}

Mode: ${request.mode}
${request.mode === "survival" ? "Focus on passing - minimum viable coverage of high-weightage topics only." : "Aim for excellence - comprehensive coverage with deeper understanding."}`;

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: PLAN_SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.6,
    max_tokens: 4000,
    response_format: { type: "json_object" },
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) throw new Error("No response from Groq");

  return JSON.parse(content);
}
