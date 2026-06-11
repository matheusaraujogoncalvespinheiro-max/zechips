// --- Shared Logic for Ze Chips ---

const DEFAULT_MENU = [];

// Helper to get menu
function getMenu() {
    const storedMenu = localStorage.getItem('ze_chips_menu');
    if (!storedMenu) {
        localStorage.setItem('ze_chips_menu', JSON.stringify(DEFAULT_MENU));
        return DEFAULT_MENU;
    }
    
    let parsed = JSON.parse(storedMenu);
    
    // One-time cleanup of mock data if detected
    const hasMockData = parsed.some(item => item.id === 1 && item.name === "Batata Suprema" && item.price === 28.90);
    if (hasMockData) {
        localStorage.setItem('ze_chips_menu', JSON.stringify([]));
        localStorage.removeItem('ze_chips_orders');
        return [];
    }
    
    return parsed;
}

// Helper to save menu
function saveMenu(menu) {
    localStorage.setItem('ze_chips_menu', JSON.stringify(menu));
    window.dispatchEvent(new Event('storage'));
}

// Helper to get orders
function getOrders() {
    return JSON.parse(localStorage.getItem('ze_chips_orders')) || [];
}

// Helper to save orders
function saveOrders(orders) {
    localStorage.setItem('ze_chips_orders', JSON.stringify(orders));
    window.dispatchEvent(new Event('storage'));
}
