/**
 * AI Gateway centralizes all AI-related model access using the latest
 * native string-based routing from the v3.4+ 'ai' package.
 */
export class AIGateway {
  private static instance: AIGateway;

  private constructor() {
    const apiKey = process.env.AI_GATEWAY_API_KEY;
    if (!apiKey) {
      throw new Error("AI_GATEWAY_API_KEY is not defined");
    }
  }

  public static getInstance(): AIGateway {
    if (!AIGateway.instance) {
      AIGateway.instance = new AIGateway();
    }
    return AIGateway.instance;
  }

  /**
   * Returns a language model optimized for conversational chat.
   */
  public getChatModel(): any {
    return "openai/gpt-4o";
  }

  /**
   * Returns a model optimized for reasoning and structured tasks (like planning).
   */
  public getReasoningModel(): any {
    return "openai/o1-mini";
  }

  /**
   * Returns a lightweight model for quick tasks.
   */
  public getFastModel(): any {
    return "openai/gpt-4o-mini";
  }
}

export const aiGateway = () => AIGateway.getInstance();
