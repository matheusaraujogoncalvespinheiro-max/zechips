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
let adminMenuFilter = 'Todos';
let caixaCart = [];
let adminPayMethod = 'Pix';
let adminCurrentTotal = 0;

function showAdminView(view) {
    const ordersView = document.getElementById('admin-orders-view');
    const menuView = document.getElementById('admin-menu-view');
    const caixaView = document.getElementById('admin-caixa-view');
    const btns = document.querySelectorAll('.nav-links > .nav-btn');
    
    btns.forEach(b => b.classList.remove('active'));
    // Highlight the main nav btn
    const mainBtns = document.querySelectorAll('header .nav-btn');
    mainBtns.forEach(b => {
        if(b.innerText.toLowerCase().includes(view)) b.classList.add('active');
        else b.classList.remove('active');
    });

    ordersView.style.display = view === 'orders' ? 'block' : 'none';
    menuView.style.display = view === 'menu-mgmt' ? 'block' : 'none';
    caixaView.style.display = view === 'caixa' ? 'block' : 'none';

    if (view === 'orders') renderAdminOrders();
    if (view === 'menu-mgmt') renderAdminMenu();
    if (view === 'caixa') renderCaixaMenu();
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
        'Todos': 'btn-admin-cat-todos',
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

function deleteProduct(id) {
    if (confirm("Deseja realmente excluir este produto?")) {
        let menu = getMenu();
        menu = menu.filter(m => m.id !== id);
        saveMenu(menu);
        renderAdminMenu();
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
