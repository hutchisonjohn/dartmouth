/**
 * Calculation Engine
 * 
 * Pre-computes all DPI and size calculations to prevent LLM math errors.
 * Implements Section 5.1.9 from AGENT_ARMY_SYSTEM.md
 */

export interface CalculationSet {
  artworkId: string
  pixels: {
    width: number
    height: number
    total: number
  }
  dpi: number
  sizes: SizeCalculations
  quality: QualityRatings
  maxSizes: MaxSizes
  customSizes: CustomSize[]
  timestamp: Date
}

export interface SizeCalculations {
  [key: string]: SizeResult
}

export interface SizeResult {
  dpi: number
  widthInches: number
  heightInches: number
  widthCm: number
  heightCm: number
  quality: 'optimal' | 'good' | 'poor'
  formula?: string
}

export interface QualityRatings {
  optimal: { minDPI: number; maxDPI: number; color: string; label: string }
  good: { minDPI: number; maxDPI: number; color: string; label: string }
  poor: { minDPI: number; maxDPI: number; color: string; label: string }
}

export interface MaxSizes {
  at300dpi: SizeResult
  at250dpi: SizeResult
  at200dpi: SizeResult
  at150dpi: SizeResult
  at72dpi: SizeResult
}

export interface CustomSize {
  widthCm: number
  heightCm: number
  dpi: number
  quality: 'optimal' | 'good' | 'poor'
}

export class CalculationEngine {
  private static readonly CM_PER_INCH = 2.54
  private static readonly QUALITY_THRESHOLDS = {
    optimal: { min: 250, max: Infinity },
    good: { min: 200, max: 249 },
    poor: { min: 0, max: 199 }
  }

  /**
   * Pre-compute all calculations for an artwork
   */
  preCompute(
    artworkId: string,
    widthPixels: number,
    heightPixels: number,
    currentDPI: number
  ): CalculationSet {
    const calculations: CalculationSet = {
      artworkId,
      pixels: {
        width: widthPixels,
        height: heightPixels,
        total: widthPixels * heightPixels
      },
      dpi: currentDPI,
      sizes: {},
      quality: {
        optimal: { minDPI: 250, maxDPI: Infinity, color: 'green', label: 'Optimal' },
        good: { minDPI: 200, maxDPI: 249, color: 'orange', label: 'Good' },
        poor: { minDPI: 0, maxDPI: 199, color: 'red', label: 'Poor' }
      },
      maxSizes: this.calculateMaxSizes(widthPixels, heightPixels),
      customSizes: [],
      timestamp: new Date()
    }

    // Pre-compute common sizes (20cm, 25cm, 30cm, 35cm, 40cm)
    const commonWidths = [20, 25, 30, 35, 40]
    for (const widthCm of commonWidths) {
      const result = this.calculateDPIAtSize(widthPixels, heightPixels, widthCm)
      calculations.sizes[`${widthCm}cm`] = result
    }

    return calculations
  }

  /**
   * Calculate DPI at a specific width (maintaining aspect ratio)
   */
  calculateDPIAtSize(
    widthPixels: number,
    heightPixels: number,
    targetWidthCm: number
  ): SizeResult {
    // Convert cm to inches
    const targetWidthInches = targetWidthCm / CalculationEngine.CM_PER_INCH

    // Calculate DPI
    const dpi = Math.round(widthPixels / targetWidthInches)

    // Calculate height (maintaining aspect ratio)
    const aspectRatio = heightPixels / widthPixels
    const targetHeightInches = targetWidthInches * aspectRatio
    const targetHeightCm = targetHeightInches * CalculationEngine.CM_PER_INCH

    // Determine quality
    const quality = this.getQuality(dpi)

    // Generate formula
    const formula = `${widthPixels}px ÷ (${targetWidthCm}cm ÷ 2.54) = ${dpi} DPI`

    return {
      dpi,
      widthInches: targetWidthInches,
      heightInches: targetHeightInches,
      widthCm: targetWidthCm,
      heightCm: targetHeightCm,
      quality,
      formula
    }
  }

  /**
   * Calculate size at a specific DPI
   */
  calculateSizeAtDPI(
    widthPixels: number,
    heightPixels: number,
    targetDPI: number
  ): SizeResult {
    // Calculate dimensions in inches
    const widthInches = widthPixels / targetDPI
    const heightInches = heightPixels / targetDPI

    // Convert to cm
    const widthCm = widthInches * CalculationEngine.CM_PER_INCH
    const heightCm = heightInches * CalculationEngine.CM_PER_INCH

    // Determine quality
    const quality = this.getQuality(targetDPI)

    // Generate formula
    const formula = `${widthPixels}px ÷ ${targetDPI} DPI = ${widthInches.toFixed(2)}" (${widthCm.toFixed(2)}cm)`

    return {
      dpi: targetDPI,
      widthInches,
      heightInches,
      widthCm,
      heightCm,
      quality,
      formula
    }
  }

  /**
   * Calculate maximum sizes at different DPI levels
   */
  private calculateMaxSizes(widthPixels: number, heightPixels: number): MaxSizes {
    return {
      at300dpi: this.calculateSizeAtDPI(widthPixels, heightPixels, 300),
      at250dpi: this.calculateSizeAtDPI(widthPixels, heightPixels, 250),
      at200dpi: this.calculateSizeAtDPI(widthPixels, heightPixels, 200),
      at150dpi: this.calculateSizeAtDPI(widthPixels, heightPixels, 150),
      at72dpi: this.calculateSizeAtDPI(widthPixels, heightPixels, 72)
    }
  }

  /**
   * Get quality rating for a DPI value
   */
  private getQuality(dpi: number): 'optimal' | 'good' | 'poor' {
    if (dpi >= CalculationEngine.QUALITY_THRESHOLDS.optimal.min) return 'optimal'
    if (dpi >= CalculationEngine.QUALITY_THRESHOLDS.good.min) return 'good'
    return 'poor'
  }

  /**
   * Answer a calculation question using pre-computed data
   */
  answerQuestion(
    question: string,
    calculations: CalculationSet
  ): { answer: string; data: any } {
    const lowerQ = question.toLowerCase()

    // Question: "What DPI at 28cm?"
    if (lowerQ.includes('dpi') && lowerQ.includes('at')) {
      const sizeMatch = lowerQ.match(/(\d+(?:\.\d+)?)\s*(cm|inch)/i)
      if (sizeMatch) {
        const size = parseFloat(sizeMatch[1])
        const unit = sizeMatch[2].toLowerCase()
        const sizeCm = unit === 'inch' ? size * CalculationEngine.CM_PER_INCH : size

        const result = this.calculateDPIAtSize(
          calculations.pixels.width,
          calculations.pixels.height,
          sizeCm
        )

        return {
          answer: `At ${sizeCm.toFixed(2)}cm wide: ${result.formula}. Quality: ${result.quality}.`,
          data: result
        }
      }
    }

    // Question: "What size at 300 DPI?"
    if (lowerQ.includes('size') && lowerQ.includes('dpi')) {
      const dpiMatch = lowerQ.match(/(\d+)\s*dpi/i)
      if (dpiMatch) {
        const dpi = parseInt(dpiMatch[1])
        const result = this.calculateSizeAtDPI(
          calculations.pixels.width,
          calculations.pixels.height,
          dpi
        )

        return {
          answer: `At ${dpi} DPI: ${result.widthCm.toFixed(2)}cm × ${result.heightCm.toFixed(2)}cm (${result.widthInches.toFixed(2)}" × ${result.heightInches.toFixed(2)}"). Quality: ${result.quality}.`,
          data: result
        }
      }
    }

    // Question: "Max size at optimal quality?"
    if ((lowerQ.includes('max') || lowerQ.includes('largest')) && lowerQ.includes('optimal')) {
      const result = calculations.maxSizes.at250dpi

      return {
        answer: `Maximum size at optimal quality (250 DPI): ${result.widthCm.toFixed(2)}cm × ${result.heightCm.toFixed(2)}cm (${result.widthInches.toFixed(2)}" × ${result.heightInches.toFixed(2)}").`,
        data: result
      }
    }

    // Default: provide max size at 300 DPI
    const result = calculations.maxSizes.at300dpi
    return {
      answer: `At 300 DPI: ${result.widthCm.toFixed(2)}cm × ${result.heightCm.toFixed(2)}cm (${result.widthInches.toFixed(2)}" × ${result.heightInches.toFixed(2)}"). At 250 DPI (optimal): ${calculations.maxSizes.at250dpi.widthCm.toFixed(2)}cm × ${calculations.maxSizes.at250dpi.heightCm.toFixed(2)}cm.`,
      data: { at300: result, at250: calculations.maxSizes.at250dpi }
    }
  }
}

