import type { ExamType } from "./types";

export const EXAM_OPTIONS: {
  id: ExamType;
  label: string;
  description: string;
  icon: string;
}[] = [
  {
    id: "cbse-12",
    label: "CBSE 12th",
    description: "Class 12 Board Exams",
    icon: "GraduationCap",
  },
  {
    id: "icse-12",
    label: "ICSE 12th",
    description: "ISC Board Exams",
    icon: "BookOpen",
  },
  {
    id: "jee",
    label: "JEE",
    description: "JEE Main & Advanced",
    icon: "Atom",
  },
  {
    id: "neet",
    label: "NEET",
    description: "Medical Entrance",
    icon: "Heart",
  },
  {
    id: "college-semester",
    label: "College Semester",
    description: "University Exams",
    icon: "Building",
  },
];

export const SUBJECTS_BY_EXAM: Record<ExamType, string[]> = {
  "cbse-12": [
    "Physics",
    "Chemistry",
    "Mathematics",
    "English",
    "Computer Science",
    "Biology",
    "Accountancy",
    "Economics",
    "Business Studies",
  ],
  "icse-12": [
    "Physics",
    "Chemistry",
    "Mathematics",
    "English",
    "Computer Science",
    "Biology",
    "Commerce",
    "Economics",
  ],
  jee: [
    "Physics",
    "Chemistry",
    "Mathematics",
  ],
  neet: [
    "Physics",
    "Chemistry",
    "Biology - Botany",
    "Biology - Zoology",
  ],
  "college-semester": [
    "Subject 1",
    "Subject 2",
    "Subject 3",
    "Subject 4",
    "Subject 5",
  ],
};

export const ABSENCE_REASONS = [
  "Illness / Medical",
  "Family Emergency",
  "Mental Health",
  "Lost Motivation",
  "Changed Schools / Coaching",
  "Other",
];

export const STRESS_EMOJIS: Record<number, string> = {
  1: "😌",
  2: "🙂",
  3: "😐",
  4: "😟",
  5: "😰",
  6: "😥",
  7: "😫",
  8: "🤯",
  9: "😭",
  10: "🆘",
};
