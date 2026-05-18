// --- Admin Logic for Ze Chips ---

document.addEventListener('DOMContentLoaded', () => {
    renderAdminOrders();
    updateStats();
    renderAdminMenu();
    
    // Listen for storage changes
    window.addEventListener('storage', () => {
        renderAdminOrders();
        updateStats();
        renderAdminMenu();
    });
});

let currentOrderFilter = 'active';
let adminMenuFilter = 'Porções';
let caixaCart = [];
let adminPayMethod = 'Pix';
let adminCurrentTotal = 0;

function showAdminView(view) {
    const ordersView = document.getElementById('admin-orders-view');
    const menuView = document.getElementById('admin-menu-view');
    const caixaView = document.getElementById('admin-caixa-view');
    const financeView = document.getElementById('admin-finance-view');

    ordersView.style.display = 'none';
    menuView.style.display = 'none';
    caixaView.style.display = 'none';
    if(financeView) financeView.style.display = 'none';

    const btns = document.querySelectorAll('.nav-btn');
    btns.forEach(b => b.classList.remove('active'));

    if (view === 'orders') {
        ordersView.style.display = 'block';
        btns[0].classList.add('active');
        renderAdminOrders();
    } else if (view === 'caixa') {
        caixaView.style.display = 'block';
        btns[1].classList.add('active');
        renderCaixaMenu();
        updateCaixaCart();
    } else if (view === 'finance') {
        if(financeView) financeView.style.display = 'block';
        btns[2].classList.add('active');
        renderFinance();
    } else if (view === 'menu-mgmt') {
        menuView.style.display = 'block';
        btns[3].classList.add('active');
        renderAdminMenu();
    }
}

function setOrderFilter(filter) {
    currentOrderFilter = filter;
    document.getElementById('btn-filter-active').classList.toggle('active', filter === 'active');
    document.getElementById('btn-filter-history').classList.toggle('active', filter === 'history');
    renderAdminOrders();
}

// --- Order Management ---
function renderAdminOrders() {
    const container = document.getElementById('admin-orders-body');
    const orders = getOrders();
    
    let filteredOrders = [...orders].sort((a, b) => b.timestamp - a.timestamp);
    
    if (currentOrderFilter === 'active') {
        filteredOrders = filteredOrders.filter(o => o.status !== 'Entregue');
    } else {
        filteredOrders = filteredOrders.filter(o => o.status === 'Entregue');
    }

    if (filteredOrders.length === 0) {
        container.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 2rem; color: var(--text-muted);">Nenhum pedido ${currentOrderFilter === 'active' ? 'ativo' : 'no histórico'}.</td></tr>`;
        return;
    }

    container.innerHTML = filteredOrders.map(order => `
        <tr style="animation: slideIn 0.3s ease-out forwards;">
            <td style="color: var(--primary); font-weight: 700;">${order.code}</td>
            <td>
                <div style="font-weight: 700;">${order.customer}</div>
                <div style="font-size: 0.7rem; color: var(--text-muted);">${order.location} | ${order.table}</div>
            </td>
            <td style="font-size: 0.8rem;">
                ${order.items.map(i => `${i.qty}x ${i.name}`).join(', ')}
                <div style="font-weight: 800; color: var(--text-main); margin-top: 0.3rem;">Total: R$ ${order.total.toFixed(2).replace('.', ',')}</div>
            </td>
            <td>
                <div style="font-weight: 600;">${order.payment}</div>
                ${order.change ? `<div style="font-size: 0.7rem; color: #ff9800;">Troco p/ R$ ${parseFloat(order.change).toFixed(2).replace('.', ',')}</div>` : ''}
            </td>
            <td><span class="status-badge status-${order.status.toLowerCase()}">${order.status}</span></td>
            <td>
                ${order.status !== 'Entregue' ? `
                    <button class="action-btn" style="background: #ff9800;" onclick="updateStatus('${order.code}', 'Preparando')">Prep</button>
                    <button class="action-btn" style="background: #4caf50;" onclick="updateStatus('${order.code}', 'Pronto')">Pronto</button>
                    <button class="action-btn" style="background: #2196f3;" onclick="updateStatus('${order.code}', 'Entregue')">Entregar</button>
                ` : `<span style="color: var(--text-muted); font-size: 0.8rem;">Concluído</span>`}
                
                ${order.phone ? `
                    <button class="action-btn" style="background: #25D366; margin-top: 0.5rem; width: 100%; display: flex; align-items: center; justify-content: center; gap: 5px;" onclick="sendWhatsApp('${order.code}')">
                        <span style="font-size: 1.1rem;">💬</span> WhatsApp
                    </button>
                ` : ''}
            </td>
        </tr>
    `).join('');
}

function updateStatus(code, newStatus) {
    const orders = getOrders();
    const order = orders.find(o => o.code === code);
    if (order) {
        order.status = newStatus;
        saveOrders(orders);
        renderAdminOrders();
        updateStats();
    }
}

function sendWhatsApp(code) {
    const orders = getOrders();
    const order = orders.find(o => o.code === code);
    if (!order || !order.phone) return alert("Pedido ou telefone não encontrado!");

    const itemsList = order.items.map(i => `${i.qty}x ${i.name}`).join(', ');
    const message = `Olá *${order.customer}*! Seu pedido *${order.code}* no Ze Chips já está **PRONTO**! ✅\n\n📦 *Detalhes:* ${itemsList}\n💰 *Total:* R$ ${order.total.toFixed(2).replace('.', ',')}\n\nPode vir retirar ou aguardar a entrega!`;
    
    // Clean phone number (keep only digits)
    const cleanPhone = order.phone.replace(/\D/g, '');
    const finalPhone = cleanPhone.length <= 11 ? '55' + cleanPhone : cleanPhone;
    
    const waUrl = `https://wa.me/${finalPhone}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
}

function updateStats() {
    const orders = getOrders();
    const totalEl = document.getElementById('total-orders');
    const pendingEl = document.getElementById('pending-orders');
    const readyEl = document.getElementById('ready-orders');

    if (totalEl) totalEl.innerText = orders.length;
    if (pendingEl) pendingEl.innerText = orders.filter(o => o.status === 'Preparando').length;
    if (readyEl) readyEl.innerText = orders.filter(o => o.status === 'Pronto').length;
}

function clearAllOrders() {
    if(confirm("Deseja realmente limpar todo o histórico de pedidos?")) {
        localStorage.removeItem('ze_chips_orders');
        window.dispatchEvent(new Event('storage'));
    }
}

function setAdminMenuFilter(cat) {
    adminMenuFilter = cat;
    const btns = document.querySelectorAll('[id^="btn-admin-cat-"]');
    btns.forEach(b => b.classList.remove('active'));
    
    const activeBtn = {
        'Porções': 'btn-admin-cat-porcoes',
        'Bebidas': 'btn-admin-cat-bebidas',
        'Guloseimas': 'btn-admin-cat-guloseimas'
    }[cat];
    
    document.getElementById(activeBtn).classList.add('active');
    renderAdminMenu();
}

// --- Menu Management ---
function renderAdminMenu() {
    const container = document.getElementById('admin-menu-list');
    const menu = getMenu();
    
    let filteredMenu = [...menu];
    if (adminMenuFilter !== 'Todos') {
        filteredMenu = filteredMenu.filter(item => item.category === adminMenuFilter);
    }
    
    container.innerHTML = filteredMenu.map(item => `
        <div class="food-card" style="opacity: ${item.active !== false ? '1' : '0.5'}">
            <img src="${item.img}" alt="${item.name}" class="food-img" style="filter: ${item.active !== false ? 'none' : 'grayscale(100%)'}">
            <div class="food-content">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                    <div>
                        <div style="font-size: 0.6rem; color: var(--primary); text-transform: uppercase; font-weight: 800;">${item.category || 'Sem Cat.'}</div>
                        <h3 class="food-title" style="margin-bottom: 0;">${item.name}</h3>
                    </div>
                    <span class="status-badge" style="background: ${item.active !== false ? 'rgba(76, 175, 80, 0.2)' : 'rgba(255, 255, 255, 0.1)'}; color: ${item.active !== false ? '#4caf50' : '#fff'}; font-size: 0.6rem;">
                        ${item.active !== false ? 'ATIVO' : 'DESATIVADO'}
                    </span>
                </div>
                <p class="food-desc">${item.desc}</p>
                <div class="food-footer">
                    <span class="price">R$ ${item.price.toFixed(2).replace('.', ',')}</span>
                    <div>
                        <button class="action-btn" style="background: #2196f3;" onclick="openProductModal(${item.id})">Editar</button>
                        <button class="action-btn" style="background: var(--accent-red);" onclick="deleteProduct(${item.id})">Excluir</button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

function openProductModal(id = null) {
    const modal = document.getElementById('product-modal');
    const title = document.getElementById('modal-title');
    
    if (id) {
        const menu = getMenu();
        const item = menu.find(m => m.id === id);
        title.innerText = "Editar Produto";
        document.getElementById('edit-id').value = id;
        document.getElementById('prod-name').value = item.name;
        document.getElementById('prod-category').value = item.category || "Porções";
        document.getElementById('prod-desc').value = item.desc;
        document.getElementById('prod-price').value = item.price;
        document.getElementById('prod-img').value = item.img;
        document.getElementById('prod-active').checked = item.active !== false;
    } else {
        title.innerText = "Novo Produto";
        document.getElementById('edit-id').value = "";
        document.getElementById('prod-name').value = "";
        document.getElementById('prod-category').value = "Porções";
        document.getElementById('prod-desc').value = "";
        document.getElementById('prod-price').value = "";
        document.getElementById('prod-img').value = "";
        document.getElementById('prod-active').checked = true;
    }
    
    modal.style.right = "0";
}

function closeProductModal() {
    document.getElementById('product-modal').style.right = "-450px";
}

function saveProduct() {
    const id = document.getElementById('edit-id').value;
    const name = document.getElementById('prod-name').value;
    const category = document.getElementById('prod-category').value;
    const desc = document.getElementById('prod-desc').value;
    const price = parseFloat(document.getElementById('prod-price').value);
    const img = document.getElementById('prod-img').value || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800";
    const active = document.getElementById('prod-active').checked;

    if (!name || !price) return alert("Nome e preço são obrigatórios!");

    let menu = getMenu();
    
    if (id) {
        const index = menu.findIndex(m => m.id == id);
        menu[index] = { id: parseInt(id), name, category, desc, price, img, active };
    } else {
        const newId = menu.length > 0 ? Math.max(...menu.map(m => m.id)) + 1 : 1;
        menu.push({ id: newId, name, category, desc, price, img, active });
    }

    saveMenu(menu);
    closeProductModal();
    renderAdminMenu();
}

function deleteMenuProduct(id) {
    if(confirm('Tem certeza que deseja remover este produto?')) {
        let menu = getMenu();
        menu = menu.filter(p => p.id !== id);
        saveMenu(menu);
        renderAdminMenu();
    }
}

// --- Financeiro (Relatório) ---
function renderFinance() {
    const orders = getOrders();
    const expenses = getExpenses();
    const tbody = document.getElementById('finance-history-body');

    // Filter only "Entregue" (completed) orders as Income
    const incomeOrders = orders.filter(o => o.status === 'Entregue' || o.status === 'Pronto' || o.payment === 'Pix'); // Considering paid/delivered
    
    // Create unified transaction list
    const transactions = [];
    
    incomeOrders.forEach(o => {
        transactions.push({
            id: o.code,
            date: o.timestamp,
            type: 'in',
            desc: `Venda Pedido ${o.code}`,
            value: o.total
        });
    });

    expenses.forEach(e => {
        transactions.push({
            id: e.id,
            date: e.timestamp,
            type: 'out',
            desc: e.desc,
            value: e.value
        });
    });

    // Sort by newest first
    transactions.sort((a, b) => b.date - a.date);

    // Calculate totals
    const totalIn = transactions.filter(t => t.type === 'in').reduce((acc, t) => acc + t.value, 0);
    const totalOut = transactions.filter(t => t.type === 'out').reduce((acc, t) => acc + t.value, 0);
    const balance = totalIn - totalOut;

    // Update UI
    document.getElementById('finance-total-in').innerText = `R$ ${totalIn.toFixed(2).replace('.', ',')}`;
    document.getElementById('finance-total-out').innerText = `R$ ${totalOut.toFixed(2).replace('.', ',')}`;
    
    const balanceEl = document.getElementById('finance-balance');
    balanceEl.innerText = `R$ ${balance.toFixed(2).replace('.', ',')}`;
    balanceEl.style.color = balance >= 0 ? '#4caf50' : 'var(--accent-red)';

    if (transactions.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">Nenhuma transação registrada.</td></tr>`;
        return;
    }

    tbody.innerHTML = transactions.map(t => `
        <tr>
            <td>${new Date(t.date).toLocaleString('pt-BR')}</td>
            <td>
                ${t.type === 'in' 
                    ? `<span class="status-badge" style="background: rgba(76, 175, 80, 0.2); color: #4caf50;">Entrada</span>` 
                    : `<span class="status-badge" style="background: rgba(244, 67, 54, 0.2); color: var(--accent-red);">Saída</span>`}
            </td>
            <td>${t.desc}</td>
            <td style="font-weight: bold; color: ${t.type === 'in' ? '#4caf50' : 'var(--accent-red)'}">
                ${t.type === 'in' ? '+' : '-'} R$ ${t.value.toFixed(2).replace('.', ',')}
            </td>
            <td>
                ${t.type === 'out' 
                    ? `<button class="action-btn" style="background: var(--accent-red);" onclick="deleteExpense('${t.id}')">Excluir</button>` 
                    : '-'}
            </td>
        </tr>
    `).join('');
}

function addExpense() {
    const desc = document.getElementById('expense-desc').value;
    const val = parseFloat(document.getElementById('expense-val').value);

    if (!desc || isNaN(val) || val <= 0) {
        alert("Preencha a descrição e um valor válido maior que zero.");
        return;
    }

    const expenses = getExpenses();
    expenses.push({
        id: 'exp_' + Date.now(),
        desc: desc,
        value: val,
        timestamp: Date.now()
    });

    saveExpenses(expenses);
    
    // Clear inputs
    document.getElementById('expense-desc').value = '';
    document.getElementById('expense-val').value = '';
    
    renderFinance();
}

function deleteExpense(id) {
    if(confirm("Tem certeza que deseja excluir esta despesa?")) {
        let expenses = getExpenses();
        expenses = expenses.filter(e => e.id !== id);
        saveExpenses(expenses);
        renderFinance();
    }
}

// --- Caixa Rápido Logic ---
function renderCaixaMenu() {
    const container = document.getElementById('caixa-menu-list');
    const search = document.getElementById('caixa-search').value.toLowerCase();
    const menu = getMenu().filter(item => item.active !== false);
    
    const filtered = menu.filter(item => 
        item.name.toLowerCase().includes(search) || 
        item.category.toLowerCase().includes(search)
    );

    container.innerHTML = filtered.map(item => `
        <div class="food-card" onclick="addToCaixa(${item.id})" style="cursor: pointer; padding: 1rem;">
            <div style="font-weight: 800; font-size: 0.9rem;">${item.name}</div>
            <div style="color: var(--primary); font-weight: 800;">R$ ${item.price.toFixed(2).replace('.', ',')}</div>
        </div>
    `).join('');
}

function addToCaixa(id) {
    const menu = getMenu();
    const item = menu.find(m => m.id === id);
    const inCart = caixaCart.find(c => c.id === id);
    
    if (inCart) inCart.qty++;
    else caixaCart.push({ ...item, qty: 1 });
    
    renderCaixaCart();
}

function renderCaixaCart() {
    const container = document.getElementById('caixa-cart-items');
    const totalEl = document.getElementById('caixa-total');
    
    let total = 0;
    container.innerHTML = caixaCart.map(item => {
        total += item.price * item.qty;
        return `
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.8rem; font-size: 0.9rem;">
                <span>${item.qty}x ${item.name}</span>
                <span>R$ ${(item.price * item.qty).toFixed(2).replace('.', ',')}</span>
                <button onclick="removeFromCaixa(${item.id})" style="background: none; border: none; color: var(--accent-red); cursor: pointer;">✕</button>
            </div>
        `;
    }).join('');
    
    adminCurrentTotal = total;
    totalEl.innerText = `R$ ${total.toFixed(2).replace('.', ',')}`;
}

function removeFromCaixa(id) {
    caixaCart = caixaCart.filter(c => c.id !== id);
    renderCaixaCart();
}

// --- Admin Payment Logic ---
function openAdminPayment() {
    if (caixaCart.length === 0) return alert("Adicione produtos ao caixa!");
    
    document.getElementById('admin-pay-amount').innerText = `R$ ${adminCurrentTotal.toFixed(2).replace('.', ',')}`;
    document.getElementById('payment-modal-admin').style.right = "0";
    setAdminPayMethod('Pix', document.querySelector('#payment-modal-admin .nav-btn'));
}

function closeAdminPayment() {
    document.getElementById('payment-modal-admin').style.right = "-500px";
}

function setAdminPayMethod(method, btn) {
    adminPayMethod = method;
    const btns = document.querySelectorAll('#payment-modal-admin .nav-btn');
    btns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    document.getElementById('admin-change-area').style.display = method === 'Dinheiro' ? 'block' : 'none';
}

function calcAdminChange() {
    const received = parseFloat(document.getElementById('admin-cash-received').value) || 0;
    const change = received - adminCurrentTotal;
    document.getElementById('admin-change-val').innerText = `R$ ${Math.max(0, change).toFixed(2).replace('.', ',')}`;
}

function confirmAdminSale() {
    // Create an order for history
    const orderCode = '#CAIXA-' + Math.random().toString(36).substring(2, 5).toUpperCase();
    const orders = getOrders();
    
    const newOrder = {
        code: orderCode,
        customer: "Caixa Rápido",
        payment: adminPayMethod,
        items: [...caixaCart],
        status: 'Entregue', // Sale completed
        timestamp: new Date().getTime()
    };
    
    orders.push(newOrder);
    saveOrders(orders);
    
    alert("Venda realizada com sucesso!");
    caixaCart = [];
    renderCaixaCart();
    closeAdminPayment();
}
