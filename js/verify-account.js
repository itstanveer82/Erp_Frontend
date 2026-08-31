// ==============================================================
// VERIFY ACCOUNT (Onboarding Step 1)
//   POST /api/auth/verify-account-otp  { email, otp } -> onboarding token
//   POST /api/auth/resend-otp          { email, purpose: "ACCOUNT_SETUP" }
//
// This intentionally does NOT use the normal "authData" login cookie -
// the onboarding token is short-lived and unrelated to a real login
// session, so it is kept separately in sessionStorage under
// "onboardingData" for the other onboarding pages to read.
// ==============================================================

const verifyAccountForm = document.getElementById("verifyAccountForm");
const verifyEmailInput = document.getElementById("email");
const verifyOtpInput = document.getElementById("otp");
const verifyButton = document.getElementById("verifyButton");
const verifyButtonText = document.getElementById("verifyButtonText");
const verifyLoader = document.getElementById("verifyLoader");
const verifyError = document.getElementById("verifyError");
const successMessage = document.getElementById("successMessage");
const resendOtpButton = document.getElementById("resendOtpButton");

// Pre-fill email if it was passed in the URL (?email=...)
(function prefillEmail() {
    const params = new URLSearchParams(window.location.search);
    const emailParam = params.get("email");
    if (emailParam && verifyEmailInput) {
        verifyEmailInput.value = emailParam;
    }
})();

function clearVerifyErrors() {
    if (verifyError) {
        verifyError.textContent = "";
    }
    if (successMessage) {
        successMessage.classList.add("d-none");
        successMessage.textContent = "";
    }
    document.getElementById("emailError").textContent = "";
    document.getElementById("otpError").textContent = "";
}

if (verifyAccountForm) {
    verifyAccountForm.addEventListener("submit", async function (event) {
        event.preventDefault();
        clearVerifyErrors();

        const email = verifyEmailInput.value.trim();
        const otp = verifyOtpInput.value.trim();

        let isValid = true;
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            document.getElementById("emailError").textContent = "Please enter a valid email address.";
            isValid = false;
        }
        if (!otp || otp.length !== 6) {
            document.getElementById("otpError").textContent = "Please enter the 6-digit code.";
            isValid = false;
        }
        if (!isValid) {
            return;
        }

        verifyButton.disabled = true;
        verifyButtonText.textContent = "Verifying...";
        verifyLoader.classList.remove("d-none");

        try {
            const response = await apiRequest("/api/auth/verify-account-otp", {
                method: "POST",
                body: JSON.stringify({ email: email, otp: otp })
            });

            const data = response.data;
            if (!data || !data.onboardingToken) {
                throw new Error("Onboarding token was not returned by the server.");
            }

            // Store onboarding session separately from normal login auth data.
            sessionStorage.setItem("onboardingData", JSON.stringify({
                onboardingToken: data.onboardingToken,
                tokenType: data.tokenType || "Bearer",
                expiresIn: data.expiresIn,
                email: data.email || email,
                employeeCode: data.employeeCode || null,
                obtainedAt: Date.now()
            }));

            successMessage.textContent = "Verified! Redirecting to profile setup...";
            successMessage.classList.remove("d-none");

            setTimeout(function () {
                window.location.href = "setup-profile.html";
            }, 900);
        } catch (error) {
            console.error("OTP verification failed:", error);
            verifyError.textContent = error.responseData?.message || error.message || "Verification failed. Please try again.";
        } finally {
            verifyButton.disabled = false;
            verifyButtonText.textContent = "Verify & Continue";
            verifyLoader.classList.add("d-none");
        }
    });
}

if (resendOtpButton) {
    resendOtpButton.addEventListener("click", async function () {
        clearVerifyErrors();
        const email = verifyEmailInput.value.trim();
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            document.getElementById("emailError").textContent = "Enter your email above first, then resend.";
            return;
        }

        const originalText = resendOtpButton.textContent;
        resendOtpButton.disabled = true;
        resendOtpButton.textContent = "Sending...";

        try {
            await apiRequest("/api/auth/resend-otp", {
                method: "POST",
                body: JSON.stringify({ email: email, purpose: "ACCOUNT_SETUP" })
            });
            document.getElementById("otpMessage").textContent = "If an account exists with this email, a new code has been sent.";
        } catch (error) {
            verifyError.textContent = error.responseData?.message || error.message || "Could not resend the code. Please try again.";
        } finally {
            resendOtpButton.disabled = false;
            resendOtpButton.textContent = originalText;
        }
    });
}
