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
// SHOW / HIDE PASSWORD
if (togglePassword) {
    togglePassword.addEventListener("click", function () {
        if (passwordInput.type === "password") {
            passwordInput.type = "text";
            togglePasswordText.textContent = "Hide";
            togglePassword.setAttribute("aria-label", "Hide password");
        } else {
            passwordInput.type = "password";
            togglePasswordText.textContent = "Show";
            togglePassword.setAttribute("aria-label", "Show password");
        }
    });
}
// LOGIN FORM SUBMIT
if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
        e.preventDefault();
        loginError.classList.add("d-none");
        loginError.textContent = "";
        emailInput.classList.remove("is-invalid");
        passwordInput.classList.remove("is-invalid");
        let isValid = true;
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        // Email validation
        if (email === "") {
            emailInput.classList.add("is-invalid");
            isValid = false;
        } else if (!isValidEmail(email)) {
            emailInput.classList.add("is-invalid");
            isValid = false;
        }
        // Password validation
        if (password === "") {
            passwordInput.classList.add("is-invalid");
            isValid = false;
        }
        if (!isValid) {
            showLoginError(
                "Please enter a valid email address and password."
            );
            return;
        }
        // LOGIN LOADING STATE
        loginButton.disabled = true;
        if (loginButtonText) {
            loginButtonText.textContent = "Logging in...";
        }
        if (loginLoader) {
            loginLoader.classList.remove("d-none");
        }
        // API REQUEST
        apiRequest("/api/auth/login", {
            method: "POST",
            body: JSON.stringify({
                email: email,
                password: password
            })
        })
            .then(function (data) {
                console.log("LOGIN FULL RESPONSE:", data);
                console.log("LOGIN DATA:", data.data);
                console.log("LOGIN TOKEN:", data.data?.accessToken);
                // Save authentication data
                saveAuthData(data, rememberMe.checked);
                // Redirect after successful login
                // window.location.href = "../admin/dashboard.html";
                // Edit by Araj
                const roles = data.data.user?.roles || [];
                if (roles.includes("ROLE_EMPLOYEE") && !roles.includes("ROLE_ADMIN")) {
                    window.location.href = "../employee/employee-dashboard.html";
                } else {
                    window.location.href = "../admin/dashboard.html";
                }
            })
            .catch(function (error) {
                console.error("Login failed:", error);
                showLoginError(
                    error.message || "Login failed. Please try again."
                );
                // Reset button
                loginButton.disabled = false;
                if (loginButtonText) {
                    loginButtonText.textContent = "Login";
                }
                if (loginLoader) {
                    loginLoader.classList.add("d-none");
                }
            });
    });
}
// EMAIL VALIDATION
function isValidEmail(email) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
}
// SHOW LOGIN ERROR
function showLoginError(message) {
    loginError.textContent = message;
    loginError.classList.remove("d-none");
}
// SAVE AUTHENTICATION DATA
function saveAuthData(data, remember) {
    const loginData = data.data;
    const authData = {
        token: loginData.accessToken,
        refreshToken: loginData.refreshToken,
        tokenType: loginData.tokenType,
        expiresIn: loginData.expiresIn,
        user: loginData.user,
        email: loginData.user?.email || "",
        role: Array.isArray(loginData.user?.roles)
            ? loginData.user.roles[0] || ""
            : ""
    };
    if (remember) {
        localStorage.setItem(
            "authData",
            JSON.stringify(authData)
        );
        sessionStorage.removeItem("authData");
    } else {
        sessionStorage.setItem(
            "authData",
            JSON.stringify(authData)
        );
        localStorage.removeItem("authData");
    }
}
// GET AUTHENTICATION DATA
function getAuthData() {
    const localData = localStorage.getItem("authData");
    if (localData) {
        return JSON.parse(localData);
    }
    const sessionData = sessionStorage.getItem("authData");
    if (sessionData) {
        return JSON.parse(sessionData);
    }
    return null;
}
// LOGOUT
const logoutButton = document.getElementById("logoutButton");
if (logoutButton) {
    logoutButton.addEventListener("click", function () {
        logout();
    });
}
function logout() {
    localStorage.removeItem("authData");
    sessionStorage.removeItem("authData");
    window.location.href = "../auth/login.html";
}
