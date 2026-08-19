//mock data for testing purpose later will be removed totally

// Get employee ID from URL

const urlParams = new URLSearchParams(window.location.search);
const employeeId = urlParams.get("id");

console.log("Employee ID from URL:", employeeId);


// Temporary employee data for frontend testing

const testEmployee = {
    id: 3,
    employeeCode: "123000102",
    firstName: "Tanveer",
    lastName: "Ansari",
    email: "tanveer@gmail.com",
    phone: "9876543210",
    departmentName: "IT",
    designation: "Software Engineer",
    joiningDate: "2026-01-15",
    roleName: "ADMIN",
    status: "ACTIVE"
};


// Display employee details

function displayEmployeeDetails(employee) {

    document.getElementById("employeeCode").textContent =
        employee.employeeCode || "-";

    document.getElementById("firstName").textContent =
        employee.firstName || "-";

    document.getElementById("lastName").textContent =
        employee.lastName || "-";

    document.getElementById("email").textContent =
        employee.email || "-";

    document.getElementById("phone").textContent =
        employee.phone || "-";

    document.getElementById("departmentName").textContent =
        employee.departmentName || "-";

    document.getElementById("designation").textContent =
        employee.designation || "-";

    document.getElementById("roleName").textContent =
        employee.roleName || "-";

    document.getElementById("joiningDate").textContent =
        employee.joiningDate || "-";


    const statusElement = document.getElementById("status");

    statusElement.innerHTML = `
        <span class="badge ${
            employee.status === "ACTIVE"
                ? "text-bg-success"
                : "text-bg-secondary"
        }">
            ${employee.status || "-"}
        </span>
    `;
}


// Load temporary employee

if (employeeId) {

    console.log("Loading test employee:", testEmployee);

    displayEmployeeDetails(testEmployee);

} else {

    console.log("No employee ID found in URL.");

}





const editEmployeeButton = document.getElementById("editEmployeeButton");
const editEmployeeButtonBottom = document.getElementById("editEmployeeButtonBottom");

if (editEmployeeButton) {
    editEmployeeButton.addEventListener("click", function () {

        if (!employeeId) {
            console.log("Employee ID not found.");
            return;
        }

        console.log("Editing Employee ID:", employeeId);

        window.location.href = `add-employee.html?id=${employeeId}`;
    });
}

if (editEmployeeButtonBottom) {
    editEmployeeButtonBottom.addEventListener("click", function () {

        if (!employeeId) {
            console.log("Employee ID not found.");
            return;
        }

        console.log("Editing Employee ID:", employeeId);

        window.location.href = `add-employee.html?id=${employeeId}`;
    });
}