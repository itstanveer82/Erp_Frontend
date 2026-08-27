// ==============================================================
// EMPLOYEES MODULE
// Wired to employee-service (via API gateway) - real endpoints:
//
//   GET    /api/v1/employees?query=&includeInactive=&page=&size=&sort=
//   GET    /api/v1/employees/{empId}
//   POST   /api/v1/employees
//   PUT    /api/v1/employees/{empId}
//   DELETE /api/v1/employees/{empId}                (deactivate)
//   PATCH  /api/v1/employees/{empId}/reactivate
//   POST   /api/v1/employees/{empId}/provision-login
//   GET    /api/v1/master-data/{type}?includeInactive=
//
// NOTE: /api/v1/master-data/** must be routed to employee-service on
// the gateway (added alongside /api/v1/employees/** in RouteConfig).
// ==============================================================

const EMP_PAGE_SIZE = 10;
let empCurrentPage = 0;
let empSearchQuery = "";
let empIncludeInactive = false;
let empMasterDataCache = {};
let empSelectedId = null;

// ------------------------------
// HELPERS
// ------------------------------
function escapeHtmlEmp(value) {
    if (value === null || value === undefined) {
        return "";
    }
    const div = document.createElement("div");
    div.textContent = String(value);
    return div.innerHTML;
}

function accountStatusBadge(status) {
    if (status === "CREATED") {
        return `<span class="text-success">Login Active</span>`;
    }
    if (status === "FAILED") {
        return `<span class="text-danger">Login Failed</span>`;
    }
    return `<span class="text-muted">Pending</span>`;
}

// ------------------------------
// MASTER DATA (dropdowns)
// ------------------------------
async function fetchMasterData(type) {
    if (empMasterDataCache[type]) {
        return empMasterDataCache[type];
    }
    try {
        const response = await apiRequest(`/api/v1/master-data/${type}?includeInactive=false`);
        const list = Array.isArray(response.data) ? response.data : [];
        empMasterDataCache[type] = list;
        return list;
    } catch (error) {
        console.error(`Failed to load master data (${type}):`, error);
        return [];
    }
}

function populateSelect(selectEl, list, placeholder, selectedId) {
    if (!selectEl) {
        return;
    }
    selectEl.innerHTML = `<option value="">${escapeHtmlEmp(placeholder)}</option>` +
        list.map(function (item) {
            const isSelected = selectedId != null && String(item.id) === String(selectedId);
            return `<option value="${item.id}" ${isSelected ? "selected" : ""}>${escapeHtmlEmp(item.name)}</option>`;
        }).join("");
}

async function loadMasterDataDropdowns() {
    const [genders, shifts, levels, companies, statuses] = await Promise.all([
        fetchMasterData("GENDER"),
        fetchMasterData("SHIFT"),
        fetchMasterData("EMPLOYEE_LEVEL"),
        fetchMasterData("COMPANY"),
        fetchMasterData("EMPLOYEE_STATUS")
    ]);
    populateSelect(document.getElementById("addEmpGender"), genders, "Select gender");
    populateSelect(document.getElementById("addEmpShift"), shifts, "Select shift");
    populateSelect(document.getElementById("addEmpLevel"), levels, "Select level (optional)");
    populateSelect(document.getElementById("addEmpCompany"), companies, "Select company");
    populateSelect(document.getElementById("addEmpStatus"), statuses, "Select status");
}

// ------------------------------
// LIST / SEARCH / PAGINATION
// GET /api/v1/employees
// ------------------------------
async function loadEmployees(page) {
    const tableBody = document.getElementById("employeesTableBody");
    if (!tableBody) {
        return;
    }
    empCurrentPage = page || 0;
    tableBody.innerHTML = `
        <tr>
            <td colspan="8" class="text-center py-4">Loading employees...</td>
        </tr>
    `;
    try {
        const params = new URLSearchParams();
        if (empSearchQuery) {
            params.set("query", empSearchQuery);
        }
        params.set("includeInactive", empIncludeInactive);
        params.set("page", empCurrentPage);
        params.set("size", EMP_PAGE_SIZE);
        params.set("sort", "empId,desc");

        const response = await apiRequest(`/api/v1/employees?${params.toString()}`);
        const pageData = response.data || {};
        const employees = Array.isArray(pageData.content) ? pageData.content : [];
        renderEmployeesTable(employees);
        renderEmployeesPagination(pageData);
    } catch (error) {
        console.error("Failed to load employees:", error);
        tableBody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center py-4 text-danger">
                    ${escapeHtmlEmp(error.responseData?.message || error.message || "Failed to load employees")}
                </td>
            </tr>
        `;
    }
}

function renderEmployeesTable(employees) {
    const tableBody = document.getElementById("employeesTableBody");
    if (!tableBody) {
        return;
    }
    if (employees.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center py-4 text-muted">No employees found</td>
            </tr>
        `;
        return;
    }
    tableBody.innerHTML = "";
    employees.forEach(function (emp) {
        const fullName = `${emp.firstName || ""} ${emp.lastName || ""}`.trim() || "--";
        const statusBadge = emp.active
            ? `<span class="text-success">Active</span>`
            : `<span class="text-danger">Inactive</span>`;
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${escapeHtmlEmp(emp.empCode || "--")}</td>
            <td>${escapeHtmlEmp(fullName)}</td>
            <td>${escapeHtmlEmp(emp.empEmail || "--")}</td>
            <td>${escapeHtmlEmp(emp.phone || "--")}</td>
            <td>${escapeHtmlEmp(emp.role || "--")}</td>
            <td>${accountStatusBadge(emp.accountStatus)}</td>
            <td>${statusBadge}</td>
            <td class="text-end">
                <div class="d-flex justify-content-end gap-2 flex-wrap">
                    <button type="button" class="secondary-action-btn emp-view-btn" data-emp-id="${emp.empId}">
                        View
                    </button>
                    <button type="button" class="secondary-action-btn emp-edit-btn" data-emp-id="${emp.empId}">
                        Edit
                    </button>
                    ${emp.accountStatus === "FAILED"
                        ? `<button type="button" class="secondary-action-btn emp-retry-btn" data-emp-id="${emp.empId}">Retry Login</button>`
                        : ""}
                    ${emp.active
                        ? `<button type="button" class="btn btn-outline-danger btn-sm emp-deactivate-btn" data-emp-id="${emp.empId}">Deactivate</button>`
                        : `<button type="button" class="btn btn-outline-success btn-sm emp-reactivate-btn" data-emp-id="${emp.empId}">Reactivate</button>`}
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function renderEmployeesPagination(pageData) {
    const container = document.getElementById("employeesPagination");
    if (!container) {
        return;
    }
    const totalPages = pageData.totalPages || 0;
    if (totalPages <= 1) {
        container.innerHTML = "";
        return;
    }
    let html = `<ul class="pagination pagination-sm mb-0">`;
    for (let i = 0; i < totalPages; i++) {
        html += `
            <li class="page-item ${i === pageData.page ? "active" : ""}">
                <button type="button" class="page-link emp-page-btn" data-page="${i}">${i + 1}</button>
            </li>
        `;
    }
    html += `</ul>`;
    container.innerHTML = html;
}

document.addEventListener("click", function (event) {
    const pageBtn = event.target.closest(".emp-page-btn");
    if (pageBtn) {
        loadEmployees(Number(pageBtn.dataset.page));
    }
});

// ------------------------------
// VIEW DETAILS
// GET /api/v1/employees/{empId}
// ------------------------------
function renderEmployeeDetails(emp) {
    const body = document.getElementById("viewEmployeeBody");
    if (!body) {
        return;
    }
    if (!emp) {
        body.innerHTML = `<div class="text-muted">No data.</div>`;
        return;
    }
    const fullName = `${emp.firstName || ""} ${emp.lastName || ""}`.trim() || "--";
    body.innerHTML = `
        <div class="profile-info-grid">
            <div class="profile-info-item">
                <span class="profile-label">Employee Code</span>
                <strong>${escapeHtmlEmp(emp.empCode || "--")}</strong>
            </div>
            <div class="profile-info-item">
                <span class="profile-label">Full Name</span>
                <strong>${escapeHtmlEmp(fullName)}</strong>
            </div>
            <div class="profile-info-item">
                <span class="profile-label">Date of Birth</span>
                <strong>${escapeHtmlEmp(emp.dateOfBirth || "--")}</strong>
            </div>
            <div class="profile-info-item">
                <span class="profile-label">Work Email</span>
                <strong>${escapeHtmlEmp(emp.empEmail || "--")}</strong>
            </div>
            <div class="profile-info-item">
                <span class="profile-label">Personal Email</span>
                <strong>${escapeHtmlEmp(emp.personalEmail || "--")}</strong>
            </div>
            <div class="profile-info-item">
                <span class="profile-label">Phone</span>
                <strong>${escapeHtmlEmp(emp.phone || "--")}</strong>
            </div>
            <div class="profile-info-item">
                <span class="profile-label">Role</span>
                <strong>${escapeHtmlEmp(emp.role || "--")}</strong>
            </div>
            <div class="profile-info-item">
                <span class="profile-label">Joining Date</span>
                <strong>${escapeHtmlEmp(emp.joiningDate || "--")}</strong>
            </div>
            <div class="profile-info-item">
                <span class="profile-label">Reporting Manager</span>
                <strong>${escapeHtmlEmp(emp.rm1EmpCode || "--")}</strong>
            </div>
            <div class="profile-info-item">
                <span class="profile-label">Secondary RM</span>
                <strong>${escapeHtmlEmp(emp.rm2EmpCode || "--")}</strong>
            </div>
            <div class="profile-info-item">
                <span class="profile-label">Salary</span>
                <strong>${emp.salary != null ? escapeHtmlEmp(emp.salary) : "--"}</strong>
            </div>
            <div class="profile-info-item">
                <span class="profile-label">Address</span>
                <strong>${escapeHtmlEmp(emp.address || "--")}</strong>
            </div>
            <div class="profile-info-item">
                <span class="profile-label">Login Account</span>
                <strong>${escapeHtmlEmp(emp.accountStatus || "--")}${emp.accountProvisioningError ? ` (${escapeHtmlEmp(emp.accountProvisioningError)})` : ""}</strong>
            </div>
            <div class="profile-info-item">
                <span class="profile-label">Status</span>
                <strong>${emp.active ? "Active" : "Inactive"}</strong>
            </div>
        </div>
    `;
}

// ------------------------------
// DOM READY: forms + delegated actions
// ------------------------------
document.addEventListener("DOMContentLoaded", function () {
    // SEARCH / FILTER
    const searchInput = document.getElementById("employeeSearchInput");
    const includeInactiveToggle = document.getElementById("employeeIncludeInactive");
    let searchDebounce;
    if (searchInput) {
        searchInput.addEventListener("input", function () {
            clearTimeout(searchDebounce);
            searchDebounce = setTimeout(function () {
                empSearchQuery = searchInput.value.trim();
                loadEmployees(0);
            }, 350);
        });
    }
    if (includeInactiveToggle) {
        includeInactiveToggle.addEventListener("change", function () {
            empIncludeInactive = includeInactiveToggle.checked;
            loadEmployees(0);
        });
    }

    // ADD EMPLOYEE
    // POST /api/v1/employees
    const addEmployeeModalEl = document.getElementById("addEmployeeModal");
    const addEmployeeModal = addEmployeeModalEl ? new bootstrap.Modal(addEmployeeModalEl) : null;
    const addEmployeeButton = document.getElementById("addEmployeeButton");
    const addEmployeeForm = document.getElementById("addEmployeeForm");
    const addEmployeeMessage = document.getElementById("addEmployeeMessage");

    if (addEmployeeButton && addEmployeeModal) {
        addEmployeeButton.addEventListener("click", async function () {
            addEmployeeForm.reset();
            addEmployeeMessage.innerHTML = "";
            addEmployeeModal.show();
            await loadMasterDataDropdowns();
        });
    }

    if (addEmployeeForm) {
        addEmployeeForm.addEventListener("submit", async function (event) {
            event.preventDefault();
            addEmployeeMessage.innerHTML = "";

            const genderId = document.getElementById("addEmpGender").value;
            const shiftId = document.getElementById("addEmpShift").value;
            const levelId = document.getElementById("addEmpLevel").value;
            const companyId = document.getElementById("addEmpCompany").value;
            const statusId = document.getElementById("addEmpStatus").value;
            const salaryValue = document.getElementById("addEmpSalary").value;

            const request = {
                firstName: document.getElementById("addEmpFirstName").value.trim(),
                lastName: document.getElementById("addEmpLastName").value.trim() || null,
                dateOfBirth: document.getElementById("addEmpDob").value,
                genderId: genderId ? Number(genderId) : null,
                email: document.getElementById("addEmpEmail").value.trim(),
                personalEmail: document.getElementById("addEmpPersonalEmail").value.trim() || null,
                phone: document.getElementById("addEmpPhone").value.trim() || null,
                address: document.getElementById("addEmpAddress").value.trim() || null,
                role: document.getElementById("addEmpRole").value || null,
                joiningDate: document.getElementById("addEmpJoiningDate").value || null,
                shiftId: shiftId ? Number(shiftId) : null,
                employeeLevelId: levelId ? Number(levelId) : null,
                companyId: companyId ? Number(companyId) : null,
                employeeStatusId: statusId ? Number(statusId) : null,
                rm1EmpCode: document.getElementById("addEmpRm1").value.trim(),
                rm2EmpCode: document.getElementById("addEmpRm2").value.trim() || null,
                salary: salaryValue ? Number(salaryValue) : null
            };

            const submitButton = addEmployeeForm.querySelector('button[type="submit"]');
            const originalText = submitButton ? submitButton.textContent : "";
            try {
                if (submitButton) {
                    submitButton.disabled = true;
                    submitButton.textContent = "Creating...";
                }
                const response = await apiRequest("/api/v1/employees", {
                    method: "POST",
                    body: JSON.stringify(request)
                });
                addEmployeeMessage.innerHTML = `
                    <div class="custom-alert success">
                        ${escapeHtmlEmp(response.message || "Employee created successfully.")}
                    </div>
                `;
                await loadEmployees(0);
                setTimeout(function () {
                    addEmployeeModal.hide();
                    addEmployeeMessage.innerHTML = "";
                    addEmployeeForm.reset();
                }, 1200);
            } catch (error) {
                console.error("Failed to create employee:", error);
                addEmployeeMessage.innerHTML = `
                    <div class="custom-alert error">
                        ${escapeHtmlEmp(error.responseData?.message || error.message || "Failed to create employee.")}
                    </div>
                `;
            } finally {
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.textContent = originalText;
                }
            }
        });
    }

    // VIEW MODAL
    const viewEmployeeModalEl = document.getElementById("viewEmployeeModal");
    const viewEmployeeModal = viewEmployeeModalEl ? new bootstrap.Modal(viewEmployeeModalEl) : null;

    // EDIT MODAL
    // PUT /api/v1/employees/{empId}
    const editEmployeeModalEl = document.getElementById("editEmployeeModal");
    const editEmployeeModal = editEmployeeModalEl ? new bootstrap.Modal(editEmployeeModalEl) : null;
    const editEmployeeForm = document.getElementById("editEmployeeForm");
    const editEmployeeMessage = document.getElementById("editEmployeeMessage");

    document.addEventListener("click", async function (event) {
        const viewBtn = event.target.closest(".emp-view-btn");
        const editBtn = event.target.closest(".emp-edit-btn");
        const deactivateBtn = event.target.closest(".emp-deactivate-btn");
        const reactivateBtn = event.target.closest(".emp-reactivate-btn");
        const retryBtn = event.target.closest(".emp-retry-btn");

        // VIEW
        if (viewBtn && viewEmployeeModal) {
            const empId = viewBtn.dataset.empId;
            document.getElementById("viewEmployeeBody").innerHTML = "Loading...";
            viewEmployeeModal.show();
            try {
                const response = await apiRequest(`/api/v1/employees/${empId}`);
                renderEmployeeDetails(response.data);
            } catch (error) {
                document.getElementById("viewEmployeeBody").innerHTML = `
                    <div class="custom-alert error">
                        ${escapeHtmlEmp(error.responseData?.message || error.message || "Failed to load employee.")}
                    </div>
                `;
            }
        }

        // EDIT
        if (editBtn && editEmployeeModal) {
            const empId = editBtn.dataset.empId;
            empSelectedId = empId;
            editEmployeeMessage.innerHTML = "";
            editEmployeeForm.reset();
            editEmployeeModal.show();
            try {
                const response = await apiRequest(`/api/v1/employees/${empId}`);
                const emp = response.data;
                const fullName = `${emp.firstName || ""} ${emp.lastName || ""}`.trim();
                document.getElementById("editEmpName").value = fullName;
                document.getElementById("editEmpEmail").value = emp.empEmail || "";
                document.getElementById("editEmpCode").value = emp.empCode || "";
                document.getElementById("editEmpSalary").value = emp.salary != null ? emp.salary : "";
            } catch (error) {
                editEmployeeMessage.innerHTML = `
                    <div class="custom-alert error">
                        ${escapeHtmlEmp(error.responseData?.message || error.message || "Failed to load employee.")}
                    </div>
                `;
            }
        }

        // DEACTIVATE
        // DELETE /api/v1/employees/{empId}
        if (deactivateBtn) {
            const empId = deactivateBtn.dataset.empId;
            if (!confirm("Deactivate this employee? Historical data is preserved and this can be undone.")) {
                return;
            }
            try {
                deactivateBtn.disabled = true;
                await apiRequest(`/api/v1/employees/${empId}`, { method: "DELETE" });
                await loadEmployees(empCurrentPage);
            } catch (error) {
                alert(error.responseData?.message || error.message || "Failed to deactivate employee.");
                deactivateBtn.disabled = false;
            }
        }

        // REACTIVATE
        // PATCH /api/v1/employees/{empId}/reactivate
        if (reactivateBtn) {
            const empId = reactivateBtn.dataset.empId;
            try {
                reactivateBtn.disabled = true;
                await apiRequest(`/api/v1/employees/${empId}/reactivate`, { method: "PATCH" });
                await loadEmployees(empCurrentPage);
            } catch (error) {
                alert(error.responseData?.message || error.message || "Failed to reactivate employee.");
                reactivateBtn.disabled = false;
            }
        }

        // RETRY LOGIN PROVISIONING
        // POST /api/v1/employees/{empId}/provision-login
        if (retryBtn) {
            const empId = retryBtn.dataset.empId;
            const originalText = retryBtn.textContent;
            try {
                retryBtn.disabled = true;
                retryBtn.textContent = "Retrying...";
                await apiRequest(`/api/v1/employees/${empId}/provision-login`, { method: "POST" });
                await loadEmployees(empCurrentPage);
            } catch (error) {
                alert(error.responseData?.message || error.message || "Retry failed.");
                retryBtn.disabled = false;
                retryBtn.textContent = originalText;
            }
        }
    });

    if (editEmployeeForm) {
        editEmployeeForm.addEventListener("submit", async function (event) {
            event.preventDefault();
            editEmployeeMessage.innerHTML = "";

            const request = {
                empName: document.getElementById("editEmpName").value.trim(),
                empEmail: document.getElementById("editEmpEmail").value.trim(),
                empCode: document.getElementById("editEmpCode").value.trim(),
                salary: Number(document.getElementById("editEmpSalary").value)
            };

            const submitButton = editEmployeeForm.querySelector('button[type="submit"]');
            const originalText = submitButton ? submitButton.textContent : "";
            try {
                if (submitButton) {
                    submitButton.disabled = true;
                    submitButton.textContent = "Saving...";
                }
                const response = await apiRequest(`/api/v1/employees/${empSelectedId}`, {
                    method: "PUT",
                    body: JSON.stringify(request)
                });
                editEmployeeMessage.innerHTML = `
                    <div class="custom-alert success">
                        ${escapeHtmlEmp(response.message || "Employee updated successfully.")}
                    </div>
                `;
                await loadEmployees(empCurrentPage);
                setTimeout(function () {
                    editEmployeeModal.hide();
                    editEmployeeMessage.innerHTML = "";
                }, 1000);
            } catch (error) {
                editEmployeeMessage.innerHTML = `
                    <div class="custom-alert error">
                        ${escapeHtmlEmp(error.responseData?.message || error.message || "Failed to update employee.")}
                    </div>
                `;
            } finally {
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.textContent = originalText;
                }
            }
        });
    }
});
