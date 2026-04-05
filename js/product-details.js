const productViewNode = document.getElementById("productView");

function getProductIdFromQuery() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id");
}

function createDetailImageMarkup(product) {
    if (!product.image) {
        return `<div class="product-view__fallback">${TechyStore.getInitials(product.name)}</div>`;
    }

    return `<img src="${product.image}" alt="${product.name}" class="product-view__image" data-product-detail-image="true">`;
}

function getRelatedProducts(allProducts, currentProduct) {
    return allProducts
        .filter(function (product) {
            return product.id !== currentProduct.id && product.category === currentProduct.category;
        })
        .slice(0, 3);
}

function renderMissingProduct() {
    if (!productViewNode) {
        return;
    }

    productViewNode.innerHTML = `
        <div class="product-view__empty">
            <h1 class="product-view__empty-title">Product not found</h1>
            <p class="product-view__empty-text">The requested item could not be loaded from the current catalog.</p>
            <a href="./products.html" class="product-view__button product-view__button--secondary">Back to products</a>
        </div>
    `;
}

function renderProductDetails(product, allProducts) {
    if (!productViewNode) {
        return;
    }

    const relatedProducts = getRelatedProducts(allProducts, product);
    const originalPriceMarkup = product.originalPrice
        ? `<span class="product-view__price-original">${TechyStore.formatPrice(product.originalPrice)}</span>`
        : "";
    const badgeMarkup = product.badge
        ? `<span class="product-view__badge">${product.badge}</span>`
        : "";
    const relatedMarkup = relatedProducts.length > 0
        ? `
            <section class="product-view__related">
                <h2 class="product-view__related-title">You may also like</h2>
                <div class="product-view__related-grid">
                    ${relatedProducts.map(function (relatedProduct) {
                        return `
                            <article class="product-view__related-card">
                                <p class="product-view__related-brand">${relatedProduct.brand || ""}</p>
                                <h3 class="product-view__related-name">${relatedProduct.name}</h3>
                                <p class="product-view__related-price">${TechyStore.formatPrice(relatedProduct.price)}</p>
                                <a href="./product-details.html?id=${encodeURIComponent(relatedProduct.id)}" class="product-view__related-link">View details</a>
                            </article>
                        `;
                    }).join("")}
                </div>
            </section>
        `
        : "";

    productViewNode.innerHTML = `
        <nav class="product-view__breadcrumb" aria-label="Breadcrumb">
            <a href="./index.html" class="product-view__breadcrumb-link">Home</a>
            <span>/</span>
            <a href="./products.html" class="product-view__breadcrumb-link">Products</a>
            <span>/</span>
            <span>${product.name}</span>
        </nav>

        <article class="product-view__card">
            <div class="product-view__media">
                ${badgeMarkup}
                ${createDetailImageMarkup(product)}
            </div>

            <div class="product-view__content">
                <p class="product-view__brand">${product.brand || ""}</p>
                <h1 class="product-view__title">${product.name}</h1>
                <p class="product-view__description">${product.description || ""}</p>

                <div class="product-view__price-block">
                    <span class="product-view__price">${TechyStore.formatPrice(product.price)}</span>
                    ${originalPriceMarkup}
                </div>

                <div class="product-view__stats">
                    <div class="product-view__stat">
                        <span class="product-view__stat-label">Category</span>
                        <span class="product-view__stat-value">${product.category || "N/A"}</span>
                    </div>
                    <div class="product-view__stat">
                        <span class="product-view__stat-label">Rating</span>
                        <span class="product-view__stat-value">${product.rating || "N/A"}</span>
                    </div>
                    <div class="product-view__stat">
                        <span class="product-view__stat-label">In stock</span>
                        <span class="product-view__stat-value">${product.stock || 0}</span>
                    </div>
                </div>

                <div class="product-view__actions">
                    <button type="button" class="product-view__button product-view__button--primary" id="productAddToCartButton">Add to cart</button>
                    <a href="./cart.html" class="product-view__button product-view__button--secondary">Go to cart</a>
                </div>

                <div class="product-view__meta">
                    <div class="product-view__meta-row">
                        <span class="product-view__meta-label">Product ID</span>
                        <span class="product-view__meta-value">${product.id}</span>
                    </div>
                    <div class="product-view__meta-row">
                        <span class="product-view__meta-label">Discount</span>
                        <span class="product-view__meta-value">${product.discountPercent || 0}%</span>
                    </div>
                    <div class="product-view__meta-row">
                        <span class="product-view__meta-label">Brand</span>
                        <span class="product-view__meta-value">${product.brand || "N/A"}</span>
                    </div>
                </div>
            </div>
        </article>

        <section class="product-view__extras">
            <article class="product-view__feature-card">
                <h2 class="product-view__feature-title">Fast shipping</h2>
                <p class="product-view__feature-text">Orders are prepared quickly and packed with care for safer delivery.</p>
            </article>
            <article class="product-view__feature-card">
                <h2 class="product-view__feature-title">Secure checkout</h2>
                <p class="product-view__feature-text">A streamlined shopping flow keeps the experience simple from product to cart.</p>
            </article>
            <article class="product-view__feature-card">
                <h2 class="product-view__feature-title">Support included</h2>
                <p class="product-view__feature-text">Reach the Techy team for order help, returns guidance, and product questions.</p>
            </article>
        </section>

        ${relatedMarkup}
    `;

    const imageNode = productViewNode.querySelector('[data-product-detail-image="true"]');
    if (imageNode) {
        imageNode.addEventListener("error", function () {
            const fallbackNode = document.createElement("div");
            fallbackNode.className = "product-view__fallback";
            fallbackNode.textContent = TechyStore.getInitials(imageNode.alt);
            imageNode.replaceWith(fallbackNode);
        }, { once: true });
    }

    const addToCartButton = document.getElementById("productAddToCartButton");
    if (addToCartButton) {
        addToCartButton.addEventListener("click", function () {
            TechyStore.addToCart(product.id);
            addToCartButton.textContent = "Added";

            window.setTimeout(function () {
                addToCartButton.textContent = "Add to cart";
            }, 1000);
        });
    }
}

async function initializeProductDetailsPage() {
    if (!productViewNode) {
        return;
    }

    const productId = getProductIdFromQuery();
    if (!productId) {
        renderMissingProduct();
        return;
    }

    try {
        const data = await TechyStore.loadCatalog();
        const products = Array.isArray(data.featuredProducts) ? data.featuredProducts : [];
        const product = products.find(function (item) {
            return item.id === productId;
        });

        if (!product) {
            renderMissingProduct();
            return;
        }

        document.title = "Techy - " + product.name;
        renderProductDetails(product, products);
    } catch (error) {
        console.error("Failed to load product details:", error);
        renderMissingProduct();
    }
}

initializeProductDetailsPage();
