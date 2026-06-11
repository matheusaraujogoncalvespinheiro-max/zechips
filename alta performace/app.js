// ==========================================================================
// APP STATE & DATABASE INITIALIZATION
// ==========================================================================

// Global state variables
let products = [];
let sales = [];
let cart = [];
let activeTab = 'dashboard';

// Chart instances for disposal on rebuild
let revenueChartInstance = null;
let topProductsChartInstance = null;
let sizeChartInstance = null;

// Initial sizes object helper
const defaultSizes = () => ({
    34: 0, 35: 0, 36: 0, 37: 0, 38: 0, 39: 0, 40: 0, 41: 0, 42: 0, 43: 0, 44: 0
});

// Mock Initial Data if LocalStorage is empty
const mockProducts = [
    {
        id: 'prod-1',
        code: 'NK-AMAX-01',
        name: 'Tênis Air Max Sport',
        brand: 'Nike',
        category: 'Calçados',
        sizeType: 'Calçados',
        costPrice: 220.00,
        salePrice: 449.90,
        sizes: { 34: 2, 35: 4, 36: 8, 37: 12, 38: 15, 39: 10, 40: 8, 41: 5, 42: 3, 43: 1, 44: 0 }
    },
    {
        id: 'prod-2',
        code: 'AD-SPEED-02',
        name: 'Chuteira Speed Pro Futsal',
        brand: 'Adidas',
        category: 'Calçados',
        sizeType: 'Calçados',
        costPrice: 130.00,
        salePrice: 289.90,
        sizes: { 34: 0, 35: 1, 36: 3, 37: 5, 38: 8, 39: 12, 40: 10, 41: 6, 42: 4, 43: 2, 44: 0 }
    },
    {
        id: 'prod-3',
        code: 'OL-CASL-03',
        name: 'Sapatênis Casual Soft',
        brand: 'Olympikus',
        category: 'Calçados',
        sizeType: 'Calçados',
        costPrice: 90.00,
        salePrice: 189.90,
        sizes: { 34: 1, 35: 3, 36: 5, 37: 8, 38: 10, 39: 12, 40: 15, 41: 10, 42: 5, 43: 2, 44: 1 }
    },
    {
        id: 'prod-4',
        code: 'AD-UBOOST-04',
        name: 'Tênis Ultra Boost Run',
        brand: 'Adidas',
        category: 'Calçados',
        sizeType: 'Calçados',
        costPrice: 380.00,
        salePrice: 799.90,
        sizes: { 34: 0, 35: 0, 36: 2, 37: 4, 38: 6, 39: 8, 40: 10, 41: 8, 42: 4, 43: 1, 44: 0 }
    },
    {
        id: 'prod-5',
        code: 'PM-TRAIN-05',
        name: 'Tênis Training Max Fit',
        brand: 'Puma',
        category: 'Calçados',
        sizeType: 'Calçados',
        costPrice: 150.00,
        salePrice: 319.90,
        sizes: { 34: 1, 35: 2, 36: 4, 37: 5, 38: 8, 39: 7, 40: 6, 41: 4, 42: 2, 43: 1, 44: 1 }
    },
    {
        id: 'prod-6',
        code: 'AD-SHRT-06',
        name: 'Short Adidas Core Running',
        brand: 'Adidas',
        category: 'Shorts / Calças',
        sizeType: 'Roupas',
        costPrice: 45.00,
        salePrice: 99.90,
        sizes: { 'PP': 1, 'P': 3, 'M': 5, 'G': 4, 'GG': 2, 'XG': 0 }
    },
    {
        id: 'prod-7',
        code: 'NK-TEE-07',
        name: 'Camiseta Dry Fit Treino',
        brand: 'Nike',
        category: 'Camisetas',
        sizeType: 'Roupas',
        costPrice: 50.00,
        salePrice: 119.90,
        sizes: { 'PP': 0, 'P': 2, 'M': 8, 'G': 6, 'GG': 3, 'XG': 1 }
    },
    {
        id: 'prod-8',
        code: 'PN-BALL-08',
        name: 'Bola Futebol Penalty Campo',
        brand: 'Penalty',
        category: 'Bolas',
        sizeType: 'Único',
        costPrice: 65.00,
        salePrice: 149.90,
        sizes: { 'U': 12 }
    },
    {
        id: 'prod-9',
        code: 'NK-SOCK-09',
        name: 'Meião Esportivo Dry Pro',
        brand: 'Nike',
        category: 'Equipamentos / Outros',
        sizeType: 'Único',
        costPrice: 15.00,
        salePrice: 39.90,
        sizes: { 'U': 25 }
    }
];

const mockSales = [
    {
        id: 'sale-1',
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
        items: [
            { productId: 'prod-1', productName: 'Tênis Air Max Sport', productBrand: 'Nike', size: '38', quantity: 1, salePrice: 449.90, costPrice: 220.00 }
        ],
        discount: 20.00,
        total: 429.90,
        paymentMethod: 'Pix',
        profit: 209.90
    },
    {
        id: 'sale-2',
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
        items: [
            { productId: 'prod-2', productName: 'Chuteira Speed Pro Futsal', productBrand: 'Adidas', size: '40', quantity: 2, salePrice: 289.90, costPrice: 130.00 },
            { productId: 'prod-3', productName: 'Sapatênis Casual Soft', productBrand: 'Olympikus', size: '37', quantity: 1, salePrice: 189.90, costPrice: 90.00 }
        ],
        discount: 0,
        total: 769.70,
        paymentMethod: 'Cartão de Crédito',
        profit: 419.70
    },
    {
        id: 'sale-3',
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // Yesterday
        items: [
            { productId: 'prod-4', productName: 'Tênis Ultra Boost Run', productBrand: 'Adidas', size: '41', quantity: 1, salePrice: 799.90, costPrice: 380.00 }
        ],
        discount: 50.00,
        total: 749.90,
        paymentMethod: 'Pix',
        profit: 369.90
    }
];

// Global rates for payment machine
let paymentRates = {
    "Pix": 0.99,
    "Cartão de Débito": 1.99,
    "Cartão de Crédito": 3.99,
    "Dinheiro": 0.00
};

// Load database from localStorage or seed
async function initDatabase() {
    try {
        if (window.electronAPI) {
            products = await window.electronAPI.readDb('products');
            sales = await window.electronAPI.readDb('sales');
            paymentRates = await window.electronAPI.readDb('rates');
        } else {
            const prodRes = await fetch('/api/products');
            products = await prodRes.json();
            
            const salesRes = await fetch('/api/sales');
            sales = await salesRes.json();
            
            const ratesRes = await fetch('/api/rates');
            paymentRates = await ratesRes.json();
        }
    } catch (e) {
        console.error("Erro ao conectar ao banco de dados local:", e);
    }
}

// Save database state
async function saveProductsToStorage() {
    try {
        if (window.electronAPI) {
            await window.electronAPI.writeDb('products', products);
        } else {
            await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(products)
            });
        }
    } catch (e) {
        console.error("Falha ao salvar produtos:", e);
    }
}

async function saveSalesToStorage() {
    try {
        if (window.electronAPI) {
            await window.electronAPI.writeDb('sales', sales);
        } else {
            await fetch('/api/sales', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(sales)
            });
        }
    } catch (e) {
        console.error("Falha ao salvar vendas:", e);
    }
}

async function saveRatesToStorage() {
    try {
        if (window.electronAPI) {
            await window.electronAPI.writeDb('rates', paymentRates);
        } else {
            await fetch('/api/rates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(paymentRates)
            });
        }
    } catch (e) {
        console.error("Falha ao salvar taxas:", e);
    }
}

// ==========================================================================
// APP INITIALIZATION & NAVIGATION
// ==========================================================================

document.addEventListener('DOMContentLoaded', async () => {
    // Initial data load
    await initDatabase();
    
    // Set current date
    updateLiveDate();
    
    // Set up navigation click listeners
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const tabId = item.getAttribute('data-tab');
            switchTab(tabId);
        });
    });
    
    // Setup search filter events
    document.getElementById('stock-search').addEventListener('input', renderStockTable);
    document.getElementById('stock-category-filter').addEventListener('change', renderStockTable);
    document.getElementById('sale-product-search').addEventListener('input', renderSalesGrid);
    
    // Render initial page
    switchTab('dashboard');
});

function updateLiveDate() {
    const liveDateEl = document.getElementById('live-date');
    if (liveDateEl) {
        const today = new Date();
        const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
        liveDateEl.textContent = today.toLocaleDateString('pt-BR', options);
    }
}

// Switch tabs inside SPA
function switchTab(tabId) {
    activeTab = tabId;
    
    // Update menu UI classes
    document.querySelectorAll('.menu-item').forEach(item => {
        if (item.getAttribute('data-tab') === tabId) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
    
    // Update panes visibility
    document.querySelectorAll('.tab-pane').forEach(pane => {
        pane.classList.remove('active');
    });
    
    const targetPane = document.getElementById(`tab-${tabId}`);
    if (targetPane) {
        targetPane.classList.add('active');
    }
    
    // Update Title and Subtitle dynamically
    const mainTitle = document.getElementById('current-tab-title');
    const mainSubtitle = document.getElementById('header-subtitle');
    
    switch (tabId) {
        case 'dashboard':
            mainTitle.textContent = 'Dashboard';
            mainSubtitle.textContent = 'Visão geral e desempenho da Alta Performance.';
            renderDashboard();
            break;
        case 'stock':
            mainTitle.textContent = 'Controle de Estoque';
            mainSubtitle.textContent = 'Gerencie modelos de calçados, numerações e grades de tamanhos.';
            renderStockTable();
            break;
        case 'sales':
            mainTitle.textContent = 'Ponto de Venda (PDV)';
            mainSubtitle.textContent = 'Registre novas vendas de forma rápida.';
            renderSalesGrid();
            renderCart();
            break;
        case 'reports':
            mainTitle.textContent = 'Relatórios e Estatísticas';
            mainSubtitle.textContent = 'Visualização de produtos mais vendidos, numerações e histórico financeiro.';
            renderReports();
            break;
    }
    
    // Reinitialize Lucide Icons for dynamic content
    lucide.createIcons();
}

// Helper Format Currency (BRL)
function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

// Helper Generate ID
function generateUID(prefix = 'id') {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
}

// Helper Count Stock Sum
function getProductTotalStock(product) {
    return Object.values(product.sizes).reduce((acc, qty) => acc + Number(qty), 0);
}

// ==========================================================================
// DASHBOARD VIEW LOGIC
// ==========================================================================

function renderDashboard() {
    // 1. Calculate General Stat metrics
    let revenueSum = 0;
    let profitSum = 0;
    let salesCount = sales.length;
    let stockSum = 0;
    
    sales.forEach(sale => {
        revenueSum += sale.total;
        profitSum += sale.profit;
    });
    
    products.forEach(p => {
        stockSum += getProductTotalStock(p);
    });
    
    document.getElementById('card-revenue').textContent = formatCurrency(revenueSum);
    document.getElementById('card-profit').textContent = formatCurrency(profitSum);
    document.getElementById('card-sales-count').textContent = salesCount;
    document.getElementById('card-stock-count').textContent = stockSum;
    
    // 2. Render Low Stock Alerts list
    renderDashboardLowStockList();
    
    // 3. Render Revenue line chart
    renderDashboardRevenueChart();
}

function renderDashboardLowStockList() {
    const listEl = document.getElementById('low-stock-list');
    listEl.innerHTML = '';
    
    let lowStockItems = [];
    
    products.forEach(product => {
        // Collect size-specific alerts
        for (const size in product.sizes) {
            const qty = Number(product.sizes[size]);
            if (qty <= 1) { // 0 or 1 pair remaining
                lowStockItems.push({
                    name: product.name,
                    brand: product.brand,
                    size: size,
                    qty: qty
                });
            }
        }
    });
    
    if (lowStockItems.length === 0) {
        listEl.innerHTML = `
            <div class="empty-state">
                <i data-lucide="check-circle-2"></i>
                <p>Todos os calçados estão com estoque saudável!</p>
            </div>
        `;
        lucide.createIcons();
        return;
    }
    
    // Sort lowStockItems (critical 0 first, then 1)
    lowStockItems.sort((a, b) => a.qty - b.qty);
    
    // Take maximum 10 items for dashboard overview
    lowStockItems.slice(0, 10).forEach(item => {
        const warningItem = document.createElement('div');
        warningItem.className = 'warning-item';
        
        const badgeClass = item.qty === 0 ? 'warning-badge danger' : 'warning-badge';
        const badgeLabel = item.qty === 0 ? 'Sem estoque' : 'Apenas 1 par';
        
        warningItem.innerHTML = `
            <div class="warning-info">
                <span class="warning-name">${item.name} (${item.brand})</span>
                <span class="warning-details">Tamanho: ${item.size}</span>
            </div>
            <span class="${badgeClass}" style="${item.qty === 0 ? 'background-color: rgba(239, 68, 68, 0.15); color: #ef4444; border-color: rgba(239, 68, 68, 0.2);' : ''}">${badgeLabel}</span>
        `;
        listEl.appendChild(warningItem);
    });
}

function renderDashboardRevenueChart() {
    const ctx = document.getElementById('revenueChart').getContext('2d');
    
    if (revenueChartInstance) {
        revenueChartInstance.destroy();
    }
    
    // Group sales by day/date for the last 7 days
    const last7Days = [];
    const dateLabels = [];
    const revenueData = [];
    
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        last7Days.push(d.toDateString());
        // Date formatting dd/mm
        dateLabels.push(d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }));
        
        // Sum revenue on this date
        const daySales = sales.filter(s => new Date(s.date).toDateString() === d.toDateString());
        const totalRev = daySales.reduce((acc, s) => acc + s.total, 0);
        revenueData.push(totalRev);
    }
    
    revenueChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dateLabels,
            datasets: [{
                label: 'Faturamento diário (R$)',
                data: revenueData,
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.08)',
                fill: true,
                tension: 0.35,
                borderWidth: 3,
                pointBackgroundColor: '#10b981',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 7
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return ' Faturamento: ' + formatCurrency(context.parsed.y);
                        }
                    }
                }
            },
            scales: {
                y: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)'
                    },
                    ticks: {
                        color: '#64748b',
                        callback: function(value) {
                            return 'R$ ' + value;
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: '#64748b'
                    }
                }
            }
        }
    });
}

// ==========================================================================
// STOCK MANAGEMENT LOGIC (ESTOQUE)
// ==========================================================================

function renderStockTable() {
    const tbody = document.getElementById('stock-table-body');
    tbody.innerHTML = '';
    
    const searchQuery = document.getElementById('stock-search').value.toLowerCase();
    const categoryFilter = document.getElementById('stock-category-filter').value;
    
    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchQuery) ||
                              product.brand.toLowerCase().includes(searchQuery) ||
                              product.category.toLowerCase().includes(searchQuery) ||
                              (product.code && product.code.toLowerCase().includes(searchQuery));
        
        const matchesCategory = categoryFilter === '' || product.category === categoryFilter;
        
        return matchesSearch && matchesCategory;
    });
    
    if (filteredProducts.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 40px; color: var(--text-secondary);">
                    Nenhum calçado encontrado com os filtros selecionados.
                </td>
            </tr>
        `;
        return;
    }
    
    filteredProducts.forEach(product => {
        const tr = document.createElement('tr');
        
        // Product Column layout
        const prodCell = `
            <div class="product-info-cell">
                <span class="product-name-txt">${product.name}</span>
                <span class="product-brand-txt">Ref: ${product.code || 'S/C'} | ${product.brand}</span>
            </div>
        `;
        
        // Category Column
        const catCell = `<span class="badge-category">${product.category}</span>`;
        
        // Prices
        const costPriceFormatted = formatCurrency(product.costPrice);
        const salePriceFormatted = formatCurrency(product.salePrice);
        
        // Size Pill generation
        let sizesGrid = '<div class="table-sizes-grid">';
        for (const size in product.sizes) {
            const qty = Number(product.sizes[size]);
            let pillClass = 'size-pill';
            if (qty === 0) pillClass += ' out-of-stock';
            else if (qty <= 1) pillClass += ' low';
            else pillClass += ' ok';
            
            sizesGrid += `
                <div class="${pillClass}">
                    <span class="size-val">${size}</span>
                    <span class="size-qty">${qty}</span>
                </div>
            `;
        }
        sizesGrid += '</div>';
        
        // Sum total pairs
        const totalPairs = getProductTotalStock(product);
        
        // Action Buttons
        const actionButtons = `
            <div class="table-actions-container">
                <button class="btn-action add-stock" title="Ajuste Rápido de Estoque" onclick="openQuickStockModal('${product.id}')">
                    <i data-lucide="plus-circle"></i>
                </button>
                <button class="btn-action edit" title="Editar Calçado" onclick="openProductModal('${product.id}')">
                    <i data-lucide="edit-3"></i>
                </button>
                <button class="btn-action delete" title="Remover Calçado" onclick="deleteProduct('${product.id}')">
                    <i data-lucide="trash-2"></i>
                </button>
            </div>
        `;
        
        tr.innerHTML = `
            <td>${prodCell}</td>
            <td>${catCell}</td>
            <td>${costPriceFormatted}</td>
            <td>${salePriceFormatted}</td>
            <td>${sizesGrid}</td>
            <td><strong>${totalPairs}</strong></td>
            <td>${actionButtons}</td>
        `;
        
        tbody.appendChild(tr);
    });
    
    lucide.createIcons();
}

// --------------------------------------------------------------------------
// MODAL: ADD/EDIT SHOE
// --------------------------------------------------------------------------

function openProductModal(productId = null) {
    const modal = document.getElementById('product-modal');
    const form = document.getElementById('product-form');
    const modalTitle = document.getElementById('modal-title');
    
    form.reset();
    
    // Pre-set sizes inputs to zero
    document.querySelectorAll('.size-qty-input').forEach(input => input.value = 0);
    
    const presetSelect = document.getElementById('prod-type-preset');
    const customRow = document.getElementById('custom-category-row');
    
    if (productId) {
        modalTitle.textContent = 'Editar Produto';
        const product = products.find(p => p.id === productId);
        
        if (product) {
            document.getElementById('prod-id').value = product.id;
            document.getElementById('prod-code').value = product.code || '';
            document.getElementById('prod-name').value = product.name;
            document.getElementById('prod-brand').value = product.brand;
            document.getElementById('prod-category').value = product.category;
            
            const sizeType = product.sizeType || 'Calçados';
            document.getElementById('prod-size-type').value = sizeType;
            
            document.getElementById('prod-cost').value = product.costPrice;
            document.getElementById('prod-price').value = product.salePrice;
            
            // Deduce preset
            let preset = 'outro';
            if (product.category === 'Calçados' && sizeType === 'Calçados') preset = 'tenis';
            else if (product.category === 'Camisetas' && sizeType === 'Roupas') preset = 'camiseta';
            else if (product.category === 'Shorts / Calças' && sizeType === 'Roupas') preset = 'shorts';
            else if (product.category === 'Bolas' && sizeType === 'Único') preset = 'bolas';
            else if (product.category === 'Equipamentos / Outros' && sizeType === 'Único') {
                const nameLower = product.name.toLowerCase();
                if (nameLower.includes('meia') || nameLower.includes('meiao') || nameLower.includes('meião')) {
                    preset = 'meias';
                } else {
                    preset = 'luvas';
                }
            }
            presetSelect.value = preset;
            
            if (preset === 'outro') {
                customRow.style.display = 'flex';
            } else {
                customRow.style.display = 'none';
            }
            
            // Toggle form inputs display
            toggleSizeGradeInputs();
            
            // Populate sizes fields
            for (const size in product.sizes) {
                const input = document.getElementById(`size-${size}`);
                if (input) {
                    input.value = product.sizes[size];
                }
            }
        }
    } else {
        modalTitle.textContent = 'Cadastrar Produto';
        document.getElementById('prod-id').value = '';
        document.getElementById('prod-code').value = '';
        presetSelect.value = ''; // default empty option
        document.getElementById('prod-category').value = 'Calçados';
        document.getElementById('prod-size-type').value = 'Calçados';
        customRow.style.display = 'none';
        toggleSizeGradeInputs();
    }
    
    modal.classList.add('active');
}

function closeProductModal() {
    document.getElementById('product-modal').classList.remove('active');
}

function applyProductTypePreset() {
    const preset = document.getElementById('prod-type-preset').value;
    const categoryEl = document.getElementById('prod-category');
    const sizeTypeEl = document.getElementById('prod-size-type');
    const customRow = document.getElementById('custom-category-row');
    
    if (preset === 'tenis') {
        categoryEl.value = 'Calçados';
        sizeTypeEl.value = 'Calçados';
        customRow.style.display = 'none';
    } else if (preset === 'camiseta') {
        categoryEl.value = 'Camisetas';
        sizeTypeEl.value = 'Roupas';
        customRow.style.display = 'none';
    } else if (preset === 'shorts') {
        categoryEl.value = 'Shorts / Calças';
        sizeTypeEl.value = 'Roupas';
        customRow.style.display = 'none';
    } else if (preset === 'bolas') {
        categoryEl.value = 'Bolas';
        sizeTypeEl.value = 'Único';
        customRow.style.display = 'none';
    } else if (preset === 'meias') {
        categoryEl.value = 'Equipamentos / Outros';
        sizeTypeEl.value = 'Único';
        customRow.style.display = 'none';
    } else if (preset === 'luvas') {
        categoryEl.value = 'Equipamentos / Outros';
        sizeTypeEl.value = 'Único';
        customRow.style.display = 'none';
    } else if (preset === 'outro') {
        customRow.style.display = 'flex';
    }
    
    // Refresh size grid based on selected size type
    toggleSizeGradeInputs();
}

function toggleSizeGradeInputs() {
    const type = document.getElementById('prod-size-type').value;
    const shoesCont = document.getElementById('size-grade-shoes-container');
    const clothesCont = document.getElementById('size-grade-clothes-container');
    const uniqueCont = document.getElementById('size-grade-unique-container');
    
    if (shoesCont && clothesCont && uniqueCont) {
        shoesCont.style.display = 'none';
        clothesCont.style.display = 'none';
        uniqueCont.style.display = 'none';
        
        if (type === 'Calçados') {
            shoesCont.style.display = 'grid';
        } else if (type === 'Roupas') {
            clothesCont.style.display = 'grid';
        } else if (type === 'Único') {
            uniqueCont.style.display = 'grid';
        }
    }
}

function saveProduct(event) {
    event.preventDefault();
    
    const id = document.getElementById('prod-id').value;
    const code = document.getElementById('prod-code').value.toUpperCase().trim();
    const name = document.getElementById('prod-name').value;
    const brand = document.getElementById('prod-brand').value;
    const category = document.getElementById('prod-category').value;
    const sizeType = document.getElementById('prod-size-type').value;
    const costPrice = parseFloat(document.getElementById('prod-cost').value);
    const salePrice = parseFloat(document.getElementById('prod-price').value);
    
    // Assemble sizes object from grid inputs based on selected sizeType
    const sizes = {};
    if (sizeType === 'Calçados') {
        for (let s = 34; s <= 44; s++) {
            sizes[s] = parseInt(document.getElementById(`size-${s}`).value) || 0;
        }
    } else if (sizeType === 'Roupas') {
        const clothSizes = ['PP', 'P', 'M', 'G', 'GG', 'XG'];
        clothSizes.forEach(s => {
            sizes[s] = parseInt(document.getElementById(`size-${s}`).value) || 0;
        });
    } else if (sizeType === 'Único') {
        sizes['U'] = parseInt(document.getElementById('size-U').value) || 0;
    }
    
    if (id) {
        // Edit existing shoe
        const index = products.findIndex(p => p.id === id);
        if (index !== -1) {
            products[index] = { id, code, name, brand, category, sizeType, costPrice, salePrice, sizes };
        }
    } else {
        // Add new shoe
        const newProduct = {
            id: generateUID('prod'),
            code, name, brand, category, sizeType, costPrice, salePrice, sizes
        };
        products.push(newProduct);
    }
    
    saveProductsToStorage().then(() => {
        closeProductModal();
        renderStockTable();
    });
}

function deleteProduct(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    if (confirm(`Tem certeza de que deseja remover o calçado "${product.name}" do estoque?`)) {
        products = products.filter(p => p.id !== productId);
        saveProductsToStorage().then(() => {
            renderStockTable();
        });
    }
}

// --------------------------------------------------------------------------
// MODAL: QUICK STOCK ADJUSTMENT
// --------------------------------------------------------------------------

let activeQuickStockProductId = null;

function openQuickStockModal(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    activeQuickStockProductId = productId;
    
    document.getElementById('quick-stock-product-name').textContent = product.name;
    document.getElementById('quick-stock-product-brand').textContent = product.brand;
    
    // Fill Sizes dropdown
    const sizeSelect = document.getElementById('quick-stock-size');
    sizeSelect.innerHTML = '';
    
    for (const size in product.sizes) {
        const option = document.createElement('option');
        option.value = size;
        option.textContent = `Tamanho ${size}`;
        sizeSelect.appendChild(option);
    }
    
    // Trigger render for quantity values
    updateQuickStockCurrentQty();
    
    document.getElementById('quick-stock-modal').classList.add('active');
}

function closeQuickStockModal() {
    document.getElementById('quick-stock-modal').classList.remove('active');
    activeQuickStockProductId = null;
}

function updateQuickStockCurrentQty() {
    if (!activeQuickStockProductId) return;
    
    const product = products.find(p => p.id === activeQuickStockProductId);
    const size = document.getElementById('quick-stock-size').value;
    
    if (product && size) {
        const currentQty = product.sizes[size] || 0;
        document.getElementById('quick-stock-current').value = currentQty;
        document.getElementById('quick-stock-new').value = currentQty;
    }
}

function saveQuickStock() {
    if (!activeQuickStockProductId) return;
    
    const product = products.find(p => p.id === activeQuickStockProductId);
    const size = document.getElementById('quick-stock-size').value;
    const newQty = parseInt(document.getElementById('quick-stock-new').value);
    
    if (isNaN(newQty) || newQty < 0) {
        alert('Por favor, informe uma quantidade válida maior ou igual a 0.');
        return;
    }
    
    if (product && size) {
        product.sizes[size] = newQty;
        saveProductsToStorage().then(() => {
            closeQuickStockModal();
            renderStockTable();
        });
    }
}

// ==========================================================================
// SALES SIMULATOR (NOVA VENDA / PDV)
// ==========================================================================

// Global variable to keep track of selecting shoe size state
let selectedProductForSale = null;

function renderSalesGrid() {
    const grid = document.getElementById('sales-products-grid');
    grid.innerHTML = '';
    
    const searchQuery = document.getElementById('sale-product-search').value.toLowerCase();
    
    // Only display products with at least one size in stock
    const availableProducts = products.filter(product => {
        const totalQty = getProductTotalStock(product);
        const matchesSearch = product.name.toLowerCase().includes(searchQuery) ||
                              product.brand.toLowerCase().includes(searchQuery) ||
                              (product.code && product.code.toLowerCase().includes(searchQuery));
        return totalQty > 0 && matchesSearch;
    });
    
    if (availableProducts.length === 0) {
        grid.innerHTML = `
            <div class="empty-state" style="grid-column: span 12;">
                <i data-lucide="package-search"></i>
                <p>Nenhum calçado disponível com estoque no momento.</p>
            </div>
        `;
        lucide.createIcons();
        return;
    }
    
    availableProducts.forEach(product => {
        const card = document.createElement('div');
        card.className = 'sale-product-card';
        
        // Generate size button elements
        let sizeBtns = '';
        for (const size in product.sizes) {
            const qty = product.sizes[size];
            const disabledAttr = qty === 0 ? 'disabled' : '';
            const inCartItem = cart.find(item => item.productId === product.id && item.size === size);
            
            // Check if there is remaining stock when cart deductions are considered
            const cartQty = inCartItem ? inCartItem.quantity : 0;
            const remainingQty = qty - cartQty;
            const btnDisabled = remainingQty <= 0 ? 'disabled' : '';
            
            sizeBtns += `
                <button class="size-btn" ${btnDisabled} onclick="addToCart('${product.id}', '${size}')">
                    ${size}
                </button>
            `;
        }
        
        card.innerHTML = `
            <div class="sale-prod-info">
                <span class="sale-prod-brand">Ref: ${product.code || 'S/C'} | ${product.brand}</span>
                <h4 class="sale-prod-name">${product.name}</h4>
                <div class="sale-prod-price">${formatCurrency(product.salePrice)}</div>
            </div>
            <div class="sale-sizes-selector">
                <label>Selecionar Tamanho:</label>
                <div class="size-select-btn-grid">
                    ${sizeBtns}
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

function addToCart(productId, size) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    // Check if this size is already in the cart
    const existingIndex = cart.findIndex(item => item.productId === productId && item.size === size);
    
    // Verify stock availability
    const availableStock = product.sizes[size];
    
    if (existingIndex !== -1) {
        const currentInCart = cart[existingIndex].quantity;
        if (currentInCart < availableStock) {
            cart[existingIndex].quantity += 1;
        } else {
            alert(`Limite de estoque atingido! (${availableStock} pares disponíveis no tamanho ${size}).`);
            return;
        }
    } else {
        cart.push({
            productId: product.id,
            code: product.code || '',
            name: product.name,
            brand: product.brand,
            size: size,
            salePrice: product.salePrice,
            costPrice: product.costPrice,
            quantity: 1
        });
    }
    
    renderCart();
    renderSalesGrid(); // Redraw grid to update size button availability state
}

function renderCart() {
    const listEl = document.getElementById('cart-list');
    listEl.innerHTML = '';
    
    if (cart.length === 0) {
        listEl.innerHTML = `
            <div class="cart-empty">
                <i data-lucide="shopping-bag"></i>
                <p>Selecione um produto ao lado para iniciar a venda.</p>
            </div>
        `;
        document.getElementById('cart-count').textContent = 0;
        document.getElementById('btn-checkout').disabled = true;
        updateCartTotals();
        lucide.createIcons();
        return;
    }
    
    // Populate items
    cart.forEach((item, index) => {
        const cartItemEl = document.createElement('div');
        cartItemEl.className = 'cart-item';
        
        const subtotalItem = item.salePrice * item.quantity;
        
        cartItemEl.innerHTML = `
            <div class="cart-item-details">
                <span class="cart-item-name">${item.name}</span>
                <span class="cart-item-meta">Ref: ${item.code || 'S/C'} | Brand: ${item.brand} | Tam: <strong>${item.size}</strong></span>
            </div>
            
            <div class="cart-item-actions">
                <div class="cart-qty-control">
                    <button class="cart-qty-btn" onclick="adjustCartQty(${index}, -1)">-</button>
                    <span class="cart-qty-val">${item.quantity}</span>
                    <button class="cart-qty-btn" onclick="adjustCartQty(${index}, 1)">+</button>
                </div>
                <div class="cart-item-price">${formatCurrency(subtotalItem)}</div>
                <button class="btn-remove-cart" onclick="removeFromCart(${index})">
                    <i data-lucide="trash-2" style="width:16px; height:16px;"></i>
                </button>
            </div>
        `;
        listEl.appendChild(cartItemEl);
    });
    
    // Update Badge
    const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
    document.getElementById('cart-count').textContent = totalItems;
    document.getElementById('btn-checkout').disabled = false;
    
    updateCartTotals();
    lucide.createIcons();
}

function adjustCartQty(index, modifier) {
    const cartItem = cart[index];
    const product = products.find(p => p.id === cartItem.productId);
    
    if (!product) return;
    
    const newQty = cartItem.quantity + modifier;
    const availableStock = product.sizes[cartItem.size];
    
    if (newQty <= 0) {
        removeFromCart(index);
    } else if (newQty <= availableStock) {
        cartItem.quantity = newQty;
        renderCart();
        renderSalesGrid();
    } else {
        alert(`Limite de estoque atingido! (${availableStock} pares disponíveis no tamanho ${cartItem.size}).`);
    }
}

function removeFromCart(index) {
    cart.splice(index, 1);
    renderCart();
    renderSalesGrid();
}

function updateCartTotals() {
    const subtotal = cart.reduce((acc, item) => acc + (item.salePrice * item.quantity), 0);
    const discountEl = document.getElementById('cart-discount');
    let discount = parseFloat(discountEl.value) || 0;
    
    if (discount < 0) {
        discount = 0;
        discountEl.value = 0;
    }
    
    if (discount > subtotal) {
        discount = subtotal;
        discountEl.value = subtotal.toFixed(2);
    }
    
    const total = Math.max(0, subtotal - discount);
    
    document.getElementById('cart-subtotal').textContent = formatCurrency(subtotal);
    document.getElementById('cart-total').textContent = formatCurrency(total);
}

function checkoutSale() {
    if (cart.length === 0) return;
    
    // Totals calculations
    const subtotal = cart.reduce((acc, item) => acc + (item.salePrice * item.quantity), 0);
    const discount = parseFloat(document.getElementById('cart-discount').value) || 0;
    const total = Math.max(0, subtotal - discount);
    const paymentMethod = document.getElementById('cart-payment-method').value;
    
    // Profit and Deductions checks
    let costTotal = 0;
    
    // Deduct stock and double-check quantities
    for (const cartItem of cart) {
        const product = products.find(p => p.id === cartItem.productId);
        if (!product) continue;
        
        const availableStock = product.sizes[cartItem.size] || 0;
        if (availableStock < cartItem.quantity) {
            alert(`Erro na venda: O calçado "${cartItem.name}" no tamanho ${cartItem.size} não possui estoque suficiente.`);
            return;
        }
        
        // Deduct
        product.sizes[cartItem.size] -= cartItem.quantity;
        
        // Calculate cost base
        costTotal += (cartItem.costPrice * cartItem.quantity);
    }
    
    // Calculate fee
    const rate = paymentRates[paymentMethod] || 0;
    const fee = total * (rate / 100);
    
    // Total profit = total (price after discount) - total cost of shoes sold - fee
    const profit = Math.max(0, total - costTotal - fee);
    
    // Log new transaction
    const newSale = {
        id: generateUID('sale'),
        date: new Date().toISOString(),
        items: [...cart],
        discount: discount,
        total: total,
        paymentMethod: paymentMethod,
        fee: parseFloat(fee.toFixed(2)),
        profit: parseFloat(profit.toFixed(2))
    };
    
    // Save records
    sales.push(newSale);
    Promise.all([saveSalesToStorage(), saveProductsToStorage()]).then(() => {
        // Reset Cart
        cart = [];
        document.getElementById('cart-discount').value = 0;
        
        alert('Venda realizada com sucesso!');
        
        // Navigate back to Dashboard or refresh current PDV tab
        switchTab('dashboard');
    });
}

// ==========================================================================
// REPORTS & STATISTICS (RELATÓRIOS)
// ==========================================================================

function renderReports() {
    // 1. Top products sells rank table/chart
    renderTopProductsChart();
    
    // 2. Sales by shoe size chart
    renderSizeDistributionChart();
    
    // 3. Transactions history list
    renderSalesHistoryList();
    
    // 4. Detailed finance breakdown
    renderDetailedFinance();
    
    // 5. Pre-fill rates form
    loadRatesForm();
}

function loadRatesForm() {
    const pixInput = document.getElementById('fee-pix');
    const debitInput = document.getElementById('fee-debit');
    const creditInput = document.getElementById('fee-credit');
    const cashInput = document.getElementById('fee-cash');
    
    if (pixInput && debitInput && creditInput && cashInput) {
        pixInput.value = paymentRates["Pix"];
        debitInput.value = paymentRates["Cartão de Débito"];
        creditInput.value = paymentRates["Cartão de Crédito"];
        cashInput.value = paymentRates["Dinheiro"];
    }
}

function saveFeesConfig(event) {
    event.preventDefault();
    
    paymentRates["Pix"] = parseFloat(document.getElementById('fee-pix').value) || 0;
    paymentRates["Cartão de Débito"] = parseFloat(document.getElementById('fee-debit').value) || 0;
    paymentRates["Cartão de Crédito"] = parseFloat(document.getElementById('fee-credit').value) || 0;
    paymentRates["Dinheiro"] = parseFloat(document.getElementById('fee-cash').value) || 0;
    
    // Recalculate historical profits and fees in memory to maintain consistency
    sales = sales.map(sale => {
        const rate = paymentRates[sale.paymentMethod] || 0;
        const fee = sale.total * (rate / 100);
        
        let costPrice = 0;
        sale.items.forEach(item => {
            costPrice += (item.costPrice * item.quantity);
        });
        const profit = Math.max(0, sale.total - costPrice - fee);
        
        return {
            ...sale,
            fee: parseFloat(fee.toFixed(2)),
            profit: parseFloat(profit.toFixed(2))
        };
    });
    
    Promise.all([saveRatesToStorage(), saveSalesToStorage()]).then(() => {
        alert('Configurações de taxas salvas! O lucro e as despesas foram recalculados.');
        renderReports();
        renderDashboard();
    });
}

function renderDetailedFinance() {
    let totalSalesVal = 0;
    let totalDiscounts = 0;
    let totalFees = 0;
    let totalCosts = 0;
    
    sales.forEach(sale => {
        totalSalesVal += sale.total;
        totalDiscounts += sale.discount || 0;
        totalFees += sale.fee || 0;
        
        sale.items.forEach(item => {
            totalCosts += (item.costPrice * item.quantity);
        });
    });
    
    const netProfit = Math.max(0, totalSalesVal - totalCosts - totalFees);
    
    document.getElementById('fin-gross').textContent = formatCurrency(totalSalesVal);
    document.getElementById('fin-cost').textContent = formatCurrency(totalCosts);
    document.getElementById('fin-fees').textContent = formatCurrency(totalFees);
    document.getElementById('fin-discounts').textContent = formatCurrency(totalDiscounts);
    document.getElementById('fin-net').textContent = formatCurrency(netProfit);
}

function renderTopProductsChart() {
    const ctx = document.getElementById('topProductsChart').getContext('2d');
    
    if (topProductsChartInstance) {
        topProductsChartInstance.destroy();
    }
    
    // Map product sales metrics
    const sellsCountMap = {};
    
    sales.forEach(sale => {
        sale.items.forEach(item => {
            const key = `${item.productName} (${item.productBrand})`;
            sellsCountMap[key] = (sellsCountMap[key] || 0) + item.quantity;
        });
    });
    
    const sortedProducts = Object.keys(sellsCountMap).map(key => ({
        name: key,
        count: sellsCountMap[key]
    })).sort((a, b) => b.count - a.count).slice(0, 5); // top 5
    
    const labels = sortedProducts.map(p => p.name);
    const data = sortedProducts.map(p => p.count);
    
    // Handle empty state visual fallback
    if (data.length === 0) {
        labels.push('Nenhuma venda registrada');
        data.push(0);
    }
    
    topProductsChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Unidades Vendidas',
                data: data,
                backgroundColor: 'rgba(16, 185, 129, 0.75)',
                borderColor: '#10b981',
                borderWidth: 1,
                borderRadius: 4
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)'
                    },
                    ticks: {
                        color: '#64748b',
                        stepSize: 1
                    }
                },
                y: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: '#ffffff',
                        font: {
                            weight: '500'
                        }
                    }
                }
            }
        }
    });
}

function renderSizeDistributionChart() {
    const ctx = document.getElementById('sizeChart').getContext('2d');
    
    if (sizeChartInstance) {
        sizeChartInstance.destroy();
    }
    
    // Count units sold per size dynamically
    const sizeMap = {};
    
    sales.forEach(sale => {
        sale.items.forEach(item => {
            if (item.size) {
                sizeMap[item.size] = (sizeMap[item.size] || 0) + item.quantity;
            }
        });
    });
    
    // Sort keys logically (numbers first, then letters)
    const sortedSizeKeys = Object.keys(sizeMap).sort((a, b) => {
        const isNumA = !isNaN(a);
        const isNumB = !isNaN(b);
        if (isNumA && isNumB) return Number(a) - Number(b);
        if (isNumA && !isNumB) return -1;
        if (!isNumA && isNumB) return 1;
        // String sorting for PP, P, M, G, GG, XG, U
        const clothingOrder = { 'PP': 1, 'P': 2, 'M': 3, 'G': 4, 'GG': 5, 'XG': 6, 'U': 7 };
        return (clothingOrder[a] || 99) - (clothingOrder[b] || 99);
    });
    
    const labels = sortedSizeKeys.map(s => {
        if (!isNaN(s)) return `T${s}`;
        return s === 'U' ? 'Tamanho Único (U)' : s;
    });
    const data = sortedSizeKeys.map(s => sizeMap[s]);
    
    sizeChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Unidades Vendidas',
                data: data,
                backgroundColor: 'rgba(59, 130, 246, 0.75)',
                borderColor: '#3b82f6',
                borderWidth: 1,
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)'
                    },
                    ticks: {
                        color: '#64748b',
                        stepSize: 1
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: '#ffffff'
                    }
                }
            }
        }
    });
}

function renderSalesHistoryList() {
    const tbody = document.getElementById('sales-history-body');
    tbody.innerHTML = '';
    
    // Show newest first
    const sortedSales = [...sales].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    if (sortedSales.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 40px; color: var(--text-secondary);">
                    Nenhuma venda registrada no histórico.
                </td>
            </tr>
        `;
        return;
    }
    
    sortedSales.forEach(sale => {
        const tr = document.createElement('tr');
        
        // Date formatting
        const dateObj = new Date(sale.date);
        const formattedDate = dateObj.toLocaleDateString('pt-BR') + ' ' + dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        
        // Assemble items string summary
        const itemsSummary = sale.items.map(item => `${item.quantity}x ${item.name} (T${item.size})`).join(', ');
        
        // Discount BRL formatting
        const discValue = sale.discount > 0 ? formatCurrency(sale.discount) : '-';
        
        // Reverse sale actions
        const actionBtn = `
            <button class="btn-action delete" title="Estornar Venda (Devolver Estoque)" onclick="reverseSale('${sale.id}')">
                <i data-lucide="rotate-ccw"></i>
            </button>
        `;
        
        const feeValue = sale.fee > 0 ? formatCurrency(sale.fee) : 'R$ 0,00';
        
        tr.innerHTML = `
            <td>${formattedDate}</td>
            <td style="max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${itemsSummary}">${itemsSummary}</td>
            <td>
                <div style="display:flex; flex-direction:column;">
                    <span class="badge-category" style="margin-bottom:2px; text-align:center;">${sale.paymentMethod}</span>
                    <span style="font-size:0.75rem; color:var(--text-secondary); text-align:center;">Taxa: ${feeValue}</span>
                </div>
            </td>
            <td style="color: var(--danger);">${discValue}</td>
            <td><strong>${formatCurrency(sale.total)}</strong></td>
            <td style="color: var(--primary); font-weight: 600;">${formatCurrency(sale.profit)}</td>
            <td>${actionBtn}</td>
        `;
        
        tbody.appendChild(tr);
    });
    
    lucide.createIcons();
}

function reverseSale(saleId) {
    const sale = sales.find(s => s.id === saleId);
    if (!sale) return;
    
    if (confirm('Deseja realmente estornar esta venda? Os produtos correspondentes serão devolvidos ao estoque.')) {
        const password = prompt('Para autorizar o estorno da venda, digite a senha de gerente:');
        if (password === null) return; // cancelado pelo usuário
        if (password !== '1234') {
            alert('Senha incorreta! O estorno não foi autorizado.');
            return;
        }
        
        // Devuelve el stock a los calzados
        sale.items.forEach(saleItem => {
            const product = products.find(p => p.id === saleItem.productId);
            if (product) {
                // Return stock
                if (product.sizes[saleItem.size] !== undefined) {
                    product.sizes[saleItem.size] += saleItem.quantity;
                }
            }
        });
        
        // Remove sale from record
        sales = sales.filter(s => s.id !== saleId);
        
        Promise.all([saveSalesToStorage(), saveProductsToStorage()]).then(() => {
            // Re-render
            renderReports();
            alert('Venda estornada com sucesso e estoque devolvido.');
        });
    }
}

// ==========================================================================
// MODAL: REVENUE DETAILS (FATURAMENTO DETALHADO)
// ==========================================================================

function openRevenueDetailsModal() {
    const modal = document.getElementById('revenue-detail-modal');
    if (!modal) return;

    // 1. Calculate general numbers
    let grossSum = 0;
    let feesSum = 0;
    let discountSum = 0;
    let profitSum = 0;

    // Payment methods grouping map
    const paymentMethods = {
        "Pix": { count: 0, gross: 0, fees: 0, profit: 0 },
        "Cartão de Débito": { count: 0, gross: 0, fees: 0, profit: 0 },
        "Cartão de Crédito": { count: 0, gross: 0, fees: 0, profit: 0 },
        "Dinheiro": { count: 0, gross: 0, fees: 0, profit: 0 }
    };

    // Items sold grouping map (keyed by productId + '_' + size)
    const itemsSold = {};

    sales.forEach(sale => {
        grossSum += sale.total;
        feesSum += sale.fee || 0;
        discountSum += sale.discount || 0;
        profitSum += sale.profit || 0;

        // Group by payment method
        const method = sale.paymentMethod;
        if (paymentMethods[method]) {
            paymentMethods[method].count += 1;
            paymentMethods[method].gross += sale.total;
            paymentMethods[method].fees += sale.fee || 0;
            paymentMethods[method].profit += sale.profit || 0;
        }

        // Group by items
        sale.items.forEach(item => {
            const key = `${item.productId}_${item.size}`;
            if (!itemsSold[key]) {
                itemsSold[key] = {
                    code: item.code || 'S/C',
                    name: item.name,
                    brand: item.brand,
                    size: item.size,
                    quantity: 0,
                    salePrice: item.salePrice,
                    costPrice: item.costPrice || 0
                };
            }
            itemsSold[key].quantity += item.quantity;
        });
    });

    const expensesSum = feesSum + discountSum;

    // 2. Set general metrics
    document.getElementById('rev-modal-gross').textContent = formatCurrency(grossSum);
    document.getElementById('rev-modal-expenses').textContent = formatCurrency(expensesSum);
    document.getElementById('rev-modal-net').textContent = formatCurrency(profitSum);

    // 3. Render payment methods table
    const paymentBody = document.getElementById('rev-modal-payment-body');
    paymentBody.innerHTML = '';
    
    Object.keys(paymentMethods).forEach(method => {
        const data = paymentMethods[method];
        if (data.count > 0) {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${method}</strong></td>
                <td>${data.count}</td>
                <td>${formatCurrency(data.gross)}</td>
                <td style="color:var(--warning);">${formatCurrency(data.fees)}</td>
                <td style="color:var(--primary); font-weight:600;">${formatCurrency(data.profit)}</td>
            `;
            paymentBody.appendChild(tr);
        }
    });

    if (paymentBody.innerHTML === '') {
        paymentBody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--text-secondary); padding: 15px;">Nenhuma venda registrada.</td></tr>`;
    }

    // 4. Render items sold table
    const itemsBody = document.getElementById('rev-modal-items-body');
    itemsBody.innerHTML = '';

    // Sort items by quantity sold descending
    const sortedItems = Object.values(itemsSold).sort((a, b) => b.quantity - a.quantity);

    sortedItems.forEach(item => {
        const itemTotal = item.salePrice * item.quantity;
        const itemCostTotal = item.costPrice * item.quantity;
        
        // Approximate profit per item before card fees (just salePrice - costPrice)
        const unitProfit = item.salePrice - item.costPrice;
        const itemProfitTotal = itemTotal - itemCostTotal;

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><code>${item.code}</code></td>
            <td><strong>${item.name}</strong> <span style="font-size:0.75rem; color:var(--text-muted);">(${item.brand})</span></td>
            <td><span class="badge-category" style="padding:2px 6px;">${item.size}</span></td>
            <td><strong>${item.quantity}</strong></td>
            <td>${formatCurrency(item.salePrice)}</td>
            <td>${formatCurrency(itemTotal)}</td>
            <td style="color:var(--primary); font-weight:500;">${formatCurrency(unitProfit)} (${formatCurrency(itemProfitTotal)})</td>
        `;
        itemsBody.appendChild(tr);
    });

    if (itemsBody.innerHTML === '') {
        itemsBody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:var(--text-secondary); padding: 15px;">Nenhum item vendido.</td></tr>`;
    }

    modal.classList.add('active');
    
    // Create icons in case any new icons were rendered
    if (window.lucide) {
        lucide.createIcons();
    }
}

function closeRevenueDetailsModal() {
    const modal = document.getElementById('revenue-detail-modal');
    if (modal) modal.classList.remove('active');
}

// ==========================================================================
// MODAL: PROFIT DETAILS (LUCRO DETALHADO)
// ==========================================================================

function openProfitDetailsModal() {
    const modal = document.getElementById('profit-detail-modal');
    if (!modal) return;

    let grossSum = 0;
    let feesSum = 0;
    let costSum = 0;
    let profitSum = 0;

    const categoryProfit = {
        "Calçados": { qty: 0, gross: 0, cost: 0, profit: 0 },
        "Camisetas": { qty: 0, gross: 0, cost: 0, profit: 0 },
        "Shorts / Calças": { qty: 0, gross: 0, cost: 0, profit: 0 },
        "Bolas": { qty: 0, gross: 0, cost: 0, profit: 0 },
        "Equipamentos / Outros": { qty: 0, gross: 0, cost: 0, profit: 0 }
    };

    sales.forEach(sale => {
        grossSum += sale.total;
        feesSum += sale.fee || 0;
        profitSum += sale.profit || 0;

        sale.items.forEach(item => {
            const itemQty = item.quantity;
            const itemCost = (item.costPrice || 0) * itemQty;
            const itemGross = item.salePrice * itemQty;
            costSum += itemCost;

            // Find category
            let cat = 'Equipamentos / Outros';
            // Find category from products in case it varies
            const product = products.find(p => p.id === item.productId);
            if (product && categoryProfit[product.category]) {
                cat = product.category;
            } else {
                // Try guessing category based on brand or type
                if (item.productName.toLowerCase().includes('tênis') || item.productName.toLowerCase().includes('chuteira') || item.productName.toLowerCase().includes('sapatênis')) {
                    cat = 'Calçados';
                } else if (item.productName.toLowerCase().includes('camiseta') || item.productName.toLowerCase().includes('dry fit')) {
                    cat = 'Camisetas';
                } else if (item.productName.toLowerCase().includes('short') || item.productName.toLowerCase().includes('calça')) {
                    cat = 'Shorts / Calças';
                } else if (item.productName.toLowerCase().includes('bola')) {
                    cat = 'Bolas';
                }
            }

            categoryProfit[cat].qty += itemQty;
            categoryProfit[cat].gross += itemGross;
            categoryProfit[cat].cost += itemCost;
            categoryProfit[cat].profit += (itemGross - itemCost);
        });
    });

    const netRevenue = grossSum - feesSum;

    document.getElementById('prof-modal-net-rev').textContent = formatCurrency(netRevenue);
    document.getElementById('prof-modal-cost').textContent = formatCurrency(costSum);
    document.getElementById('prof-modal-net-profit').textContent = formatCurrency(profitSum);

    // Populate Category Table
    const catBody = document.getElementById('prof-modal-category-body');
    catBody.innerHTML = '';

    Object.keys(categoryProfit).forEach(cat => {
        const data = categoryProfit[cat];
        if (data.qty > 0) {
            const marginPct = data.gross > 0 ? ((data.profit / data.gross) * 100).toFixed(1) : '0.0';
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${cat}</strong></td>
                <td>${data.qty}</td>
                <td>${formatCurrency(data.gross)}</td>
                <td style="color:var(--warning);">${formatCurrency(data.cost)}</td>
                <td style="color:var(--primary); font-weight:600;">${formatCurrency(data.profit)}</td>
                <td><strong style="color:var(--primary);">${marginPct}%</strong></td>
            `;
            catBody.appendChild(tr);
        }
    });

    if (catBody.innerHTML === '') {
        catBody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--text-secondary); padding: 15px;">Nenhum lucro registrado.</td></tr>`;
    }

    // Populate Highest Unit Margin Products Table
    const rankBody = document.getElementById('prof-modal-rank-body');
    rankBody.innerHTML = '';

    // Calculate margins for all products
    const productMargins = products.map(p => {
        const cost = p.costPrice || 0;
        const sale = p.salePrice || 0;
        const diff = sale - cost;
        const diffPct = sale > 0 ? ((diff / sale) * 100).toFixed(1) : '0.0';
        return {
            code: p.code || 'S/C',
            name: p.name,
            brand: p.brand,
            cost: cost,
            sale: sale,
            marginBrl: diff,
            marginPct: diffPct
        };
    }).sort((a, b) => b.marginBrl - a.marginBrl).slice(0, 10); // top 10

    productMargins.forEach(item => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><code>${item.code}</code></td>
            <td><strong>${item.name}</strong> <span style="font-size:0.75rem; color:var(--text-muted);">(${item.brand})</span></td>
            <td>${formatCurrency(item.cost)}</td>
            <td>${formatCurrency(item.sale)}</td>
            <td style="color:var(--primary); font-weight:600;">+${formatCurrency(item.marginBrl)}</td>
            <td><strong style="color:var(--primary);">${item.marginPct}%</strong></td>
        `;
        rankBody.appendChild(tr);
    });

    if (rankBody.innerHTML === '') {
        rankBody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--text-secondary); padding: 15px;">Nenhum produto cadastrado no estoque.</td></tr>`;
    }

    modal.classList.add('active');
}

function closeProfitDetailsModal() {
    const modal = document.getElementById('profit-detail-modal');
    if (modal) modal.classList.remove('active');
}

// ==========================================================================
// MODAL: SALES DETAILS (VENDAS DETALHADAS)
// ==========================================================================

function openSalesCountDetailsModal() {
    const modal = document.getElementById('sales-count-detail-modal');
    if (!modal) return;

    const count = sales.length;
    let revenueSum = 0;
    let itemsQtySum = 0;

    sales.forEach(sale => {
        revenueSum += sale.total;
        sale.items.forEach(item => {
            itemsQtySum += item.quantity;
        });
    });

    const ticket = count > 0 ? (revenueSum / count) : 0;

    document.getElementById('sales-modal-count').textContent = count;
    document.getElementById('sales-modal-ticket').textContent = formatCurrency(ticket);
    document.getElementById('sales-modal-items-total').textContent = itemsQtySum;

    // Populate Sales History log
    const historyBody = document.getElementById('sales-modal-history-body');
    historyBody.innerHTML = '';

    // Show newest first
    const sortedSales = [...sales].sort((a, b) => new Date(b.date) - new Date(a.date));

    sortedSales.forEach(sale => {
        const dateObj = new Date(sale.date);
        const formattedDate = dateObj.toLocaleDateString('pt-BR') + ' ' + dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        const itemsSummary = sale.items.map(item => `${item.quantity}x ${item.name} (${item.size})`).join(', ');

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${formattedDate}</td>
            <td><code>${sale.id}</code></td>
            <td style="max-width: 320px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${itemsSummary}">${itemsSummary}</td>
            <td><span class="badge-category">${sale.paymentMethod}</span></td>
            <td><strong>${formatCurrency(sale.total)}</strong></td>
        `;
        historyBody.appendChild(tr);
    });

    if (historyBody.innerHTML === '') {
        historyBody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--text-secondary); padding: 15px;">Nenhuma transação efetuada no histórico.</td></tr>`;
    }

    modal.classList.add('active');
}

function closeSalesCountDetailsModal() {
    const modal = document.getElementById('sales-count-detail-modal');
    if (modal) modal.classList.remove('active');
}

// ==========================================================================
// MODAL: STOCK DETAILS (ESTOQUE DETALHADO)
// ==========================================================================

function openStockCountDetailsModal() {
    const modal = document.getElementById('stock-count-detail-modal');
    if (!modal) return;

    let totalQty = 0;
    let costValuation = 0;
    let saleValuation = 0;

    const categoryStock = {
        "Calçados": { models: 0, qty: 0, costVal: 0, saleVal: 0 },
        "Camisetas": { models: 0, qty: 0, costVal: 0, saleVal: 0 },
        "Shorts / Calças": { models: 0, qty: 0, costVal: 0, saleVal: 0 },
        "Bolas": { models: 0, qty: 0, costVal: 0, saleVal: 0 },
        "Equipamentos / Outros": { models: 0, qty: 0, costVal: 0, saleVal: 0 }
    };

    const criticalItems = [];

    products.forEach(p => {
        const prodQty = getProductTotalStock(p);
        totalQty += prodQty;
        costValuation += (p.costPrice || 0) * prodQty;
        saleValuation += (p.salePrice || 0) * prodQty;

        // Group by category
        const cat = p.category || 'Equipamentos / Outros';
        if (categoryStock[cat]) {
            categoryStock[cat].models += 1;
            categoryStock[cat].qty += prodQty;
            categoryStock[cat].costVal += (p.costPrice || 0) * prodQty;
            categoryStock[cat].saleVal += (p.salePrice || 0) * prodQty;
        }

        // Collect critical alerts
        for (const size in p.sizes) {
            const qty = Number(p.sizes[size]);
            if (qty <= 1) {
                criticalItems.push({
                    id: p.id,
                    code: p.code || 'S/C',
                    name: p.name,
                    brand: p.brand,
                    size: size,
                    qty: qty
                });
            }
        }
    });

    document.getElementById('stock-modal-qty').textContent = totalQty;
    document.getElementById('stock-modal-cost-valuation').textContent = formatCurrency(costValuation);
    document.getElementById('stock-modal-sale-valuation').textContent = formatCurrency(saleValuation);

    // Populate Category Table
    const catBody = document.getElementById('stock-modal-category-body');
    catBody.innerHTML = '';

    Object.keys(categoryStock).forEach(cat => {
        const data = categoryStock[cat];
        if (data.models > 0 || data.qty > 0) {
            const potentialProfit = data.saleVal - data.costVal;
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${cat}</strong></td>
                <td>${data.models}</td>
                <td><strong>${data.qty}</strong></td>
                <td style="color:var(--warning);">${formatCurrency(data.costVal)}</td>
                <td>${formatCurrency(data.saleVal)}</td>
                <td style="color:var(--primary); font-weight:600;">${formatCurrency(potentialProfit)}</td>
            `;
            catBody.appendChild(tr);
        }
    });

    if (catBody.innerHTML === '') {
        catBody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--text-secondary); padding: 15px;">Nenhum produto em estoque.</td></tr>`;
    }

    // Populate Critical Alert Table
    const criticalBody = document.getElementById('stock-modal-critical-body');
    criticalBody.innerHTML = '';

    // Sort critical items (0 first)
    criticalItems.sort((a, b) => a.qty - b.qty);

    criticalItems.forEach(item => {
        const badgeColor = item.qty === 0 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)';
        const textColor = item.qty === 0 ? '#ef4444' : '#f59e0b';
        const badgeLabel = item.qty === 0 ? 'Sem estoque' : 'Apenas 1 un.';

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><code>${item.code}</code></td>
            <td><strong>${item.name}</strong> <span style="font-size:0.75rem; color:var(--text-muted);">(${item.brand})</span></td>
            <td><span class="badge-category" style="padding:2px 6px;">${item.size}</span></td>
            <td><span class="warning-badge" style="background-color:${badgeColor}; color:${textColor}; font-size:0.75rem;">${badgeLabel}</span></td>
            <td>
                <button class="btn btn-outline" style="padding:4px 8px; font-size:0.75rem;" onclick="closeAllModals(); openQuickStockModal('${item.id}')">
                    Ajustar
                </button>
            </td>
        `;
        criticalBody.appendChild(tr);
    });

    if (criticalBody.innerHTML === '') {
        criticalBody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--text-secondary); padding: 15px;">Nenhum alerta de estoque crítico.</td></tr>`;
    }

    modal.classList.add('active');
}

function closeStockCountDetailsModal() {
    const modal = document.getElementById('stock-count-detail-modal');
    if (modal) modal.classList.remove('active');
}

function closeSalesCountDetailsModal() {
    const modal = document.getElementById('sales-count-detail-modal');
    if (modal) modal.classList.remove('active');
}

function closeAllModals() {
    document.querySelectorAll('.modal-overlay').forEach(modal => {
        modal.classList.remove('active');
    });
}
