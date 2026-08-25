document.addEventListener("DOMContentLoaded", function () {
    // AUTHENTICATION CHECK
    const authData = getAuthData();
    if (!authData || !authData.token) {
        window.location.href = "../auth/login.html";
        return;
    }
    // USER DATA
    const user = authData.user || {};
    const firstName =
        user.firstName ||
        authData.firstName ||
        "";
    const lastName =
        user.lastName ||
        authData.lastName ||
        "";
    const email =
        user.email ||
        authData.email ||
        localStorage.getItem("email") ||
        "";
    console.log("email:", email);
    console.log("authdataaaaaaa:", authData);
    const fullName =
        user.name ||
        user.fullName ||
        authData.name ||
        authData.fullName ||
        `${firstName} ${lastName}`.trim() ||
        email ||
        "System Admin";
    // GET ROLES
    let userRoles = [];
    if (Array.isArray(user.roles)) {
        userRoles = user.roles;
    } else if (Array.isArray(authData.roles)) {
        userRoles = authData.roles;
    } else if (authData.role) {
        userRoles = [authData.role];
    } else {
        const storedRole =
            localStorage.getItem("role");
        if (storedRole) {
            userRoles = [storedRole];
        }
    }
    // GET PERMISSIONS
    let userPermissions = [];
    if (Array.isArray(user.permissions)) {
        userPermissions = user.permissions;
    } else if (Array.isArray(authData.permissions)) {
        userPermissions = authData.permissions;
    }
    // DEBUG
    console.log("Auth Data:", authData);
    console.log("User:", user);
    console.log("Full Name:", fullName);
    console.log("Email:", email);
    console.log("Roles:", userRoles);
    console.log("Permissions:", userPermissions);
    // USER INFORMATION ELEMENTS
    const userName =
        document.getElementById("userName");
    const userRole =
        document.getElementById("userRole");
    const dashboardWelcome =
        document.getElementById("dashboardWelcome");
    const currentRole =
        document.getElementById("currentRole");
    // NAVBAR USER INFORMATION
    if (userName) {
        userName.textContent = fullName;
    }
    if (userRole) {
        userRole.textContent =
            userRoles.length > 0
                ? userRoles
                    .map(getDisplayName)
                    .join(", ")
                : "ADMIN";
    }
    // DASHBOARD WELCOME
    if (dashboardWelcome) {
        const welcomeName =
            firstName ||
            fullName ||
            "User";
        dashboardWelcome.textContent =
            `Welcome back, ${welcomeName}`;
    }
    // CURRENT ROLE
    if (currentRole) {
        currentRole.textContent =
            userRoles.length > 0
                ? userRoles
                    .map(getDisplayName)
                    .join(", ")
                : "ADMIN";
    }
    // USER INITIALS
    let initials = "";
    if (firstName) {
        initials += firstName.charAt(0);
    }
    if (lastName) {
        initials += lastName.charAt(0);
    }
    if (!initials && fullName) {
        const nameParts =
            fullName.trim().split(" ");
        if (nameParts.length >= 2) {
            initials =
                nameParts[0].charAt(0) +
                nameParts[1].charAt(0);
        } else {
            initials =
                fullName.substring(0, 2);
        }
    }
    if (!initials) {
        initials = "AD";
    }
    initials = initials.toUpperCase();
    // ADMIN PROFILE DROPDOWN
    const adminProfileButton =
        document.getElementById("adminProfileButton");
    const adminProfileDropdown =
        document.getElementById("adminProfileDropdown");
    const headerAdminInitials =
        document.getElementById("headerAdminInitials");
    const headerAdminName =
        document.getElementById("headerAdminName");
    const headerAdminRole =
        document.getElementById("headerAdminRole");
    const dropdownAdminInitials =
        document.getElementById("dropdownAdminInitials");
    const dropdownAdminName =
        document.getElementById("dropdownAdminName");
    const dropdownAdminRole =
        document.getElementById("dropdownAdminRole");
    const displayRole =
        userRoles.length > 0
            ? userRoles.map(getDisplayName).join(", ")
            : "ADMIN";
    // Header profile data
    if (headerAdminInitials) {
        headerAdminInitials.textContent = initials;
    }
    if (headerAdminName) {
        headerAdminName.textContent = fullName;
    }
    if (headerAdminRole) {
        headerAdminRole.textContent = displayRole;
    }
    // Dropdown profile data
    if (dropdownAdminInitials) {
        dropdownAdminInitials.textContent = initials;
    }
    if (dropdownAdminName) {
        dropdownAdminName.textContent = fullName;
    }
    if (dropdownAdminRole) {
        dropdownAdminRole.textContent = displayRole;
    }
    // Open / close dropdown
    if (adminProfileButton && adminProfileDropdown) {
        adminProfileButton.addEventListener("click", function (event) {
            event.stopPropagation();
            adminProfileDropdown.classList.toggle("show");
        });
        document.addEventListener("click", function () {
            adminProfileDropdown.classList.remove("show");
        });
        adminProfileDropdown.addEventListener(
            "click",
            function (event) {
                event.stopPropagation();
            }
        );
    }
    // DASHBOARD ROLES
    function renderDashboardRoles() {
        const dashboardRoles =
            document.getElementById("dashboardRoles");
        if (!dashboardRoles) {
            return;
        }
        dashboardRoles.innerHTML = "";
        if (userRoles.length === 0) {
            dashboardRoles.innerHTML = `
                <span class="permission-tag">
                    No roles assigned
                </span>
            `;
            return;
        }
        userRoles.forEach(function (role) {
            const roleBadge =
                document.createElement("span");
            roleBadge.className =
                "role-badge";
            roleBadge.textContent =
                getDisplayName(role);
            dashboardRoles.appendChild(roleBadge);
        });
    }
    // DASHBOARD PERMISSIONS
    function renderDashboardPermissions() {
        const dashboardPermissions =
            document.getElementById(
                "dashboardPermissions"
            );
        const permissionCount =
            document.getElementById(
                "permissionCount"
            );
        if (permissionCount) {
            permissionCount.textContent =
                userPermissions.length;
        }
        if (!dashboardPermissions) {
            return;
        }
        dashboardPermissions.innerHTML = "";
        if (userPermissions.length === 0) {
            dashboardPermissions.innerHTML = `
                <span class="permission-tag">
                    No permissions assigned
                </span>
            `;
            return;
        }
        userPermissions.forEach(function (permission) {
            const permissionTag =
                document.createElement("span");
            permissionTag.className =
                "permission-tag";
            permissionTag.textContent =
                getDisplayName(permission);
            dashboardPermissions.appendChild(
                permissionTag
            );
        });
    }
    renderDashboardRoles();
    renderDashboardPermissions();
    // PROFILE INFORMATION
    const profileName =
        document.getElementById("profileName");
    const profileEmail =
        document.getElementById("profileEmail");
    const profileFullName =
        document.getElementById("profileFullName");
    const profileEmailAddress =
        document.getElementById(
            "profileEmailAddress"
        );
    const profileRole =
        document.getElementById("profileRole");
    const profileInitials =
        document.getElementById(
            "profileInitials"
        );
    const profileRoles =
        document.getElementById("profileRoles");
    const profilePermissions =
        document.getElementById(
            "profilePermissions"
        );
    const profilePermissionCount =
        document.getElementById(
            "profilePermissionCount"
        );
    const profilePrimaryRole =
        document.getElementById("profilePrimaryRole");
    if (profileName) {
        profileName.textContent =
            fullName;
    }
    if (profileEmail) {
        profileEmail.textContent =
            email || "No email available";
    }
    if (profileFullName) {
        profileFullName.textContent =
            fullName || "--";
    }
    if (profileEmailAddress) {
        profileEmailAddress.textContent =
            email || "--";
    }
    if (profileRole) {
        profileRole.textContent =
            userRoles.length > 0
                ? userRoles
                    .map(getDisplayName)
                    .join(", ")
                : "ADMIN";
    }
    if (profilePrimaryRole) {
        profilePrimaryRole.textContent = displayRole;
    }
    if (profileInitials) {
        profileInitials.textContent =
            initials;
    }
    // PROFILE ROLES
    function renderProfileRoles() {
        if (!profileRoles) {
            return;
        }
        profileRoles.innerHTML = "";
        if (userRoles.length === 0) {
            profileRoles.innerHTML = `
                <span class="permission-tag">
                    No roles assigned
                </span>
            `;
            return;
        }
        userRoles.forEach(function (role) {
            const roleBadge =
                document.createElement("span");
            roleBadge.className =
                "role-badge";
            roleBadge.textContent =
                getDisplayName(role);
            profileRoles.appendChild(roleBadge);
        });
    }
    // PROFILE PERMISSIONS
    function renderProfilePermissions() {
        if (profilePermissionCount) {
            profilePermissionCount.textContent =
                userPermissions.length;
        }
        if (!profilePermissions) {
            return;
        }
        profilePermissions.innerHTML = "";
        if (userPermissions.length === 0) {
            profilePermissions.innerHTML = `
                <span class="permission-tag">
                    No permissions assigned
                </span>
            `;
            return;
        }
        userPermissions.forEach(function (permission) {
            const permissionTag =
                document.createElement("span");
            permissionTag.className =
                "permission-tag";
            permissionTag.textContent =
                getDisplayName(permission);
            profilePermissions.appendChild(
                permissionTag
            );
        });
    }
    renderProfileRoles();
    renderProfilePermissions();
    // ALL VIEWS
    const views = {
        dashboard:
            document.getElementById(
                "dashboardView"
            ),
        profile:
            document.getElementById(
                "profileView"
            ),
        employees:
            document.getElementById(
                "employeesView"
            ),
        users:
            document.getElementById(
                "usersView"
            ),
        attendance:
            document.getElementById(
                "attendanceView"
            ),
        roles:
            document.getElementById(
                "rolesView"
            ),
        permissions:
            document.getElementById(
                "permissionsView"
            ),
        payroll:
            document.getElementById(
                "payrollView"
            ),
        reports:
            document.getElementById(
                "reportsView"
            )
    };
    // SHOW SELECTED VIEW
    function showView(viewName) {
        if (!views[viewName]) {
            console.error(
                "View not found:",
                viewName
            );
            return;
        }
        Object.values(views).forEach(
            function (view) {
                if (view) {
                    view.classList.add(
                        "d-none"
                    );
                }
            }
        );
        views[viewName].classList.remove(
            "d-none"
        );
        // UPDATE ACTIVE SIDEBAR
        document
            .querySelectorAll(
                ".sidebar-item[data-view]"
            )
            .forEach(function (item) {
                item.classList.remove("active");
                if (
                    item.dataset.view ===
                    viewName
                ) {
                    item.classList.add("active");
                }
            });
        // CLOSE MOBILE SIDEBAR
        if (window.innerWidth < 768) {
            const sidebar =
                document.getElementById(
                    "dashboardSidebar"
                );
            if (
                sidebar &&
                sidebar.classList.contains("show")
            ) {
                const collapseInstance =
                    bootstrap.Collapse.getInstance(
                        sidebar
                    );
                if (collapseInstance) {
                    collapseInstance.hide();
                }
            }
        }
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
        // LOAD API DATA
        if (viewName === "roles") {
            loadRoles();
        }
        if (viewName === "permissions") {
            loadPermissions();
        }
        if (viewName === "users") {
            loadUsers();
        }
    }
    // OPEN MY PROFILE
    const profileViewButton =
        document.getElementById("profileViewButton");
    if (profileViewButton) {
        profileViewButton.addEventListener("click", function () {
            showView("profile");
            if (adminProfileDropdown) {
                adminProfileDropdown.classList.remove("show");
            }
        });
    }
    // ==============================
    // SIDEBAR + QUICK ACTIONS +
    // PROFILE BUTTON
    // ==============================
    document
        .querySelectorAll("[data-view]")
        .forEach(function (item) {
            item.addEventListener(
                "click",
                function (event) {
                    const viewName =
                        this.dataset.view;
                    if (views[viewName]) {
                        event.preventDefault();
                        showView(viewName);
                    }
                }
            );
        });
    // ==============================
    // LOAD ALL ROLES
    // GET /api/roles
    // ==============================
    let selectedRoleId = null;
    let selectedRole = null;
    async function loadRoles() {
        const rolesCardsContainer =
            document.getElementById(
                "rolesCardsContainer"
            );
        if (!rolesCardsContainer) {
            console.error(
                "rolesCardsContainer not found"
            );
            return;
        }
        rolesCardsContainer.innerHTML = `
        <div class="text-center py-5">
            Loading roles...
        </div>
    `;
        try {
            const response =
                await apiRequest("/api/roles");
            console.log(
                "Roles API Response:",
                response
            );
            const roles =
                Array.isArray(response.data)
                    ? response.data
                    : [];
            if (roles.length === 0) {
                rolesCardsContainer.innerHTML = `
                <div class="text-center py-5 text-muted">
                    No roles found
                </div>
            `;
                return;
            }
            rolesCardsContainer.innerHTML = "";
            roles.forEach(function (role) {
                const permissions =
                    Array.isArray(role.permissions)
                        ? role.permissions
                        : [];
                const permissionsHtml =
                    permissions.length > 0
                        ? permissions.map(
                            function (permission) {
                                return `
                                <span class="small-permission-tag">
                                    ${escapeHtml(
                                    getDisplayName(permission)
                                )}
                                </span>
                            `;
                            }
                        ).join("")
                        : `
                        <span class="text-muted">
                            No permissions
                        </span>
                    `;
                const roleCard =
                    document.createElement("div");
                roleCard.className =
                    "role-card";
                roleCard.innerHTML = `
                <div class="role-card-header">
                    <div>
                        <small>
                            ROLE ID: ${escapeHtml(role.id)}
                        </small>
                        <h5>
                            ${escapeHtml(
                    getDisplayName(role)
                )}
                        </h5>
                    </div>
                </div>
                <div class="role-card-body">
                    <p class="role-card-label">
                        Description
                    </p>
                    <p class="role-card-description">
                        ${escapeHtml(
                    role.description || "--"
                )}
                    </p>
                    <p class="role-card-label">
                        Permissions
                    </p>
                    <div class="role-card-permissions">
                        ${permissionsHtml}
                    </div>
                    <div class="role-card-actions">
                        <button
    type="button"
    class="secondary-action-btn edit-role-btn"
    data-role-id="${role.id}"
    data-role-name="${escapeHtml(role.name || "")}"
    data-role-description="${escapeHtml(role.description || "")}">
    Edit
</button>
                        <button
    type="button"
    class="secondary-action-btn role-permissions-btn"
    data-role-id="${role.id}"
    data-role-name="${escapeHtml(role.name || "")}">
    Permissions
</button>
                        <button
                            type="button"
                            class="btn btn-outline-danger delete-role-btn"
                            data-role-id="${role.id}">
                            Delete
                        </button>
                    </div>
                </div>
            `;
                roleCard.querySelector(".edit-role-btn")
                    .addEventListener("click", function () {
                        selectedRoleId = role.id;
                        selectedRole = role;
                        document.getElementById("editRoleName").value =
                            role.name || "";
                        document.getElementById("editRoleDescription").value =
                            role.description || "";
                        editRoleModal.show();
                    });
                roleCard.querySelector(".role-permissions-btn")
                    .addEventListener("click", function () {
                        selectedRoleId = role.id;
                        selectedRole = role;
                        loadRolePermissions(role);
                        rolePermissionsModal.show();
                    });
                roleCard.querySelector(".delete-role-btn")
                    .addEventListener("click", function () {
                        deleteRole(role.id);
                    });
                rolesCardsContainer.appendChild(
                    roleCard
                );
            });
        } catch (error) {
            console.error(
                "Failed to fetch roles:",
                error
            );
            rolesCardsContainer.innerHTML = `
            <div class="text-center py-5 text-danger">
                ${escapeHtml(
                error.message ||
                "Failed to load roles"
            )}
            </div>
        `;
        }
    }
    // selectedRoleId
    const editRoleModal =
        new bootstrap.Modal(
            document.getElementById("editRoleModal")
        );
    const rolePermissionsModal =
        new bootstrap.Modal(
            document.getElementById("rolePermissionsModal")
        );
    document.addEventListener(
        "click",
        async function (event) {
            const editButton =
                event.target.closest(".edit-role-btn");
            const permissionsButton =
                event.target.closest(".role-permissions-btn");
            const deleteButton =
                event.target.closest(".delete-role-btn");
            // EDIT
            if (editButton) {
                selectedRoleId =
                    editButton.dataset.roleId;
                document.getElementById(
                    "editRoleName"
                ).value =
                    editButton.dataset.roleName;
                document.getElementById(
                    "editRoleDescription"
                ).value =
                    editButton.dataset.roleDescription;
                editRoleModal.show();
            }
            // PERMISSIONS
            if (permissionsButton) {
                selectedRoleId =
                    permissionsButton.dataset.roleId;
                const response =
                    await apiRequest("/api/roles");
                const role =
                    response.data.find(
                        function (item) {
                            return String(item.id) ===
                                String(selectedRoleId);
                        }
                    );
                const permissionsResponse =
                    await apiRequest("/api/permissions");
                const permissions =
                    permissionsResponse.data || [];
                const assignedPermissions =
                    role?.permissions || [];
                document.getElementById(
                    "rolePermissionsTitle"
                ).textContent =
                    `Permissions for ${permissionsButton.dataset.roleName}`;
                document.getElementById(
                    "rolePermissionsList"
                ).innerHTML =
                    permissions.map(
                        function (permission) {
                            const permissionName =
                                permission.name || permission;
                            return `
                            <div class="form-check mb-2">
                                <input
                                    class="form-check-input role-permission-checkbox"
                                    type="checkbox"
                                    value="${escapeHtml(permissionName)}"
                                    id="permission_${escapeHtml(permissionName)}"
                                    ${assignedPermissions.includes(permissionName)
                                    ? "checked"
                                    : ""
                                }>
                                <label
                                    class="form-check-label"
                                    for="permission_${escapeHtml(permissionName)}">
                                    ${escapeHtml(permissionName)}
                                </label>
                            </div>
                        `;
                        }
                    ).join("");
                rolePermissionsModal.show();
            }
            // DELETE
            if (deleteButton) {
                const roleId =
                    deleteButton.dataset.roleId;
                if (!confirm("Delete this role?")) {
                    return;
                }
                await apiRequest(
                    `/api/roles/${roleId}`,
                    {
                        method: "DELETE"
                    }
                );
                loadRoles();
            }
        }
    );
    //save edit role fucntion for when the edit role modal is submitted
    document
        .getElementById("saveEditRoleButton")
        .addEventListener(
            "click",
            async function () {
                await apiRequest(
                    `/api/roles/${selectedRoleId}`,
                    {
                        method: "PUT",
                        body: JSON.stringify({
                            name:
                                document.getElementById(
                                    "editRoleName"
                                ).value,
                            description:
                                document.getElementById(
                                    "editRoleDescription"
                                ).value
                        })
                    }
                );
                editRoleModal.hide();
                loadRoles();
            }
        );
    //save role permissions function for when the role permissions modal is submitted
    document
        .getElementById("saveRolePermissionsButton")
        .addEventListener(
            "click",
            async function () {
                const permissionNames =
                    Array.from(
                        document.querySelectorAll(
                            ".role-permission-checkbox:checked"
                        )
                    ).map(
                        function (checkbox) {
                            return checkbox.value;
                        }
                    );
                await apiRequest(
                    `/api/roles/${selectedRoleId}/permissions`,
                    {
                        method: "POST",
                        body: JSON.stringify({
                            permissionNames:
                                permissionNames
                        })
                    }
                );
                rolePermissionsModal.hide();
                loadRoles();
            }
        );
    // ADD ROLE
    const addRoleModal = new bootstrap.Modal(
        document.getElementById("addRoleModal")
    );
    document.getElementById("addRoleButton")
        .addEventListener("click", function () {
            document.getElementById("addRoleForm").reset();
            document.getElementById("addRoleMessage").innerHTML = "";
            addRoleModal.show();
        });
    document.getElementById("addRoleForm")
        .addEventListener("submit", async function (event) {
            event.preventDefault();
            const name =
                document.getElementById("roleName")
                    .value.trim();
            const description =
                document.getElementById("roleDescription")
                    .value.trim();
            if (!name || !description) {
                document.getElementById("addRoleMessage").innerHTML =
                    `<div class="custom-alert error">
                    Please fill all fields.
                </div>`;
                return;
            }
            try {
                const response =
                    await apiRequest("/api/roles", {
                        method: "POST",
                        body: JSON.stringify({
                            name: name,
                            description: description
                        })
                    });
                if (response.success === false) {
                    throw new Error(
                        response.message || "Failed to add role"
                    );
                }
                await loadRoles();
                addRoleModal.hide();
            } catch (error) {
                document.getElementById("addRoleMessage").innerHTML =
                    `<div class="custom-alert error">
                    ${escapeHtml(error.message)}
                </div>`;
            }
        });
    // ==============================
    // LOAD ALL PERMISSIONS
    // GET /api/permissions
    // ==============================
  async function loadPermissions() {
    const permissionsTableBody =
        document.getElementById(
            "permissionsTableBody"
        );
    if (!permissionsTableBody) {
        console.error(
            "permissionsTableBody not found"
        );
        return;
    }
    permissionsTableBody.innerHTML = `
        <tr>
            <td colspan="4"
                class="text-center py-4">
                Loading permissions...
            </td>
        </tr>
    `;
    try {
        const response =
            await apiRequest(
                "/api/permissions"
            );
        console.log(
            "Permissions API Response:",
            response
        );
        const permissions =
            Array.isArray(response.data)
                ? response.data
                : [];
        if (permissions.length === 0) {
            permissionsTableBody.innerHTML = `
                <tr>
                    <td colspan="4"
                        class="text-center py-4 text-muted">
                        No permissions found
                    </td>
                </tr>
            `;
            return;
        }
        permissionsTableBody.innerHTML = "";
        permissions.forEach(
            function (permission) {
                const row =
                    document.createElement("tr");
                row.innerHTML = `
                    <td>
                        ${escapeHtml(
                    permission.id
                )}
                    </td>
                    <td class="table-permission-name">
                        ${escapeHtml(
                    getDisplayName(
                        permission
                    )
                )}
                    </td>
                    <td class="table-description">
                        ${escapeHtml(
                    permission.description ||
                    "--"
                )}
                    </td>
                    <td>
                        <button type="button"
                            class="btn btn-outline-primary btn-sm edit-permission-btn"
                            data-permission-id="${escapeHtml(permission.id)}"
                            data-permission-name="${escapeHtml(getDisplayName(permission))}"
                            data-permission-description="${escapeHtml(permission.description || "")}">
                            Edit
                        </button>
                    </td>
                `;
                permissionsTableBody.appendChild(row);
            }
        );
    } catch (error) {
        console.error(
            "Failed to fetch permissions:",
            error
        );
        permissionsTableBody.innerHTML = `
            <tr>
                <td colspan="4"
                    class="text-center py-4 text-danger">
                    ${escapeHtml(
            error.message ||
            "Failed to load permissions"
        )}
                </td>
            </tr>
        `;
    }
}
    const addPermissionModal =
    new bootstrap.Modal(
        document.getElementById(
            "addPermissionModal"
        )
    );
document
    .getElementById("addPermissionButton")
    .addEventListener(
        "click",
        function () {
            addPermissionModal.show();
        }
    );
document
    .getElementById("addPermissionForm")
    .addEventListener(
        "submit",
        async function (event) {
            event.preventDefault();
            await apiRequest(
                "/api/permissions",
                {
                    method: "POST",
                    body: JSON.stringify({
                        name:
                            document.getElementById(
                                "permissionName"
                            ).value,
                        description:
                            document.getElementById(
                                "permissionDescription"
                            ).value
                    })
                }
            );
            addPermissionMessage.innerHTML =`<div class="custom-alert success">Permission added successfully.</div>`;
            loadPermissions();
            setTimeout(function () {
                addPermissionModal.hide();
                addPermissionMessage.innerHTML = "";
                addPermissionForm.reset();
            }, 1200);
        }
    );

    // EDIT PERMISSION
let selectedPermissionId = null;
const editPermissionModalElement =
    document.getElementById("editPermissionModal");
const editPermissionForm =
    document.getElementById("editPermissionForm");
if (editPermissionModalElement && editPermissionForm) {
    const editPermissionModal =
        new bootstrap.Modal(editPermissionModalElement);

    document
        .getElementById("permissionsTableBody")
        .addEventListener("click", function (event) {
            const editButton =
                event.target.closest(".edit-permission-btn");
            if (!editButton) {
                return;
            }
            selectedPermissionId =
                editButton.dataset.permissionId;
            document.getElementById("editPermissionName").value =
                editButton.dataset.permissionName || "";
            document.getElementById("editPermissionDescription").value =
                editButton.dataset.permissionDescription || "";
            document.getElementById("editPermissionMessage").innerHTML = "";
            editPermissionModal.show();
        });

    editPermissionForm.addEventListener(
        "submit",
        async function (event) {
            event.preventDefault();
            const editPermissionMessage =
                document.getElementById("editPermissionMessage");
            editPermissionMessage.innerHTML = "";
            const name =
                document.getElementById("editPermissionName")
                    .value.trim();
            const description =
                document.getElementById("editPermissionDescription")
                    .value.trim();
            if (!name || !description) {
                editPermissionMessage.innerHTML =
                    `<div class="custom-alert error">
                    Please fill all fields.
                </div>`;
                return;
            }
            try {
                const response =
                    await apiRequest(
                        `/api/permissions/${selectedPermissionId}`,
                        {
                            method: "PUT",
                            body: JSON.stringify({
                                name: name,
                                description: description
                            })
                        }
                    );
                if (response.success === false) {
                    throw new Error(
                        response.message ||
                        "Failed to update permission"
                    );
                }
                editPermissionMessage.innerHTML =
                    `<div class="custom-alert success">
                    Permission updated successfully.
                </div>`;
                await loadPermissions();
                setTimeout(function () {
                    editPermissionModal.hide();
                    editPermissionMessage.innerHTML = "";
                }, 1000);
            } catch (error) {
                editPermissionMessage.innerHTML =
                    `<div class="custom-alert error">
                    ${escapeHtml(
                        error.responseData?.message ||
                        error.message ||
                        "Failed to update permission."
                    )}
                </div>`;
            }
        }
    );
}
const removePermissionModalElement =
    document.getElementById("removePermissionModal");
const removePermissionButton =
    document.getElementById("removePermissionButton");
const removePermissionForm =
    document.getElementById("removePermissionForm");
if (
    removePermissionModalElement &&
    removePermissionButton &&
    removePermissionForm
) {
    const removePermissionModal =
        new bootstrap.Modal(removePermissionModalElement);
    removePermissionButton.addEventListener(
        "click",
        function () {
            removePermissionModal.show();
        }
    );
removePermissionForm.addEventListener(
    "submit",
    async function (event) {
        event.preventDefault();
        const permissionId =
            document.getElementById(
                "removePermissionId"
            ).value;
        const removePermissionMessage =
            document.getElementById("removePermissionMessage");
        removePermissionMessage.innerHTML = "";
        try {
            await apiRequest(
                `/api/permissions/${permissionId}`,
                {
                    method: "DELETE"
                }
            );
            removePermissionMessage.innerHTML =
                `<div class="custom-alert success">
                Permission deleted successfully.
            </div>`;
            loadPermissions();
            setTimeout(function () {
                removePermissionModal.hide();
                removePermissionMessage.innerHTML = "";
                removePermissionForm.reset();
            }, 1200);
        } catch (error) {
            removePermissionMessage.innerHTML =
                `<div class="custom-alert error">
                ${escapeHtml(
                    error.responseData?.message ||
                    "Cannot delete permission: it is assigned to a role."
                )}
            </div>`;
        }
    }
);


}
    //for roles modal
    const userRolesModalElement =
        document.getElementById(
            "userRolesModal"
        );
    const userRolesList =
        document.getElementById(
            "userRolesList"
        );
    let userRolesModal = null;
    if (userRolesModalElement) {
        userRolesModal =
            new bootstrap.Modal(
                userRolesModalElement
            );
    }
    // load User function
    let loadedUsers = [];
    async function loadUsers() {
        const usersTableBody =
            document.getElementById(
                "usersTableBody"
            );
        if (!usersTableBody) {
            console.error(
                "usersTableBody not found"
            );
            return;
        }
        usersTableBody.innerHTML = `
        <tr>
            <td colspan="5"
                class="text-center py-4">
                Loading users...
            </td>
        </tr>
    `;
        try {
            const response =
                await apiRequest(
                    "/api/users"
                );
            console.log(
                "Users API Response:",
                response
            );
            const users =
                Array.isArray(
                    response.data?.content
                )
                    ? response.data.content
                    : [];
            loadedUsers = users;
            if (users.length === 0) {
                usersTableBody.innerHTML = `
                <tr>
                    <td colspan="5"
                        class="text-center py-4 text-muted">
                        No users found
                    </td>
                </tr>
            `;
                return;
            }
            usersTableBody.innerHTML = "";
            users.forEach(
                function (user) {
                    const fullName =
                        `${user.firstName || ""} ${user.lastName || ""}`
                            .trim() || "--";
                    const roles =
                        Array.isArray(user.roles)
                            ? user.roles
                            : [];
                    const rolesHtml =
                        roles.length > 0
                            ? roles.map(
                                function (role) {
                                    return `
                                    <span class="small-permission-tag">
                                        ${escapeHtml(role)}
                                    </span>
                                `;
                                }
                            ).join("")
                            : `<span class="text-muted">No roles</span>`;
                    const status =
                        user.enabled
                            ? "Active"
                            : "Inactive";
                    const row =
                        document.createElement("tr");
                    row.innerHTML = `
                    <td class="table-role-name">
                        ${escapeHtml(fullName)}
                    </td>
                    <td>
                        ${escapeHtml(
                        user.email || "--"
                    )}
                    </td>
                    <td class="table-permissions">
                        ${rolesHtml}
                    </td>
                    <td>
                        <span class="${user.enabled
                            ? "text-success"
                            : "text-danger"
                        }">
                            ${status}
                        </span>
                    </td>
                   <td class="text-end">
    <div class="d-flex justify-content-end gap-2">
        <button
            type="button"
            class="secondary-action-btn user-roles-btn"
            data-user-id="${escapeHtml(user.id)}">
            Roles
        </button>
        ${user.enabled
                            ? `
                <button
                    type="button"
                    class="secondary-action-btn user-disable-btn"
                    data-user-id="${escapeHtml(user.id)}">
                    Disable
                </button>
            `
                            : `
                <button
                    type="button"
                    class="secondary-action-btn user-enable-btn"
                    data-user-id="${escapeHtml(user.id)}">
                    Enable
                </button>
            `
                        }
    </div>
</td>
                `;
                    usersTableBody.appendChild(
                        row
                    );
                }
            );
        } catch (error) {
            console.error(
                "Failed to fetch users:",
                error
            );
            usersTableBody.innerHTML = `
            <tr>
                <td colspan="5"
                    class="text-center py-4 text-danger">
                    ${escapeHtml(
                error.message ||
                "Failed to load users"
            )}
                </td>
            </tr>
        `;
        }
    }
    document.addEventListener(
        "click",
        async function (event) {
            const button =
                event.target.closest(
                    ".user-roles-btn"
                );
            if (!button) {
                return;
            }
            const userId =
                button.dataset.userId;
            window.selectedUserId =
                userId;
            const user =
                loadedUsers.find(
                    function (item) {
                        return String(item.id) ===
                            String(userId);
                    }
                );
            if (!user) {
                return;
            }
            if (!userRolesModal) {
                return;
            }
            // Modal title
            const fullName =
                `${user.firstName || ""} ${user.lastName || ""}`
                    .trim() || "User";
            document.getElementById(
                "userRolesModalLabel"
            ).textContent =
                `Roles for ${fullName}`;
            // Open modal
            userRolesModal.show();
            // Loading
            userRolesList.innerHTML =
                `Loading roles...`;
            try {
                const response =
                    await apiRequest(
                        "/api/roles"
                    );
                console.log(
                    "Roles API Response:",
                    response
                );
                const roles =
                    Array.isArray(response.data)
                        ? response.data
                        : [];
                const userRoles =
                    Array.isArray(user.roles)
                        ? user.roles
                        : [];
                if (roles.length === 0) {
                    userRolesList.innerHTML = `
                    <div class="text-muted">
                        No roles found
                    </div>
                `;
                    return;
                }
                userRolesList.innerHTML = "";
                roles.forEach(
                    function (role) {
                        const roleName =
                            role.name || role;
                        const isChecked =
                            userRoles.includes(
                                roleName
                            );
                        const roleItem =
                            document.createElement(
                                "div"
                            );
                        roleItem.className =
                            "form-check mb-3";
                        roleItem.innerHTML = `
                        <input
                            class="form-check-input user-role-checkbox"
                            type="checkbox"
                            value="${escapeHtml(roleName)}"
                            id="userRole_${escapeHtml(roleName)}"
                            ${isChecked ? "checked" : ""}>
                        <label
                            class="form-check-label"
                            for="userRole_${escapeHtml(roleName)}">
                            ${escapeHtml(roleName)}
                        </label>
                    `;
                        userRolesList.appendChild(
                            roleItem
                        );
                    }
                );
            } catch (error) {
                console.error(
                    "Failed to load roles:",
                    error
                );
                userRolesList.innerHTML = `
                <div class="text-danger">
                    Failed to load roles
                </div>
            `;
            }
        }
    );
    // for disabling user function
    document.addEventListener(
        "click",
        async function (event) {
            const disableButton =
                event.target.closest(
                    ".user-disable-btn"
                );
            if (!disableButton) {
                return;
            }
            const userId =
                disableButton.dataset.userId;
            const confirmed =
                confirm(
                    "Are you sure you want to disable this user?"
                );
            if (!confirmed) {
                return;
            }
            try {
                disableButton.disabled = true;
                disableButton.textContent =
                    "Disabling...";
                const response =
                    await apiRequest(
                        `/api/users/${userId}`,
                        {
                            method: "DELETE"
                        }
                    );
                console.log(
                    "Disable User Response:",
                    response
                );
                await loadUsers();
            } catch (error) {
                console.error(
                    "Failed to disable user:",
                    error
                );
                alert(
                    error.message ||
                    "Failed to disable user"
                );
                disableButton.disabled = false;
                disableButton.textContent =
                    "Disable";
            }
        }
    );
    document
        .getElementById(
            "saveUserRolesButton"
        )
        .addEventListener(
            "click",
            async function () {
                const checkedRoles =
                    Array.from(
                        document.querySelectorAll(
                            ".user-role-checkbox:checked"
                        )
                    )
                        .map(
                            function (checkbox) {
                                return checkbox.value;
                            }
                        );
                if (
                    !window.selectedUserId
                ) {
                    console.error(
                        "Selected user not found"
                    );
                    return;
                }
                try {
                    const response =
                        await apiRequest(
                            `/api/users/${window.selectedUserId}/roles`,
                            {
                                method: "POST",
                                body: JSON.stringify({
                                    roleNames: checkedRoles
                                })
                            }
                        );
                    console.log(
                        "Save Roles Response:",
                        response
                    );
                    userRolesModal.hide();
                    await loadUsers();
                } catch (error) {
                    console.error(
                        "Failed to save roles:",
                        error
                    );
                }
            }
        );
    // SESSION MANAGEMENT
    const sessionsButton =
        document.getElementById(
            "sessionsButton"
        );
    const sessionsList =
        document.getElementById(
            "sessionsList"
        );
    const sessionsMessage =
        document.getElementById(
            "sessionsMessage"
        );
    const sessionsModalElement =
        document.getElementById(
            "sessionsModal"
        );
    let sessionsModal = null;
    // INITIALIZE SESSION MODAL
    if (sessionsModalElement) {
        sessionsModal =
            new bootstrap.Modal(
                sessionsModalElement
            );
    }
    // OPEN SESSION MODAL
    if (sessionsButton) {
        sessionsButton.addEventListener(
            "click",
            async function () {
                if (!sessionsModal) {
                    console.error(
                        "sessionsModal not found"
                    );
                    return;
                }
                // Open modal first
                sessionsModal.show();
                // Then load API data
                await loadSessions();
            }
        );
    }
    // ==============================
    // LOAD SESSIONS
    // GET /api/sessions
    // ==============================
    async function loadSessions() {
        if (!sessionsList) {
            console.error(
                "sessionsList not found"
            );
            return;
        }
        // Loading state
        sessionsList.innerHTML = `
        <div class="text-center py-5">
            <div
                class="spinner-border"
                role="status">
            </div>
            <p class="mt-3 mb-0">
                Loading sessions...
            </p>
        </div>
    `;
        if (sessionsMessage) {
            sessionsMessage.innerHTML = "";
        }
        try {
            const response =
                await apiRequest(
                    "/api/sessions"
                );
            console.log(
                "Sessions API Response:",
                response
            );
            const sessions =
                Array.isArray(response.data)
                    ? response.data
                    : [];
            console.log(
                "Total Sessions:",
                sessions.length
            );
            // NO SESSIONS
            if (sessions.length === 0) {
                sessionsList.innerHTML = `
                <div
                    class="text-center py-5 text-muted">
                    No active sessions found.
                </div>
            `;
                return;
            }
            // CLEAR LOADING
            sessionsList.innerHTML = "";
            // DISPLAY SESSIONS
            sessions.forEach(
                function (session) {
                    const sessionCard =
                        document.createElement(
                            "div"
                        );
                    sessionCard.className =
                        "card mb-3 shadow-sm";
                    const isCurrent =
                        session.current === true;
                    const deviceInfo =
                        session.deviceInfo ||
                        "Unknown Device";
                    const ipAddress =
                        session.ipAddress ||
                        "--";
                    sessionCard.innerHTML = `
                    <div class="card-body">
                        <!-- TOP -->
                        <div
                            class="d-flex justify-content-between align-items-start gap-3 flex-wrap">
                            <!-- DEVICE -->
                            <div>
                                <h6
                                    class="mb-2">
                                    💻
                                    ${escapeHtml(
                        deviceInfo
                    )}
                                </h6>
                                <p
                                    class="mb-1 text-muted">
                                    <strong>
                                        IP Address:
                                    </strong>
                                    ${escapeHtml(
                        ipAddress
                    )}
                                </p>
                            </div>
                            <!-- STATUS / REVOKE -->
                            <div>
                                ${isCurrent
                            ? `
                                        <span
                                            class="badge text-bg-success">
                                            Current Device
                                        </span>
                                    `
                            : `
                                        <button
                                            type="button"
                                            class="btn btn-outline-danger btn-sm revoke-session-btn"
                                            data-session-id="${escapeHtml(
                                session.id
                            )}">
                                            Revoke
                                        </button>
                                    `
                        }
                            </div>
                        </div>
                        <hr>
                        <!-- DATES -->
                        <div
                            class="row g-3">
                            <div
                                class="col-md-4">
                                <small
                                    class="text-muted d-block">
                                    Logged In
                                </small>
                                <strong>
                                    ${formatSessionDate(
                            session.createdAt
                        )}
                                </strong>
                            </div>
                            <div
                                class="col-md-4">
                                <small
                                    class="text-muted d-block">
                                    Last Used
                                </small>
                                <strong>
                                    ${formatSessionDate(
                            session.lastUsedAt
                        )}
                                </strong>
                            </div>
                            <div
                                class="col-md-4">
                                <small
                                    class="text-muted d-block">
                                    Expires
                                </small>
                                <strong>
                                    ${formatSessionDate(
                            session.expiryDate
                        )}
                                </strong>
                            </div>
                        </div>
                    </div>
                `;
                    sessionsList.appendChild(
                        sessionCard
                    );
                }
            );
            // REVOKE BUTTON EVENTS
            sessionsList
                .querySelectorAll(
                    ".revoke-session-btn"
                )
                .forEach(
                    function (button) {
                        button.addEventListener(
                            "click",
                            async function () {
                                const sessionId =
                                    this.dataset.sessionId;
                                await revokeSession(
                                    sessionId
                                );
                            }
                        );
                    }
                );
        } catch (error) {
            console.error(
                "Failed to load sessions:",
                error
            );
            sessionsList.innerHTML = `
            <div
                class="alert alert-danger">
                ${escapeHtml(
                error.message ||
                "Failed to load sessions"
            )}
            </div>
        `;
        }
    }
    // ==============================
    // REVOKE SESSION
    // DELETE /api/sessions/{sessionId}
    // ==============================
    async function revokeSession(sessionId) {
        if (
            sessionId === null ||
            sessionId === undefined ||
            sessionId === ""
        ) {
            return;
        }
        const confirmed =
            confirm(
                "Are you sure you want to revoke this session?"
            );
        if (!confirmed) {
            return;
        }
        try {
            const response =
                await apiRequest(
                    `/api/sessions/${sessionId}`,
                    {
                        method: "DELETE"
                    }
                );
            console.log(
                "Revoke Session Response:",
                response
            );
            if (sessionsMessage) {
                sessionsMessage.innerHTML = `
                <div
                    class="alert alert-success">
                    Session revoked successfully.
                </div>
            `;
            }
            // Reload updated session list
            await loadSessions();
        } catch (error) {
            console.error(
                "Failed to revoke session:",
                error
            );
            if (sessionsMessage) {
                sessionsMessage.innerHTML = `
                <div
                    class="alert alert-danger">
                    ${escapeHtml(
                    error.message ||
                    "Failed to revoke session"
                )}
                </div>
            `;
            }
        }
    }
    // LOGOUT
    const logoutButton =
        document.getElementById(
            "logoutButton"
        );
    if (logoutButton) {
        logoutButton.addEventListener(
            "click",
            function () {
                localStorage.removeItem(
                    "authData"
                );
                localStorage.removeItem(
                    "token"
                );
                localStorage.removeItem(
                    "user"
                );
                localStorage.removeItem(
                    "role"
                );
                localStorage.removeItem(
                    "email"
                );
                window.location.href =
                    "../auth/login.html";
            }
        );
    }
    // DROPDOWN LOGOUT
    const dropdownLogoutButton =
        document.getElementById("dropdownLogoutButton");
    if (dropdownLogoutButton) {
        dropdownLogoutButton.addEventListener("click", function () {
            if (typeof logout === "function") {
                logout();
                return;
            }
            localStorage.clear();
            sessionStorage.clear();
            window.location.href =
                "../auth/login.html";
        });
    }
    // =========================================
    // ADMIN DASHBOARD - RESET PASSWORD
    // Uses ACTUAL API
    // POST /api/auth/change-password
    // =========================================
    // =========================================
    // CLICK HANDLER
    // Handles:
    // 1. Reset Password button
    // 2. Reset Password form submit
    // =========================================
    document.addEventListener("click", function (event) {
        // OPEN / CLOSE RESET PASSWORD FORM
        const resetButton =
            event.target.closest("#resetPasswordToggleButton");
        if (!resetButton) {
            return;
        }
        event.preventDefault();
        console.log("Reset Password button clicked");
        const resetPasswordFormWrapper =
            document.getElementById(
                "resetPasswordFormWrapper"
            );
        const resetPasswordMessage =
            document.getElementById(
                "resetPasswordMessage"
            );
        if (!resetPasswordFormWrapper) {
            console.error(
                "ERROR: resetPasswordFormWrapper not found"
            );
            return;
        }
        resetPasswordFormWrapper.classList.toggle(
            "d-none"
        );
        console.log(
            "Reset password form toggled"
        );
        if (resetPasswordMessage) {
            resetPasswordMessage.innerHTML = "";
        }
    });
    // =========================================
    // FORM SUBMIT
    // Event delegation
    // =========================================
    document.addEventListener(
        "submit",
        async function (event) {
            const form =
                event.target.closest(
                    "#resetPasswordForm"
                );
            // Not our reset password form
            if (!form) {
                return;
            }
            event.preventDefault();
            console.log(
                "Reset Password form submitted"
            );
            // GET ELEMENTS
            const resetPasswordMessage =
                document.getElementById(
                    "resetPasswordMessage"
                );
            const currentPasswordField =
                document.getElementById(
                    "currentPasswordField"
                );
            const newPasswordField =
                document.getElementById(
                    "newPasswordField"
                );
            const confirmPasswordField =
                document.getElementById(
                    "confirmPasswordField"
                );
            // CHECK ELEMENTS
            if (
                !resetPasswordMessage ||
                !currentPasswordField ||
                !newPasswordField ||
                !confirmPasswordField
            ) {
                console.error(
                    "ERROR: Reset password elements not found"
                );
                return;
            }
            // =====================================
            // GET VALUES
            // Don't trim passwords
            // =====================================
            const oldPassword =
                currentPasswordField.value;
            const newPassword =
                newPasswordField.value;
            const confirmPassword =
                confirmPasswordField.value;
            console.log(
                "Password fields received"
            );
            // VALIDATION
            resetPasswordMessage.innerHTML = "";
            if (
                !oldPassword ||
                !newPassword ||
                !confirmPassword
            ) {
                resetPasswordMessage.innerHTML =
                    `<div class="custom-alert error">
                    Please fill in all password fields.
                </div>`;
                return;
            }
            if (
                newPassword !== confirmPassword
            ) {
                resetPasswordMessage.innerHTML =
                    `<div class="custom-alert error">
                    New password and confirm password do not match.
                </div>`;
                return;
            }
            if (newPassword.length < 6) {
                resetPasswordMessage.innerHTML =
                    `<div class="custom-alert error">
                    Password must be at least 6 characters.
                </div>`;
                return;
            }
            // SUBMIT BUTTON
            const submitButton =
                form.querySelector(
                    'button[type="submit"]'
                );
            const originalButtonText =
                submitButton
                    ? submitButton.textContent
                    : "Update Password";
            if (submitButton) {
                submitButton.disabled = true;
                submitButton.textContent =
                    "Updating...";
            }
            // ACTUAL API CALL
            try {
                const payload = {
                    oldPassword: oldPassword,
                    newPassword: newPassword
                };
                console.log(
                    "Change Password Request:",
                    payload
                );
                const response =
                    await apiRequest(
                        "/api/auth/change-password",
                        {
                            method: "POST",
                            body: JSON.stringify(
                                payload
                            )
                        }
                    );
                console.log(
                    "Change Password Response:",
                    response
                );
                // BACKEND RETURNED FAILURE
                if (
                    response &&
                    response.success === false
                ) {
                    resetPasswordMessage.innerHTML =
                        `<div class="custom-alert error">
                        ${escapeHtml(
                            response.message ||
                            "Password update failed."
                        )}
                    </div>`;
                    return;
                }
                // SUCCESS
                resetPasswordMessage.innerHTML =
                    `<div class="custom-alert success">
                    ${escapeHtml(
                        response.message ||
                        "Password updated successfully."
                    )}
                </div>`;
                form.reset();
                setTimeout(function () {
                    const wrapper =
                        document.getElementById(
                            "resetPasswordFormWrapper"
                        );
                    if (wrapper) {
                        wrapper.classList.add(
                            "d-none"
                        );
                    }
                    resetPasswordMessage.innerHTML = "";
                }, 1500);
            } catch (error) {
                console.error(
                    "Change Password API Error:",
                    error
                );
                resetPasswordMessage.innerHTML =
                    `<div class="custom-alert error">
                    ${escapeHtml(
                        error.message ||
                        "Something went wrong. Please try again."
                    )}
                </div>`;
            } finally {
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.textContent =
                        originalButtonText;
                }
            }
        }
    );
    // ==============================
    // GET DISPLAY NAME
    // Handles strings and API objects
    // ==============================
    function getDisplayName(value) {
        if (
            value === null ||
            value === undefined
        ) {
            return "";
        }
        if (typeof value === "string") {
            return value;
        }
        if (typeof value === "object") {
            return (
                value.name ||
                value.roleName ||
                value.permissionName ||
                value.code ||
                value.authority ||
                String(value.id || "")
            );
        }
        return String(value);
    }
    // ESCAPE HTML
    function escapeHtml(value) {
        if (
            value === null ||
            value === undefined
        ) {
            return "";
        }
        const div =
            document.createElement("div");
        div.textContent =
            String(value);
        return div.innerHTML;
    }
    // FORMAT SESSION DATE
    function formatSessionDate(dateValue) {
        if (!dateValue) {
            return "--";
        }
        const date =
            new Date(dateValue);
        if (Number.isNaN(date.getTime())) {
            return "--";
        }
        return date.toLocaleString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            }
        );
    }
});
// ==============================
const addEmployeeForm = document.getElementById("addEmployeeForm");
if (addEmployeeForm) {
    addEmployeeForm.addEventListener("submit", async function (event) {
    event.preventDefault();
    const selectedRms = Array.from(
        document.getElementById("rms").selectedOptions
    ).map(option => option.value);
    const request = {
        empName: document.getElementById("empName").value.trim(),
        empEmail: document.getElementById("empEmail").value.trim(),
        dateOfBirth: document.getElementById("dateOfBirth").value,
        phone: document.getElementById("phone").value.trim(),
        gender: document.getElementById("gender").value,
        shift: document.getElementById("shift").value,
        rms: selectedRms,
        address: document.getElementById("address").value.trim(),
        salary: Number(document.getElementById("salary").value)
    };
    try {
        const response = await fetch("/api/employees", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(request)
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Failed to create employee");
        }
        const employee = await response.json();
        console.log("Employee created:", employee);
        alert(
            "Employee created successfully!\nEmployee Code: "
            + employee.empCode
        );
        // Close modal
        const modalElement =
            document.getElementById("addEmployeeModal");
        const modal =
            bootstrap.Modal.getInstance(modalElement);
        modal.hide();
        // Reset form
        document.getElementById("addEmployeeForm").reset();
        // Optional: reload employee table
        // loadEmployees();
    } catch (error) {
        console.error(error);
        alert(error.message);
    }
    });
}
