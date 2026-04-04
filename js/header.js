const header = document.getElementById("header");
const menuBtn = document.getElementById("menuBtn");
const mobilePanel = document.getElementById("mobilePanel");
const productsGrid = document.getElementById("productsGrid");

window.addEventListener("scroll", function () {
    if (header) {
        if (window.scrollY > 20) {
            header.classList.add("header--scrolled");
        } else {
            header.classList.remove("header--scrolled");
        }
    }
});

if (menuBtn && mobilePanel) {
    menuBtn.addEventListener("click", function () {
        mobilePanel.classList.toggle("header__mobile-panel--open");
        menuBtn.classList.toggle("header__menu-button--active");
    });
}

function formatPrice(price) {
    return "$" + Number(price).toLocaleString("en-US");
}

function renderProducts(products) {
    if (!productsGrid) {
        return;
    }

    if (!products || products.length === 0) {
        productsGrid.innerHTML = "<p>No products found.</p>";
        return;
    }

    productsGrid.innerHTML = products.map(function (product) {
        const originalPriceHtml = product.originalPrice
            ? `<span class="products__original-price">${formatPrice(product.originalPrice)}</span>`
            : "";

        const badgeHtml = product.badge
            ? `<span class="products__badge">${product.badge}</span>`
            : "";

        const imageHtml = product.image
            ? `<img src="${product.image}" alt="${product.name}" class="products__product-image">`
            : `<div class="products__image">📦</div>`;

        return `
            <article class="products__card">
                <div class="products__media">
                    ${badgeHtml}
                    ${imageHtml}
                </div>

                <div class="products__content">
                    <p class="products__brand">${product.brand || ""}</p>
                    <h3 class="products__name">${product.name}</h3>
                    <p class="products__text">${product.description || ""}</p>

                    <div class="products__meta">
                        <div class="products__price-group">
                            <span class="products__price">${formatPrice(product.price)}</span>
                            ${originalPriceHtml}
                        </div>
                        <a href="#" class="products__link">View</a>
                    </div>
                </div>
            </article>
        `;
    }).join("");
}

async function loadProducts() {
    try {
        const response = await fetch("./data/techy-mock-products.json", {
            cache: "no-store"
        });

        if (!response.ok) {
            throw new Error("HTTP " + response.status);
        }

        const data = await response.json();
        renderProducts(data.featuredProducts);
    } catch (error) {
        console.error("Failed to load products:", error);

        if (productsGrid) {
            productsGrid.innerHTML = "<p>Unable to load products right now.</p>";
        }
    }
}

loadProducts();