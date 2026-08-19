const employeeSearch = document.getElementById("employeeSearch");
const departmentFilter = document.getElementById("departmentFilter");
const statusFilter = document.getElementById("statusFilter");
const resetFiltersButton = document.getElementById("resetFiltersButton");
const addEmployeeButton = document.getElementById("addEmployeeButton");


if (addEmployeeButton) {
    addEmployeeButton.addEventListener("click", () => {
        window.location = "add-employee.html";
    });
}


//get employees api
async function loadEmployees() {

    try {

        const authData = getAuthData();

        const token = authData ? authData.token : null;

        console.log("Auth Data:", authData);
        console.log("Token exists:", !!token);

        if (!token) {
            console.error("Authentication token not found.");
            return;
        }

        const response = await fetch(
            `${API_BASE_URL}/api/employee`,
            {
                method: "GET",

                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        const result = await response.json();

        console.log("Employee API Status:", response.status);
        console.log("Employee API Response:", result);

        if (!response.ok || !result.success) {

            throw new Error(
                result.message || "Failed to fetch employees"
            );
        }

        displayEmployees(result.data);

    } catch (error) {

        console.error("Employee API Error:", error);
    }
}


//display employee

function displayEmployees(employees) {
    const tableBody = document.getElementById("employeeTableBody");

    tableBody.innerHTML = "";

    if (!employees || employees.length === 0) {
        tableBody.innerHTML = `
        <tr>
        <td colspan="10" class="text-center text-muted">
           No Employees found
           </td>
           </tr>    
        `;
        return;
    }

    employees.forEach(function (employee) {
        const row = document.createElement("tr");

        row.innerHTML = `
    <td>${employee.employeeCode || "-"}</td>

    <td>
        ${employee.firstName || ""}
        ${employee.lastName || ""}
    </td>

    <td>${employee.email || "-"}</td>

    <td>${employee.phone || "-"}</td>

    <td>${employee.departmentName || "-"}</td>

    <td>${employee.designation || "-"}</td>

    <td>${employee.joiningDate || "-"}</td>

    <td>${employee.roleName || "-"}</td>

    <td>
        <span class="badge ${employee.status === "ACTIVE"
                ? "text-bg-success"
                : "text-bg-secondary"
            }">
            ${employee.status || "-"}
        </span>
    </td>

    <td>
        <button
            type="button"
            class="btn btn-sm btn-outline-primary viewEmployeeButton"
            data-id="${employee.id}">
            View
        </button>
    </td>
`;

        tableBody.appendChild(row);
    });
}

document.addEventListener("click",function(event)
{
    if(event.target.classList.contains("viewEmployeeButton"))
    {
        const empId = event.target.dataset.id;

        console.log("selected emp id : ", empId);
        window.location = `employee-detail.html?id=${empId}`;
    }
});

// filter employess

function filterEmployees() {
    const searchValue = employeeSearch.value.trim().toLocaleLowerCase();
    const departmentValue = departmentFilter.value;
    const statusValue = statusFilter.value;

    const rows = document.querySelectorAll("#employeeTableBody tr")

    rows.forEach(function (row) {

        const cells = row.querySelectorAll("td");

        if (cells.length < 6) {
            return;
        }
        const employeeId = cells[0].textContent.toLocaleLowerCase();
        const name = cells[1].textContent.toLocaleLowerCase();
        const email = cells[2].textContent.toLocaleLowerCase();
        const department = cells[3].textContent;
        const status = cells[5].textContent.trim().toUpperCase();



        //search condition

        const matchesSearch = employeeId.includes(searchValue) || name.includes(searchValue) || email.includes(searchValue);

        const matchesDepartment = departmentValue === "" || department === departmentValue;

        const matchesStatus = statusValue === "" || status === statusValue;

        //show and hide row

        if (matchesSearch && matchesDepartment && matchesStatus) {
            row.style.display = "";
        }
        else {
            row.style.display = "none";
        }

    });
}


//search 

if (employeeSearch) {
    employeeSearch.addEventListener("input", () => {
        filterEmployees();
    });
}

//department filter

if (departmentFilter) {
    departmentFilter.addEventListener("change", () => {
        filterEmployees();
    });
}

//status filter

if (statusFilter) {
    statusFilter.addEventListener("change", () => {
        filterEmployees();
    });
}

//reset filter

if (resetFiltersButton) {
    resetFiltersButton.addEventListener("click", () => {

        employeeSearch.value = "";
        departmentFilter.value = "";
        statusFilter.value = "";

        filterEmployees();
    })
}


loadEmployees();