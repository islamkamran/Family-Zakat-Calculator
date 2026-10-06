# Family Gold Zakat Calculator (PKR)

A dedicated, elegant web application for calculating annual Zakat on family gold holdings according to Shariah rules, per-karat purity rates (**20K, 21K, and 22K**), jeweler resale deduction (-25% / 75% net realization value), and 1/40th (2.5%) distribution in **Pakistani Rupees (PKR)**.

Designed specifically for elder family members with large high-contrast typography, serene Islamic aesthetic, and full print-to-PDF support matching official family records.

---

## 🎨 Color Theme
Created strictly with the requested palette:
- **Ice / Frost Background**: `#E3FDFD` (`rgb(227, 253, 253)`)
- **Soft Aqua Surfaces & Panels**: `#CBF1F5` (`rgb(203, 241, 245)`)
- **Teal Tint Accents & Borders**: `#A6E3E9` (`rgb(166, 227, 233)`)
- **Primary Brand Turquoise**: `#71C9CE` (`rgb(113, 201, 206)`)
- **High-Contrast Deep Slate/Teal Typography**: `#0D333A` & `#164E5A` for effortless readability
- **Warm Gold Touch**: `#D4AF37` for Karat badges (20K, 21K, 22K)

---

## 📐 The Calculation Formula

1. **Karat Purity Rates (20K, 21K, 22K in PKR)**:
   Enter the market price per tola for the gold purities you own.
2. **Resale Value (75% / -25% Deduction)**:
   When selling gold jewelry back to jewelers, standard market practice deducts making charges, impurity margins, and melting losses (25%). Therefore, the liquid cashable valuation is:
   $$\text{Resale Rate per Tola} = \text{Market Rate} \times 75\%$$
3. **Total Net Realization**:
   $$\text{Category Net Worth} = \text{Quantity (in Tolas)} \times \text{Resale Rate}$$
4. **The 40th Part (Zakat Rate)**:
   Under authentic Sunnah of Prophet Muhammad (ﷺ), Zakat on gold is one-fortieth ($1/40$) or $2.5\%$:
   $$\text{Zakat Amount} = \frac{\text{Total Net Realization}}{40}$$
5. **Nisab Threshold**:
   The gold Nisab is **7.5 Tolas** (approx. 87.48 grams). The calculator displays a dedicated Nisab verification card right after your gold holdings list.

---

## ✨ Features Built for Your Family

- **Family Member Selection (Before Module 1)**:
  - Choose whose Zakat is being calculated: **Combine All (Entire Family)**, **Main Home**, **Muhammad Atta-ul-Islam Abrar**, **Muhammad Zia-ul-Islam Arsalan**, **Muhammad Islam Kamran**, **Muhammad Faiz-ul-Islam Hamza**, or **Custom Name**.
  - The chosen member's actual full name appears on all generated print slips and verification signatures.
- **Clean Slate & Custom Reset Popup**:
  - Gold rates start blank, waiting for you to type the current market prices.
  - Holdings table starts completely empty.
  - Clicking **"Reset"** triggers an elegant, themed confirmation modal asking whether you want to clear rates and holdings back to a fresh slate.
  - You can click **"Load 2025 Example"** anytime to view last year's sample with one tap.
- **Welcome Animation**:
  - An animated Islamic welcome overlay featuring the Bismillah and Quranic verse on Zakat displays for 3 seconds on page load, then smoothly fades away.
- **Dedicated Nisab Module & Hero Summary**:
  - Automatically assesses eligibility against the 7.5 Tolas threshold.
  - Highlights Total Gold Holdings, Net 75% Resale Worth, and Final Zakat Due ($\div 40$).
- **Separate Category Breakdown**: Independent summary cards showing subtotals for 22K, 21K, and 20K.
- **Dual Print Options**:
  1. **Print Summary Slip (1 Page)**: Compact A4 slip with member name, items list, total tolas, net zakat due, and signature lines strictly on a single page!
  2. **Print Complete Report (Full Audit)**: Multi-section detailed audit with member name, per-karat rates, 75% resale breakdown, step-by-step math proof, and signatures.
- **Formula Proof at the End**: Official calculation card at the very bottom matching your traditional family records.
- **100% Mobile Compliant**: Touch targets $\ge 44\text{px}$, responsive cards and inputs that look sharp on any smartphone.
- **Grams ↔ Tolas Converter**: Built-in popup helper ($1\text{ tola} = 11.664\text{ grams}$).

---

## 🚀 How to Deploy on GitHub Pages

1. Push this repository to GitHub:
   ```bash
   git add .
   git commit -m "Update Family Gold Zakat Calculator with family member selector"
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

*May Allah accept your Zakat, purify your wealth, and grant barakah in your home.*