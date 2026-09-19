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
                        : (data.data.role ? [data.data.role] : []);


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
                        "../employee/dashboard.html";

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
            loginData.user?.email ||
            loginData.email ||           // ← real API: flat "email"
            "",

        role:
            Array.isArray(loginData.user?.roles)
                ? loginData.user.roles[0] || ""
                : (loginData.role || ""),

        // Remember-me state is needed when
        // the access token is refreshed.
        remember: !!remember
    };


    // Remember me checked:
    // persistent storage (survives browser close).
    //
    // Remember me unchecked:
    // sessionStorage (cleared when tab/browser closes).
    //
    // NOTE: cookies have a ~4KB size limit — a user object with
    // roles/permissions/department data can silently exceed that,
    // so the cookie never actually gets saved and the person gets
    // bounced straight back to login after a "successful" login.
    // localStorage/sessionStorage have no such limit.

    if (remember) {
        localStorage.setItem("authData", JSON.stringify(authData));
        sessionStorage.removeItem("authData");
    } else {
        sessionStorage.setItem("authData", JSON.stringify(authData));
        localStorage.removeItem("authData");
    }

    // Remove old cookie-based auth data
    deleteCookie("authData");
}


// ============================================================
// GET AUTHENTICATION DATA
// ============================================================

function getAuthData() {

    const raw =
        localStorage.getItem("authData") ||
        sessionStorage.getItem("authData");


    if (!raw) {
        return null;
    }


    try {

        return JSON.parse(raw);

    } catch (error) {

        console.error(
            "Invalid authData:",
            error
        );

        // Remove corrupted data
        localStorage.removeItem("authData");
        sessionStorage.removeItem("authData");

        return null;
    }
}

let refreshInFlight = null;

// async function refreshAccessToken() {

//     if (refreshInFlight) {
//         return refreshInFlight;
//     }

//     refreshInFlight = (async function () {

//         const response = await fetch(
//             API_BASE_URL + "/api/auth/refresh-token",
//             {
//                 method: "POST",
//                 headers: {
//                     "Content-Type": "application/json"
//                 },
//                 credentials: "include"
//             }
//         );

//         let data = {};

//         try {
//             data = await response.json();
//         } catch (error) {
//             data = {};
//         }

//         console.log("REFRESH STATUS:", response.status);
//         console.log("REFRESH RESPONSE:", data);

//         if (!response.ok || data?.success === false) {
//             throw new Error(
//                 data?.message ||
//                 "Session expired. Please login again."
//             );
//         }

//         const newAccessToken =
//             data?.data?.accessToken;

//         if (!newAccessToken) {
//             throw new Error(
//                 "Refresh response did not contain an access token."
//             );
//         }

//         const current = getAuthData();

//         if (!current) {
//             throw new Error(
//                 "Authentication data not found."
//             );
//         }

//         /*
//          * Backend refresh endpoint returns a new LoginResponse.
//          * Keep the new access token and all current user information.
//          */
//         const updatedAuthData = {
//             ...current,
//             token: newAccessToken,

//             /*
//              * Backend currently returns the refresh token
//              * again in the response.
//              */
//             refreshToken:
//                 data?.data?.refreshToken ||
//                 current.refreshToken,

//             tokenType:
//                 data?.data?.tokenType ||
//                 current.tokenType ||
//                 "Bearer",

//             expiresIn:
//                 data?.data?.expiresIn ||
//                 current.expiresIn ||
//                 null
//         };

//         // if (current.remember) {

//         //     localStorage.setItem(
//         //         "authData",
//         //         JSON.stringify(updatedAuthData)
//         //     );

//         // } else {

//         //     sessionStorage.setItem(
//         //         "authData",
//         //         JSON.stringify(updatedAuthData)
//         //     );
//         // }

//         console.log(
//             "ACCESS TOKEN REFRESHED SUCCESSFULLY"
//         );

//         return newAccessToken;

//     })();

//     try {
//         return await refreshInFlight;
//     } finally {
//         refreshInFlight = null;
//     }
// }

// ============================================================
// LOGOUT
// ============================================================

async function refreshAccessToken() {

    if (refreshInFlight) {
        return refreshInFlight;
    }

    refreshInFlight = (async function () {

        const response = await fetch(
            API_BASE_URL + "/api/auth/refresh-token",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
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
            throw new Error(
                data?.message ||
                "Session expired. Please login again."
            );
        }

        const newAccessToken =
            data?.data?.accessToken;

        if (!newAccessToken) {
            throw new Error(
                "Refresh response did not contain an access token."
            );
        }

        const current = getAuthData();

        if (!current) {
            throw new Error("Authentication data not found.");
        }

        const updatedAuthData = {
            ...current,
            token: newAccessToken,

            tokenType:
                data?.data?.tokenType ||
                current.tokenType ||
                "Bearer",

            expiresIn:
                data?.data?.expiresIn ||
                current.expiresIn ||
                null
        };

        // Save NEW access token
        if (localStorage.getItem("authData")) {

            localStorage.setItem(
                "authData",
                JSON.stringify(updatedAuthData)
            );

        } else {

            sessionStorage.setItem(
                "authData",
                JSON.stringify(updatedAuthData)
            );
        }

        console.log("NEW ACCESS TOKEN SAVED");

        return newAccessToken;

    })();

    try {
        return await refreshInFlight;
    } finally {
        refreshInFlight = null;
    }
}


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
async function logout() {

    try {
        // Call backend so the session/token is invalidated server-side too
        await apiRequest("/api/auth/logout", { method: "POST" });
    } catch (error) {
        console.error("Logout API failed (proceeding with local logout):", error);
    }

    // Delete authentication cookie
    deleteCookie("authData");

    // Clean up any old storage data
    localStorage.removeItem("authData");
    sessionStorage.removeItem("authData");

    // Go back to login page
    window.location.href = "../auth/login.html";
}