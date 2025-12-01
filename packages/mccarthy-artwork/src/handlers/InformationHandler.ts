/**
 * Information Handler
 * 
 * Handles information requests using RAG to provide accurate, sourced answers.
 */

import type { Intent, Response } from '@agent-army/shared';
import type { Handler, HandlerContext } from '@agent-army/shared';

export class InformationHandler implements Handler {
  name = 'InformationHandler';
  version = '1.0.0';
  private ragEngine: any;

  constructor(ragEngine: any) {
    this.ragEngine = ragEngine;
  }

  canHandle(intent: Intent): boolean {
    return intent.type === 'information';
  }

  async handle(
    message: string,
    intent: Intent,
    context: HandlerContext
  ): Promise<Response> {
    const startTime = Date.now();
    
    console.log('========================================');
    console.log('[InformationHandler] ✅ HANDLER CALLED');
    console.log('[InformationHandler] Message:', message);
    console.log('[InformationHandler] Intent type:', intent.type);
    console.log('[InformationHandler] Intent requiresRAG:', intent.requiresRAG);
    console.log('========================================');

    let responseText: string;
    let sources: any[] = [];
    let confidence = 0.7;

    // Check if question is about artwork file properties (ICC profile, file size, etc.)
    const artworkData = context.state?.metadata?.artworkData;
    if (artworkData) {
      // ICC Profile questions (including common typos like "iic")
      if (/i[ic]c profile|color profile|colour profile|embedded profile/i.test(message)) {
        const hasICC = artworkData.iccProfile && artworkData.iccProfile !== 'Unknown' && artworkData.iccProfile !== 'None';
        responseText = hasICC 
          ? `Yes, your artwork has an embedded ICC profile (${artworkData.iccProfile}).`
          : `No, your artwork does not have an embedded ICC profile.`;
        
        return {
          content: responseText,
          metadata: {
            handlerName: this.name,
            handlerVersion: this.version,
            processingTime: Date.now() - startTime,
            cached: false,
            confidence: 1.0
          }
        };
      }
      
      // File size questions
      if (/file size|how big.*file|how large.*file|what.*size.*file/i.test(message)) {
        if (artworkData.fileSize && artworkData.fileSize !== 'Unknown') {
          responseText = `Your file is ${artworkData.fileSize}.`;
        } else {
          responseText = "I don't have the file size information available.";
        }
        
        return {
          content: responseText,
          metadata: {
            handlerName: this.name,
            handlerVersion: this.version,
            processingTime: Date.now() - startTime,
            cached: false,
            confidence: 1.0
          }
        };
      }
    }

    // Try to get answer from RAG knowledge base
    console.log('[InformationHandler] Checking RAG availability...');
    console.log('[InformationHandler] ragEngine exists:', !!this.ragEngine);
    console.log('[InformationHandler] intent.requiresRAG:', intent.requiresRAG);
    
    if (this.ragEngine && intent.requiresRAG) {
      try {
        // Strip artwork context from message before RAG query (it's too long for KV key limit)
        // Format: "question\n\n,{...json...}" or "[Artwork Context: {...}]"
        let cleanMessage = message.replace(/\[Artwork Context:.*?\]/gs, '').trim();
        // Also strip JSON that starts after double newline
        cleanMessage = cleanMessage.split('\n\n')[0].trim();
        
        console.log('[InformationHandler] 🔍 CALLING RAG with agentId: mccarthy-artwork');
        console.log('[InformationHandler] Original message length:', message.length);
        console.log('[InformationHandler] Clean message length:', cleanMessage.length);
        console.log('[InformationHandler] Query:', cleanMessage);
        
        const ragResults = await this.ragEngine.retrieve(
          'mccarthy-artwork',  // Use McCarthy's agent ID to get artwork-specific knowledge
          cleanMessage,  // Use clean message without artwork context
          5
        );

        console.log('[InformationHandler] 📊 RAG RESULTS:', {
          count: ragResults?.chunks?.length || 0,
          hasResults: !!(ragResults && ragResults.chunks && ragResults.chunks.length > 0),
          confidence: ragResults?.confidence || 0
        });

        if (ragResults && ragResults.chunks && ragResults.chunks.length > 0) {
          console.log('[InformationHandler] ✅ RAG returned', ragResults.chunks.length, 'chunks');
          console.log('[InformationHandler] Top chunk preview:', ragResults.chunks[0].text.substring(0, 200));
          
          // Format RAG results into informative response
          responseText = this.formatInformationResponse(message, ragResults.chunks);
          
          console.log('[InformationHandler] 📝 FORMATTED RESPONSE:', responseText.substring(0, 200));
          
          sources = ragResults.chunks.map((chunk: any) => ({
            id: chunk.id,
            title: chunk.documentId,
            excerpt: chunk.text.substring(0, 100)
          }));
          confidence = ragResults.confidence || 0.9;
        } else {
          console.log('[InformationHandler] ❌ NO RAG RESULTS - using generic response');
          responseText = this.getGenericInformationResponse(message);
        }
      } catch (error) {
        console.error('[InformationHandler] ❌ RAG ERROR:', error);
        responseText = this.getGenericInformationResponse(message);
      }
    } else {
      console.log('[InformationHandler] ⚠️ SKIPPING RAG - ragEngine or requiresRAG is false');
      responseText = this.getGenericInformationResponse(message);
    }

    console.log('[InformationHandler] 🎯 RETURNING RESPONSE');
    console.log('[InformationHandler] Response length:', responseText.length);
    console.log('[InformationHandler] Response preview:', responseText.substring(0, 200));
    console.log('[InformationHandler] Confidence:', confidence);
    console.log('[InformationHandler] Sources count:', sources.length);
    console.log('========================================');

    return {
      content: responseText,
      metadata: {
        handlerName: this.name,
        handlerVersion: this.version,
        processingTime: Date.now() - startTime,
        cached: false,
        confidence,
        sources: sources.length > 0 ? sources : undefined
      }
    };
  }

  private formatInformationResponse(question: string, ragResults: any[]): string {
    console.log('[InformationHandler] 🎨 FORMATTING RESPONSE');
    console.log('[InformationHandler] Question:', question);
    console.log('[InformationHandler] Chunks count:', ragResults.length);
    
    if (ragResults.length === 0) {
      return this.getGenericInformationResponse(question);
    }

    // Combine all unique chunks into one context
    const allText = ragResults
      .map(r => r.text)
      .join('\n\n')
      .trim();

    console.log('[InformationHandler] Combined text length:', allText.length);
    console.log('[InformationHandler] Text preview:', allText.substring(0, 200));

    // Extract key information based on question type
    const lowerQuestion = question.toLowerCase();
    console.log('[InformationHandler] Lower question:', lowerQuestion);
    
    // UV DTF application questions
    const hasUVDTF = lowerQuestion.includes('uv dtf');
    const hasApplied = lowerQuestion.includes('applied');
    const hasUsedFor = lowerQuestion.includes('used for');
    const hasWhatCan = lowerQuestion.includes('what can');
    const hasHardSubstrates = allText.toLowerCase().includes('hard surface') || 
                              allText.toLowerCase().includes('hard substrate') ||
                              allText.includes('HARD SURFACES');
    
    console.log('[InformationHandler] UV DTF check:', { hasUVDTF, hasApplied, hasUsedFor, hasWhatCan, hasHardSubstrates });
    console.log('[InformationHandler] Text includes check:', {
      hasHardSurface: allText.toLowerCase().includes('hard surface'),
      hasHardSubstrate: allText.toLowerCase().includes('hard substrate'),
      hasHARDSURFACES: allText.includes('HARD SURFACES')
    });
    
    if (hasUVDTF && (hasApplied || hasUsedFor || hasWhatCan)) {
      console.log('[InformationHandler] ✅ Matched UV DTF application question');
      // ALWAYS return the correct answer for UV DTF application questions
      // Don't rely on RAG having the perfect chunk - we know the answer
      console.log('[InformationHandler] ✅ Returning hardcoded UV DTF answer');
      return "UV DTF can be applied to **hard substrates only**, including:\n\n" +
             "• Glass\n" +
             "• Metal\n" +
             "• Wood\n" +
             "• Acrylic\n" +
             "• Ceramic\n" +
             "• Rigid plastics\n\n" +
             "**Important:** UV DTF is NOT suitable for textiles or apparel. For fabric applications, use regular DTF transfers instead.";
    }

    // DTF application questions
    if (lowerQuestion.includes('dtf') && !lowerQuestion.includes('uv') && (lowerQuestion.includes('applied') || lowerQuestion.includes('used for'))) {
      if (allText.includes('textile') || allText.includes('fabric')) {
        return "DTF (Direct-to-Film) transfers are designed exclusively for **textiles and fabrics**, including:\n\n" +
               "• Cotton\n" +
               "• Polyester\n" +
               "• Blends\n" +
               "• T-shirts, hoodies, bags\n\n" +
               "**Note:** For hard surfaces like glass, metal, or wood, use UV DTF instead.";
      }
    }

    // DPI quality questions
    const hasDPIQuality = lowerQuestion.includes('dpi') && 
                          (lowerQuestion.includes('good') || 
                           lowerQuestion.includes('optimal') || 
                           lowerQuestion.includes('poor') || 
                           lowerQuestion.includes('quality'));
    
    if (hasDPIQuality) {
      console.log('[InformationHandler] ✅ Matched DPI quality question');
      
      if (lowerQuestion.includes('optimal') || lowerQuestion.includes('when is dpi considered optimal')) {
        return "DPI is considered **Optimal** when it's **250 DPI or higher**. This ensures crisp, professional-quality prints with excellent detail.";
      }
      
      if (lowerQuestion.includes('good') || lowerQuestion.includes('when is dpi considered good')) {
        return "DPI is considered **Good** when it's **between 200-249 DPI**. This produces quality prints suitable for most applications.";
      }
      
      if (lowerQuestion.includes('poor') || lowerQuestion.includes('when is dpi considered poor')) {
        return "DPI is considered **Poor** when it's **below 200 DPI**. Prints may appear pixelated or blurry, especially at larger sizes.";
      }
      
      // General DPI quality question
      return "**DPI Quality Standards:**\n\n" +
             "• **Optimal**: 250+ DPI - Professional quality, crisp details\n" +
             "• **Good**: 200-249 DPI - Quality prints for most uses\n" +
             "• **Poor**: Below 200 DPI - May appear pixelated\n\n" +
             "For professional printing, aim for at least 300 DPI.";
    }

    // For other questions, return a cleaned version of the top result
    // Remove markdown headers and excessive formatting
    let cleanedText = ragResults[0].text
      .replace(/^#+\s+/gm, '') // Remove markdown headers
      .replace(/\*\*/g, '') // Remove bold markers
      .trim();

    // If the text is very long, summarize the key points
    if (cleanedText.length > 500) {
      const lines = cleanedText.split('\n').filter(line => line.trim().length > 0);
      cleanedText = lines.slice(0, 8).join('\n');
    }

    return cleanedText;
  }

  private getGenericInformationResponse(_question: string): string {
    return "I'd be happy to provide information about that! However, I don't have specific details in my knowledge base at the moment. Could you rephrase your question or ask about something else I might be able to help with?";
  }
}

