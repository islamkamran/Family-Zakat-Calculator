# Family Gold Zakat Calculator

A dedicated, elegant web application for calculating annual Zakat on family gold holdings according to Shariah rules, per-karat purity rates (18K to 24K), jeweler resale deduction (-25% / 75% net realization value), and 1/40th (2.5%) distribution.

Designed specifically for elder family members with ultra-clear typography, serene Islamic aesthetic, and full print-to-PDF support matching official family records.

---

## 🎨 Color Theme
Created strictly with the curated palette:
- **Ice / Frost Background**: `#E3FDFD` (rgb 227, 253, 253)
- **Soft Aqua Surfaces**: `#CBF1F5` (rgb 203, 241, 245)
- **Teal Tint Accents & Borders**: `#A6E3E9` (rgb 166, 227, 233)
- **Primary Brand Turquoise**: `#71C9CE` (rgb 113, 201, 206)
- **High-Contrast Deep Slate/Teal Typography**: `#0D333A` / `#164E5A` for effortless readability

---

## 📐 The Calculation Formula

1. **Karat Purity Rate**:
   Enter the market rate for each Karat category you own (e.g. 22K and 21K).
2. **Resale Value (75% / -25% Deduction)**:
   When selling gold jewelry back to jewelers, standard market practice deducts making charges, impurity margins, and melting losses (25%). Therefore, the liquid cashable valuation is:
   $$\text{Resale Rate per Tola} = \text{Market Rate} \times 75\%$$
3. **Total Net Realization**:
   $$\text{Category Net Worth} = \text{Quantity (in Tolas)} \times \text{Resale Rate}$$
4. **The 40th Part (Zakat Rate)**:
   Under authentic Sunnah of Prophet Muhammad (ﷺ), Zakat on gold is one-fortieth ($1/40$) or $2.5\%$:
   $$\text{Zakat Amount} = \frac{\text{Total Net Realization}}{40}$$
5. **Nisab Threshold**:
   The gold Nisab is **7.5 Tolas** (approx. 87.48 grams). The calculator automatically validates whether your family's cumulative holdings meet this threshold.

---

## ✨ Features

- **Dynamic Karat Dropdowns**: Enter rates only for the karats you own (e.g., 22K & 21K). Dropdowns in the items table will **only** show those active karats, keeping the interface uncluttered and foolproof.
- **Separate Category Breakdown**: Clearly displays separate subtotals and Zakat amounts for 22K, 21K, 24K, etc., before presenting the grand total.
- **One-Click 2025 Example**: Pre-loads the exact calculation from `Zakat_Calculation.pdf` (16.744 Tolas @ Rs. 428,725 -> Rs. 134,610 Zakat).
- **Official A4 Print / PDF Slip**: Prints an official summary slip identical to traditional family paper records, with verification lines and signatures.
- **Grams ↔ Tolas Converter**: Integrated helper modal for quick conversion between grams and tolas ($1\text{ tola} = 11.664\text{ grams}$).
- **Auto-Save**: Securely saves data in the browser so no progress is lost on refresh.
- **Ready for GitHub Pages**: Pure HTML5, CSS3, and Vanilla JavaScript with zero build tools or external server dependencies.

---

## 🚀 How to Deploy on GitHub Pages

1. Push this repository to GitHub:
   ```bash
   git add .
   git commit -m "Add Family Gold Zakat Calculator"
   git push origin main
   ```
2. In your GitHub repository:
   - Go to **Settings** > **Pages** (under Code and automation).
   - Under **Build and deployment** > **Source**, select **Deploy from a branch**.
   - Under **Branch**, select `main` and `/ (root)`.
   - Click **Save**.
3. Your calculator will be live at:
   `https://<your-username>.github.io/Family-Zakat-Calculator/`

---

*May Allah accept your Zakat, purify your wealth, and bestow barakah upon your family.*