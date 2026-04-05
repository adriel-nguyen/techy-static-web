const catalogGrid = document.getElementById("catalogGrid");
const catalogFilters = document.getElementById("catalogFilters");
const catalogResultsText = document.getElementById("catalogResultsText");
const catalogSearchInputs = [
    document.getElementById("catalogSearchInput"),
    document.getElementById("catalogSearchInputMobile")
].filter(Boolean);

const catalogState = {
    products: [],
    categories: [],
    activeCategory: "all",
    searchTerm: "",
    activeBadgeFilter: ""
};

function getCatalogQueryState() {
    const params = new URLSearchParams(window.location.search);

    return {
        category: params.get("category") || "all",
        badge: params.get("badge") || ""
    };
}

function createCatalogImageMarkup(product) {
    if (!product.image) {
        return `<div class="catalog__product-fallback">${TechyStore.getInitials(product.name)}</div>`;
    }

    return `<img src="${product.image}" alt="${product.name}" class="catalog__product-image" data-product-image="true">`;
}

function renderCatalogFilters() {
    if (!catalogFilters) {
        return;
    }

    const filterItems = [{
        id: "all",
        name: "All products"
    }].concat(catalogState.categories);

    catalogFilters.innerHTML = filterItems.map(function (category) {
        const isActive = category.id === catalogState.activeCategory;

        return `
            <button
                type="button"
                class="catalog__filter-button${isActive ? " catalog__filter-button--active" : ""}"
                data-category-id="${category.id}"
            >
                ${category.name}
            </button>
        `;
    }).join("");
}

function getFilteredProducts() {
    return catalogState.products.filter(function (product) {
        const matchesCategory = catalogState.activeCategory === "all" ||
            product.category === catalogState.activeCategory;
        const matchesBadge = !catalogState.activeBadgeFilter ||
            String(product.badge || "").toLowerCase().includes(catalogState.activeBadgeFilter.toLowerCase());
        const haystack = [
            product.name,
            product.brand,
            product.category,
            product.description
        ].join(" ").toLowerCase();
        const matchesSearch = haystack.includes(catalogState.searchTerm.toLowerCase());

        return matchesCategory && matchesBadge && matchesSearch;
    });
}

function syncCatalogUrl() {
    const params = new URLSearchParams();

    if (catalogState.activeCategory !== "all") {
        params.set("category", catalogState.activeCategory);
    }

    if (catalogState.activeBadgeFilter) {
        params.set("badge", catalogState.activeBadgeFilter);
    }

    if (catalogState.searchTerm) {
        params.set("search", catalogState.searchTerm);
    }

    const nextUrl = params.toString()
        ? "./products.html?" + params.toString()
        : "./products.html";

    window.history.replaceState({}, "", nextUrl);
}

function renderCatalogProducts() {
    if (!catalogGrid || !catalogResultsText) {
        return;
    }

    const filteredProducts = getFilteredProducts();
    catalogResultsText.textContent = filteredProducts.length + " product" + (filteredProducts.length === 1 ? "" : "s") + " found";

    if (filteredProducts.length === 0) {
        catalogGrid.innerHTML = '<div class="catalog__empty">No products match the current filters.</div>';
        return;
    }

    catalogGrid.innerHTML = filteredProducts.map(function (product) {
        const originalPriceHtml = product.originalPrice
            ? `<span class="catalog__price-original">${TechyStore.formatPrice(product.originalPrice)}</span>`
            : "";
        const badgeHtml = product.badge
            ? `<span class="catalog__product-badge">${product.badge}</span>`
            : "";

        return `
            <article class="catalog__product-card" data-product-link="${encodeURIComponent(product.id)}" tabindex="0" role="link" aria-label="View details for ${product.name}">
                <div class="catalog__product-media">
                    ${badgeHtml}
                    ${createCatalogImageMarkup(product)}
                </div>
                <p class="catalog__product-brand">${product.brand || ""}</p>
                <h2 class="catalog__product-name">${product.name}</h2>
                <p class="catalog__product-description">${product.description || ""}</p>
                <div class="catalog__product-footer">
                    <div class="catalog__price-wrap">
                        <span class="catalog__price">${TechyStore.formatPrice(product.price)}</span>
                        ${originalPriceHtml}
                    </div>
                    <div class="catalog__action-group">
                        <button type="button" class="catalog__add-button" data-add-product-id="${product.id}">Add to cart</button>
                    </div>
                </div>
            </article>
        `;
    }).join("");

    catalogGrid.querySelectorAll('[data-product-image="true"]').forEach(function (imageNode) {
        imageNode.addEventListener("error", function () {
            const fallbackNode = document.createElement("div");
            fallbackNode.className = "catalog__product-fallback";
            fallbackNode.textContent = TechyStore.getInitials(imageNode.alt);
            imageNode.replaceWith(fallbackNode);
        }, { once: true });
    });
}

function syncSearchInputs(sourceValue) {
    catalogSearchInputs.forEach(function (input) {
        if (input.value !== sourceValue) {
            input.value = sourceValue;
        }
    });
}

async function initializeProductsPage() {
    if (!catalogGrid) {
        return;
    }

    try {
        const data = await TechyStore.loadCatalog();
        catalogState.products = Array.isArray(data.featuredProducts) ? data.featuredProducts : [];
        catalogState.categories = Array.isArray(data.categories) ? data.categories.map(function (category) {
            return {
                id: category.name,
                name: category.name
            };
        }) : [];
        const queryState = getCatalogQueryState();
        const hasMatchingCategory = queryState.category === "all" || catalogState.categories.some(function (category) {
            return category.name === queryState.category;
        });

        catalogState.activeCategory = hasMatchingCategory ? queryState.category : "all";
        catalogState.activeBadgeFilter = queryState.badge;

        renderCatalogFilters();
        renderCatalogProducts();
    } catch (error) {
        console.error("Failed to initialize products page:", error);
        catalogResultsText.textContent = "Unable to load products";
        catalogGrid.innerHTML = '<div class="catalog__empty">The product catalog is unavailable right now.</div>';
    }
}

if (catalogFilters) {
    catalogFilters.addEventListener("click", function (event) {
        const button = event.target.closest("[data-category-id]");
        if (!button) {
            return;
        }

        catalogState.activeCategory = button.dataset.categoryId;
        catalogState.activeBadgeFilter = "";
        syncCatalogUrl();
        renderCatalogFilters();
        renderCatalogProducts();
    });
}

catalogSearchInputs.forEach(function (input) {
    input.addEventListener("input", function () {
        catalogState.searchTerm = input.value.trim();
        syncSearchInputs(input.value);
        syncCatalogUrl();
        renderCatalogProducts();
    });
});

if (catalogGrid) {
    catalogGrid.addEventListener("click", function (event) {
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

    catalogGrid.addEventListener("keydown", function (event) {
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

initializeProductsPage();
