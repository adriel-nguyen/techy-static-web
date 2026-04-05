const cartItemsNode = document.getElementById("cartItems");
const cartSubtotalNode = document.getElementById("cartSubtotal");
const cartSummaryTextNode = document.getElementById("cartSummaryText");

function createCartImageMarkup(product) {
    if (!product.image) {
        return `<div class="cart-view__item-fallback">${TechyStore.getInitials(product.name)}</div>`;
    }

    return `<img src="${product.image}" alt="${product.name}" class="cart-view__item-image" data-cart-image="true">`;
}

function renderCartItems(cartDetails) {
    if (!cartItemsNode || !cartSubtotalNode || !cartSummaryTextNode) {
        return;
    }

    if (cartDetails.length === 0) {
        cartItemsNode.innerHTML = `
            <div class="cart-view__empty">
                <h2 class="cart-view__empty-title">Your cart is empty</h2>
                <p class="cart-view__empty-text">Add products from the catalog to see them here.</p>
            </div>
        `;
        cartSubtotalNode.textContent = TechyStore.formatPrice(0);
        cartSummaryTextNode.textContent = "0 items in cart";
        return;
    }

    const subtotal = cartDetails.reduce(function (total, item) {
        return total + item.lineTotal;
    }, 0);
    const totalQuantity = cartDetails.reduce(function (total, item) {
        return total + item.quantity;
    }, 0);

    cartItemsNode.innerHTML = cartDetails.map(function (item) {
        return `
            <article class="cart-view__item">
                <div class="cart-view__item-media">
                    ${createCartImageMarkup(item.product)}
                </div>

                <div class="cart-view__item-content">
                    <p class="cart-view__item-brand">${item.product.brand || ""}</p>
                    <h2 class="cart-view__item-name">${item.product.name}</h2>
                    <p class="cart-view__item-description">${item.product.description || ""}</p>

                    <div class="cart-view__item-meta">
                        <span class="cart-view__item-price">${TechyStore.formatPrice(item.lineTotal)}</span>
                        <div class="cart-view__item-controls">
                            <button type="button" class="cart-view__quantity-button" data-cart-action="decrease" data-product-id="${item.product.id}">-</button>
                            <span class="cart-view__quantity-value">${item.quantity}</span>
                            <button type="button" class="cart-view__quantity-button" data-cart-action="increase" data-product-id="${item.product.id}">+</button>
                            <button type="button" class="cart-view__remove-button" data-cart-action="remove" data-product-id="${item.product.id}">Remove</button>
                        </div>
                    </div>
                </div>
            </article>
        `;
    }).join("");

    cartSubtotalNode.textContent = TechyStore.formatPrice(subtotal);
    cartSummaryTextNode.textContent = totalQuantity + " item" + (totalQuantity === 1 ? "" : "s") + " in cart";

    cartItemsNode.querySelectorAll('[data-cart-image="true"]').forEach(function (imageNode) {
        imageNode.addEventListener("error", function () {
            const fallbackNode = document.createElement("div");
            fallbackNode.className = "cart-view__item-fallback";
            fallbackNode.textContent = TechyStore.getInitials(imageNode.alt);
            imageNode.replaceWith(fallbackNode);
        }, { once: true });
    });
}

async function refreshCart() {
    try {
        const cartDetails = await TechyStore.getCartDetails();
        renderCartItems(cartDetails);
    } catch (error) {
        console.error("Failed to render cart:", error);
        if (cartItemsNode) {
            cartItemsNode.innerHTML = '<div class="cart-view__empty"><h2 class="cart-view__empty-title">Cart unavailable</h2><p class="cart-view__empty-text">The cart could not be loaded right now.</p></div>';
        }
    }
}

if (cartItemsNode) {
    cartItemsNode.addEventListener("click", function (event) {
        const button = event.target.closest("[data-cart-action]");
        if (!button) {
            return;
        }

        const cartItems = TechyStore.getCart();
        const currentItem = cartItems.find(function (item) {
            return item.productId === button.dataset.productId;
        });

        if (!currentItem) {
            return;
        }

        if (button.dataset.cartAction === "increase") {
            TechyStore.updateQuantity(currentItem.productId, currentItem.quantity + 1);
        }

        if (button.dataset.cartAction === "decrease") {
            TechyStore.updateQuantity(currentItem.productId, currentItem.quantity - 1);
        }

        if (button.dataset.cartAction === "remove") {
            TechyStore.removeFromCart(currentItem.productId);
        }

        refreshCart();
    });
}

refreshCart();
