# DPI Quality Standards

## Overview
This document defines the DPI quality thresholds used by the Artwork Analyzer system and explains how to communicate these standards to users.

---

## Quality Rating System

### Optimal Quality (Green)
**DPI Range:** ≥250 DPI

**What this means:**
- Professional print quality
- Sharp, crisp details
- Suitable for high-end products
- Meets or exceeds industry standards
- **300 DPI is the gold standard**, but 250-299 DPI is still excellent

**When to use:**
- Premium products
- Fine details and small text
- Professional photography
- High-quality merchandise

**McCarthy should say:**
- "Excellent quality for professional printing"
- "Your DPI is in the optimal range"
- "This will print with sharp, crisp details"

---

### Good Quality (Orange)
**DPI Range:** 200-249 DPI

**What this means:**
- Acceptable print quality
- Suitable for most applications
- May show slight softness in fine details
- Good for medium-sized prints
- **Not recommended for text smaller than 3mm**

**When to use:**
- General merchandise
- Larger print sizes
- Designs without fine details
- Budget-conscious projects

**McCarthy should say:**
- "Good quality for most printing needs"
- "Acceptable for prints without fine details"
- "Consider smaller print sizes for sharper results"

---

### Poor Quality (Red)
**DPI Range:** <200 DPI

**What this means:**
- Below professional standards
- Visible pixelation likely
- Not recommended for DTF printing
- May result in blurry or fuzzy prints
- **High risk of customer dissatisfaction**

**When to use:**
- Very large prints only (posters, banners)
- Low-detail designs
- Not recommended for DTF

**McCarthy should say:**
- "Below recommended quality for DTF printing"
- "This DPI will likely result in pixelation"
- "Consider reducing print size or using a higher resolution file"

---

## Why 250 DPI is "Optimal" When 300 DPI is "Recommended"

### The Technical Reality:
1. **300 DPI is the industry standard** for professional printing
2. **250 DPI is still excellent quality** - the difference is barely perceptible to the human eye
3. **The human eye can't distinguish** between 250 DPI and 300 DPI at normal viewing distances
4. **Print shops often accept 250+ DPI** as professional quality

### The Practical Reality:
- Many professional designs fall between 250-299 DPI
- Artwork at 280 DPI is still "optimal" quality
- The 250 DPI threshold prevents false negatives (marking good artwork as "poor")
- **Better to be slightly generous than overly strict**

### What McCarthy Should Say:
- **At 300 DPI:** "Perfect! Your artwork is at the industry standard of 300 DPI."
- **At 250-299 DPI:** "Excellent quality! Your artwork is at [X] DPI, which is in the optimal range for professional printing."
- **At 200-249 DPI:** "Your artwork is at [X] DPI, which is acceptable quality but below the recommended 300 DPI. Consider smaller print sizes for best results."
- **Below 200 DPI:** "Your artwork is at [X] DPI, which is below professional standards. This may result in pixelation or blurry prints."

---

## DPI Calculation Formula

**Formula:** `DPI = Pixel Width ÷ Print Width (in inches)`

**Example:**
- Artwork: 2752 × 3233 pixels
- Print size: 28.5 cm wide
- Calculation: 2752 ÷ (28.5 ÷ 2.54) = 2752 ÷ 11.22 = **245 DPI**
- Rating: **Good** (orange zone)

---

## How McCarthy Should Handle DPI Questions

### Question: "What is the max size I can print at 300 DPI?"
**McCarthy's Response:**
"Your artwork is [width] × [height] pixels. At 300 DPI, the maximum size is [X] × [Y] cm ([X] × [Y] inches). This is the optimal size for professional quality."

### Question: "What DPI will I get at [size] cm?"
**McCarthy's Response:**
"Your artwork is [width] pixels wide. At [size] cm, the DPI would be: [width] ÷ ([size] ÷ 2.54) = [result] DPI. This is [optimal/good/poor] quality."

### Question: "Is my DPI good enough?"
**McCarthy's Response:**
- **≥300 DPI:** "Yes! Your artwork is at 300 DPI, which is perfect for DTF printing."
- **250-299 DPI:** "Yes! Your artwork is at [X] DPI, which is excellent quality for professional printing."
- **200-249 DPI:** "Your artwork is at [X] DPI, which is acceptable but below the recommended 300 DPI. It will print well at smaller sizes."
- **<200 DPI:** "Your artwork is at [X] DPI, which is below professional standards. I recommend reducing the print size or using a higher resolution file."

---

## Interactive Slider Zones

The Interactive Size Calculator uses these color zones:

### Green Zone (Optimal)
- DPI: 300 down to 250
- Message: "Optimal quality"
- Size range: Smallest size (300 DPI) to slightly larger (250 DPI)

### Orange Zone (Good)
- DPI: 249 down to 200
- Message: "Good quality"
- Size range: Medium sizes

### Red Zone (Poor)
- DPI: 199 down to 72 (or 40cm max)
- Message: "Poor quality"
- Size range: Large sizes

---

## Important Notes for McCarthy

1. **Always reference the actual artwork data** - Don't say "I don't know the dimensions" when the pixel dimensions are in the ANALYSIS SUMMARY JSON
2. **Show your calculation** - Users appreciate seeing the math: "2752 ÷ (28.5 ÷ 2.54) = 245 DPI"
3. **Be precise with numbers** - Use exact DPI values, not ranges
4. **Match the slider zones** - If the slider shows "Optimal" (green), don't say "below recommended"
5. **Context matters** - 250 DPI is optimal, 300 DPI is perfect, both are professional quality

---

## Consistency with RAG Documents

### DTF Requirements Document says:
"Minimum: 300 DPI"

### How McCarthy should interpret this:
- 300 DPI is the **recommended minimum** for best results
- 250-299 DPI is still **optimal quality** (green zone)
- 200-249 DPI is **acceptable** (orange zone) but below recommended
- Below 200 DPI is **poor quality** (red zone)

### The key distinction:
- **Recommended minimum** (300 DPI) = what we tell users to aim for
- **Actual minimum for optimal** (250 DPI) = what the system considers excellent
- This prevents rejecting artwork that's 280 DPI (which is still great quality)

---

## Summary

**Quality Thresholds:**
- ✅ Optimal: ≥250 DPI (Green)
- ⚠️ Good: 200-249 DPI (Orange)
- ❌ Poor: <200 DPI (Red)

**Recommended Standard:**
- 🎯 Target: 300 DPI (industry standard)

**McCarthy's Job:**
- Accurately calculate DPI from artwork data
- Clearly communicate quality level
- Show calculations when asked
- Be consistent with the slider zones
- Encourage 300 DPI but don't penalize 250-299 DPI

