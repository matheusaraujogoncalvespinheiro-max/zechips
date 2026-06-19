// --- Shared Logic for Ze Chips ---

const DEFAULT_MENU = [];

// Initialize Firebase if configured
let db = null;
const isFirebaseEnabled = typeof firebase !== 'undefined' && typeof firebaseConfig !== 'undefined' && firebaseConfig.apiKey !== "SUA_API_KEY";

if (isFirebaseEnabled) {
    try {
        firebase.initializeApp(firebaseConfig);
        db = firebase.firestore();
        console.log("Firebase inicializado com sucesso!");
    } catch (e) {
        console.error("Erro ao inicializar o Firebase:", e);
    }
} else {
    console.warn("Firebase nao configurado ou usando chaves padrao. Usando LocalStorage local.");
}

// Cache local em memoria
let localMenu = [];
let localOrders = [];

// Callbacks para atualizacao em tempo real
let menuCallbacks = [];
let ordersCallbacks = [];

function onMenuUpdate(cb) {
    menuCallbacks.push(cb);
    if (localMenu.length > 0) cb(localMenu);
}

function onOrdersUpdate(cb) {
    ordersCallbacks.push(cb);
    if (localOrders.length > 0) cb(localOrders);
}

function notifyMenuUpdates() {
    menuCallbacks.forEach(cb => cb(localMenu));
}

function notifyOrdersUpdates() {
    ordersCallbacks.forEach(cb => cb(localOrders));
}

// Helpers para LocalStorage (Fallback)
function getLocalMenu() {
    const storedMenu = localStorage.getItem('ze_chips_menu');
    if (!storedMenu) {
        localStorage.setItem('ze_chips_menu', JSON.stringify(DEFAULT_MENU));
        return DEFAULT_MENU;
    }
    return JSON.parse(storedMenu);
}

function saveLocalMenu(menu) {
    localStorage.setItem('ze_chips_menu', JSON.stringify(menu));
    window.dispatchEvent(new Event('storage'));
}

function getLocalOrders() {
    return JSON.parse(localStorage.getItem('ze_chips_orders')) || [];
}

function saveLocalOrders(orders) {
    localStorage.setItem('ze_chips_orders', JSON.stringify(orders));
    window.dispatchEvent(new Event('storage'));
}

// Sincronizacao Inicial e listeners de mudanca
if (db) {
    // Sincronizar Menu do Firestore
    db.collection('menu').onSnapshot((snapshot) => {
        let tempMenu = [];
        snapshot.forEach(doc => {
            tempMenu.push(doc.data());
        });
        localMenu = tempMenu.sort((a, b) => a.id - b.id);
        notifyMenuUpdates();
    }, (error) => {
        console.error("Erro ao escutar menu do Firestore:", error);
    });

    // Sincronizar Pedidos do Firestore
    db.collection('orders').onSnapshot((snapshot) => {
        let tempOrders = [];
        snapshot.forEach(doc => {
            tempOrders.push(doc.data());
        });
        localOrders = tempOrders.sort((a, b) => b.timestamp - a.timestamp);
        notifyOrdersUpdates();
    }, (error) => {
        console.error("Erro ao escutar pedidos do Firestore:", error);
    });
} else {
    // Fallback: carregar dados locais
    localMenu = getLocalMenu();
    localOrders = getLocalOrders();

    // Ouvir alteracoes de LocalStorage do navegador
    window.addEventListener('storage', () => {
        localMenu = getLocalMenu();
        localOrders = getLocalOrders();
        notifyMenuUpdates();
        notifyOrdersUpdates();
    });
}

// API Sincrona compativel com o codigo legado
function getMenu() {
    return localMenu;
}

function saveMenu(menu) {
    if (db) {
        // Enviar os itens para o Firestore
        menu.forEach(item => {
            db.collection('menu').doc(String(item.id)).set(item);
        });
    } else {
        saveLocalMenu(menu);
        notifyMenuUpdates();
    }
}

function getOrders() {
    return localOrders;
}

function saveOrders(orders) {
    if (db) {
        // No Firestore, costumamos salvar pedidos individuais.
        // Como o app antigo gravava a lista completa, salvamos o ultimo pedido inserido
        // ou atualizamos os pedidos que mudaram.
        orders.forEach(order => {
            db.collection('orders').doc(order.code).set(order);
        });
    } else {
        saveLocalOrders(orders);
        notifyOrdersUpdates();
    }
}

// Helper para expor o db para o app.js e admin.js
window.db = db;

