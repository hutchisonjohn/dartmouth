# How to Change DPI in Photoshop

## Change DPI Without Changing Pixel Dimensions

This is the most common method for print preparation.

### Steps:

1. **Open your artwork** in Adobe Photoshop
2. Go to **Image → Image Size** (or press `Alt+Ctrl+I` on Windows, `Option+Cmd+I` on Mac)
3. **IMPORTANT: Uncheck "Resample"** at the bottom of the dialog
   - This ensures pixel dimensions stay the same
   - Only the print size and DPI will change
4. In the **Resolution** field, enter your target DPI:
   - **300 DPI** - Professional print quality (recommended)
   - **250 DPI** - High-quality prints
   - **200 DPI** - Good quality for most uses
   - **150 DPI** - Acceptable for large posters
5. Notice the **Width** and **Height** (in cm or inches) will adjust automatically
6. Click **OK**

---

## Change DPI AND Resize Image

If you want to change both DPI and pixel dimensions:

### Steps:

1. **Open your artwork** in Adobe Photoshop
2. Go to **Image → Image Size**
3. **Check "Resample"** at the bottom
4. Choose resampling method:
   - **"Preserve Details 2.0"** - Best for enlarging
   - **"Bicubic Smoother"** - Good for enlarging
   - **"Bicubic Sharper"** - Good for reducing size
5. Enter your desired:
   - **Width and Height** (in pixels, cm, or inches)
   - **Resolution** (DPI)
6. Click **OK**

---

## Understanding DPI vs. Pixels

### Key Concepts:

- **Pixels** = The actual image data (e.g., 2811 × 2539 pixels)
- **DPI** = How many pixels per inch when printed
- **Print Size** = Pixels ÷ DPI

### Example:
- Image: 3000 × 2000 pixels
- At 300 DPI: Prints at 10" × 6.67"
- At 150 DPI: Prints at 20" × 13.33"
- **Same pixels, different print sizes!**

---

## DPI Quality Guidelines

- **300 DPI** - Professional printing (business cards, brochures, magazines)
- **250 DPI** - High-quality prints (posters, banners)
- **200 DPI** - Good quality (large format prints)
- **150 DPI** - Acceptable for very large prints (billboards, banners)
- **72 DPI** - Web/screen only (NOT for print!)

---

## Common Mistakes to Avoid

❌ **Don't upscale low-resolution images**
- Changing 72 DPI to 300 DPI won't improve quality
- You're just spreading the same pixels over a smaller area

❌ **Don't forget to uncheck "Resample"**
- If you only want to change DPI for print, uncheck it
- Otherwise, you'll change the actual pixel dimensions

✅ **Always save a copy**
- Never overwrite your original file
- Use "Save As" to create a new file

✅ **Check your artwork dimensions first**
- Use McCarthy Artwork Analyzer to check current DPI
- Calculate if you have enough pixels for your target print size

---

## Quick Reference

| Print Size | Pixels Needed (at 300 DPI) |
|------------|---------------------------|
| 4" × 6" | 1200 × 1800 px |
| 8" × 10" | 2400 × 3000 px |
| 11" × 14" | 3300 × 4200 px |
| 16" × 20" | 4800 × 6000 px |
| 24" × 36" | 7200 × 10800 px |

