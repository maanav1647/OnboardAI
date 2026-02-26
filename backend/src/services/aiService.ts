import { OpenAI } from 'openai';
import config from '../config/env';

/**
 * AI Service - Uses OpenAI to analyze user responses
 * and determine the best onboarding path
 */

const client = new OpenAI({
  apiKey: config.openai.apiKey,
});

const USER_TYPES = [
  'Operations Manager',
  'Sales Lead',
  'Founder',
  'Support Manager',
  'Marketing Manager',
];

/**
 * Analyze user responses and assign to an onboarding path
 * Uses a prompt-based approach to let the model classify the user
 */
export async function scoreAndAssignPath(
  role: string,
  teamSize: string,
  goal: string
): Promise<string> {
  const prompt = `Based on the following user profile, determine the best-fit onboarding path.

User Role: ${role}
Team Size: ${teamSize}
Primary Goal: ${goal}

Available paths: ${USER_TYPES.join(', ')}

Respond with ONLY the user type path name that best fits this profile. No explanation, just the path name.`;

  try {
    const response = await client.chat.completions.create({
      model: 'gpt-3.5-turbo',
      max_tokens: 100,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const content = response.choices[0]?.message?.content?.trim() || '';

    // Validate the response is one of our known paths
    if (USER_TYPES.some(type => content.includes(type))) {
      // Find which type is in the response
      for (const type of USER_TYPES) {
        if (content.includes(type)) {
          return type;
        }
      }
    }

    // Fallback: return based on role if available
    if (USER_TYPES.includes(role)) {
      return role;
    }

    // Default to first type if no match
    return USER_TYPES[0];
  } catch (error) {
    console.error('Error calling OpenAI:', error);
    // Fallback: assign based on role if AI fails
    if (USER_TYPES.includes(role)) {
      return role;
    }
    return USER_TYPES[0];
  }
}

/**
 * Generate personalized welcome message for the user
 */
export async function generateWelcomeMessage(
  userName: string,
  pathName: string
): Promise<string> {
  const prompt = `Create a short, friendly welcome message (2-3 sentences) for a user who just signed up for an onboarding path. 

User name: ${userName}
Onboarding path: ${pathName}

Make it warm, encouraging, and relevant to their chosen path.`;

  try {
    const response = await client.chat.completions.create({
      model: 'gpt-3.5-turbo',
      max_tokens: 150,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const content = response.choices[0]?.message?.content?.trim();

    if (content) {
      return content;
    }

    return `Welcome! We're excited to get you started with your ${pathName} journey.`;
  } catch (error) {
    console.error('Error generating welcome message:', error);
    return `Welcome! We're excited to help you get the most out of our product.`;
  }
}
