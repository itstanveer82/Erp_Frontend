const employeeForm = document.getElementById("employeeForm");

const employeeId = document.getElementById("employeeId");
const employeeName = document.getElementById("employeeName");
const employeeEmail = document.getElementById("employeeEmail");
const employeePhone = document.getElementById("employeePhone");
const employeeDepartment = document.getElementById("employeeDepartment");
const employeeDesignation = document.getElementById("employeeDesignation");
const employeeStatus = document.getElementById("employeeStatus");
const joiningDate = document.getElementById("joiningDate");

const employeeFormTitle = document.getElementById("employeeFormTitle");
const employeeFormSubtitle = document.getElementById("employeeFormSubtitle");
const saveEmployeeButton = document.getElementById("saveEmployeeButton");

// temp data willl be dedleted when api gets
// Check whether the form is in edit mode


const urlParams = new URLSearchParams(window.location.search);
const editEmployeeId = urlParams.get("id");

const isEditMode = editEmployeeId !== null;

console.log("Edit Employee ID:", editEmployeeId);
console.log("Edit Mode:", isEditMode);


// --------------------------------------------------
// Email validation
// --------------------------------------------------

function isValidEmail(value) {

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return emailPattern.test(value);
}


// --------------------------------------------------
// Clear errors
// --------------------------------------------------

function clearErrors() {

    document.querySelectorAll(".text-danger").forEach(function (element) {
        element.textContent = "";
    });

    document.querySelectorAll(".is-invalid").forEach(function (element) {
        element.classList.remove("is-invalid");
    });

}


// --------------------------------------------------
// Show error
// --------------------------------------------------

function showError(input, errorId, message) {

    input.classList.add("is-invalid");

    const errorElement = document.getElementById(errorId);

    if (errorElement) {
        errorElement.textContent = message;
    }

}


// --------------------------------------------------
// Validate Employee Form
// --------------------------------------------------

function validateEmployeeForm() {

    clearErrors();

    let isValid = true;


    // Employee ID
    if (employeeId.value.trim() === "") {

        showError(
            employeeId,
            "employeeIdError",
            "Employee ID is required."
        );

        isValid = false;
    }


    // Full Name
    if (employeeName.value.trim() === "") {

        showError(
            employeeName,
            "employeeNameError",
            "Full name is required."
        );

        isValid = false;
    }


    // Email
    const emailValue = employeeEmail.value.trim();

    if (emailValue === "") {

        showError(
            employeeEmail,
            "employeeEmailError",
            "Email address is required."
        );

        isValid = false;

    } else if (!isValidEmail(emailValue)) {

        showError(
            employeeEmail,
            "employeeEmailError",
            "Please enter a valid email address."
        );

        isValid = false;
    }


    // Phone
    const phoneValue = employeePhone.value.trim();

    if (phoneValue === "") {

        showError(
            employeePhone,
            "employeePhoneError",
            "Phone number is required."
        );

        isValid = false;

    } else if (!/^[0-9]{10}$/.test(phoneValue)) {

        showError(
            employeePhone,
            "employeePhoneError",
            "Phone number must contain 10 digits."
        );

        isValid = false;
    }


    // Department
    if (employeeDepartment.value === "") {

        showError(
            employeeDepartment,
            "employeeDepartmentError",
            "Please select a department."
        );

        isValid = false;
    }


    // Designation
    if (employeeDesignation.value === "") {

        showError(
            employeeDesignation,
            "employeeDesignationError",
            "Please select a designation."
        );

        isValid = false;
    }


    // Status
    if (employeeStatus.value === "") {

        showError(
            employeeStatus,
            "employeeStatusError",
            "Please select a status."
        );

        isValid = false;
    }


    // Joining Date
    if (joiningDate.value === "") {

        showError(
            joiningDate,
            "joiningDateError",
            "Joining date is required."
        );

        isValid = false;
    }


    return isValid;
}


// --------------------------------------------------
// Form Submit
// --------------------------------------------------

if (employeeForm) {

    employeeForm.addEventListener("submit", function (event) {

        event.preventDefault();

        const isValid = validateEmployeeForm();

        if (!isValid) {

            console.log("Employee form validation failed.");

            return;
        }

     const employeeData = {
            employeeCode: employeeId.value.trim(),
            fullName: employeeName.value.trim(),
            email: employeeEmail.value.trim(),
            phone: employeePhone.value.trim(),
            department: employeeDepartment.value,
            designation: employeeDesignation.value,
            status: employeeStatus.value,
            joiningDate: joiningDate.value
        };

        console.log("Employee Form Data:", employeeData);

    });

}




function populateEmployeeForm(employee) {

    document.getElementById("employeeId").value =
        employee.employeeCode || "";

    document.getElementById("employeeName").value =
        `${employee.firstName || ""} ${employee.lastName || ""}`.trim();

    document.getElementById("employeeEmail").value =
        employee.email || "";

    document.getElementById("employeePhone").value =
        employee.phone || "";

    document.getElementById("employeeDepartment").value =
        employee.departmentName || "";

    document.getElementById("employeeDesignation").value =
        employee.designation || "";

    document.getElementById("employeeStatus").value =
        employee.status || "";

    document.getElementById("joiningDate").value =
        employee.joiningDate || "";

    console.log("Employee form populated:", employee);
}


if (isEditMode) {

    console.log("Loading employee for edit:", editEmployeeId);

    // Change page UI for Edit Mode
    if (employeeFormTitle) {
        employeeFormTitle.textContent = "Edit Employee";
    }

    if (employeeFormSubtitle) {
        employeeFormSubtitle.textContent = "Update employee record";
    }

    if (saveEmployeeButton) {
        saveEmployeeButton.textContent = "Update Employee";
    }

    // Load real employee data from backend
    apiRequest(`/api/employee/${editEmployeeId}`)
        .then(function (response) {

            console.log("GET EMPLOYEE BY ID RESPONSE:", response);

            if (response.success && response.data) {
                populateEmployeeForm(response.data);
            } else {
                console.error("Employee data not found:", response);
            }

        })
        .catch(function (error) {

            console.error("Failed to load employee:", error);

        });
}