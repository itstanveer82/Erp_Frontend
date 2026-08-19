const form = document.getElementById("forgotPasswordForm");
const email = document.getElementById("email");
const emailError = document.getElementById("emailError");
const successMessage = document.getElementById("successMessage");

const resetButton = document.getElementById("resetButton");
const resetButtonText = document.getElementById("resetButtonText");
const resetLoader = document.getElementById("resetLoader");


if (form) {

    form.addEventListener("submit", async function (e) {

        e.preventDefault();


        // Reset previous messages

        emailError.textContent = "";

        successMessage.textContent = "";
        successMessage.classList.add("d-none");


        // Get email value

        const emailValue = email.value.trim();


        // Required validation

        if (emailValue === "") {

            emailError.textContent = "Email address is required.";

            return;

        }


        // Email format validation

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


        if (!emailPattern.test(emailValue)) {

            emailError.textContent =
                "Please enter a valid email address.";

            return;

        }


        // Loading state

        resetButton.disabled = true;

        resetButtonText.textContent = "Sending Request...";

        resetLoader.classList.remove("d-none");


        try {

            const data = await apiRequest("/api/auth/forgot-password", {

                method: "POST",

                body: JSON.stringify({
                    email: emailValue
                })

            });

            console.log("Forgot Password Response:", data);


            // Save email temporarily for reset-password page
            sessionStorage.setItem("resetEmail", emailValue);


            successMessage.textContent =
                data.message || "OTP has been sent to your registered email.";

            successMessage.classList.remove("d-none");


            // Redirect to reset password page
            setTimeout(function () {

                window.location.href = "reset-password.html";

            }, 1500);

        

        } catch (error) {

            console.error(
                "Forgot Password Error:",
                error
            );


            emailError.textContent =
                error.message ||
                "Something went wrong. Please try again.";

        } finally {

            // Reset button

            resetButton.disabled = false;

            resetButtonText.textContent =
                "Send Reset Request";

            resetLoader.classList.add("d-none");

        }

    });

}