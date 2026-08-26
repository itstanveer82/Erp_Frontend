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

            togglePassword.setAttribute(
                "aria-label",
                "Hide password"
            );

        } else {
            passwordInput.type = "password";

            if (togglePasswordText) {
                togglePasswordText.textContent = "Show";
            }

            togglePassword.setAttribute(
                "aria-label",
                "Show password"
            );
        }
    });
}


// ============================================================
// LOGIN FORM SUBMIT
// ============================================================

if (loginForm) {

    loginForm.addEventListener("submit", function (e) {

        e.preventDefault();

        // Clear previous errors
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

        const email = emailInput
            ? emailInput.value.trim()
            : "";

        const password = passwordInput
            ? passwordInput.value
            : "";


        // ========================================================
        // EMAIL VALIDATION
        // ========================================================

        if (email === "") {

            emailInput.classList.add("is-invalid");
            isValid = false;

        } else if (!isValidEmail(email)) {

            emailInput.classList.add("is-invalid");
            isValid = false;
        }


        // ========================================================
        // PASSWORD VALIDATION
        // ========================================================

        if (password === "") {

            passwordInput.classList.add("is-invalid");
            isValid = false;
        }


        // Stop if validation failed
        if (!isValid) {

            showLoginError(
                "Please enter a valid email address and password."
            );

            return;
        }


        // ========================================================
        // LOGIN LOADING STATE
        // ========================================================

        if (loginButton) {
            loginButton.disabled = true;
        }

        if (loginButtonText) {
            loginButtonText.textContent = "Logging in...";
        }

        if (loginLoader) {
            loginLoader.classList.remove("d-none");
        }


        // ========================================================
        // LOGIN API REQUEST
        // ========================================================

        apiRequest("/api/auth/login", {
            method: "POST",
            body: JSON.stringify({
                email: email,
                password: password
            })
        })

            .then(function (data) {

                console.log(
                    "LOGIN FULL RESPONSE:",
                    data
                );

                console.log(
                    "LOGIN DATA:",
                    data?.data
                );

                console.log(
                    "LOGIN TOKEN:",
                    data?.data?.accessToken
                );


                // ==================================================
                // VALIDATE LOGIN RESPONSE
                // ==================================================

                if (!data || !data.data) {
                    throw new Error(
                        "Invalid login response from server."
                    );
                }

                if (!data.data.accessToken) {
                    throw new Error(
                        "Access token was not returned by the server."
                    );
                }


                // ==================================================
                // SAVE AUTH DATA
                // ==================================================

                saveAuthData(
                    data,
                    rememberMe ? rememberMe.checked : false
                );


                // ==================================================
                // GET USER ROLES
                // ==================================================

                const roles =
                    Array.isArray(data.data.user?.roles)
                        ? data.data.user.roles
                        : [];


                console.log(
                    "USER ROLES:",
                    roles
                );


                // ==================================================
                // REDIRECT BASED ON ROLE
                // ==================================================

                if (
                    roles.includes("ROLE_EMPLOYEE") &&
                    !roles.includes("ROLE_ADMIN")
                ) {

                    window.location.href =
                        "../employee/employee-dashboard.html";

                } else {

                    window.location.href =
                        "../admin/dashboard.html";
                }

            })

            .catch(function (error) {

                console.error(
                    "Login failed:",
                    error
                );


                showLoginError(
                    error.message ||
                    "Login failed. Please try again."
                );


                // ==================================================
                // RESET LOGIN BUTTON
                // ==================================================

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

    const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return emailPattern.test(email);
}


// ============================================================
// SHOW LOGIN ERROR
// ============================================================

function showLoginError(message) {

    if (!loginError) {
        return;
    }

    loginError.textContent = message;
    loginError.classList.remove("d-none");
}


// ============================================================
// COOKIE HELPERS
// ============================================================

// Set cookie.
//
// If days is null/undefined/0,
// the cookie becomes a session cookie.

function setCookie(name, value, days) {

    let expires = "";

    if (
        days !== null &&
        days !== undefined &&
        days > 0
    ) {

        const date = new Date();

        date.setTime(
            date.getTime() +
            days * 24 * 60 * 60 * 1000
        );

        expires =
            "; expires=" +
            date.toUTCString();
    }


    const secureFlag =
        location.protocol === "https:"
            ? "; Secure"
            : "";


    document.cookie =
        name +
        "=" +
        encodeURIComponent(value) +
        expires +
        "; path=/" +
        "; SameSite=Lax" +
        secureFlag;
}


// ============================================================
// GET COOKIE
// ============================================================

function getCookie(name) {

    const cookieName = name + "=";

    const cookies = document.cookie.split(";");

    for (let i = 0; i < cookies.length; i++) {

        const cookie = cookies[i].trim();

        if (cookie.indexOf(cookieName) === 0) {

            return decodeURIComponent(
                cookie.substring(cookieName.length)
            );
        }
    }

    return null;
}


// ============================================================
// DELETE COOKIE
// ============================================================

function deleteCookie(name) {

    document.cookie =
        name +
        "=; expires=Thu, 01 Jan 1970 00:00:00 UTC;" +
        " path=/; SameSite=Lax";
}


// ============================================================
// SAVE AUTHENTICATION DATA
// ============================================================

function saveAuthData(data, remember) {

    const loginData = data?.data;

    if (!loginData) {
        throw new Error(
            "Invalid authentication data."
        );
    }


    const authData = {

        token: loginData.accessToken || null,

        refreshToken:
            loginData.refreshToken || null,

        tokenType:
            loginData.tokenType || "Bearer",

        expiresIn:
            loginData.expiresIn || null,

        user:
            loginData.user || null,

        email:
            loginData.user?.email || "",

        role:
            Array.isArray(loginData.user?.roles)
                ? loginData.user.roles[0] || ""
                : "",

        // Remember-me state is needed when
        // the access token is refreshed.
        remember: !!remember
    };


    // Remember me checked:
    // persistent cookie for 7 days.
    //
    // Remember me unchecked:
    // session cookie.

    setCookie(
        "authData",
        JSON.stringify(authData),
        remember ? 7 : null
    );


    // Remove old storage-based auth data
    localStorage.removeItem("authData");
    sessionStorage.removeItem("authData");
}


// ============================================================
// GET AUTHENTICATION DATA
// ============================================================

function getAuthData() {

    const cookieData =
        getCookie("authData");


    if (!cookieData) {
        return null;
    }


    try {

        return JSON.parse(cookieData);

    } catch (error) {

        console.error(
            "Invalid authData cookie:",
            error
        );

        // Remove corrupted cookie
        deleteCookie("authData");

        return null;
    }
}


// ============================================================
// REFRESH ACCESS TOKEN
// ============================================================
//
// IMPORTANT:
//
// Do NOT call apiRequest() here.
//
// We intentionally use fetch() directly so that:
//
// /api/auth/refresh-token
//
// does not trigger another refresh attempt.
//
// This prevents an infinite refresh loop.
//

let refreshInFlight = null;


async function refreshAccessToken() {

    const current = getAuthData();


    // ----------------------------------------------------------
    // No refresh token
    // ----------------------------------------------------------

    if (
        !current ||
        !current.refreshToken
    ) {

        throw new Error(
            "No refresh token available."
        );
    }


    // ----------------------------------------------------------
    // If another refresh request is already running,
    // reuse its promise.
    // ----------------------------------------------------------

    if (refreshInFlight) {

        return refreshInFlight;
    }


    // ----------------------------------------------------------
    // Start refresh request
    // ----------------------------------------------------------

    refreshInFlight = (async function () {

        const response = await fetch(
            API_BASE_URL +
            "/api/auth/refresh-token",
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({
                    refreshToken:
                        current.refreshToken
                })
            }
        );


        // ------------------------------------------------------
        // Parse response
        // ------------------------------------------------------

        let data = {};

        try {

            data = await response.json();

        } catch (error) {

            data = {};
        }


        console.log(
            "REFRESH STATUS:",
            response.status
        );

        console.log(
            "REFRESH RESPONSE:",
            data
        );


        // ------------------------------------------------------
        // Refresh failed
        // ------------------------------------------------------

        if (
            !response.ok ||
            data?.success === false
        ) {

            throw new Error(
                data?.message ||
                "Session expired. Please log in again."
            );
        }


        // ------------------------------------------------------
        // Validate new access token
        // ------------------------------------------------------

        const newAccessToken =
            data?.data?.accessToken;


        if (!newAccessToken) {

            throw new Error(
                "Refresh response did not contain an access token."
            );
        }


        // ------------------------------------------------------
        // Save new authentication data
        //
        // Keep the original remember-me setting.
        // ------------------------------------------------------

        saveAuthData(
            data,
            current.remember
        );


        return newAccessToken;

    })();


    // ----------------------------------------------------------
    // Always clear the shared promise after completion
    // ----------------------------------------------------------

    try {

        return await refreshInFlight;

    } finally {

        refreshInFlight = null;
    }
}


// ============================================================
// LOGOUT
// ============================================================

const logoutButton =
    document.getElementById("logoutButton");


if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        function () {

            logout();
        }
    );
}


// ============================================================
// LOGOUT FUNCTION
// ============================================================

function logout() {

    // Delete authentication cookie
    deleteCookie("authData");

    // Clean up any old storage data
    localStorage.removeItem("authData");
    sessionStorage.removeItem("authData");


    // Go back to login page
    window.location.href =
        "../auth/login.html";
}