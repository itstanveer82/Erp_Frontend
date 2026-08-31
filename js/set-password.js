// ==============================================================
// SET PASSWORD (Onboarding Step 3)
//   POST /api/auth/set-password
//   Header: Authorization: Bearer <onboardingToken>
//   Body:   { password }
//
// auth-service rejects this until user-management-service confirms
// every required profile section has been submitted - if that happens,
// the error message is shown as-is with a link back to profile setup.
// ==============================================================

const setPasswordForm = document.getElementById("setPasswordForm");
const newPasswordInput = document.getElementById("newPassword");
const confirmPasswordInput = document.getElementById("confirmPassword");
const setPasswordButton = document.getElementById("setPasswordButton");
const setPasswordButtonText = document.getElementById("setPasswordButtonText");
const setPasswordLoader = document.getElementById("setPasswordLoader");
const setPasswordError = document.getElementById("setPasswordError");
const successMessage = document.getElementById("successMessage");
const setPasswordSubHeading = document.getElementById("setPasswordSubHeading");

// Guard: must have a valid onboarding session to be on this page.
const onboardingSession = requireOnboardingSession();
if (onboardingSession && onboardingSession.email && setPasswordSubHeading) {
    setPasswordSubHeading.textContent = `Create a password for ${onboardingSession.email} to finish activating your account.`;
}

function togglePasswordField(input, toggleButton, toggleText) {
    if (!toggleButton) {
        return;
    }
    toggleButton.addEventListener("click", function () {
        if (input.type === "password") {
            input.type = "text";
            toggleText.textContent = "Hide";
        } else {
            input.type = "password";
            toggleText.textContent = "Show";
        }
    });
}

togglePasswordField(
    newPasswordInput,
    document.getElementById("toggleNewPassword"),
    document.getElementById("toggleNewPasswordText")
);
togglePasswordField(
    confirmPasswordInput,
    document.getElementById("toggleConfirmPassword"),
    document.getElementById("toggleConfirmPasswordText")
);

function clearSetPasswordErrors() {
    setPasswordError.textContent = "";
    document.getElementById("newPasswordError").textContent = "";
    document.getElementById("confirmPasswordError").textContent = "";
    successMessage.classList.add("d-none");
    successMessage.textContent = "";
}

if (setPasswordForm) {
    setPasswordForm.addEventListener("submit", async function (event) {
        event.preventDefault();
        clearSetPasswordErrors();

        const password = newPasswordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        let isValid = true;
        if (!password || password.length < 8) {
            document.getElementById("newPasswordError").textContent = "Password must be at least 8 characters.";
            isValid = false;
        }
        if (password !== confirmPassword) {
            document.getElementById("confirmPasswordError").textContent = "Passwords do not match.";
            isValid = false;
        }
        if (!isValid) {
            return;
        }

        setPasswordButton.disabled = true;
        setPasswordButtonText.textContent = "Setting password...";
        setPasswordLoader.classList.remove("d-none");

        try {
            await onboardingApiRequest("/api/auth/set-password", {
                method: "POST",
                body: JSON.stringify({ password: password })
            });

            clearOnboardingSession();

            successMessage.textContent = "Account activated successfully! Redirecting to login...";
            successMessage.classList.remove("d-none");

            setTimeout(function () {
                window.location.href = "login.html";
            }, 1200);
        } catch (error) {
            console.error("Set password failed:", error);
            setPasswordError.innerHTML = error.responseData?.message || error.message ||
                "Failed to set password. Please try again.";
        } finally {
            setPasswordButton.disabled = false;
            setPasswordButtonText.textContent = "Set Password & Finish";
            setPasswordLoader.classList.add("d-none");
        }
    });
}
