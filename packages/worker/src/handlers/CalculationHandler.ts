/**
 * Calculation Handler
 * 
 * Handles calculation requests using the CalculationEngine for accurate results.
 */

import type { Intent, Response } from '../types/shared';
import type { Handler, HandlerContext } from '../components/ResponseRouter';

export class CalculationHandler implements Handler {
  name = 'calculation';
  version = '1.0.0';

  canHandle(intent: Intent): boolean {
    return intent.type === 'calculation' && intent.requiresCalculation === true;
  }

  async handle(
    message: string,
    _intent: Intent,
    context: HandlerContext
  ): Promise<Response> {
    const startTime = Date.now();

    // Extract calculation parameters from message
    const calcParams = this.extractCalculationParams(message);

    // Use CalculationEngine for accurate calculations
    let result: any;
    let responseText: string;

    if (calcParams && context.calculationEngine) {
      // Perform calculation using the engine
      result = await this.performCalculation(calcParams, context.calculationEngine);
      responseText = this.formatCalculationResponse(result, calcParams);
    } else {
      responseText = "I can help with calculations, but I need more specific information. What would you like me to calculate?";
    }

    return {
      content: responseText,
      metadata: {
        handlerName: this.name,
        handlerVersion: this.version,
        processingTime: Date.now() - startTime,
        cached: false,
        confidence: result ? 1.0 : 0.5,
        calculationResult: result
      }
    };
  }

  private extractCalculationParams(message: string): any {
    // Simple extraction - in production would use more sophisticated parsing
    const numberPattern = /(\d+\.?\d*)/g;
    const numbers = message.match(numberPattern);

    if (!numbers || numbers.length === 0) {
      return null;
    }

    return {
      numbers: numbers.map(n => parseFloat(n)),
      operation: this.detectOperation(message)
    };
  }

  private detectOperation(message: string): string {
    const msg = message.toLowerCase();
    
    if (msg.includes('add') || msg.includes('plus') || msg.includes('+')) {
      return 'add';
    } else if (msg.includes('subtract') || msg.includes('minus') || msg.includes('-')) {
      return 'subtract';
    } else if (msg.includes('multiply') || msg.includes('times') || msg.includes('*')) {
      return 'multiply';
    } else if (msg.includes('divide') || msg.includes('/')) {
      return 'divide';
    } else if (msg.includes('dpi') || msg.includes('resolution')) {
      return 'dpi';
    }
    
    return 'unknown';
  }

  private async performCalculation(params: any, engine: any): Promise<any> {
    const { numbers, operation } = params;

    switch (operation) {
      case 'add':
        return { result: numbers.reduce((a: number, b: number) => a + b, 0), operation: 'addition' };
      case 'subtract':
        return { result: numbers.reduce((a: number, b: number) => a - b), operation: 'subtraction' };
      case 'multiply':
        return { result: numbers.reduce((a: number, b: number) => a * b, 1), operation: 'multiplication' };
      case 'divide':
        return { result: numbers.reduce((a: number, b: number) => a / b), operation: 'division' };
      case 'dpi':
        // Use CalculationEngine for DPI calculations
        if (engine.calculateDPI) {
          return engine.calculateDPI(numbers[0], numbers[1]);
        }
        return { result: 'DPI calculation not available', operation: 'dpi' };
      default:
        return null;
    }
  }

  private formatCalculationResponse(result: any, _params: any): string {
    if (!result) {
      return "I couldn't perform that calculation. Could you provide more details?";
    }

    if (result.operation === 'dpi') {
      return `The DPI for those dimensions is ${result.result}.`;
    }

    return `The result of the ${result.operation} is ${result.result}.`;
  }
}

