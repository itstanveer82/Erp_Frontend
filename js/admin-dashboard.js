document.addEventListener("DOMContentLoaded", function () {

   
    // AUTHENTICATION
  
    const authData = getAuthData();

    if (!authData || !authData.token) {

        window.location.href = "../auth/login.html";
        return;

    }


    // Support new login structure
    const user = authData.user || {};

    const firstName = user.firstName || "";
    const lastName = user.lastName || "";

    const fullName =
        `${firstName} ${lastName}`.trim() ||
        authData.email ||
        "User";

    const email =
        user.email ||
        authData.email ||
        "";

    const roles =
        user.roles ||
        (authData.role ? [authData.role] : []);

    const permissions =
        user.permissions ||
        authData.permissions ||
        [];


    // =========================
    // DOM ELEMENTS
    // =========================

    const userName =
        document.getElementById("userName");

    const userRole =
        document.getElementById("userRole");

    const sidebarUserName =
        document.getElementById("sidebarUserName");

    const sidebarUserEmail =
        document.getElementById("sidebarUserEmail");

    const userInitials =
        document.getElementById("userInitials");

    const dashboardWelcome =
        document.getElementById("dashboardWelcome");

    const currentRole =
        document.getElementById("currentRole");

    const dashboardRoles =
        document.getElementById("dashboardRoles");

    const dashboardPermissions =
        document.getElementById("dashboardPermissions");

    const permissionCount =
        document.getElementById("permissionCount");


    // =========================
    // USER INFORMATION
    // =========================

    userName.textContent = fullName;

    userRole.textContent =
        roles.length > 0
            ? roles.join(", ")
            : "No Role";

    sidebarUserName.textContent = fullName;
    sidebarUserEmail.textContent = email;

    dashboardWelcome.textContent =
        `Welcome back, ${firstName || fullName}!`;

    currentRole.textContent =
        roles.length > 0
            ? roles[0]
            : "No Role";


    // User initials
    const initials =
        `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
        || fullName.substring(0, 2).toUpperCase();

    userInitials.textContent = initials;


    // =========================
    // PERMISSION HELPER
    // =========================

    function hasPermission(permissionName) {

        return permissions.includes(permissionName);

    }


    // =========================
    // RENDER DASHBOARD ACCESS
    // =========================

    if (roles.length === 0) {

        dashboardRoles.innerHTML =
            `<span class="permission-tag">No role assigned</span>`;

    } else {

        dashboardRoles.innerHTML = "";

        roles.forEach(function (role) {

            const badge = document.createElement("span");

            badge.className = "role-badge";
            badge.textContent = role;

            dashboardRoles.appendChild(badge);

        });

    }


    permissionCount.textContent = permissions.length;

    if (permissions.length === 0) {

        dashboardPermissions.innerHTML =
            `<span class="permission-tag">No permissions assigned</span>`;

    } else {

        dashboardPermissions.innerHTML = "";

        permissions.forEach(function (permission) {

            const tag = document.createElement("span");

            tag.className = "permission-tag";
            tag.textContent = permission;

            dashboardPermissions.appendChild(tag);

        });

    }


    // =========================
    // PERMISSION BASED UI
    // =========================

    const rolesMenuButton =
        document.getElementById("rolesMenuButton");

    const permissionsMenuButton =
        document.getElementById("permissionsMenuButton");

    const addRoleButton =
        document.getElementById("addRoleButton");


    // Roles require ROLE_READ
    if (!hasPermission("ROLE_READ")) {

        rolesMenuButton.classList.add("d-none");

    }


    // Add Role requires ROLE_CREATE
    if (hasPermission("ROLE_CREATE")) {

        addRoleButton.classList.remove("d-none");

    }


    // Permissions require PERMISSION_READ
    if (!hasPermission("PERMISSION_READ")) {

        permissionsMenuButton.classList.add("d-none");

    }


    // =========================
    // VIEW SWITCHING
    // =========================
function showView(viewName) {

    // Check view exists
    if (!views[viewName]) {
        return;
    }

    // Hide all views
    Object.keys(views).forEach(function (key) {

        if (views[key]) {
            views[key].classList.add("d-none");
        }

    });


    // Show selected view
    views[viewName].classList.remove("d-none");


    // Update active sidebar item
    document
        .querySelectorAll(".sidebar-item[data-view]")
        .forEach(function (button) {

            button.classList.remove("active");

            if (button.dataset.view === viewName) {
                button.classList.add("active");
            }

        });


    // Fetch roles only when Roles page is opened
    if (viewName === "roles") {
        loadRoles();
    }


    // Fetch permissions only when Permissions page is opened
    if (viewName === "permissions") {
        loadPermissions();
    }

}

    function showView(viewName) {

        Object.keys(views).forEach(function (key) {

            views[key].classList.add("d-none");

        });


        views[viewName].classList.remove("d-none");


        document
            .querySelectorAll(".sidebar-item[data-view]")
            .forEach(function (button) {

                button.classList.remove("active");

                if (button.dataset.view === viewName) {
                    button.classList.add("active");
                }

            });


        if (viewName === "roles") {
            loadRoles();
        }


        if (viewName === "permissions") {
            loadPermissions();
        }

    }


    document
        .querySelectorAll("[data-view]")
        .forEach(function (element) {

            element.addEventListener("click", function () {

                const viewName = this.dataset.view;

                if (views[viewName]) {
                    showView(viewName);
                }

            });

        });


    // =========================
    // ALERT HELPER
    // =========================

    function showMessage(elementId, message, type) {

        const element =
            document.getElementById(elementId);

        element.innerHTML = `
            <div class="custom-alert ${type}">
                ${message}
            </div>
        `;

    }


    function clearMessage(elementId) {

        document.getElementById(elementId).innerHTML = "";

    }


    // =========================
    // LOAD ROLES
    // =========================

    async function loadRoles() {

        const tableBody =
            document.getElementById("rolesTableBody");


        clearMessage("rolesMessage");


        tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center py-5">
                    Loading roles...
                </td>
            </tr>
        `;


        try {

            const response =
                await apiRequest("/api/roles");


            const rolesData =
                response.data || [];


            if (rolesData.length === 0) {

                tableBody.innerHTML = `
                    <tr>
                        <td colspan="5"
                            class="text-center py-5 text-muted">

                            No roles found.

                        </td>
                    </tr>
                `;

                return;

            }


            tableBody.innerHTML = "";


            rolesData.forEach(function (role) {

                const permissionsHtml =
                    renderRolePermissions(role.permissions);


                const actionsHtml =
                    renderRoleActions(role);


                const row =
                    document.createElement("tr");


                row.innerHTML = `

                    <td>${role.id ?? "--"}</td>

                    <td>
                        <span class="table-role-name">
                            ${escapeHtml(role.name)}
                        </span>
                    </td>

                    <td>
                        <span class="table-description">
                            ${escapeHtml(role.description || "--")}
                        </span>
                    </td>

                    <td class="table-permissions">
                        ${permissionsHtml}
                    </td>

                    <td>
                        ${actionsHtml}
                    </td>

                `;


                tableBody.appendChild(row);

            });


        } catch (error) {

            console.error("Roles Error:", error);


            tableBody.innerHTML = `
                <tr>
                    <td colspan="5"
                        class="text-center py-5 text-danger">

                        Failed to load roles.

                    </td>
                </tr>
            `;


            showMessage(
                "rolesMessage",
                error.message || "Unable to fetch roles.",
                "error"
            );

        }

    }


    // =========================
    // ROLE PERMISSIONS
    // =========================

    function renderRolePermissions(rolePermissions) {

        if (
            !Array.isArray(rolePermissions) ||
            rolePermissions.length === 0
        ) {

            return `<span class="text-muted">No permissions</span>`;

        }


        return rolePermissions.map(function (permission) {

            const permissionName =
                typeof permission === "string"
                    ? permission
                    : permission.name;

            return `
                <span class="small-permission-tag">
                    ${escapeHtml(permissionName)}
                </span>
            `;

        }).join("");

    }


    // =========================
    // ROLE ACTION BUTTONS
    // =========================

    function renderRoleActions(role) {

        const buttons = [];


        if (hasPermission("ROLE_UPDATE")) {

            buttons.push(`
                <button
                    type="button"
                    class="edit-role-btn"
                    data-role-id="${role.id}"
                    data-role-name="${escapeAttribute(role.name)}"
                    data-role-description="${escapeAttribute(role.description || "")}">

                    Edit

                </button>
            `);

        }


        if (hasPermission("ROLE_DELETE")) {

            buttons.push(`
                <button
                    type="button"
                    class="delete-role-btn"
                    data-role-id="${role.id}"
                    data-role-name="${escapeAttribute(role.name)}">

                    Delete

                </button>
            `);

        }


        if (buttons.length === 0) {
            return `<span class="text-muted">No actions</span>`;
        }


        return `
            <div class="action-buttons">
                ${buttons.join("")}
            </div>
        `;

    }


    // =========================
    // ROLE MODAL
    // =========================

    const roleModalElement =
        document.getElementById("roleModal");

    const roleModal =
        new bootstrap.Modal(roleModalElement);


    const roleForm =
        document.getElementById("roleForm");

    const roleId =
        document.getElementById("roleId");

    const roleName =
        document.getElementById("roleName");

    const roleDescription =
        document.getElementById("roleDescription");

    const roleModalTitle =
        document.getElementById("roleModalTitle");

    const saveRoleButton =
        document.getElementById("saveRoleButton");


    // Add Role
    addRoleButton.addEventListener("click", function () {

        roleForm.reset();

        roleId.value = "";

        clearMessage("roleFormMessage");

        roleModalTitle.textContent =
            "Add New Role";

        saveRoleButton.textContent =
            "Create Role";

        roleModal.show();

    });


    // Edit/Delete event delegation
    document
        .getElementById("rolesTableBody")
        .addEventListener("click", function (event) {

            const editButton =
                event.target.closest(".edit-role-btn");

            const deleteButton =
                event.target.closest(".delete-role-btn");


            if (editButton) {

                openEditRoleModal(editButton);

            }


            if (deleteButton) {

                deleteRole(
                    deleteButton.dataset.roleId,
                    deleteButton.dataset.roleName
                );

            }

        });


    // Open Edit Modal
    function openEditRoleModal(button) {

        roleId.value =
            button.dataset.roleId;

        roleName.value =
            button.dataset.roleName;

        roleDescription.value =
            button.dataset.roleDescription;


        clearMessage("roleFormMessage");


        roleModalTitle.textContent =
            "Edit Role";

        saveRoleButton.textContent =
            "Update Role";


        roleModal.show();

    }


    // =========================
    // CREATE / UPDATE ROLE
    // =========================

    roleForm.addEventListener("submit", async function (event) {

        event.preventDefault();


        clearMessage("roleFormMessage");


        const name =
            roleName.value.trim();

        const description =
            roleDescription.value.trim();


        if (name === "" || description === "") {

            showMessage(
                "roleFormMessage",
                "Role name and description are required.",
                "error"
            );

            return;

        }


        const isEdit =
            roleId.value !== "";


        const originalButtonText =
            saveRoleButton.textContent;


        saveRoleButton.disabled = true;

        saveRoleButton.textContent =
            isEdit
                ? "Updating..."
                : "Creating...";


        try {

            const endpoint =
                isEdit
                    ? `/api/roles/${roleId.value}`
                    : "/api/roles";


            const method =
                isEdit
                    ? "PUT"
                    : "POST";


            const response =
                await apiRequest(endpoint, {

                    method: method,

                    body: JSON.stringify({
                        name: name,
                        description: description
                    })

                });


            showMessage(
                "rolesMessage",
                response.message ||
                (isEdit
                    ? "Role updated successfully."
                    : "Role created successfully."),
                "success"
            );


            roleModal.hide();


            await loadRoles();


        } catch (error) {

            console.error("Save Role Error:", error);


            showMessage(
                "roleFormMessage",
                error.message ||
                "Unable to save role.",
                "error"
            );

        } finally {

            saveRoleButton.disabled = false;

            saveRoleButton.textContent =
                originalButtonText;

        }

    });


    // =========================
    // DELETE ROLE
    // =========================

    async function deleteRole(id, name) {

        const confirmed =
            confirm(
                `Are you sure you want to delete ${name}?`
            );


        if (!confirmed) {
            return;
        }


        clearMessage("rolesMessage");


        try {

            const response =
                await apiRequest(`/api/roles/${id}`, {

                    method: "DELETE"

                });


            showMessage(
                "rolesMessage",
                response.message ||
                "Role deleted successfully.",
                "success"
            );


            await loadRoles();


        } catch (error) {

            console.error("Delete Role Error:", error);


            showMessage(
                "rolesMessage",
                error.message ||
                "Unable to delete role.",
                "error"
            );

        }

    }


    // =========================
    // LOAD PERMISSIONS
    // =========================

    async function loadPermissions() {

        const tableBody =
            document.getElementById("permissionsTableBody");


        clearMessage("permissionsMessage");


        tableBody.innerHTML = `
            <tr>
                <td colspan="3"
                    class="text-center py-5">

                    Loading permissions...

                </td>
            </tr>
        `;


        try {

            const response =
                await apiRequest("/api/permissions");


            const permissionsData =
                response.data || [];


            if (permissionsData.length === 0) {

                tableBody.innerHTML = `
                    <tr>
                        <td colspan="3"
                            class="text-center py-5 text-muted">

                            No permissions found.

                        </td>
                    </tr>
                `;

                return;

            }


            tableBody.innerHTML = "";


            permissionsData.forEach(function (permission) {

                const row =
                    document.createElement("tr");


                row.innerHTML = `

                    <td>
                        ${permission.id ?? "--"}
                    </td>

                    <td>
                        <span class="table-permission-name">
                            ${escapeHtml(permission.name)}
                        </span>
                    </td>

                    <td>
                        <span class="table-description">
                            ${escapeHtml(permission.description || "--")}
                        </span>
                    </td>

                `;


                tableBody.appendChild(row);

            });


        } catch (error) {

            console.error("Permissions Error:", error);


            tableBody.innerHTML = `
                <tr>
                    <td colspan="3"
                        class="text-center py-5 text-danger">

                        Failed to load permissions.

                    </td>
                </tr>
            `;


            showMessage(
                "permissionsMessage",
                error.message ||
                "Unable to fetch permissions.",
                "error"
            );

        }

    }


    // =========================
    // HTML SECURITY HELPERS
    // =========================

    function escapeHtml(value) {

        const div =
            document.createElement("div");

        div.textContent =
            value === null || value === undefined
                ? ""
                : String(value);

        return div.innerHTML;

    }


    function escapeAttribute(value) {

        return escapeHtml(value)
            .replace(/"/g, "&quot;");

    }

});