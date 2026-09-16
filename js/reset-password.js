// ============================================================
// RESET PASSWORD PAGE
// OTP VERIFY + PASSWORD RESET
// ============================================================


// ============================================================
// DOM ELEMENTS
// ============================================================

const form = document.getElementById("resetPasswordForm");

const otp = document.getElementById("otp");

const newPassword =
    document.getElementById("newPassword");

const confirmPassword =
    document.getElementById("confirmPassword");


// OTP
const verifyOtpButton =
    document.getElementById("verifyOtpButton");

const verifyOtpIcon =
    document.getElementById("verifyOtpIcon");

const otpMessage =
    document.getElementById("otpMessage");

const otpError =
    document.getElementById("otpError");


// Password errors
const newPasswordError =
    document.getElementById("newPasswordError");

const confirmPasswordError =
    document.getElementById("confirmPasswordError");


// General messages
const successMessage =
    document.getElementById("successMessage");

const resetError =
    document.getElementById("resetError");


// Reset button
const resetPasswordButton =
    document.getElementById("resetPasswordButton");

const resetPasswordButtonText =
    document.getElementById("resetPasswordButtonText");

const resetPasswordLoader =
    document.getElementById("resetPasswordLoader");


// ============================================================
// PASSWORD TOGGLE
// ============================================================

const toggleNewPassword =
    document.getElementById("toggleNewPassword");

const toggleNewPasswordText =
    document.getElementById("toggleNewPasswordText");


const toggleConfirmPassword =
    document.getElementById("toggleConfirmPassword");

const toggleConfirmPasswordText =
    document.getElementById("toggleConfirmPasswordText");


// ============================================================
// OTP STATE
// ============================================================

// OTP successfully verified or not
let otpVerified = false;

// Token returned from /verify-otp
let resetToken = null;

// OTP that was verified
let verifiedOtpValue = "";


// ============================================================
// INITIAL STATE
// ============================================================

function setInitialState() {

    // Password fields disabled
    if (newPassword) {

        newPassword.disabled = true;

        newPassword.placeholder =
            "Verify OTP first";
    }


    if (confirmPassword) {

        confirmPassword.disabled = true;

        confirmPassword.placeholder =
            "Verify OTP first";
    }


    // Reset button disabled
    if (resetPasswordButton) {

        resetPasswordButton.disabled = true;
    }


    // OTP verify button enabled
    if (verifyOtpButton) {

        verifyOtpButton.disabled = false;

        verifyOtpButton.classList.remove(
            "otp-verifying",
            "otp-success",
            "otp-error"
        );
    }


    if (verifyOtpIcon) {

        verifyOtpIcon.textContent = "✓";
    }


    if (otpMessage) {

        otpMessage.textContent = "";
        otpMessage.className = "otp-message";
    }


    if (otpError) {

        otpError.textContent = "";
    }

}


// Run initial state
setInitialState();


// ============================================================
// SHOW / HIDE NEW PASSWORD
// ============================================================

if (toggleNewPassword) {

    toggleNewPassword.addEventListener(
        "click",
        function () {

            // Don't allow toggle while disabled
            if (newPassword.disabled) {
                return;
            }


            if (newPassword.type === "password") {

                newPassword.type = "text";

                if (toggleNewPasswordText) {

                    toggleNewPasswordText.textContent =
                        "Hide";
                }

            } else {

                newPassword.type = "password";

                if (toggleNewPasswordText) {

                    toggleNewPasswordText.textContent =
                        "Show";
                }

            }

        }
    );

}


// ============================================================
// SHOW / HIDE CONFIRM PASSWORD
// ============================================================

if (toggleConfirmPassword) {

    toggleConfirmPassword.addEventListener(
        "click",
        function () {

            // Don't allow toggle while disabled
            if (confirmPassword.disabled) {
                return;
            }


            if (confirmPassword.type === "password") {

                confirmPassword.type = "text";

                if (toggleConfirmPasswordText) {

                    toggleConfirmPasswordText.textContent =
                        "Hide";
                }

            } else {

                confirmPassword.type = "password";

                if (toggleConfirmPasswordText) {

                    toggleConfirmPasswordText.textContent =
                        "Show";
                }

            }

        }
    );

}


// ============================================================
// OTP INPUT CHANGE
// ============================================================

// Jab user OTP change karega,
// previous verification invalid ho jayegi.

if (otp) {

    otp.addEventListener(
        "input",
        function () {

            // Allow only numbers
            this.value =
                this.value.replace(/\D/g, "");


            // Maximum 6 digits
            if (this.value.length > 6) {

                this.value =
                    this.value.substring(0, 6);
            }


            // If OTP was already verified
            if (
                otpVerified &&
                this.value !== verifiedOtpValue
            ) {

                invalidateOtpVerification();
            }


            // Clear OTP error while typing
            if (otpError) {

                otpError.textContent = "";
            }

        }
    );

}


// ============================================================
// INVALIDATE OTP VERIFICATION
// ============================================================

function invalidateOtpVerification() {

    otpVerified = false;

    resetToken = null;

    verifiedOtpValue = "";


    // Disable password fields
    if (newPassword) {

        newPassword.disabled = true;

        newPassword.placeholder =
            "Verify OTP first";
    }


    if (confirmPassword) {

        confirmPassword.disabled = true;

        confirmPassword.placeholder =
            "Verify OTP first";
    }


    // Disable reset button
    if (resetPasswordButton) {

        resetPasswordButton.disabled = true;
    }


    // Reset verify button
    if (verifyOtpButton) {

        verifyOtpButton.classList.remove(
            "otp-verifying",
            "otp-success"
        );

        verifyOtpButton.classList.add(
            "otp-error"
        );
    }


    if (verifyOtpIcon) {

        verifyOtpIcon.textContent = "✓";
    }


    if (otpMessage) {

        otpMessage.textContent = "";

        otpMessage.className =
            "otp-message";
    }

}


// ============================================================
// VERIFY OTP
// ============================================================

if (verifyOtpButton) {

    verifyOtpButton.addEventListener(
        "click",
        async function () {

            // Clear messages
            if (otpError) {

                otpError.textContent = "";
            }

            if (otpMessage) {

                otpMessage.textContent = "";

                otpMessage.className =
                    "otp-message";
            }


            // ================================================
            // GET OTP
            // ================================================

            const otpValue =
                otp ? otp.value.trim() : "";


            // ================================================
            // GET EMAIL FROM SESSION
            // ================================================

            const resetEmail =
                sessionStorage.getItem("resetEmail");


            console.log(
                "================================"
            );

            console.log(
                "OTP VERIFICATION STARTED"
            );

            console.log(
                "Reset Email:",
                resetEmail
            );

            console.log(
                "OTP:",
                otpValue
            );

            console.log(
                "OTP Length:",
                otpValue.length
            );

            console.log(
                "================================"
            );


            // ================================================
            // EMAIL VALIDATION
            // ================================================

            if (!resetEmail) {

                if (otpError) {

                    otpError.textContent =
                        "Email session expired. Please request OTP again.";
                }

                return;
            }


            // ================================================
            // OTP VALIDATION
            // ================================================

            if (otpValue === "") {

                if (otpError) {

                    otpError.textContent =
                        "Please enter OTP.";
                }

                return;
            }


            if (!/^\d{6}$/.test(otpValue)) {

                if (otpError) {

                    otpError.textContent =
                        "Please enter a valid 6-digit OTP.";
                }

                return;
            }


            // ================================================
            // LOADING STATE
            // ================================================

            verifyOtpButton.disabled = true;


            verifyOtpButton.classList.remove(
                "otp-success",
                "otp-error"
            );


            verifyOtpButton.classList.add(
                "otp-verifying"
            );


            if (verifyOtpIcon) {

                verifyOtpIcon.textContent = "⟳";
            }


            if (otpMessage) {

                otpMessage.textContent =
                    "Verifying OTP...";

                otpMessage.className =
                    "otp-message";
            }


            try {

                // ============================================
                // VERIFY OTP API
                // ============================================

                const response =
                    await apiRequest(
                        "/api/auth/verify-otp",
                        {
                            method: "POST",

                            body: JSON.stringify({
                                email: resetEmail,
                                otp: otpValue
                            })
                        }
                    );


                console.log(
                    "Verify OTP Response:",
                    response
                );


                // ============================================
                // GET RESET TOKEN
                // ============================================

                const token =
                    response?.data?.resetToken;


                if (!token) {

                    throw new Error(
                        "Reset token was not received from server."
                    );
                }


                // ============================================
                // OTP SUCCESS
                // ============================================

                resetToken = token;

                otpVerified = true;

                verifiedOtpValue = otpValue;


                // Green button
                verifyOtpButton.classList.remove(
                    "otp-verifying",
                    "otp-error"
                );

                verifyOtpButton.classList.add(
                    "otp-success"
                );


                // Green check
                if (verifyOtpIcon) {

                    verifyOtpIcon.textContent =
                        "✓";
                }


                // Success message
                if (otpMessage) {

                    otpMessage.textContent =
                        "OTP verified successfully.";

                    otpMessage.className =
                        "otp-message otp-success-message";
                }


                // Clear OTP error
                if (otpError) {

                    otpError.textContent = "";
                }


                // ============================================
                // ENABLE NEW PASSWORD
                // ============================================

                if (newPassword) {

                    newPassword.disabled = false;

                    newPassword.placeholder =
                        "Enter new password";
                }


                // ============================================
                // ENABLE CONFIRM PASSWORD
                // ============================================

                if (confirmPassword) {

                    confirmPassword.disabled = false;

                    confirmPassword.placeholder =
                        "Confirm new password";
                }


                // ============================================
                // ENABLE RESET BUTTON
                // ============================================

                if (resetPasswordButton) {

                    resetPasswordButton.disabled = false;
                }


                console.log(
                    "OTP VERIFIED SUCCESSFULLY"
                );

                console.log(
                    "Reset Token:",
                    resetToken
                );


            } catch (error) {

                console.error(
                    "OTP Verification Error:",
                    error
                );


                // ============================================
                // OTP FAILED
                // ============================================

                otpVerified = false;

                resetToken = null;

                verifiedOtpValue = "";


                // Red button
                verifyOtpButton.classList.remove(
                    "otp-verifying",
                    "otp-success"
                );

                verifyOtpButton.classList.add(
                    "otp-error"
                );


                // Red cross
                if (verifyOtpIcon) {

                    verifyOtpIcon.textContent =
                        "✕";
                }


                // Error message
                if (otpMessage) {

                    otpMessage.textContent =
                        "OTP does not match. Please try again.";

                    otpMessage.className =
                        "otp-message otp-error-message";
                }


                // Password fields remain disabled
                if (newPassword) {

                    newPassword.disabled = true;

                    newPassword.placeholder =
                        "Verify OTP first";
                }


                if (confirmPassword) {

                    confirmPassword.disabled = true;

                    confirmPassword.placeholder =
                        "Verify OTP first";
                }


                // Reset button remains disabled
                if (resetPasswordButton) {

                    resetPasswordButton.disabled = true;
                }

            } finally {

                verifyOtpButton.disabled = false;

            }

        }
    );

}


// ============================================================
// RESET PASSWORD FORM
// ============================================================

if (form) {

    form.addEventListener(
        "submit",
        async function (e) {

            e.preventDefault();


            // ================================================
            // CLEAR MESSAGES
            // ================================================

            if (otpError) {

                otpError.textContent = "";
            }

            if (newPasswordError) {

                newPasswordError.textContent = "";
            }

            if (confirmPasswordError) {

                confirmPasswordError.textContent = "";
            }

            if (resetError) {

                resetError.textContent = "";
            }

            if (successMessage) {

                successMessage.textContent = "";

                successMessage.classList.add(
                    "d-none"
                );
            }


            // ================================================
            // OTP MUST BE VERIFIED
            // ================================================

            if (
                !otpVerified ||
                !resetToken
            ) {

                if (resetError) {

                    resetError.textContent =
                        "Please verify your OTP first.";
                }

                return;
            }


            // ================================================
            // GET PASSWORD VALUES
            // ================================================

            const passwordValue =
                newPassword.value;

            const confirmValue =
                confirmPassword.value;


            // ================================================
            // NEW PASSWORD VALIDATION
            // ================================================

            if (passwordValue === "") {

                if (newPasswordError) {

                    newPasswordError.textContent =
                        "New password is required.";
                }

                return;
            }


            if (passwordValue.length < 6) {

                if (newPasswordError) {

                    newPasswordError.textContent =
                        "Password must be at least 6 characters.";
                }

                return;
            }


            // ================================================
            // CONFIRM PASSWORD VALIDATION
            // ================================================

            if (confirmValue === "") {

                if (confirmPasswordError) {

                    confirmPasswordError.textContent =
                        "Please confirm your password.";
                }

                return;
            }


            if (passwordValue !== confirmValue) {

                if (confirmPasswordError) {

                    confirmPasswordError.textContent =
                        "Passwords do not match.";
                }

                return;
            }


            // ================================================
            // GET EMAIL
            // ================================================

            const resetEmail =
                sessionStorage.getItem("resetEmail");


            if (!resetEmail) {

                if (resetError) {

                    resetError.textContent =
                        "Email session expired. Please request OTP again.";
                }

                return;
            }


            // ================================================
            // LOADING STATE
            // ================================================

            resetPasswordButton.disabled = true;


            if (resetPasswordButtonText) {

                resetPasswordButtonText.textContent =
                    "Resetting Password...";
            }


            if (resetPasswordLoader) {

                resetPasswordLoader.classList.remove(
                    "d-none"
                );
            }


            try {

                // ============================================
                // RESET PASSWORD API
                // ============================================

                console.log(
                    "================================"
                );

                console.log(
                    "RESET PASSWORD REQUEST"
                );

                console.log(
                    "Reset Token:",
                    resetToken
                );

                console.log(
                    "================================"
                );


                const data =
                    await apiRequest(
                        "/api/auth/reset-password",
                        {
                            method: "POST",

                            body: JSON.stringify({

                                token: resetToken,

                                newPassword:
                                    passwordValue,

                                confirmPassword:
                                    confirmValue

                            })
                        }
                    );


                console.log(
                    "Reset Password Response:",
                    data
                );


                // ============================================
                // SUCCESS
                // ============================================

                if (successMessage) {

                    successMessage.textContent =
                        data?.message ||
                        "Password reset successfully.";

                    successMessage.classList.remove(
                        "d-none"
                    );
                }


                // Clear session
                sessionStorage.removeItem(
                    "resetEmail"
                );


                // Clear reset token
                resetToken = null;

                otpVerified = false;

                verifiedOtpValue = "";


                // ============================================
                // REDIRECT TO LOGIN
                // ============================================

                setTimeout(
                    function () {

                        window.location.href =
                            "login.html";

                    },
                    2000
                );


            } catch (error) {

                console.error(
                    "Password Reset Error:",
                    error
                );


                if (resetError) {

                    resetError.textContent =
                        error.message ||
                        "Password reset failed. Please try again.";
                }


            } finally {

                // Don't re-enable reset button
                // if password reset was successful
                if (resetToken) {

                    resetPasswordButton.disabled =
                        false;
                }


                if (resetPasswordButtonText) {

                    resetPasswordButtonText.textContent =
                        "Reset Password";
                }


                if (resetPasswordLoader) {

                    resetPasswordLoader.classList.add(
                        "d-none"
                    );
                }

            }

        }
    );

}