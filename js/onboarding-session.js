// ==============================================================
// ONBOARDING SESSION HELPERS
//
// The onboarding token (from POST /api/auth/verify-account-otp) is
// intentionally kept separate from the normal login "authData" cookie
// used by auth.js/api.js - it's short-lived, scoped only to profile
// setup + set-password, and unrelated to a real logged-in session.
// Pages that use it (setup-profile.html, set-password.html) must call
// onboardingApiRequest() below rather than the shared apiRequest(),
// since apiRequest() always attaches the normal login token, not this
// one.
// ==============================================================

function getOnboardingData() {
    const raw = sessionStorage.getItem("onboardingData");
    if (!raw) {
        return null;
    }
    try {
        return JSON.parse(raw);
    } catch (error) {
        console.error("Invalid onboardingData in sessionStorage:", error);
        sessionStorage.removeItem("onboardingData");
        return null;
    }
}

/**
 * Redirects to verify-account.html if there is no onboarding session.
 * Call this at the top of any onboarding-only page.
 */
function requireOnboardingSession() {
    const data = getOnboardingData();
    if (!data || !data.onboardingToken) {
        window.location.href = "verify-account.html";
        return null;
    }
    return data;
}

function clearOnboardingSession() {
    sessionStorage.removeItem("onboardingData");
}

/**
 * Like apiRequest(), but authenticates with the onboarding token instead
 * of the normal login token, and never attempts a silent refresh (the
 * onboarding token has no refresh token pair - if it expires, the user
 * must verify the OTP again).
 */
async function onboardingApiRequest(endpoint, options = {}) {
    const onboardingData = getOnboardingData();
    if (!onboardingData || !onboardingData.onboardingToken) {
        throw new Error("Your session has expired. Please verify your email again.");
    }

    const headers = {
        "Content-Type": "application/json",
        "Authorization": `${onboardingData.tokenType || "Bearer"} ${onboardingData.onboardingToken}`,
        ...(options.headers || {})
    };

    const response = await fetch(API_BASE_URL + endpoint, {
        ...options,
        headers
    });

    let data = {};
    try {
        data = await response.json();
    } catch (error) {
        data = {};
    }

    if (!response.ok) {
        const apiError = new Error(
            data?.message || data?.error || `Request failed with status ${response.status}`
        );
        apiError.responseData = data;
        apiError.status = response.status;
        throw apiError;
    }

    return data;
}
