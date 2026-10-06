/**
 * Family Gold Zakat Calculator - Core Application Logic
 * Implements Karat categorization, 25% resale deduction (75% net realization),
 * and 1/40th (2.5%) Zakat distribution.
 */

// Initial standard Karats supported
const DEFAULT_KARATS = [
  { id: '24k', name: '24K', purity: 1.000, desc: 'Pure Gold (99.9%)', defaultRate: 0, active: false },
  { id: '22k', name: '22K', purity: 0.916, desc: 'Jewelry Standard (91.6%)', defaultRate: 428725, active: true },
  { id: '21k', name: '21K', purity: 0.875, desc: 'Gulf / Arab Standard (87.5%)', defaultRate: 0, active: false },
  { id: '20k', name: '20K', purity: 0.833, desc: 'Traditional Craft (83.3%)', defaultRate: 0, active: false },
  { id: '18k', name: '18K', purity: 0.750, desc: 'Stone & Diamond Mount (75%)', defaultRate: 0, active: false }
];

// App State
const state = {
  currency: 'Rs. ',
  calculationDate: new Date().toISOString().split('T')[0],
  karats: JSON.parse(JSON.stringify(DEFAULT_KARATS)),
  items: [
    { id: 'item_1', name: 'Bangles (Kangan)', karatId: '22k', tolas: 6.55 },
    { id: 'item_2', name: 'Chain & Locket', karatId: '22k', tolas: 0.194 },
    { id: 'item_3', name: 'Gold Bar / Biscuit', karatId: '22k', tolas: 10 }
  ]
};

// Nisab threshold in Tolas (7.5 Tolas)
const NISAB_TOLAS = 7.5;
const TOLA_IN_GRAMS = 11.6638;

// LocalStorage Key
const STORAGE_KEY = 'family_zakat_calculator_state_v1';

// DOM Element References
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
    currencySelect: document.getElementById('currency-select'),
    btnLoadExample: document.getElementById('btn-load-example'),
    btnPrint: document.getElementById('btn-print'),
    btnPrintBottom: document.getElementById('btn-print-bottom'),
    btnSaveLocal: document.getElementById('btn-save-local'),
    btnAutoFillRates: document.getElementById('btn-quick-fill-rates'),
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
    categoryCardsGrid: document.getElementById('category-cards-grid'),
    nisabStatusBadge: document.getElementById('nisab-status-badge'),
    summaryTotalTolas: document.getElementById('summary-total-tolas'),
    summaryTotalGrams: document.getElementById('summary-total-grams'),
    summaryGrossVal: document.getElementById('summary-gross-val'),
    summaryNetVal: document.getElementById('summary-net-val'),
    summaryFinalZakat: document.getElementById('summary-final-zakat'),
    summaryFormulaText: document.getElementById('summary-formula-text'),
    mathStepsContainer: document.getElementById('math-steps-container'),
    formulaModal: document.getElementById('formula-modal'),
    btnCloseModal: document.getElementById('btn-close-modal'),
    btnDismissModal: document.getElementById('btn-dismiss-modal'),
    converterModal: document.getElementById('converter-modal'),
    btnCloseConverter: document.getElementById('btn-close-converter'),
    btnDismissConverter: document.getElementById('btn-dismiss-converter'),
    convGrams: document.getElementById('conv-grams'),
    convTolas: document.getElementById('conv-tolas'),
    convResultPill: document.getElementById('conv-result-pill'),
    // Print document elements
    printDate: document.getElementById('print-date'),
    printItemsTbody: document.getElementById('print-items-tbody'),
    printTotalTolas: document.getElementById('print-total-tolas'),
    printTotalNetVal: document.getElementById('print-total-net-val'),
    printRatesBreakdown: document.getElementById('print-rates-breakdown'),
    printFormulaLines: document.getElementById('print-formula-lines'),
    printFinalZakat: document.getElementById('print-final-zakat')
  };

  if (elements.calcDate) {
    elements.calcDate.value = state.calculationDate;
  }
}

function initEventListeners() {
  // Date and Currency
  elements.calcDate.addEventListener('change', (e) => {
    state.calculationDate = e.target.value;
    autoSaveState();
  });

  elements.currencySelect.addEventListener('change', (e) => {
    state.currency = e.target.value;
    updateCurrencyLabels();
    recalculateAll();
    autoSaveState();
  });

  // Buttons
  elements.btnLoadExample.addEventListener('click', loadExampleData);
  elements.btnPrint.addEventListener('click', prepareAndPrintSlip);
  elements.btnPrintBottom.addEventListener('click', prepareAndPrintSlip);
  elements.btnSaveLocal.addEventListener('click', manualSaveState);
  elements.btnAddItem.addEventListener('click', addNewItem);
  elements.btnAutoFillRates.addEventListener('click', autoDeriveFrom24K);

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

  // Close modals on clicking backdrop
  window.addEventListener('click', (e) => {
    if (e.target === elements.formulaModal) elements.formulaModal.style.display = 'none';
    if (e.target === elements.converterModal) elements.converterModal.style.display = 'none';
  });

  // Converter inputs
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

/**
 * Currency and Number Formatting Helpers
 */
function formatMoney(amount, showSymbol = true) {
  if (isNaN(amount) || amount === null) amount = 0;
  const rounded = Math.round(amount);
  const formatted = rounded.toLocaleString('en-US');
  return showSymbol ? `${state.currency}${formatted}` : formatted;
}

function formatTolas(tolas) {
  if (isNaN(tolas) || tolas === null) return '0.000';
  return parseFloat(tolas).toFixed(3);
}

function updateCurrencyLabels() {
  document.querySelectorAll('.curr-symbol').forEach(el => {
    el.textContent = state.currency;
  });
}

/**
 * Active Karat helpers
 */
function getActiveKarats() {
  return state.karats.filter(k => k.active && k.defaultRate > 0);
}

function getKarat(id) {
  return state.karats.find(k => k.id === id) || state.karats[0];
}

/**
 * Render Karat Rates Configuration Section
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
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>
          ${k.name}
        </span>
        <span class="purity-pct">${(k.purity * 100).toFixed(1)}% Pure</span>
      </div>

      <div class="karat-card-body">
        <label class="karat-input-label" for="rate-${k.id}">Market Rate / Tola</label>
        <div class="input-with-currency">
          <span class="curr-symbol">${state.currency}</span>
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
        <label style="display:flex; align-items:center; gap:0.4rem; cursor:pointer;">
          <input type="checkbox" id="check-${k.id}" ${k.active ? 'checked' : ''}>
          <span>Include this Karat</span>
        </label>
        <span class="${k.active && k.defaultRate > 0 ? 'status-active-pill' : 'status-inactive-pill'}" id="status-pill-${k.id}">
          ${k.active && k.defaultRate > 0 ? 'Active in list' : 'Inactive'}
        </span>
      </div>
    `;

    // Input event for rate
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

    // Checkbox toggle
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
    statusPill.textContent = isActive ? 'Active in list' : 'Inactive';
  }

  renderActiveKaratsSummary();
}

function renderActiveKaratsSummary() {
  const summaryBox = elements.activeKaratsSummary;
  const activeList = getActiveKarats();

  if (activeList.length === 0) {
    summaryBox.innerHTML = `<span style="color:#d9534f; font-weight:600;">No Karats active yet. Please enter at least one gold rate above to calculate.</span>`;
  } else {
    summaryBox.innerHTML = `
      <span>Active Karats for Items dropdown:</span>
      ${activeList.map(k => `<span class="active-k-chip">${k.name} (${formatMoney(k.defaultRate)}/tola)</span>`).join('')}
    `;
  }
}

/**
 * Auto-calculate other karats based on 24K pure rate
 */
function autoDeriveFrom24K() {
  const pureK = state.karats.find(k => k.id === '24k');
  let pureRate = pureK ? pureK.defaultRate : 0;

  if (!pureRate || pureRate <= 0) {
    const promptVal = prompt('Please enter the 24K pure gold rate per tola to auto-calculate all other karats:', '450000');
    if (!promptVal || isNaN(promptVal) || parseFloat(promptVal) <= 0) return;
    pureRate = parseFloat(promptVal);
    if (pureK) {
      pureK.defaultRate = pureRate;
      pureK.active = true;
    }
  }

  state.karats.forEach(k => {
    k.defaultRate = Math.round(pureRate * k.purity);
    k.active = true;
  });

  renderKaratRatesGrid();
  refreshItemDropdowns();
  recalculateAll();
  autoSaveState();
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
    // If the item's current karat is not active, fallback to first active or default
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

    // Row Event Listeners
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
    return `<option value="">No active karats (Set rate above)</option>`;
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
      // If current value is invalid, update item.karatId to selected value
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
 * Recalculate everything and update all views
 */
function recalculateAll() {
  let grandTotalTolas = 0;
  let grandGrossVal = 0;
  let grandNetVal = 0;
  let grandZakatDue = 0;

  // Category aggregates: { [karatId]: { karat, count, tolas, gross, net, zakat } }
  const categoryAggregates = {};

  // Initialize aggregates for active karats
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

  // Calculate per item
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

    // Update row outputs in table
    const resaleRateEl = document.getElementById(`row-resale-rate-${item.id}`);
    const netValEl = document.getElementById(`row-net-val-${item.id}`);
    const zakatValEl = document.getElementById(`row-zakat-val-${item.id}`);

    if (resaleRateEl) resaleRateEl.textContent = formatMoney(resaleRate);
    if (netValEl) netValEl.textContent = formatMoney(itemNet);
    if (zakatValEl) zakatValEl.textContent = formatMoney(itemZakat);

    // Add to category aggregates
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

  // Update table footer subtotals
  elements.tableTotalTolas.innerHTML = `<strong>${formatTolas(grandTotalTolas)} Tolas</strong>`;
  elements.tableTotalNet.innerHTML = `<strong>${formatMoney(grandNetVal)}</strong>`;
  elements.tableTotalZakat.innerHTML = `<strong>${formatMoney(grandZakatDue)}</strong>`;

  // Render Category Breakdown Cards
  renderCategoryBreakdown(categoryAggregates);

  // Update Grand Summary Hero
  renderGrandSummary(grandTotalTolas, grandGrossVal, grandNetVal, grandZakatDue, categoryAggregates);
}

/**
 * Render Category Breakdown Cards
 */
function renderCategoryBreakdown(aggregates) {
  const container = elements.categoryCardsGrid;
  container.innerHTML = '';

  const activeCategories = Object.values(aggregates).filter(cat => cat.karat.active || cat.tolas > 0);

  if (activeCategories.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; color: var(--color-text-muted); padding: 1.5rem;">
        No active karat categories with gold items.
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
 * Render Grand Summary & Mathematical Proof Steps
 */
function renderGrandSummary(totalTolas, grossVal, netVal, zakatDue, aggregates) {
  // Update badges & metrics
  elements.summaryTotalTolas.textContent = `${formatTolas(totalTolas)} Tolas`;
  const totalGrams = (totalTolas * TOLA_IN_GRAMS).toFixed(2);
  elements.summaryTotalGrams.textContent = `≈ ${totalGrams} grams`;

  elements.summaryGrossVal.textContent = formatMoney(grossVal);
  elements.summaryNetVal.textContent = formatMoney(netVal);
  elements.summaryFinalZakat.textContent = formatMoney(zakatDue);
  elements.summaryFormulaText.textContent = `${formatMoney(netVal)} ÷ 40`;

  // Nisab Status
  const nisabBadge = elements.nisabStatusBadge;
  if (totalTolas >= NISAB_TOLAS) {
    nisabBadge.className = 'nisab-status-badge eligible';
    nisabBadge.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
      Eligible for Zakat (Total ${formatTolas(totalTolas)} Tolas exceeds ${NISAB_TOLAS} Tolas Nisab)
    `;
  } else if (totalTolas > 0) {
    nisabBadge.className = 'nisab-status-badge exempt';
    nisabBadge.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      Below Nisab Threshold (${formatTolas(totalTolas)} / ${NISAB_TOLAS} Tolas)
    `;
  } else {
    nisabBadge.className = 'nisab-status-badge';
    nisabBadge.textContent = `Nisab Threshold: ${NISAB_TOLAS} Tolas`;
  }

  // Render Math Proof matching the format in Zakat_Calculation.pdf
  renderMathProof(totalTolas, netVal, zakatDue, aggregates);
}

function renderMathProof(totalTolas, netVal, zakatDue, aggregates) {
  const container = elements.mathStepsContainer;
  container.innerHTML = '';

  const activeCats = Object.values(aggregates).filter(c => c.tolas > 0);

  // Step 1: Weight
  const step1 = document.createElement('div');
  step1.className = 'math-step-card';
  step1.innerHTML = `
    <div class="step-num">Step 1 • Quantity</div>
    <div class="step-calc">${formatTolas(totalTolas)} Total Tolas</div>
    <div class="step-note">Cumulative gold across all items</div>
  `;
  container.appendChild(step1);

  // Step 2: Rate Realization
  const step2 = document.createElement('div');
  step2.className = 'math-step-card';
  if (activeCats.length === 1) {
    const single = activeCats[0];
    const resale = Math.round((single.karat.defaultRate || 0) * 0.75);
    step2.innerHTML = `
      <div class="step-num">Step 2 • 75% Resale Rate</div>
      <div class="step-calc">75% of ${formatMoney(single.karat.defaultRate)} = ${formatMoney(resale)}</div>
      <div class="step-note">-25% jeweler resale deduction applied</div>
    `;
  } else {
    step2.innerHTML = `
      <div class="step-num">Step 2 • Karat Valuation</div>
      <div class="step-calc">${activeCats.length} Karat Categories</div>
      <div class="step-note">Each calculated at 75% resale rate</div>
    `;
  }
  container.appendChild(step2);

  // Step 3: Net Worth
  const step3 = document.createElement('div');
  step3.className = 'math-step-card';
  step3.innerHTML = `
    <div class="step-num">Step 3 • Net Realization Worth</div>
    <div class="step-calc">= ${formatMoney(netVal)}</div>
    <div class="step-note">Total cashable resale value</div>
  `;
  container.appendChild(step3);

  // Step 4: Final 1/40th Zakat
  const step4 = document.createElement('div');
  step4.className = 'math-step-card';
  step4.style.border = '1.5px solid var(--color-primary)';
  step4.innerHTML = `
    <div class="step-num" style="color:var(--color-primary-darker);">Step 4 • Zakat Payable (÷ 40)</div>
    <div class="step-calc" style="color:var(--color-primary-darker);">${formatMoney(netVal)} ÷ 40 = ${formatMoney(zakatDue)}</div>
    <div class="step-note">Obligatory annual Zakat due</div>
  `;
  container.appendChild(step4);
}

/**
 * Load Last Year's Exact Example from Zakat_Calculation.pdf
 */
function loadExampleData() {
  state.currency = 'Rs. ';
  state.calculationDate = '2025-10-21';
  elements.calcDate.value = '2025-10-21';
  elements.currencySelect.value = 'Rs. ';

  // Set 22K rate to 428,725 as in PDF
  state.karats.forEach(k => {
    if (k.id === '22k') {
      k.defaultRate = 428725;
      k.active = true;
    } else {
      k.defaultRate = 0;
      k.active = false;
    }
  });

  // Set items from PDF:
  // 1: 6.55 Tolas
  // 2: 0.194 Tolas
  // 3: 10 Tolas
  state.items = [
    { id: 'item_1', name: 'Item 1 (Tolas)', karatId: '22k', tolas: 6.55 },
    { id: 'item_2', name: 'Item 2 (Tolas)', karatId: '22k', tolas: 0.194 },
    { id: 'item_3', name: 'Item 3 (Tolas)', karatId: '22k', tolas: 10 }
  ];

  renderKaratRatesGrid();
  renderItemsTable();
  recalculateAll();
  autoSaveState();

  alert('Successfully loaded sample calculation from 21 October 2025 (matching Zakat_Calculation.pdf)!');
}

/**
 * Prepare and Print Official A4 Slip matching Zakat_Calculation.pdf
 */
function prepareAndPrintSlip() {
  // Update Print Meta
  const formattedDate = new Date(state.calculationDate).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  elements.printDate.textContent = formattedDate || state.calculationDate;

  // Render Print Items Table
  const tbody = elements.printItemsTbody;
  tbody.innerHTML = '';

  let totalTolas = 0;
  let totalNetVal = 0;
  let totalZakat = 0;

  const categoryMap = {};

  state.items.forEach((item, index) => {
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

  elements.printTotalTolas.textContent = `${formatTolas(totalTolas)} Total Tolas`;
  elements.printTotalNetVal.textContent = `${formatMoney(totalNetVal)}/-`;

  // Render Print Rates Breakdown
  const ratesBox = elements.printRatesBreakdown;
  ratesBox.innerHTML = '';

  const activeCats = Object.values(categoryMap);
  activeCats.forEach(c => {
    const rate = c.karat.defaultRate || 0;
    const resale = Math.round(rate * 0.75);
    const row = document.createElement('div');
    row.className = 'print-rates-breakdown-row';
    row.innerHTML = `
      <strong>Gold Rate for ${c.karat.name} on ${formattedDate}</strong> = ${formatMoney(rate)}<br>
      <strong>75% of ${formatMoney(rate)}</strong> = ${formatMoney(resale)} (Net Resale Rate per tola)
    `;
    ratesBox.appendChild(row);
  });

  // Render exact mathematical steps in print box
  const formulaLines = elements.printFormulaLines;
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
    // Multi-category lines
    const catFormulas = activeCats.map(c => `
      <div>${c.karat.name}: ${formatTolas(c.tolas)} Tolas = ${formatMoney(c.netVal)}/- (Zakat: ${formatMoney(c.zakat)}/-)</div>
    `).join('');

    formulaLines.innerHTML = `
      ${catFormulas}
      <div class="print-formula-line">Total Net Realization = ${formatMoney(totalNetVal)}/-</div>
      <div class="print-formula-line">${formatMoney(totalNetVal)} &divide; 40</div>
      <div class="print-formula-line">= ${formatMoney(totalZakat)}/-</div>
    `;
  }

  elements.printFinalZakat.textContent = `${formatMoney(totalZakat)}/-`;

  // Trigger print dialog
  window.print();
}

/**
 * LocalStorage Persistence
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
  alert('Your calculation data has been securely saved in this browser.');
}

function loadSavedState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.currency) state.currency = parsed.currency;
      if (parsed.calculationDate) state.calculationDate = parsed.calculationDate;
      if (Array.isArray(parsed.karats)) state.karats = parsed.karats;
      if (Array.isArray(parsed.items)) state.items = parsed.items;
      if (elements.currencySelect) elements.currencySelect.value = state.currency;
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
