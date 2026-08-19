document.addEventListener("DOMContentLoaded", function () {

    // ==============================
    // AUTHENTICATION CHECK
    // ==============================

    const authData = getAuthData();

    if (!authData || !authData.token) {

        window.location.href = "../auth/login.html";
        return;

    }


    // ==============================
    // USER DATA
    // ==============================

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


    const fullName =
        user.name ||
        user.fullName ||
        authData.name ||
        authData.fullName ||
        `${firstName} ${lastName}`.trim() ||
        email ||
        "System Admin";


    // ==============================
    // GET ROLES
    // ==============================

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


    // ==============================
    // GET PERMISSIONS
    // ==============================

    let userPermissions = [];


    if (Array.isArray(user.permissions)) {

        userPermissions = user.permissions;

    } else if (Array.isArray(authData.permissions)) {

        userPermissions = authData.permissions;

    }


    // ==============================
    // DEBUG
    // ==============================

    console.log("Auth Data:", authData);
    console.log("User:", user);
    console.log("Full Name:", fullName);
    console.log("Email:", email);
    console.log("Roles:", userRoles);
    console.log("Permissions:", userPermissions);


    // ==============================
    // USER INFORMATION ELEMENTS
    // ==============================

    const userName =
        document.getElementById("userName");

    const userRole =
        document.getElementById("userRole");

    const dashboardWelcome =
        document.getElementById("dashboardWelcome");

    const currentRole =
        document.getElementById("currentRole");


    // ==============================
    // NAVBAR USER INFORMATION
    // ==============================

    if (userName) {

        userName.textContent = fullName;

    }


    if (userRole) {

        userRole.textContent =
            userRoles.length > 0
                ? userRoles.join(", ")
                : "ADMIN";

    }


    // ==============================
    // DASHBOARD WELCOME
    // ==============================

    if (dashboardWelcome) {

        const welcomeName =
            firstName ||
            fullName ||
            "User";

        dashboardWelcome.textContent =
            `Welcome back, ${welcomeName}`;

    }


    // ==============================
    // CURRENT ROLE
    // ==============================

    if (currentRole) {

        currentRole.textContent =
            userRoles.length > 0
                ? userRoles.join(", ")
                : "ADMIN";

    }


    // ==============================
    // USER INITIALS
    // ==============================

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


    // ==============================
    // DASHBOARD ROLES
    // ==============================

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

            dashboardRoles.appendChild(
                roleBadge
            );

        });

    }


    // ==============================
    // DASHBOARD PERMISSIONS
    // ==============================

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


    // ==============================
    // PROFILE INFORMATION
    // ==============================

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


    if (profileInitials) {

        profileInitials.textContent =
            initials;

    }


    // ==============================
    // PROFILE ROLES
    // ==============================

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

            profileRoles.appendChild(
                roleBadge
            );

        });

    }


    // ==============================
    // PROFILE PERMISSIONS
    // ==============================

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


        userPermissions.forEach(
            function (permission) {

                const permissionTag =
                    document.createElement("span");

                permissionTag.className =
                    "permission-tag";

                permissionTag.textContent =
                    getDisplayName(permission);

                profilePermissions.appendChild(
                    permissionTag
                );

            }
        );

    }


    renderProfileRoles();
    renderProfilePermissions();


    // ==============================
    // ALL VIEWS
    // ==============================

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


    // ==============================
    // SHOW SELECTED VIEW
    // ==============================

    function showView(viewName) {

        if (!views[viewName]) {

            console.error(
                "View not found:",
                viewName
            );

            return;

        }


        // Hide all views
        Object.values(views).forEach(
            function (view) {

                if (view) {

                    view.classList.add(
                        "d-none"
                    );

                }

            }
        );


        // Show selected view
        views[viewName].classList.remove(
            "d-none"
        );


        // ==========================
        // UPDATE ACTIVE SIDEBAR
        // ==========================

        document
            .querySelectorAll(
                ".sidebar-item[data-view]"
            )
            .forEach(function (item) {

                item.classList.remove(
                    "active"
                );


                if (
                    item.dataset.view ===
                    viewName
                ) {

                    item.classList.add(
                        "active"
                    );

                }

            });


        // ==========================
        // CLOSE MOBILE SIDEBAR
        // ==========================

        if (window.innerWidth < 768) {

            const sidebar =
                document.getElementById(
                    "dashboardSidebar"
                );


            if (
                sidebar &&
                sidebar.classList.contains(
                    "show"
                )
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


        // ==========================
        // SCROLL TO TOP
        // ==========================

        window.scrollTo({

            top: 0,
            behavior: "smooth"

        });


        // ==========================
        // LOAD API DATA
        // ==========================

        if (viewName === "roles") {

            loadRoles();

        }


        if (viewName === "permissions") {

            loadPermissions();

        }

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

    async function loadRoles() {

        const rolesTableBody =
            document.getElementById(
                "rolesTableBody"
            );


        if (!rolesTableBody) {

            console.error(
                "rolesTableBody not found"
            );

            return;

        }


        rolesTableBody.innerHTML = `
            <tr>
                <td colspan="5"
                    class="text-center py-4">

                    Loading roles...

                </td>
            </tr>
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

                rolesTableBody.innerHTML = `
                    <tr>
                        <td colspan="5"
                            class="text-center py-4 text-muted">

                            No roles found

                        </td>
                    </tr>
                `;

                return;

            }


            rolesTableBody.innerHTML = "";


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


                const row =
                    document.createElement("tr");


                row.innerHTML = `

                    <td>
                        ${escapeHtml(role.id)}
                    </td>

                    <td class="table-role-name">
                        ${escapeHtml(
                            getDisplayName(role)
                        )}
                    </td>

                    <td class="table-description">
                        ${escapeHtml(
                            role.description || "--"
                        )}
                    </td>

                    <td class="table-permissions">
                        ${permissionsHtml}
                    </td>

                    <td class="text-end">
                        <span class="text-muted">
                            --
                        </span>
                    </td>

                `;


                rolesTableBody.appendChild(
                    row
                );

            });


        } catch (error) {

            console.error(
                "Failed to fetch roles:",
                error
            );


            rolesTableBody.innerHTML = `
                <tr>
                    <td colspan="5"
                        class="text-center py-4 text-danger">

                        ${escapeHtml(
                            error.message ||
                            "Failed to load roles"
                        )}

                    </td>
                </tr>
            `;

        }

    }


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
                <td colspan="3"
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
                        <td colspan="3"
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
                        document.createElement(
                            "tr"
                        );


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

                    `;


                    permissionsTableBody.appendChild(
                        row
                    );

                }
            );


        } catch (error) {

            console.error(
                "Failed to fetch permissions:",
                error
            );


            permissionsTableBody.innerHTML = `
                <tr>
                    <td colspan="3"
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


    // ==============================
    // LOGOUT
    // ==============================

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


    // ==============================
    // ESCAPE HTML
    // ==============================

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

});