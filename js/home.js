const homeProductsGrid = document.getElementById("productsGrid");

function getRandomProducts(products, limit) {
    const productList = Array.isArray(products) ? products.slice() : [];

    for (let index = productList.length - 1; index > 0; index -= 1) {
        const randomIndex = Math.floor(Math.random() * (index + 1));
        const currentItem = productList[index];
        productList[index] = productList[randomIndex];
        productList[randomIndex] = currentItem;
    }

    return productList.slice(0, limit);
}

function renderHomeProducts(products) {
    if (!homeProductsGrid) {
        return;
    }

    if (!products || products.length === 0) {
        homeProductsGrid.innerHTML = '<p class="products__empty">No products found.</p>';
        return;
    }

    homeProductsGrid.innerHTML = products.map(function (product) {
        const originalPriceHtml = product.originalPrice
            ? `<span class="products__original-price">${TechyStore.formatPrice(product.originalPrice)}</span>`
            : "";

        const badgeHtml = product.badge
            ? `<span class="products__badge">${product.badge}</span>`
            : "";

        const imageMarkup = product.image
            ? `<img src="${product.image}" alt="${product.name}" class="products__product-image" data-home-image="true">`
            : `<div class="products__image">${TechyStore.getInitials(product.name)}</div>`;

        return `
            <article class="products__card" data-product-link="${encodeURIComponent(product.id)}" tabindex="0" role="link" aria-label="View details for ${product.name}">
                <div class="products__media">
                    ${badgeHtml}
                    ${imageMarkup}
                </div>

                <div class="products__content">
                    <p class="products__brand">${product.brand || ""}</p>
                    <h3 class="products__name">${product.name}</h3>
                    <p class="products__text">${product.description || ""}</p>

                    <div class="products__meta">
                        <div class="products__price-group">
                            <span class="products__price">${TechyStore.formatPrice(product.price)}</span>
                            ${originalPriceHtml}
                        </div>
                        <div class="products__action-group">
                            <button type="button" class="products__add-button" data-add-product-id="${product.id}">Add to cart</button>
                            <span class="products__link">View</span>
                        </div>
                    </div>
                </div>
            </article>
        `;
    }).join("");

    homeProductsGrid.querySelectorAll('[data-home-image="true"]').forEach(function (imageNode) {
        imageNode.addEventListener("error", function () {
            const fallbackNode = document.createElement("div");
            fallbackNode.className = "products__image";
            fallbackNode.textContent = TechyStore.getInitials(imageNode.alt);
            imageNode.replaceWith(fallbackNode);
        }, { once: true });
    });
}

async function loadHomeProducts() {
    if (!homeProductsGrid) {
        return;
    }

    try {
        const data = await TechyStore.loadCatalog();
        renderHomeProducts(getRandomProducts(data.featuredProducts, 4));
    } catch (error) {
        console.error("Failed to load products:", error);
        homeProductsGrid.innerHTML = '<p class="products__empty">Unable to load products right now.</p>';
    }
}

if (homeProductsGrid) {
    homeProductsGrid.addEventListener("click", function (event) {
        const button = event.target.closest("[data-add-product-id]");
        if (button) {
            event.stopPropagation();
            TechyStore.addToCart(button.dataset.addProductId);
            button.textContent = "Added";

            window.setTimeout(function () {
                button.textContent = "Add to cart";
            }, 1000);
            return;
        }

        const card = event.target.closest("[data-product-link]");
        if (!card) {
            return;
        }

        window.location.href = "./product-details.html?id=" + card.dataset.productLink;
    });

    homeProductsGrid.addEventListener("keydown", function (event) {
        const card = event.target.closest("[data-product-link]");
        if (!card) {
            return;
        }

        if (event.target.closest("[data-add-product-id]")) {
            return;
        }

        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            window.location.href = "./product-details.html?id=" + card.dataset.productLink;
        }
    });
}

loadHomeProducts();
