const loginForm = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const rememberMe = document.getElementById("rememberMe");
const togglePassword = document.getElementById("togglePassword");
const togglePasswordText = document.getElementById("togglePasswordText");
const loginButton = document.getElementById("loginButton");
const loginButtonText = document.getElementById("loginButtonText");
const loginLoader = document.getElementById("loginLoader");
const loginError = document.getElementById("loginError");


// ============================================================
// SHOW / HIDE PASSWORD
// ============================================================

if (togglePassword) {
    togglePassword.addEventListener("click", function () {

        if (passwordInput.type === "password") {
            passwordInput.type = "text";

            if (togglePasswordText) {
                togglePasswordText.textContent = "Hide";
            }

            togglePassword.setAttribute("aria-label", "Hide password");

        } else {
            passwordInput.type = "password";

            if (togglePasswordText) {
                togglePasswordText.textContent = "Show";
            }

            togglePassword.setAttribute("aria-label", "Show password");
        }
    });
}


// ============================================================
// LOGIN FORM SUBMIT
// ============================================================

if (loginForm) {

    loginForm.addEventListener("submit", function (e) {

        e.preventDefault();

        if (loginError) {
            loginError.classList.add("d-none");
            loginError.textContent = "";
        }

        if (emailInput) {
            emailInput.classList.remove("is-invalid");
        }

        if (passwordInput) {
            passwordInput.classList.remove("is-invalid");
        }

        let isValid = true;

        const email = emailInput ? emailInput.value.trim() : "";
        const password = passwordInput ? passwordInput.value : "";

        if (email === "") {
            emailInput.classList.add("is-invalid");
            isValid = false;
        } else if (!isValidEmail(email)) {
            emailInput.classList.add("is-invalid");
            isValid = false;
        }

        if (password === "") {
            passwordInput.classList.add("is-invalid");
            isValid = false;
        }

        if (!isValid) {
            showLoginError("Please enter a valid email address and password.");
            return;
        }

        if (loginButton) {
            loginButton.disabled = true;
        }

        if (loginButtonText) {
            loginButtonText.textContent = "Logging in...";
        }

        if (loginLoader) {
            loginLoader.classList.remove("d-none");
        }

        apiRequest("/api/auth/login", {
            method: "POST",
            body: JSON.stringify({ email: email, password: password })
        })

            .then(function (data) {

                console.log("LOGIN FULL RESPONSE:", data);
                console.log("LOGIN DATA:", data?.data);
                console.log("LOGIN TOKEN:", data?.data?.accessToken);

                if (!data || !data.data) {
                    throw new Error("Invalid login response from server.");
                }

                if (!data.data.accessToken) {
                    throw new Error("Access token was not returned by the server.");
                }

                saveAuthData(data, rememberMe ? rememberMe.checked : false);

                // Backend ek hi role string bhejta hai (jaise "ROLE_ADMIN"),
                // array nahi - isliye seedha use karo
                const role = data.data.role || "";

                console.log("USER ROLE:", role);

                if (role === "ROLE_EMPLOYEE") {
                    window.location.href = "../employee/dashboard.html";
                } else {
                    window.location.href = "../admin/dashboard.html";
                }

            })

            .catch(function (error) {

                console.error("Login failed:", error);

                showLoginError(error.message || "Login failed. Please try again.");

                if (loginButton) {
                    loginButton.disabled = false;
                }

                if (loginButtonText) {
                    loginButtonText.textContent = "Login";
                }

                if (loginLoader) {
                    loginLoader.classList.add("d-none");
                }
            });
    });
}


// ============================================================
// EMAIL VALIDATION
// ============================================================

function isValidEmail(email) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
}


// ============================================================
// SHOW LOGIN ERROR
// ============================================================

function showLoginError(message) {
    if (!loginError) return;
    loginError.textContent = message;
    loginError.classList.remove("d-none");
}


// ============================================================
// COOKIE HELPERS
// ============================================================

function setCookie(name, value, days) {

    let expires = "";

    if (days !== null && days !== undefined && days > 0) {
        const date = new Date();
        date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
        expires = "; expires=" + date.toUTCString();
    }

    const secureFlag = location.protocol === "https:" ? "; Secure" : "";

    document.cookie =
        name + "=" + encodeURIComponent(value) +
        expires + "; path=/" + "; SameSite=Lax" + secureFlag;
}

function getCookie(name) {
    const cookieName = name + "=";
    const cookies = document.cookie.split(";");

    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.indexOf(cookieName) === 0) {
            return decodeURIComponent(cookie.substring(cookieName.length));
        }
    }

    return null;
}

function deleteCookie(name) {
    document.cookie =
        name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax";
}


// ============================================================
// SAVE / GET AUTHENTICATION DATA
// ============================================================

function saveAuthData(data, remember) {

    const loginData = data?.data;

    if (!loginData) {
        throw new Error("Invalid authentication data.");
    }

    const authData = {
        accessToken: loginData.accessToken || null,
        refreshToken: loginData.refreshToken || null,
        email: loginData.email || "",
        name: loginData.fullName || "",
        role: loginData.role || "",
        isLogin: !!loginData.accessToken,
        remember: !!remember
    };

    setCookie("authData", JSON.stringify(authData), remember ? 7 : null);

    localStorage.removeItem("authData");
    sessionStorage.removeItem("authData");
}

function getAuthData() {

    const cookieData = getCookie("authData");

    if (!cookieData) {
        return null;
    }

    try {
        return JSON.parse(cookieData);
    } catch (error) {
        console.error("Invalid authData cookie:", error);
        deleteCookie("authData");
        return null;
    }
}

function isUserLoggedIn() {
    const auth = getAuthData();
    return !!(auth && auth.isLogin);
}


// ============================================================
// REFRESH ACCESS TOKEN
// ============================================================

let refreshInFlight = null;

async function refreshAccessToken() {

    if (refreshInFlight) {
        return refreshInFlight;
    }

    refreshInFlight = (async function () {

        const response = await fetch(
            API_BASE_URL + "/api/auth/refresh-token",
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include"
            }
        );

        let data = {};

        try {
            data = await response.json();
        } catch (error) {
            data = {};
        }

        console.log("REFRESH STATUS:", response.status);
        console.log("REFRESH RESPONSE:", data);

        if (!response.ok || data?.success === false) {
            throw new Error(data?.message || "Session expired. Please log in again.");
        }

        const newAccessToken = data?.data?.accessToken;

        if (!newAccessToken) {
            throw new Error("Refresh response did not contain an access token.");
        }

        const current = getAuthData();
        saveAuthData(data, current ? current.remember : false);

        return newAccessToken;

    })();

    try {
        return await refreshInFlight;
    } finally {
        refreshInFlight = null;
    }
}


// ============================================================
// LOGOUT
// ============================================================

const logoutButton = document.getElementById("logoutButton");

if (logoutButton) {
    logoutButton.addEventListener("click", function () {
        logout();
    });
}

async function logout() {

    // Debug helper - agar kabhi unexpected logout ho to
    // Console tab me yahan se poora call-stack dikhega
    console.trace("LOGOUT TRIGGERED FROM:");

    try {
        await apiRequest("/api/auth/logout", { method: "POST" });
    } catch (error) {
        console.error("Logout API failed (proceeding with local logout):", error);
    }

    deleteCookie("authData");
    localStorage.removeItem("authData");
    sessionStorage.removeItem("authData");

    window.location.href = "../auth/login.html";
}