import type { InterviewType } from "~/db/schema/interviews";

export interface InterviewTypeDefinition {
  type: InterviewType;
  description: string;
  exampleQuestions: string[];
}

export const interviewTypes: InterviewTypeDefinition[] = [
  {
    type: "behavioral",
    description:
      "A structured interview approach that evaluates past performance as a predictor of future success. Questions focus on specific situations from the candidate's experience, seeking detailed examples of how they handled challenges, demonstrated key competencies, and achieved measurable results. The STAR method (Situation, Task, Action, Result) is used to assess the depth and authenticity of responses.",
    exampleQuestions: [
      "Describe a complex project where you had to influence stakeholders with competing priorities. What was your approach, and what was the outcome?",
      "Tell me about a time when you had to make a difficult decision with incomplete information. How did you approach the analysis, and what did you learn from the results?",
      "Share an example of when you had to lead a team through a significant change. How did you maintain team morale and productivity?",
      "Describe a situation where you identified and resolved a systemic problem in your organization. What was your process and the long-term impact?",
      "Tell me about a time when you had to rebuild trust with a client or team member. What specific steps did you take, and how did you measure success?",
    ],
  },
  {
    type: "situational",
    description:
      "A forward-looking assessment method that presents candidates with realistic, role-specific scenarios to evaluate their decision-making process, problem-solving abilities, and alignment with organizational values. Questions are designed to reveal the candidate's analytical thinking, prioritization skills, and ability to balance multiple stakeholder needs while maintaining professional standards.",
    exampleQuestions: [
      "You discover that a senior team member has been bypassing security protocols to meet deadlines. How would you address this situation while maintaining team dynamics and ensuring compliance?",
      "Your team is simultaneously facing a critical production issue and an important client deadline. Walk me through how you would assess priorities and allocate resources.",
      "A major project requirement changes two weeks before launch, requiring significant rework. How would you adapt your strategy while managing team morale and stakeholder expectations?",
      "You identify a potential innovation that could improve efficiency by 30% but requires substantial process changes. How would you build support and manage the transition?",
      "A team member is consistently delivering high-quality work but is creating conflicts within the team. How would you balance performance and team harmony?",
    ],
  },
  {
    type: "technical",
    description:
      "A comprehensive evaluation of technical expertise, problem-solving methodology, and practical implementation skills. Goes beyond basic knowledge testing to assess system design capabilities, optimization strategies, best practices awareness, and the ability to make technical decisions considering business impact. Includes real-world scenarios, architecture discussions, and code quality evaluation.",
    exampleQuestions: [
      "Design a scalable system that processes real-time data from multiple sources. Consider fault tolerance, data consistency, and performance optimization. What trade-offs would you make?",
      "Explain how you would refactor a legacy system with high technical debt while ensuring business continuity. What would be your step-by-step approach?",
      "Describe your approach to implementing a secure authentication system. How would you handle session management, password policies, and potential security vulnerabilities?",
      "Walk me through how you would optimize a slow-performing application. What metrics would you collect, and how would you prioritize improvements?",
      "How would you design a CI/CD pipeline for a microservices architecture? Consider testing strategies, deployment patterns, and monitoring requirements.",
    ],
  },
  {
    type: "case_study",
    description:
      "An in-depth analytical exercise that evaluates a candidate's ability to solve complex business problems through structured thinking, data analysis, and strategic recommendation development. Assesses the ability to identify key issues, analyze quantitative and qualitative data, develop actionable solutions, and communicate recommendations effectively to various stakeholders.",
    exampleQuestions: [
      "Our client is a retail bank facing declining customer satisfaction and increasing digital competitor pressure. Analyze the situation and propose a comprehensive strategy to reverse these trends.",
      "A global manufacturing company is experiencing supply chain disruptions and rising costs. How would you analyze the root causes and develop both short-term and long-term solutions?",
      "We're considering entering the Southeast Asian market with our SaaS product. What factors would you analyze to evaluate this opportunity, and how would you structure the market entry strategy?",
      "A healthcare provider is struggling with long patient wait times despite high resource utilization. How would you approach improving operational efficiency while maintaining quality of care?",
      "Develop a pricing strategy for a new IoT product targeting both enterprise and consumer segments. Consider market positioning, competitive dynamics, and long-term profitability.",
    ],
  },
  {
    type: "competency_based",
    description:
      "A systematic evaluation of specific skills, behaviors, and competencies critical for role success. Uses detailed exploration of past experiences to assess proficiency in key areas such as leadership, strategic thinking, stakeholder management, innovation, and adaptability. Questions are designed to evaluate both technical competencies and soft skills, with a focus on measuring proficiency levels and development potential.",
    exampleQuestions: [
      "Describe a strategic initiative you led that required significant organizational change. How did you develop the vision, align stakeholders, and measure success?",
      "Tell me about a time when you had to influence decision-makers without direct authority. What strategies did you use, and how did you measure their effectiveness?",
      "Share an example of how you've built and developed high-performing teams. What specific approaches did you use to identify, nurture, and retain talent?",
      "Describe a situation where you had to drive innovation in a conservative environment. How did you build support and manage resistance to change?",
      "Tell me about a time when you had to adapt your leadership style to achieve results with a diverse or challenging team. What specific adjustments did you make and why?",
    ],
  },
  {
    type: "stress",
    description:
      "A controlled high-pressure evaluation designed to assess candidates' resilience, emotional intelligence, and performance under stress. Tests ability to maintain composure, think clearly, and communicate effectively in challenging situations. Evaluates stress management strategies, adaptability, and professional boundaries while maintaining ethical standards.",
    exampleQuestions: [
      "Your presentation to the board contains an error that significantly impacts the conclusions. You discover this mid-presentation. How do you handle this situation professionally?",
      "Multiple critical stakeholders are demanding immediate attention for conflicting priorities. Walk me through how you would maintain professionalism while managing these competing demands.",
      "You strongly disagree with a new strategy being implemented by senior leadership. How would you constructively voice your concerns while maintaining organizational alignment?",
      "A key team member resigns during a critical project phase. How do you maintain project momentum while managing team morale and client expectations?",
      "You discover a mistake in your team's work that has been affecting client reports for months. How do you address this internally and with clients while maintaining trust?",
    ],
  },
  {
    type: "cultural_fit",
    description:
      "A nuanced evaluation of alignment between candidate values, work preferences, and organizational culture. Assesses cultural add versus cultural fit, exploring how candidates can both thrive within and enhance company culture. Examines collaboration styles, communication preferences, ethical decision-making, and commitment to diversity and inclusion.",
    exampleQuestions: [
      "Describe a workplace culture where you've been most successful. What specific elements enabled your success, and how do you recreate these conditions in new environments?",
      "Share an experience where you've contributed to building an inclusive team culture. What specific actions did you take, and how did you measure success?",
      "Tell me about a time when your personal values aligned with organizational values to drive positive change. What was the impact on team dynamics and results?",
      "How have you adapted your working style to successfully collaborate with colleagues from different cultural backgrounds or work preferences?",
      "Describe a situation where you had to balance maintaining company culture with driving necessary cultural change. How did you approach this challenge?",
    ],
  },
];
