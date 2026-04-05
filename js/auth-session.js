(function () {
    const STORAGE_KEY = "techy-auth-session";
    const DEMO_EMAIL = "admin@example.com";
    const DEMO_PASSWORD = "123456";

    function getSession() {
        try {
            const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
            return parsed && parsed.email ? parsed : null;
        } catch (error) {
            return null;
        }
    }

    function isAuthenticated() {
        return Boolean(getSession());
    }

    function signIn(email, password) {
        const normalizedEmail = String(email || "").trim().toLowerCase();

        if (normalizedEmail !== DEMO_EMAIL || password !== DEMO_PASSWORD) {
            return false;
        }

        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            email: DEMO_EMAIL,
            name: "Admin"
        }));

        return true;
    }

    function signOut() {
        localStorage.removeItem(STORAGE_KEY);
    }

    function getRedirectUrl() {
        const params = new URLSearchParams(window.location.search);
        const redirect = params.get("redirect");

        if (!redirect) {
            return "./index.html";
        }

        if (redirect.indexOf("://") !== -1 || redirect.startsWith("//")) {
            return "./index.html";
        }

        return redirect;
    }

    function requireAuth() {
        if (isAuthenticated()) {
            return true;
        }

        const currentPath = window.location.pathname.split("/").pop() || "index.html";
        const redirect = encodeURIComponent("./" + currentPath + window.location.search);
        window.location.replace("./login.html?redirect=" + redirect);
        return false;
    }

    function redirectIfAuthenticated() {
        if (!isAuthenticated()) {
            return false;
        }

        window.location.replace(getRedirectUrl());
        return true;
    }

    window.TechyAuth = {
        demoEmail: DEMO_EMAIL,
        demoPassword: DEMO_PASSWORD,
        getRedirectUrl: getRedirectUrl,
        getSession: getSession,
        isAuthenticated: isAuthenticated,
        redirectIfAuthenticated: redirectIfAuthenticated,
        requireAuth: requireAuth,
        signIn: signIn,
        signOut: signOut
    };
})();
