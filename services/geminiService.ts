
import { GoogleGenAI, Type } from "@google/genai";
import { Subject, Feedback, Difficulty } from '../types';

// Fix: Initialize GoogleGenAI with API key directly from environment variables as per guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const model = 'gemini-2.5-flash';

const baseFeedbackSchema = {
    type: Type.OBJECT,
    properties: {
        score: {
            type: Type.INTEGER,
            description: "A score from 0 to 10 for the user's answer. 0 is very poor, 10 is excellent."
        },
        feedback: {
            type: Type.STRING,
            description: "Constructive feedback on the user's answer. Highlight good points and areas for improvement. Be encouraging."
        },
        suggestedAnswer: {
            type: Type.STRING,
            description: "An ideal, well-structured answer to the original question."
        }
    },
    required: ["score", "feedback", "suggestedAnswer"]
};

const visualFeedbackSchema = {
    ...baseFeedbackSchema,
    properties: {
        ...baseFeedbackSchema.properties,
        nonVerbalFeedback: {
            type: Type.STRING,
            description: "Feedback on the user's non-verbal communication (e.g., facial expression, confidence, engagement) based on their image. Comment on their professionalism. Be constructive."
        }
    }
};


const getQuestionGenerationPrompt = (subject: Subject, difficulty: Difficulty): string => {
    let persona: string;
    switch (difficulty) {
        case 'Beginner':
            persona = "You are a friendly and encouraging interviewer for a beginner candidate. Your goal is to test fundamental knowledge in a non-intimidating way. Ask one clear, foundational interview question.";
            break;
        case 'Intermediate':
            persona = "You are a professional interviewer for an intermediate-level candidate. Your goal is to assess their practical knowledge and problem-solving skills. Ask one interview question that requires a solid understanding of a core concept.";
            break;
        case 'Advanced':
            persona = "You are a senior-level interviewer assessing an expert candidate. Your goal is to probe the depths of their knowledge. Ask one complex, open-ended interview question that might involve system design, optimization, or trade-off analysis.";
            break;
    }
    return `${persona} The topic is '${subject}'. The question should be concise. Do not add any conversational text, just the question itself.`;
};


export const generateQuestion = async (subject: Subject, difficulty: Difficulty): Promise<string> => {
  try {
    const prompt = getQuestionGenerationPrompt(subject, difficulty);
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
          temperature: 0.8,
          maxOutputTokens: 100,
          thinkingConfig: { thinkingBudget: 0 }
      }
    });
    return response.text.trim();
  } catch (error) {
    console.error("Error generating question:", error);
    return "I'm having trouble coming up with a question right now. Let's try again in a moment.";
  }
};

const getEvaluationPrompt = (question: string, answer: string, subject: Subject, difficulty: Difficulty, withVisualAnalysis: boolean): string => {
    let evaluationCriteria: string;
    switch (difficulty) {
        case 'Beginner':
            evaluationCriteria = "Evaluate the answer from the perspective of a beginner. Be encouraging and focus on whether the core concept is understood. Minor inaccuracies can be gently corrected. The suggested answer should be simple, clear, and foundational.";
            break;
        case 'Intermediate':
            evaluationCriteria = "Evaluate the answer for correctness, clarity, and completeness. The candidate should demonstrate a solid grasp of the topic. The suggested answer should be a well-structured, comprehensive response that a competent professional would give.";
            break;
        case 'Advanced':
            evaluationCriteria = "Evaluate the answer critically, as you would for a senior or staff-level candidate. Assess the depth of knowledge, consideration of edge cases, performance implications, and trade-offs. The suggested answer should be expert-level, detailed, and showcase best practices.";
            break;
    }

    let visualAnalysisInstruction = '';
    if (withVisualAnalysis) {
        visualAnalysisInstruction = "Additionally, analyze the candidate's facial expression from the provided image. Comment on their confidence, engagement, and professionalism. Is their expression appropriate for a professional interview setting? Provide this analysis in the 'nonVerbalFeedback' field.";
    }

    return `
        You are an AI Interview Coach for the subject: ${subject}. The interview difficulty is set to ${difficulty}.
        Your task is to evaluate a candidate's answer to a specific interview question.
        ${evaluationCriteria}
        ${visualAnalysisInstruction}

        Original Question: "${question}"
        Candidate's Answer: "${answer}"

        Please provide a detailed evaluation in JSON format. The JSON should include:
        1.  A 'score' from 0 to 10.
        2.  Constructive 'feedback' explaining the score.
        3.  A 'suggestedAnswer' that serves as a model response.
        ${withVisualAnalysis ? "4. A 'nonVerbalFeedback' field with your analysis of the candidate's image." : ""}
    `;
};


export const evaluateAnswer = async (question: string, answer: string, subject: Subject, difficulty: Difficulty, imageB64Data?: string | null): Promise<Feedback> => {
    try {
        const withVisualAnalysis = difficulty === 'Advanced' && !!imageB64Data;
        const schema = withVisualAnalysis ? visualFeedbackSchema : baseFeedbackSchema;
        const prompt = getEvaluationPrompt(question, answer, subject, difficulty, withVisualAnalysis);
        
        let requestContents: string | { parts: any[] };

        if (withVisualAnalysis && imageB64Data) {
            requestContents = {
                parts: [
                    { text: prompt },
                    {
                        inlineData: {
                            mimeType: 'image/jpeg',
                            data: imageB64Data.split(',')[1], // remove dataURL prefix
                        },
                    }
                ]
            };
        } else {
            requestContents = prompt;
        }

        const response = await ai.models.generateContent({
            model,
            contents: requestContents,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
            }
        });
        
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as Feedback;

    } catch (error) {
        console.error("Error evaluating answer:", error);
        return {
            score: 0,
            feedback: "Sorry, I encountered an error while evaluating your answer. It might be due to a content safety policy or a network issue. Please try a different answer or restart the session.",
            suggestedAnswer: "No suggestion available due to an error.",
            error: true
        };
    }
};