(function () {
    const accountNameNode = document.getElementById("accountName");
    const accountEmailNode = document.getElementById("accountEmail");
    const logoutButton = document.getElementById("logoutButton");

    if (!window.TechyAuth) {
        return;
    }

    const session = window.TechyAuth.getSession();

    if (accountNameNode) {
        accountNameNode.textContent = session && session.name ? session.name : "Admin";
    }

    if (accountEmailNode) {
        accountEmailNode.textContent = session && session.email ? session.email : window.TechyAuth.demoEmail;
    }

    if (logoutButton) {
        logoutButton.addEventListener("click", function () {
            window.TechyAuth.signOut();
            window.location.href = "./login.html";
        });
    }
})();
