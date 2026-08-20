document.addEventListener("DOMContentLoaded", function () {

    // =========================
    // AUTH CHECK
    // =========================

    const authData = getAuthData();

    if (!authData || !authData.token) {
        window.location.href = "../auth/login.html";
        return;
    }

    // =========================
    // NAVBAR / SIDEBAR USER INFO
    // (demo profile se bharenge; real backend aane par
    //  authData.user se bhi le sakte ho, admin-dashboard.js jaisa)
    // =========================

    const userNameEl = document.getElementById("userName");
    const userRoleEl = document.getElementById("userRole");
    const sidebarUserNameEl = document.getElementById("sidebarUserName");
    const sidebarUserEmailEl = document.getElementById("sidebarUserEmail");
    const userInitialsEl = document.getElementById("userInitials");
    const dashboardWelcomeEl = document.getElementById("dashboardWelcome");
    const leavePolicyToggle = document.getElementById("leavePolicyToggle");
    const leavePolicyDropdown = document.querySelector(".leave-policy-dropdown");

    if (leavePolicyToggle && leavePolicyDropdown) {
        leavePolicyToggle.addEventListener("click", function () {
            leavePolicyDropdown.classList.toggle("open");
        });
    }

    // =========================
    // HTML SECURITY HELPER
    // =========================

    function escapeHtml(value) {
        const div = document.createElement("div");
        div.textContent = value === null || value === undefined ? "" : String(value);
        return div.innerHTML;
    }

    // =========================
    // VIEW SWITCHING
    // =========================

    const viewNames = [
        "dashboard", "my-attendance", "attendance-calendar",
        "my-leaves", "apply-leave", "leave-balance",
        "my-payroll", "payslips", "attendance-corrections", "profile"
    ];

    const views = {};
    viewNames.forEach(function (name) {
        views[name] = document.getElementById(name + "View");
    });

    const viewLoaders = {
        "dashboard": loadDashboardSummary,
        "my-attendance": loadMyAttendance,
        "attendance-calendar": loadAttendanceCalendar,
        "my-leaves": loadMyLeaves,
        "apply-leave": loadApplyLeaveForm,
        "leave-balance": loadLeaveBalance,
        "my-payroll": loadPayroll,
        "payslips": loadPayslips,
        "attendance-corrections": loadCorrections,
        "profile": loadProfile
    };

    function showView(viewName) {
        viewNames.forEach(function (name) {
            views[name].classList.add("d-none");
        });

        views[viewName].classList.remove("d-none");

        document.querySelectorAll(".sidebar-item[data-view]").forEach(function (btn) {
            btn.classList.toggle("active", btn.dataset.view === viewName);
        });

        if (viewLoaders[viewName]) {
            viewLoaders[viewName]();
        }
    }

    // EMPLOYEE PROFILE CLICK

    // =========================================
    // EMPLOYEE PROFILE DROPDOWN
    // =========================================

    const employeeProfileButton =
        document.getElementById("employeeProfileButton");

    const employeeProfileDropdown =
        document.getElementById("employeeProfileDropdown");

    const headerEmployeeImage =
        document.getElementById("headerEmployeeImage");

    const headerEmployeeName =
        document.getElementById("headerEmployeeName");

    const headerEmployeeId =
        document.getElementById("headerEmployeeId");

    const profileDropdownImage =
        document.getElementById("profileDropdownImage");

    const profileDropdownName =
        document.getElementById("profileDropdownName");

    const profileDropdownId =
        document.getElementById("profileDropdownId");


    // Open / close profile dropdown

    employeeProfileButton.addEventListener("click", function (event) {

        event.stopPropagation();

        employeeProfileDropdown.classList.toggle("show");

    });


    // Outside click

    document.addEventListener("click", function () {

        employeeProfileDropdown.classList.remove("show");

    });


    // Prevent dropdown from closing when clicking inside

    employeeProfileDropdown.addEventListener("click", function (event) {

        event.stopPropagation();

    });


    // =========================================
    // LOAD EMPLOYEE PROFILE
    // =========================================

    function loadHeaderEmployeeProfile() {

        demoGetProfile().then(function (res) {

            const p = res.data;

            const fullName =
                `${p.firstName} ${p.lastName}`.trim();

            const employeeImage =
                p.profileImage || "../assets/image/Image01.jpg";

            headerEmployeeName.textContent = fullName;
            headerEmployeeId.textContent =
                p.employeeCode || "EMP-0000";

            headerEmployeeImage.src = employeeImage;

            profileDropdownName.textContent =
                fullName;

            profileDropdownId.textContent =
                p.employeeCode || "EMP-0000";

            profileDropdownImage.src =
                employeeImage;

        });

    }
    loadHeaderEmployeeProfile();

    const systemInButton = document.getElementById("systemInButton");
    const systemOutButton = document.getElementById("systemOutButton");

    systemInButton.addEventListener("click", function () {
        alert("Demo: System In successful");

        systemInButton.classList.add("d-none");
        systemOutButton.classList.remove("d-none");
    });

    systemOutButton.addEventListener("click", function () {
        alert("Demo: System Out successful");

        systemOutButton.classList.add("d-none");
        systemInButton.classList.remove("d-none");
    });

    document.querySelectorAll("[data-view]").forEach(function (el) {
        el.addEventListener("click", function () {
            showView(this.dataset.view);
        });
    });

    // =========================
    // DASHBOARD OVERVIEW
    // =========================

    function loadDashboardSummary() {
        demoGetProfile().then(function (res) {
            const p = res.data;
            const fullName = `${p.firstName} ${p.lastName}`.trim();

            userNameEl.textContent = fullName;
            userRoleEl.textContent = "EMPLOYEE";
            sidebarUserNameEl.textContent = fullName;
            sidebarUserEmailEl.textContent = p.email;
            dashboardWelcomeEl.textContent = `Welcome back, ${p.firstName}!`;

            const initials = `${p.firstName.charAt(0)}${p.lastName.charAt(0)}`.toUpperCase();
            userInitialsEl.textContent = initials;
        });

        demoGetDashboardSummary().then(function (res) {
            const s = res.data;
            document.getElementById("statAttendance").textContent = s.attendancePercent + "%";
            document.getElementById("statLeaveBalance").textContent = s.leaveBalanceDays + " days";
            document.getElementById("statCorrections").textContent = s.pendingCorrections;
            document.getElementById("statLastPayslip").textContent = s.lastPayslipMonth;
        });
    }

    // =========================
    // MY ATTENDANCE
    // =========================

    // =========================
    // MY ATTENDANCE
    // =========================

    let myAttendanceData = [];

    function loadMyAttendance() {
        const tbody = document.getElementById("myAttendanceTableBody");
        tbody.innerHTML = `<tr><td colspan="5" class="text-center py-4">Loading...</td></tr>`;

        demoGetMyAttendance().then(function (res) {
            myAttendanceData = res.data;
            renderAttendanceStats(myAttendanceData);
            renderAttendanceTable(myAttendanceData);
        });
    }

    function renderAttendanceStats(rows) {
        const counts = { PRESENT: 0, LATE: 0, ABSENT: 0, LEAVE: 0 };

        rows.forEach(function (r) {
            if (counts.hasOwnProperty(r.status)) {
                counts[r.status]++;
            }
        });

        document.getElementById("attStatPresent").textContent = counts.PRESENT;
        document.getElementById("attStatLate").textContent = counts.LATE;
        document.getElementById("attStatAbsent").textContent = counts.ABSENT;
        document.getElementById("attStatLeave").textContent = counts.LEAVE;
    }

    function renderAttendanceTable(rows) {
        const tbody = document.getElementById("myAttendanceTableBody");

        if (rows.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-muted">No records found.</td></tr>`;
            return;
        }

        tbody.innerHTML = rows.map(function (r) {
            return `
            <tr>
                <td>${escapeHtml(r.date)}</td>
                <td>${escapeHtml(r.checkIn)}</td>
                <td>${escapeHtml(r.checkOut)}</td>
                <td>${escapeHtml(r.hours)}</td>
                <td><span class="status-badge ${escapeHtml(r.status)}">${escapeHtml(r.status)}</span></td>
            </tr>
        `;
        }).join("");
    }

    // Status dropdown se client-side filter (demo ke liye)
    document.getElementById("attendanceStatusFilter").addEventListener("change", function () {
        const value = this.value;

        const filtered = value === "ALL"
            ? myAttendanceData
            : myAttendanceData.filter(function (r) { return r.status === value; });

        renderAttendanceTable(filtered);
    });

    // =========================
    // ATTENDANCE CALENDAR
    // =========================

    function loadAttendanceCalendar() {
        const container = document.getElementById("attendanceCalendar");
        container.innerHTML = `<p class="text-muted">Loading calendar...</p>`;

        demoGetAttendanceCalendar().then(function (res) {
            const statusClass = {
                PRESENT: "day-present",
                ABSENT: "day-absent",
                LATE: "day-present",
                LEAVE: "day-leave",
                WEEKEND: "day-weekend"
            };

            container.innerHTML = res.data.map(function (d) {
                const cls = statusClass[d.status] || "";
                return `
                    <div class="calendar-day ${cls}">
                        <span class="day-number">${d.day}</span>
                        ${escapeHtml(d.status)}
                    </div>
                `;
            }).join("");
        });
    }

    // =========================
    // MY LEAVES
    // =========================

    function loadMyLeaves() {
        const tbody = document.getElementById("myLeavesTableBody");
        tbody.innerHTML = `<tr><td colspan="6" class="text-center py-4">Loading...</td></tr>`;

        demoGetMyLeaves().then(function (res) {
            const rows = res.data;

            if (rows.length === 0) {
                tbody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-muted">No leave records found.</td></tr>`;
                return;
            }

            tbody.innerHTML = rows.map(function (r) {
                return `
                    <tr>
                        <td>${escapeHtml(r.leaveType)}</td>
                        <td>${escapeHtml(r.fromDate)}</td>
                        <td>${escapeHtml(r.toDate)}</td>
                        <td>${escapeHtml(r.days)}</td>
                        <td><span class="badge text-bg-secondary">${escapeHtml(r.status)}</span></td>
                        <td>${escapeHtml(r.appliedOn)}</td>
                    </tr>
                `;
            }).join("");
        });
    }

    // =========================
    // APPLY LEAVE
    // =========================

    let ccSelectedList = [];

    function loadApplyLeaveForm() {
        demoGetLeavePolicy().then(function (res) {
            document.getElementById("leavePolicyLeft").innerHTML = res.data.left.map(function (item) {
                return `<li>${escapeHtml(item)}</li>`;
            }).join("");

            document.getElementById("leavePolicyRight").innerHTML = res.data.right.map(function (item) {
                return `<li>${escapeHtml(item)}</li>`;
            }).join("");
        });

        demoGetLeaveTypes().then(function (res) {
            document.getElementById("leaveType").innerHTML =
                `<option value="">-- Choose Option --</option>` +
                res.data.map(function (type) {
                    return `<option value="${escapeHtml(type)}">${escapeHtml(type)}</option>`;
                }).join("");
        });

        demoGetLeaveFormMeta().then(function (res) {
            const meta = res.data;

            const sessionOptions = `<option value="">-- Choose Session --</option>` +
                meta.sessions.map(function (s) {
                    return `<option value="${escapeHtml(s)}">${escapeHtml(s)}</option>`;
                }).join("");

            document.getElementById("fromSession").innerHTML = sessionOptions;
            document.getElementById("toSession").innerHTML = sessionOptions;

            document.getElementById("applyTo").innerHTML = `<option value="">-- Select --</option>` +
                meta.applyToOptions.map(function (a) {
                    return `<option value="${a.id}">${escapeHtml(a.name)}</option>`;
                }).join("");

            document.getElementById("ccSelect").innerHTML = `<option value="">-- Select person --</option>` +
                meta.ccOptions.map(function (c) {
                    return `<option value="${c.id}" data-name="${escapeHtml(c.name)}">${escapeHtml(c.name)}</option>`;
                }).join("");
        });

        ccSelectedList = [];
        renderCcChips();
    }

    function calculateLeaveDays() {
        const fromVal = document.getElementById("leaveFromDate").value;
        const toVal = document.getElementById("leaveToDate").value;
        const daysField = document.getElementById("numberOfDays");

        if (!fromVal || !toVal) {
            daysField.value = "";
            return;
        }

        const from = new Date(fromVal);
        const to = new Date(toVal);
        const diff = Math.round((to - from) / (1000 * 60 * 60 * 24)) + 1;

        daysField.value = diff > 0 ? diff + (diff === 1 ? " day" : " days") : "Invalid range";
    }

    document.getElementById("leaveFromDate").addEventListener("change", calculateLeaveDays);
    document.getElementById("leaveToDate").addEventListener("change", calculateLeaveDays);


    // const applyLeaveForm = document.getElementById("applyLeaveForm");
    // const applyLeaveMessage = document.getElementById("applyLeaveMessage");

    document.getElementById("leaveType").addEventListener("change", function () {
        const selectedType = this.value;
        const balanceField = document.getElementById("leaveBalanceField");

        if (!selectedType) {
            balanceField.value = "";
            return;
        }

        demoGetLeaveBalance().then(function (res) {
            const match = res.data.find(function (b) {
                return b.leaveType === selectedType;
            });

            balanceField.value = match ? `${match.remainingDays} / ${match.totalDays} days` : "N/A";
        });
    });

    // CC To — add / remove chips
    document.getElementById("addCcButton").addEventListener("click", function () {
        const ccSelect = document.getElementById("ccSelect");

        if (!ccSelect.value) {
            return;
        }

        const selectedOption = ccSelect.options[ccSelect.selectedIndex];

        const alreadyAdded = ccSelectedList.some(function (c) {
            return c.id === ccSelect.value;
        });

        if (!alreadyAdded) {
            ccSelectedList.push({
                id: ccSelect.value,
                name: selectedOption.dataset.name
            });
            renderCcChips();
        }

        ccSelect.value = "";
    });

    function renderCcChips() {
        const container = document.getElementById("ccChipsList");

        container.innerHTML = ccSelectedList.map(function (c) {
            return `
            <span class="cc-chip">
                ${escapeHtml(c.name)}
                <button type="button" data-remove-cc="${c.id}">&times;</button>
            </span>
        `;
        }).join("");

        container.querySelectorAll("[data-remove-cc]").forEach(function (btn) {
            btn.addEventListener("click", function () {
                const id = this.dataset.removeCc;
                ccSelectedList = ccSelectedList.filter(function (c) {
                    return c.id !== id;
                });
                renderCcChips();
            });
        });
    }

    const applyLeaveForm = document.getElementById("applyLeaveForm");
    const applyLeaveMessage = document.getElementById("applyLeaveMessage");


    applyLeaveForm.addEventListener("submit", function (e) {
        e.preventDefault();

        applyLeaveMessage.innerHTML = "";

        const payload = {
            leaveType: document.getElementById("leaveType").value,
            fromSession: document.getElementById("fromSession").value,
            fromDate: document.getElementById("leaveFromDate").value,
            toSession: document.getElementById("toSession").value,
            toDate: document.getElementById("leaveToDate").value,
            contactDetails: document.getElementById("contactDetails").value.trim(),
            numberOfDays: document.getElementById("numberOfDays").value,
            applyTo: document.getElementById("applyTo").value,
            ccTo: ccSelectedList,
            reason: document.getElementById("leaveReason").value.trim()
        };

        demoApplyLeave(payload).then(function (res) {
            applyLeaveMessage.innerHTML = `<div class="custom-alert success">${escapeHtml(res.data.message)}</div>`;

            applyLeaveForm.reset();
            ccSelectedList = [];
            renderCcChips();
            document.getElementById("numberOfDays").value = "";
            document.getElementById("leaveBalanceField").value = "";
        });
    });

    // =========================
    // LEAVE BALANCE
    // =========================

    function loadLeaveBalance() {
        const container = document.getElementById("leaveBalanceCards");
        container.innerHTML = `<p class="text-muted">Loading...</p>`;

        demoGetLeaveBalance().then(function (res) {
            container.innerHTML = res.data.map(function (b) {
                return `
                    <div class="col-12 col-sm-6 col-xl-4">
                        <div class="leave-balance-card">
                            <span>${escapeHtml(b.leaveType)}</span>
                            <h4>${b.remainingDays} / ${b.totalDays} days</h4>
                        </div>
                    </div>
                `;
            }).join("");
        });
    }

    // =========================
    // MY PAYROLL
    // =========================

    function loadPayroll() {
        const container = document.getElementById("myPayrollSummary");
        container.innerHTML = `<p class="text-muted">Loading...</p>`;

        demoGetPayroll().then(function (res) {
            const p = res.data;

            container.innerHTML = `
                <div class="col-12">
                    <div class="erp-form-card">
                        <h5>${escapeHtml(p.month)}</h5>
                        <p>Basic: ₹${p.basic.toLocaleString()}</p>
                        <p>Allowances: ₹${p.allowances.toLocaleString()}</p>
                        <p>Deductions: ₹${p.deductions.toLocaleString()}</p>
                        <hr>
                        <strong>Net Pay: ₹${p.netPay.toLocaleString()}</strong>
                    </div>
                </div>
            `;
        });
    }

    // =========================
    // PAYSLIPS
    // =========================

    function loadPayslips() {
        const tbody = document.getElementById("payslipsTableBody");
        tbody.innerHTML = `<tr><td colspan="4" class="text-center py-4">Loading...</td></tr>`;

        demoGetPayslips().then(function (res) {
            tbody.innerHTML = res.data.map(function (p) {
                return `
                    <tr>
                        <td>${escapeHtml(p.month)}</td>
                        <td>₹${p.netPay.toLocaleString()}</td>
                        <td><span class="badge text-bg-success">${escapeHtml(p.status)}</span></td>
                        <td><button type="button" class="btn btn-sm btn-outline-primary" onclick="alert('Demo only — real download backend se aayega')">Download</button></td>
                    </tr>
                `;
            }).join("");
        });
    }

    // =========================
    // ATTENDANCE CORRECTIONS
    // =========================

    const newCorrectionButton = document.getElementById("newCorrectionButton");
    const correctionFormWrapper = document.getElementById("correctionFormWrapper");
    const correctionForm = document.getElementById("correctionForm");
    const correctionFormMessage = document.getElementById("correctionFormMessage");

    newCorrectionButton.addEventListener("click", function () {
        correctionFormWrapper.classList.toggle("d-none");
    });

    correctionForm.addEventListener("submit", function (e) {
        e.preventDefault();

        correctionFormMessage.innerHTML = "";

        const payload = {
            date: document.getElementById("correctionDate").value,
            change: document.getElementById("correctionChange").value.trim(),
            reason: document.getElementById("correctionReason").value.trim()
        };

        demoSubmitCorrection(payload).then(function (res) {
            correctionFormMessage.innerHTML = `<div class="custom-alert success">${escapeHtml(res.data.message)}</div>`;
            correctionForm.reset();
            correctionFormWrapper.classList.add("d-none");
            loadCorrections();
        });
    });

    function loadCorrections() {
        const tbody = document.getElementById("correctionsTableBody");
        tbody.innerHTML = `<tr><td colspan="4" class="text-center py-4">Loading...</td></tr>`;

        demoGetCorrections().then(function (res) {
            const rows = res.data;

            if (rows.length === 0) {
                tbody.innerHTML = `<tr><td colspan="4" class="text-center py-4 text-muted">No correction requests.</td></tr>`;
                return;
            }

            tbody.innerHTML = rows.map(function (r) {
                return `
                    <tr>
                        <td>${escapeHtml(r.date)}</td>
                        <td>${escapeHtml(r.change)}</td>
                        <td>${escapeHtml(r.reason)}</td>
                        <td><span class="badge text-bg-secondary">${escapeHtml(r.status)}</span></td>
                    </tr>
                `;
            }).join("");
        });
    }

    // =========================
    // PROFILE
    // =========================

    const profileViewButton =
        document.getElementById("profileViewButton");

    if (profileViewButton) {
        profileViewButton.addEventListener("click", function () {
            showView("profile");
        });
    }

    function loadProfile() {
        const card = document.getElementById("profileCard");

        card.innerHTML = `
        <div class="profile-loading">
            Loading profile...
        </div>
    `;

        demoGetProfile().then(function (res) {
            const p = res.data;

            const fullName = `${p.firstName} ${p.lastName}`.trim();

            const initials =
                `${p.firstName.charAt(0)}${p.lastName.charAt(0)}`
                    .toUpperCase();

            card.innerHTML = `
            <div class="employee-profile">

             <!-- PROFILE HEADER -->
                <div class="profile-header">

                <div class="profile-avatar">
                    ${p.profileImage
                    ? `<img src="${escapeHtml(p.profileImage)}"
                        alt="Employee Profile"
                        class="profile-avatar-image"
                        onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">`
                    : ""
                }

                   <span class="profile-avatar-fallback"
                        style="${p.profileImage ? 'display:none;' : 'display:flex;'}">
                    ${escapeHtml(initials)}
                </span>
            </div>

                    <div class="profile-main-info">
                        <h2>${escapeHtml(fullName)}</h2>
                        <p>${escapeHtml(p.designation)}</p>

                        <span class="profile-status">
                            <span class="status-dot"></span>
                            Active Employee
                        </span>
                    </div>

                </div>


                <!-- BASIC INFORMATION -->
                <div class="profile-section">

                    <div class="profile-section-title">
                        <span class="profile-section-icon">👤</span>
                        <div>
                            <h4>Basic Information</h4>
                            <p>Employee identification details</p>
                        </div>
                    </div>

                    <div class="profile-info-grid">

                        <div class="profile-info-item">
                            <span class="profile-label">
                                Employee Code
                            </span>
                            <strong>
                                ${escapeHtml(p.employeeCode)}
                            </strong>
                        </div>

                        <div class="profile-info-item">
                            <span class="profile-label">
                                Full Name
                            </span>
                            <strong>
                                ${escapeHtml(fullName)}
                            </strong>
                        </div>

                        <div class="profile-info-item">
                            <span class="profile-label">
                                Department
                            </span>
                            <strong>
                                ${escapeHtml(p.departmentName)}
                            </strong>
                        </div>

                        <div class="profile-info-item">
                            <span class="profile-label">
                                Designation
                            </span>
                            <strong>
                                ${escapeHtml(p.designation)}
                            </strong>
                        </div>

                    </div>

                </div>


                <!-- CONTACT INFORMATION -->
                <div class="profile-section">

                    <div class="profile-section-title">
                        <span class="profile-section-icon">📞</span>
                        <div>
                            <h4>Contact Information</h4>
                            <p>Your registered contact details</p>
                        </div>
                    </div>

                    <div class="profile-info-grid">

                        <div class="profile-info-item">
                            <span class="profile-label">
                                Email Address
                            </span>
                            <strong>
                                ${escapeHtml(p.email)}
                            </strong>
                        </div>

                        <div class="profile-info-item">
                            <span class="profile-label">
                                Phone Number
                            </span>
                            <strong>
                                ${escapeHtml(p.phone)}
                            </strong>
                        </div>

                        <div class="profile-info-item profile-password-card">
                            <span class="profile-label">
                                Password
                            </span>
                            <button type="button" id="resetPasswordToggleButton" class="btn-reset-password">
                                Reset Password
                            </button>
                        </div>

                    </div>

                </div>


                <!-- WORK INFORMATION -->
                <div class="profile-section">

                    <div class="profile-section-title">
                        <span class="profile-section-icon">💼</span>
                        <div>
                            <h4>Work Information</h4>
                            <p>Employment and reporting details</p>
                        </div>
                    </div>

                    <div class="profile-info-grid">

                        <div class="profile-info-item">
                            <span class="profile-label">
                                Joining Date
                            </span>
                            <strong>
                                ${escapeHtml(p.joiningDate)}
                            </strong>
                        </div>

                        <div class="profile-info-item">
                            <span class="profile-label">
                                Reporting Manager
                            </span>
                            <strong>
                                ${escapeHtml(p.reportingManager)}
                            </strong>
                        </div>

                    </div>

                </div>

            </div>
        `;
        });
    }


    // =========================
    // RESET PASSWORD (from Profile)
    // =========================

    const resetPasswordToggleButton =
        document.getElementById("resetPasswordToggleButton");

    const resetPasswordFormWrapper =
        document.getElementById("resetPasswordFormWrapper");

    const resetPasswordForm =
        document.getElementById("resetPasswordForm");

    const resetPasswordMessage =
        document.getElementById("resetPasswordMessage");

    if (resetPasswordToggleButton) {
        resetPasswordToggleButton.addEventListener("click", function () {
            resetPasswordFormWrapper.classList.toggle("d-none");
            resetPasswordMessage.innerHTML = "";
        });
    }

    if (resetPasswordForm) {
        resetPasswordForm.addEventListener("submit", function (e) {
            e.preventDefault();

            resetPasswordMessage.innerHTML = "";

            const currentPassword = document.getElementById("currentPasswordField").value;
            const newPassword = document.getElementById("newPasswordField").value;
            const confirmPassword = document.getElementById("confirmPasswordField").value;

            if (newPassword !== confirmPassword) {
                resetPasswordMessage.innerHTML =
                    `<div class="custom-alert error">New password and confirm password do not match.</div>`;
                return;
            }

            if (newPassword.length < 6) {
                resetPasswordMessage.innerHTML =
                    `<div class="custom-alert error">Password must be at least 6 characters.</div>`;
                return;
            }

            demoChangePassword({
                currentPassword: currentPassword,
                newPassword: newPassword
            }).then(function (res) {
                resetPasswordMessage.innerHTML =
                    `<div class="custom-alert success">${escapeHtml(res.data.message)}</div>`;

                resetPasswordForm.reset();

                setTimeout(function () {
                    resetPasswordFormWrapper.classList.add("d-none");
                    resetPasswordMessage.innerHTML = "";
                }, 1500);
            });
        });
    }

    // =========================
    // INITIAL VIEW
    // =========================

    showView("dashboard");

    const sidebarImage =
        document.getElementById("sidebarProfileImage");

    const sidebarInitials =
        document.getElementById("sidebarInitials");

    if (p.profileImage) {
        sidebarImage.src = p.profileImage;

        sidebarImage.style.display = "block";
        sidebarInitials.style.display = "none";

        sidebarImage.onerror = function () {
            this.style.display = "none";
            sidebarInitials.style.display = "flex";
        };
    } else {
        sidebarImage.style.display = "none";
        sidebarInitials.style.display = "flex";
    }

});


const logoutPanel = document.getElementById("logoutPanel");

if (logoutPanel) {
    logoutPanel.addEventListener("click", function () {

        // Agar tumhare auth.js me logout function hai
        if (typeof logout === "function") {
            logout();
            return;
        }

        // Fallback
        localStorage.clear();
        sessionStorage.clear();

        window.location.href = "../auth/login.html";
    });
}