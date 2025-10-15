// --- Global Data Store & Local Storage Management ---
const products = [
    { id: 1, name: "Pijama Kuromi", price: 50000, category: "seda", tag: "lujo elegante", imageFile: "pijama1.jpeg" },
    { id: 2, name: "Conjunto Navideño Mickey Mouse", price: 65000, category: "algodon", tag: "comodo basico", imageFile: "pijama2.jpeg" },
    { id: 3, name: "Conjunto Matilda", price: 50000, category: "seda", tag: "comodo", imageFile: "pijama3.jpeg" },
    { id: 4, name: "Conjunto Snoopy", price: 60000, category: "shorts", tag: "verano puntos", imageFile: "pijama4.jpeg" },
    { id: 5, name: "Pijama Pantera Rosa", price: 55000, category: "seda", tag: "larga femenina", imageFile: "pijama5.jpeg" }
];


let cart = JSON.parse(localStorage.getItem('cartData')) || [];



function saveCart() {
    localStorage.setItem('cartData', JSON.stringify(cart));
}



document.addEventListener('DOMContentLoaded', () => {
    // Renderiza productos solo si estamos en catalogo.html
    if (document.getElementById('productGrid')) {
        renderProducts();
    }
    // Actualiza el contador del carrito en el header de todas las páginas
    updateCartDisplay();
    
    if (document.getElementById('checkout-page')) {
        updateCheckoutPage();
    }
});





function renderProducts() {
    const productGrid = document.getElementById('productGrid');
    if (!productGrid) return; 

    productGrid.innerHTML = '';
    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        // ... (atributos data-name y data-tags) ...

        productCard.innerHTML = `
            <div class="product-image-container">
                <img src="images/${product.imageFile}" alt="${product.name}" class="product-card-image">
            </div>
            
            <h3>${product.name}</h3>
            <p>$${product.price.toFixed(2)}</p>

            <div class="size-selector-container">
                <label for="size-${product.id}">Talla:</label>
                <select id="size-${product.id}" class="size-select">
                    <option value="S">S</option>
                    <option value="M">M</option>
                    <option value="L">L</option>
                </select>
            </div>
            
            <button class="button-primary" onclick="addToCart(${product.id})">Añadir al Carrito</button>
        `;
        productGrid.appendChild(productCard);
    });
}



function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    // 1. OBTENER LA TALLA SELECCIONADA
    const sizeSelect = document.getElementById(`size-${productId}`);
    if (!sizeSelect || !sizeSelect.value) {
        alert('Por favor, selecciona una talla antes de añadir al carrito.');
        return;
    }
    const selectedSize = sizeSelect.value;
    
    // 2. CREAR UN IDENTIFICADOR ÚNICO (ID + TALLA)
    const uniqueId = `${productId}-${selectedSize}`; 

    // 3. BUSCAR SI YA EXISTE ESTA COMBINACIÓN (ID y TALLA)
    const existingItem = cart.find(item => item.uniqueId === uniqueId);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        // Añadir la talla y el uniqueId al objeto del carrito
        cart.push({ 
            ...product, 
            uniqueId: uniqueId, // Clave para identificarlo
            size: selectedSize, // Talla seleccionada
            quantity: 1 
        });
    }

    saveCart();
    updateCartDisplay();
    alert(`✅ ${product.name} (Talla ${selectedSize}) añadido al carrito.`);
}

// 4. Modificar la función removeFromCart para usar el uniqueId
function removeFromCart(uniqueId) {
    // Asegúrate de que esta función ahora acepte uniqueId
    cart = cart.filter(item => item.uniqueId !== uniqueId);
    saveCart();
    updateCartDisplay();
}

// 5. Modificar updateCartDisplay para mostrar la talla y usar uniqueId en el botón de eliminar
function updateCartDisplay() {
    // ... (Tu lógica para el carrito) ...

    if (cartItemsDiv && cartTotalSpan) {
        // ...
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            const cartItemDiv = document.createElement('div');
            // ...

            cartItemDiv.innerHTML = `
                <span>${item.name} (T: ${item.size} x${item.quantity})</span>
                <span>$${itemTotal.toFixed(2)}</span>
                
                <button onclick="removeFromCart('${item.uniqueId}')" style="background: none; border: none; color: var(--color-accent); cursor: pointer;">&times;</button>
            `;
            cartItemsDiv.appendChild(cartItemDiv);
        });
    }
    // ...
}

// 6. Modificar updateCheckoutPage para mostrar la talla
function updateCheckoutPage() {
    const checkoutSummary = document.getElementById('checkout-summary');
    // ... (Verificación de carrito vacío) ...
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2);
    
    checkoutSummary.innerHTML = `
        <h3>Tu Pedido</h3>
        ${cart.map(item => `<p>${item.name} (T: ${item.size} x${item.quantity}) - $${(item.price * item.quantity).toFixed(2)}</p>`).join('')}
        <hr style="border-color: var(--color-accent);">
        <p>Total a pagar: **$${total}**</p>
    `;
}

/**
 * Elimina un producto del carrito y actualiza la vista.s
 * @param {number} productId - ID del producto a eliminar.
 */
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartDisplay();
}


function toggleCart() {
    const modal = document.getElementById('cart-modal');
    if (modal) {
        modal.classList.toggle('hidden');
        updateCartDisplay();
    }
}


function updateCartDisplay() {
    const cartItemsDiv = document.getElementById('cart-items');
    const cartTotalSpan = document.getElementById('cart-total');
    const cartCountSpan = document.getElementById('cart-count');
    
    if (!cartCountSpan) return; 

    let total = 0;
    let itemCount = 0;

    // Calcula el total y la cuenta de ítems
    cart.forEach(item => {
        total += item.price * item.quantity;
        itemCount += item.quantity;
    });

    cartCountSpan.textContent = itemCount;

    // Actualiza el modal del carrito solo si existe en la página actual
    if (cartItemsDiv && cartTotalSpan) {
        cartItemsDiv.innerHTML = '';
        const emptyMessage = document.getElementById('empty-cart-message');

        if (cart.length === 0) {
            emptyMessage.style.display = 'block';
        } else {
            emptyMessage.style.display = 'none';
            cart.forEach(item => {
                const itemTotal = item.price * item.quantity;
                const cartItemDiv = document.createElement('div');
                cartItemDiv.className = 'cart-item';
                cartItemDiv.innerHTML = `
                    <span>${item.name} (x${item.quantity})</span>
                    <span>$${itemTotal.toFixed(2)}</span>
                    <button onclick="removeFromCart(${item.id})" style="background: none; border: none; color: var(--color-accent); cursor: pointer;">&times;</button>
                `;
                cartItemsDiv.appendChild(cartItemDiv);
            });
        }
        cartTotalSpan.textContent = total.toFixed(2);
    }
}


function goToCheckout() {
    if (cart.length === 0) {
        alert('Tu carrito está vacío. Añade productos primero.');
        return;
    }
    saveCart(); 
    toggleCart(); 
    window.location.href = 'pago.html'; 
}


function updateCheckoutPage() {
    const checkoutSummary = document.getElementById('checkout-summary');
    if (!checkoutSummary) return;
    
    // Si no hay carrito en localStorage (ej. error), redirige al catálogo
    if (cart.length === 0) {
        alert('No hay productos en el carrito para pagar. Redirigiendo al catálogo.');
        window.location.href = 'catalogo.html';
        return;
    }

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2);
    
    checkoutSummary.innerHTML = `
        <h3>Tu Pedido</h3>
        ${cart.map(item => `<p>${item.name} (x${item.quantity}) - $${(item.price * item.quantity).toFixed(2)}</p>`).join('')}
        <hr style="border-color: var(--color-accent);">
        <p>Total a pagar: **$${total}**</p>
    `;
}

/**
 * (Solo en pago.html) Simula el proceso de pago.
 */
function processPayment() {
    const form = document.getElementById('payment-form');
    if (!form || !form.checkValidity()) {
        alert('Por favor, rellena todos los campos de pago correctamente.');
        return;
    }

    // --- SIMULACIÓN ---
    alert(' Pago completado con éxito! Gracias por tu compra.');

    // Limpia el carrito y el almacenamiento local después del pago
    cart = [];
    saveCart();
    
    // Redirige al inicio
    window.location.href = '#index.html';
}
// --- Lógica del Chatbot ---

/**
 * Muestra u oculta el cuerpo del chatbot.
 */
function toggleChatbot() {
    const chatbotBody = document.getElementById('chatbot-body');
    if (chatbotBody) {
        chatbotBody.classList.toggle('hidden');
    }
}

/**
 * Captura la entrada del usuario al presionar "Enter".
 * @param {Event} event - El evento de teclado.
 */
function handleChatInput(event) {
    if (event.key === 'Enter') {
        const inputField = document.getElementById('chatbot-input');
        const message = inputField.value.trim();
        if (message) {
            addMessageToChat('user', message);
            inputField.value = '';
            respondToChat(message);
        }
    }
}

/**
 * Añade un mensaje al historial del chat.
 * @param {string} sender - 'user' o 'bot'.
 * @param {string} text - Contenido del mensaje.
 */
function addMessageToChat(sender, text) {
    const messagesDiv = document.getElementById('chatbot-messages');
    
    // Si el contenedor de mensajes no existe, salimos
    if (!messagesDiv) return; 
    
    const msgP = document.createElement('p');
    msgP.className = `${sender}-message`;
    msgP.textContent = text;
    messagesDiv.appendChild(msgP);
    
    // Auto-scroll al final
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

/**
 * Proporciona una respuesta simple basada en el mensaje del usuario.
 * @param {string} userMessage - Mensaje del usuario.
 */
function respondToChat(userMessage) {
    const msg = userMessage.toLowerCase();
    let response = "Lo siento, soy un chatbot básico. Mis temas son: 'envíos', 'devoluciones' o 'catálogo'.";

    if (msg.includes('envio') || msg.includes('envío')) {
        response = "El envío estándar tarda de 3 a 5 días hábiles. ¡Es gratis en compras mayores a $50!";
    } else if (msg.includes('devolu')) {
        response = "Aceptamos devoluciones en un plazo de 30 días. Por favor, asegúrate de que la pijama no haya sido usada.";
    } else if (msg.includes('catalogo') || msg.includes('productos')) {
        response = "Puedes ver toda nuestra suave colección en la sección de Catálogo.";
    } else if (msg.includes('hola') || msg.includes('saludo')) {
        response = "¡Hola! ¿Necesitas ayuda para encontrar el mejor estilo de descanso? 😊";
    } else if (msg.includes('gracias')) {
        response = "De nada! Que tengas un dulce sueño.";
    }

    // Simular un pequeño retraso
    setTimeout(() => {
        addMessageToChat('bot', response);
    }, 500);
}

function clearCart() {
    if (cart.length === 0) {
        alert("El carrito ya está vacío.");
        return;
    }
    
    const confirmation = confirm("¿Estás seguro que deseas vaciar el carrito?");
    
    if (confirmation) {
        // 1. Reiniciar la variable global del carrito a un array vacío
        cart = [];
        
        // 2. Guardar el carrito vacío en localStorage
        saveCart();
        
        // 3. Actualizar la interfaz del modal y el contador del header
        updateCartDisplay();
 
        toggleCart();
        
        alert("El carrito ha sido vaciado.");
    }
}
