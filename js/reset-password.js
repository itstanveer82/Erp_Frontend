const form = document.getElementById("resetPasswordForm");

const newPassword = document.getElementById("newPassword");
const confirmPassword = document.getElementById("confirmPassword");
const otp = document.getElementById("otp");

const otpError = document.getElementById("otpError");
const newPasswordError = document.getElementById("newPasswordError");
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


//              SHOW / HIDE NEW PASSWORD

const toggleNewPassword =
    document.getElementById("toggleNewPassword");

const toggleNewPasswordText =
    document.getElementById("toggleNewPasswordText");

if (toggleNewPassword) {

    toggleNewPassword.addEventListener("click", function () {

        if (newPassword.type === "password") {

            newPassword.type = "text";
            toggleNewPasswordText.textContent = "Hide";

        } else {

            newPassword.type = "password";
            toggleNewPasswordText.textContent = "Show";

        }

    });

}


//          SHOW / HIDE CONFIRM PASSWORD

const toggleConfirmPassword =
    document.getElementById("toggleConfirmPassword");

const toggleConfirmPasswordText =
    document.getElementById("toggleConfirmPasswordText");

if (toggleConfirmPassword) {

    toggleConfirmPassword.addEventListener("click", function () {

        if (confirmPassword.type === "password") {

            confirmPassword.type = "text";
            toggleConfirmPasswordText.textContent = "Hide";

        } else {

            confirmPassword.type = "password";
            toggleConfirmPasswordText.textContent = "Show";

        }

    });

}

//                  RESET PASSWORD

if (form) {

    form.addEventListener("submit", async function (e) {

        e.preventDefault();

// Clear messages

        otpError.textContent = "";
        newPasswordError.textContent = "";
        confirmPasswordError.textContent = "";
        resetError.textContent = "";

        successMessage.textContent = "";
        successMessage.classList.add("d-none");


// Get values

        const otpValue = otp.value.trim();
        const passwordValue = newPassword.value.trim();
        const confirmValue = confirmPassword.value.trim();


//                  OTP VALIDATION

        if (otpValue === "") {

            otpError.textContent =
                "OTP is required.";

            return;
        }

        if (!/^\d{6}$/.test(otpValue)) {

            otpError.textContent =
                "Please enter a valid 6-digit OTP.";

            return;
        }


//              PASSWORD VALIDATION

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


//              CONFIRM PASSWORD

        if (confirmValue === "") {

            confirmPasswordError.textContent =
                "Please confirm your password.";

            return;
        }

        if (passwordValue !== confirmValue) {

            confirmPasswordError.textContent =
                "Passwords do not match.";

            return;
        }


//              EMAIL

        const resetEmail =
            sessionStorage.getItem("resetEmail");

        console.log("Reset Email:", resetEmail);
        console.log("OTP:", otpValue);
        console.log("New Password:", passwordValue);


        if (!resetEmail) {

            resetError.textContent =
                "Email session expired. Please request OTP again.";

            return;
        }


//                  LOADING

        resetPasswordButton.disabled = true;

        resetPasswordButtonText.textContent =
            "Resetting Password...";

        resetPasswordLoader.classList.remove("d-none");


//                  API

        try {

            const data = await apiRequest(
                "/api/auth/reset-password",
                {
                    method: "POST",

                    body: JSON.stringify({
                        email: resetEmail,
                        otp: otpValue,
                        newPassword: passwordValue
                    })
                }
            );

            console.log(
                "Reset Password Response:",
                data
            );

//                  SUCCESS

            successMessage.textContent =
                data.message ||
                "Password reset successfully.";

            successMessage.classList.remove("d-none");

            sessionStorage.removeItem("resetEmail");


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

            resetPasswordLoader.classList.add("d-none");

        }

    });

}