(function () {
    const STORAGE_KEY = "techy-cart";
    let catalogCache = null;

    function formatPrice(price) {
        return "$" + Number(price || 0).toLocaleString("en-US");
    }

    async function loadCatalog() {
        if (catalogCache) {
            return catalogCache;
        }

        if (window.TechyCatalogData) {
            catalogCache = window.TechyCatalogData;
            return catalogCache;
        }

        const response = await fetch("./data/techy-mock-products.json", {
            cache: "no-store"
        });

        if (!response.ok) {
            throw new Error("HTTP " + response.status);
        }

        catalogCache = await response.json();
        return catalogCache;
    }

    function getCart() {
        try {
            const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
            return Array.isArray(parsed) ? parsed : [];
        } catch (error) {
            return [];
        }
    }

    function saveCart(cartItems) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems));
        syncCartCount();
    }

    function addToCart(productId) {
        const cartItems = getCart();
        const existingItem = cartItems.find(function (item) {
            return item.productId === productId;
        });

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cartItems.push({
                productId: productId,
                quantity: 1
            });
        }

        saveCart(cartItems);
    }

    function updateQuantity(productId, nextQuantity) {
        const cartItems = getCart()
            .map(function (item) {
                if (item.productId !== productId) {
                    return item;
                }

                return {
                    productId: item.productId,
                    quantity: nextQuantity
                };
            })
            .filter(function (item) {
                return item.quantity > 0;
            });

        saveCart(cartItems);
    }

    function removeFromCart(productId) {
        const cartItems = getCart().filter(function (item) {
            return item.productId !== productId;
        });

        saveCart(cartItems);
    }

    function getCartCount() {
        return getCart().reduce(function (total, item) {
            return total + item.quantity;
        }, 0);
    }

    function syncCartCount() {
        const count = getCartCount();

        document.querySelectorAll("[data-cart-count]").forEach(function (node) {
            node.textContent = String(count);
        });
    }

    async function getCartDetails() {
        const catalog = await loadCatalog();
        const products = catalog && Array.isArray(catalog.featuredProducts)
            ? catalog.featuredProducts
            : [];

        return getCart()
            .map(function (item) {
                const product = products.find(function (entry) {
                    return entry.id === item.productId;
                });

                if (!product) {
                    return null;
                }

                return {
                    product: product,
                    quantity: item.quantity,
                    lineTotal: item.quantity * Number(product.price || 0)
                };
            })
            .filter(Boolean);
    }

    function getInitials(name) {
        return String(name || "")
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map(function (part) {
                return part.charAt(0).toUpperCase();
            })
            .join("") || "T";
    }

    window.TechyStore = {
        addToCart: addToCart,
        formatPrice: formatPrice,
        getCart: getCart,
        getCartCount: getCartCount,
        getCartDetails: getCartDetails,
        getInitials: getInitials,
        loadCatalog: loadCatalog,
        removeFromCart: removeFromCart,
        syncCartCount: syncCartCount,
        updateQuantity: updateQuantity
    };

    syncCartCount();
})();
