import { createGateway as createSdkGateway, type LanguageModel } from "ai";

/**
 * AI Gateway centralizes all AI-related model access.
 * It provides a unified entry point for different AI tasks.
 */
export class AIGateway {
  private static instance: AIGateway;
  private gateway: ReturnType<typeof createSdkGateway>;

  private constructor() {
    const apiKey = process.env.AI_GATEWAY_API_KEY;
    if (!apiKey) {
      throw new Error("AI_GATEWAY_API_KEY is not defined");
    }
    this.gateway = createSdkGateway({ apiKey });
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
  public getChatModel(): LanguageModel {
    return this.gateway.languageModel("chat");
  }

  /**
   * Returns a model optimized for reasoning and structured tasks (like planning).
   */
  public getReasoningModel(): LanguageModel {
    return this.gateway.languageModel("reasoning");
  }

  /**
   * Returns a lightweight model for quick tasks.
   */
  public getFastModel(): LanguageModel {
    return this.gateway.languageModel("fast");
  }
}

export const aiGateway = () => AIGateway.getInstance();
