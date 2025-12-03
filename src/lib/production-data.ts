export interface Task {
  name: string;
  duration: number;
}

export interface PhaseData {
  tasks: Task[];
  mockupLevel: string;
  timeline: string;
  caution: string;
}

export type TaskStatus = "Pending" | "In Progress" | "Completed";

export const productionPhases: Record<string, PhaseData> = {
  Development: {
    tasks: [
      { name: "Design Review", duration: 3 },
      { name: "Mockup Creation", duration: 5 },
      { name: "Color Grading", duration: 2 },
      { name: "Fabric Selection", duration: 2 },
    ],
    mockupLevel: "Level 2 (Digital + Physical)",
    timeline: "2-4 weeks",
    caution: "⚠️ Verify shrinkage specs before production",
  },
  Sampling: {
    tasks: [
      { name: "Factory Quality Check", duration: 3 },
      { name: "Shrinkage Testing", duration: 2 },
      { name: "Sizing Verification", duration: 3 },
      { name: "Cost Analysis", duration: 1 },
    ],
    mockupLevel: "Level 1 (Production Sample)",
    timeline: "1-2 weeks",
    caution: "⚠️ Allow +3-5% shrinkage for cotton blends",
  },
  Production: {
    tasks: [
      { name: "Batch Processing", duration: 14 },
      { name: "Quality Audits", duration: 7 },
      { name: "Inventory Management", duration: 3 },
      { name: "Defect Remediation", duration: 5 },
    ],
    mockupLevel: "Level 0 (Mass Production)",
    timeline: "3-8 weeks",
    caution: "⚠️ Monitor production yields; target 98% pass rate",
  },
  "Quality Control": {
    tasks: [
      { name: "Final Inspection", duration: 5 },
      { name: "Packaging Verification", duration: 2 },
      { name: "Documentation", duration: 1 },
      { name: "Compliance Check", duration: 2 },
    ],
    mockupLevel: "Level 0 (Final)",
    timeline: "1 week",
    caution: "⚠️ Zero tolerance for critical defects",
  },
  Distribution: {
    tasks: [
      { name: "Logistics Planning", duration: 2 },
      { name: "Shipping Coordination", duration: 3 },
      { name: "Delivery Tracking", duration: 5 },
      { name: "Customer Feedback", duration: 2 },
    ],
    mockupLevel: "N/A",
    timeline: "2-3 weeks",
    caution: "⚠️ Confirm delivery schedules with carriers",
  },
};

export const motivationalQuotes = [
  "Quality is the heartbeat of production. Keep it steady. 💪",
  "Every detail matters—your precision defines your brand. ✨",
  "Speed without quality is just expensive waste. Stay focused! 🎯",
  "Production excellence isn't luck; it's discipline. Keep going! 🚀",
  "Your confidence inspires your team's confidence. Lead by example. 🌟",
];

export const phaseIcons: Record<string, string> = {
  Development: "🎨",
  Sampling: "🧪",
  Production: "🏭",
  "Quality Control": "✅",
  Distribution: "📦",
};
