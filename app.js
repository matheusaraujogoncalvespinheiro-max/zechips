// --- Client Logic for Ze Chips ---

let cart = [];
let myOrderCodes = JSON.parse(localStorage.getItem('ze_chips_my_codes')) || [];

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    renderMenu();
    updateCartCount();
    
    // Listen for storage changes (updates from admin)
    window.addEventListener('storage', () => {
        renderMyOrders();
        // If we are currently tracking, refresh the status
        const codeInput = document.getElementById('track-code-input');
        if(codeInput && document.getElementById('track-display-area').style.display === 'block') {
            trackOrder(codeInput.value);
        }
    });
});

// --- View Navigation ---
function showView(viewId) {
    const views = document.querySelectorAll('.view');
    views.forEach(v => v.classList.remove('active'));
    document.getElementById(`view-${viewId}`).classList.add('active');

    // Desktop Nav
    const desktopBtns = document.querySelectorAll('header .nav-btn');
    desktopBtns.forEach(b => b.classList.remove('active'));
    
    // Mobile Nav
    const mobileBtns = document.querySelectorAll('.mobile-nav-btn');
    mobileBtns.forEach(b => b.classList.remove('active'));

    const activeMobileBtn = document.getElementById(`m-btn-${viewId}`);
    if (activeMobileBtn) activeMobileBtn.classList.add('active');

    window.scrollTo({ top: 0, behavior: 'smooth' });

    if(viewId === 'menu') renderMenu();
    if(viewId === 'my-orders') renderMyOrders();
}

let currentCategory = 'Porções';

// --- Menu Functions ---
function renderMenu() {
    const container = document.getElementById('menu-container');
    const currentMenu = getMenu();
    let filteredMenu = currentMenu.filter(item => item.active !== false);
    
    if (currentCategory !== 'Todos') {
        filteredMenu = filteredMenu.filter(item => item.category === currentCategory);
    }
    
    container.innerHTML = filteredMenu.map(item => `
        <div class="food-card">
            <img src="${item.img}" alt="${item.name}" class="food-img">
            <div class="food-content">
                <div style="font-size: 0.7rem; color: var(--primary); text-transform: uppercase; font-weight: 800; margin-bottom: 0.3rem;">${item.category}</div>
                <h3 class="food-title">${item.name}</h3>
                <p class="food-desc">${item.desc}</p>
                <div class="food-footer">
                    <span class="price">R$ ${item.price.toFixed(2).replace('.', ',')}</span>
                    <button class="add-btn" onclick="addToCart(${item.id})">Adicionar</button>
                </div>
            </div>
        </div>
    `).join('');
}

function filterCategory(cat) {
    currentCategory = cat;
    const btns = document.querySelectorAll('[id^="btn-cat-"]');
    btns.forEach(b => b.classList.remove('active'));
    
    const activeBtn = {
        'Porções': 'btn-cat-porcoes',
        'Bebidas': 'btn-cat-bebidas',
        'Guloseimas': 'btn-cat-guloseimas'
    }[cat];
    
    document.getElementById(activeBtn).classList.add('active');
    renderMenu();
}

// --- My Orders Logic ---
function renderMyOrders() {
    const container = document.getElementById('my-orders-list');
    const allOrders = getOrders();
    const myOrders = allOrders.filter(o => myOrderCodes.includes(o.code));

    if (myOrders.length === 0) {
        container.innerHTML = `
            <div class="status-card">
                <p style="color: var(--text-muted);">Você ainda não fez nenhum pedido nesta sessão.</p>
                <button class="checkout-btn" style="margin-top: 1rem;" onclick="showView('menu')">Ir para o Cardápio</button>
            </div>
        `;
        return;
    }

    container.innerHTML = myOrders.reverse().map(order => {
        const total = order.items.reduce((acc, i) => acc + (i.price * i.qty), 0);
        return `
            <div class="food-card" style="margin-bottom: 1.5rem; padding: 1.8rem; cursor: pointer; transition: var(--transition);" onclick="showOrderDetails('${order.code}')">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
                    <div>
                        <div style="font-weight: 800; color: var(--primary); font-size: 1.4rem; letter-spacing: 2px;">${order.code}</div>
                        <div style="font-size: 0.85rem; color: var(--text-muted);">${new Date(order.timestamp).toLocaleString('pt-BR')}</div>
                    </div>
                    <span class="status-badge status-${order.status.toLowerCase()}">${order.status}</span>
                </div>
                
                <div style="border-top: 1px solid var(--glass-border); padding-top: 1rem; margin-top: 1rem; display: flex; justify-content: space-between; align-items: center;">
                    <div style="font-size: 0.9rem; color: var(--text-muted);">
                        ${order.items.length} itens no pedido
                    </div>
                    <div style="font-weight: 800; color: var(--text-main); font-size: 1.1rem;">
                        R$ ${order.total.toFixed(2).replace('.', ',')}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function showOrderDetails(code) {
    const orders = getOrders();
    const order = orders.find(o => o.code === code);
    if (!order) return;

    const overlay = document.getElementById('order-details-overlay');
    const content = document.getElementById('details-content');
    
    const itemsHtml = order.items.map(i => `
        <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.9rem;">
            <span>${i.qty}x ${i.name}</span>
            <span>R$ ${(i.price * i.qty).toFixed(2).replace('.', ',')}</span>
        </div>
    `).join('');

    content.innerHTML = `
        <h2 style="color: var(--primary); margin-bottom: 0.5rem;">Pedido ${order.code}</h2>
        <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 1.5rem;">${new Date(order.timestamp).toLocaleString('pt-BR')}</div>
        
        <div style="margin-bottom: 2rem;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                <span>Status:</span>
                <span class="status-badge status-${order.status.toLowerCase()}">${order.status}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
                <span>Pagamento:</span>
                <span style="font-weight: 600;">${order.payment} ${order.status === 'Cancelado' ? '(Cancelado)' : ''}</span>
            </div>
        </div>

        <div style="background: rgba(255,255,255,0.03); padding: 1rem; border-radius: 12px; margin-bottom: 1.5rem; text-align: left;">
            <h4 style="margin-bottom: 0.8rem; border-bottom: 1px solid var(--glass-border); padding-bottom: 0.5rem;">Itens</h4>
            ${itemsHtml}
            <div style="border-top: 1px solid var(--glass-border); margin-top: 0.8rem; padding-top: 0.8rem; display: flex; justify-content: space-between; font-weight: 800; font-size: 1.1rem;">
                <span>Total:</span>
                <span>R$ ${order.total.toFixed(2).replace('.', ',')}</span>
            </div>
        </div>

        ${order.status !== 'Entregue' && order.status !== 'Cancelado' ? `
            <div style="font-size: 0.8rem; color: var(--text-muted);">Fique de olho aqui para ver quando o status mudar!</div>
        ` : ''}
    `;

    overlay.style.display = 'flex';
}

function closeOrderDetails() {
    document.getElementById('order-details-overlay').style.display = 'none';
}

// --- Cart Logic ---
function toggleCart() {
    const cartOverlay = document.getElementById('cart-overlay');
    cartOverlay.classList.toggle('open');
    
    // Toggle body scroll
    if (cartOverlay.classList.contains('open')) {
        document.body.classList.add('no-scroll');
    } else {
        document.body.classList.remove('no-scroll');
    }
}

function addToCart(id) {
    const menu = getMenu();
    const product = menu.find(p => p.id === id);
    const inCart = cart.find(item => item.id === id);

    if (inCart) {
        inCart.qty++;
    } else {
        cart.push({ ...product, qty: 1 });
    }

    updateCartCount();
    renderCart();
    
    // Visual feedback on floating button
    const btn = document.getElementById('floating-cart-btn');
    btn.classList.remove('cart-pop');
    void btn.offsetWidth; // trigger reflow
    btn.classList.add('cart-pop');
}

function updateCartCount() {
    const count = cart.reduce((acc, curr) => acc + curr.qty, 0);
    document.getElementById('cart-count').innerText = count;
}

function renderCart() {
    const container = document.getElementById('cart-items');
    const totalEl = document.getElementById('cart-total');
    
    if (cart.length === 0) {
        container.innerHTML = '<p style="text-align: center; padding: 2rem; color: var(--text-muted);">Seu carrinho está vazio.</p>';
        totalEl.innerText = 'R$ 0,00';
        return;
    }

    let total = 0;
    container.innerHTML = cart.map(item => {
        total += item.price * item.qty;
        return `
            <div class="cart-item" style="animation: slideIn 0.3s ease-out forwards;">
                <div style="flex-grow: 1;">
                    <div style="font-weight: 700; color: var(--text-main);">${item.name}</div>
                    <div style="font-size: 0.8rem; color: var(--primary);">R$ ${item.price.toFixed(2).replace('.', ',')}</div>
                </div>
                <div style="display: flex; align-items: center; gap: 0.8rem; background: rgba(255,255,255,0.05); padding: 0.4rem 0.8rem; border-radius: 12px;">
                    <button onclick="changeQty(${item.id}, -1)" style="background: none; border: none; color: var(--primary); cursor: pointer; font-weight: 800; font-size: 1.2rem;">-</button>
                    <span style="font-weight: 800; min-width: 20px; text-align: center;">${item.qty}</span>
                    <button onclick="changeQty(${item.id}, 1)" style="background: none; border: none; color: var(--primary); cursor: pointer; font-weight: 800; font-size: 1.2rem;">+</button>
                </div>
                <button onclick="removeFromCart(${item.id})" style="background: none; border: none; color: var(--accent-red); cursor: pointer; margin-left: 0.5rem; font-size: 1.1rem;">✕</button>
            </div>
        `;
    }).join('');
    
    totalEl.innerText = `R$ ${total.toFixed(2).replace('.', ',')}`;
}

function changeQty(id, delta) {
    const item = cart.find(i => i.id === id);
    if (item) {
        item.qty += delta;
        if (item.qty <= 0) {
            removeFromCart(id);
        } else {
            renderCart();
            updateCartCount();
        }
    }
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    renderCart();
    updateCartCount();
}

function goToCheckout() {
    if (cart.length === 0) return alert("Seu carrinho está vazio!");
    
    toggleCart();
    showView('checkout');
    updateCheckoutTotal();
}

function updateCheckoutTotal() {
    const summaryContainer = document.getElementById('checkout-summary');
    const totalEl = document.getElementById('checkout-total');
    const orderType = document.getElementById('order-type').value;
    const deliveryLocation = document.getElementById('delivery-location').value;
    
    let subtotal = 0;
    summaryContainer.innerHTML = cart.map(item => {
        subtotal += item.price * item.qty;
        return `
            <div style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid var(--glass-border);">
                <span>${item.qty}x ${item.name}</span>
                <span style="font-weight: 600;">R$ ${(item.price * item.qty).toFixed(2).replace('.', ',')}</span>
            </div>
        `;
    }).join('');
    
    let deliveryFee = 0;
    if (orderType === 'Entrega') {
        deliveryFee = 5.00;
        summaryContainer.innerHTML += `
            <div style="display: flex; justify-content: space-between; padding: 0.5rem 0; color: var(--primary); font-weight: 700;">
                <span>Taxa de Entrega (BAR DO GETULIO)</span>
                <span>R$ 5,00</span>
            </div>
        `;
    }
    
    const total = subtotal + deliveryFee;
    totalEl.innerText = `R$ ${total.toFixed(2).replace('.', ',')}`;
}

function toggleDeliveryFields() {
    const type = document.getElementById('order-type').value;
    const fields = document.getElementById('delivery-fields');
    fields.style.display = type === 'Entrega' ? 'block' : 'none';
    updateCheckoutTotal();
}

function toggleChangeField() {
    const method = document.getElementById('payment-method').value;
    const changeField = document.getElementById('change-field');
    if (changeField) changeField.style.display = method === 'Dinheiro' ? 'block' : 'none';
}

// --- Order Placement ---
function placeOrder() {
    const name = document.getElementById('customer-name').value;
    const phone = document.getElementById('customer-phone').value;
    const orderType = document.getElementById('order-type').value;
    const location = document.getElementById('delivery-location').value;
    const table = document.getElementById('table-number').value;
    const paymentMethod = document.getElementById('payment-method').value;
    const changeFor = document.getElementById('payment-change').value;

    if (!name) return alert("Por favor, digite seu nome!");
    if (!phone) return alert("Por favor, informe seu WhatsApp!");
    if (orderType === 'Entrega' && !table) return alert("Por favor, informe a mesa ou complemento!");
    
    const orderCode = '#' + Math.random().toString(36).substring(2, 6).toUpperCase();
    
    const subtotal = cart.reduce((acc, i) => acc + (i.price * i.qty), 0);
    const fee = (orderType === 'Entrega' && location === 'BAR DO GETULIO') ? 5 : 0;

    const orders = getOrders();
    const newOrder = {
        code: orderCode,
        customer: name,
        phone: phone,
        type: orderType,
        location: orderType === 'Entrega' ? location : 'Retirada',
        table: table || '-',
        payment: paymentMethod,
        change: paymentMethod === 'Dinheiro' ? changeFor : null,
        items: [...cart],
        total: subtotal + fee,
        status: 'Recebido',
        timestamp: new Date().getTime()
    };

    orders.push(newOrder);
    saveOrders(orders);

    // Save to client's own codes
    myOrderCodes.push(orderCode);
    localStorage.setItem('ze_chips_my_codes', JSON.stringify(myOrderCodes));

    cart = [];
    updateCartCount();
    renderCart();
    
    // Show Success/Pix Message
    const overlay = document.getElementById('success-overlay');
    const pixArea = document.getElementById('pix-payment-area');
    const successArea = document.getElementById('success-message-area');
    const codeDisplay = document.getElementById('success-order-code');
    const progress = document.getElementById('success-progress');
    
    codeDisplay.innerText = orderCode;
    overlay.style.display = 'flex';
    overlay.style.right = '0'; // Open the overlay

    if (paymentMethod === 'Pix') {
        pixArea.style.display = 'block';
        successArea.style.display = 'none';
        generatePixPayment(newOrder.total);
        startPixTimer(600, orderCode); // 10 minutes
    } else {
        pixArea.style.display = 'none';
        successArea.style.display = 'block';
        
        // Animate progress bar
        setTimeout(() => {
            progress.style.width = '0%';
        }, 100);

        // Auto Redirect after 10s
        setTimeout(() => {
            overlay.style.display = 'none';
            showView('my-orders');
        }, 10000);
    }
}

// --- Pix Helper Functions ---
function generatePixPayment(amount) {
    // REAL Pix Data
    const pixKey = "07881389109"; 
    const name = "MATHEUS ARAUJO GONCALVES PINHEIRO";
    const city = "BRASIL";
    
    // Simple Pix Payload Generator (Simplified version)
    const formattedAmount = amount.toFixed(2);
    
    // Pix structure with dynamic lengths
    let payload = "00020126";
    const merchantAccount = `0014BR.GOV.BCB.PIX01${pixKey.length.toString().padStart(2, '0')}${pixKey}`;
    payload += `${merchantAccount.length.toString().padStart(2, '0')}${merchantAccount}`;
    payload += "520400005303986";
    payload += `54${formattedAmount.length.toString().padStart(2, '0')}${formattedAmount}`;
    payload += "5802BR";
    payload += `59${name.length.toString().padStart(2, '0')}${name}`;
    payload += `60${city.length.toString().padStart(2, '0')}${city}`;
    payload += "62070503***";
    payload += "6304"; // Start of CRC

    // Calculate CRC16
    const crc = calculateCRC16(payload);
    payload += crc.toUpperCase();
    
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(payload)}`;
    
    document.getElementById('pix-qr-code').src = qrUrl;
    document.getElementById('pix-payload-input').value = payload;
}

function calculateCRC16(str) {
    let crc = 0xFFFF;
    const polynomial = 0x1021;

    for (let i = 0; i < str.length; i++) {
        let b = str.charCodeAt(i);
        for (let j = 0; j < 8; j++) {
            let bit = ((b >> (7 - j)) & 1) === 1;
            let c15 = ((crc >> 15) & 1) === 1;
            crc <<= 1;
            if (c15 ^ bit) crc ^= polynomial;
        }
    }
    return (crc & 0xFFFF).toString(16).padStart(4, '0');
}

function confirmPixPayment() {
    clearInterval(pixInterval);
    document.getElementById('pix-payment-area').style.display = 'none';
    const successArea = document.getElementById('success-message-area');
    successArea.style.display = 'block';
    
    const progress = document.getElementById('success-progress');
    setTimeout(() => {
        progress.style.width = '0%';
    }, 100);

    setTimeout(() => {
        document.getElementById('success-overlay').style.display = 'none';
        showView('my-orders');
    }, 10000);
}

function copyPixPayload() {
    const input = document.getElementById('pix-payload-input');
    input.select();
    document.execCommand('copy');
    alert("Código Pix copiado!");
}

let pixInterval;
function startPixTimer(seconds, orderCode) {
    clearInterval(pixInterval);
    let timeLeft = seconds;
    const timerEl = document.getElementById('pix-timer');

    pixInterval = setInterval(() => {
        const minutes = Math.floor(timeLeft / 60);
        const secs = timeLeft % 60;
        timerEl.innerText = `${minutes}:${secs.toString().padStart(2, '0')}`;

        if (timeLeft <= 0) {
            clearInterval(pixInterval);
            cancelOrderForNonPayment(orderCode);
        }
        timeLeft--;
    }, 1000);
}

function cancelOrderForNonPayment(code) {
    const orders = getOrders();
    const order = orders.find(o => o.code === code);
    if (order && order.status === 'Recebido') {
        order.status = 'Cancelado';
        saveOrders(orders);
        alert("O tempo para pagamento expirou e seu pedido foi cancelado.");
        document.getElementById('success-overlay').style.display = 'none';
        showView('my-orders');
    }
}

// --- Tracking Logic ---
function trackOrder(explicitCode = null) {
    const codeInput = explicitCode || document.getElementById('track-code-input').value.trim().toUpperCase();
    const cleanCode = codeInput.startsWith('#') ? codeInput : '#' + codeInput;
    
    const orders = getOrders();
    const order = orders.find(o => o.code === cleanCode);

    if (!order) {
        if(!explicitCode) alert("Código não encontrado!");
        return;
    }

    const displayArea = document.getElementById('track-display-area');
    const inputArea = document.getElementById('track-input-area');
    
    inputArea.style.display = 'none';
    displayArea.style.display = 'block';
    
    document.getElementById('display-order-code').innerText = order.code;
    document.getElementById('display-order-status').innerText = order.status;
    
    updateProgress(order.status);
}

function updateProgress(status) {
    const steps = { 'Recebido': 1, 'Preparando': 2, 'Pronto': 3, 'Entregue': 4 };
    const currentStep = steps[status] || 1;
    
    const progress = ((currentStep - 1) / 3) * 100;
    document.getElementById('status-progress').style.width = `${progress}%`;
    
    for (let i = 1; i <= 4; i++) {
        const stepEl = document.getElementById(`step-${i}`);
        if (stepEl) {
            if (i <= currentStep) {
                stepEl.classList.add('active');
            } else {
                stepEl.classList.remove('active');
            }
        }
    }
}

function resetTrack() {
    document.getElementById('track-display-area').style.display = 'none';
    document.getElementById('track-input-area').style.display = 'block';
}
