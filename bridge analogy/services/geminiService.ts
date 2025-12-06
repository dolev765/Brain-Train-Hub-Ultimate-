
import { GoogleGenAI, Type } from "@google/genai";
import { Exercise, PlayerAnalogy, Score } from '../types';
import { JUDGE_SYSTEM_PROMPT, GENERATE_EXERCISE_SYSTEM_PROMPT } from '../constants';

let apiKey: string | null = null;
let model: string = 'gemini-2.5-flash';
let ai: GoogleGenAI | null = null;

// Initialize or get AI client
function getAI(): GoogleGenAI {
    // Always check URL params first (they might have changed)
    const urlParams = new URLSearchParams(window.location.search);
    const apiKeyFromUrl = urlParams.get('apiKey');
    if (apiKeyFromUrl && apiKeyFromUrl !== apiKey) {
        apiKey = apiKeyFromUrl;
        ai = null; // Reset client to use new key
    }
    
    // Also get model from URL if not already set
    const modelFromUrl = urlParams.get('model');
    if (modelFromUrl && modelFromUrl !== model) {
        model = modelFromUrl;
    }
    
    // Fallback to process.env if no URL param
    if (!apiKey) {
        apiKey = process.env.API_KEY || null;
    }
    
    if (!apiKey) {
        throw new Error("API key is required. Please provide it via URL parameter 'apiKey' or set it in the environment.");
    }
    
    if (!ai) {
        try {
            console.log('Initializing GoogleGenAI with API key:', apiKey.substring(0, 10) + '...' + apiKey.substring(apiKey.length - 4));
            ai = new GoogleGenAI({ apiKey });
            console.log('GoogleGenAI initialized successfully');
        } catch (error: any) {
            console.error("Error initializing GoogleGenAI:", error);
            throw new Error(`Failed to initialize AI client: ${error?.message || 'Unknown error'}`);
        }
    }
    
    return ai;
}

// Get current model
export function getModel(): string {
    return model;
}

// Set API key (called from App.tsx when received via postMessage)
export function setApiKey(key: string) {
    if (!key || key.trim() === '') {
        console.warn('setApiKey called with empty key');
        return;
    }
    const trimmedKey = key.trim();
    console.log('Setting API key:', trimmedKey.substring(0, 10) + '...' + trimmedKey.substring(trimmedKey.length - 4));
    apiKey = trimmedKey;
    ai = null; // Reset AI client so it reinitializes with new key
}

// Set model (called from App.tsx when received via postMessage or URL)
export function setModel(modelName: string) {
    model = modelName;
}

const judgeAnalogySchema = {
    type: Type.OBJECT,
    properties: {
        relation_score: { type: Type.NUMBER, description: '0-1 score for how well the relation in C:D matches the predicate of A:B. Higher is better.' },
        distance_score: { type: Type.NUMBER, description: '0-1 score for how semantically different the domains of C:D are from A:B. Higher is better.' },
        coherence_score: { type: Type.NUMBER, description: '0-1 score for logical plausibility and naturalness of the C:D analogy. Higher is better.' },
        summary: { type: Type.STRING, description: 'Brief, encouraging, and constructive feedback for the player.' }
    },
    required: ['relation_score', 'distance_score', 'coherence_score', 'summary']
};

export const judgeAnalogy = async (exercise: Exercise, playerAnalogy: PlayerAnalogy): Promise<Score> => {
    const { base_pair, predicate, bans } = exercise;
    const { c, d } = playerAnalogy;

    const prompt = `
        Base Analogy (A:B): "${base_pair[0]} : ${base_pair[1]}"
        Player Analogy (C:D): "${c} : ${d}"
        Rule Predicate: "${predicate}"
        Banned Concepts: ${bans.join(', ')}

        Evaluate the Player Analogy based on the provided schema. The 'summary' should be a concise, helpful tip for the next round.
    `;

    try {
        const aiClient = getAI();
        const response = await aiClient.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                systemInstruction: JUDGE_SYSTEM_PROMPT,
                responseMimeType: 'application/json',
                responseSchema: judgeAnalogySchema,
                temperature: 0.5,
            }
        });

        const jsonString = response.text.trim();
        const result = JSON.parse(jsonString);
        
        // Clamp scores between 0 and 1
        return {
            relation_score: Math.max(0, Math.min(1, result.relation_score)),
            distance_score: Math.max(0, Math.min(1, result.distance_score)),
            coherence_score: Math.max(0, Math.min(1, result.coherence_score)),
            summary: result.summary,
        };

    } catch (error: any) {
        console.error("Error judging analogy:", error);
        // Provide more detailed error message
        if (error?.message?.includes('API key') || error?.message?.includes('401') || error?.message?.includes('403')) {
            throw new Error(`API key error: ${error.message}. Please check your API key in settings.`);
        }
        if (error?.message) {
            throw new Error(`AI judge error: ${error.message}`);
        }
        throw new Error("The AI judge is currently unavailable. Please try again later.");
    }
};

const generateExerciseSchema = {
    type: Type.OBJECT,
    properties: {
        rule_id: { type: Type.STRING },
        difficulty: { type: Type.STRING, enum: ['beginner', 'intermediate', 'advanced'] },
        predicate: { type: Type.STRING },
        base_pair: { type: Type.ARRAY, items: { type: Type.STRING } },
        domain_hints: { type: Type.ARRAY, items: { type: Type.STRING } },
        bans: { type: Type.ARRAY, items: { type: Type.STRING } },
        rubric: { type: Type.STRING },
    },
    required: ['rule_id', 'difficulty', 'predicate', 'base_pair', 'domain_hints', 'bans', 'rubric']
};


export const generateExercise = async (existingRuleIds: string[]): Promise<Exercise> => {
    const prompt = `Generate a new, unique exercise. Difficulty can be beginner, intermediate, or advanced. Ensure the domain hints are genuinely distant from the base pair's domain.
The 'rule_id' for this new exercise must be novel and should not be one of the following already used IDs: [${existingRuleIds.join(', ')}].`;
    try {
        const aiClient = getAI();
        const response = await aiClient.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                systemInstruction: GENERATE_EXERCISE_SYSTEM_PROMPT,
                responseMimeType: 'application/json',
                responseSchema: generateExerciseSchema,
                temperature: 1.0,
            }
        });
        const jsonString = response.text.trim();
        const exerciseData = JSON.parse(jsonString);

        // The 'params' field is not requested in the schema to avoid a generation error,
        // but we ensure it exists on the final object to conform to the Exercise type.
        if (!exerciseData.params) {
            exerciseData.params = {};
        }

        return exerciseData as Exercise;
    } catch(error: any) {
        console.error("Error generating exercise:", error);
        // Provide more detailed error message
        if (error?.message?.includes('API key') || error?.message?.includes('401') || error?.message?.includes('403')) {
            throw new Error(`API key error: ${error.message}. Please check your API key in settings.`);
        }
        if (error?.message) {
            throw new Error(`Exercise generation error: ${error.message}`);
        }
        throw new Error("Could not generate a new exercise. Please try again.");
    }
};
