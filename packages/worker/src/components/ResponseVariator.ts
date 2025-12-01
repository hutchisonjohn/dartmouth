/**
 * Response Variator
 * 
 * Detects when the same response is being repeated and provides variations
 * to make conversations feel more natural.
 */

export class ResponseVariator {
  private responseHistory: Map<string, string[]> = new Map();

  /**
   * Vary a response if it's being repeated
   */
  varyResponse(
    response: string,
    sessionId: string,
    conversationHistory: string[]
  ): string {
    // Get recent responses from this session
    const recentResponses = conversationHistory.slice(-6); // Last 3 exchanges (6 messages)
    
    // Check if this exact response was recently given
    const wasRecentlyUsed = recentResponses.includes(response);
    
    if (!wasRecentlyUsed) {
      return response; // No variation needed
    }

    // Detect response type and provide variation
    if (this.isRefundResponse(response)) {
      return this.varyRefundResponse(response);
    }
    
    if (this.isPricingResponse(response)) {
      return this.varyPricingResponse(response);
    }
    
    if (this.isDiscountResponse(response)) {
      return this.varyDiscountResponse(response);
    }

    // If no specific variation found, return original
    return response;
  }

  private isRefundResponse(response: string): boolean {
    const lowerResponse = response.toLowerCase();
    return lowerResponse.includes('refund') && 
           (lowerResponse.includes('process') || lowerResponse.includes('unable') || lowerResponse.includes("can't"));
  }

  private isPricingResponse(response: string): boolean {
    const lowerResponse = response.toLowerCase();
    return lowerResponse.includes('pricing') || 
           (lowerResponse.includes('price') && lowerResponse.includes('website'));
  }

  private isDiscountResponse(response: string): boolean {
    const lowerResponse = response.toLowerCase();
    return lowerResponse.includes('discount') && lowerResponse.includes('website');
  }

  private varyRefundResponse(original: string): string {
    const variations = [
      "I understand you'd like a refund. I'm unable to process that, but our support team can definitely help you out. Please contact them via email. What else can I assist you with?",
      "I can't handle refund requests directly, but our team is here to help! Please reach out to them via email and they'll sort this out for you. Anything else I can help with?",
      "Refund requests need to go through our support team. Please drop them an email and they'll take care of you. Is there something else I can help you with in the meantime?",
      "I'm not able to process refunds myself, but I can point you to our support team who can help. Please email them and they'll assist you. What else can I help with today?"
    ];

    return this.selectDifferentVariation(original, variations);
  }

  private varyPricingResponse(original: string): string {
    const variations = [
      "I don't have current pricing information available, but you can find all pricing details on our website. What else can I help you with?",
      "For the most accurate pricing, I'd recommend checking our website directly. Is there something else I can assist you with?",
      "I'm not able to provide pricing details, but our website has all the current pricing information. Can I help you with anything else?",
      "Pricing information is available on our website - that's where you'll find the most up-to-date details. What else can I assist you with today?"
    ];

    return this.selectDifferentVariation(original, variations);
  }

  private varyDiscountResponse(original: string): string {
    const variations = [
      "I don't have access to current discount information, but you can find the latest offers on our website. Is there something else I can help you with?",
      "For the most current discount and sales information, I'd recommend checking our website directly. What else can I assist you with?",
      "I'm not able to provide discount details, but our website has all the latest offers and promotions. Can I help you with anything else?",
      "Discount information is available on our website - that's the best place to find current offers. What else can I help you with today?"
    ];

    return this.selectDifferentVariation(original, variations);
  }

  private selectDifferentVariation(original: string, variations: string[]): string {
    // Find variations that are different from the original
    const differentVariations = variations.filter(v => 
      this.calculateSimilarity(v, original) < 0.7
    );

    if (differentVariations.length === 0) {
      // If all are similar, just pick a random one
      return variations[Math.floor(Math.random() * variations.length)];
    }

    // Return a random different variation
    return differentVariations[Math.floor(Math.random() * differentVariations.length)];
  }

  private calculateSimilarity(text1: string, text2: string): number {
    const words1 = new Set(text1.toLowerCase().split(/\s+/));
    const words2 = new Set(text2.toLowerCase().split(/\s+/));

    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);

    return intersection.size / union.size;
  }
}

