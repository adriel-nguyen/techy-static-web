const authTabs = document.querySelectorAll("[data-auth-tab]");
const loginFormWrap = document.getElementById("loginFormWrap");
const registerFormWrap = document.getElementById("registerFormWrap");

const modeButtons = document.querySelectorAll("[data-mode-target]");
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");

const countrySelectIds = ["loginCountryCode", "registerCountryCode"];

authTabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
        authTabs.forEach(function (item) {
            item.classList.remove("auth__tab--active");
        });

        tab.classList.add("auth__tab--active");

        if (tab.dataset.authTab === "login") {
            loginFormWrap.classList.add("auth__form-wrap--active");
            registerFormWrap.classList.remove("auth__form-wrap--active");
        } else {
            registerFormWrap.classList.add("auth__form-wrap--active");
            loginFormWrap.classList.remove("auth__form-wrap--active");
        }
    });
});

modeButtons.forEach(function (button) {
    button.addEventListener("click", function () {
        const target = button.dataset.modeTarget;
        const mode = button.dataset.mode;

        document.querySelectorAll(`[data-mode-target="${target}"]`).forEach(function (item) {
            item.classList.remove("auth__mode-button--active");
        });

        button.classList.add("auth__mode-button--active");

        document.querySelectorAll(`[data-mode-panel^="${target}-"]`).forEach(function (panel) {
            panel.classList.remove("auth__field--active");
        });

        const activePanel = document.querySelector(`[data-mode-panel="${target}-${mode}"]`);
        if (activePanel) {
            activePanel.classList.add("auth__field--active");
        }
    });
});

function setError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = message;
    }
}

function clearError(elementId) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = "";
    }
}

function markInvalid(element, isInvalid) {
    if (!element) {
        return;
    }

    element.classList.toggle("auth__input--invalid", isInvalid);
    element.classList.toggle("auth__select--invalid", isInvalid);
}

function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function normalizePhoneDigits(value) {
    return value.replace(/[^\d]/g, "");
}

function isValidPhone(countryCode, phone) {
    const digits = normalizePhoneDigits(phone);

    if (!countryCode) {
        return false;
    }

    if (digits.length < 6 || digits.length > 14) {
        return false;
    }

    const e164 = `${countryCode}${digits}`;
    return /^\+[1-9]\d{7,14}$/.test(e164);
}

function isStrongPassword(value) {
    return /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(value);
}

function allowOnlyPhoneDigits(input) {
    if (!input) {
        return;
    }

    input.addEventListener("input", function () {
        input.value = input.value.replace(/\D/g, "");
    });

    input.addEventListener("keydown", function (event) {
        const allowedKeys = [
            "Backspace",
            "Delete",
            "Tab",
            "ArrowLeft",
            "ArrowRight",
            "ArrowUp",
            "ArrowDown",
            "Home",
            "End"
        ];

        const isNumberKey = /^[0-9]$/.test(event.key);
        const isAllowedKey = allowedKeys.includes(event.key);
        const isShortcut =
            (event.ctrlKey || event.metaKey) &&
            ["a", "c", "v", "x"].includes(event.key.toLowerCase());

        if (!isNumberKey && !isAllowedKey && !isShortcut) {
            event.preventDefault();
        }
    });

    input.addEventListener("paste", function (event) {
        event.preventDefault();

        const pastedText = (event.clipboardData || window.clipboardData).getData("text");
        const digitsOnly = pastedText.replace(/\D/g, "");

        const start = input.selectionStart || 0;
        const end = input.selectionEnd || 0;
        const currentValue = input.value;

        input.value = currentValue.slice(0, start) + digitsOnly + currentValue.slice(end);

        const newCursorPosition = start + digitsOnly.length;
        input.setSelectionRange(newCursorPosition, newCursorPosition);
    });
}

async function loadCountryCodes() {
    try {
        const response = await fetch("https://restcountries.com/v3.1/all?fields=name,idd,cca2");

        if (!response.ok) {
            throw new Error("HTTP " + response.status);
        }

        const countries = await response.json();

        const mapped = countries
            .map(function (country) {
                const countryName = country.name && country.name.common ? country.name.common : "";
                const countryCode = country.cca2 || "";
                const root = country.idd && country.idd.root ? country.idd.root : "";
                const suffixes = country.idd && Array.isArray(country.idd.suffixes) ? country.idd.suffixes : [];
                const dialCode = root && suffixes.length > 0 ? `${root}${suffixes[0]}` : "";

                return {
                    name: countryName,
                    dialCode: dialCode,
                    code: countryCode
                };
            })
            .filter(function (item) {
                return item.name && item.dialCode;
            })
            .sort(function (a, b) {
                return a.name.localeCompare(b.name);
            });

        countrySelectIds.forEach(function (selectId) {
            const select = document.getElementById(selectId);
            if (!select) {
                return;
            }

            select.innerHTML = '<option value="">Code</option>';

            mapped.forEach(function (item) {
                const option = document.createElement("option");
                option.value = item.dialCode;
                option.textContent = `${item.code} (${item.dialCode})`;
                option.title = `${item.name} (${item.dialCode})`;
                option.setAttribute("data-country-name", item.name);
                select.appendChild(option);
            });

            const fallbackOption = Array.from(select.options).find(function (option) {
                return option.value === "+84";
            });

            if (fallbackOption) {
                select.value = "+84";
            }
        });
    } catch (error) {
        console.error("Failed to load country codes:", error);
    }
}

function validateLoginForm(event) {
    event.preventDefault();

    const activeModeButton = document.querySelector('[data-mode-target="login"].auth__mode-button--active');
    const mode = activeModeButton ? activeModeButton.dataset.mode : "email";

    const loginEmail = document.getElementById("loginEmail");
    const loginCountryCode = document.getElementById("loginCountryCode");
    const loginPhone = document.getElementById("loginPhone");
    const loginPassword = document.getElementById("loginPassword");

    let isValid = true;

    clearError("loginEmailError");
    clearError("loginPhoneError");
    clearError("loginPasswordError");

    markInvalid(loginEmail, false);
    markInvalid(loginCountryCode, false);
    markInvalid(loginPhone, false);
    markInvalid(loginPassword, false);

    if (mode === "email") {
        if (!loginEmail.value.trim()) {
            setError("loginEmailError", "Email is required.");
            markInvalid(loginEmail, true);
            isValid = false;
        } else if (!isValidEmail(loginEmail.value)) {
            setError("loginEmailError", "Please enter a valid email address.");
            markInvalid(loginEmail, true);
            isValid = false;
        }
    } else {
        if (!loginCountryCode.value || !loginPhone.value.trim()) {
            setError("loginPhoneError", "Country code and phone number are required.");
            markInvalid(loginCountryCode, true);
            markInvalid(loginPhone, true);
            isValid = false;
        } else if (!isValidPhone(loginCountryCode.value, loginPhone.value)) {
            setError("loginPhoneError", "Please enter a valid phone number.");
            markInvalid(loginCountryCode, true);
            markInvalid(loginPhone, true);
            isValid = false;
        }
    }

    if (!loginPassword.value.trim()) {
        setError("loginPasswordError", "Password is required.");
        markInvalid(loginPassword, true);
        isValid = false;
    }

    if (isValid) {
        console.log("Login form valid");
    }
}

function validateRegisterForm(event) {
    event.preventDefault();

    const activeModeButton = document.querySelector('[data-mode-target="register"].auth__mode-button--active');
    const mode = activeModeButton ? activeModeButton.dataset.mode : "email";

    const registerName = document.getElementById("registerName");
    const registerEmail = document.getElementById("registerEmail");
    const registerCountryCode = document.getElementById("registerCountryCode");
    const registerPhone = document.getElementById("registerPhone");
    const registerPassword = document.getElementById("registerPassword");
    const registerConfirmPassword = document.getElementById("registerConfirmPassword");
    const registerTerms = document.getElementById("registerTerms");

    let isValid = true;

    clearError("registerNameError");
    clearError("registerEmailError");
    clearError("registerPhoneError");
    clearError("registerPasswordError");
    clearError("registerConfirmPasswordError");
    clearError("registerTermsError");

    markInvalid(registerName, false);
    markInvalid(registerEmail, false);
    markInvalid(registerCountryCode, false);
    markInvalid(registerPhone, false);
    markInvalid(registerPassword, false);
    markInvalid(registerConfirmPassword, false);

    if (!registerName.value.trim()) {
        setError("registerNameError", "Full name is required.");
        markInvalid(registerName, true);
        isValid = false;
    } else if (registerName.value.trim().length < 2) {
        setError("registerNameError", "Full name must be at least 2 characters.");
        markInvalid(registerName, true);
        isValid = false;
    }

    if (mode === "email") {
        if (!registerEmail.value.trim()) {
            setError("registerEmailError", "Email is required.");
            markInvalid(registerEmail, true);
            isValid = false;
        } else if (!isValidEmail(registerEmail.value)) {
            setError("registerEmailError", "Please enter a valid email address.");
            markInvalid(registerEmail, true);
            isValid = false;
        }
    } else {
        if (!registerCountryCode.value || !registerPhone.value.trim()) {
            setError("registerPhoneError", "Country code and phone number are required.");
            markInvalid(registerCountryCode, true);
            markInvalid(registerPhone, true);
            isValid = false;
        } else if (!isValidPhone(registerCountryCode.value, registerPhone.value)) {
            setError("registerPhoneError", "Please enter a valid phone number.");
            markInvalid(registerCountryCode, true);
            markInvalid(registerPhone, true);
            isValid = false;
        }
    }

    if (!registerPassword.value.trim()) {
        setError("registerPasswordError", "Password is required.");
        markInvalid(registerPassword, true);
        isValid = false;
    } else if (!isStrongPassword(registerPassword.value)) {
        setError("registerPasswordError", "Password must be at least 8 characters and include letters and numbers.");
        markInvalid(registerPassword, true);
        isValid = false;
    }

    if (!registerConfirmPassword.value.trim()) {
        setError("registerConfirmPasswordError", "Please confirm your password.");
        markInvalid(registerConfirmPassword, true);
        isValid = false;
    } else if (registerConfirmPassword.value !== registerPassword.value) {
        setError("registerConfirmPasswordError", "Passwords do not match.");
        markInvalid(registerConfirmPassword, true);
        isValid = false;
    }

    if (!registerTerms.checked) {
        setError("registerTermsError", "You must agree before creating an account.");
        isValid = false;
    }

    if (isValid) {
        console.log("Register form valid");
    }
}

if (loginForm) {
    loginForm.addEventListener("submit", validateLoginForm);
}

if (registerForm) {
    registerForm.addEventListener("submit", validateRegisterForm);
}

allowOnlyPhoneDigits(document.getElementById("loginPhone"));
allowOnlyPhoneDigits(document.getElementById("registerPhone"));

loadCountryCodes();