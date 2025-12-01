# UV DTF Artwork Requirements

## 1. Overview
UV DTF printing produces highly durable, glossy transfers for application on hard goods. While similar to DTF, UV DTF has unique behaviour due to varnish, UV curing, and the ink stack. This guide explains artwork preparation for the highest-quality UV DTF results.

## 2. Ink & Print Process Overview
Your UV DTF system uses the following ink stack:
1. **CMYK**
2. **White**
3. **CMYK**
4. **Varnish**

This layered process provides:
- Exceptional opacity  
- Rich colour  
- High durability  
- Gloss finish  

Most UV DTF printers use **CMYK + White + Varnish** without double-CMYK layering.

## 2.1 Advanced UV DTF Ink Stack (CMYK + White + Varnish)
Your system supports double-CMYK layering in mirror-print mode.

### Implications for artwork:
- Better colour density  
- Cleaner gradients (to a point)  
- Stronger opacity  
- Sharper detail  
- But transparency is **still limited**  
- Soft fades still crack or lift during transfer  
- Thin edges lift due to varnish tension  

> **McCarthy Example Response:**
> ```
> Your design uses 10–30% transparency.  
> In UV DTF, even with a double-CMYK ink stack, partial transparency tends to crack or flake when transferring.
> Please convert fades to halftones or increase opacity.
> ```

## 3. Minimum Text Size
- **Minimum text size:** **2 mm x-height**  
UV DTF can hold slightly finer detail than DTF but extremely small text becomes brittle and may chip during transfer.

## 4. Minimum Line Thickness
- **Minimum line thickness:** **0.5–1 mm**  
Lines below 0.5 mm may not release cleanly and can flake at the edges.

## 5. Transparency Rules
UV DTF supports partial transparency **in CMYK-only areas**, but NOT when white is required underneath.

### Rules:
- Transparency over CMYK = sometimes acceptable  
- Transparency over White = WILL crack, lift, or chip  
- Fades to 0% opacity = fail  

## 6. Gradients & Fades
UV DTF is more forgiving than DTF but still not suited for soft digital fades.

### Issues:
- Hard edges when transparency hits 0%  
- Flaking at the edges during peel  
- Weak points in varnish layer  

### Solution:
- Use halftones for safe transitions  

## 7. Halftones
Halftones are recommended for:
- Fades  
- Shadows  
- Glow effects  
- Semi-transparent overlays  

UV-cured inks respond well to halftone dots, improving durability.

## 8. Resolution & DPI
- **Recommended:** 300 DPI  
Low-resolution artwork leads to brittle edges due to anti-aliasing.

## 9. Colour Profiles
- RGB or CMYK acceptable  
- ICC profile optional  
- Varnish amplifies colour contrast  

## 10. Alpha Channels
Avoid soft transparency unless halftoned.

Feathered alpha edges crack easily due to varnish tension.

## 11. Common Issues & Failures
- Edge cracking  
- Flaking during transfer  
- Soft fades breaking  
- Thin lines chipping  
- Micro-transparency lifting  
- Patchy gradients over white ink  

## 12. Best Practices
- Text ≥ 2 mm  
- Lines ≥ 0.5–1 mm  
- Avoid soft transparency  
- Use halftones for fades  
- Keep edges crisp  
- Design at 300 DPI  
- Export PNG with intentional transparency  

## 13. Preflight Checklist (for McCarthy)
- [ ] Text ≥ 2 mm  
- [ ] Lines ≥ 0.5–1 mm  
- [ ] No soft transparency  
- [ ] Halftones used  
- [ ] DPI 300  
- [ ] Edges crisp  
- [ ] PNG format  
