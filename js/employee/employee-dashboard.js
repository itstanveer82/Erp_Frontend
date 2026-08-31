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
    const dashboardWelcomeEl = document.getElementById("dashboardWelcome");
    const userInitialsEl = document.getElementById("userInitials");
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
        "dashboard",
        "personal-information", "emergency-information", "bank-information",
        "family-information", "education-information", "experience-information",
        "joining-details", "work-position", "exit-details",
        "nomination-information", "skills",
        "my-attendance", "attendance-calendar", "attendance-corrections",
        "my-leaves", "apply-leave", "leave-balance",
        "my-payroll", "payslips",
        "profile", "profile-overview"
    ];
    const views = {};
    viewNames.forEach(function (name) {
        views[name] = document.getElementById(name + "View");
    });

    const viewLoaders = {
        "dashboard": loadDashboardSummary,
        "personal-information": loadPersonalInformation,
        "emergency-information": loadEmergencyInformation,
        "education-information": loadEducationInformation,
        "experience-information": loadExperienceInformation,
        "joining-details": loadJoiningDetails,
        "work-position": loadWorkPosition,
        "exit-details": loadExitDetails,
        "nomination-information": loadNominationInformation,
        "skills": loadSkills,

        "family-information": loadFamilyInformation,
        "my-attendance": loadMyAttendance,
        "attendance-calendar": loadAttendanceCalendar,
        "my-leaves": loadMyLeaves,
        "apply-leave": loadApplyLeaveForm,
        "leave-balance": loadLeaveBalance,
        "my-payroll": loadPayroll,
        "payslips": loadPayslips,
        "attendance-corrections": loadCorrections,
        "profile": loadProfile,
        "profile-overview": loadProfileOverview,
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
    // =========================================
    // EMPLOYEE PROFILE CLICK
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
    // REAL PROFILE API (demoGetProfile ki jagah)
    // Real endpoint: GET /api/users/me
    // Jo fields backend abhi nahi bhej raha, unke liye
    // placeholder rakha hai. Jab backend developer wo
    // fields add karega, to yahan sirf fallback values
    // hata dena — baaki poore project me kuch change
    // nahi karna padega.
    // =========================================

    let currentProfileInitials = "";


    // ======================================
                // Employee Profile show
    // ======================================

    function loadHeaderEmployeeProfile() {
        fetchCurrentUserProfile().then(function (res) {

            const p = res.data || {};

            const fullName =
                `${p.firstName || ""} ${p.lastName || ""}`.trim();

            const employeeImage =
                p.profileImage;

            headerEmployeeName.textContent =
                fullName || "Employee";

            headerEmployeeId.textContent =
                p.employeeCode || "EMP-0000";

            headerEmployeeImage.src =
                employeeImage;

            profileDropdownName.textContent =
                fullName || "Employee";

            profileDropdownId.textContent =
                p.employeeCode || "EMP-0000";

            profileDropdownImage.src =
                employeeImage;
        })
            .catch(function (error) {
                console.error(
                    "Employee header profile error:",
                    error
                );
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
        fetchCurrentUserProfile().then(function (res) {
            const p = res.data;
            // const fullName = `${p.firstName} ${p.lastName}`.trim();

            const initials =
                `${p.firstName || ""}${p.lastName || ""}`
                    .trim()
                    .split(/\s+/)
                    .map(function (name) {
                        return name.charAt(0);
                    })
                    .join("")
                    .toUpperCase();

            // Dashboard Title show on Welcome Back and Username-----

            safeSetText(
                "dashboardWelcome",
                `Welcome back, ${p.firstName || "Employee"}!`
            );

            safeSetText(
                "userInitials",
                initials || "Somthing Wrong"
            );

        });
        function safeSetText(elementId, text) {
            const el = document.getElementById(elementId);
            if (el) {
                el.textContent = text;
            } else {
                console.warn(`Element #${elementId} not found — skipping textContent update.`);
            }
        }

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

    // ================================
    //         Attendance Stat Cards
    // ================================
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
    // ===============================
    //      Attendance table Show 
    // ===============================

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
    // ATTENDANCE CALENDAR View data
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
    // MY LEAVES History
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
    // Apply leave type
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

    // =====================================
    //      Apply leave from date-month
    // ======================================

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
    //=============================
    // CC To — add / remove chips
    //=============================
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

    // =====================================================
    //     Adds a CC To option in the Apply Leave form.
    // =====================================================

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

    // =============================
    //      Leave Balance Cards
    // =============================
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

    // ===========================
    //      Payroll Overview 
    // ===========================
    let myPayrollData = [];

    function loadPayroll() {
        const tbody = document.getElementById("myPayrollTableBody");
        tbody.innerHTML = `<tr><td colspan="5" class="text-center py-4">Loading...</td></tr>`;



        demoGetPayrollHistory().then(function (res) {
            myPayrollData = res.data;

            if (myPayrollData.length === 0) {
                tbody.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-muted">No payroll records found.</td></tr>`;
                return;
            }

            tbody.innerHTML = myPayrollData.map(function (p, index) {
                const statusBadge = p.status === "PAID" ? "success" : "warning";

                return `
                <tr>
                    <td>${escapeHtml(p.month)}</td>
                    <td>₹${p.netPay.toLocaleString()}</td>
                    <td><span class="badge text-bg-${statusBadge}">${escapeHtml(p.status)}</span></td>
                    <td>
                        <button type="button" class="btn btn-sm btn-outline-primary"
                            data-payroll-index="${index}">
                            View Slip
                        </button>
                    </td>
                    <td>
                        <button type="button"
                            class="btn btn-sm btn-outline-primary"
                            data-payroll-download-index="${index}">
                            Download
                        </button>
                    </td>
                </tr>

            `;
            }).join("");

            tbody.querySelectorAll("[data-payroll-index]").forEach(function (btn) {
                btn.addEventListener("click", function () {
                    const record = myPayrollData[this.dataset.payrollIndex];
                    openPayrollSlipModal(record);
                });
            });

            tbody.querySelectorAll("[data-payroll-download-index]").forEach(function (btn) {
                btn.addEventListener("click", function () {
                    const record = myPayrollData[this.dataset.payrollDownloadIndex];

                    if (record.status !== "PAID") {
                        Swal.fire({
                            icon: "warning",
                            title: "Payslip not available yet",
                            text: `Payroll for ${record.month} is still ${record.status}. Download will be available once it is marked as Paid.`,
                            confirmButtonColor: "#17a2b8"
                        });
                        return;
                    }

                    Swal.fire({
                        icon: "success",
                        title: "Chal BSDK.....",
                        confirmButtonColor: "#17a2b8",
                        timer: 2000,
                        timerProgressBar: true,
                        showConfirmButton: false,
                        customClass: {
                            title: "small-swal-title"
                        }
                    });
                });
            });
        });
    }

    // ==============================================================
    //      Opens the payslip modal for the selected record.
    // ==============================================================

    function openPayrollSlipModal(p) {
        document.getElementById("payrollSlipModalTitle").textContent =
            `Payslip — ${p.month}`;

        document.getElementById("payrollSlipModalBody").innerHTML = `
        <p><strong>Month:</strong> ${escapeHtml(p.month)}</p>
        <p><strong>Basic:</strong> ₹${p.basic.toLocaleString()}</p>
        <p><strong>Allowances:</strong> ₹${p.allowances.toLocaleString()}</p>
        <p><strong>Deductions:</strong> ₹${p.deductions.toLocaleString()}</p>
        <hr>
        <p><strong>Net Pay:</strong> ₹${p.netPay.toLocaleString()}</p>
        <p><strong>Status:</strong> ${escapeHtml(p.status)}</p>
    `;

        const modal = new bootstrap.Modal(
            document.getElementById("payrollSlipModal")
        );
        modal.show();
    }

    // =========================
    //      Payslip List
    // =========================
    function loadPayslips() {
        const tbody = document.getElementById("payslipsTableBody");
        tbody.innerHTML = `<tr><td colspan="4" class="text-center py-4">Loading...</td></tr>`;
    }

    // =========================
    // ATTENDANCE CORRECTIONS
    // =========================
    const newCorrectionButton = document.getElementById("newCorrectionButton");
    const correctionForm = document.getElementById("correctionForm");
    const correctionFormMessage = document.getElementById("correctionFormMessage");

    newCorrectionButton.addEventListener("click", function () {
        correctionForm.reset();
        correctionFormMessage.innerHTML = "";

        const modal = new bootstrap.Modal(document.getElementById("correctionModal"));
        modal.show();
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
            const modal = bootstrap.Modal.getInstance(document.getElementById("correctionModal"));
            if (modal) modal.hide();

            Swal.fire({
                icon: "success",
                title: res.data.message,
                confirmButtonColor: "#17a2b8"
            });

            loadCorrections();
        });
    });

    // ===================================================
    //      Displays correction statistics in cards.
    // ====================================================

    function renderCorrectionStats(rows) {
        const counts = { PENDING: 0, APPROVED: 0, REJECTED: 0 };

        rows.forEach(function (r) {
            const status = (r.status || "").toUpperCase();
            if (counts.hasOwnProperty(status)) {
                counts[status]++;
            }
        });

        document.getElementById("corrStatPending").textContent = counts.PENDING;
        document.getElementById("corrStatApproved").textContent = counts.APPROVED;
        document.getElementById("corrStatRejected").textContent = counts.REJECTED;
        document.getElementById("corrStatTotal").textContent = rows.length;
    }

    // ================================================
    //      Shows attendance correction requests.
    // ================================================

    function loadCorrections() {
        const tbody = document.getElementById("correctionsTableBody");
        tbody.innerHTML = `<tr><td colspan="4" class="text-center py-4">Loading...</td></tr>`;

        demoGetCorrections().then(function (res) {
            const rows = res.data;

            renderCorrectionStats(rows);

            if (rows.length === 0) {
                tbody.innerHTML = `<tr><td colspan="4" class="text-center py-4 text-muted">No correction requests yet. Click "+ New Request" to submit one.</td></tr>`;
                return;
            }

            const statusClassMap = {
                PENDING: "LATE",
                APPROVED: "PRESENT",
                REJECTED: "ABSENT"
            };

            tbody.innerHTML = rows.map(function (r) {
                const statusKey = (r.status || "").toUpperCase();
                const badgeClass = statusClassMap[statusKey] || "LEAVE";

                return `
                    <tr>
                        <td>${escapeHtml(r.date)}</td>
                        <td>${escapeHtml(r.change)}</td>
                        <td>${escapeHtml(r.reason)}</td>
                        <td><span class="status-badge ${badgeClass}">${escapeHtml(r.status)}</span></td>
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

    // ==========================================
    //      Loads the employee profile section.
    // ==========================================

    function loadProfile() {
        const card = document.getElementById("profileCard");

        card.innerHTML = `
        <div class="profile-loading">
            Loading profile...
        </div>
         `;

        fetchCurrentUserProfile().then(function (res) {
            const p = res.data;

            const fullName = `${p.firstName} ${p.lastName}`.trim();

            const initials =
                `${p.firstName.charAt(0)}${p.lastName.charAt(0)}`
                    .toUpperCase();

            card.innerHTML = `
            <div class="employee-profile">

             <!-- PROFILE HEADER -->
                <div class="profile-header">

                <div class="profile-avatar" id="profileAvatarClickable">



                    ${p.profileImage
                    ? `<img src="${p.profileImage}"
                        alt="Employee Profile"
                        class="profile-avatar-image"
                        onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">`
                    : "<img src=''>"
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
            <button type="button" id="viewFullProfileButton"
                class="btn btn-outline-primary profile-header-action-btn">
                        Infomation
            </button>

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

                          <div class="profile-info-item">
                            <span class="profile-label">
                                Birthday
                            </span>
                            <strong>
                                ${escapeHtml(p.dateOfBirth)}
                            </strong>
                        </div>

                        <div class="profile-info-item">
                            <span class="profile-label">
                                Gender
                            </span>
                            <strong>
                                ${escapeHtml(p.gender)}
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

            const resetPasswordToggleButton =
                document.getElementById("resetPasswordToggleButton");

            const resetPasswordMessage =
                document.getElementById("resetPasswordMessage");

            if (resetPasswordToggleButton) {
                resetPasswordToggleButton.addEventListener("click", function () {
                    resetPasswordMessage.innerHTML = "";

                    const modal = new bootstrap.Modal(
                        document.getElementById("resetPasswordModal")
                    );
                    modal.show();
                });
            }

            const viewFullProfileButton =
                document.getElementById("viewFullProfileButton");

            if (viewFullProfileButton) {
                viewFullProfileButton.addEventListener("click", function () {
                    showView("profile-overview");
                });
            }

            currentProfileInitials = initials;

            const profileAvatarClickable = document.getElementById("profileAvatarClickable");
            if (profileAvatarClickable) {
                profileAvatarClickable.addEventListener("click", function () {
                    openViewPhotoModal(p.profileImage, initials);
                });
            }
        });
    }


    // =======================================
    //     View Phote Model in profile
    // =======================================

    function openViewPhotoModal(imageUrl, initialsText) {
        const img = document.getElementById("viewPhotoImage");
        const fallback = document.getElementById("viewPhotoFallback");

        if (imageUrl) {
            img.src = imageUrl;
            img.classList.remove("d-none");
            fallback.style.display = "none";
        } else {
            img.classList.add("d-none");
            fallback.textContent = initialsText || "?";
            fallback.style.display = "flex";
        }

        const modal = new bootstrap.Modal(document.getElementById("viewPhotoModal"));
        modal.show();
    }

    // =========================================
    //      Uploade Phote Model
    // =========================================

    let selectedPhotoFile = null;

    function openUploadPhotoModal() {
        selectedPhotoFile = null;

        document.getElementById("uploadPhotoInput").value = "";
        document.getElementById("uploadPhotoMessage").innerHTML = "";
        document.getElementById("savePhotoButton").disabled = true;

        const preview = document.getElementById("uploadPhotoPreview");
        const previewFallback = document.getElementById("uploadPhotoPreviewFallback");

        preview.classList.add("d-none");
        previewFallback.style.display = "flex";
        previewFallback.textContent = currentProfileInitials || "?";

        const modal = new bootstrap.Modal(document.getElementById("uploadPhotoModal"));
        modal.show();
    }

    const openUploadPhotoButton = document.getElementById("openUploadPhotoButton");
    if (openUploadPhotoButton) {
        openUploadPhotoButton.addEventListener("click", function () {
            const viewModal = bootstrap.Modal.getInstance(document.getElementById("viewPhotoModal"));
            if (viewModal) viewModal.hide();

            openUploadPhotoModal();
        });
    }

    const uploadPhotoInput = document.getElementById("uploadPhotoInput");
    if (uploadPhotoInput) {
        uploadPhotoInput.addEventListener("change", function () {
            const file = this.files[0];
            if (!file) return;

            selectedPhotoFile = file;

            const reader = new FileReader();
            reader.onload = function (e) {
                const preview = document.getElementById("uploadPhotoPreview");
                const previewFallback = document.getElementById("uploadPhotoPreviewFallback");

                preview.src = e.target.result;
                preview.classList.remove("d-none");
                previewFallback.style.display = "none";

                document.getElementById("savePhotoButton").disabled = false;
            };
            reader.readAsDataURL(file);
        });
    }

    const savePhotoButton = document.getElementById("savePhotoButton");
    if (savePhotoButton) {
        savePhotoButton.addEventListener("click", function () {
            if (!selectedPhotoFile) return;

            const messageBox = document.getElementById("uploadPhotoMessage");
            messageBox.innerHTML = "";
            savePhotoButton.disabled = true;

            const reader = new FileReader();
            reader.onload = function (e) {
                const localPreviewUrl = e.target.result;

                uploadProfilePhoto(selectedPhotoFile).then(function () {
                    overriddenProfileImage = localPreviewUrl;

                    const modal = bootstrap.Modal.getInstance(document.getElementById("uploadPhotoModal"));
                    if (modal) modal.hide();

                    Swal.fire({
                        icon: "success",
                        title: "Profile photo updated",
                        confirmButtonColor: "#17a2b8"
                    });

                    loadHeaderEmployeeProfile();
                    refreshSidebarProfileImage();

                    const profileViewEl = document.getElementById("profileView");
                    if (profileViewEl && !profileViewEl.classList.contains("d-none")) {
                        loadProfile();
                    }
                }).catch(function (error) {
                    console.error("Photo upload failed:", error.responseData || error);
                    messageBox.innerHTML =
                        `<div class="custom-alert error">${escapeHtml(error.message || "Upload failed.")}</div>`;
                    savePhotoButton.disabled = false;
                });
            };
            reader.readAsDataURL(selectedPhotoFile);
        });
    }

    // =================================================================
    //      Loads and displays the employee profile overview.
    // =================================================================

    function loadProfileOverview() {
        const grid = document.getElementById("profileOverviewGrid");
        grid.innerHTML = `<p class="text-muted">Loading...</p>`;

        Promise.all([
            demoGetPersonalInformation(),
            fetchMyEmergencyContacts(),
            demoGetFamilyMembers(),
            demoGetEducation(),
            demoGetExperience(),
            demoGetJoiningDetails(),
            demoGetWorkPosition(),
            demoGetExitDetails(),
            demoGetNominations(),
            demoGetSkills()
        ]).then(function (results) {

            currentPersonalInfo = results[0].data;
            const emergencyContacts = results[1].data;
            const familyMembers = results[2].data;
            const education = results[3].data;
            const experience = results[4].data;
            currentJoiningDetails = results[5].data;
            const workPosition = results[6].data;
            const exitDetails = results[7].data;
            const nominations = results[8].data;
            const skills = results[9].data;

            grid.innerHTML = `

                <div class="overview-card">
                    <div class="overview-card-header">
                        <h5>Personal Information</h5>
                        <button type="button" class="overview-edit-btn" id="overviewEditPersonalInfo" title="Edit">✎</button>
                    </div>
                    <div class="overview-card-body overview-kv-grid">
                        <div class="overview-kv"><span>Height</span><strong>${escapeHtml(currentPersonalInfo.height) || "--"}</strong></div>
                        <div class="overview-kv"><span>Weight</span><strong>${escapeHtml(currentPersonalInfo.weight) || "--"}</strong></div>
                        <div class="overview-kv"><span>Blood Group</span><strong>${escapeHtml(currentPersonalInfo.bloodGroup) || "--"}</strong></div>
                        <div class="overview-kv"><span>Shift</span><strong>${escapeHtml(currentPersonalInfo.shift) || "--"}</strong></div>
                    </div>
                </div>

                <div class="overview-card">
                    <div class="overview-card-header">
                        <h5>Emergency Information</h5>
                        <button type="button" class="overview-nav-btn" data-goto-view="emergency-information" title="Manage">›</button>
                    </div>
                    <div class="overview-card-body">
                        <p class="overview-summary-text">${emergencyContacts.length} contact(s) added${emergencyContacts.length ? " — " + escapeHtml(emergencyContacts[0].name) : ""}</p>
                    </div>
                </div>

                <div class="overview-card">
                    <div class="overview-card-header">
                        <h5>Bank Information</h5>
                    </div>
                    <div class="overview-card-body">
                        <p class="overview-summary-text text-muted">Coming soon.</p>
                    </div>
                </div>

                <div class="overview-card">
                    <div class="overview-card-header">
                        <h5>Family Information</h5>
                        <button type="button" class="overview-nav-btn" data-goto-view="family-information" title="Manage">›</button>
                    </div>
                    <div class="overview-card-body">
                        <p class="overview-summary-text">${familyMembers.length} member(s) added${familyMembers.length ? " — " + escapeHtml(familyMembers[0].name) : ""}</p>
                    </div>
                </div>

                <div class="overview-card">
                    <div class="overview-card-header">
                        <h5>Education Information</h5>
                        <button type="button" class="overview-nav-btn" data-goto-view="education-information" title="Manage">›</button>
                    </div>
                    <div class="overview-card-body">
                        <p class="overview-summary-text">${education.length} record(s)${education.length ? " — " + escapeHtml(education[0].qualification) : ""}</p>
                    </div>
                </div>

                <div class="overview-card">
                    <div class="overview-card-header">
                        <h5>Experience Information</h5>
                        <button type="button" class="overview-nav-btn" data-goto-view="experience-information" title="Manage">›</button>
                    </div>
                    <div class="overview-card-body">
                        <p class="overview-summary-text">${experience.length} record(s)${experience.length ? " — " + escapeHtml(experience[0].organization) : ""}</p>
                    </div>
                </div>

                <div class="overview-card">
                    <div class="overview-card-header">
                        <h5>Joining Details</h5>
                        <button type="button" class="overview-edit-btn" id="overviewEditJoiningDetails" title="Edit">✎</button>
                    </div>
                    <div class="overview-card-body overview-kv-grid">
                        <div class="overview-kv"><span>Date of Joining</span><strong>${escapeHtml(currentJoiningDetails.dateOfJoining) || "--"}</strong></div>
                        <div class="overview-kv"><span>Status</span><strong>${escapeHtml(currentJoiningDetails.status) || "--"}</strong></div>
                    </div>
                </div>

                <div class="overview-card">
                    <div class="overview-card-header">
                        <h5>Work Position</h5>
                    </div>
                    <div class="overview-card-body overview-kv-grid">
                        <div class="overview-kv"><span>Department</span><strong>${escapeHtml(workPosition.departmentName) || "--"}</strong></div>
                        <div class="overview-kv"><span>Grade Level</span><strong>${escapeHtml(workPosition.gradeLevel) || "--"}</strong></div>
                    </div>
                </div>

                <div class="overview-card">
                    <div class="overview-card-header">
                        <h5>Exit Details</h5>
                    </div>
                    <div class="overview-card-body overview-kv-grid">
                        <div class="overview-kv"><span>Separation Mode</span><strong>${escapeHtml(exitDetails.separationMode) || "--"}</strong></div>
                        <div class="overview-kv"><span>Last Working Date</span><strong>${escapeHtml(exitDetails.lastWorkingDate) || "--"}</strong></div>
                    </div>
                </div>

                <div class="overview-card">
                    <div class="overview-card-header">
                        <h5>Nomination Information</h5>
                        <button type="button" class="overview-nav-btn" data-goto-view="nomination-information" title="Manage">›</button>
                    </div>
                    <div class="overview-card-body">
                        <p class="overview-summary-text">${nominations.length} nomination(s) added</p>
                    </div>
                </div>

                <div class="overview-card">
                    <div class="overview-card-header">
                        <h5>Skills</h5>
                        <button type="button" class="overview-nav-btn" data-goto-view="skills" title="Manage">›</button>
                    </div>
                    <div class="overview-card-body">
                        ${skills.length
                    ? `<div class="cc-chips">${skills.map(function (s) { return `<span class="cc-chip">${escapeHtml(s)}</span>`; }).join("")}</div>`
                    : `<p class="overview-summary-text text-muted">No skills added yet.</p>`
                }
                    </div>
                </div>

            `;

            const overviewEditPersonalInfo = document.getElementById("overviewEditPersonalInfo");
            if (overviewEditPersonalInfo) {
                overviewEditPersonalInfo.addEventListener("click", openPersonalInfoModal);
            }

            const overviewEditJoiningDetails = document.getElementById("overviewEditJoiningDetails");
            if (overviewEditJoiningDetails) {
                overviewEditJoiningDetails.addEventListener("click", openJoiningDetailsModal);
            }

            grid.querySelectorAll("[data-goto-view]").forEach(function (btn) {
                btn.addEventListener("click", function () {
                    showView(this.dataset.gotoView);
                });
            });

        });
    }

    // =========================
    // RESET PASSWORD (from Profile)
    // RESET PASSWORD — SUBMIT (modal se)
    // =========================
    const resetPasswordForm =
        document.getElementById("resetPasswordForm");

    if (resetPasswordForm) {
        resetPasswordForm.addEventListener("submit", function (e) {
            e.preventDefault();

            const resetPasswordMessage =
                document.getElementById("resetPasswordMessage");

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

            // apiRequest("/api/auth/change-password", {
            //     method: "POST",
            //     body: JSON.stringify({
            //         oldPassword: currentPassword,
            //         newPassword: newPassword
            //     })

            // }).then(function (res) {
            changeEmployeePassword(currentPassword, newPassword).then(function (res) {

                const modalEl = document.getElementById("resetPasswordModal");
                const modal = bootstrap.Modal.getInstance(modalEl);

                if (modal) {
                    modal.hide();
                }

                resetPasswordForm.reset();
                resetPasswordMessage.innerHTML = "";

                document.getElementById("confirmPasswordFeedback").textContent = "";
                document.getElementById("confirmPasswordField").classList.remove("is-valid", "is-invalid");

                Swal.fire({
                    icon: "success",
                    title: escapeHtml(res.message),
                    confirmButtonColor: "#17a2b8",
                    timer: 2000,
                    timerProgressBar: true,
                    showConfirmButton: false
                });

            }).catch(function (error) {
                resetPasswordMessage.innerHTML =
                    `<div class="custom-alert error">${escapeHtml(error.message)}</div>`;
            });

        });
    }

    // ==============================================================
    //      Validates the password confirmation in real time.
    // ==============================================================

    function checkPasswordMatchLive() {
        const newPasswordField = document.getElementById("newPasswordField");
        const confirmPasswordField = document.getElementById("confirmPasswordField");
        const feedback = document.getElementById("confirmPasswordFeedback");

        if (!confirmPasswordField.value) {
            feedback.textContent = "";
            feedback.className = "password-match-feedback";
            confirmPasswordField.classList.remove("is-valid", "is-invalid");
            return;
        }

        if (newPasswordField.value === confirmPasswordField.value) {
            feedback.textContent = "✔ Passwords match";
            feedback.className = "password-match-feedback match";
            confirmPasswordField.classList.remove("is-invalid");
            confirmPasswordField.classList.add("is-valid");
        } else {
            feedback.textContent = "✘ Passwords do not match";
            feedback.className = "password-match-feedback mismatch";
            confirmPasswordField.classList.remove("is-valid");
            confirmPasswordField.classList.add("is-invalid");
        }
    }

    const newPasswordFieldForLiveCheck = document.getElementById("newPasswordField");
    const confirmPasswordFieldForLiveCheck = document.getElementById("confirmPasswordField");

    if (newPasswordFieldForLiveCheck && confirmPasswordFieldForLiveCheck) {
        newPasswordFieldForLiveCheck.addEventListener("input", checkPasswordMatchLive);
        confirmPasswordFieldForLiveCheck.addEventListener("input", checkPasswordMatchLive);
    }

    // =========================
    // INITIAL VIEW
    // =========================
    showView("dashboard");

    // ==============================
    // Mobile View Responsive 
    // ==============================
    const mobileMenuBtn = document.getElementById("mobileMenuBtn");
    const dashboardSidebarEl = document.getElementById("dashboardSidebar");

    if (mobileMenuBtn && dashboardSidebarEl) {
        mobileMenuBtn.addEventListener("click", function (e) {
            e.stopPropagation();
            dashboardSidebarEl.classList.toggle("mobile-open");
        });

        document.addEventListener("click", function (e) {
            if (
                dashboardSidebarEl.classList.contains("mobile-open") &&
                !dashboardSidebarEl.contains(e.target) &&
                e.target !== mobileMenuBtn
            ) {
                dashboardSidebarEl.classList.remove("mobile-open");
            }
        });

        dashboardSidebarEl.querySelectorAll("[data-view]").forEach(function (btn) {
            btn.addEventListener("click", function () {
                if (window.innerWidth < 768) {
                    dashboardSidebarEl.classList.remove("mobile-open");
                }
            });
        });
    }

    // =======================================================================
    //      Updates the sidebar avatar after the profile photo changes.
    // =======================================================================
    function refreshSidebarProfileImage() {
        const sidebarImage = document.getElementById("sidebarProfileImage");
        const sidebarInitials = document.getElementById("sidebarInitials");

        if (!sidebarImage || !sidebarInitials) {
            console.warn(
                "Sidebar photo elements missing — sidebarProfileImage:",
                !!sidebarImage, "| sidebarInitials:", !!sidebarInitials
            );
            return;
        }
    }


    // =====================================================
    //      Opens the employee joining details modal.
    // =====================================================

    let currentJoiningDetails = null;

    function loadJoiningDetails() {
        const card = document.getElementById("joiningDetailsCard");
        card.innerHTML = `<p class="text-muted">Loading...</p>`;

        demoGetJoiningDetails().then(function (res) {
            currentJoiningDetails = res.data;
            const d = currentJoiningDetails;

            card.innerHTML = `
                <div class="profile-info-grid">
                    <div class="profile-info-item">
                        <span class="profile-label">Date of Joining</span>
                        <strong>${escapeHtml(d.dateOfJoining)}</strong>
                    </div>
                    <div class="profile-info-item">
                        <span class="profile-label">Confirmation Date</span>
                        <strong>${escapeHtml(d.confirmationDate)}</strong>
                    </div>
                    <div class="profile-info-item">
                        <span class="profile-label">Status</span>
                        <strong>${escapeHtml(d.status)}</strong>
                    </div>
                </div>
            `;
        });
    }
    // =====================
    // Open Joining Model
    // =====================

    function openJoiningDetailsModal() {
        if (!currentJoiningDetails) return;

        document.getElementById("dateOfJoiningField").value = currentJoiningDetails.dateOfJoining || "";
        document.getElementById("confirmationDateField").value = currentJoiningDetails.confirmationDate || "";
        document.getElementById("joiningStatusField").value = currentJoiningDetails.status || "Active";
        document.getElementById("joiningDetailsFormMessage").innerHTML = "";

        const modal = new bootstrap.Modal(document.getElementById("joiningDetailsModal"));
        modal.show();
    }

    const editJoiningDetailsButton = document.getElementById("editJoiningDetailsButton");
    if (editJoiningDetailsButton) {
        editJoiningDetailsButton.addEventListener("click", openJoiningDetailsModal);
    }

    const joiningDetailsForm = document.getElementById("joiningDetailsForm");
    if (joiningDetailsForm) {
        joiningDetailsForm.addEventListener("submit", function (e) {
            e.preventDefault();

            const payload = {
                dateOfJoining: document.getElementById("dateOfJoiningField").value,
                confirmationDate: document.getElementById("confirmationDateField").value,
                status: document.getElementById("joiningStatusField").value
            };

            demoUpdateJoiningDetails(payload).then(function (res) {
                const modal = bootstrap.Modal.getInstance(document.getElementById("joiningDetailsModal"));
                if (modal) modal.hide();

                Swal.fire({
                    icon: "success",
                    title: res.data.message,
                    confirmButtonColor: "#17a2b8"
                });

                loadJoiningDetails();
            });
        });
    }

    // ===============================================
    //      View work position only section
    // ===============================================

    function loadWorkPosition() {
        const card = document.getElementById("workPositionCard");
        card.innerHTML = `<p class="text-muted">Loading...</p>`;

        demoGetWorkPosition().then(function (res) {
            const d = res.data;

            card.innerHTML = `
                <div class="profile-info-grid">
                    <div class="profile-info-item">
                        <span class="profile-label">Department</span>
                        <strong>${escapeHtml(d.departmentName) || "--"}</strong>
                    </div>
                    <div class="profile-info-item">
                        <span class="profile-label">Designation</span>
                        <strong>${escapeHtml(d.designation) || "--"}</strong>
                    </div>
                    <div class="profile-info-item">
                        <span class="profile-label">Grade Level</span>
                        <strong>${escapeHtml(d.gradeLevel) || "--"}</strong>
                    </div>
                </div>
            `;
        });
    }


    // ===========================================
    //      Exit details View only Section
    // ===========================================

    function loadExitDetails() {
        const card = document.getElementById("exitDetailsCard");
        card.innerHTML = `<p class="text-muted">Loading...</p>`;

        demoGetExitDetails().then(function (res) {
            const d = res.data;

            card.innerHTML = `
                <div class="profile-info-grid">
                    <div class="profile-info-item">
                        <span class="profile-label">Separation Mode</span>
                        <strong>${escapeHtml(d.separationMode) || "--"}</strong>
                    </div>
                    <div class="profile-info-item">
                        <span class="profile-label">Last Working Date</span>
                        <strong>${escapeHtml(d.lastWorkingDate) || "--"}</strong>
                    </div>
                </div>
            `;
        });
    }


    // ==================================================================================================
    //      Renders the nomination table and opens the nomination modal for a selected record.
    // ==================================================================================================

    let nominationData = [];

    function loadNominationInformation() {
        const tbody = document.getElementById("nominationTableBody");
        tbody.innerHTML = `<tr><td colspan="4" class="text-center py-4">Loading...</td></tr>`;

        demoGetNominations().then(function (res) {
            nominationData = res.data;
            renderNominationTable();
        });
    }

    function renderNominationTable() {
        const tbody = document.getElementById("nominationTableBody");

        if (nominationData.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" class="text-center py-4 text-muted">No nominations added yet.</td></tr>`;
            return;
        }

        tbody.innerHTML = nominationData.map(function (n) {
            return `
                <tr>
                    <td>${escapeHtml(n.nominationFor)}</td>
                    <td>${escapeHtml(n.familyMember)}</td>
                    <td>${n.percentage}%</td>
                    <td>
                        <button type="button" class="btn btn-sm btn-outline-primary" data-edit-nomination="${n.id}">Edit</button>
                        <button type="button" class="btn btn-sm btn-outline-danger" data-delete-nomination="${n.id}">Delete</button>
                    </td>
                </tr>
            `;
        }).join("");

        tbody.querySelectorAll("[data-edit-nomination]").forEach(function (btn) {
            btn.addEventListener("click", function () {
                openNominationModal(this.dataset.editNomination);
            });
        });

        tbody.querySelectorAll("[data-delete-nomination]").forEach(function (btn) {
            btn.addEventListener("click", function () {
                const id = this.dataset.deleteNomination;

                Swal.fire({
                    icon: "warning",
                    title: "Remove this nomination?",
                    showCancelButton: true,
                    confirmButtonText: "Yes, remove",
                    confirmButtonColor: "#b3261e"
                }).then(function (result) {
                    if (result.isConfirmed) {
                        demoDeleteNomination(id).then(function () {
                            nominationData = nominationData.filter(function (n) {
                                return String(n.id) !== String(id);
                            });
                            renderNominationTable();
                        });
                    }
                });
            });
        });
    }

    function openNominationModal(id) {
        const modalTitle = document.getElementById("nominationModalTitle");
        document.getElementById("nominationFormMessage").innerHTML = "";

        if (id) {
            const record = nominationData.find(function (n) {
                return String(n.id) === String(id);
            });

            modalTitle.textContent = "Edit Nomination";
            document.getElementById("nominationId").value = record.id;
            document.getElementById("nominationFor").value = record.nominationFor;
            document.getElementById("nominationFamilyMember").value = record.familyMember;
            document.getElementById("nominationPercentage").value = record.percentage;
        } else {
            modalTitle.textContent = "Add Nomination";
            document.getElementById("nominationForm").reset();
            document.getElementById("nominationId").value = "";
        }

        const modal = new bootstrap.Modal(document.getElementById("nominationModal"));
        modal.show();
    }

    const addNominationButton = document.getElementById("addNominationButton");
    if (addNominationButton) {
        addNominationButton.addEventListener("click", function () {
            openNominationModal(null);
        });
    }

    const nominationForm = document.getElementById("nominationForm");
    if (nominationForm) {
        nominationForm.addEventListener("submit", function (e) {
            e.preventDefault();

            const id = document.getElementById("nominationId").value;

            const payload = {
                nominationFor: document.getElementById("nominationFor").value,
                familyMember: document.getElementById("nominationFamilyMember").value.trim(),
                percentage: Number(document.getElementById("nominationPercentage").value)
            };

            const apiCall = id
                ? demoUpdateNomination(id, payload)
                : demoAddNomination(payload);

            apiCall.then(function (res) {
                const modal = bootstrap.Modal.getInstance(document.getElementById("nominationModal"));
                if (modal) modal.hide();

                Swal.fire({
                    icon: "success",
                    title: res.data.message,
                    confirmButtonColor: "#17a2b8"
                });

                loadNominationInformation();
            });
        });
    }


    // =================================================================
    //      Displays skills as chips and saves the updated skills.
    // =================================================================

    let skillsList = [];

    function loadSkills() {
        const container = document.getElementById("skillsChipsList");
        container.innerHTML = `<p class="text-muted">Loading...</p>`;

        demoGetSkills().then(function (res) {
            skillsList = res.data;
            renderSkillsChips();
        });
    }

    function renderSkillsChips() {
        const container = document.getElementById("skillsChipsList");

        if (skillsList.length === 0) {
            container.innerHTML = `<p class="text-muted">No skills added yet.</p>`;
            return;
        }

        container.innerHTML = skillsList.map(function (skill, index) {
            return `
                <span class="cc-chip">
                    ${escapeHtml(skill)}
                    <button type="button" data-remove-skill="${index}">&times;</button>
                </span>
            `;
        }).join("");

        container.querySelectorAll("[data-remove-skill]").forEach(function (btn) {
            btn.addEventListener("click", function () {
                const index = Number(this.dataset.removeSkill);
                skillsList.splice(index, 1);
                renderSkillsChips();
                saveSkills();
            });
        });
    }

    function saveSkills() {
        demoUpdateSkills(skillsList);
    }

    const addSkillButton = document.getElementById("addSkillButton");
    if (addSkillButton) {
        addSkillButton.addEventListener("click", function () {
            const input = document.getElementById("newSkillInput");
            const value = input.value.trim();

            if (!value) return;

            if (!skillsList.includes(value)) {
                skillsList.push(value);
                renderSkillsChips();
                saveSkills();
            }

            input.value = "";
        });
    }


    // =====================================================
    //      Opens the personal information modal.
    // =====================================================

    let currentPersonalInfo = null;

    function loadPersonalInformation() {
        const card = document.getElementById("personalInfoCard");
        card.innerHTML = `<p class="text-muted">Loading...</p>`;

        demoGetPersonalInformation().then(function (res) {
            currentPersonalInfo = res.data;
            const d = currentPersonalInfo;

            card.innerHTML = `
                <div class="profile-info-grid">
                    <div class="profile-info-item">
                        <span class="profile-label">Height</span>
                        <strong>${escapeHtml(d.height) || "--"}</strong>
                    </div>
                    <div class="profile-info-item">
                        <span class="profile-label">Weight</span>
                        <strong>${escapeHtml(d.weight) || "--"}</strong>
                    </div>
                    <div class="profile-info-item">
                        <span class="profile-label">Passport No</span>
                        <strong>${escapeHtml(d.passportNo) || "--"}</strong>
                    </div>
                    <div class="profile-info-item">
                        <span class="profile-label">PAN No</span>
                        <strong>${escapeHtml(d.panNo) || "--"}</strong>
                    </div>
                    <div class="profile-info-item">
                        <span class="profile-label">Aadhar No</span>
                        <strong>${escapeHtml(d.aadharNo) || "--"}</strong>
                    </div>
                    <div class="profile-info-item">
                        <span class="profile-label">Religion</span>
                        <strong>${escapeHtml(d.religion) || "--"}</strong>
                    </div>
                    <div class="profile-info-item">
                        <span class="profile-label">Marital Status</span>
                        <strong>${escapeHtml(d.maritalStatus) || "--"}</strong>
                    </div>
                    <div class="profile-info-item">
                        <span class="profile-label">Employee Blood Group</span>
                        <strong>${escapeHtml(d.bloodGroup) || "--"}</strong>
                    </div>
                    <div class="profile-info-item">
                        <span class="profile-label">Shift</span>
                        <strong>${escapeHtml(d.shift) || "--"}</strong>
                    </div>
                </div>
            `;
        });
    }
    // ==============================
    // Profile Infomation model Open
    // ==============================

    function openPersonalInfoModal() {
        if (!currentPersonalInfo) return;

        document.getElementById("heightField").value = currentPersonalInfo.height || "";
        document.getElementById("weightField").value = currentPersonalInfo.weight || "";
        document.getElementById("passportNoField").value = currentPersonalInfo.passportNo || "";
        document.getElementById("panNoField").value = currentPersonalInfo.panNo || "";
        document.getElementById("aadharNoField").value = currentPersonalInfo.aadharNo || "";
        document.getElementById("religionField").value = currentPersonalInfo.religion || "";
        document.getElementById("maritalStatusField").value = currentPersonalInfo.maritalStatus || "Single";
        document.getElementById("bloodGroupField").value = currentPersonalInfo.bloodGroup || "O+";
        document.getElementById("shiftField").value = currentPersonalInfo.shift || "Day";
        document.getElementById("personalInfoFormMessage").innerHTML = "";

        const modal = new bootstrap.Modal(document.getElementById("personalInfoModal"));
        modal.show();
    }

    const editPersonalInfoButton = document.getElementById("editPersonalInfoButton");
    if (editPersonalInfoButton) {
        editPersonalInfoButton.addEventListener("click", openPersonalInfoModal);
    }

    const personalInfoForm = document.getElementById("personalInfoForm");
    if (personalInfoForm) {
        personalInfoForm.addEventListener("submit", function (e) {
            e.preventDefault();

            const payload = {
                height: document.getElementById("heightField").value.trim(),
                weight: document.getElementById("weightField").value.trim(),
                passportNo: document.getElementById("passportNoField").value.trim(),
                panNo: document.getElementById("panNoField").value.trim(),
                aadharNo: document.getElementById("aadharNoField").value.trim(),
                religion: document.getElementById("religionField").value.trim(),
                maritalStatus: document.getElementById("maritalStatusField").value,
                bloodGroup: document.getElementById("bloodGroupField").value,
                shift: document.getElementById("shiftField").value
            };

            demoUpdatePersonalInformation(payload).then(function (res) {
                const modal = bootstrap.Modal.getInstance(document.getElementById("personalInfoModal"));
                if (modal) modal.hide();

                Swal.fire({
                    icon: "success",
                    title: res.data.message,
                    confirmButtonColor: "#17a2b8"
                });

                loadPersonalInformation();
            });
        });
    }


    // =========================
    // EMERGENCY INFORMATION
    // =========================

    let emergencyContactsData = [];

    function loadEmergencyInformation() {
        const tbody = document.getElementById("emergencyContactsTableBody");
        tbody.innerHTML = `<tr><td colspan="7" class="text-center py-4">Loading...</td></tr>`;

        fetchMyEmergencyContacts().then(function (res) {
            emergencyContactsData = res.data;
            renderEmergencyContactsTable();
        });
    }

    function renderEmergencyContactsTable() {
        const tbody = document.getElementById("emergencyContactsTableBody");

        if (emergencyContactsData.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-muted">No emergency contacts added yet.</td></tr>`;
            return;
        }

        tbody.innerHTML = emergencyContactsData.map(function (c) {
            return `
                <tr>
                    <td>${escapeHtml(c.name)}</td>
                    <td>${escapeHtml(c.relationship)}</td>
                    <td>${escapeHtml(c.phone)}</td>
                    <td>${escapeHtml(c.email)}</td>
                    <td>${escapeHtml(c.address)}</td>
                    <td>${escapeHtml(c.email)}</td>
                    <td>
                        <button type="button" class="btn btn-sm btn-outline-primary" data-edit-emergency="${c.id}">Edit</button>
                        <button type="button" class="btn btn-sm btn-outline-danger" data-delete-emergency="${c.id}">Delete</button>
                    </td>
                </tr>
            `;
        }).join("");

        tbody.querySelectorAll("[data-edit-emergency]").forEach(function (btn) {
            btn.addEventListener("click", function () {
                openEmergencyContactModal(this.dataset.editEmergency);
            });
        });

        tbody.querySelectorAll("[data-delete-emergency]").forEach(function (btn) {
            btn.addEventListener("click", function () {
                const id = this.dataset.deleteEmergency;

                Swal.fire({
                    icon: "warning",
                    title: "Remove this contact?",
                    showCancelButton: true,
                    confirmButtonText: "Yes, remove",
                    confirmButtonColor: "#b3261e"
                }).then(function (result) {
                    if (result.isConfirmed) {
                        demoDeleteEmergencyContact(id).then(function () {
                            emergencyContactsData = emergencyContactsData.filter(function (c) {
                                return String(c.id) !== String(id);
                            });
                            renderEmergencyContactsTable();
                        });
                    }
                });
            });
            tbody.querySelectorAll("[data-delete-emergency]").forEach(function (btn) {
                btn.addEventListener("click", function () {
                    const id = this.dataset.deleteEmergency;

                    Swal.fire({
                        icon: "warning",
                        title: "Remove this contact?",
                        showCancelButton: true,
                        confirmButtonText: "Yes, remove",
                        confirmButtonColor: "#b3261e"
                    }).then(function (result) {
                        if (result.isConfirmed) {
                            deleteMyEmergencyContact(id).then(function () {
                                emergencyContactsData = emergencyContactsData.filter(function (c) {
                                    return String(c.id) !== String(id);
                                });
                                renderEmergencyContactsTable();
                            }).catch(function (error) {
                                Swal.fire({
                                    icon: "error",
                                    title: "Could not remove contact",
                                    text: error.message,
                                    confirmButtonColor: "#17a2b8"
                                });
                            });
                        }
                    });
                });
            });
        });
    }

    function openEmergencyContactModal(id) {
        const modalTitle = document.getElementById("emergencyContactModalTitle");
        document.getElementById("emergencyContactFormMessage").innerHTML = "";

        if (id) {
            const contact = emergencyContactsData.find(function (c) {
                return String(c.id) === String(id);
            });

            modalTitle.textContent = "Edit Emergency Contact";
            document.getElementById("emergencyContactId").value = contact.id;
            document.getElementById("emergencyContactName").value = contact.name;
            document.getElementById("emergencyContactRelationship").value = contact.relationship;
            document.getElementById("emergencyContactPhone").value = contact.phone;
            document.getElementById("emergencyContactAddress").value = contact.address;
        } else {
            modalTitle.textContent = "Add Emergency Contact";
            document.getElementById("emergencyContactForm").reset();
            document.getElementById("emergencyContactId").value = "";
        }

        const modal = new bootstrap.Modal(document.getElementById("emergencyContactModal"));
        modal.show();
    }

    const addEmergencyContactButton = document.getElementById("addEmergencyContactButton");
    if (addEmergencyContactButton) {
        addEmergencyContactButton.addEventListener("click", function () {
            openEmergencyContactModal(null);
        });
    }

    const emergencyContactForm = document.getElementById("emergencyContactForm");
    if (emergencyContactForm) {
        emergencyContactForm.addEventListener("submit", function (e) {
            e.preventDefault();

            const id = document.getElementById("emergencyContactId").value;

            const payload = {
                name: document.getElementById("emergencyContactName").value.trim(),
                relationship: document.getElementById("emergencyContactRelationship").value.trim(),
                phone: document.getElementById("emergencyContactPhone").value.trim(),
                email: document.getElementById("emergencyContactEmail").value.trim(),
                address: document.getElementById("emergencyContactAddress").value.trim(),
                priority: Number(document.getElementById("emergencyContactPriority").value) || null
            };

            const apiCall = id
                ? updateMyEmergencyContact(id, payload)
                : addMyEmergencyContact(payload);

            apiCall.then(function (res) {
                const modal = bootstrap.Modal.getInstance(document.getElementById("emergencyContactModal"));
                if (modal) modal.hide();

                Swal.fire({
                    icon: "success",
                    title: res.message || "Emergency contact saved.",
                    confirmButtonColor: "#17a2b8"
                });

                loadEmergencyInformation();
            }).catch(function (error) {
                document.getElementById("emergencyContactFormMessage").innerHTML =
                    `<div class="custom-alert error">${escapeHtml(error.message || "Something went wrong.")}</div>`;
            });
        });
    }


    // ==========================================================================
    //      Displays education details and opens the education modal.
    // ==========================================================================

    let educationData = [];
    function loadEducationInformation() {
        const container = document.getElementById("educationCardsList");
        container.innerHTML = `<p class="text-muted">Loading...</p>`;

        demoGetEducation().then(function (res) {
            educationData = res.data;
            renderEducationCards();
        });
    }

    function renderEducationCards() {
        const container = document.getElementById("educationCardsList");

        if (educationData.length === 0) {
            container.innerHTML = `<p class="text-muted">No education records added yet.</p>`;
            return;
        }

        container.innerHTML = educationData.map(function (e) {
            return `
                <div class="education-card">

                    <div class="education-card-actions">
                        <button type="button" class="education-edit-btn" data-edit-education="${e.id}" title="Edit">✎</button>
                        <button type="button" class="education-delete-btn" data-delete-education="${e.id}" title="Delete">🗑</button>
                    </div>

                    <div class="education-card-header">
                        <div class="education-card-icon">🎓</div>
                        <div class="education-card-title">
                            <h5>${escapeHtml(e.qualification)}</h5>
                            <p>${escapeHtml(e.institution)}</p>
                        </div>
                    </div>

                    <div class="education-card-details">
                        <div class="education-detail-item">
                            <span>Roll Number</span>
                            <strong>${escapeHtml(e.rollNumber) || "--"}</strong>
                        </div>
                        <div class="education-detail-item">
                            <span>Year Of Passing</span>
                            <strong>${escapeHtml(e.year) || "--"}</strong>
                        </div>
                        <div class="education-detail-item">
                            <span>Subjects/Specialization</span>
                            <strong>${escapeHtml(e.subjects) || "--"}</strong>
                        </div>
                        <div class="education-detail-item">
                            <span>Percentage</span>
                            <strong>${escapeHtml(e.percentage) || "--"}</strong>
                        </div>
                    </div>

                </div>
            `;
        }).join("");

        container.querySelectorAll("[data-edit-education]").forEach(function (btn) {
            btn.addEventListener("click", function () {
                openEducationModal(this.dataset.editEducation);
            });
        });

        container.querySelectorAll("[data-delete-education]").forEach(function (btn) {
            btn.addEventListener("click", function () {
                const id = this.dataset.deleteEducation;

                Swal.fire({
                    icon: "warning",
                    title: "Remove this education record?",
                    showCancelButton: true,
                    confirmButtonText: "Yes, remove",
                    confirmButtonColor: "#b3261e"
                }).then(function (result) {
                    if (result.isConfirmed) {
                        demoDeleteEducation(id).then(function () {
                            educationData = educationData.filter(function (e) {
                                return String(e.id) !== String(id);
                            });
                            renderEducationCards();
                        });
                    }
                });
            });
        });
    }
    function openEducationModal(id) {
        const modalTitle = document.getElementById("educationModalTitle");
        document.getElementById("educationFormMessage").innerHTML = "";

        if (id) {
            const record = educationData.find(function (e) {
                return String(e.id) === String(id);
            });

            modalTitle.textContent = "Edit Education";
            document.getElementById("educationId").value = record.id;
            document.getElementById("educationQualification").value = record.qualification;
            document.getElementById("educationInstitution").value = record.institution;
            document.getElementById("educationRollNumber").value = record.rollNumber;
            document.getElementById("educationSubjects").value = record.subjects;
            document.getElementById("educationYear").value = record.year;
            document.getElementById("educationPercentage").value = record.percentage;
        } else {
            modalTitle.textContent = "Add Education";
            document.getElementById("educationForm").reset();
            document.getElementById("educationId").value = "";
        }

        const modal = new bootstrap.Modal(document.getElementById("educationModal"));
        modal.show();
    }

    const addEducationButton = document.getElementById("addEducationButton");
    if (addEducationButton) {
        addEducationButton.addEventListener("click", function () {
            openEducationModal(null);
        });
    }

    const educationForm = document.getElementById("educationForm");
    if (educationForm) {
        educationForm.addEventListener("submit", function (e) {
            e.preventDefault();

            const id = document.getElementById("educationId").value;

            const payload = {
                qualification: document.getElementById("educationQualification").value.trim(),
                institution: document.getElementById("educationInstitution").value.trim(),
                rollNumber: document.getElementById("educationRollNumber").value.trim(),
                subjects: document.getElementById("educationSubjects").value.trim(),
                year: document.getElementById("educationYear").value.trim(),
                percentage: document.getElementById("educationPercentage").value.trim()
            };

            const apiCall = id
                ? demoUpdateEducation(id, payload)
                : demoAddEducation(payload);

            apiCall.then(function (res) {
                const modal = bootstrap.Modal.getInstance(document.getElementById("educationModal"));
                if (modal) modal.hide();

                Swal.fire({
                    icon: "success",
                    title: res.data.message,
                    confirmButtonColor: "#17a2b8"
                });

                loadEducationInformation();
            });
        });
    }


    // ===================================================================================
    //      Displays work experience and opens the experience modal.
    // ===================================================================================

    let experienceData = [];

    function loadExperienceInformation() {
        const tbody = document.getElementById("experienceTableBody");
        tbody.innerHTML = `<tr><td colspan="10" class="text-center py-4">Loading...</td></tr>`;

        demoGetExperience().then(function (res) {
            experienceData = res.data;
            renderExperienceTable();
        });
    }

    function renderExperienceTable() {
        const tbody = document.getElementById("experienceTableBody");

        if (experienceData.length === 0) {
            tbody.innerHTML = `<tr><td colspan="10" class="text-center py-4 text-muted">No experience records added yet.</td></tr>`;
            return;
        }

        tbody.innerHTML = experienceData.map(function (x) {
            return `
                <tr>
                    <td>${escapeHtml(x.fromDate)}</td>
                    <td>${escapeHtml(x.toDate)}</td>
                    <td>${escapeHtml(x.organization)}</td>
                    <td>${escapeHtml(x.position)}</td>
                    <td>${escapeHtml(x.reasonOfLeaving)}</td>
                    <td>${escapeHtml(x.lastCtc)}</td>
                    <td>${escapeHtml(x.lastContactNo)}</td>
                    <td>${escapeHtml(x.lastReferenceNo)}</td>
                    <td>${escapeHtml(x.totalLength)}</td>
                    <td>
                        <button type="button" class="btn btn-sm btn-outline-primary" data-edit-experience="${x.id}">Edit</button>
                        <button type="button" class="btn btn-sm btn-outline-danger" data-delete-experience="${x.id}">Delete</button>
                    </td>
                </tr>
            `;
        }).join("");

        tbody.querySelectorAll("[data-edit-experience]").forEach(function (btn) {
            btn.addEventListener("click", function () {
                openExperienceModal(this.dataset.editExperience);
            });
        });

        tbody.querySelectorAll("[data-delete-experience]").forEach(function (btn) {
            btn.addEventListener("click", function () {
                const id = this.dataset.deleteExperience;

                Swal.fire({
                    icon: "warning",
                    title: "Remove this experience record?",
                    showCancelButton: true,
                    confirmButtonText: "Yes, remove",
                    confirmButtonColor: "#b3261e"
                }).then(function (result) {
                    if (result.isConfirmed) {
                        demoDeleteExperience(id).then(function () {
                            experienceData = experienceData.filter(function (x) {
                                return String(x.id) !== String(id);
                            });
                            renderExperienceTable();
                        });
                    }
                });
            });
        });
    }

    function openExperienceModal(id) {
        const modalTitle = document.getElementById("experienceModalTitle");
        document.getElementById("experienceFormMessage").innerHTML = "";

        if (id) {
            const record = experienceData.find(function (x) {
                return String(x.id) === String(id);
            });

            modalTitle.textContent = "Edit Experience";
            document.getElementById("experienceId").value = record.id;
            document.getElementById("experienceFromDate").value = record.fromDate;
            document.getElementById("experienceToDate").value = record.toDate;
            document.getElementById("experienceOrganization").value = record.organization;
            document.getElementById("experiencePosition").value = record.position;
            document.getElementById("experienceReasonOfLeaving").value = record.reasonOfLeaving;
            document.getElementById("experienceLastCtc").value = record.lastCtc;
            document.getElementById("experienceLastContactNo").value = record.lastContactNo;
            document.getElementById("experienceLastReferenceNo").value = record.lastReferenceNo;
            document.getElementById("experienceTotalLength").value = record.totalLength;
        } else {
            modalTitle.textContent = "Add Experience";
            document.getElementById("experienceForm").reset();
            document.getElementById("experienceId").value = "";
        }

        const modal = new bootstrap.Modal(document.getElementById("experienceModal"));
        modal.show();
    }

    const addExperienceButton = document.getElementById("addExperienceButton");
    if (addExperienceButton) {
        addExperienceButton.addEventListener("click", function () {
            openExperienceModal(null);
        });
    }

    const experienceForm = document.getElementById("experienceForm");
    if (experienceForm) {
        experienceForm.addEventListener("submit", function (e) {
            e.preventDefault();

            const id = document.getElementById("experienceId").value;

            const payload = {
                fromDate: document.getElementById("experienceFromDate").value,
                toDate: document.getElementById("experienceToDate").value,
                organization: document.getElementById("experienceOrganization").value.trim(),
                position: document.getElementById("experiencePosition").value.trim(),
                reasonOfLeaving: document.getElementById("experienceReasonOfLeaving").value.trim(),
                lastCtc: document.getElementById("experienceLastCtc").value.trim(),
                lastContactNo: document.getElementById("experienceLastContactNo").value.trim(),
                lastReferenceNo: document.getElementById("experienceLastReferenceNo").value.trim(),
                totalLength: document.getElementById("experienceTotalLength").value.trim()
            };

            const apiCall = id
                ? demoUpdateExperience(id, payload)
                : demoAddExperience(payload);

            apiCall.then(function (res) {
                const modal = bootstrap.Modal.getInstance(document.getElementById("experienceModal"));
                if (modal) modal.hide();

                Swal.fire({
                    icon: "success",
                    title: res.data.message,
                    confirmButtonColor: "#17a2b8"
                });

                loadExperienceInformation();
            });
        });
    }


    // ========================================================
    //      Displays the employee family details.
    // ========================================================

    let familyMembersData = [];

    function loadFamilyInformation() {
        const tbody = document.getElementById("familyMembersTableBody");
        tbody.innerHTML = `<tr><td colspan="5" class="text-center py-4">Loading...</td></tr>`;

        demoGetFamilyMembers().then(function (res) {
            familyMembersData = res.data;
            renderFamilyTable();
        });
    }

    function renderFamilyTable() {
        const tbody = document.getElementById("familyMembersTableBody");

        if (familyMembersData.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-muted">No family members added yet.</td></tr>`;
            return;
        }

        tbody.innerHTML = familyMembersData.map(function (m) {
            return `
                <tr>
                    <td>${escapeHtml(m.name)}</td>
                    <td>${escapeHtml(m.relationship)}</td>
                    <td>${escapeHtml(m.dateOfBirth)}</td>
                    <td>${escapeHtml(m.phone)}</td>
                    <td>
                        <button type="button" class="btn btn-sm btn-outline-primary" data-edit-family="${m.id}">Edit</button>
                        <button type="button" class="btn btn-sm btn-outline-danger" data-delete-family="${m.id}">Delete</button>
                    </td>
                </tr>
            `;
        }).join("");

        tbody.querySelectorAll("[data-edit-family]").forEach(function (btn) {
            btn.addEventListener("click", function () {
                openFamilyMemberModal(this.dataset.editFamily);
            });
        });

        tbody.querySelectorAll("[data-delete-family]").forEach(function (btn) {
            btn.addEventListener("click", function () {
                const id = this.dataset.deleteFamily;

                Swal.fire({
                    icon: "warning",
                    title: "Remove this family member?",
                    showCancelButton: true,
                    confirmButtonText: "Yes, remove",
                    confirmButtonColor: "#b3261e"
                }).then(function (result) {
                    if (result.isConfirmed) {
                        demoDeleteFamilyMember(id).then(function () {
                            familyMembersData = familyMembersData.filter(function (m) {
                                return String(m.id) !== String(id);
                            });
                            renderFamilyTable();
                        });
                    }
                });
            });
        });
    }

    function openFamilyMemberModal(id) {
        const modalTitle = document.getElementById("familyMemberModalTitle");
        document.getElementById("familyMemberFormMessage").innerHTML = "";

        if (id) {
            const member = familyMembersData.find(function (m) {
                return String(m.id) === String(id);
            });

            modalTitle.textContent = "Edit Family Member";
            document.getElementById("familyMemberId").value = member.id;
            document.getElementById("familyMemberName").value = member.name;
            document.getElementById("familyMemberRelationship").value = member.relationship;
            document.getElementById("familyMemberDob").value = member.dateOfBirth;
            document.getElementById("familyMemberPhone").value = member.phone;
        } else {
            modalTitle.textContent = "Add Family Member";
            document.getElementById("familyMemberForm").reset();
            document.getElementById("familyMemberId").value = "";
        }

        const modal = new bootstrap.Modal(document.getElementById("familyMemberModal"));
        modal.show();
    }

    const addFamilyMemberButton = document.getElementById("addFamilyMemberButton");
    if (addFamilyMemberButton) {
        addFamilyMemberButton.addEventListener("click", function () {
            openFamilyMemberModal(null);
        });
    }

    const familyMemberForm = document.getElementById("familyMemberForm");
    if (familyMemberForm) {
        familyMemberForm.addEventListener("submit", function (e) {
            e.preventDefault();

            const id = document.getElementById("familyMemberId").value;

            const payload = {
                name: document.getElementById("familyMemberName").value.trim(),
                relationship: document.getElementById("familyMemberRelationship").value.trim(),
                dateOfBirth: document.getElementById("familyMemberDob").value,
                phone: document.getElementById("familyMemberPhone").value.trim()
            };

            const apiCall = id
                ? demoUpdateFamilyMember(id, payload)
                : demoAddFamilyMember(payload);

            apiCall.then(function (res) {
                const modal = bootstrap.Modal.getInstance(document.getElementById("familyMemberModal"));
                if (modal) modal.hide();

                Swal.fire({
                    icon: "success",
                    title: res.data.message,
                    confirmButtonColor: "#17a2b8"
                });

                loadFamilyInformation();
            });
        });
    }


    // =============================================================================
    //      Identifies device and browser details from the user agent.
    // =============================================================================

    function parseDeviceInfo(ua) {
        if (!ua) return "Unknown device";

        let browser = "Unknown browser";
        if (ua.includes("Chrome")) {
            const match = ua.match(/Chrome\/(\d+)/);
            browser = "Chrome" + (match ? " " + match[1] : "");
        } else if (ua.includes("Firefox")) {
            browser = "Firefox";
        } else if (ua.includes("Safari") && !ua.includes("Chrome")) {
            browser = "Safari";
        } else if (ua.includes("Edg")) {
            browser = "Edge";
        }

        let os = "Unknown OS";
        if (ua.includes("Windows")) {
            os = "Windows";
        } else if (ua.includes("Android")) {
            os = "Android";
        } else if (ua.includes("Mac OS")) {
            os = "macOS";
        } else if (ua.includes("Linux")) {
            os = "Linux";
        } else if (ua.includes("iPhone") || ua.includes("iPad")) {
            os = "iOS";
        }

        const isMobile = ua.includes("Mobile");

        return `${browser} on ${os}${isMobile ? " (Mobile)" : ""}`;
    }

    // ==============================================
    //      Formats session dates for display
    // ==============================================

    function formatSessionDate(isoString) {
        if (!isoString) return "--";

        const date = new Date(isoString);
        return date.toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    }

    // ===================================================
    //      Loads and displays the active session list
    // ===================================================

    function loadSessions() {
        const body = document.getElementById("sessionsModalBody");
        body.innerHTML = `<p class="text-muted text-center py-4">Loading sessions...</p>`;

        // apiRequest("/api/sessions").then(function (res) {
        getEmployeeSessions().then(function (res) {
            const sessions = res.data || [];

            if (sessions.length === 0) {
                body.innerHTML = `<p class="text-muted text-center py-4">No active sessions found.</p>`;
                return;
            }

            body.innerHTML = sessions.map(function (s) {
                const isMobile = (s.deviceInfo || "").includes("Mobile");
                const icon = isMobile ? "📱" : "🖥️";

                return `
                    <div class="session-card ${s.current ? "session-card-current" : ""}">

                        <div class="session-card-top">
                            <div class="session-device-line">
                                <span class="session-device-icon">${icon}</span>
                                <span>${escapeHtml(s.deviceInfo)}</span>
                            </div>

                            ${s.current
                        ? `<span class="session-current-tag">Current Session</span>`
                        : `<button type="button" class="session-revoke-btn" data-revoke-session="${s.id}">Revoke</button>`
                    }
                        </div>

                        <div class="session-ip-line">
                            <strong>IP Address:</strong> ${escapeHtml(s.ipAddress)}
                        </div>

                        <hr class="session-divider">

                        <div class="session-meta-grid">
                            <div class="session-meta-item">
                                <span>Logged In</span>
                                <strong>${escapeHtml(formatSessionDate(s.createdAt))}</strong>
                            </div>
                            <div class="session-meta-item">
                                <span>Last Used</span>
                                <strong>${escapeHtml(formatSessionDate(s.lastUsedAt))}</strong>
                            </div>
                            <div class="session-meta-item">
                                <span>Expires</span>
                                <strong>${escapeHtml(formatSessionDate(s.expiryDate))}</strong>
                            </div>
                        </div>

                    </div>
                `;
            }).join("");

            body.querySelectorAll("[data-revoke-session]").forEach(function (btn) {
                btn.addEventListener("click", function () {
                    const sessionId = this.dataset.revokeSession;

                    Swal.fire({
                        icon: "warning",
                        title: "Revoke this session?",
                        text: "This device will be signed out immediately.",
                        showCancelButton: true,
                        confirmButtonText: "Yes, revoke",
                        confirmButtonColor: "#b3261e"
                    }).then(function (result) {
                        if (result.isConfirmed) {
                            revokeEmployeeSession(sessionId).then(function () {
                                Swal.fire({
                                    icon: "success",
                                    title: "Session revoked",
                                    confirmButtonColor: "#17a2b8",
                                    timer: 1500,
                                    showConfirmButton: false
                                });
                                loadSessions();
                            }).catch(function (error) {
                                Swal.fire({
                                    icon: "error",
                                    title: "Could not revoke session",
                                    text: error.message,
                                    confirmButtonColor: "#17a2b8"
                                });
                            });
                        }
                    });
                });
            });

        }).catch(function (error) {
            body.innerHTML = `<div class="custom-alert error">${escapeHtml(error.message || "Failed to load sessions.")}</div>`;
        });
    }

    const sessionsButton = document.getElementById("sessionsButton");
    if (sessionsButton) {
        sessionsButton.addEventListener("click", function () {
            const modal = new bootstrap.Modal(document.getElementById("sessionsModal"));
            modal.show();
            loadSessions();
        });
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
        if (typeof deleteCookie === "function") {
            deleteCookie("authData");
        }
        localStorage.clear();
        sessionStorage.clear();

        window.location.href = "../auth/login.html";
    });
}