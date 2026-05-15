// --- Shared Logic for Ze Chips ---

// Default Menu Data
// Default Menu Data
const DEFAULT_MENU = [
    { 
        id: 1, 
        name: "Batata Suprema", 
        category: "Porções",
        desc: "Batatas crocantes com alecrim, parmesão e toque de azeite trufado.", 
        price: 28.90, 
        active: true,
        img: "C:/Users/07881389109/.gemini/antigravity/brain/fe4ce9b4-3231-4d12-8640-1c64f4d12e85/porcao_batata_frita_1778868705544.png" 
    },
    { 
        id: 2, 
        name: "Frango a Passarinho", 
        category: "Porções",
        desc: "Cortes selecionados, alho crocante e salsinha fresca.", 
        price: 34.50, 
        active: true,
        img: "https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&q=80&w=800" 
    },
    { 
        id: 5, 
        name: "Coca-Cola 2L", 
        category: "Bebidas",
        desc: "Gelada e refrescante.", 
        price: 12.00, 
        active: true,
        img: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80&w=800" 
    },
    { 
        id: 6, 
        name: "Suco de Laranja", 
        category: "Bebidas",
        desc: "Natural, 500ml.", 
        price: 8.50, 
        active: true,
        img: "https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&q=80&w=800" 
    },
    { 
        id: 7, 
        name: "Petit Gateau", 
        category: "Guloseimas",
        desc: "Bolo quente de chocolate com sorvete de baunilha.", 
        price: 22.00, 
        active: true,
        img: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&q=80&w=800" 
    },
    { 
        id: 8, 
        name: "Bombom Trufado", 
        category: "Guloseimas",
        desc: "Chocolate belga com recheio de avelã.", 
        price: 5.50, 
        active: true,
        img: "https://images.unsplash.com/photo-1548907040-4baa42d10919?auto=format&fit=crop&q=80&w=800" 
    }
];

// Helper to get menu
function getMenu() {
    const storedMenu = localStorage.getItem('ze_chips_menu');
    if (!storedMenu) {
        localStorage.setItem('ze_chips_menu', JSON.stringify(DEFAULT_MENU));
        return DEFAULT_MENU;
    }
    
    const parsed = JSON.parse(storedMenu);
    // Check if it's the old menu (missing categories or new items)
    const needsUpdate = parsed.length < DEFAULT_MENU.length || !parsed[0].category;
    
    if (needsUpdate) {
        localStorage.setItem('ze_chips_menu', JSON.stringify(DEFAULT_MENU));
        return DEFAULT_MENU;
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
