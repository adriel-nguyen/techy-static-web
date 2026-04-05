const header = document.getElementById("header");
const menuBtn = document.getElementById("menuBtn");
const mobilePanel = document.getElementById("mobilePanel");
const headerSearchForms = document.querySelectorAll(".header__search, .header__mobile-search");
const headerActions = document.querySelector(".header__actions");
const headerMobileInner = document.querySelector(".header__mobile-inner");

function getInitials(name) {
    const parts = String(name || "").trim().split(/\s+/).filter(Boolean);

    if (parts.length === 0) {
        return "U";
    }

    return parts.slice(0, 2).map(function (part) {
        return part.charAt(0).toUpperCase();
    }).join("");
}

function handleProfileAction(event) {
    const action = event.target.value;

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

    const select = document.createElement("select");
    select.className = "header__profile-select";
    select.setAttribute("aria-label", "Profile actions");
    select.innerHTML = [
        '<option value="">Profile</option>',
        '<option value="account">Account</option>',
        '<option value="logout">Log out</option>'
    ].join("");
    select.addEventListener("change", handleProfileAction);

    meta.appendChild(nameNode);
    meta.appendChild(emailNode);
    wrapper.appendChild(avatar);
    wrapper.appendChild(meta);
    wrapper.appendChild(select);

    return wrapper;
}

function createLoginLink(isMobile) {
    const link = document.createElement("a");
    link.href = window.TechyAuth ? window.TechyAuth.getLoginUrl() : "./login.html";
    link.textContent = "Login";
    link.className = isMobile ? "header__mobile-login" : "header__login-link";
    return link;
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
}

renderHeaderAuthState();

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
