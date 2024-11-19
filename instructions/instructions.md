# Interview Optimiser - Product Requirements Document (PRD)

## 1. Product Overview

Interview Optimiser is an AI-powered interview practice platform that provides real-time, voice-to-voice interview simulations with advanced feedback and analysis capabilities. The platform stands out by offering authentic interview experiences with adaptive AI responses and comprehensive performance evaluation.

Evidence from codebase:

```4:21:src/components/landing/differentiators-section.tsx
export function DifferentiatorsSection() {
  const differentiators = [
    {
      icon: Mic,
      title: "Real Voice-to-Voice Interaction",
      description: `Unlike other platforms, ${config.projectName} offers an authentic, real-time, voice-to-voice interview experience where you actually speak and receive spoken responses. Our platform adapts in real time, creating a true-to-life simulation of an in-person interview.`,
    },
    {
      icon: Brain,
      title: "Emotional and Prosody Analysis",
      description: `We go beyond just assessing your answers—${config.projectName} analyses how you deliver them. Using AI-powered prosody analysis, we evaluate key aspects like confidence, clarity, and concentration, providing a complete picture of your communication skills.`,
    },
    {
      icon: Target,
      title: "Adaptive and Personalised Feedback",
      description: `Our interviews adjust dynamically based on your responses, providing tailored questions specific to your role and industry. Post-interview, receive in-depth feedback on both your answers and delivery, helping you improve in real, practical ways.`,
    },
  ];
```

## 2. Core Value Proposition

The platform differentiates itself through:

- Real voice-to-voice interaction with AI
- Emotional and prosody analysis of responses
- Adaptive questioning based on user responses
- Comprehensive performance analytics
- Personalized feedback and improvement plans

## 3. User Journey

### 3.1 Interview Creation Process

1. CV Upload/Input
2. Job Description Input
3. Interview Configuration

Evidence:

```213:225:src/app/dashboard/create/page.tsx
  const title =
    step === 1
      ? "Let's start with your CV"
      : step === 2
      ? "Now, tell us about the job"
      : "Final details";

  const subtitle =
    step === 1
      ? "We'll use your CV to understand your experience and tailor the interview questions."
      : step === 2
      ? "Share the job description to help us create relevant interview questions."
      : "Help us customize your interview experience.";
```

### 3.2 Interview Types

- Behavioral Interview
- Technical Interview
- Situational Interview
- Case Study Interview
- Competency-Based Interview
- Stress Interview
- Cultural Fit Interview

Evidence:

```3:67:src/utils/conversation_config.ts
export const interviewTypes = [
  {
    type: "Behavioral Interview",
    description:
      "Focuses on past experiences and behaviors as indicators of future performance, often using questions like 'Tell me about a time when…'",
    exampleQuestions: [
      "Tell me about a time you resolved a conflict.",
      "Describe a situation where you showed leadership.",
    ],
  },
  {
    type: "Situational Interview",
    description:
      "Uses hypothetical scenarios to assess decision-making and problem-solving skills.",
    exampleQuestions: [
      "What would you do if you had a tight deadline and limited resources?",
      "How would you handle a difficult customer request?",
    ],
  },
  {
    type: "Technical Interview",
    description:
      "Tests role-specific technical skills and knowledge, common in fields like engineering, IT, and data science.",
    exampleQuestions: [
      "Explain how you would optimize a SQL query.",
      "Describe how you’d troubleshoot a network issue.",
    ],
  },
  {
    type: "Case Study Interview",
    description:
      "Presents a business problem for analysis, often used in consulting and finance.",
    exampleQuestions: [
      "How would you improve revenue for a company facing increased competition?",
      "Analyze this data set and provide actionable insights.",
    ],
  },
  {
    type: "Competency-Based Interview",
    description:
      "Evaluates core competencies, like leadership and adaptability, necessary for the role.",
    exampleQuestions: [
      "Describe a situation where you demonstrated teamwork.",
      "How do you adapt to new situations quickly?",
    ],
  },
  {
    type: "Stress Interview",
    description:
      "Puts candidates under pressure to see how they handle challenging or uncomfortable situations.",
    exampleQuestions: [
      "Why do you think you are suitable for this job?",
      "Are you prepared for the demands of this role?",
    ],
  },
  {
    type: "Cultural Fit Interview",
    description:
      "Assesses whether a candidate aligns with the company's values and work environment.",
    exampleQuestions: [
      "What do you value in a team?",
      "How do you approach work-life balance?",
    ],
  },
];
```

## 4. Key Features

### 4.1 Interview Experience

- Real-time voice interaction
- AI-powered adaptive responses
- Multiple interview styles
- Duration customization

Evidence:

```5:27:src/components/landing/how-it-works-section.tsx
export function HowItWorksSection() {
  const steps = [
    {
      title: "Upload Your Details",
      description:
        "Start by sharing your CV and target job description. This allows our AI to tailor the interview experience to your specific career goals and desired role.",
    },
    {
      title: "Choose Your Interview Style",
      description:
        "Select the interview type that suits you best—whether it's behavioral, technical, or situational—and set the duration to fit your preparation needs.",
    },
    {
      title: "Get a Realistic, Adaptive Interview",
      description:
        "Experience a true-to-life interview simulation where our AI interacts with you in real-time, adapting to your responses and providing live voice-to-voice feedback.",
    },
    {
      title: "Analyze and Refine Your Performance",
      description:
        "After the session, receive a comprehensive feedback report, featuring insights into your strengths, areas for improvement, and actionable tips to help you refine your responses.",
    },
  ];
```

### 4.2 Analysis & Feedback

- Technical knowledge assessment
- Problem-solving evaluation
- Communication skills analysis
- Teamwork assessment
- Adaptability measurement

Evidence:

```10:67:src/lib/ai/interview-analysis.ts
const ExtendedReportSchema = ReportSchema.extend({
  generalAssessment: z
    .string()
    .describe("Overall assessment of the interview performance"),
  overallScore: z
    .number()
    .describe("Overall score of the interview out of 100"),
  fitnessForRole: z
    .string()
    .describe("Assessment of the candidate's fitness for the role"),
  fitnessForRoleScore: z
    .number()
    .describe("Score for fitness for the role out of 100"),
  speakingSkills: z
    .string()
    .describe("Assessment of the candidate's speaking skills"),
  speakingSkillsScore: z
    .number()
    .describe("Score for speaking skills out of 100"),
  communicationSkills: z
    .string()
    .describe("Assessment of the candidate's communication skills"),
  communicationSkillsScore: z
    .number()
    .describe("Score for communication skills out of 100"),
  problemSolvingSkills: z
    .string()
    .describe("Assessment of the candidate's problem-solving skills"),
  problemSolvingSkillsScore: z
    .number()
    .describe("Score for problem-solving skills out of 100"),
  technicalKnowledge: z
    .string()
    .describe("Assessment of the candidate's technical knowledge"),
  technicalKnowledgeScore: z
    .number()
    .describe("Score for technical knowledge out of 100"),
  teamwork: z
    .string()
    .describe("Assessment of the candidate's teamwork abilities"),
  teamworkScore: z.number().describe("Score for teamwork abilities out of 100"),
  adaptability: z
    .string()
    .describe("Assessment of the candidate's adaptability"),
  adaptabilityScore: z.number().describe("Score for adaptability out of 100"),
  areasOfStrength: z
    .array(z.string())
    .describe("List of the candidate's areas of strength"),
  areasForImprovement: z
    .array(z.string())
    .describe("List of areas where the candidate can improve"),
  actionableNextSteps: z
    .array(z.string())
    .describe("List of actionable steps for the candidate to improve"),
  candidateName: z.string().describe("Name of the candidate"),
  companyName: z.string().describe("Name of the company being applied to"),
  roleName: z.string().describe("Name of the role being applied for"),
}).omit({ id: true, interviewId: true, createdAt: true, updatedAt: true })
```

### 4.3 Performance Reports

- Overall performance score
- Detailed feedback by category
- Strengths and improvement areas
- Voice characteristics analysis
- Actionable next steps

Evidence:

```240:446:src/app/report/page.tsx
          {/* Overall Performance */}
          <section className="mb-8">
            <h2
              className={cn(
                "text-2xl font-semibold mb-4 text-gray-800 border-b pb-2",
                report?.data.pageSettings.headingFont
              )}
            >
              Overall Performance
            </h2>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                  <BarChart2 className="w-10 h-10 text-blue-600" />
                </div>
                <div>
                  <p className="text-4xl font-bold text-gray-800">
                    {report?.data.overallScore}%
                  </p>
                  <p className="text-gray-500">Overall Score</p>
                </div>
              </div>
              <div>
                {report?.data.overallScore >= 80 ? (
                  <div className="flex items-center text-green-600">
                    <ThumbsUp className="w-8 h-8 mr-2" />
                    <span className="text-lg font-semibold">Excellent</span>
                  </div>
                ) : report?.data.overallScore >= 60 ? (
                  <div className="flex items-center text-yellow-600">
                    <AlertTriangle className="w-8 h-8 mr-2" />
                    <span className="text-lg font-semibold">Good</span>
                  </div>
                ) : (
                  <div className="flex items-center text-red-600">
                    <AlertTriangle className="w-8 h-8 mr-2" />
                    <span className="text-lg font-semibold">
                      Needs Improvement
                    </span>
                  </div>
                )}
              </div>
            </div>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={remarkMarkdownComponents}
              className="text-gray-700 leading-relaxed"
            >
              {report?.data.generalAssessment}
            </ReactMarkdown>
          </section>

          {/* Detailed Feedback */}
          <section className="mb-8">
            <h2
              className={cn(
                "text-2xl font-semibold mb-4 text-gray-800 border-b pb-2",
                report?.data.pageSettings.headingFont
              )}
            >
              Detailed Feedback
            </h2>
            <div className="space-y-6">
              {[
                {
                  title: "Speaking Skills",
                  content: report?.data.speakingSkills,
                  score: report?.data.speakingSkillsScore,
                },
                {
                  title: "Communication Skills",
                  content: report?.data.communicationSkills,
                  score: report?.data.communicationSkillsScore,
                },
                {
                  title: "Problem-Solving Skills",
                  content: report?.data.problemSolvingSkills,
                  score: report?.data.problemSolvingSkillsScore,
                },
                {
                  title: "Technical Knowledge",
                  content: report?.data.technicalKnowledge,
                  score: report?.data.technicalKnowledgeScore,
                },
                {
                  title: "Teamwork",
                  content: report?.data.teamwork,
                  score: report?.data.teamworkScore,
                },
                {
                  title: "Adaptability",
                  content: report?.data.adaptability,
                  score: report?.data.adaptabilityScore,
                },
              ].map((item, index) => (
                <div key={index} className="border-b pb-4 last:border-b-0">
                  <div className="flex justify-between items-center mb-2">
                    <h3
                      className={cn(
                        "text-xl font-semibold text-gray-800",
                        report?.data.pageSettings.headingFont
                      )}
                    >
                      {item.title}
                    </h3>
                    <div className="flex items-center">
                      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                        <span className="text-xl font-bold text-blue-600">
                          {item.score}%
                        </span>
                      </div>
                      {item.score >= 80 ? (
                        <TrendingUp className="w-6 h-6 text-green-500" />
                      ) : item.score >= 60 ? (
                        <TrendingUp className="w-6 h-6 text-yellow-500" />
                      ) : (
                        <TrendingDown className="w-6 h-6 text-red-500" />
                      )}
                    </div>
                  </div>
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={remarkMarkdownComponents}
                    className="text-gray-700"
                  >
                    {item.content}
                  </ReactMarkdown>
                </div>
              ))}
            </div>
          </section>

          {/* Strengths and Areas for Improvement */}
          <section className="mb-8">
            <h2
              className={cn(
                "text-2xl font-semibold mb-4 text-gray-800 border-b pb-2",
                report?.data.pageSettings.headingFont
              )}
            >
              Strengths and Areas for Improvement
            </h2>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h3
                  className={cn(
                    "text-xl font-semibold mb-4 text-green-600",
                    report?.data.pageSettings.headingFont
                  )}
                >
                  Areas of Strength
                </h3>
                <ul className="space-y-3">
                  {JSON.parse(report?.data.areasOfStrength ?? "[]").map(
                    (strength: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <ThumbsUp className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-1" />
                        <span className="text-gray-700">{strength}</span>
                      </li>
                    )
                  )}
                </ul>
              </div>
              <div>
                <h3
                  className={cn(
                    "text-xl font-semibold mb-4 text-red-600",
                    report?.data.pageSettings.headingFont
                  )}
                >
                  Areas for Improvement
                </h3>
                <ul className="space-y-3">
                  {JSON.parse(report?.data.areasForImprovement ?? "[]").map(
                    (area: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <AlertTriangle className="w-5  h-5 text-red-500 mr-3 flex-shrink-0 mt-1" />
                        <span className="text-gray-700">{area}</span>
                      </li>
                    )
                  )}
                </ul>
              </div>
            </div>
          </section>

          {/* Actionable Next Steps */}
          <section className="mb-8">
            <h2
              className={cn(
                "text-2xl font-semibold mb-4 text-gray-800 border-b pb-2",
                report?.data.pageSettings.headingFont
              )}
            >
              Actionable Next Steps
            </h2>

            <ol className="space-y-4 list-decimal list-inside">
              {JSON.parse(report?.data.actionableNextSteps ?? "[]").map(
                (step: string, index: number) => (
                  <li key={index} className="pl-2 py-3 bg-blue-50 rounded-lg">
                    <span className="text-gray-700 ml-2">{step}</span>
                  </li>
                )
              )}
            </ol>
          </section>
```

## 5. Technical Requirements

### 5.1 Frontend

- Next.js with App Router
- Tailwind CSS for styling
- Server and client components
- Responsive design
- Progressive Web App capabilities

Evidence:

```1:24:public/site.webmanifest
{
 "name": "Interview Optimiser - AI-Powered Interview Practice",
 "short_name": "Interview Optimiser",
 "description": "Prepare for interviews with personalized, AI-driven mock sessions tailored to your role and goals.",
 "icons": [
  {
   "src": "/android-chrome-192x192.png",
   "sizes": "192x192",
   "type": "image/png"
  },
  {
   "src": "/android-chrome-512x512.png",
   "sizes": "512x512",
   "type": "image/png"
  }
 ],
 "theme_color": "#648190",
 "background_color": "#ffffff",
 "display": "standalone",
 "start_url": "/",
 "scope": "/",
 "orientation": "portrait-primary",
 "lang": "en"
}
```

### 5.2 Backend

- AI integration for interview processing
- Voice processing capabilities
- Secure data storage
- Performance analytics
- Email notifications

Evidence:

```30:172:functions/vet-review.ts
export const handler = Sentry.wrapHandler(async () => {
  try {
    logger.info("Starting review vetting process");

    // Get all unpublished reviews
    const unpublishedReviews = await db.query.reviews.findMany({
      where: and(eq(reviews.isPublished, false), isNull(reviews.processedAt)),
    });

    logger.info(
      { count: unpublishedReviews.length },
      "Found unpublished reviews"
    );

    const publishedReviews = [];
    const rejectedReviews = [];

    for (const review of unpublishedReviews) {
      const prompt = `
        Please review this testimonial for ${config.projectName} and determine if it's appropriate for public display.
        Consider the following criteria:
        1. Is it relevant to ${config.projectName} or job seeking?
        2. Is it free from inappropriate content (NSFW, hate speech, etc.)?
        3. Is it a genuine review (not spam or completely unrelated)?

        Note: Do NOT reject negative reviews if they are legitimate feedback about the service.

        Review to evaluate:
        "${review.comment}"
      `;

      const completion = await getOpenAiClient(
        config.supportEmail
      ).beta.chat.completions.parse({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a content moderator for a ${config.projectName} website. Your task is to evaluate testimonials for appropriateness and relevance.`,
          },
          { role: "user", content: prompt },
        ],
        response_format: zodResponseFormat(
          ReviewVettingResponseSchema,
          "reviewVetting"
        ),
        temperature: 0.1,
      });

      if (!completion.choices[0].message.parsed) {
        logger.error("No parsed response returned from OpenAI");
        continue;
      }

      const response = completion.choices[0].message.parsed;

      if (response.isAppropriate) {
        await db
          .update(reviews)
          .set({ isPublished: true, processedAt: new Date() })
          .where(eq(reviews.id, review.id));
        publishedReviews.push({
          id: review.id,
          content: review.comment,
          rating: review.rating,
          author: review.name,
        });
      } else {
        await db
          .update(reviews)
          .set({ isPublished: false, processedAt: new Date() })
          .where(eq(reviews.id, review.id));
        rejectedReviews.push({
          id: review.id,
          content: review.comment,
          rating: review.rating,
          author: review.name,
          rejectionReason: response.reason,
        });
      }

      logger.info(
        {
          reviewId: review.id,
          isAppropriate: response.isAppropriate,
          reason: response.reason,
        },
        "Review processed"
      );
    }

    // Send email report
    if (unpublishedReviews.length > 0) {
      await resend.emails.send({
        from: `${config.projectName} <reviews@${config.domain}>`,
        to: config.supportEmail,
        subject: `Review Moderation Report - ${format(
          new Date(),
          "yyyy-MM-dd"
        )}`,
        react: ReviewReportEmail({
          publishedReviews,
          rejectedReviews,
          date: format(new Date(), "MMMM d, yyyy"),
        }),
      });

      await sendDiscordDM({
        title: "📋 Review Moderation Report",
        metadata: {
          Date: format(new Date(), "MMMM d, yyyy"),
          Published: publishedReviews.length,
          Rejected: rejectedReviews.length,
        },
      });

      logger.info("Sent review report email and Discord notification");
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Review vetting completed",
        publishedCount: publishedReviews.length,
        rejectedCount: rejectedReviews.length,
      }),
    };
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setExtra("context", "vet-review");
      scope.setExtra("error", error);
      scope.setExtra("message", error instanceof Error ? error.message : error);
      Sentry.captureException(error);
    });

    logger.error(
      { error: error instanceof Error ? error.message : error },
      "Error in review vetting process"
    );

    throw error;
  }
});
```

## 6. User Interface Components

### 6.1 Dashboard Features

- Interview history
- Performance metrics
- Resource library
- Practice session scheduling
- Progress tracking

### 6.2 Interview Interface

- Real-time voice interaction
- Visual feedback
- Progress indicators
- Session controls

Evidence:

```112:154:src/components/messages-placeholder.tsx
        {/* Content Container */}
        <div className="relative z-10 max-w-5xl w-full mx-auto px-4 flex flex-col items-center justify-center gap-12">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center space-y-4"
          >
            <h2 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
              Ready for Your Interview
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Experience a realistic interview simulation powered by advanced AI
            </p>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid md:grid-cols-3 gap-6 w-full"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                className="group relative overflow-hidden rounded-2xl bg-gradient-to-b from-background to-primary/5 p-6 border border-primary/10 hover:border-primary/20 transition-colors"
              >
                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <feature.icon className="h-8 w-8 text-primary mb-4 relative z-10" />
                <h3 className="font-semibold mb-2 relative z-10">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground relative z-10">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
```

## 7. Success Metrics

- User engagement rates
- Interview completion rates
- Performance improvement trends
- User satisfaction scores
- Feature adoption rates

## 8. Future Enhancements

- Additional interview types
- Industry-specific templates
- Integration with job platforms
- Enhanced analytics
- Mobile applications

This PRD is based on the actual implementation details found in the codebase, ensuring alignment between requirements and existing functionality.
