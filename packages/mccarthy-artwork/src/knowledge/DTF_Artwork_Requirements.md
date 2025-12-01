# DTF Artwork Requirements

## 1. Overview
Direct-to-Film (DTF) printing requires artwork that is clean, opaque, and technically prepared to ensure a high‑quality, durable transfer. This document explains all artwork requirements in a friendly, professional tone while maintaining full technical accuracy.

## 2. Ink & Print Process Overview
DTF prints in the following order:
1. **CMYK colour ink**
2. **White underbase ink**
3. **Hot melt adhesive powder applied to the white layer**
4. **Curing, then heat pressing to garment**

Because the white underbase provides opacity AND adhesion, artwork must avoid semi-transparent pixels, soft edges, and extremely fine details.

> **McCarthy Example Response:**
> ```
> Your artwork contains soft transparent pixels.  
> DTF cannot print partial transparency — these areas will not receive white ink and may appear faint or patchy.
> Please convert soft fades into halftone dots or make edges fully opaque.
> ```

## 3. Minimum Text Size
- **Minimum text size:** **8 pt** (≈ **2.5 mm x-height**)  
This ensures crisp edges, solid colour fill, and strong durability.

Small text breaks easily due to anti-aliasing and white underbase choking.

> **McCarthy Example Response:**
> ```
> I found text measuring 1.8 mm x-height.  
> DTF requires at least 2.5 mm for clean readability and proper white underbase support.
> ```

## 4. Minimum Line Thickness
- **Minimum line thickness:** **1 mm**

Thinner lines become weak, patchy, or disappear entirely, especially when the white underbase is choked inward.

## 5. Transparency Rules
DTF **cannot print semi‑transparent pixels**.  
Every pixel must be **100% opaque** to receive the white underbase.

Semi‑transparent pixels cause:
- Washed-out colours  
- Poor adhesion  
- Feathered or incomplete edges  
- Patchy drop shadows  

> **McCarthy Example Response:**
> ```
> Semi-transparent areas detected (12–40% opacity).  
> These will print weak or not at all because DTF requires 100% opaque pixels.
> ```

## 6. Gradients & Fades
Soft gradients that fade to zero opacity do **not** work in DTF.

To create smooth transitions:
- Use **halftone dots** (solid 100% opacity)  
- Avoid anti-aliased fades or feathering  

Halftones ensure a strong white underbase and smooth appearance from a distance.

## 7. Halftones
Halftones convert transparency into a pattern of solid opaque dots.

### Why halftones matter:
- Maintain 100% opacity  
- Allow proper underbase  
- Prevent faint or fragile areas  
- Simulate smooth fading safely  

## 8. Resolution & DPI
- **Minimum:** 300 DPI  
Low-resolution artwork creates fuzzy edges with thousands of partial-opacity pixels.

These pixels do not receive white, causing gaps and weak areas.

## 9. Colour Profiles
- Recommended: **RGB** or **CMYK**  
- Avoid: unsupported embedded profiles or wide-gamut custom spaces  
- Consistency is key for DTF vibrancy

> **McCarthy Example Response:**
> ```
> No embedded ICC profile detected.  
> Colours may shift slightly during printing.
> ```

## 10. Alpha Channels
DTF printing requires **clean, intentional transparency**.

- No feathered transparency  
- No soft shadows  
- No glow effects  
- Only fully opaque artwork or properly halftoned areas

## 11. Common Issues & Failures
- Thin text/lines disappearing  
- Patchy fades  
- Grey/blurry drop shadows  
- Weak adhesion  
- Washed-out edges  
- Pixelated low-resolution artwork  

## 12. Best Practices
- Keep text ≥ 2.5 mm  
- Keep lines ≥ 1 mm  
- Avoid transparency  
- Use halftone patterns for fades  
- Design at 300 DPI  
- Keep edges clean and sharp  
- Export PNG with full opacity  

## 13. Preflight Checklist (for McCarthy)
- [ ] Text ≥ 2.5 mm  
- [ ] Lines ≥ 1 mm  
- [ ] No semi-transparent pixels  
- [ ] No soft fades  
- [ ] Halftones used where needed  
- [ ] DPI 300  
- [ ] Clean edges  
- [ ] Correct file format  
