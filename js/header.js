const header = document.getElementById("header");
const menuBtn = document.getElementById("menuBtn");
const mobilePanel = document.getElementById("mobilePanel");

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
