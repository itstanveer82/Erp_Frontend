/**
 * ADMIN DASHBOARD CONTROLLER
 * ---------------------------------------------------------------
 * Runs once the DOM is ready. This single handler owns the ENTIRE
 * admin dashboard: auth guard, header/profile rendering, the view
 * router (dashboard/profile/employees/users/roles/permissions/...),
 * and every API call (roles, permissions, users, sessions,
 * change-password). There is no module system — everything below
 * is a nested function or event listener inside this one closure.
 * ---------------------------------------------------------------
 */
document.addEventListener("DOMContentLoaded", function () {

    // =========================================================
    // AUTHENTICATION CHECK
    // If there's no saved auth token, kick the user back to the
    // login page immediately.
    // =========================================================
    const authData = getAuthData();
    if (!authData || !authData.token) {
        window.location.href = "../auth/login.html";
        return;
    }

    // =========================================================
    // USER DATA
    // Pulls the logged-in admin's name/email out of whichever
    // source actually has it — the `user` sub-object, the
    // top-level authData, or (as a last resort) localStorage —
    // since different login flows may have populated different
    // fields.
    // =========================================================
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

    // for testing purposes, log the authData and email to the console
    console.log("email:", email);
    console.log("authdataaaaaaa:", authData);

    // Builds the display name, trying every possible source in
    // order, and finally falling back to the email or a generic
    // "System Admin" label if nothing else is available.
    const fullName =
        user.name ||
        user.fullName ||
        authData.name ||
        authData.fullName ||
        `${firstName} ${lastName}`.trim() ||
        email ||
        "System Admin";


    // Get roles from user object, authData object, or localStorage
    // Same "try every possible source" pattern as above, applied
    // to the admin's assigned roles.
    let userRoles = [];
    if (Array.isArray(user.roles) && user.roles.length > 0) {
        userRoles = user.roles;
    } else if (Array.isArray(authData.roles) && authData.roles.length > 0) {
        userRoles = authData.roles;
    } else if (authData.role) {
        userRoles = [authData.role];
    } else {
        const storedRole = localStorage.getItem("role");

        if (storedRole) {
            userRoles = [storedRole];
        }
    }

    // Get permissions from user object, authData object, or localStorage
    // Simpler than the roles lookup above — only checks the two
    // object sources, no localStorage fallback for permissions.
    let userPermissions = [];
    if (Array.isArray(user.permissions)) {
        userPermissions = user.permissions;
    } else if (Array.isArray(authData.permissions)) {
        userPermissions = authData.permissions;
    }

    // FOR DEBUGGING PURPOSES, LOG USER DATA TO CONSOLE
    // Dumps the whole resolved identity to the console — useful
    // during development, but should be stripped (or gated behind
    // a debug flag) before shipping to production.
    console.log("Auth Data:", authData);
    console.log("User:", user);
    console.log("Full Name:", fullName);
    console.log("Email:", email);
    console.log("Roles:", userRoles);
    console.log("Permissions:", userPermissions);

    // =========================================================
    // USER INFORMATION ELEMENTS
    // Grabs the DOM nodes that show the admin's name/role in the
    // navbar and on the dashboard welcome banner.
    // =========================================================
    const userName =
        document.getElementById("userName");
    const userRole =
        document.getElementById("userRole");
    const dashboardWelcome =
        document.getElementById("dashboardWelcome");
    const currentRole =
        document.getElementById("currentRole");

    // NAVBAR USER INFORMATION
    // Fills the navbar name/role text, if those elements exist
    // on the page (they may not, depending on markup version).
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
    // Sets the "Welcome back, <first name>" heading on the
    // dashboard view.
    if (dashboardWelcome) {
        const welcomeName =
            firstName ||
            fullName ||
            "User";
        dashboardWelcome.textContent =
            `Welcome back, ${welcomeName}`;
    }

    // CURRENT ROLE
    // Fills the small "Current Role" badge on the dashboard view.
    if (currentRole) {
        currentRole.textContent =
            userRoles.length > 0
                ? userRoles
                    .map(getDisplayName)
                    .join(", ")
                : "ADMIN";
    }

    // =========================================================
    // USER INITIALS
    // Builds a 2-letter initials string for the avatar circle:
    // prefer first+last name initials, fall back to splitting
    // the full name on spaces, and finally default to "AD".
    // =========================================================
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

    // =========================================================
    // ADMIN PROFILE DROPDOWN
    // Grabs both the header (top navbar) and dropdown-panel
    // versions of the avatar/name/role display, since the same
    // info is duplicated in two places in the markup.
    // =========================================================
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
    // Fills the always-visible header avatar/name/role.
    if (headerAdminInitials) {
        headerAdminInitials.textContent = initials;
    }
    if (headerAdminName) {
        headerAdminName.textContent = fullName;
    }
    if (headerAdminRole) {
        headerAdminRole.textContent = displayRole;
    }

    // =========================================================
    // REAL PROFILE FROM API (overwrites the email-fallback above
    // with the actual name + role once /api/employees/me responds)
    // =========================================================
    async function loadMyProfile() {
        try {
            const result = await apiRequest("/api/employees/me", { method: "GET" });
            const emp = result.data || {};

            const apiFullName =
                `${emp.firstName || ""} ${emp.lastName || ""}`.trim() || fullName;

            const apiRole = emp.roleName || displayRole;

            if (headerAdminName) headerAdminName.textContent = apiFullName;
            if (headerAdminRole) headerAdminRole.textContent = apiRole;
            if (dropdownAdminName) dropdownAdminName.textContent = apiFullName;
            if (dropdownAdminRole) dropdownAdminRole.textContent = apiRole;

            const dashboardWelcomeEl = document.getElementById("dashboardWelcome");
            if (dashboardWelcomeEl) {
                dashboardWelcomeEl.textContent =
                    `Welcome back, ${emp.firstName || apiFullName || "User"}`;
            }

        } catch (error) {
            console.error("Failed to load profile:", error);
        }
    }
    loadMyProfile();

    // Dropdown profile data
    // Fills the matching fields inside the dropdown panel that
    // opens when the header button is clicked.
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
    // Toggles the dropdown on button click, closes it on any
    // other click in the document, and stops clicks *inside* the
    // dropdown from bubbling up and immediately closing it again.
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

    /**
     * DASHBOARD ROLES
     * Renders the logged-in admin's own roles as small badges
     * inside the "Your Access" card on the dashboard view.
     * Shows a placeholder message if there are no roles.
     */
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

    /**
     * DASHBOARD PERMISSIONS
     * Renders the logged-in admin's own permissions as tags
     * inside the "Your Access" card, and updates the permission
     * count badge next to the section heading.
     */
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

    // Run both render functions immediately so the dashboard
    // view shows roles/permissions as soon as the page loads,
    // without waiting for any user interaction.
    renderDashboardRoles();
    renderDashboardPermissions();

    // =========================================================
    // PROFILE INFORMATION
    // Grabs every element on the "My Profile" view that needs to
    // be filled in with the logged-in admin's details.
    // =========================================================
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

    // Fills each profile field if the corresponding element
    // exists on the page — falls back to "--" for missing data.
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



    // =========================================================
    // MOBILE SIDEBAR TOGGLE (via brand logo click)
    // On small screens, clicking the brand logo/name opens or
    // closes the sidebar instead of navigating to dashboard.html.
    // On desktop widths, the click is left alone so it behaves
    // like a normal link.
    // =========================================================
    const brandToggle = document.getElementById("brandToggle");
    const dashboardSidebar = document.getElementById("dashboardSidebar");
    const sidebarBackdrop = document.getElementById("sidebarBackdrop");

    if (brandToggle && dashboardSidebar) {
        brandToggle.addEventListener("click", function (e) {
            if (window.innerWidth <= 991) {
                e.preventDefault();
                e.stopPropagation();
                dashboardSidebar.classList.toggle("show");
                if (sidebarBackdrop) {
                    sidebarBackdrop.classList.toggle("show");
                }
            }
        });
    }
    // Clicking anywhere outside the open mobile sidebar (and outside
    // the brand-logo toggle button) closes it.
    document.addEventListener("click", function (event) {
        if (!dashboardSidebar || !dashboardSidebar.classList.contains("show")) {
            return;
        }
        const clickedInsideSidebar = dashboardSidebar.contains(event.target);
        const clickedToggleButton = brandToggle && brandToggle.contains(event.target);

        if (!clickedInsideSidebar && !clickedToggleButton) {
            dashboardSidebar.classList.remove("show");
        }
    });
    /**
     * PROFILE ROLES
     * Same rendering pattern as renderDashboardRoles(), but
     * targets the role-tag container on the Profile view instead
     * of the dashboard's "Your Access" card.
     */
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

    /**
     * PROFILE PERMISSIONS
     * Same rendering pattern as renderDashboardPermissions(),
     * but targets the Profile view's permission-tag container
     * and its own permission-count badge.
     */
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

    // Run both immediately, same reasoning as the dashboard
    // versions above — Profile view should be pre-populated even
    // before the user navigates to it.
    renderProfileRoles();
    renderProfilePermissions();

    // =========================================================
    // ADMIN PROFILE PHOTO
    // Fetches and displays the logged-in admin's own profile
    // photo (same "/me" photo endpoints already used elsewhere
    // in this backend) and lets the admin upload a new one.
    // Falls back to the initials avatar wherever no photo exists.
    // Uses getAuthData()/API_BASE_URL already resolved above by
    // apiRequest() — no new dependencies added.
    // =========================================================
    let adminOverriddenProfileImage = null;
    let adminCachedPhotoUrl = null;
    let adminPhotoFetchedOnce = false;

    // Minimal fetch wrapper for the photo endpoints — same shape as
    // apiRequest() but skips the JSON-refresh retry logic, since a
    // missing photo (404) is an expected, non-fatal outcome here.
    async function adminPhotoApiRequest(endpoint, options = {}) {
        const authData =
            typeof getAuthData === "function" ? getAuthData() : null;
        const token = authData ? authData.token : null;

        const headers = { ...(options.headers || {}) };
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }

        const response = await fetch(API_BASE_URL + endpoint, {
            ...options,
            headers,
            cache: "no-store"
        });

        let data = {};
        try {
            data = await response.json();
        } catch (error) {
            data = {};
        }

        if (!response.ok) {
            const apiError = new Error(
                data.message || `Request failed with status ${response.status}`
            );
            apiError.responseData = data;
            apiError.status = response.status;
            throw apiError;
        }
        return data;
    }

    // Downloads the binary photo file and turns it into a local blob URL.
    async function fetchAdminPhotoAsObjectUrl(downloadPath) {
        const authData =
            typeof getAuthData === "function" ? getAuthData() : null;
        const token = authData ? authData.token : null;

        const headers = {};
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }

        const response = await fetch(API_BASE_URL + downloadPath, {
            headers,
            cache: "no-store"
        });

        if (!response.ok) {
            throw new Error(`Failed to load photo (status ${response.status})`);
        }

        const blob = await response.blob();
        return URL.createObjectURL(blob);
    }

    // GET /api/profile-photos/me → if a photo exists, download it via
    // GET /api/profile-photos/me/download and cache the resulting blob URL.
    function fetchAdminProfilePhotoUrl() {
        if (adminPhotoFetchedOnce) {
            return Promise.resolve(adminCachedPhotoUrl);
        }
        return adminPhotoApiRequest("/api/profile-photos/me")
            .then(function (res) {
                const photo = res.data;
                if (!photo || !photo.id) {
                    return null;
                }
                return fetchAdminPhotoAsObjectUrl("/api/profile-photos/me/download");
            })
            .catch(function (error) {
                console.warn("Could not load admin profile photo:", error);
                return null;
            })
            .then(function (url) {
                adminCachedPhotoUrl = url;
                adminPhotoFetchedOnce = true;
                return url;
            });
    }

    // POST /api/profile-photos/me — uploads the selected file as multipart form data.
    async function uploadAdminProfilePhoto(file) {
        const authData =
            typeof getAuthData === "function" ? getAuthData() : null;
        const token = authData ? authData.token : null;

        const formData = new FormData();
        formData.append("file", file);

        const headers = {};
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }

        const response = await fetch(API_BASE_URL + "/api/profile-photos/me", {
            method: "POST",
            headers,
            body: formData
        });

        let data = {};
        try {
            data = await response.json();
        } catch (error) {
            data = {};
        }

        if (!response.ok) {
            const apiError = new Error(
                data.message || `Upload failed with status ${response.status}`
            );
            apiError.responseData = data;
            throw apiError;
        }
        return data;
    }

    // Applies a resolved photo URL (or null, meaning "show initials
    // instead") across every avatar on the page: header, dropdown,
    // and the big avatar on the Profile view itself.
    const headerAdminAvatarImg = document.getElementById("headerAdminAvatarImg");
    const dropdownAdminAvatarImg = document.getElementById("dropdownAdminAvatarImg");
    const profileAvatarImg = document.getElementById("profileAvatarImg");

    function applyAdminProfilePhoto(url) {
        [
            { img: headerAdminAvatarImg, fallback: headerAdminInitials },
            { img: dropdownAdminAvatarImg, fallback: dropdownAdminInitials },
            { img: profileAvatarImg, fallback: profileInitials }
        ].forEach(function (pair) {
            if (!pair.img) {
                return;
            }
            if (url) {
                pair.img.src = url;
                pair.img.classList.remove("d-none");
                if (pair.fallback) {
                    pair.fallback.style.display = "none";
                }
            } else {
                pair.img.classList.add("d-none");
                if (pair.fallback) {
                    pair.fallback.style.display = "";
                }
            }
        });
    }

    function loadAdminProfilePhoto() {
        if (adminOverriddenProfileImage) {
            applyAdminProfilePhoto(adminOverriddenProfileImage);
            return;
        }
        fetchAdminProfilePhotoUrl().then(function (url) {
            applyAdminProfilePhoto(url);
        });
    }
    loadAdminProfilePhoto();

    // VIEW PHOTO MODAL — opened by clicking the big avatar on the Profile view.
    const profileAvatarClickable = document.getElementById("profileAvatarClickable");
    const profileAvatarEditBtn = document.getElementById("profileAvatarEditBtn");

    function openAdminViewPhotoModal() {
        const img = document.getElementById("viewAdminPhotoImage");
        const fallback = document.getElementById("viewAdminPhotoFallback");
        const url = adminOverriddenProfileImage || adminCachedPhotoUrl;

        if (url) {
            img.src = url;
            img.classList.remove("d-none");
            fallback.style.display = "none";
        } else {
            img.classList.add("d-none");
            fallback.textContent = initials;
            fallback.style.display = "flex";
        }
        new bootstrap.Modal(document.getElementById("adminViewPhotoModal")).show();
    }

    if (profileAvatarClickable) {
        profileAvatarClickable.addEventListener("click", function (event) {
            // Let the edit button open the upload modal directly instead.
            if (event.target === profileAvatarEditBtn) {
                return;
            }
            openAdminViewPhotoModal();
        });
    }

    // UPLOAD PHOTO MODAL — reachable from the edit button on the big avatar
    // or from the view-photo modal's own camera button.
    let selectedAdminPhotoFile = null;

    function openAdminUploadPhotoModal() {
        selectedAdminPhotoFile = null;

        document.getElementById("uploadAdminPhotoInput").value = "";
        document.getElementById("uploadAdminPhotoMessage").innerHTML = "";
        document.getElementById("saveAdminPhotoButton").disabled = true;

        const preview = document.getElementById("uploadAdminPhotoPreview");
        const previewFallback = document.getElementById("uploadAdminPhotoPreviewFallback");
        preview.classList.add("d-none");
        previewFallback.style.display = "flex";
        previewFallback.textContent = initials;

        new bootstrap.Modal(document.getElementById("adminUploadPhotoModal")).show();
    }

    if (profileAvatarEditBtn) {
        profileAvatarEditBtn.addEventListener("click", function (event) {
            event.stopPropagation();
            openAdminUploadPhotoModal();
        });
    }

    const openUploadAdminPhotoButton = document.getElementById("openUploadAdminPhotoButton");
    if (openUploadAdminPhotoButton) {
        openUploadAdminPhotoButton.addEventListener("click", function () {
            const viewModal = bootstrap.Modal.getInstance(document.getElementById("adminViewPhotoModal"));
            if (viewModal) viewModal.hide();
            openAdminUploadPhotoModal();
        });
    }

    const uploadAdminPhotoInput = document.getElementById("uploadAdminPhotoInput");
    if (uploadAdminPhotoInput) {
        uploadAdminPhotoInput.addEventListener("change", function () {
            const file = this.files[0];
            if (!file) return;

            selectedAdminPhotoFile = file;

            const reader = new FileReader();
            reader.onload = function (e) {
                const preview = document.getElementById("uploadAdminPhotoPreview");
                const previewFallback = document.getElementById("uploadAdminPhotoPreviewFallback");
                preview.src = e.target.result;
                preview.classList.remove("d-none");
                previewFallback.style.display = "none";
                document.getElementById("saveAdminPhotoButton").disabled = false;
            };
            reader.readAsDataURL(file);
        });
    }

    const saveAdminPhotoButton = document.getElementById("saveAdminPhotoButton");
    if (saveAdminPhotoButton) {
        saveAdminPhotoButton.addEventListener("click", function () {
            if (!selectedAdminPhotoFile) return;

            const messageBox = document.getElementById("uploadAdminPhotoMessage");
            messageBox.innerHTML = "";
            saveAdminPhotoButton.disabled = true;

            const reader = new FileReader();
            reader.onload = function (e) {
                const localPreviewUrl = e.target.result;

                uploadAdminProfilePhoto(selectedAdminPhotoFile).then(function () {
                    adminOverriddenProfileImage = localPreviewUrl;
                    applyAdminProfilePhoto(localPreviewUrl);

                    const modal = bootstrap.Modal.getInstance(document.getElementById("adminUploadPhotoModal"));
                    if (modal) modal.hide();

                    messageBox.innerHTML =
                        `<div class="custom-alert success">Profile photo updated.</div>`;
                }).catch(function (error) {
                    console.error("Admin photo upload failed:", error.responseData || error);
                    messageBox.innerHTML =
                        `<div class="custom-alert error">${error.message || "Upload failed."}</div>`;
                    saveAdminPhotoButton.disabled = false;
                });
            };
            reader.readAsDataURL(selectedAdminPhotoFile);
        });
    }

    // =========================================================
    // ALL VIEWS
    // Maps each sidebar `data-view` key to its matching
    // <section> element. This object is the single source of
    // truth the view router (showView) uses to know what exists
    // and what to hide/show.
    // =========================================================
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

    /**
     * SHOW SELECTED VIEW (the view router)
     * Hides every view, shows only the requested one, updates
     * which sidebar item is marked "active", auto-closes the
     * mobile sidebar, scrolls back to the top, and — for views
     * backed by an API — triggers that view's data load
     * (loadRoles/loadPermissions/loadEmployees).
     *
     * @param {string} viewName - key into the `views` object above
     */
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
        // Highlights the sidebar button matching the current view
        // and un-highlights every other one.
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
        // On narrow viewports, navigating to a view should also
        // close the slide-out sidebar so the content is visible.
        if (window.innerWidth < 768) {
            const sidebar = document.getElementById("dashboardSidebar");
            if (sidebar) {
                sidebar.classList.remove("show");
            }
        }
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

        // LOAD API DATA
        // Each API-backed view re-fetches its data every time it's
        // shown, rather than caching — simple but means switching
        // back and forth re-hits the network each time.
        if (viewName === "roles") {
            loadRoles();
        }
        if (viewName === "permissions") {
            loadPermissions();
        }
        if (viewName === "employees" && typeof loadEmployees === "function") {
            loadEmployees(0);
        }
    }

    // OPEN MY PROFILE
    // Wires the "My Profile" dropdown menu item to switch to the
    // profile view and close the dropdown afterward.
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
    // Generic delegated wiring: ANY element with a `data-view`
    // attribute anywhere on the page (sidebar buttons, quick
    // action cards, etc.) triggers showView() with that value.
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
    // Module-level (closure-level) state tracking which role is
    // currently selected for editing / permission-assignment —
    // read by the click-delegation handler and the save handlers
    // further down.
    let selectedRoleId = null;
    let selectedRole = null;

    /**
     * loadRoles()
     * Fetches every role from the backend and renders one
     * "role card" per role into #rolesCardsContainer, each with
     * its permission tags and Edit / Permissions / Delete
     * buttons wired up.
     */
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
                // Build the permission-tag list for this role card
                // (or a "No permissions" placeholder if it has none).
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

                // Build the card element itself.
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

                // Wire this specific card's Edit button: opens the
                // edit-role modal pre-filled with this role's data.
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

                // Wire this specific card's Permissions button:
                // opens the role-permissions modal for this role.
                roleCard.querySelector(".role-permissions-btn")
                    .addEventListener("click", function () {
                        selectedRoleId = role.id;
                        selectedRole = role;
                        loadRolePermissions(role);
                        rolePermissionsModal.show();
                    });

                // Wire this specific card's Delete button.
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

    // Bootstrap modal instances for the two role-related modals,
    // created once up front so they can be `.show()`/`.hide()`n
    // from anywhere below.
    const editRoleModal =
        new bootstrap.Modal(
            document.getElementById("editRoleModal")
        );
    const rolePermissionsModal =
        new bootstrap.Modal(
            document.getElementById("rolePermissionsModal")
        );

    /**
     * Delegated click handler for role-card action buttons.
     * NOTE: this duplicates some of the per-card wiring already
     * done inside loadRoles() above (edit/permissions), since
     * both a direct listener AND this document-level delegated
     * listener respond to the same buttons — worth checking for
     * double-firing when refactoring.
     *
     * Handles:
     *  - .edit-role-btn        -> opens edit-role modal
     *  - .role-permissions-btn -> loads + opens permissions modal
     *  - .delete-role-btn      -> confirms and DELETEs the role
     */
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
            // Re-fetches both roles and permissions fresh (rather
            // than reusing already-loaded data) to build the
            // checkbox list, then marks the ones already assigned
            // to this role as checked.
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
            // Confirms with a SweetAlert2 dialog before calling
            // DELETE, then shows a success/error message and
            // reloads the role list.
            if (deleteButton) {
                const roleId =
                    deleteButton.dataset.roleId;

                const result = await Swal.fire({
                    title: "Are you sure?",
                    text: "This role will be permanently deleted.",
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonText: "Yes, Delete",
                    confirmButtonColor: "#dc2626",
                    customClass: {
                        popup: "swal-small-popup"
                    }
                });
                if (!result.isConfirmed) {
                    return;
                }

                try {
                    await apiRequest(
                        `/api/roles/${roleId}`,
                        {
                            method: "DELETE"
                        }
                    );

                    Swal.fire({
                        title: "Deleted!",
                        text: "Role deleted successfully.",
                        icon: "success",
                        timer: 1800,
                        showConfirmButton: false,
                        customClass: {
                            popup: "swal-small-popup"
                        }
                    });

                    loadRoles();
                } catch (error) {
                    console.error(
                        "Failed to delete role:",
                        error
                    );

                    Swal.fire({
                        title: "Failed",
                        text: error.message || "Failed to delete role",
                        icon: "error",
                        customClass: {
                            popup: "swal-small-popup"
                        }
                    });
                }
            }
        }
    );

    // save edit role function for when the edit role modal is submitted
    // PUT /api/roles/{selectedRoleId} with the new name/description,
    // then closes the modal and reloads the role list.
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

    // save role permissions function for when the role permissions modal is submitted
    // Collects every checked permission checkbox and POSTs the
    // full list to /api/roles/{id}/permissions (replaces the
    // role's permission set rather than diffing add/remove).
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

    // =========================================================
    // ADD ROLE
    // Opens a blank "Add New Role" modal, validates the form on
    // submit, POSTs the new role, and reloads the role list on
    // success (shows an inline error message on failure).
    // =========================================================
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

    /**
     * loadPermissions()
     * Fetches every permission and renders one table row per
     * permission into #permissionsTableBody, each with an Edit
     * button carrying the permission's data in `data-*` attrs.
     */
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

    // =========================================================
    // ADD PERMISSION
    // Opens the "Add New Permission" modal, POSTs the new
    // permission on submit, shows a success message, reloads the
    // table, then auto-closes the modal and resets the form
    // after a short delay.
    // =========================================================
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
                // NOTE: references the global `addPermissionMessage`/
                // `addPermissionForm` identifiers directly instead of
                // document.getElementById(...) like the rest of the
                // file — these happen to work only because elements
                // with matching `id` attributes are auto-exposed as
                // global variables by the browser; fragile pattern.
                addPermissionMessage.innerHTML = `<div class="custom-alert success">Permission added successfully.</div>`;
                loadPermissions();
                setTimeout(function () {
                    addPermissionModal.hide();
                    addPermissionMessage.innerHTML = "";
                    addPermissionForm.reset();
                }, 1200);
            }
        );

    // =========================================================
    // EDIT PERMISSION
    // Only wires up if both the modal and its form exist on the
    // page. Clicking any .edit-permission-btn in the table (event
    // delegated from the table body) opens the modal pre-filled;
    // submitting PUTs the update and refreshes the table.
    // =========================================================
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

    // =========================================================
    // REMOVE PERMISSION (by manually-entered ID)
    // A separate, simpler flow from Edit: the admin types a
    // permission ID directly into a form field and submits it
    // for deletion. Only wires up if all three related elements
    // exist on the page.
    // =========================================================
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
                    // Backend rejects deletion of a permission that's
                    // still assigned to a role — that's assumed to be
                    // the cause of any error here, though the caught
                    // error could technically be something else.
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

    // =========================================================
    // SESSION MANAGEMENT
    // Grabs every element the session modal needs and creates
    // the Bootstrap modal instance up front.
    // =========================================================
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
    // Shows the modal first (so the loading spinner is visible
    // immediately), then fetches the session list.
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

    /**
     * loadSessions()
     * Fetches every active session for the logged-in admin and
     * renders one Bootstrap card per session, showing device
     * info, IP, and login/last-used/expiry dates. The current
     * session gets a "Current Device" badge instead of a Revoke
     * button; every other session gets a Revoke button wired to
     * revokeSession().
     */
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
            // Wired directly per-card here (not delegated), since
            // the cards are freshly created each load anyway.
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

    /**
     * revokeSession(sessionId)
     * Confirms with the admin, calls DELETE on the given session,
     * shows a success/error message, and refreshes the session
     * list either way (on success) so the UI stays in sync.
     *
     * @param {string|number} sessionId
     */
    async function revokeSession(sessionId) {
        if (
            sessionId === null ||
            sessionId === undefined ||
            sessionId === ""
        ) {
            return;
        }

        const result = await Swal.fire({
            title: "Are you sure?",
            text: "This will log the device out of this session.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, Revoke",
            confirmButtonColor: "#dc2626",
            customClass: {
                popup: "swal-small-popup"
            }
        });
        if (!result.isConfirmed) {
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

            Swal.fire({
                title: "Revoked!",
                text: "Session revoked successfully.",
                icon: "success",
                timer: 1800,
                showConfirmButton: false,
                customClass: {
                    popup: "swal-small-popup"
                }
            });

            // Reload updated session list
            await loadSessions();
        } catch (error) {
            console.error(
                "Failed to revoke session:",
                error
            );

            Swal.fire({
                title: "Failed",
                text: error.message || "Failed to revoke session",
                icon: "error",
                customClass: {
                    popup: "swal-small-popup"
                }
            });
        }
    }

    // =========================================================
    // LOGOUT
    // Two separate logout buttons (sidebar + dropdown menu) each
    // get their own listener. Both prefer the shared logout()
    // helper from auth.js if it exists; otherwise they manually
    // clear cookies/localStorage/sessionStorage as a fallback
    // before redirecting to the login page.
    // =========================================================
    const logoutButton =
        document.getElementById(
            "logoutButton"
        );
    if (logoutButton) {
        logoutButton.addEventListener(
            "click",
            function () {
                if (typeof logout === "function") {
                    logout();
                    return;
                }
                if (typeof deleteCookie === "function") {
                    deleteCookie("authData");
                }
                localStorage.removeItem("authData");
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                localStorage.removeItem("role");
                localStorage.removeItem("email");
                window.location.href =
                    "../auth/login.html";
            }
        );
    }

    // DROPDOWN LOGOUT
    // Same idea as above, but clears storage more broadly
    // (localStorage.clear() + sessionStorage.clear()) rather than
    // removing specific keys — inconsistent with the sidebar
    // logout handler just above it.
    const dropdownLogoutButton =
        document.getElementById("dropdownLogoutButton");
    if (dropdownLogoutButton) {
        dropdownLogoutButton.addEventListener("click", function () {
            if (typeof logout === "function") {
                logout();
                return;
            }
            if (typeof deleteCookie === "function") {
                deleteCookie("authData");
            }
            localStorage.clear();
            sessionStorage.clear();
            window.location.href =
                "../auth/login.html";
        });
    }

    // =========================================================
    // ADMIN DASHBOARD - RESET PASSWORD
    // Uses ACTUAL API
    // POST /api/auth/change-password
    //
    // Two delegated (document-level) listeners handle this whole
    // feature:
    //   1. click  -> toggles the reset-password form open/closed
    //   2. submit -> validates + submits the password change
    // Delegation is used (instead of a direct listener on the
    // button/form) presumably because of the duplicate-id issue
    // noted in the HTML annotations — there are two elements with
    // id="resetPasswordFormWrapper" on the page.
    // =========================================================
    document.addEventListener("click", function (event) {
        const resetButton =
            event.target.closest("#resetPasswordToggleButton");
        if (!resetButton) {
            return;
        }
        event.preventDefault();
        const resetPasswordMessage =
            document.getElementById("resetPasswordMessage");
        if (resetPasswordMessage) {
            resetPasswordMessage.innerHTML = "";
        }
        const resetPasswordModalEl =
            document.getElementById("resetPasswordModal");
        if (!resetPasswordModalEl) {
            console.error("ERROR: resetPasswordModal not found");
            return;
        }
        new bootstrap.Modal(resetPasswordModalEl).show();
    });

    // =========================================================
    // FORM SUBMIT
    // Event delegation
    // Validates all fields are filled, new/confirm passwords
    // match, and the new password meets the minimum length,
    // before calling the change-password endpoint. Disables the
    // submit button while the request is in flight and restores
    // it in a `finally` block regardless of outcome.
    // =========================================================
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
                // Shows a success message, resets the form, then
                // hides the form wrapper and clears the message
                // after 1.5s.
                resetPasswordMessage.innerHTML =
                    `<div class="custom-alert success">
                    ${escapeHtml(
                        response.message ||
                        "Password updated successfully."
                    )}
                </div>`;
                form.reset();
                setTimeout(function () {
                    const modalEl =
                        document.getElementById("resetPasswordModal");
                    const modal =
                        modalEl && bootstrap.Modal.getInstance(modalEl);
                    if (modal) {
                        modal.hide();
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
                // Always re-enable the submit button, whether the
                // request succeeded, failed, or returned a
                // backend-level failure.
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.textContent =
                        originalButtonText;
                }
            }
        }
    );

    /**
     * GET DISPLAY NAME
     * Handles strings and API objects
     * Normalizes a role/permission value into a human-readable
     * string, whether it arrives as a plain string or as an
     * object with one of several possible name-ish fields.
     *
     * @param {string|object|null|undefined} value
     * @returns {string}
     */
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

    /**
     * ESCAPE HTML
     * Safely escapes a value for injection into innerHTML by
     * round-tripping it through a throwaway <div>'s textContent
     * -> innerHTML. Used everywhere user- or API-supplied text is
     * inserted into template strings, to prevent HTML/script
     * injection.
     *
     * @param {*} value
     * @returns {string}
     */
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

    /**
     * FORMAT SESSION DATE
     * Formats an ISO date string (or any Date-parseable value)
     * into a short, locale-aware "en-IN" date+time string for
     * display in the sessions list. Returns "--" for missing or
     * invalid dates.
     *
     * @param {string|number|Date} dateValue
     * @returns {string}
     */
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

    // End of the DOMContentLoaded handler — everything above this
    // point runs once, on page load.
});


// =========================================================
// LEGACY "ADD EMPLOYEE" SUBMIT HANDLER (outside DOMContentLoaded)
// This block runs at script-parse time, NOT inside the
// DOMContentLoaded callback above, so it depends on the DOM
// already being ready when this script tag executes (works only
// because the <script> is placed at the end of <body>).
//
// It posts to a made-up "/api/employees" endpoint with fields
// (gender/shift as raw strings, an "rms" array) that don't match
// the real backend's CreateEmployeeRequest DTO — see the removal
// note directly below this block.
// =========================================================
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

// NOTE: Add/Edit/View Employee logic now lives in js/employees.js,
// wired to the real employee-service endpoints (see that file for
// the endpoint list). The old stub above used a made-up "/api/employees"
// endpoint and fields (gender/shift as raw strings, "rms" array) that
// never matched the actual CreateEmployeeRequest DTO, so it has been
// removed in favor of the real implementation.
//
// DEAD-CODE FLAG: despite this comment saying the old stub "has been
// removed", the `addEmployeeForm` submit-handler block directly above
// is still present and still runs (it will attach its listener as
// long as an element with id="addEmployeeForm" exists on the page —
// and it does, in dashboard.html). If js/employees.js *also* attaches
// a submit listener to the same #addEmployeeForm, both handlers will
// fire on submit, double-submitting the form to two different
// endpoints. Worth confirming with whoever owns employees.js and
// deleting this block if it's truly meant to be replaced.