// ============================================================
// EMPLOYEES MODULE
// Backend APIs
//
// GET    /api/employees
// GET    /api/employees/inactive
// GET    /api/employees/{id}
// POST   /api/employees
// PUT    /api/employees/{id}
// DELETE /api/employees/{id}
// PUT    /api/employees/{id}/restore
// GET    /api/departments
// ============================================================

const EMP_PAGE_SIZE = 10;

let empCurrentPage = 0;
let empSearchQuery = "";
let empIncludeInactive = false;
let empMasterDataCache = {};
let empSelectedId = null;
let empAllRows = [];


// ============================================================
// HELPERS
// ============================================================

function escapeHtmlEmp(value) {
    if (value === null || value === undefined) {
        return "";
    }

    const div = document.createElement("div");
    div.textContent = String(value);
    return div.innerHTML;
}


function getErrorMessage(error, fallback) {
    return (
        error?.responseData?.message ||
        error?.response?.data?.message ||
        error?.message ||
        fallback
    );
}



// ============================================================
// ROLE DROPDOWN
// GET /api/roles
// ============================================================

async function loadEmployeeRoleDropdown() {

    const roleSelect =
        document.getElementById("addEmpRole");

    if (!roleSelect) {

        console.error(
            "addEmpRole dropdown not found"
        );

        return;
    }


    // Loading state
    roleSelect.innerHTML =
        `<option value="">Loading roles...</option>`;


    try {

        const response =
            await apiRequest("/api/roles");


        console.log(
            "Roles API Response:",
            response
        );


        // API response:
        // {
        //     success: true,
        //     data: [...]
        // }

        const roles =
            Array.isArray(response.data)
                ? response.data
                : [];


        // Reset dropdown
        roleSelect.innerHTML =
            `<option value="">Select Role</option>`;


        // Add roles
        roles.forEach(function (role) {

            const option =
                document.createElement("option");


            option.value =
                role.id;


            option.textContent =
                role.name ||
                role.roleName ||
                role.code ||
                `Role ${role.id}`;


            roleSelect.appendChild(option);

        });


        // No roles
        if (roles.length === 0) {

            roleSelect.innerHTML =
                `<option value="">
                    No roles found
                </option>`;

        }

    } catch (error) {

        console.error(
            "Failed to load roles:",
            error
        );


        roleSelect.innerHTML =
            `<option value="">
                Failed to load roles
            </option>`;

    }

}



// ============================================================
// MANAGER DROPDOWN
// GET /api/employees/managers
// ============================================================
// async function loadEmployeeManagerDropdown() {
//     const managerSelect = document.getElementById("addEmpManagerId");

//     if (!managerSelect) {
//         console.warn("Manager dropdown #addEmpManagerId not found");
//         return;
//     }

//     managerSelect.innerHTML =
//         `<option value="">Loading managers...</option>`;

//     try {
//         const response =
//             await apiRequest("/api/employees/managers");

//         console.log("Managers API response:", response);

//         const managers = Array.isArray(response.data)
//             ? response.data
//             : [];

//         managerSelect.innerHTML =
//             `<option value="">Select Manager</option>`;

//         managers.forEach(function (manager) {

//             const option = document.createElement("option");

//             // Swagger API field
//             option.value = manager.employeeId;

//             // Swagger API field
//             option.textContent =
//                 manager.fullName ||
//                 `Manager ${manager.employeeId}`;

//             managerSelect.appendChild(option);
//         });

//         console.log("Managers loaded:", managers);

//     } catch (error) {

//         console.error(
//             "Failed to load managers:",
//             error
//         );

//         managerSelect.innerHTML =
//             `<option value="">Failed to load managers</option>`;
//     }
// }

async function loadEmployeeManagerDropdown() {
    const managerSelect = document.getElementById("addEmpManagerId");

    if (!managerSelect) {
        console.warn("Manager dropdown #addEmpManagerId not found");
        return;
    }

    managerSelect.innerHTML =
        `<option value="">Loading managers...</option>`;

    try {
        const response =
            await apiRequest("/api/employees/managers");

        console.log("Managers API response:", response);

        const managers = Array.isArray(response.data)
            ? response.data
            : [];

        managerSelect.innerHTML =
            `<option value="">Select Manager</option>`;

        managers.forEach(function (manager) {
            const option = document.createElement("option");

            option.value = manager.employeeId;

            option.textContent =
                manager.fullName ||
                `Manager ${manager.employeeId}`;

            managerSelect.appendChild(option);
        });

    } catch (error) {
        console.error("Failed to load managers:", error);

        managerSelect.innerHTML =
            `<option value="">Failed to load managers</option>`;
    }
}


// async function loadEmployeeDepartmentDropdown() {
//     const departmentSelect =
//         document.getElementById("addEmpDepartment");

//     if (!departmentSelect) {
//         console.warn("Department dropdown #addEmpDepartment not found");
//         return;
//     }

//     departmentSelect.innerHTML =
//         `<option value="">Loading departments...</option>`;

//     try {
//         const departments = await fetchDepartments();

//         console.log("Departments loaded:", departments);

//         populateSelect(
//             departmentSelect,
//             departments,
//             "Select Department"
//         );

//     } catch (error) {
//         console.error("Failed to load departments:", error);

//         departmentSelect.innerHTML =
//             `<option value="">Failed to load departments</option>`;
//     }
// }

async function loadEmployeeDepartmentDropdown() {

    const departmentSelect =
        document.getElementById("addEmpDepartment");

    if (!departmentSelect) {
        console.warn(
            "Department dropdown #addEmpDepartment not found"
        );
        return;
    }

    departmentSelect.innerHTML =
        `< option value = "" > Loading departments...</option > `;

    try {

        const response =
            await apiRequest("/api/departments");

        console.log(
            "Departments API response:",
            response
        );

        const departments =
            Array.isArray(response.data)
                ? response.data
                : [];

        departmentSelect.innerHTML =
            `< option value = "" > Select Department</option > `;

        departments.forEach(function (department) {

            const option =
                document.createElement("option");

            // API: id
            option.value = department.id;

            // API: name
            option.textContent = department.name;

            departmentSelect.appendChild(option);
        });

        console.log(
            "Departments loaded:",
            departments
        );

    } catch (error) {

        console.error(
            "Failed to load departments:",
            error
        );

        departmentSelect.innerHTML =
            `< option value = "" > Failed to load departments</option > `;
    }
}




addEmployeeButton.addEventListener(
    "click",
    async function () {

        if (addEmployeeForm) {
            addEmployeeForm.reset();
        }

        if (addEmployeeMessage) {
            addEmployeeMessage.innerHTML = "";
        }


        addEmployeeModal.show();


        await Promise.all([

            loadEmployeeRoleDropdown(),

            loadEmployeeManagerDropdown(),

            loadEmployeeDepartmentDropdown()

        ]);

    }
);

addEmployeeButton.addEventListener(
    "click",
    async function () {

        if (addEmployeeForm) {
            addEmployeeForm.reset();
        }

        if (addEmployeeMessage) {
            addEmployeeMessage.innerHTML = "";
        }


        addEmployeeModal.show();


        await Promise.all([

            loadEmployeeRoleDropdown(),

            loadEmployeeManagerDropdown(),

            fetchDepartments()

        ]);


        // Populate department
        const departments =
            await fetchDepartments();

        populateSelect(
            document.getElementById("addEmpDepartment"),
            departments,
            "Select Department"
        );

    }
);

// ============================================================
// OPEN ADD EMPLOYEE MODAL
// ============================================================

if (addEmployeeButton) {

    addEmployeeButton.addEventListener(
        "click",
        async function () {

            // Reset form
            if (addEmployeeForm) {
                addEmployeeForm.reset();
            }


            // Clear message
            if (addEmployeeMessage) {
                addEmployeeMessage.innerHTML = "";
            }


            // Open modal
            addEmployeeModal.show();


            // =================================================
            // LOAD ROLE
            // =================================================

            await loadEmployeeRoleDropdown();


            // =================================================
            // LOAD MANAGER
            // =================================================

            await loadEmployeeManagerDropdown();


            // =================================================
            // LOAD DEPARTMENT
            // =================================================

            const departments =
                await fetchDepartments();


            populateSelect(
                document.getElementById("addEmpDepartment"),
                departments,
                "Select Department"
            );

        }
    );

}

async function loadMasterDataDropdowns() {

    const [departments, shifts] = await Promise.all([
        fetchDepartments(),
        fetchShifts()
    ]);


    populateSelect(
        document.getElementById("addEmpDepartment"),
        departments,
        "Select department"
    );


    populateSelect(
        document.getElementById("addEmpShift"),
        shifts,
        "Select shift"
    );


    populateSelect(
        document.getElementById("editEmpDepartment"),
        departments,
        "Select department"
    );

}



// ============================================================
// MASTER DATA
// ============================================================

async function fetchDepartments() {

    if (empMasterDataCache.DEPARTMENT) {
        return empMasterDataCache.DEPARTMENT;
    }

    try {
        const response = await apiRequest("/api/departments");

        const list = Array.isArray(response.data)
            ? response.data
            : [];

        empMasterDataCache.DEPARTMENT = list;

        return list;

    } catch (error) {

        console.error("Failed to load departments:", error);

        return [];
    }
}


async function fetchShifts() {

    if (empMasterDataCache.SHIFT) {
        return empMasterDataCache.SHIFT;
    }

    try {
        const response = await apiRequest("/api/shifts");

        const list = Array.isArray(response.data)
            ? response.data
            : [];

        empMasterDataCache.SHIFT = list;

        return list;

    } catch (error) {

        console.error("Failed to load shifts:", error);

        return [];
    }
}


function populateSelect(selectEl, list, placeholder, selectedId) {

    if (!selectEl) {
        return;
    }

    selectEl.innerHTML =
        `< option value = "" > ${escapeHtmlEmp(placeholder)}</option > ` +
        list.map(function (item) {

            const isSelected =
                selectedId != null &&
                String(item.id) === String(selectedId);

            return `
    < option value = "${escapeHtmlEmp(item.id)}"
                        ${isSelected ? "selected" : ""}>
    ${escapeHtmlEmp(item.name)}
                    </option >
    `;

        }).join("");
}


async function loadMasterDataDropdowns() {

    const [departments, shifts] = await Promise.all([
        fetchDepartments(),
        fetchShifts()
    ]);

    populateSelect(
        document.getElementById("addEmpDepartment"),
        departments,
        "Select department"
    );

    populateSelect(
        document.getElementById("addEmpRole"),
        EMP_ROLE_OPTIONS,
        "Select role"
    );

    populateSelect(
        document.getElementById("addEmpShift"),
        shifts,
        "Select shift"
    );

    populateSelect(
        document.getElementById("editEmpDepartment"),
        departments,
        "Select department"
    );

    populateSelect(
        document.getElementById("editEmpRole"),
        EMP_ROLE_OPTIONS,
        "Select role"
    );
}


// ============================================================
// LOAD EMPLOYEES
// ============================================================

async function loadEmployees(page = 0) {

    const tableBody =
        document.getElementById("employeesTableBody");

    if (!tableBody) {
        return;
    }

    empCurrentPage = page;

    tableBody.innerHTML = `
    < tr >
    <td colspan="8" class="text-center py-4">
        Loading employees...
    </td>
            </tr >
    `;

    try {

        const endpoint =
            empIncludeInactive
                ? "/api/employees/inactive"
                : "/api/employees";

        const response = await apiRequest(endpoint);

        const employees =
            Array.isArray(response.data)
                ? response.data
                : [];

        // Ye row jis endpoint se aayi hai wahi uska active/inactive
        // sach hai (status text field pe bharosa nahi kar sakte).
        employees.forEach(function (emp) {
            emp.__isActiveRow = !empIncludeInactive;
        });

        const query =
            empSearchQuery.trim().toLowerCase();

        empAllRows = query
            ? employees.filter(function (emp) {

                const haystack = [
                    emp.employeeCode,
                    emp.empCode,
                    emp.firstName,
                    emp.lastName,
                    emp.email,
                    emp.empEmail
                ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase();

                return haystack.includes(query);

            })
            : employees;

        const start =
            empCurrentPage * EMP_PAGE_SIZE;

        const pageRows =
            empAllRows.slice(
                start,
                start + EMP_PAGE_SIZE
            );

        renderEmployeesTable(pageRows);

        renderEmployeesPagination();

    } catch (error) {

        console.error(
            "Failed to load employees:",
            error
        );

        tableBody.innerHTML = `
    < tr >
    <td colspan="8"
        class="text-center py-4 text-danger">
        ${escapeHtmlEmp(
            getErrorMessage(
                error,
                "Failed to load employees"
            )
        )}
    </td>
                </tr >
    `;
    }
}


// ============================================================
// RENDER EMPLOYEE TABLE
// ============================================================

function renderEmployeesTable(employees) {

    const tableBody =
        document.getElementById("employeesTableBody");

    if (!tableBody) {
        return;
    }

    if (!employees.length) {

        tableBody.innerHTML = `
                <tr>
                    <td colspan="8"
                        class="text-center py-4 text-muted">
                        No employees found
                    </td>
                </tr>
             `;

        return;
    }

    tableBody.innerHTML = "";

    employees.forEach(function (emp) {

        const empId =
            emp.id ?? emp.empId;

        const empCode =
            emp.employeeCode ?? emp.empCode;

        const email =
            emp.email ?? emp.empEmail;

        const roleLabel =
            emp.role ??
            emp.roleName ??
            (emp.roleId != null
                ? `Role #${emp.roleId} `
                : "--");

        const isActive =
            emp.__isActiveRow !== undefined
                ? emp.__isActiveRow
                : (emp.status !== undefined
                    ? String(emp.status).toUpperCase() === "ACTIVE"
                    : (emp.active !== undefined ? emp.active : !emp.deleted));

        const fullName =
            `${emp.firstName || ""} ${emp.lastName || ""} `
                .trim() || "--";

        const statusBadge = isActive
            ? `<span class="text-success" > Active</span > `
            : `<span class="text-danger" > Inactive</span > `;

        const row = document.createElement("tr");

        row.innerHTML = `
    <td> ${escapeHtmlEmp(empCode || "--")}</td >

                <td>${escapeHtmlEmp(fullName)}</td>

                <td>${escapeHtmlEmp(email || "--")}</td>

                <td>${escapeHtmlEmp(emp.phone || "--")}</td>

                <td>${escapeHtmlEmp(roleLabel)}</td>

                <td>
                    ${accountStatusBadge(emp.accountStatus)}
                </td>

                <td>
                    ${statusBadge}
                </td>

                <td class="text-end">

                    <div class="d-flex
                                justify-content-end
                                gap-2
                                flex-wrap">

                        <button
                            type="button"
                            class="secondary-action-btn emp-view-btn"
                            data-emp-id="${escapeHtmlEmp(empId)}">
                            View
                        </button>

                        <button
                            type="button"
                            class="secondary-action-btn emp-edit-btn"
                            data-emp-id="${escapeHtmlEmp(empId)}">
                            Edit
                        </button>

                        ${isActive

                ? `
                                <button
                                    type="button"
                                    class="btn btn-outline-danger btn-sm emp-deactivate-btn"
                                    data-emp-id="${escapeHtmlEmp(empId)}">
                                    Deactivate
                                </button>
                            `

                : `
                                <button
                                    type="button"
                                    class="btn btn-outline-success btn-sm emp-reactivate-btn"
                                    data-emp-id="${escapeHtmlEmp(empId)}">
                                    Reactivate
                                </button>
                                <button
                                    type="button"
                                    class="btn btn-outline-danger btn-sm emp-delete-btn"
                                    data-emp-id="${escapeHtmlEmp(empId)}">
                                    Delete
                                </button>
                            `
            }

                    </div>

                </td>
`;

        tableBody.appendChild(row);
    });
}


// ============================================================
// ACCOUNT STATUS
// ============================================================

function accountStatusBadge(status) {

    if (status === "CREATED") {

        return `
    < span class="text-success" >
        Login Active
                </span >
    `;
    }

    if (status === "FAILED") {

        return `
    < span class="text-danger" >
        Login Failed
                </span >
    `;
    }

    return `
    <span class="text-muted" >
        Pending
            </span >
    `;
}


// ============================================================
// PAGINATION
// ============================================================

function renderEmployeesPagination() {

    const container =
        document.getElementById(
            "employeesPagination"
        );

    if (!container) {
        return;
    }

    const totalPages =
        Math.ceil(
            empAllRows.length /
            EMP_PAGE_SIZE
        );

    if (totalPages <= 1) {

        container.innerHTML = "";

        return;
    }

    let html =
        `< ul class="pagination pagination-sm mb-0" > `;

    for (
        let i = 0;
        i < totalPages;
        i++
    ) {

        html += `
    < li class="page-item
                    ${i === empCurrentPage ? "active" : ""} ">

    < button
type = "button"
class="page-link emp-page-btn"
data - page="${i}" >
    ${i + 1}
                    </button >

                </li >
    `;
    }

    html += `</ul > `;

    container.innerHTML = html;
}


// ============================================================
// VIEW EMPLOYEE DETAILS
// ============================================================

function renderEmployeeDetails(emp) {

    const body =
        document.getElementById(
            "viewEmployeeBody"
        );

    if (!body) {
        return;
    }

    if (!emp) {

        body.innerHTML =
            `< div class="text-muted" > No data.</div > `;

        return;
    }

    const fullName =
        `${emp.firstName || ""} ${emp.lastName || ""} `
            .trim() || "--";

    const email =
        emp.email ?? emp.empEmail;

    const empCode =
        emp.employeeCode ?? emp.empCode;

    const roleLabel =
        emp.role ??
        emp.roleName ??
        (emp.roleId != null
            ? `Role #${emp.roleId} `
            : "--");

    const deptLabel =
        emp.department?.name ??
        emp.departmentName ??
        (emp.departmentId != null
            ? `Dept #${emp.departmentId} `
            : "--");

    const isActive =
        emp.__isActiveRow !== undefined
            ? emp.__isActiveRow
            : (emp.status !== undefined
                ? String(emp.status).toUpperCase() === "ACTIVE"
                : (emp.active !== undefined ? emp.active : !emp.deleted));

    body.innerHTML = `

    < div class="profile-info-grid" >

                <div class="profile-info-item">
                    <span class="profile-label">
                        Employee Code
                    </span>

                    <strong>
                        ${escapeHtmlEmp(empCode || "--")}
                    </strong>
                </div>


                <div class="profile-info-item">
                    <span class="profile-label">
                        Full Name
                    </span>

                    <strong>
                        ${escapeHtmlEmp(fullName)}
                    </strong>
                </div>


                <div class="profile-info-item">
                    <span class="profile-label">
                        Work Email
                    </span>

                    <strong>
                        ${escapeHtmlEmp(email || "--")}
                    </strong>
                </div>


                <div class="profile-info-item">
                    <span class="profile-label">
                        Phone
                    </span>

                    <strong>
                        ${escapeHtmlEmp(emp.phone || "--")}
                    </strong>
                </div>


                <div class="profile-info-item">
                    <span class="profile-label">
                        Designation
                    </span>

                    <strong>
                        ${escapeHtmlEmp(
        emp.designation || "--"
    )}
                    </strong>
                </div>


                <div class="profile-info-item">
                    <span class="profile-label">
                        Department
                    </span>

                    <strong>
                        ${escapeHtmlEmp(deptLabel)}
                    </strong>
                </div>


                <div class="profile-info-item">
                    <span class="profile-label">
                        Role
                    </span>

                    <strong>
                        ${escapeHtmlEmp(roleLabel)}
                    </strong>
                </div>


                <div class="profile-info-item">
                    <span class="profile-label">
                        Joining Date
                    </span>

                    <strong>
                        ${escapeHtmlEmp(
        emp.joiningDate || "--"
    )}
                    </strong>
                </div>


                <div class="profile-info-item">
                    <span class="profile-label">
                        Manager ID
                    </span>

                    <strong>
                        ${emp.managerId != null
            ? escapeHtmlEmp(
                emp.managerId
            )
            : "--"
        }
                    </strong>
                </div>


                <div class="profile-info-item">
                    <span class="profile-label">
                        Status
                    </span>

                    <strong>
                        ${isActive
            ? "Active"
            : "Inactive"}
                    </strong>
                </div>

            </div >
    `;
}


// ============================================================
// DOM READY
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        // ====================================================
        // SEARCH
        // ====================================================

        const searchInput =
            document.getElementById(
                "employeeSearchInput"
            );

        const includeInactiveToggle =
            document.getElementById(
                "employeeIncludeInactive"
            );

        let searchDebounce;


        if (searchInput) {

            searchInput.addEventListener(
                "input",
                function () {

                    clearTimeout(
                        searchDebounce
                    );

                    searchDebounce =
                        setTimeout(
                            function () {

                                empSearchQuery =
                                    searchInput
                                        .value
                                        .trim();

                                loadEmployees(0);

                            },
                            350
                        );
                }
            );
        }


        if (includeInactiveToggle) {

            includeInactiveToggle.addEventListener(
                "change",
                function () {

                    empIncludeInactive =
                        includeInactiveToggle.checked;

                    loadEmployees(0);
                }
            );
        }

        // ============================================================
        // ADD EMPLOYEE MODAL
        // ============================================================

        const addEmployeeModalEl =
            document.getElementById("addEmployeeModal");

        if (addEmployeeModalEl) {

            // --------------------------------------------------------
            // BOOTSTRAP MODAL INSTANCE
            // --------------------------------------------------------

            const addEmployeeModal =
                new bootstrap.Modal(addEmployeeModalEl);


            // --------------------------------------------------------
            // FORM ELEMENTS
            // --------------------------------------------------------

            const addEmployeeButton =
                document.getElementById("addEmployeeButton");

            const addEmployeeForm =
                document.getElementById("addEmployeeForm");

            const addEmployeeMessage =
                document.getElementById("addEmployeeMessage");


            // ========================================================
            // OPEN ADD EMPLOYEE MODAL
            // ========================================================

            if (addEmployeeButton) {

                addEmployeeButton.addEventListener(
                    "click",
                    async function () {

                        // Reset form
                        if (addEmployeeForm) {
                            addEmployeeForm.reset();
                        }

                        // Clear old message
                        if (addEmployeeMessage) {
                            addEmployeeMessage.innerHTML = "";
                        }


                        // Open modal
                        addEmployeeModal.show();


                        // ------------------------------------------------
                        // LOAD DROPDOWNS
                        // ------------------------------------------------

                        await loadEmployeeRoleDropdown();
                        await loadEmployeeManagerDropdown();
                        await loadEmployeeDepartmentDropdown();

                    }
                );

            }


            // ========================================================
            // CREATE EMPLOYEE
            // POST /api/employees
            // ========================================================

            if (addEmployeeForm) {

                addEmployeeForm.addEventListener(
                    "submit",
                    async function (event) {

                        event.preventDefault();


                        // ------------------------------------------------
                        // CLEAR MESSAGE
                        // ------------------------------------------------

                        if (addEmployeeMessage) {
                            addEmployeeMessage.innerHTML = "";
                        }


                        // ------------------------------------------------
                        // GET FORM ELEMENTS
                        // ------------------------------------------------

                        const firstNameEl =
                            document.getElementById("addEmpFirstName");

                        const lastNameEl =
                            document.getElementById("addEmpLastName");

                        const emailEl =
                            document.getElementById("addEmpEmail");

                        const phoneEl =
                            document.getElementById("addEmpPhone");

                        const genderEl =
                            document.getElementById("addEmpGender");

                        const designationEl =
                            document.getElementById("addEmpDesignation");

                        const joiningDateEl =
                            document.getElementById("addEmpJoiningDate");

                        const departmentEl =
                            document.getElementById("addEmpDepartment");

                        const roleEl =
                            document.getElementById("addEmpRole");

                        const passwordEl =
                            document.getElementById("addEmpPassword");

                        const managerEl =
                            document.getElementById("addEmpManagerId");


                        // ------------------------------------------------
                        // CHECK ELEMENTS
                        // ------------------------------------------------

                        const missingFields = [];


                        if (!firstNameEl) {
                            missingFields.push("addEmpFirstName");
                        }

                        if (!lastNameEl) {
                            missingFields.push("addEmpLastName");
                        }

                        if (!emailEl) {
                            missingFields.push("addEmpEmail");
                        }

                        if (!phoneEl) {
                            missingFields.push("addEmpPhone");
                        }

                        if (!genderEl) {
                            missingFields.push("addEmpGender");
                        }

                        if (!designationEl) {
                            missingFields.push("addEmpDesignation");
                        }

                        if (!joiningDateEl) {
                            missingFields.push("addEmpJoiningDate");
                        }

                        if (!departmentEl) {
                            missingFields.push("addEmpDepartment");
                        }

                        if (!roleEl) {
                            missingFields.push("addEmpRole");
                        }

                        if (!passwordEl) {
                            missingFields.push("addEmpPassword");
                        }

                        if (!managerEl) {
                            missingFields.push("addEmpManagerId");
                        }


                        if (missingFields.length > 0) {

                            console.error(
                                "Missing HTML fields:",
                                missingFields
                            );

                            if (addEmployeeMessage) {

                                addEmployeeMessage.innerHTML = `
    < div class="custom-alert error" >
        Employee form configuration error.
                                Missing fields:
                                ${escapeHtmlEmp(
                                    missingFields.join(", ")
                                )
                                    }
                            </div >
    `;
                            }

                            return;
                        }


                        // ------------------------------------------------
                        // GET VALUES
                        // ------------------------------------------------

                        const firstName =
                            firstNameEl.value.trim();

                        const lastName =
                            lastNameEl.value.trim();

                        const email =
                            emailEl.value.trim();

                        const phone =
                            phoneEl.value.trim();

                        const gender =
                            genderEl.value || null;

                        const designation =
                            designationEl.value.trim();

                        const joiningDate =
                            joiningDateEl.value;

                        const departmentId =
                            departmentEl.value;

                        const roleId =
                            roleEl.value;

                        const password =
                            passwordEl.value;

                        const managerId =
                            managerEl.value;


                        // =================================================
                        // VALIDATION
                        // =================================================

                        if (!firstName) {

                            alert("First Name is required.");

                            firstNameEl.focus();

                            return;
                        }


                        if (!email) {

                            alert("Work Email is required.");

                            emailEl.focus();

                            return;
                        }


                        if (!gender) {

                            alert("Please select Gender.");

                            genderEl.focus();

                            return;
                        }


                        if (!designation) {

                            alert("Designation is required.");

                            designationEl.focus();

                            return;
                        }


                        if (!joiningDate) {

                            alert("Joining Date is required.");

                            joiningDateEl.focus();

                            return;
                        }


                        if (!departmentId) {

                            alert("Please select Department.");

                            departmentEl.focus();

                            return;
                        }


                        if (!roleId) {

                            alert("Please select Role.");

                            roleEl.focus();

                            return;
                        }


                        if (!password) {

                            alert("Password is required.");

                            passwordEl.focus();

                            return;
                        }


                        if (password.length < 6) {

                            alert(
                                "Password must be at least 6 characters."
                            );

                            passwordEl.focus();

                            return;
                        }


                        if (!managerId) {

                            alert("Please select Manager.");

                            managerEl.focus();

                            return;
                        }


                        // =================================================
                        // BACKEND REQUEST
                        // =================================================

                        const request = {

                            firstName: firstName,

                            lastName: lastName,

                            email: email,

                            phone: phone,

                            gender: gender,

                            designation: designation,

                            joiningDate: joiningDate,

                            departmentId: Number(departmentId),

                            roleId: Number(roleId),

                            password: password,

                            managerId: Number(managerId)

                        };


                        console.log(
                            "POST /api/employees Request:",
                            request
                        );


                        // =================================================
                        // SUBMIT BUTTON
                        // =================================================

                        const submitButton =
                            addEmployeeForm.querySelector(
                                'button[type="submit"]'
                            );

                        const originalText =
                            submitButton
                                ? submitButton.textContent
                                : "";


                        try {

                            if (submitButton) {

                                submitButton.disabled = true;

                                submitButton.textContent =
                                    "Creating...";

                            }


                            // =================================================
                            // POST API
                            // =================================================

                            const response =
                                await apiRequest(
                                    "/api/employees",
                                    {
                                        method: "POST",

                                        body:
                                            JSON.stringify(request)
                                    }
                                );


                            console.log(
                                "Employee created:",
                                response
                            );


                            // =================================================
                            // SUCCESS
                            // =================================================

                            if (addEmployeeMessage) {

                                addEmployeeMessage.innerHTML = `
    < div class="custom-alert success" >
        ${escapeHtmlEmp(
                                    response.message ||
                                    "Employee created successfully."
                                )
                                    }
                            </div >
    `;
                            }


                            // Refresh employee list
                            await loadEmployees(0);


                            // Close modal
                            setTimeout(
                                function () {

                                    addEmployeeModal.hide();


                                    if (addEmployeeMessage) {
                                        addEmployeeMessage.innerHTML = "";
                                    }


                                    addEmployeeForm.reset();

                                },
                                1200
                            );


                        } catch (error) {

                            console.error(
                                "Failed to create employee:",
                                error
                            );


                            console.error(
                                "Backend response:",
                                error?.responseData ||
                                error?.response?.data
                            );


                            if (addEmployeeMessage) {

                                addEmployeeMessage.innerHTML = `
    < div class="custom-alert error" >
        ${escapeHtmlEmp(
                                    getErrorMessage(
                                        error,
                                        "Failed to create employee."
                                    )
                                )
                                    }
                            </div >
    `;
                            }


                        } finally {

                            if (submitButton) {

                                submitButton.disabled = false;

                                submitButton.textContent =
                                    originalText;
                            }

                        }

                    }
                );

            }

        }
    }

)




