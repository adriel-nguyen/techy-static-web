const header = document.getElementById("header");
const menuBtn = document.getElementById("menuBtn");
const mobilePanel = document.getElementById("mobilePanel");
const headerSearchForms = document.querySelectorAll(".header__search, .header__mobile-search");
const headerActions = document.querySelector(".header__actions");
const headerMobileInner = document.querySelector(".header__mobile-inner");
const headerContainer = document.querySelector(".header__container");
let activeProfileMenu = null;

function getInitials(name) {
    const parts = String(name || "").trim().split(/\s+/).filter(Boolean);

    if (parts.length === 0) {
        return "U";
    }

    return parts.slice(0, 2).map(function (part) {
        return part.charAt(0).toUpperCase();
    }).join("");
}

function runProfileAction(action) {
    if (!action || !window.TechyAuth) {
        return;
    }

    if (action === "account") {
        window.location.href = "./account.html";
        return;
    }

    if (action === "logout") {
        window.TechyAuth.signOut();
        window.location.href = window.TechyAuth.getLoginUrl();
    }
}

function closeActiveProfileMenu() {
    if (!activeProfileMenu) {
        return;
    }

    activeProfileMenu.classList.remove("header__profile-menu--open");

    const trigger = activeProfileMenu.querySelector(".header__profile-trigger");
    if (trigger) {
        trigger.setAttribute("aria-expanded", "false");
    }

    activeProfileMenu = null;
}

function createProfileControls(session, isMobile) {
    const wrapper = document.createElement("div");
    wrapper.className = isMobile ? "header__profile header__profile--mobile" : "header__profile";

    const avatar = document.createElement("span");
    avatar.className = "header__profile-avatar";
    avatar.textContent = getInitials(session.name || session.email);

    const meta = document.createElement("div");
    meta.className = "header__profile-meta";

    const nameNode = document.createElement("span");
    nameNode.className = "header__profile-name";
    nameNode.textContent = session.name || "User";

    const emailNode = document.createElement("span");
    emailNode.className = "header__profile-email";
    emailNode.textContent = session.email || "";

    const menu = document.createElement("div");
    menu.className = "header__profile-menu";

    const trigger = document.createElement("button");
    trigger.type = "button";
    trigger.className = "header__profile-trigger";
    trigger.setAttribute("aria-expanded", "false");
    trigger.setAttribute("aria-label", "Open profile menu");
    trigger.innerHTML = '<span>Profile</span><span class="header__profile-caret"></span>';

    const dropdown = document.createElement("div");
    dropdown.className = "header__profile-dropdown";

    [
        { label: "Account", action: "account" },
        { label: "Log out", action: "logout" }
    ].forEach(function (item) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "header__profile-option";
        button.textContent = item.label;
        button.addEventListener("click", function () {
            closeActiveProfileMenu();
            runProfileAction(item.action);
        });
        dropdown.appendChild(button);
    });

    trigger.addEventListener("click", function (event) {
        event.stopPropagation();

        const willOpen = !menu.classList.contains("header__profile-menu--open");
        closeActiveProfileMenu();

        if (willOpen) {
            menu.classList.add("header__profile-menu--open");
            trigger.setAttribute("aria-expanded", "true");
            activeProfileMenu = menu;
        }
    });

    meta.appendChild(nameNode);
    meta.appendChild(emailNode);
    wrapper.appendChild(avatar);
    wrapper.appendChild(meta);
    menu.appendChild(trigger);
    menu.appendChild(dropdown);
    wrapper.appendChild(menu);

    return wrapper;
}

function createLoginLink(isMobile) {
    const link = document.createElement("a");
    link.href = window.TechyAuth ? window.TechyAuth.getLoginUrl() : "./login.html";
    link.textContent = "Login";
    link.className = isMobile ? "header__mobile-login" : "header__login-link";
    return link;
}

function createMobileProfileBar(session) {
    const wrapper = document.createElement("div");
    wrapper.className = "header__mobile-profile-bar";

    const summary = document.createElement("div");
    summary.className = "header__mobile-profile-summary";

    const avatar = document.createElement("span");
    avatar.className = "header__profile-avatar";
    avatar.textContent = getInitials(session.name || session.email);

    const meta = document.createElement("div");
    meta.className = "header__profile-meta";

    const nameNode = document.createElement("span");
    nameNode.className = "header__profile-name";
    nameNode.textContent = session.name || "User";

    const emailNode = document.createElement("span");
    emailNode.className = "header__profile-email";
    emailNode.textContent = session.email || "";

    const link = document.createElement("a");
    link.href = "./account.html";
    link.className = "header__mobile-profile-link";
    link.textContent = "Account";

    meta.appendChild(nameNode);
    meta.appendChild(emailNode);
    summary.appendChild(avatar);
    summary.appendChild(meta);
    wrapper.appendChild(summary);
    wrapper.appendChild(link);

    return wrapper;
}

function createMobileLoginBar() {
    const wrapper = document.createElement("div");
    wrapper.className = "header__mobile-profile-bar";
    wrapper.appendChild(createLoginLink(true));
    return wrapper;
}

function renderHeaderAuthState() {
    if (!window.TechyAuth) {
        return;
    }

    const session = window.TechyAuth.getSession();

    if (headerActions) {
        const existingDesktopNode = headerActions.querySelector(".header__profile, .header__login-link");
        if (existingDesktopNode) {
            existingDesktopNode.remove();
        }

        headerActions.insertBefore(
            session ? createProfileControls(session, false) : createLoginLink(false),
            menuBtn || null
        );
    }

    if (headerMobileInner) {
        const existingMobileNode = headerMobileInner.querySelector(".header__profile--mobile, .header__mobile-login");
        if (existingMobileNode) {
            existingMobileNode.remove();
        }

        headerMobileInner.appendChild(session ? createProfileControls(session, true) : createLoginLink(true));
    }

    if (headerContainer && header) {
        const existingMobileBar = header.querySelector(".header__mobile-profile-bar");
        if (existingMobileBar) {
            existingMobileBar.remove();
        }

        headerContainer.insertAdjacentElement(
            "afterend",
            session ? createMobileProfileBar(session) : createMobileLoginBar()
        );
    }
}

renderHeaderAuthState();

document.addEventListener("click", function (event) {
    if (!activeProfileMenu) {
        return;
    }

    if (!activeProfileMenu.contains(event.target)) {
        closeActiveProfileMenu();
    }
});

document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
        closeActiveProfileMenu();
    }
});

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
