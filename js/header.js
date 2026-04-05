const header = document.getElementById("header");
const menuBtn = document.getElementById("menuBtn");
const mobilePanel = document.getElementById("mobilePanel");
const headerSearchForms = document.querySelectorAll(".header__search, .header__mobile-search");

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

headerSearchForms.forEach(function (formNode) {
    formNode.addEventListener("submit", function (event) {
        event.preventDefault();

        const inputNode = formNode.querySelector("input");
        const searchTerm = inputNode ? inputNode.value.trim() : "";
        const params = new URLSearchParams();

        if (searchTerm) {
            params.set("search", searchTerm);
        }

        window.location.href = params.toString()
            ? "./products.html?" + params.toString()
            : "./products.html";
    });
});
