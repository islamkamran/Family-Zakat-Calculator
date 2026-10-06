/**
 * Family Gold Zakat Calculator - Core Application Logic
 * Configured specifically for 20K, 21K, and 22K Gold in PKR (Rs.)
 * Implements 25% resale deduction (75% net realization) and 1/40th Zakat distribution.
 */

// Focused Karat presets (22K, 21K, 20K only)
const DEFAULT_KARATS = [
  { id: '22k', name: '22K', purity: 0.916, desc: 'Jewelry Standard (91.6%)', defaultRate: 428725, active: true },
  { id: '21k', name: '21K', purity: 0.875, desc: 'Gulf / Arab Standard (87.5%)', defaultRate: 0, active: false },
  { id: '20k', name: '20K', purity: 0.833, desc: 'Traditional Craft (83.3%)', defaultRate: 0, active: false }
];

// Application State (Currency is fixed to PKR)
const state = {
  currency: 'Rs. ',
  calculationDate: new Date().toISOString().split('T')[0],
  karats: JSON.parse(JSON.stringify(DEFAULT_KARATS)),
  items: [
    { id: 'item_1', name: 'Item 1 (Tolas)', karatId: '22k', tolas: 6.55 },
    { id: 'item_2', name: 'Item 2 (Tolas)', karatId: '22k', tolas: 0.194 },
    { id: 'item_3', name: 'Item 3 (Tolas)', karatId: '22k', tolas: 10 }
  ]
};

// Shariah Nisab threshold in Tolas (7.5 Tolas)
const NISAB_TOLAS = 7.5;
const TOLA_IN_GRAMS = 11.6638;

// LocalStorage Key
const STORAGE_KEY = 'family_zakat_calc_pkr_v2';

let elements = {};

document.addEventListener('DOMContentLoaded', () => {
  initDOMElements();
  loadSavedState();
  initEventListeners();
  renderKaratRatesGrid();
  renderItemsTable();
  recalculateAll();
});

function initDOMElements() {
  elements = {
    calcDate: document.getElementById('calc-date'),
    btnLoadExample: document.getElementById('btn-load-example'),
    btnPrintSummary: document.getElementById('btn-print-summary'),
    btnPrintSummaryBottom: document.getElementById('btn-print-summary-bottom'),
    btnPrintFull: document.getElementById('btn-print-full'),
    btnPrintFullBottom: document.getElementById('btn-print-full-bottom'),
    btnSaveLocal: document.getElementById('btn-save-local'),
    btnTolaConverter: document.getElementById('btn-tola-converter'),
    btnAddItem: document.getElementById('btn-add-item'),
    toggleFormulaGuide: document.getElementById('toggle-formula-guide'),
    karatRatesGrid: document.getElementById('karat-rates-grid'),
    activeKaratsSummary: document.getElementById('active-karats-summary'),
    itemsTableBody: document.getElementById('items-table-body'),
    tableTotalTolas: document.getElementById('table-total-tolas'),
    tableTotalNet: document.getElementById('table-total-net'),
    tableTotalZakat: document.getElementById('table-total-zakat'),
    emptyItemsAlert: document.getElementById('empty-items-alert'),
    // Dedicated Nisab Module
    nisabBannerCard: document.getElementById('nisab-banner-card'),
    nisabIconBox: document.getElementById('nisab-icon-box'),
    nisabStatusBadge: document.getElementById('nisab-status-badge'),
    nisabMainStatement: document.getElementById('nisab-main-statement'),
    nisabSubDetails: document.getElementById('nisab-sub-details'),
    // Category Breakdown
    categoryCardsGrid: document.getElementById('category-cards-grid'),
    // Grand Summary
    summaryTotalTolas: document.getElementById('summary-total-tolas'),
    summaryTotalGrams: document.getElementById('summary-total-grams'),
    summaryGrossVal: document.getElementById('summary-gross-val'),
    summaryNetVal: document.getElementById('summary-net-val'),
    summaryFinalZakat: document.getElementById('summary-final-zakat'),
    summaryFormulaText: document.getElementById('summary-formula-text'),
    mathStepsContainer: document.getElementById('math-steps-container'),
    // Modals
    formulaModal: document.getElementById('formula-modal'),
    btnCloseModal: document.getElementById('btn-close-modal'),
    btnDismissModal: document.getElementById('btn-dismiss-modal'),
    converterModal: document.getElementById('converter-modal'),
    btnCloseConverter: document.getElementById('btn-close-converter'),
    btnDismissConverter: document.getElementById('btn-dismiss-converter'),
    convGrams: document.getElementById('conv-grams'),
    convTolas: document.getElementById('conv-tolas'),
    convResultPill: document.getElementById('conv-result-pill'),
    // Summary Slip (1 Page)
    printSummaryDoc: document.getElementById('print-summary-doc'),
    printSummaryDate: document.getElementById('print-summary-date'),
    printSummaryItemsTbody: document.getElementById('print-summary-items-tbody'),
    printSummaryTotalTolas: document.getElementById('print-summary-total-tolas'),
    printSummaryNetVal: document.getElementById('print-summary-net-val'),
    printSummaryFinalZakat: document.getElementById('print-summary-final-zakat'),
    printSummaryCalcRateLine: document.getElementById('print-summary-calc-rate-line'),
    // Full Audit Report
    printFullDoc: document.getElementById('print-full-doc'),
    printFullDate: document.getElementById('print-full-date'),
    printFullItemsTbody: document.getElementById('print-full-items-tbody'),
    printFullTotalTolas: document.getElementById('print-full-total-tolas'),
    printFullTotalNetVal: document.getElementById('print-full-total-net-val'),
    printFullRatesBreakdown: document.getElementById('print-full-rates-breakdown'),
    printFullFormulaLines: document.getElementById('print-full-formula-lines'),
    printFullFinalZakat: document.getElementById('print-full-final-zakat')
  };

  if (elements.calcDate) {
    elements.calcDate.value = state.calculationDate;
  }
}

function initEventListeners() {
  elements.calcDate.addEventListener('change', (e) => {
    state.calculationDate = e.target.value;
    autoSaveState();
  });

  elements.btnLoadExample.addEventListener('click', loadExampleData);
  
  // Dual Print Handlers
  elements.btnPrintSummary.addEventListener('click', () => printSlip('summary'));
  if (elements.btnPrintSummaryBottom) {
    elements.btnPrintSummaryBottom.addEventListener('click', () => printSlip('summary'));
  }

  elements.btnPrintFull.addEventListener('click', () => printSlip('full'));
  if (elements.btnPrintFullBottom) {
    elements.btnPrintFullBottom.addEventListener('click', () => printSlip('full'));
  }

  elements.btnSaveLocal.addEventListener('click', manualSaveState);
  elements.btnAddItem.addEventListener('click', addNewItem);

  // Modals
  elements.toggleFormulaGuide.addEventListener('click', () => {
    elements.formulaModal.style.display = 'flex';
  });
  elements.btnCloseModal.addEventListener('click', () => {
    elements.formulaModal.style.display = 'none';
  });
  elements.btnDismissModal.addEventListener('click', () => {
    elements.formulaModal.style.display = 'none';
  });

  elements.btnTolaConverter.addEventListener('click', () => {
    elements.converterModal.style.display = 'flex';
  });
  elements.btnCloseConverter.addEventListener('click', () => {
    elements.converterModal.style.display = 'none';
  });
  elements.btnDismissConverter.addEventListener('click', () => {
    elements.converterModal.style.display = 'none';
  });

  window.addEventListener('click', (e) => {
    if (e.target === elements.formulaModal) elements.formulaModal.style.display = 'none';
    if (e.target === elements.converterModal) elements.converterModal.style.display = 'none';
  });

  // Tola-Gram Converter
  elements.convGrams.addEventListener('input', (e) => {
    const g = parseFloat(e.target.value);
    if (!isNaN(g) && g >= 0) {
      const tolas = (g / TOLA_IN_GRAMS).toFixed(4);
      elements.convTolas.value = tolas;
      elements.convResultPill.textContent = `${g} Grams = ${tolas} Tolas`;
    } else {
      elements.convTolas.value = '';
      elements.convResultPill.textContent = '1 Tola = 11.664 Grams';
    }
  });

  elements.convTolas.addEventListener('input', (e) => {
    const t = parseFloat(e.target.value);
    if (!isNaN(t) && t >= 0) {
      const grams = (t * TOLA_IN_GRAMS).toFixed(3);
      elements.convGrams.value = grams;
      elements.convResultPill.textContent = `${t} Tolas = ${grams} Grams`;
    } else {
      elements.convGrams.value = '';
      elements.convResultPill.textContent = '1 Tola = 11.664 Grams';
    }
  });
}

function formatMoney(amount, showSymbol = true) {
  if (isNaN(amount) || amount === null) amount = 0;
  const rounded = Math.round(amount);
  const formatted = rounded.toLocaleString('en-US');
  return showSymbol ? `Rs. ${formatted}` : formatted;
}

function formatTolas(tolas) {
  if (isNaN(tolas) || tolas === null) return '0.000';
  return parseFloat(tolas).toFixed(3);
}

function getActiveKarats() {
  return state.karats.filter(k => k.active && k.defaultRate > 0);
}

function getKarat(id) {
  return state.karats.find(k => k.id === id) || state.karats[0];
}

/**
 * Render Karat Rates Configuration (22K, 21K, 20K)
 */
function renderKaratRatesGrid() {
  const container = elements.karatRatesGrid;
  container.innerHTML = '';

  state.karats.forEach(k => {
    const card = document.createElement('div');
    card.className = `karat-rate-card ${k.active && k.defaultRate > 0 ? 'active' : ''}`;
    card.id = `card-k-${k.id}`;

    const resaleRate = Math.round((k.defaultRate || 0) * 0.75);

    card.innerHTML = `
      <div class="karat-card-top">
        <span class="karat-tag">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>
          ${k.name} Gold
        </span>
        <span class="purity-pct">${(k.purity * 100).toFixed(1)}% Pure</span>
      </div>

      <div class="karat-card-body">
        <label class="karat-input-label" for="rate-${k.id}">Market Rate / Tola (PKR)</label>
        <div class="input-with-currency">
          <span class="curr-symbol">Rs.</span>
          <input 
            type="number" 
            id="rate-${k.id}" 
            class="input-rate-tola" 
            placeholder="0" 
            value="${k.defaultRate || ''}" 
            min="0" 
            step="100"
          >
        </div>
        
        <div class="karat-resale-preview">
          <span>75% Resale Rate:</span>
          <span class="resale-val-highlight" id="resale-preview-${k.id}">
            ${formatMoney(resaleRate)}
          </span>
        </div>
      </div>

      <div class="karat-card-status">
        <label style="display:flex; align-items:center; gap:0.45rem; cursor:pointer;">
          <input type="checkbox" id="check-${k.id}" ${k.active ? 'checked' : ''}>
          <span>Include ${k.name}</span>
        </label>
        <span class="${k.active && k.defaultRate > 0 ? 'status-active-pill' : 'status-inactive-pill'}" id="status-pill-${k.id}">
          ${k.active && k.defaultRate > 0 ? 'Active in items' : 'Inactive'}
        </span>
      </div>
    `;

    const rateInput = card.querySelector(`#rate-${k.id}`);
    const checkInput = card.querySelector(`#check-${k.id}`);

    rateInput.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value) || 0;
      k.defaultRate = val;
      if (val > 0) {
        k.active = true;
        checkInput.checked = true;
      }
      updateKaratCardUI(k);
      refreshItemDropdowns();
      recalculateAll();
      autoSaveState();
    });

    checkInput.addEventListener('change', (e) => {
      k.active = e.target.checked;
      updateKaratCardUI(k);
      refreshItemDropdowns();
      recalculateAll();
      autoSaveState();
    });

    container.appendChild(card);
  });

  renderActiveKaratsSummary();
}

function updateKaratCardUI(k) {
  const card = document.getElementById(`card-k-${k.id}`);
  const preview = document.getElementById(`resale-preview-${k.id}`);
  const statusPill = document.getElementById(`status-pill-${k.id}`);
  if (!card) return;

  const isActive = k.active && k.defaultRate > 0;
  card.className = `karat-rate-card ${isActive ? 'active' : ''}`;
  
  const resaleRate = Math.round((k.defaultRate || 0) * 0.75);
  if (preview) preview.textContent = formatMoney(resaleRate);

  if (statusPill) {
    statusPill.className = isActive ? 'status-active-pill' : 'status-inactive-pill';
    statusPill.textContent = isActive ? 'Active in items' : 'Inactive';
  }

  renderActiveKaratsSummary();
}

function renderActiveKaratsSummary() {
  const summaryBox = elements.activeKaratsSummary;
  const activeList = getActiveKarats();

  if (activeList.length === 0) {
    summaryBox.innerHTML = `<span style="color:#d9534f; font-weight:700;">No Karats active yet. Enter a rate above for 20K, 21K, or 22K.</span>`;
  } else {
    summaryBox.innerHTML = `
      <span>Active Karats in Dropdown:</span>
      ${activeList.map(k => `<span class="active-k-chip">${k.name} (${formatMoney(k.defaultRate)}/tola)</span>`).join('')}
    `;
  }
}

/**
 * Render Items Table
 */
function renderItemsTable() {
  const tbody = elements.itemsTableBody;
  tbody.innerHTML = '';

  if (state.items.length === 0) {
    elements.emptyItemsAlert.style.display = 'block';
    return;
  }
  elements.emptyItemsAlert.style.display = 'none';

  const activeKarats = getActiveKarats();

  state.items.forEach((item, index) => {
    let currentKarat = state.karats.find(k => k.id === item.karatId);
    if (!currentKarat || !currentKarat.active) {
      if (activeKarats.length > 0) {
        item.karatId = activeKarats[0].id;
        currentKarat = activeKarats[0];
      }
    }

    const tr = document.createElement('tr');
    tr.id = `item-row-${item.id}`;

    tr.innerHTML = `
      <td><span class="item-index-badge">${index + 1}</span></td>
      <td>
        <input 
          type="text" 
          class="table-input-text item-name-input" 
          value="${escapeHtml(item.name || '')}" 
          placeholder="e.g. Bangles, Ring, Bar"
          data-id="${item.id}"
        >
      </td>
      <td>
        <select class="table-select-karat item-karat-select" data-id="${item.id}">
          ${renderKaratDropdownOptions(item.karatId)}
        </select>
      </td>
      <td>
        <input 
          type="number" 
          class="table-input-tolas item-tolas-input" 
          value="${item.tolas}" 
          placeholder="0.000" 
          step="any" 
          min="0"
          data-id="${item.id}"
        >
      </td>
      <td>
        <span class="table-val-pill item-resale-rate" id="row-resale-rate-${item.id}">—</span>
      </td>
      <td>
        <span class="table-val-pill item-net-val" id="row-net-val-${item.id}">—</span>
      </td>
      <td>
        <span class="table-val-zakat item-zakat-val" id="row-zakat-val-${item.id}">—</span>
      </td>
      <td class="no-print">
        <button type="button" class="btn-icon-danger btn-delete-item" data-id="${item.id}" title="Remove item">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
        </button>
      </td>
    `;

    const nameInput = tr.querySelector('.item-name-input');
    const karatSelect = tr.querySelector('.item-karat-select');
    const tolasInput = tr.querySelector('.item-tolas-input');
    const deleteBtn = tr.querySelector('.btn-delete-item');

    nameInput.addEventListener('input', (e) => {
      item.name = e.target.value;
      autoSaveState();
    });

    karatSelect.addEventListener('change', (e) => {
      item.karatId = e.target.value;
      recalculateAll();
      autoSaveState();
    });

    tolasInput.addEventListener('input', (e) => {
      item.tolas = parseFloat(e.target.value) || 0;
      recalculateAll();
      autoSaveState();
    });

    deleteBtn.addEventListener('click', () => {
      removeItem(item.id);
    });

    tbody.appendChild(tr);
  });
}

function renderKaratDropdownOptions(selectedId) {
  const activeKarats = getActiveKarats();

  if (activeKarats.length === 0) {
    return `<option value="">No active karats (Enter rate in Step 1)</option>`;
  }

  return activeKarats.map(k => {
    const isSelected = k.id === selectedId ? 'selected' : '';
    return `<option value="${k.id}" ${isSelected}>${k.name} (${formatMoney(k.defaultRate)}/tola)</option>`;
  }).join('');
}

function refreshItemDropdowns() {
  document.querySelectorAll('.item-karat-select').forEach(select => {
    const itemId = select.getAttribute('data-id');
    const item = state.items.find(i => i.id === itemId);
    if (item) {
      select.innerHTML = renderKaratDropdownOptions(item.karatId);
      if (select.value && select.value !== item.karatId) {
        item.karatId = select.value;
      }
    }
  });
}

function addNewItem() {
  const activeKarats = getActiveKarats();
  const defaultKaratId = activeKarats.length > 0 ? activeKarats[0].id : state.karats[0].id;

  const newItem = {
    id: 'item_' + Date.now(),
    name: `Item ${state.items.length + 1}`,
    karatId: defaultKaratId,
    tolas: 1.0
  };

  state.items.push(newItem);
  renderItemsTable();
  recalculateAll();
  autoSaveState();
}

function removeItem(id) {
  state.items = state.items.filter(item => item.id !== id);
  renderItemsTable();
  recalculateAll();
  autoSaveState();
}

/**
 * Recalculate All Values & Update UI
 */
function recalculateAll() {
  let grandTotalTolas = 0;
  let grandGrossVal = 0;
  let grandNetVal = 0;
  let grandZakatDue = 0;

  const categoryAggregates = {};
  getActiveKarats().forEach(k => {
    categoryAggregates[k.id] = {
      karat: k,
      count: 0,
      tolas: 0,
      gross: 0,
      net: 0,
      zakat: 0
    };
  });

  state.items.forEach(item => {
    const karat = getKarat(item.karatId);
    const tolas = parseFloat(item.tolas) || 0;
    const marketRate = karat && karat.defaultRate ? karat.defaultRate : 0;
    const resaleRate = Math.round(marketRate * 0.75); // 75% after 25% resale deduction

    const itemGross = tolas * marketRate;
    const itemNet = tolas * resaleRate;
    const itemZakat = itemNet / 40; // 1/40th part

    grandTotalTolas += tolas;
    grandGrossVal += itemGross;
    grandNetVal += itemNet;
    grandZakatDue += itemZakat;

    const resaleRateEl = document.getElementById(`row-resale-rate-${item.id}`);
    const netValEl = document.getElementById(`row-net-val-${item.id}`);
    const zakatValEl = document.getElementById(`row-zakat-val-${item.id}`);

    if (resaleRateEl) resaleRateEl.textContent = formatMoney(resaleRate);
    if (netValEl) netValEl.textContent = formatMoney(itemNet);
    if (zakatValEl) zakatValEl.textContent = formatMoney(itemZakat);

    if (!categoryAggregates[karat.id]) {
      categoryAggregates[karat.id] = {
        karat: karat,
        count: 0,
        tolas: 0,
        gross: 0,
        net: 0,
        zakat: 0
      };
    }

    categoryAggregates[karat.id].count += 1;
    categoryAggregates[karat.id].tolas += tolas;
    categoryAggregates[karat.id].gross += itemGross;
    categoryAggregates[karat.id].net += itemNet;
    categoryAggregates[karat.id].zakat += itemZakat;
  });

  // Update table footer
  elements.tableTotalTolas.innerHTML = `<strong>${formatTolas(grandTotalTolas)} Tolas</strong>`;
  elements.tableTotalNet.innerHTML = `<strong>${formatMoney(grandNetVal)}</strong>`;
  elements.tableTotalZakat.innerHTML = `<strong>${formatMoney(grandZakatDue)}</strong>`;

  // Update Dedicated Nisab Module (after Module 2)
  updateNisabModule(grandTotalTolas);

  // Render Category Breakdown (Module 3)
  renderCategoryBreakdown(categoryAggregates);

  // Render Grand Summary (Module 4)
  renderGrandSummary(grandTotalTolas, grandGrossVal, grandNetVal, grandZakatDue, categoryAggregates);

  // Render Official Math Proof at the end (Module 5)
  renderMathProof(grandTotalTolas, grandNetVal, grandZakatDue, categoryAggregates);
}

/**
 * Requirement #2: Update Dedicated Nisab Status Module
 */
function updateNisabModule(totalTolas) {
  const card = elements.nisabBannerCard;
  const icon = elements.nisabIconBox;
  const badge = elements.nisabStatusBadge;
  const statement = elements.nisabMainStatement;
  const sub = elements.nisabSubDetails;

  const totalGrams = (totalTolas * TOLA_IN_GRAMS).toFixed(2);

  if (totalTolas >= NISAB_TOLAS) {
    card.className = 'nisab-banner-card';
    icon.innerHTML = `<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>`;
    badge.textContent = 'Eligible for Zakat';
    statement.textContent = `Eligible for Zakat: Total ${formatTolas(totalTolas)} Tolas exceeds ${NISAB_TOLAS} Tolas Nisab`;
    
    const excess = (totalTolas - NISAB_TOLAS).toFixed(3);
    sub.innerHTML = `Total Gold: <strong>${formatTolas(totalTolas)} Tolas</strong> (≈ ${totalGrams} Grams) &bull; Excess above Nisab: <strong>+${excess} Tolas</strong> &bull; Zakat is obligatory (Fard).`;
  } else if (totalTolas > 0) {
    card.className = 'nisab-banner-card exempt';
    icon.innerHTML = `<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;
    badge.textContent = 'Below Nisab';
    statement.textContent = `Holdings (${formatTolas(totalTolas)} Tolas) are below the 7.5 Tolas Nisab threshold.`;
    
    const needed = (NISAB_TOLAS - totalTolas).toFixed(3);
    sub.innerHTML = `Total Gold: <strong>${formatTolas(totalTolas)} Tolas</strong> (≈ ${totalGrams} Grams) &bull; <strong>${needed} Tolas</strong> short of Nisab.`;
  } else {
    card.className = 'nisab-banner-card exempt';
    icon.innerHTML = `<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;
    badge.textContent = 'Awaiting Holdings';
    statement.textContent = `Please enter gold items in Module 2 to evaluate Nisab eligibility.`;
    sub.textContent = `Gold Nisab threshold is 7.5 Tolas (approx. 87.48 Grams).`;
  }
}

/**
 * Render Category Breakdown Cards (Module 3)
 */
function renderCategoryBreakdown(aggregates) {
  const container = elements.categoryCardsGrid;
  container.innerHTML = '';

  const activeCategories = Object.values(aggregates).filter(cat => cat.karat.active || cat.tolas > 0);

  if (activeCategories.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; color: var(--color-text-muted); padding: 1.5rem;">
        No active karat categories with items.
      </div>
    `;
    return;
  }

  activeCategories.forEach(cat => {
    const card = document.createElement('div');
    card.className = 'category-card';
    const resaleRate = Math.round((cat.karat.defaultRate || 0) * 0.75);

    card.innerHTML = `
      <div class="category-card-header">
        <span class="category-card-badge">${cat.karat.name} Gold</span>
        <span class="category-item-count">${cat.count} ${cat.count === 1 ? 'item' : 'items'}</span>
      </div>

      <div class="category-metric-row">
        <span class="category-metric-label">Holdings Weight:</span>
        <span class="category-metric-val">${formatTolas(cat.tolas)} Tolas</span>
      </div>

      <div class="category-metric-row">
        <span class="category-metric-label">Market Rate:</span>
        <span class="category-metric-val">${formatMoney(cat.karat.defaultRate || 0)} / tola</span>
      </div>

      <div class="category-metric-row">
        <span class="category-metric-label">75% Resale Rate:</span>
        <span class="category-metric-val">${formatMoney(resaleRate)} / tola</span>
      </div>

      <div class="category-metric-row">
        <span class="category-metric-label">Total Resale Value:</span>
        <span class="category-metric-val">${formatMoney(cat.net)}</span>
      </div>

      <div class="category-zakat-highlight">
        <span class="category-zakat-label">Zakat on ${cat.karat.name} (÷ 40):</span>
        <span class="category-zakat-amount">${formatMoney(cat.zakat)}</span>
      </div>
    `;

    container.appendChild(card);
  });
}

/**
 * Render Grand Summary Hero Card (Module 4)
 */
function renderGrandSummary(totalTolas, grossVal, netVal, zakatDue) {
  elements.summaryTotalTolas.textContent = `${formatTolas(totalTolas)} Tolas`;
  const totalGrams = (totalTolas * TOLA_IN_GRAMS).toFixed(2);
  elements.summaryTotalGrams.textContent = `≈ ${totalGrams} grams`;

  elements.summaryGrossVal.textContent = formatMoney(grossVal);
  elements.summaryNetVal.textContent = formatMoney(netVal);
  elements.summaryFinalZakat.textContent = formatMoney(zakatDue);
  elements.summaryFormulaText.textContent = `${formatMoney(netVal)} ÷ 40`;
}

/**
 * Requirement #4: Official Calculation Formula (As in Family Record) at the End (Module 5)
 */
function renderMathProof(totalTolas, netVal, zakatDue, aggregates) {
  const container = elements.mathStepsContainer;
  container.innerHTML = '';

  const activeCats = Object.values(aggregates).filter(c => c.tolas > 0);

  // Step 1
  const step1 = document.createElement('div');
  step1.className = 'math-step-card';
  step1.innerHTML = `
    <div class="step-num">Step 1 • Total Quantity</div>
    <div class="step-calc">${formatTolas(totalTolas)} Total Tolas</div>
    <div class="step-note">Cumulative gold across all items</div>
  `;
  container.appendChild(step1);

  // Step 2
  const step2 = document.createElement('div');
  step2.className = 'math-step-card';
  if (activeCats.length === 1) {
    const single = activeCats[0];
    const resale = Math.round((single.karat.defaultRate || 0) * 0.75);
    step2.innerHTML = `
      <div class="step-num">Step 2 • 75% Resale Rate</div>
      <div class="step-calc">75% of ${formatMoney(single.karat.defaultRate)} = ${formatMoney(resale)}</div>
      <div class="step-note">&minus;25% jeweler resale deduction applied</div>
    `;
  } else {
    step2.innerHTML = `
      <div class="step-num">Step 2 • Karat Valuation</div>
      <div class="step-calc">${activeCats.length} Karat Categories Active</div>
      <div class="step-note">Each calculated at 75% resale rate</div>
    `;
  }
  container.appendChild(step2);

  // Step 3
  const step3 = document.createElement('div');
  step3.className = 'math-step-card';
  step3.innerHTML = `
    <div class="step-num">Step 3 • Net Realization Worth</div>
    <div class="step-calc">= ${formatMoney(netVal)}</div>
    <div class="step-note">Total cashable resale value in PKR</div>
  `;
  container.appendChild(step3);

  // Step 4
  const step4 = document.createElement('div');
  step4.className = 'math-step-card';
  step4.style.border = '2px solid var(--color-primary)';
  step4.innerHTML = `
    <div class="step-num" style="color:var(--color-primary-darker);">Step 4 • Zakat Payable (÷ 40)</div>
    <div class="step-calc" style="color:var(--color-primary-darker);">${formatMoney(netVal)} ÷ 40 = ${formatMoney(zakatDue)}</div>
    <div class="step-note">Annual Zakat due on cashable gold</div>
  `;
  container.appendChild(step4);
}

/**
 * Load 2025 Example (Matches Zakat_Calculation.pdf)
 */
function loadExampleData() {
  state.calculationDate = '2025-10-21';
  elements.calcDate.value = '2025-10-21';

  state.karats.forEach(k => {
    if (k.id === '22k') {
      k.defaultRate = 428725;
      k.active = true;
    } else {
      k.defaultRate = 0;
      k.active = false;
    }
  });

  state.items = [
    { id: 'item_1', name: 'Item 1 (Tolas)', karatId: '22k', tolas: 6.55 },
    { id: 'item_2', name: 'Item 2 (Tolas)', karatId: '22k', tolas: 0.194 },
    { id: 'item_3', name: 'Item 3 (Tolas)', karatId: '22k', tolas: 10 }
  ];

  renderKaratRatesGrid();
  renderItemsTable();
  recalculateAll();
  autoSaveState();

  alert('Loaded 2025 calculation example from Zakat_Calculation.pdf: 16.744 Tolas @ Rs. 428,725/tola.');
}

/**
 * Requirements #6 & #7: Dual Print Options
 * mode: 'summary' (guaranteed 1 page) or 'full' (complete audit)
 */
function printSlip(mode) {
  const formattedDate = new Date(state.calculationDate).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }) || state.calculationDate;

  let totalTolas = 0;
  let totalNetVal = 0;
  let totalZakat = 0;
  const categoryMap = {};

  state.items.forEach(item => {
    const karat = getKarat(item.karatId);
    const tolas = parseFloat(item.tolas) || 0;
    const rate = karat ? karat.defaultRate : 0;
    const resaleRate = Math.round(rate * 0.75);
    const netVal = tolas * resaleRate;
    const zakat = netVal / 40;

    totalTolas += tolas;
    totalNetVal += netVal;
    totalZakat += zakat;

    if (!categoryMap[karat.id]) {
      categoryMap[karat.id] = { karat, tolas: 0, netVal: 0, zakat: 0 };
    }
    categoryMap[karat.id].tolas += tolas;
    categoryMap[karat.id].netVal += netVal;
    categoryMap[karat.id].zakat += zakat;
  });

  const activeCats = Object.values(categoryMap);

  if (mode === 'summary') {
    // Populate Concise 1-Page Summary
    elements.printSummaryDate.textContent = formattedDate;
    elements.printSummaryTotalTolas.textContent = `${formatTolas(totalTolas)} Tolas`;
    elements.printSummaryNetVal.textContent = `${formatMoney(totalNetVal)}/-`;
    elements.printSummaryFinalZakat.textContent = `${formatMoney(totalZakat)}/-`;

    if (activeCats.length === 1) {
      const single = activeCats[0];
      const resaleRate = Math.round((single.karat.defaultRate || 0) * 0.75);
      elements.printSummaryCalcRateLine.textContent = `Total Holdings = ${formatTolas(totalTolas)} Tolas × ${formatMoney(resaleRate)}/- (75% Resale Rate)`;
    } else {
      elements.printSummaryCalcRateLine.textContent = `Total Holdings = ${formatTolas(totalTolas)} Tolas across ${activeCats.length} Karat Categories (75% Resale Rate)`;
    }

    const tbody = elements.printSummaryItemsTbody;
    tbody.innerHTML = '';
    state.items.forEach((item, index) => {
      const karat = getKarat(item.karatId);
      const tolas = parseFloat(item.tolas) || 0;
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${index + 1}</td>
        <td style="text-align: left;">${escapeHtml(item.name || 'Tolas')}</td>
        <td>${karat ? karat.name : '—'}</td>
        <td>${formatTolas(tolas)} Tolas</td>
      `;
      tbody.appendChild(tr);
    });

    document.body.classList.remove('print-mode-full-active');
    document.body.classList.add('print-mode-summary-active');

  } else {
    // Populate Complete Audit Report
    elements.printFullDate.textContent = formattedDate;
    elements.printFullTotalTolas.textContent = `${formatTolas(totalTolas)} Tolas`;
    elements.printFullTotalNetVal.textContent = `${formatMoney(totalNetVal)}/-`;
    elements.printFullFinalZakat.textContent = `${formatMoney(totalZakat)}/-`;

    const tbody = elements.printFullItemsTbody;
    tbody.innerHTML = '';
    state.items.forEach((item, index) => {
      const karat = getKarat(item.karatId);
      const tolas = parseFloat(item.tolas) || 0;
      const rate = karat ? karat.defaultRate : 0;
      const resaleRate = Math.round(rate * 0.75);
      const netVal = tolas * resaleRate;
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${index + 1}</td>
        <td style="text-align: left;">${escapeHtml(item.name || 'Tolas')}</td>
        <td>${karat ? karat.name : '—'}</td>
        <td>${formatTolas(tolas)} Tolas</td>
        <td>${formatMoney(netVal)}/-</td>
      `;
      tbody.appendChild(tr);
    });

    // Rates breakdown
    const ratesBox = elements.printFullRatesBreakdown;
    ratesBox.innerHTML = '';
    activeCats.forEach(c => {
      const rate = c.karat.defaultRate || 0;
      const resale = Math.round(rate * 0.75);
      const row = document.createElement('div');
      row.className = 'print-rates-breakdown-row';
      row.innerHTML = `
        <strong>${c.karat.name} Gold Rate on ${formattedDate}</strong> = ${formatMoney(rate)} / tola<br>
        <strong>75% Resale Rate:</strong> 75% of ${formatMoney(rate)} = ${formatMoney(resale)} / tola (&minus;25% jeweler deduction)
      `;
      ratesBox.appendChild(row);
    });

    // Formula lines
    const formulaLines = elements.printFullFormulaLines;
    if (activeCats.length === 1) {
      const single = activeCats[0];
      const resale = Math.round((single.karat.defaultRate || 0) * 0.75);
      formulaLines.innerHTML = `
        <div>${formatTolas(totalTolas)} Tolas &times; ${formatMoney(resale)}</div>
        <div class="print-formula-line">= ${formatMoney(totalNetVal)}/-</div>
        <div class="print-formula-line">${formatMoney(totalNetVal)} &divide; 40</div>
        <div class="print-formula-line">= ${formatMoney(totalZakat)}/-</div>
      `;
    } else {
      const catFormulas = activeCats.map(c => `
        <div>${c.karat.name}: ${formatTolas(c.tolas)} Tolas = ${formatMoney(c.netVal)}/- (Zakat: ${formatMoney(c.zakat)}/-)</div>
      `).join('');

      formulaLines.innerHTML = `
        ${catFormulas}
        <div class="print-formula-line">Total Net Valuation = ${formatMoney(totalNetVal)}/-</div>
        <div class="print-formula-line">${formatMoney(totalNetVal)} &divide; 40</div>
        <div class="print-formula-line">= ${formatMoney(totalZakat)}/-</div>
      `;
    }

    document.body.classList.remove('print-mode-summary-active');
    document.body.classList.add('print-mode-full-active');
  }

  // Trigger print dialog
  setTimeout(() => {
    window.print();
  }, 100);
}

/**
 * LocalStorage
 */
function autoSaveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('LocalStorage save failed:', e);
  }
}

function manualSaveState() {
  autoSaveState();
  alert('Your calculation data has been saved successfully in this browser.');
}

function loadSavedState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.calculationDate) state.calculationDate = parsed.calculationDate;
      if (Array.isArray(parsed.karats)) {
        // Filter to keep only 22k, 21k, 20k
        const allowedIds = ['22k', '21k', '20k'];
        const filtered = parsed.karats.filter(k => allowedIds.includes(k.id));
        if (filtered.length > 0) {
          state.karats = DEFAULT_KARATS.map(def => {
            const found = filtered.find(f => f.id === def.id);
            return found ? { ...def, defaultRate: found.defaultRate, active: found.active } : def;
          });
        }
      }
      if (Array.isArray(parsed.items)) state.items = parsed.items;
      if (elements.calcDate) elements.calcDate.value = state.calculationDate;
    }
  } catch (e) {
    console.warn('Failed to parse saved state:', e);
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
}
