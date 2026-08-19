const form = document.getElementById("resetPasswordForm");

const newPassword = document.getElementById("newPassword");
const confirmPassword = document.getElementById("confirmPassword");

const newPasswordError =
    document.getElementById("newPasswordError");

const confirmPasswordError =
    document.getElementById("confirmPasswordError");

const successMessage =
    document.getElementById("successMessage");

const resetError =
    document.getElementById("resetError");

const resetPasswordButton =
    document.getElementById("resetPasswordButton");

const resetPasswordButtonText =
    document.getElementById("resetPasswordButtonText");

const resetPasswordLoader =
    document.getElementById("resetPasswordLoader");


// =================================
// SHOW / HIDE NEW PASSWORD
// =================================

const toggleNewPassword =
    document.getElementById("toggleNewPassword");

const toggleNewPasswordText =
    document.getElementById("toggleNewPasswordText");


if (toggleNewPassword) {

    toggleNewPassword.addEventListener(
        "click",
        function () {

            if (newPassword.type === "password") {

                newPassword.type = "text";

                toggleNewPasswordText.textContent =
                    "Hide";

            } else {

                newPassword.type = "password";

                toggleNewPasswordText.textContent =
                    "Show";

            }

        }
    );

}


// =================================
// SHOW / HIDE CONFIRM PASSWORD
// =================================

const toggleConfirmPassword =
    document.getElementById("toggleConfirmPassword");

const toggleConfirmPasswordText =
    document.getElementById(
        "toggleConfirmPasswordText"
    );


if (toggleConfirmPassword) {

    toggleConfirmPassword.addEventListener(
        "click",
        function () {

            if (confirmPassword.type === "password") {

                confirmPassword.type = "text";

                toggleConfirmPasswordText.textContent =
                    "Hide";

            } else {

                confirmPassword.type = "password";

                toggleConfirmPasswordText.textContent =
                    "Show";

            }

        }
    );

}


// =================================
// GET TOKEN FROM URL
// Example:
// reset-password.html?token=abc123
// =================================

const urlParams = new URLSearchParams(
    window.location.search
);

const token = urlParams.get("token");


// =================================
// FORM SUBMIT
// =================================

if (form) {

    form.addEventListener(
        "submit",
        async function (e) {

            e.preventDefault();


            // Clear old messages

            newPasswordError.textContent = "";

            confirmPasswordError.textContent = "";

            resetError.textContent = "";

            successMessage.textContent = "";

            successMessage.classList.add("d-none");


            const passwordValue =
                newPassword.value.trim();

            const confirmValue =
                confirmPassword.value.trim();


            // New password validation

            if (passwordValue === "") {

                newPasswordError.textContent =
                    "New password is required.";

                return;

            }


            if (passwordValue.length < 6) {

                newPasswordError.textContent =
                    "Password must be at least 6 characters.";

                return;

            }


            // Confirm password validation

            if (confirmValue === "") {

                confirmPasswordError.textContent =
                    "Please confirm your password.";

                return;

            }


            // Password match

            if (passwordValue !== confirmValue) {

                confirmPasswordError.textContent =
                    "Passwords do not match.";

                return;

            }


            // Token validation

            if (!token) {

                resetError.textContent =
                    "Invalid or missing reset token.";

                return;

            }


            // Loading state

            resetPasswordButton.disabled = true;

            resetPasswordButtonText.textContent =
                "Resetting Password...";

            resetPasswordLoader.classList.remove(
                "d-none"
            );


            try {

                const data = await apiRequest(
                    "/api/auth/reset-password",
                    {

                        method: "POST",

                        body: JSON.stringify({
                            token: token,
                            newPassword: passwordValue
                        })

                    }
                );


                console.log(
                    "Reset Password Response:",
                    data
                );


                successMessage.textContent =
                    data.message ||
                    "Password reset successfully.";

                successMessage.classList.remove(
                    "d-none"
                );


                // Optional redirect after success

                setTimeout(function () {

                    window.location.href =
                        "login.html";

                }, 2000);


            } catch (error) {

                console.error(
                    "Reset Password Error:",
                    error
                );


                resetError.textContent =
                    error.message ||
                    "Password reset failed. Please try again.";


            } finally {

                resetPasswordButton.disabled = false;

                resetPasswordButtonText.textContent =
                    "Reset Password";

                resetPasswordLoader.classList.add(
                    "d-none"
                );

            }

        }
    );

}