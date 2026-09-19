document.addEventListener("DOMContentLoaded", function () {
    // ===============================================================================================
    //              Auth Check
    // ===============================================================================================
    const authData = getAuthData();
    if (!authData || !authData.token) {
        window.location.href = "../auth/login.html";
        return;
    }

    // ===============================================================================================
    //   FEATURED RECORD HELPER (per section)
    //   Backend me "featured" field nahi hai, isliye localStorage
    //   me client-side store kar rahe hain. Ek section me sirf
    //   ek hi record featured ho sakta hai — Profile Overview
    //   card isi record ko summary me dikhata hai.
    // ===============================================================================================
    const FEATURED_STORAGE_PREFIX = "erp_featured_";

    function getFeaturedId(sectionKey) {
        return localStorage.getItem(FEATURED_STORAGE_PREFIX + sectionKey);
    }

    function setFeaturedId(sectionKey, id) {
        if (id === null || id === undefined) {
            localStorage.removeItem(FEATURED_STORAGE_PREFIX + sectionKey);
        } else {
            localStorage.setItem(FEATURED_STORAGE_PREFIX + sectionKey, String(id));
        }
    }

    function isFeatured(sectionKey, id) {
        return String(getFeaturedId(sectionKey)) === String(id);
    }

    // ==============================================================================================
    // Use the featured record for the Overview card
    // if unavailable, use the first record in the list.
    // ==============================================================================================
    function getDisplayRecord(sectionKey, list) {
        const featuredId = getFeaturedId(sectionKey);
        if (featuredId) {
            const found = list.find(function (item) {
                return String(item.id) === String(featuredId);
            });
            if (found) return found;
        }
        return list.length ? list[0] : null;
    }

    // ===========================================================================================
    // NAVBAR / SIDEBAR USER INFO
    // (demo profile se bharenge; real backend aane par
    //  authData.user se bhi le sakte ho, admin-dashboard.js jaisa)
    // ===========================================================================================

    const leavePolicyToggle = document.getElementById("leavePolicyToggle");
    const leavePolicyDropdown = document.querySelector(".leave-policy-dropdown");

    if (leavePolicyToggle && leavePolicyDropdown) {
        leavePolicyToggle.addEventListener("click", function () {
            leavePolicyDropdown.classList.toggle("open");
        });
    }

    // ==============================================================================================
    //          Html Security Helper
    // ==============================================================================================
    function escapeHtml(value) {
        const div = document.createElement("div");
        div.textContent = value === null || value === undefined ? "" : String(value);
        return div.innerHTML;
    }

    // ==============================================================================================
    //          View Switching
    // ==============================================================================================
    const viewNames = [
        "dashboard",
        "personal-information", "emergency-information", "bank-information",
        "family-information", "education-information", "experience-information",
        "joining-details", "work-position", "exit-details",
        "nomination-information", "skills",
        "my-attendance", "attendance-calendar", "attendance-corrections",
        "my-leaves", "apply-leave", "leave-balance",
        "my-payroll", "payslips",
        "profile"
    ];

    // ==============================================================================================
    // These views are part of the “Profile family,
    //  So the profileHeaderBar stays fixed and visible on all of them
    // ==============================================================================================
    const profileFamilyViews = [
        "profile", "personal-information", "emergency-information", "bank-information",
        "family-information", "education-information", "experience-information",
        "joining-details", "work-position", "exit-details", "nomination-information", "skills"
    ];

    const views = {};
    viewNames.forEach(function (name) {
        views[name] = document.getElementById(name + "View");
    });

    const viewLoaders = {
        "dashboard": loadDashboardSummary,
        "personal-information": loadPersonalInformation,
        // "personal-information": null,
        "emergency-information": loadEmergencyInformation,
        "education-information": loadEducationInformation,
        "experience-information": loadExperienceInformation,
        "joining-details": loadJoiningDetails,
        "work-position": loadWorkPosition,
        "exit-details": loadExitDetails,
        "nomination-information": loadNominationInformation,
        "skills": loadSkills,

        "family-information": loadFamilyInformation,
        "bank-information": loadBankInformation,
        "my-attendance": loadMyAttendance,
        "attendance-calendar": loadAttendanceCalendar,
        "my-leaves": loadMyLeaves,
        "apply-leave": loadApplyLeaveForm,
        "leave-balance": loadLeaveBalance,
        "my-payroll": loadPayroll,
        "payslips": loadPayslips,
        "attendance-corrections": loadCorrections,
        "profile": loadProfile,
    };

    // ==============================================================================================
    //              Show View
    // ==============================================================================================

    function showView(viewName) {
        viewNames.forEach(function (name) {
            views[name].classList.add("d-none");
        });

        views[viewName].classList.remove("d-none");

        document.querySelectorAll(".sidebar-item[data-view]").forEach(function (btn) {
            btn.classList.toggle("active", btn.dataset.view === viewName);
        });
        const profileHeaderBar = document.getElementById("profileHeaderBar");
        if (profileHeaderBar) {
            if (profileFamilyViews.indexOf(viewName) !== -1) {
                profileHeaderBar.classList.remove("d-none");
            } else {
                profileHeaderBar.classList.add("d-none");
            }
            profileHeaderBar.querySelectorAll(".profile-info-btn[data-view]").forEach(function (btn) {
                btn.classList.toggle("active", btn.dataset.view === viewName);
            });
        }

        if (viewLoaders[viewName]) {
            viewLoaders[viewName]();
        }
    }


    // ==============================================================================================
    // Employee Profile Click
    // Employee Profile DropDown
    // ==============================================================================================

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

    // ----------------------------------------------------------------------------------------------
    //          Open / close profile dropdown
    // ----------------------------------------------------------------------------------------------

    employeeProfileButton.addEventListener("click", function (event) {
        event.stopPropagation();
        employeeProfileDropdown.classList.toggle("show");
    });
    // ----------------------------------------------------------------------------------------------
    //          Outside click
    // ----------------------------------------------------------------------------------------------
    document.addEventListener("click", function () {
        employeeProfileDropdown.classList.remove("show");
    });

    // ----------------------------------------------------------------------------------------------
    //  Prevent dropdown from closing when clicking inside
    // ----------------------------------------------------------------------------------------------
    employeeProfileDropdown.addEventListener("click", function (event) {
        event.stopPropagation();
    });

    // ==============================================================================================
    // REAL PROFILE API (demoGetProfile ki jagah)
    // Real endpoint: GET /api/users/me
    // Jo fields backend abhi nahi bhej raha, unke liye
    // placeholder rakha hai. Jab backend developer wo
    // fields add karega, to yahan sirf fallback values
    // hata dena — baaki poore project me kuch change
    // nahi karna padega.
    // ==============================================================================================

    let currentProfileInitials = "";
    let currentCoverImage = null;


    // ==============================================================================================
    //         Employee Profile show
    // ==============================================================================================

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
        systemInButton.disabled = true;

        checkInAttendance()   // agar shiftId bhejna hai to: checkInAttendance(1)
            .then(function (res) {
                console.log("Check-in success:", res);

                systemInButton.classList.add("d-none");
                systemOutButton.classList.remove("d-none");
            })
            .catch(function (error) {
                console.error("Check-in failed:", error);
                alert(error?.message || "Check-in failed. Please try again.");
            })
            .finally(function () {
                systemInButton.disabled = false;
            });
    });

    systemOutButton.addEventListener("click", function () {
        systemOutButton.disabled = true;

        checkOutAttendance()
            .then(function (res) {
                console.log("Check-out success:", res);

                systemOutButton.classList.add("d-none");
                systemInButton.classList.remove("d-none");
            })
            .catch(function (error) {
                console.error("Check-out failed:", error);
                alert(error?.message || "Check-out failed. Please try again.");
            })
            .finally(function () {
                systemOutButton.disabled = false;
            });
    });

    // ==============================================================================================
    //      DASHBOARD OVERVIEW
    // ==============================================================================================

    function loadDashboardSummary() {
        fetchCurrentUserProfile().then(function (res) {
            const p = res.data;

            const initials =
                `${p.firstName || ""}${p.lastName || ""}`
                    .trim()
                    .split(/\s+/)
                    .map(function (name) {
                        return name.charAt(0);
                    })
                    .join("")
                    .toUpperCase();
            // ----------------------------------------------------------------------------------------------
            //      Dashboard Title show on Welcome Back and Username-----
            // ----------------------------------------------------------------------------------------------

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
            }
        }

        demoGetDashboardSummary().then(function (res) {
            const s = res.data;
            document.getElementById("statAttendance").textContent = s.attendancePercent + "%";
            document.getElementById("statLeaveBalance").textContent = s.leaveBalanceDays + " days";
            document.getElementById("statCorrections").textContent = s.pendingCorrections;
            document.getElementById("statLastPayslip").textContent = s.lastPayslipMonth;
        });

        demoGetDashboardAttendanceChart().then(function (res) {
            renderDashboardAttendanceChart(res.data);
        });

        demoGetDashboardTasks().then(function (res) {
            renderDashboardTasks(res.data);
        });

        demoGetDashboardLeaveOverview().then(function (res) {
            renderDashboardLeaveOverview(res.data);
        });

        demoGetDashboardCelebrations().then(function (res) {
            renderDashboardCelebrations(res.data);
        });

        demoGetDashboardAnnouncements().then(function (res) {
            renderDashboardAnnouncements(res.data);
        });

        demoGetDashboardEvents().then(function (res) {
            renderDashboardEvents(res.data);
        });

    }


    // ==============================================================================================
    //      DASHBOARD — Attendance Chart
    // ==============================================================================================
    let dashAttendanceChartInstance = null;

    function renderDashboardAttendanceChart(data) {
        const ctx = document.getElementById("dashAttendanceChart");
        if (!ctx) return;

        if (dashAttendanceChartInstance) {
            dashAttendanceChartInstance.destroy();
        }

        dashAttendanceChartInstance = new Chart(ctx, {
            type: "bar",
            data: {
                labels: data.labels,
                datasets: [
                    { label: "Present", data: data.present, backgroundColor: "#1a7f4b", stack: "a", borderRadius: 3 },
                    { label: "Late", data: data.late, backgroundColor: "#a15c00", stack: "a", borderRadius: 3 },
                    { label: "Absent", data: data.absent, backgroundColor: "#b3261e", stack: "a", borderRadius: 3 },
                    { label: "Weekly Off", data: data.weeklyOff, backgroundColor: "#c7cfda", stack: "a", borderRadius: 3 }
                ]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false } },
                scales: {
                    x: { grid: { display: false }, stacked: true, ticks: { font: { size: 10.5 } } },
                    y: { stacked: true, grid: { color: "#f1f3f6" }, ticks: { font: { size: 10.5 } } }
                }
            }
        });
    }

    // ==============================================================================================
    //      DASHBOARD — My Tasks
    // ==============================================================================================
    function renderDashboardTasks(tasks) {
        const container = document.getElementById("dashTasksList");
        if (!container) return;

        const statusStyle = {
            "In Progress": { bg: "#fff4e0", color: "#a15c00", bar: "#a15c00" },
            "Pending": { bg: "#eef2ff", color: "#3949ab", bar: "#3949ab" },
            "Completed": { bg: "#e6f7ec", color: "#1a7f4b", bar: "#1a7f4b" }
        };

        container.innerHTML = tasks.map(function (t) {
            const style = statusStyle[t.status] || statusStyle["Pending"];
            return `
            <div class="dash-task-item">
                <div class="dash-task-row">
                    <div class="dash-task-ico" style="background:${style.bg};color:${style.color};">📄</div>
                    <div class="flex-grow-1">
                        <div class="d-flex justify-content-between align-items-start">
                            <p class="dash-task-title">${escapeHtml(t.title)}</p>
                            <span class="dash-task-badge" style="background:${style.bg};color:${style.color};">${escapeHtml(t.status)}</span>
                        </div>
                        <p class="dash-task-desc">${escapeHtml(t.desc)}</p>
                        <div class="dash-progress"><div class="dash-progress-bar" style="width:${t.progress}%;background:${style.bar};"></div></div>
                    </div>
                </div>
            </div>
        `;
        }).join("");
    }

    // ==============================================================================================
    //      DASHBOARD — Leave Overview
    // ==============================================================================================
    function renderDashboardLeaveOverview(rows) {
        const container = document.getElementById("dashLeaveOverview");
        if (!container) return;

        const iconStyle = {
            "Casual Leave": { bg: "#e6f7fa", color: "#17a2b8", icon: "🌂" },
            "Sick Leave": { bg: "#fde8e8", color: "#b3261e", icon: "❤️" },
            "Paid Leave": { bg: "#eef2ff", color: "#3949ab", icon: "💼" }
        };

        container.innerHTML = rows.map(function (r) {
            const style = iconStyle[r.type] || { bg: "#eef0f3", color: "#6c757d", icon: "📌" };
            return `
            <div class="dash-leave-row">
                <div class="d-flex align-items-center gap-2">
                    <div class="dash-leave-ico" style="background:${style.bg};color:${style.color};">${style.icon}</div>
                    <div class="dash-leave-name">${escapeHtml(r.type)}</div>
                </div>
                <div>
                    <div class="dash-leave-days">${r.remaining}</div>
                    <div class="dash-leave-sub">Days Remaining</div>
                </div>
            </div>
        `;
        }).join("");
    }

    // ==============================================================================================
    //      DASHBOARD — Celebrations
    // ==============================================================================================
    function renderDashboardCelebrations(rows) {
        const container = document.getElementById("dashCelebrations");
        if (!container) return;

        const colors = ["#e6f7fa,#17a2b8", "#fde8e8,#b3261e", "#e6f7ec,#1a7f4b", "#fff4e0,#a15c00"];

        container.innerHTML = rows.map(function (c, i) {
            const [bg, color] = colors[i % colors.length].split(",");
            return `
            <div class="dash-feed-row">
                <div class="dash-feed-avatar" style="background:${bg};color:${color};">${escapeHtml(c.initials)}</div>
                <div class="flex-grow-1">
                    <p class="dash-feed-title">${escapeHtml(c.name)}</p>
                    <p class="dash-feed-sub">${escapeHtml(c.note)}</p>
                </div>
            </div>
        `;
        }).join("");
    }

    // ==============================================================================================
    //      DASHBOARD — Announcements
    // ==============================================================================================
    function renderDashboardAnnouncements(rows) {
        const container = document.getElementById("dashAnnouncements");
        if (!container) return;

        const icons = [
            { icon: "📢", bg: "#e6f7fa", color: "#17a2b8" },
            { icon: "📅", bg: "#fff4e0", color: "#a15c00" },
            { icon: "🧾", bg: "#e6f7ec", color: "#1a7f4b" }
        ];

        container.innerHTML = rows.map(function (a, i) {
            const ic = icons[i % icons.length];
            return `
            <div class="dash-feed-row">
                <div class="dash-feed-ico" style="background:${ic.bg};color:${ic.color};">${ic.icon}</div>
                <div class="flex-grow-1">
                    <p class="dash-feed-title">${escapeHtml(a.title)}</p>
                    <p class="dash-feed-sub">${escapeHtml(a.desc)}</p>
                </div>
                <div class="dash-feed-time">${escapeHtml(a.time)}</div>
            </div>
        `;
        }).join("");
    }

    // ==============================================================================================
    //      DASHBOARD — Upcoming Events
    // ==============================================================================================
    function renderDashboardEvents(rows) {
        const container = document.getElementById("dashEvents");
        if (!container) return;

        container.innerHTML = rows.map(function (e) {
            return `
            <div class="dash-event-row">
                <div class="dash-event-date"><span class="d">${escapeHtml(e.day)}</span><span class="m">${escapeHtml(e.month)}</span></div>
                <div class="flex-grow-1">
                    <p class="dash-event-title">${escapeHtml(e.title)}</p>
                    <p class="dash-event-sub">${escapeHtml(e.sub)}</p>
                </div>
            </div>
        `;
        }).join("");
    }




    // ==============================================================================================
    //               MY ATTENDANCE
    // ==============================================================================================
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

    // ==============================================================================================
    //              Attendance Stat Cards
    // ==============================================================================================
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
    // ==============================================================================================
    //               Attendance table Show 
    // ==============================================================================================

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
    // ----------------------------------------------------------------------------------------------
    //      Filter by status using the dropdown (client-side demo)
    // ----------------------------------------------------------------------------------------------
    document.getElementById("attendanceStatusFilter").addEventListener("change", function () {
        const value = this.value;

        const filtered = value === "ALL"
            ? myAttendanceData
            : myAttendanceData.filter(function (r) { return r.status === value; });

        renderAttendanceTable(filtered);
    });

    // ==============================================================================================
    //      ATTENDANCE CALENDAR View data
    // ==============================================================================================
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

    // ==============================================================================================
    //              My Leaves History
    // ==============================================================================================
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

    // ==============================================================================================
    //      Apply leave type
    // ==============================================================================================
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

    // ==============================================================================================
    //      Apply leave from date-month
    // ==============================================================================================

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
    // ==============================================================================================
    //      CC To — add / remove chips
    // ==============================================================================================
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

    // ==============================================================================================
    //     Adds a CC To option in the Apply Leave form.
    // ==============================================================================================

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

    // ==============================================================================================
    //      Leave Balance Cards
    // ==============================================================================================
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

    // ==============================================================================================
    //      Payroll Overview 
    // ==============================================================================================
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
                        title: "Wait for Download.....",
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

    // ==============================================================================================
    //      Opens the payslip modal for the selected record.
    // ==============================================================================================

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

    // ==============================================================================================
    //      Payslip List
    // ==============================================================================================
    function loadPayslips() {
        const tbody = document.getElementById("payslipsTableBody");
        tbody.innerHTML = `<tr><td colspan="4" class="text-center py-4">Loading...</td></tr>`;
    }

    // ==============================================================================================
    //      ATTENDANCE CORRECTIONS
    // ==============================================================================================
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

    // ==============================================================================================
    //      Displays correction statistics in cards.
    // ==============================================================================================

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

    // ==============================================================================================
    //      Shows attendance correction requests.
    // ==============================================================================================

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

    // ==============================================================================================
    //      PROFILE Icone click Drop down 
    // ==============================================================================================
    const profileViewButton =
        document.getElementById("profileViewButton");

    if (profileViewButton) {
        profileViewButton.addEventListener("click", function () {
            showView("profile");
            employeeProfileDropdown.classList.remove("show");
        });
    }

    // ==============================================================================================
    //               Loads the employee profile section.
    // ==============================================================================================
    let profileHeaderBuilt = false;
    let cachedProfileData = null;

    function ensureProfileHeader(callback) {
        if (profileHeaderBuilt && cachedProfileData) {
            callback(cachedProfileData);
            return;
        }

        fetchCurrentUserProfile().then(function (res) {
            cachedProfileData = res.data;
            buildProfileHeader(cachedProfileData);
            profileHeaderBuilt = true;
            callback(cachedProfileData);
        });
    }

    function buildProfileHeader(p) {
        const headerBar = document.getElementById("profileHeaderBar");
        const fullName = `${p.firstName} ${p.lastName}`.trim();
        const initials = `${p.firstName.charAt(0)}${p.lastName.charAt(0)}`.toUpperCase();

        currentProfileInitials = initials;

        headerBar.innerHTML = `
        <div class="employee-profile">
            <div class="profile-header">

                <div class="profile-cover">
                    <div class="profile-cover-image-wrapper">
                        <img src="${currentCoverImage || '../assets/image/cover-earth-image.jpg'}" alt="Profile Cover" class="profile-cover-image">
                    </div>
                    <button type="button" id="coverEditButton" class="cover-edit-btn" title="Change Cover Photo">📷</button>
                </div>

                <div class="profile-header-content">

                    <div class="profile-avatar" id="profileAvatarClickable">
                        ${p.profileImage ? `
                            <div class="profile-avatar-inner">
                                <img src="${p.profileImage}" alt="Employee Profile" class="profile-avatar-image"
                                    onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                                <span class="profile-avatar-fallback" style="display:none;">${escapeHtml(initials)}</span>
                            </div>
                        ` : `
                            <div class="profile-avatar-inner">
                                <span class="profile-avatar-fallback">${escapeHtml(initials)}</span>
                            </div>
                        `}
                    </div>

                    <div class="profile-main-info">
                        <h2>${escapeHtml(fullName)}</h2>

                        <div class="d-flex align-items-center">
                            <span class="profile-status">${escapeHtml(p.designation)}</span>
                            <span class="profile-status"><span class="status-dot"></span> Active Employee</span>
                        </div>

                        <div class="profile-info-buttons">
                            <button type="button" class="profile-info-btn" data-view="profile">About</button>
                            <button type="button" class="profile-info-btn" data-view="personal-information">Personal Info</button>
                            <button type="button" class="profile-info-btn" data-view="emergency-information">Emergency Info</button>
                            <button type="button" class="profile-info-btn" data-view="bank-information">Bank Info</button>
                            <button type="button" class="profile-info-btn" data-view="family-information">Family Info</button>
                            <button type="button" class="profile-info-btn" data-view="education-information">Education Info</button>
                            <button type="button" class="profile-info-btn" data-view="experience-information">Experience Info</button>
                            <button type="button" class="profile-info-btn" data-view="joining-details">Joining Details</button>
                            <button type="button" class="profile-info-btn" data-view="work-position">Work Position</button>
                            <button type="button" class="profile-info-btn" data-view="exit-details">Exit Details</button>
                            <button type="button" class="profile-info-btn" data-view="nomination-information">Nomination Info</button>
                            <button type="button" class="profile-info-btn" data-view="skills">Skills</button>
                        </div>
                    </div>

                </div>

              <!--  <button type="button" id="viewFullProfileButton" class="btn btn-outline-primary profile-header-action-btn">
                    Information
                </button> -->

            </div>
        </div>
    `;
        headerBar.querySelectorAll("[data-view]").forEach(function (btn) {
            btn.addEventListener("click", function () {
                showView(this.dataset.view);
            });
        });

        const viewFullProfileButton = document.getElementById("viewFullProfileButton");
        if (viewFullProfileButton) {
            viewFullProfileButton.addEventListener("click", toggleProfileExtendedSection);
        }

        const profileAvatarClickable = document.getElementById("profileAvatarClickable");
        if (profileAvatarClickable) {
            profileAvatarClickable.addEventListener("click", function () {
                openViewPhotoModal(p.profileImage, initials);
            });
        }

        const coverEditButton = document.getElementById("coverEditButton");

        if (coverEditButton) {
            coverEditButton.addEventListener("click", function () {
                openUploadCoverModal();
            });
        }
    }

    // =========================================================================================
    //           Upload Cover Photo Model (DEMO — real API aane par yahan replace karna hai)
    // =========================================================================================

    let selectedCoverFile = null;

    function openUploadCoverModal() {
        selectedCoverFile = null;

        document.getElementById("uploadCoverInput").value = "";
        document.getElementById("uploadCoverMessage").innerHTML = "";
        document.getElementById("saveCoverButton").disabled = true;

        const preview = document.getElementById("uploadCoverPreview");
        preview.src = currentCoverImage || "../assets/image/cover-earth-image.jpg";
        preview.style.display = "block";

        const modal = new bootstrap.Modal(document.getElementById("uploadCoverModal"));
        modal.show();
    }

    const uploadCoverInput = document.getElementById("uploadCoverInput");
    if (uploadCoverInput) {
        uploadCoverInput.addEventListener("change", function () {
            const file = this.files[0];
            if (!file) return;

            selectedCoverFile = file;

            const reader = new FileReader();
            reader.onload = function (e) {
                const preview = document.getElementById("uploadCoverPreview");
                preview.src = e.target.result;
                preview.style.display = "block";

                document.getElementById("saveCoverButton").disabled = false;
            };
            reader.readAsDataURL(file);
        });
    }

    const saveCoverButton = document.getElementById("saveCoverButton");
    if (saveCoverButton) {
        saveCoverButton.addEventListener("click", function () {
            if (!selectedCoverFile) return;

            const messageBox = document.getElementById("uploadCoverMessage");
            messageBox.innerHTML = "";
            saveCoverButton.disabled = true;

            const reader = new FileReader();
            reader.onload = function (e) {

                // -----------------------------------------------------------------------------------------
                // TODO: Once the real API is available, call uploadCoverPhoto(selectedCoverFile) here,
                // and after success, set the URL returned by the server as currentCoverImage.
                // For now, we are saving the local preview for demo purposes.
                // -----------------------------------------------------------------------------------------
                currentCoverImage = e.target.result;

                const modal = bootstrap.Modal.getInstance(document.getElementById("uploadCoverModal"));
                if (modal) modal.hide();

                Swal.fire({
                    icon: "success",
                    title: "Cover photo updated",
                    confirmButtonColor: "#17a2b8",
                    timer: 1500,
                    showConfirmButton: false
                });
                // -----------------------------------------------------------------------------------
                //          Header dobara build karo taaki naya cover turant dikhe
                // -----------------------------------------------------------------------------------
                if (cachedProfileData) {
                    buildProfileHeader(cachedProfileData);
                }

                saveCoverButton.disabled = false;
            };
            reader.readAsDataURL(selectedCoverFile);
        });
    }

    // ==============================================================================================
    //                  Load Profile 
    // ==============================================================================================

    function loadProfile() {
        const card = document.getElementById("profileCard");

        const extendedSection = document.getElementById("profileExtendedSection");
        if (extendedSection) extendedSection.classList.add("d-none");
        profileExtendedLoaded = false;

        ensureProfileHeader(function (p) {
            const fullName = `${p.firstName} ${p.lastName}`.trim();

            card.innerHTML = `
            <div class="profile-section">
                <div class="profile-section-title">
                    <span class="profile-section-icon">👤</span>
                    <!--<div><h4>About</h4><p>Your registered contact details</p></div>-->
                    <div><h3 class="fw-light">About</h3></div>
                </div>
               <div class="profile-info-grid">

                    <div class="profile-info-item">
                        <span class="profile-label">Employee Code</span>
                        <strong>${escapeHtml(p.employeeCode)}</strong>
                    </div>

                    <div class="profile-info-item">
                        <span class="profile-label">Full Name</span>
                        <strong>${escapeHtml(fullName)}</strong>
                    </div>

                    <div class="profile-info-item">
                        <span class="profile-label">Department</span>
                        <strong>${escapeHtml(p.departmentName)}</strong>
                    </div>

                    <div class="profile-info-item">
                        <span class="profile-label">Designation</span>
                        <strong>${escapeHtml(p.designation)}</strong>
                    </div>

                    <div class="profile-info-item">
                        <span class="profile-label">Email</span>
                        <strong>${escapeHtml(p.email)}</strong>
                    </div>

                    <div class="profile-info-item">
                        <span class="profile-label">Phone</span>
                        <strong>${escapeHtml(p.phone)}</strong>
                    </div>

                    <div class="profile-info-item">
                        <span class="profile-label">Joining Date</span>
                        <strong>${escapeHtml(p.joiningDate)}</strong>
                    </div>

                    <div class="profile-info-item">
                        <span class="profile-label">Role</span>
                        <strong>${escapeHtml(p.roleName)}</strong>
                    </div>

                    <div class="profile-info-item">
                        <span class="profile-label">Status</span>
                        <strong>${escapeHtml(p.status)}</strong>
                    </div>

                    <div class="profile-info-item">
                        <span class="profile-label">Birthday</span>
                        <strong>${escapeHtml(p.dateOfBirth)}</strong>
                    </div>

                    <div class="profile-info-item">
                        <span class="profile-label">Gender</span>
                        <strong>${escapeHtml(p.gender)}</strong>
                    </div>

                </div>
            </div>

            <div class="profile-section">
                <div class="profile-section-title">
                    <span class="profile-section-icon">📞</span>
                    <div><h4>Contact Information</h4><p>Your registered contact details</p></div>
                </div>
                <div class="profile-info-grid">
                    <div class="profile-info-item"><span class="profile-label">Email Address</span><strong>${escapeHtml(p.email)}</strong></div>
                    <div class="profile-info-item"><span class="profile-label">Phone Number</span><strong>${escapeHtml(p.phone)}</strong></div>
                    <div class="profile-info-item profile-password-card">
                        <span class="profile-label">Password</span>
                        <button type="button" id="resetPasswordToggleButton" class="btn-reset-password">Reset Password</button>
                    </div>
                </div>
            </div>

            <div class="profile-section">
                <div class="profile-section-title">
                    <span class="profile-section-icon">💼</span>
                    <div><h4>Work Information</h4><p>Employment and reporting details</p></div>
                </div>
                <div class="profile-info-grid">
                    <div class="profile-info-item"><span class="profile-label">Joining Date</span><strong>${escapeHtml(p.joiningDate)}</strong></div>
                    <div class="profile-info-item"><span class="profile-label">Reporting Manager</span><strong>${escapeHtml(p.reportingManager)}</strong></div>
                    <div class="profile-info-item role-info-item " style="grid-column: 1 / -1;">
                        <span class="profile-label">Role</span>
                        <div class="permission-chips role-chips ">
                            ${(p.roles && p.roles.length)
                    ? p.roles.map(function (perm) {
                        return `<span class="permission-chip">${escapeHtml(perm)}</span>`;
                    }).join("")
                    : `<span class="text-muted" style="font-size:0.85rem;">--</span>`
                }
                        </div>
                    </div>
                   <div class="profile-info-item permission-info-item" style="grid-column: 1 / -1;">
                        <span class="profile-label">Permission</span>
                        <div class="permission-chips">
                            ${(p.permissions && p.permissions.length)
                    ? p.permissions.map(function (perm) {
                        return `<span class="permission-chip">${escapeHtml(perm)}</span>`;
                    }).join("")
                    : `<span class="text-muted" style="font-size:0.85rem;">--</span>`
                }
                        </div>
                    </div>
                </div>
            </div>
        `;

            const resetPasswordToggleButton = document.getElementById("resetPasswordToggleButton");
            const resetPasswordMessage = document.getElementById("resetPasswordMessage");
            if (resetPasswordToggleButton) {
                resetPasswordToggleButton.addEventListener("click", function () {
                    resetPasswordMessage.innerHTML = "";
                    const modal = new bootstrap.Modal(document.getElementById("resetPasswordModal"));
                    modal.show();
                });
            }
        });
    }

    // ==============================================================================================
    //             View Phote Model in profile
    // ==============================================================================================

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

    // ==============================================================================================
    //              Open Uploade Phote Model
    // ==============================================================================================

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

    // ==============================================================================================
    //                   New Function Profile Loaded
    // ==============================================================================================

    let profileExtendedLoaded = false;

    function toggleProfileExtendedSection() {
        const section = document.getElementById("profileExtendedSection");
        const btn = document.getElementById("viewFullProfileButton");
        const isHidden = section.classList.contains("d-none");

        if (isHidden) {
            section.classList.remove("d-none");
            if (btn) btn.textContent = "Hide Information";
            if (!profileExtendedLoaded) {
                loadProfileOverview();
                profileExtendedLoaded = true;
            }
        } else {
            section.classList.add("d-none");
            if (btn) btn.textContent = "Information";
        }
    }

    // ==============================================================================================
    //              Loads and displays the employee profile overview.
    // ==============================================================================================

    function loadProfileOverview() {
        const grid = document.getElementById("profileOverviewGrid");
        grid.innerHTML = `<p class="text-muted">Loading...</p>`;

        Promise.all([
            fetchCurrentUserProfile(),
            fetchMyExtendedProfile(),
            fetchMyEmergencyContacts(),
            fetchMyFamilyMembers(),
            fetchMyEducationDetails(),
            fetchMyExperienceDetails(),
            demoGetJoiningDetails(),
            demoGetWorkPosition(),
            demoGetExitDetails(),
            fetchMyNominees(),
            fetchMySkills(),
            fetchMyBankInformation()
        ]).then(function (results) {

            const basicProfile = results[0].data;
            currentPersonalInfo = results[1].data;
            const emergencyContacts = results[2].data;
            const familyMembers = results[3].data;
            const education = results[4].data;
            const experience = results[5].data;
            currentJoiningDetails = results[6].data;
            const workPosition = results[7].data;
            const exitDetails = results[8].data;
            const nominations = results[9].data;
            const skills = results[10].data;
            const bankInfo = results[11].data;

            const featuredEmergency = getDisplayRecord("emergency", emergencyContacts);
            const featuredFamily = getDisplayRecord("family", familyMembers);
            const featuredNomination = getDisplayRecord("nomination", nominations);

            // ----------------------------------------------------------------------------------------------
            //                      About Panel
            // ----------------------------------------------------------------------------------------------
            const aboutPanel = `
            <div class="fb-tab-panel active" data-tab-panel="about">
                <div class="about-card">
                    <div class="about-card-header">
                        <h5>About</h5>
                        <button type="button" class="overview-edit-btn" id="overviewEditPersonalInfo" title="Edit">✎</button>
                    </div>
                    <div class="about-grid">
                        <div class="about-row">
                            <span class="about-icon">💼</span>
                            <div class="about-text">
                                <strong>${escapeHtml(basicProfile.designation) || "--"}</strong>
                                <span>${escapeHtml(basicProfile.departmentName) || "Department not set"}</span>
                            </div>
                        </div>
                        <div class="about-row">
                            <span class="about-icon">📅</span>
                            <div class="about-text">
                                <strong>Joined ${escapeHtml(currentJoiningDetails.dateOfJoining) || "--"}</strong>
                                <span>Status: ${escapeHtml(currentJoiningDetails.status) || "--"}</span>
                            </div>
                        </div>
                        <div class="about-row">
                            <span class="about-icon">📱</span>
                            <div class="about-text">
                                <strong>${escapeHtml(basicProfile.phone) || "--"}</strong>
                                <span>${escapeHtml(basicProfile.email) || "--"}</span>
                            </div>
                        </div>
                        <div class="about-row">
                            <span class="about-icon">🎂</span>
                            <div class="about-text">
                                <strong>${escapeHtml(currentPersonalInfo.dateOfBirth) || "--"}</strong>
                                <span>${escapeHtml(currentPersonalInfo.gender) || "--"} · ${escapeHtml(currentPersonalInfo.bloodGroup) || "--"}</span>
                            </div>
                        </div>
                        <div class="about-row">
                            <span class="about-icon">🌍</span>
                            <div class="about-text">
                                <strong>${escapeHtml(currentPersonalInfo.nationality) || "--"}</strong>
                                <span>${escapeHtml(currentPersonalInfo.occupation) || "--"}</span>
                            </div>
                        </div>
                        <div class="about-row">
                            <span class="about-icon">🏦</span>
                            <div class="about-text">
                                <strong>${bankInfo && bankInfo.bankName ? escapeHtml(bankInfo.bankName) : "Not added"}</strong>
                                <span>${bankInfo && bankInfo.accountNumber ? "A/C ending " + escapeHtml(String(bankInfo.accountNumber).slice(-4)) : "--"}</span>
                            </div>
                        </div>
                    </div>
                    ${currentPersonalInfo.bio ? `<p class="overview-summary-text" style="margin-top:16px;">${escapeHtml(currentPersonalInfo.bio)}</p>` : ""}
                </div>
            </div>
        `;
            // ----------------------------------------------------------------------------------------------
            //              Family & Contect Panel
            // ----------------------------------------------------------------------------------------------
            const familyPanel = `
            <div class="fb-tab-panel" data-tab-panel="family">
                <div class="about-card">
                    <div class="about-card-header">
                        <h5>Emergency Contact</h5>
                        <button type="button" class="overview-nav-btn" data-goto-view="emergency-information" title="Manage">›</button>
                    </div>
                    ${featuredEmergency
                    ? `<div class="about-grid">
                            <div class="about-row"><span class="about-icon">🆘</span><div class="about-text"><strong>${escapeHtml(featuredEmergency.name)}</strong><span>${escapeHtml(featuredEmergency.relationship)}</span></div></div>
                            <div class="about-row"><span class="about-icon">📞</span><div class="about-text"><strong>${escapeHtml(featuredEmergency.phone) || "--"}</strong><span>${escapeHtml(featuredEmergency.email) || "--"}</span></div></div>
                        </div>`
                    : `<p class="overview-summary-text text-muted">${emergencyContacts.length} contact(s) added.</p>`
                }
                </div>

                <div class="about-card">
                    <div class="about-card-header">
                        <h5>Family</h5>
                        <button type="button" class="overview-nav-btn" data-goto-view="family-information" title="Manage">›</button>
                    </div>
                    ${featuredFamily
                    ? `<div class="about-grid">
                            <div class="about-row"><span class="about-icon">👪</span><div class="about-text"><strong>${escapeHtml(featuredFamily.name)}</strong><span>${escapeHtml(featuredFamily.relationship)}</span></div></div>
                            <div class="about-row"><span class="about-icon">🎂</span><div class="about-text"><strong>${escapeHtml(featuredFamily.dateOfBirth) || "--"}</strong><span>${featuredFamily.dependent ? "Dependent" : "Not dependent"}</span></div></div>
                        </div>`
                    : `<p class="overview-summary-text text-muted">${familyMembers.length} member(s) added.</p>`
                }
                </div>

                <div class="about-card">
                    <div class="about-card-header">
                        <h5>Nomination</h5>
                        <button type="button" class="overview-nav-btn" data-goto-view="nomination-information" title="Manage">›</button>
                    </div>
                    ${featuredNomination
                    ? `<div class="about-grid">
                            <div class="about-row"><span class="about-icon">📝</span><div class="about-text"><strong>${escapeHtml(featuredNomination.name)}</strong><span>${escapeHtml(featuredNomination.relationship)}</span></div></div>
                            <div class="about-row"><span class="about-icon">📊</span><div class="about-text"><strong>${featuredNomination.sharePercentage}% share</strong><span>${featuredNomination.minor ? "Minor" : "Adult"}</span></div></div>
                        </div>`
                    : `<p class="overview-summary-text text-muted">${nominations.length} nomination(s) added.</p>`
                }
                </div>
            </div>
        `;

            // ----------------------------------------------------------------------------------------------
            //                   Work & Education Panel
            // ----------------------------------------------------------------------------------------------
            const featuredEducation = getDisplayRecord("education", education);
            const featuredExperience = getDisplayRecord("experience", experience);

            const workPanel = `
            <div class="fb-tab-panel" data-tab-panel="work">
                <div class="about-card">
                    <div class="about-card-header">
                        <h5>Work Position</h5>
                    </div>
                    <div class="about-grid">
                        <div class="about-row"><span class="about-icon">🏢</span><div class="about-text"><strong>${escapeHtml(workPosition.departmentName) || "--"}</strong><span>Department</span></div></div>
                        <div class="about-row"><span class="about-icon">📶</span><div class="about-text"><strong>${escapeHtml(workPosition.gradeLevel) || "--"}</strong><span>Grade Level</span></div></div>
                    </div>
                </div>

                <div class="about-card">
                    <div class="about-card-header">
                        <h5>Experience</h5>
                        <button type="button" class="overview-nav-btn" data-goto-view="experience-information" title="Manage">›</button>
                    </div>
                    ${featuredExperience
                    ? `<div class="about-grid">
                            <div class="about-row"><span class="about-icon">💼</span><div class="about-text"><strong>${escapeHtml(featuredExperience.companyName)}</strong><span>${escapeHtml(featuredExperience.designation) || "--"}</span></div></div>
                            <div class="about-row"><span class="about-icon">📅</span><div class="about-text"><strong>${escapeHtml(featuredExperience.fromDate)}</strong><span>${featuredExperience.current ? "Current" : "Past"}</span></div></div>
                        </div>`
                    : `<p class="overview-summary-text text-muted">${experience.length} record(s) added.</p>`
                }
                </div>

                <div class="about-card">
                    <div class="about-card-header">
                        <h5>Education</h5>
                        <button type="button" class="overview-nav-btn" data-goto-view="education-information" title="Manage">›</button>
                    </div>
                    ${featuredEducation
                    ? `<div class="about-grid">
                            <div class="about-row"><span class="about-icon">🎓</span><div class="about-text"><strong>${escapeHtml(featuredEducation.degree)}</strong><span>${escapeHtml(featuredEducation.institution)}</span></div></div>
                            <div class="about-row"><span class="about-icon">📈</span><div class="about-text"><strong>${featuredEducation.yearOfPassing || "--"}</strong><span>${escapeHtml(featuredEducation.percentageOrGrade) || "--"}</span></div></div>
                        </div>`
                    : `<p class="overview-summary-text text-muted">${education.length} record(s) added.</p>`
                }
                </div>

                <div class="about-card">
                    <div class="about-card-header">
                        <h5>Exit Details</h5>
                    </div>
                    <div class="about-grid">
                        <div class="about-row"><span class="about-icon">🚪</span><div class="about-text"><strong>${escapeHtml(exitDetails.separationMode) || "--"}</strong><span>Separation Mode</span></div></div>
                        <div class="about-row"><span class="about-icon">📅</span><div class="about-text"><strong>${escapeHtml(exitDetails.lastWorkingDate) || "--"}</strong><span>Last Working Date</span></div></div>
                    </div>
                </div>
            </div>
        `;
            // ----------------------------------------------------------------------------------------------
            //              Skill Panel
            // ----------------------------------------------------------------------------------------------
            const skillsPanel = `
            <div class="fb-tab-panel" data-tab-panel="skills">
                <div class="about-card">
                    <div class="about-card-header">
                        <h5>Skills</h5>
                        <button type="button" class="overview-nav-btn" data-goto-view="skills" title="Manage">›</button>
                    </div>
                    ${skills.length
                    ? `<div class="cc-chips">${skills.map(function (s) { return `<span class="cc-chip">${escapeHtml(s.skillName)}${s.certified ? " ✔" : ""}</span>`; }).join("")}</div>`
                    : `<p class="overview-summary-text text-muted">No skills added yet.</p>`
                }
                </div>
            </div>
        `;

            grid.innerHTML = aboutPanel + familyPanel + workPanel + skillsPanel;

            // ----------------------------------------------------------------------------------------------
            //                     Bind edit/nav buttons
            // ----------------------------------------------------------------------------------------------
            const overviewEditPersonalInfo = document.getElementById("overviewEditPersonalInfo");
            if (overviewEditPersonalInfo) {
                overviewEditPersonalInfo.addEventListener("click", openPersonalInfoModal);
            }

            grid.querySelectorAll("[data-goto-view]").forEach(function (btn) {
                btn.addEventListener("click", function () {
                    showView(this.dataset.gotoView);
                });
            });
        });
    }
    // ----------------------------------------------------------------------------------------------
    //                  Tab Switching
    // ----------------------------------------------------------------------------------------------
    const fbProfileTabs = document.getElementById("fbProfileTabs");
    if (fbProfileTabs) {
        fbProfileTabs.addEventListener("click", function (e) {
            const btn = e.target.closest(".fb-tab");
            if (!btn) return;

            fbProfileTabs.querySelectorAll(".fb-tab").forEach(function (t) {
                t.classList.remove("active");
            });
            btn.classList.add("active");

            const tabName = btn.dataset.tab;
            document.querySelectorAll(".fb-tab-panel").forEach(function (panel) {
                panel.classList.toggle("active", panel.dataset.tabPanel === tabName);
            });
        });
    }

    // ==============================================================================================
    //              RESET PASSWORD (from Profile)
    //              RESET PASSWORD — SUBMIT (modal)
    // ==============================================================================================
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

    // ==============================================================================================
    //              Validates the password confirmation in real time.
    // ==============================================================================================

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

    // ==============================================================================================
    //                  Initial View Method calll
    // ==============================================================================================
    showView("dashboard");

    // ==============================================================================================
    //                Brand Logo Dropdown And  Mobile View Responsive — Logo dropdown
    // ==============================================================================================

    const brandLogoToggle = document.getElementById("brandLogoToggle");
    const dashboardSidebarEl = document.getElementById("dashboardSidebar");

    if (brandLogoToggle && dashboardSidebarEl) {

        // -------------------------------------------------------------------------------------------
        //      Transition always inline — CSS specificity conflicts no longer matter.
        // --------------------------------------------------------------------------------------------
        dashboardSidebarEl.style.setProperty("transition", "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)", "important");

        function openMobileSidebar() {
            dashboardSidebarEl.classList.add("mobile-open");
            dashboardSidebarEl.style.setProperty("display", "flex", "important");
            dashboardSidebarEl.style.setProperty("transform", "translateX(-100%)", "important");

            void dashboardSidebarEl.offsetHeight;

            requestAnimationFrame(function () {
                dashboardSidebarEl.style.setProperty("transform", "translateX(0)", "important");
            });
        }

        function closeMobileSidebar() {
            dashboardSidebarEl.style.setProperty("transform", "translateX(-100%)", "important");

            setTimeout(function () {
                dashboardSidebarEl.classList.remove("mobile-open");
                dashboardSidebarEl.style.setProperty("display", "none", "important");
            }, 500);
        }

        brandLogoToggle.addEventListener("click", function (e) {
            if (window.innerWidth < 768) {
                e.stopPropagation();
                const isOpen = dashboardSidebarEl.classList.contains("mobile-open");

                if (isOpen) {
                    closeMobileSidebar();
                } else {
                    openMobileSidebar();
                }
            }
        });

        //  ----------------------------------------------------------------------------------------------
        //        Outside click pe close
        //  ----------------------------------------------------------------------------------------------

        document.addEventListener("click", function (e) {
            if (
                dashboardSidebarEl.classList.contains("mobile-open") &&
                !dashboardSidebarEl.contains(e.target) &&
                !brandLogoToggle.contains(e.target)
            ) {
                closeMobileSidebar();
            }
        });

        //  ----------------------------------------------------------------------------------------------
        //          Clicking any nav item closes the menu.
        //  ----------------------------------------------------------------------------------------------

        dashboardSidebarEl.querySelectorAll("[data-view]").forEach(function (btn) {
            btn.addEventListener("click", function () {
                if (window.innerWidth < 768) {
                    closeMobileSidebar();
                }
            });
        });
    }
    // ==============================================================================================
    //           Updates the sidebar avatar after the profile photo changes.
    // ==============================================================================================
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

    // ==============================================================================================
    //              Opens the employee joining details modal.
    // ==============================================================================================

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

    // ==============================================================================================
    //                  View work position only section
    // ==============================================================================================
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


    // ==============================================================================================
    //               Exit details View only Section
    // ==============================================================================================
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

    // ==============================================================================================
    //      Renders the nomination table and opens the nomination modal for a selected record.
    // ==============================================================================================

    let nominationData = [];
    function loadNominationInformation() {
        const container = document.getElementById("nominationCardsList");
        container.innerHTML = `<p class="text-muted">Loading...</p>`;

        fetchMyNominees().then(function (res) {
            nominationData = res.data;
            renderNominationTable();
        }).catch(function (error) {
            container.innerHTML = `<p class="text-danger">${escapeHtml(error.message || "Failed to load nominations.")}</p>`;
        });
    }

    // ==============================================================================================
    //          Show on Nomination Card details
    // ==============================================================================================
    function renderNominationTable() {
        const container = document.getElementById("nominationCardsList");

        if (nominationData.length === 0) {
            container.innerHTML = `<p class="text-muted">No nominations added yet.</p>`;
            return;
        }

        container.innerHTML = nominationData.map(function (n) {
            return `
            <div class="education-card">

                <div class="education-card-actions">
                    <button type="button" class="education-edit-btn" data-edit-nomination="${n.id}" title="Edit">✎</button>
                    <button type="button" class="education-delete-btn" data-delete-nomination="${n.id}" title="Delete">🗑</button>
                </div>

                <div class="education-card-header">
                    <div class="education-card-icon">📝</div>
                    <div class="education-card-title">
                        <h5>${escapeHtml(n.name)}</h5>
                        <p>${escapeHtml(n.relationship)}</p>
                    </div>
                </div>

                <div class="education-card-details">
                    <div class="education-detail-item">
                        <span>Date of Birth</span>
                        <strong>${escapeHtml(n.dateOfBirth) || "--"}</strong>
                    </div>
                    <div class="education-detail-item">
                        <span>Share %</span>
                        <strong>${n.sharePercentage}%</strong>
                    </div>
                    <div class="education-detail-item">
                        <span>Minor</span>
                        <strong>${n.minor ? "Yes" : "No"}</strong>
                    </div>
                </div>

            </div>
        `;
        }).join("");

        container.querySelectorAll("[data-edit-nomination]").forEach(function (btn) {
            btn.addEventListener("click", function () {
                openNominationModal(this.dataset.editNomination);
            });
        });

        container.querySelectorAll("[data-delete-nomination]").forEach(function (btn) {
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
                        deleteMyNominee(id).then(function () {
                            nominationData = nominationData.filter(function (n) {
                                return String(n.id) !== String(id);
                            });
                            renderNominationTable();
                        }).catch(function (error) {
                            Swal.fire({
                                icon: "error",
                                title: "Could not remove nomination",
                                text: error.message,
                                confirmButtonColor: "#17a2b8"
                            });
                        });
                    }
                });
            });
        });
    }

    // ==============================================================================================
    //              Open Nomination Model Box
    // ==============================================================================================
    function openNominationModal(id) {
        const modalTitle = document.getElementById("nominationModalTitle");
        document.getElementById("nominationFormMessage").innerHTML = "";

        if (id) {
            const record = nominationData.find(function (n) {
                return String(n.id) === String(id);
            });

            modalTitle.textContent = "Edit Nomination";
            document.getElementById("nominationId").value = record.id;
            document.getElementById("nominationName").value = record.name;
            document.getElementById("nominationRelationship").value = record.relationship;
            document.getElementById("nominationDob").value = record.dateOfBirth || "";
            document.getElementById("nominationPercentage").value = record.sharePercentage;
            document.getElementById("nominationMinor").checked = !!record.minor;
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
            const messageBox = document.getElementById("nominationFormMessage");
            messageBox.innerHTML = "";


            const payload = {
                name: document.getElementById("nominationName").value.trim(),
                relationship: document.getElementById("nominationRelationship").value.trim(),
                dateOfBirth: document.getElementById("nominationDob").value || null,
                sharePercentage: Number(document.getElementById("nominationPercentage").value),
                minor: document.getElementById("nominationMinor").checked
            };

            const apiCall = id
                ? updateMyNominee(id, payload)
                : addMyNominee(payload);

            apiCall.then(function (res) {
                const modal = bootstrap.Modal.getInstance(document.getElementById("nominationModal"));
                if (modal) modal.hide();

                Swal.fire({
                    icon: "success",
                    title: res.message || "Nomination saved.",
                    confirmButtonColor: "#17a2b8"
                });

                loadNominationInformation();
            }).catch(function (error) {
                messageBox.innerHTML = `<div class="custom-alert error">${escapeHtml(error.message || "Something went wrong.")}</div>`;
            });
        });
    }


    // ==============================================================================================
    //               Displays skills as chips and saves the updated skills.
    // ==============================================================================================
    let skillsList = [];

    function loadSkills() {
        const container = document.getElementById("skillsChipsList");
        container.innerHTML = `<p class="text-muted">Loading...</p>`;

        fetchMySkills().then(function (res) {
            skillsList = res.data;
            renderSkillsChips();
        }).catch(function (error) {
            container.innerHTML = `<p class="text-danger">${escapeHtml(error.message || "Failed to load skills.")}</p>`;
        });
    }

    function renderSkillsChips() {
        const container = document.getElementById("skillsChipsList");

        if (skillsList.length === 0) {
            container.innerHTML = `<p class="skills-empty-text">No skills added yet. Add your first skill above.</p>`;
            return;
        }

        const proficiencyLabels = {
            BEGINNER: "Beginner",
            INTERMEDIATE: "Intermediate",
            ADVANCED: "Advanced",
            EXPERT: "Expert"
        };

        container.innerHTML = skillsList.map(function (skill) {
            const levelClass = "level-" + (skill.proficiency || "beginner").toLowerCase();
            const proficiencyText = proficiencyLabels[skill.proficiency] || skill.proficiency || "--";

            return `
            <div class="skill-card">
                <div class="skill-card-header">
                    <span class="skill-card-name">
                        ${escapeHtml(skill.skillName)}
                        ${skill.certified ? `<span class="skill-certified-badge" title="Certified">✔</span>` : ""}
                    </span>
                    <button type="button" class="skill-remove-btn" data-remove-skill="${skill.id}" title="Remove">&times;</button>
                </div>

                <div class="skill-proficiency-label">
                    <span>Proficiency</span>
                    <span>${escapeHtml(proficiencyText)}</span>
                </div>
                <div class="skill-proficiency-track">
                    <div class="skill-proficiency-fill ${levelClass}"></div>
                </div>
            </div>
        `;
        }).join("");

        container.querySelectorAll("[data-remove-skill]").forEach(function (btn) {
            btn.addEventListener("click", function () {
                const id = this.dataset.removeSkill;

                deleteMySkill(id).then(function () {
                    skillsList = skillsList.filter(function (s) {
                        return String(s.id) !== String(id);
                    });
                    renderSkillsChips();
                }).catch(function (error) {
                    Swal.fire({
                        icon: "error",
                        title: "Could not remove skill",
                        text: error.message,
                        confirmButtonColor: "#17a2b8"
                    });
                });
            });
        });
    }

    const addSkillButton = document.getElementById("addSkillButton");
    if (addSkillButton) {
        addSkillButton.addEventListener("click", function () {
            const nameInput = document.getElementById("newSkillInput");
            const proficiencySelect = document.getElementById("newSkillProficiency");
            const certifiedCheckbox = document.getElementById("newSkillCertified");
            const messageBox = document.getElementById("skillsMessage");

            const skillName = nameInput.value.trim();
            messageBox.innerHTML = "";

            if (!skillName) return;

            const payload = {
                skillName: skillName,
                proficiency: proficiencySelect.value,
                certified: certifiedCheckbox.checked
            };

            addMySkill(payload).then(function () {
                nameInput.value = "";
                certifiedCheckbox.checked = false;
                loadSkills();
            }).catch(function (error) {
                messageBox.innerHTML = `<div class="custom-alert error">${escapeHtml(error.message || "Failed to add skill.")}</div>`;
            });
        });
    }


    // =========================================================================================
    //              ADD SKILL — Mobile Modal
    // =========================================================================================
    const addSkillMobileButton = document.getElementById("addSkillMobileButton");
    if (addSkillMobileButton) {
        addSkillMobileButton.addEventListener("click", function () {
            document.getElementById("modalSkillInput").value = "";
            document.getElementById("modalSkillProficiency").value = "BEGINNER";
            document.getElementById("modalSkillCertified").checked = false;
            document.getElementById("addSkillModalMessage").innerHTML = "";

            const modal = new bootstrap.Modal(document.getElementById("addSkillModal"));
            modal.show();
        });
    }

    const modalAddSkillButton = document.getElementById("modalAddSkillButton");
    if (modalAddSkillButton) {
        modalAddSkillButton.addEventListener("click", function () {
            const nameInput = document.getElementById("modalSkillInput");
            const proficiencySelect = document.getElementById("modalSkillProficiency");
            const certifiedCheckbox = document.getElementById("modalSkillCertified");
            const messageBox = document.getElementById("addSkillModalMessage");

            const skillName = nameInput.value.trim();
            messageBox.innerHTML = "";

            if (!skillName) {
                messageBox.innerHTML = `<div class="custom-alert error">Please enter a skill name.</div>`;
                return;
            }

            const payload = {
                skillName: skillName,
                proficiency: proficiencySelect.value,
                certified: certifiedCheckbox.checked
            };

            addMySkill(payload).then(function () {
                const modal = bootstrap.Modal.getInstance(document.getElementById("addSkillModal"));
                if (modal) modal.hide();

                Swal.fire({
                    icon: "success",
                    title: "Skill added successfully.",
                    confirmButtonColor: "#17a2b8",
                    timer: 1500,
                    showConfirmButton: false
                });

                loadSkills();
            }).catch(function (error) {
                messageBox.innerHTML = `<div class="custom-alert error">${escapeHtml(error.message || "Failed to add skill.")}</div>`;
            });
        });
    }


    // ==============================================================================================
    //               Opens the personal information modal.
    // ==============================================================================================
    let currentPersonalInfo = null;

    function loadPersonalInformation() {

        const card = document.getElementById("personalInfoCard");

        if (!card) {
            console.error("personalInfoCard not found");
            return;
        }

        card.innerHTML = `
        <p class="text-muted">Loading personal information...</p>
    `;

        fetchPersonalInfo()
            .then(function (res) {

                console.log("Personal Info API Response:", res);
                console.log("Personal Info DATA:", res?.data);

                currentPersonalInfo = res.data || {};

                const d = currentPersonalInfo;

                card.innerHTML = `
                <div class="profile-info-grid">

                    <div class="profile-info-item">
                        <span class="profile-label">Date of Birth</span>
                        <strong>${escapeHtml(d.dateOfBirth || "--")}</strong>
                    </div>

                    <div class="profile-info-item">
                        <span class="profile-label">Gender</span>
                        <strong>${escapeHtml(d.gender || "--")}</strong>
                    </div>

                    <div class="profile-info-item">
                        <span class="profile-label">Height</span>
                        <strong>${escapeHtml(String(d.heightCm ?? "--"))} cm</strong>
                    </div>

                    <div class="profile-info-item">
                        <span class="profile-label">Weight</span>
                        <strong>${escapeHtml(String(d.weightKg ?? "--"))} kg</strong>
                    </div>

                    <div class="profile-info-item">
                        <span class="profile-label">Blood Group</span>
                        <strong>${escapeHtml(d.bloodGroup || "--")}</strong>
                    </div>

                    <div class="profile-info-item">
                        <span class="profile-label">Marital Status</span>
                        <strong>${escapeHtml(d.maritalStatus || "--")}</strong>
                    </div>

                    <div class="profile-info-item">
                        <span class="profile-label">Religion</span>
                        <strong>${escapeHtml(d.religion || "--")}</strong>
                    </div>

                    <div class="profile-info-item">
                        <span class="profile-label">Nationality</span>
                        <strong>${escapeHtml(d.nationality || "--")}</strong>
                    </div>

                    <div class="profile-info-item">
                        <span class="profile-label">Aadhaar Number</span>
                        <strong>${escapeHtml(d.aadhaarNumber || "--")}</strong>
                    </div>

                    <div class="profile-info-item">
                        <span class="profile-label">PAN Number</span>
                        <strong>${escapeHtml(d.panNumber || "--")}</strong>
                    </div>

                    <div class="profile-info-item">
                        <span class="profile-label">Passport Number</span>
                        <strong>${escapeHtml(d.passportNumber || "--")}</strong>
                    </div>

                    <div class="profile-info-item">
                        <span class="profile-label">Driving License Number</span>
                        <strong>${escapeHtml(d.drivingLicenseNumber || "--")}</strong>
                    </div>

                </div>
            `;
            })
            .catch(function (error) {

                console.error(
                    "Personal Information API failed:",
                    error
                );

                card.innerHTML = `
                <div class="custom-alert error">
                    ${escapeHtml(
                    error.message ||
                    "Failed to load personal information."
                )}
                </div>
            `;
            });
    }

    // ==============================================================================================
    //                  Profile Infomation model Open
    // ==============================================================================================
    async function openPersonalInfoModal() {

        try {

            // Always get latest data from API before opening modal
            const res = await fetchPersonalInfo();

            console.log("Personal Info Modal API Data:", res);

            const d = res?.data || {};

            // Update global data also
            currentPersonalInfo = d;

            // =========================================
            // DATE OF BIRTH
            // =========================================
            const dobField = document.getElementById("dobField");

            if (dobField) {
                dobField.value = d.dateOfBirth || "";
            }

            // =========================================
            // GENDER
            // =========================================
            const genderField = document.getElementById("genderField");

            if (genderField) {
                genderField.value = d.gender || "";
            }

            // =========================================
            // HEIGHT
            // =========================================
            const heightField = document.getElementById("heightField");

            if (heightField) {
                heightField.value =
                    d.heightCm !== null &&
                        d.heightCm !== undefined
                        ? d.heightCm
                        : "";
            }

            // =========================================
            // WEIGHT
            // =========================================
            const weightField = document.getElementById("weightField");

            if (weightField) {
                weightField.value =
                    d.weightKg !== null &&
                        d.weightKg !== undefined
                        ? d.weightKg
                        : "";
            }

            // =========================================
            // BLOOD GROUP
            // =========================================
            const bloodGroupField =
                document.getElementById("bloodGroupField");

            if (bloodGroupField) {
                bloodGroupField.value = d.bloodGroup || "";
            }

            // =========================================
            // MARITAL STATUS
            // =========================================
            const maritalStatusField =
                document.getElementById("maritalStatusField");

            if (maritalStatusField) {
                maritalStatusField.value =
                    d.maritalStatus || "";
            }

            // =========================================
            // RELIGION
            // =========================================
            const religionField =
                document.getElementById("religionField");

            if (religionField) {
                religionField.value =
                    d.religion || "";
            }

            // =========================================
            // NATIONALITY
            // =========================================
            const nationalityField =
                document.getElementById("nationalityField");

            if (nationalityField) {
                nationalityField.value =
                    d.nationality || "";
            }

            // =========================================
            // AADHAAR
            // =========================================
            const aadhaarField =
                document.getElementById("aadhaarNumberField");

            if (aadhaarField) {
                aadhaarField.value =
                    d.aadhaarNumber || "";
            }

            // =========================================
            // PAN
            // =========================================
            const panField =
                document.getElementById("panNumberField");

            if (panField) {
                panField.value =
                    d.panNumber || "";
            }

            // =========================================
            // PASSPORT
            // =========================================
            const passportField =
                document.getElementById("passportNumberField");

            if (passportField) {
                passportField.value =
                    d.passportNumber || "";
            }

            // =========================================
            // DRIVING LICENSE
            // =========================================
            const drivingLicenseField =
                document.getElementById(
                    "drivingLicenseNumberField"
                );

            if (drivingLicenseField) {
                drivingLicenseField.value =
                    d.drivingLicenseNumber || "";
            }

            // =========================================
            // CLEAR OLD MESSAGE
            // =========================================
            const messageBox =
                document.getElementById(
                    "personalInfoFormMessage"
                );

            if (messageBox) {
                messageBox.innerHTML = "";
            }

            // =========================================
            // OPEN MODAL
            // =========================================
            const modalElement =
                document.getElementById(
                    "personalInfoModal"
                );

            if (!modalElement) {
                console.error(
                    "personalInfoModal not found in HTML."
                );
                return;
            }

            const modal =
                bootstrap.Modal.getOrCreateInstance(
                    modalElement
                );

            modal.show();

        } catch (error) {

            console.error(
                "Failed to load Personal Information for modal:",
                error
            );

        }
    }

    const personalInfoForm =
        document.getElementById("personalInfoForm");

    if (personalInfoForm) {

        personalInfoForm.addEventListener("submit", async function (e) {

            e.preventDefault();

            const messageBox =
                document.getElementById("personalInfoFormMessage");

            messageBox.innerHTML = "";

            const payload = {

                dateOfBirth:
                    document.getElementById("dobField").value || null,

                gender:
                    document.getElementById("genderField").value || null,

                heightCm:
                    document.getElementById("heightField").value
                        ? Number(document.getElementById("heightField").value)
                        : null,

                weightKg:
                    document.getElementById("weightField").value
                        ? Number(document.getElementById("weightField").value)
                        : null,

                bloodGroup:
                    document.getElementById("bloodGroupField").value || null,

                maritalStatus:
                    document.getElementById("maritalStatusField").value || null,

                religion:
                    document.getElementById("religionField").value.trim() || null,

                nationality:
                    document.getElementById("nationalityField").value.trim() || null,

                aadhaarNumber:
                    document.getElementById("aadhaarNumberField").value.trim() || null,

                panNumber:
                    document.getElementById("panNumberField").value.trim() || null,

                passportNumber:
                    document.getElementById("passportNumberField").value.trim() || null,

                drivingLicenseNumber:
                    document.getElementById("drivingLicenseNumberField").value.trim() || null
            };

            try {

                const res = await updatePersonalInfo(payload);

                console.log("Personal Info Updated:", res);

                const modalElement =
                    document.getElementById("personalInfoModal");

                const modal =
                    bootstrap.Modal.getInstance(modalElement);

                if (modal) {
                    modal.hide();
                }

                Swal.fire({
                    icon: "success",
                    title: "Personal information updated successfully.",
                    confirmButtonColor: "#17a2b8"
                });

                // Reload Personal Information
                const updatedInfo = await fetchPersonalInfo();

                if (updatedInfo && updatedInfo.success) {
                    currentPersonalInfo = updatedInfo.data || {};
                }

                loadPersonalInformation();

            } catch (error) {

                console.error("Personal Info update failed:", error);

                messageBox.innerHTML = `
                <div class="custom-alert error">
                    ${escapeHtml(
                    error.message ||
                    "Failed to update personal information."
                )}
                </div>
            `;
            }
        });
    }

    const editPersonalInfoButton =
        document.getElementById("editPersonalInfoButton");

    if (editPersonalInfoButton) {
        editPersonalInfoButton.addEventListener(
            "click",
            openPersonalInfoModal
        );
    }

    // ==============================================================================================
    //             Load Emergency Information
    // ==============================================================================================
    let emergencyContactsData = [];

    function loadEmergencyInformation() {
        const container = document.getElementById("emergencyContactsCardsList");
        container.innerHTML = `<p class="text-muted">Loading...</p>`;

        fetchMyEmergencyContacts().then(function (res) {
            emergencyContactsData = res.data;
            renderEmergencyContactsTable();
        });
    }

    // ==============================================================================================
    //              Show on Emergency Card details
    // ==============================================================================================
    function renderEmergencyContactsTable() {
        const container = document.getElementById("emergencyContactsCardsList");

        if (emergencyContactsData.length === 0) {
            container.innerHTML = `<p class="text-muted">No emergency contacts added yet.</p>`;
            return;
        }

        container.innerHTML = emergencyContactsData.map(function (c) {
            return `
            <div class="education-card">

                <div class="education-card-actions">
                    <button type="button" class="education-edit-btn" data-edit-emergency="${c.id}" title="Edit">✎</button>
                    <button type="button" class="education-delete-btn" data-delete-emergency="${c.id}" title="Delete">🗑</button>
                </div>

                <div class="education-card-header">
                    <div class="education-card-icon">🆘</div>
                    <div class="education-card-title">
                        <h5>${escapeHtml(c.name)}</h5>
                        <p>${escapeHtml(c.relationship)}</p>
                    </div>
                </div>

                <div class="education-card-details">
                    <div class="education-detail-item">
                        <span>Phone</span>
                        <strong>${escapeHtml(c.phone) || "--"}</strong>
                    </div>
                    <div class="education-detail-item">
                        <span>Email</span>
                        <strong>${escapeHtml(c.email) || "--"}</strong>
                    </div>
                    <div class="education-detail-item">
                        <span>Address</span>
                        <strong>${escapeHtml(c.address) || "--"}</strong>
                    </div>
                    <div class="education-detail-item">
                        <span>Priority</span>
                        <strong>${c.priority || "--"}</strong>
                    </div>
                </div>

            </div>
        `;
        }).join("");

        container.querySelectorAll("[data-edit-emergency]").forEach(function (btn) {
            btn.addEventListener("click", function () {
                openEmergencyContactModal(this.dataset.editEmergency);
            });
        });

        container.querySelectorAll("[data-delete-emergency]").forEach(function (btn) {
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
    }

    // ==============================================================================================
    //         Open Emergency Cotect Model
    // ==============================================================================================
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
            document.getElementById("emergencyContactEmail").value = contact.email || "";
            document.getElementById("emergencyContactAddress").value = contact.address || "";
            document.getElementById("emergencyContactPriority").value = contact.priority || "";
        } else {
            modalTitle.textContent = "Add Emergency Contact";
            document.getElementById("emergencyContactForm").reset();
            document.getElementById("emergencyContactId").value = "";
        }

        const modal = new bootstrap.Modal(document.getElementById("emergencyContactModal"));
        modal.show();
    }

    // ==============================================================================================
    //              Emergency Contect Button
    // ==============================================================================================
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


    // ==============================================================================================
    //               Displays education details and opens the education modal.
    // ==============================================================================================

    let educationData = [];
    function loadEducationInformation() {
        const container = document.getElementById("educationCardsList");
        container.innerHTML = `<p class="text-muted">Loading...</p>`;

        fetchMyEducationDetails().then(function (res) {
            educationData = res.data;
            renderEducationCards();
        }).catch(function (error) {
            container.innerHTML = `<p class="text-danger">${escapeHtml(error.message || "Failed to load education details.")}</p>`;
        });
    }

    // ==============================================================================================
    //          Show on Education Card Details
    // ==============================================================================================
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
                        <h5>${escapeHtml(e.degree)}</h5>
                        <p class="pt-1">${escapeHtml(e.institution)}</p>
                    </div>
                </div>

                <div class="education-card-details">
                    <div class="education-detail-item">
                        <span>Board/University</span>
                        <strong>${escapeHtml(e.boardOrUniversity) || "--"}</strong>
                    </div>
                    <div class="education-detail-item">
                        <span>Year Of Passing</span>
                        <strong>${e.yearOfPassing || "--"}</strong>
                    </div>
                    <div class="education-detail-item">
                        <span>Specialization</span>
                        <strong>${escapeHtml(e.specialization) || "--"}</strong>
                    </div>
                    <div class="education-detail-item">
                        <span>Percentage/Grade</span>
                        <strong>${escapeHtml(e.percentageOrGrade) || "--"}</strong>
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
                        deleteMyEducationDetail(id).then(function () {
                            educationData = educationData.filter(function (e) {
                                return String(e.id) !== String(id);
                            });
                            renderEducationCards();
                        }).catch(function (error) {
                            Swal.fire({
                                icon: "error",
                                title: "Could not remove record",
                                text: error.message,
                                confirmButtonColor: "#17a2b8"
                            });
                        });
                    }
                });
            });
        });
    }

    // ==============================================================================================
    //              Open Education Model Box
    // ==============================================================================================

    function openEducationModal(id) {
        const modalTitle = document.getElementById("educationModalTitle");
        document.getElementById("educationFormMessage").innerHTML = "";

        if (id) {
            const record = educationData.find(function (e) {
                return String(e.id) === String(id);
            });

            modalTitle.textContent = "Edit Education";
            document.getElementById("educationId").value = record.id;
            document.getElementById("educationQualification").value = record.degree;
            document.getElementById("educationInstitution").value = record.institution;
            document.getElementById("educationBoardOrUniversity").value = record.boardOrUniversity || "";
            document.getElementById("educationSubjects").value = record.specialization || "";
            document.getElementById("educationYear").value = record.yearOfPassing || "";
            document.getElementById("educationPercentage").value = record.percentageOrGrade || "";
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
            const messageBox = document.getElementById("educationFormMessage");
            messageBox.innerHTML = "";
            const payload = {
                degree: document.getElementById("educationQualification").value.trim(),
                institution: document.getElementById("educationInstitution").value.trim(),
                boardOrUniversity: document.getElementById("educationBoardOrUniversity").value.trim(),
                specialization: document.getElementById("educationSubjects").value.trim(),
                yearOfPassing: Number(document.getElementById("educationYear").value.trim()) || null,
                percentageOrGrade: document.getElementById("educationPercentage").value.trim()
            };

            const apiCall = id
                ? updateMyEducationDetail(id, payload)
                : addMyEducationDetail(payload);

            apiCall.then(function (res) {
                const modal = bootstrap.Modal.getInstance(document.getElementById("educationModal"));
                if (modal) modal.hide();
                Swal.fire({
                    icon: "success",
                    title: res.message || "Education record saved.",
                    confirmButtonColor: "#17a2b8"
                });

                loadEducationInformation();
            }).catch(function (error) {
                messageBox.innerHTML = `<div class="custom-alert error">${escapeHtml(error.message || "Something went wrong.")}</div>`;
            });
        });
    }

    // ==============================================================================================
    //             Displays work experience and opens the experience modal.
    // ==============================================================================================

    let experienceData = [];
    function loadExperienceInformation() {
        const container = document.getElementById("experienceCardsList");
        container.innerHTML = `<p class="text-muted">Loading...</p>`;

        fetchMyExperienceDetails().then(function (res) {
            experienceData = res.data;
            renderExperienceTable();
        }).catch(function (error) {
            container.innerHTML = `<p class="text-danger">${escapeHtml(error.message || "Failed to load experience details.")}</p>`;
        });
    }

    // ==============================================================================================
    //          Show on Experience Card details
    // ==============================================================================================
    function renderExperienceTable() {
        const container = document.getElementById("experienceCardsList");

        if (experienceData.length === 0) {
            container.innerHTML = `<p class="text-muted">No experience records added yet.</p>`;
            return;
        }

        container.innerHTML = experienceData.map(function (x) {
            return `
            <div class="education-card">

                <div class="education-card-actions">
                    <button type="button" class="education-edit-btn" data-edit-experience="${x.id}" title="Edit">✎</button>
                    <button type="button" class="education-delete-btn" data-delete-experience="${x.id}" title="Delete">🗑</button>
                </div>

                <div class="education-card-header">
                    <div class="education-card-icon">💼</div>
                    <div class="education-card-title">
                        <h5>${escapeHtml(x.companyName)}</h5>
                        <p>${escapeHtml(x.designation) || "--"}</p>
                    </div>
                </div>

                <div class="education-card-details">
                    <div class="education-detail-item">
                        <span>From Date</span>
                        <strong>${escapeHtml(x.fromDate)}</strong>
                    </div>
                    <div class="education-detail-item">
                        <span>To Date</span>
                        <strong>${x.current ? "--" : (escapeHtml(x.toDate) || "--")}</strong>
                    </div>
                    <div class="education-detail-item">
                        <span>Status</span>
                        <strong>${x.current ? "Current" : "Past"}</strong>
                    </div>
                </div>

            </div>
        `;
        }).join("");

        container.querySelectorAll("[data-edit-experience]").forEach(function (btn) {
            btn.addEventListener("click", function () {
                openExperienceModal(this.dataset.editExperience);
            });
        });

        container.querySelectorAll("[data-delete-experience]").forEach(function (btn) {
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
                        deleteMyExperienceDetail(id).then(function () {
                            experienceData = experienceData.filter(function (x) {
                                return String(x.id) !== String(id);
                            });
                            renderExperienceTable();
                        }).catch(function (error) {
                            Swal.fire({
                                icon: "error",
                                title: "Could not remove record",
                                text: error.message,
                                confirmButtonColor: "#17a2b8"
                            });
                        });
                    }
                });
            });
        });
    }

    // ==============================================================================================
    //          Open Experience Model Box
    // ==============================================================================================

    function openExperienceModal(id) {
        const modalTitle = document.getElementById("experienceModalTitle");
        document.getElementById("experienceFormMessage").innerHTML = "";

        if (id) {
            const record = experienceData.find(function (x) {
                return String(x.id) === String(id);
            });

            modalTitle.textContent = "Edit Experience";
            document.getElementById("experienceId").value = record.id;
            document.getElementById("experienceOrganization").value = record.companyName;
            document.getElementById("experiencePosition").value = record.designation || "";
            document.getElementById("experienceFromDate").value = record.fromDate;
            document.getElementById("experienceToDate").value = record.toDate || "";
            document.getElementById("experienceCurrent").checked = !!record.current;
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
            const messageBox = document.getElementById("experienceFormMessage");
            messageBox.innerHTML = "";

            const isCurrent = document.getElementById("experienceCurrent").checked;

            const payload = {
                companyName: document.getElementById("experienceOrganization").value.trim(),
                designation: document.getElementById("experiencePosition").value.trim(),
                fromDate: document.getElementById("experienceFromDate").value,
                toDate: isCurrent ? null : (document.getElementById("experienceToDate").value || null),
                current: isCurrent
            };

            const apiCall = id
                ? updateMyExperienceDetail(id, payload)
                : addMyExperienceDetail(payload);

            apiCall.then(function (res) {
                const modal = bootstrap.Modal.getInstance(document.getElementById("experienceModal"));
                if (modal) modal.hide();

                // const savedId = id || (res.data && res.data.id);

                Swal.fire({
                    icon: "success",
                    title: res.message || "Experience record saved.",
                    confirmButtonColor: "#17a2b8"
                });

                loadExperienceInformation();
            }).catch(function (error) {
                messageBox.innerHTML = `<div class="custom-alert error">${escapeHtml(error.message || "Something went wrong.")}</div>`;
            });
        });
    }

    // ==============================================================================================
    //               Displays the employee family details.
    // ==============================================================================================

    let familyMembersData = [];
    function loadFamilyInformation() {

        const container =
            document.getElementById("familyMembersCardsList");

        if (!container) {
            return;
        }

        container.innerHTML = `
        <p class="text-muted">Loading...</p>
    `;

        fetchMyFamilyMembers()
            .then(function (res) {

                familyMembersData =
                    Array.isArray(res.data)
                        ? res.data
                        : [];

                renderFamilyTable();

            })
            .catch(function (error) {

                container.innerHTML = `
                <p class="text-danger">
                    ${escapeHtml(
                    error.message ||
                    "Failed to load family members."
                )}
                </p>
            `;
            });
    }

    // ==============================================================================================
    //               Open Family Model form
    // ==============================================================================================
    function renderFamilyTable() {

        const container =
            document.getElementById("familyMembersCardsList");

        if (!container) {
            return;
        }

        if (familyMembersData.length === 0) {

            container.innerHTML = `
            <p class="text-muted">
                No family members added yet.
            </p>
        `;

            return;
        }

        container.innerHTML = familyMembersData.map(function (m) {

            return `
            <div class="education-card">

                <div class="education-card-actions">

                    <button
                        type="button"
                        class="education-edit-btn"
                        data-edit-family="${m.id}"
                        title="Edit">
                        ✎
                    </button>

                    <button
                        type="button"
                        class="education-delete-btn"
                        data-deactivate-family="${m.id}"
                        title="Deactivate">
                        🗑
                    </button>

                </div>

                <div class="education-card-header">

                    <div class="education-card-icon">
                        👪
                    </div>

                    <div class="education-card-title">

                        <h5>
                            ${escapeHtml(m.memberName || "--")}
                        </h5>

                        <p>
                            ${escapeHtml(m.relationship || "--")}
                        </p>

                    </div>

                </div>

                <div class="education-card-details">

                    <div class="education-detail-item">
                        <span>Date of Birth</span>
                        <strong>
                            ${escapeHtml(m.dateOfBirth || "--")}
                        </strong>
                    </div>

                    <div class="education-detail-item">
                        <span>Gender</span>
                        <strong>
                            ${escapeHtml(m.gender || "--")}
                        </strong>
                    </div>

                    <div class="education-detail-item">
                        <span>Mobile Number</span>
                        <strong>
                            ${escapeHtml(m.mobileNumber || "--")}
                        </strong>
                    </div>

                    <div class="education-detail-item">
                        <span>Occupation</span>
                        <strong>
                            ${escapeHtml(m.occupation || "--")}
                        </strong>
                    </div>

                    <div class="education-detail-item">
                        <span>Dependent</span>
                        <strong>
                            ${m.dependent ? "Yes" : "No"}
                        </strong>
                    </div>

                    <div class="education-detail-item">
                        <span>Nominee</span>
                        <strong>
                            ${m.nominee ? "Yes" : "No"}
                        </strong>
                    </div>

                </div>

            </div>
        `;

        }).join("");

        // EDIT
        container
            .querySelectorAll("[data-edit-family]")
            .forEach(function (btn) {

                btn.addEventListener("click", function () {

                    openFamilyMemberModal(
                        this.dataset.editFamily
                    );

                });

            });

        // DEACTIVATE
        container
            .querySelectorAll("[data-deactivate-family]")
            .forEach(function (btn) {

                btn.addEventListener("click", function () {

                    const id =
                        this.dataset.deactivateFamily;

                    Swal.fire({

                        icon: "warning",

                        title: "Deactivate this family member?",

                        showCancelButton: true,

                        confirmButtonText: "Yes, deactivate",

                        confirmButtonColor: "#b3261e"

                    }).then(function (result) {

                        if (!result.isConfirmed) {
                            return;
                        }

                        deactivateMyFamilyMember(id)

                            .then(function (res) {

                                Swal.fire({
                                    icon: "success",
                                    title:
                                        res.message ||
                                        "Family member deactivated.",
                                    confirmButtonColor: "#17a2b8"
                                });

                                loadFamilyInformation();

                            })

                            .catch(function (error) {

                                Swal.fire({
                                    icon: "error",
                                    title:
                                        "Could not deactivate member",
                                    text:
                                        error.message ||
                                        "Something went wrong.",
                                    confirmButtonColor: "#17a2b8"
                                });

                            });

                    });

                });

            });
    }


    // ==============================================================================================
    //                      Family member open model box
    // ==============================================================================================

    function openFamilyMemberModal(id) {

        const modalTitle =
            document.getElementById("familyMemberModalTitle");

        document.getElementById(
            "familyMemberFormMessage"
        ).innerHTML = "";

        if (id) {

            const member =
                familyMembersData.find(function (m) {
                    return String(m.id) === String(id);
                });

            if (!member) {
                return;
            }

            modalTitle.textContent = "Edit Family Member";

            document.getElementById("familyMemberId").value =
                member.id;

            document.getElementById("familyMemberName").value =
                member.memberName || "";

            document.getElementById("familyMemberRelationship").value =
                member.relationship || "";

            document.getElementById("familyMemberDob").value =
                member.dateOfBirth || "";

            document.getElementById("familyMemberGender").value =
                member.gender || "";

            document.getElementById("familyMemberMobile").value =
                member.mobileNumber || "";

            document.getElementById("familyMemberOccupation").value =
                member.occupation || "";

            document.getElementById("familyMemberDependent").value =
                String(!!member.dependent);

            document.getElementById("familyMemberNominee").value =
                String(!!member.nominee);

        } else {

            modalTitle.textContent = "Add Family Member";

            document.getElementById(
                "familyMemberForm"
            ).reset();

            document.getElementById(
                "familyMemberId"
            ).value = "";
        }

        const modal =
            new bootstrap.Modal(
                document.getElementById("familyMemberModal")
            );

        modal.show();
    }

    const addFamilyMemberButton = document.getElementById("addFamilyMemberButton");
    if (addFamilyMemberButton) {
        addFamilyMemberButton.addEventListener("click", function () {
            openFamilyMemberModal(null);
        });
    }
    // ==============================================================================================
    //                  Family Member Details Get
    // ==============================================================================================
    const familyMemberForm = document.getElementById("familyMemberForm");
    if (familyMemberForm) {
        familyMemberForm.addEventListener("submit", function (e) {
            e.preventDefault();

            const id = document.getElementById("familyMemberId").value;
            const messageBox = document.getElementById("familyMemberFormMessage");
            messageBox.innerHTML = "";


            const payload = {

                memberName:
                    document.getElementById("familyMemberName").value.trim(),

                relationship:
                    document.getElementById("familyMemberRelationship").value,

                dateOfBirth:
                    document.getElementById("familyMemberDob").value || null,

                gender:
                    document.getElementById("familyMemberGender").value || null,

                mobileNumber:
                    document.getElementById("familyMemberMobile").value.trim() || null,

                occupation:
                    document.getElementById("familyMemberOccupation").value.trim() || null,

                dependent:
                    document.getElementById("familyMemberDependent").value === "true",

                nominee:
                    document.getElementById("familyMemberNominee").value === "true"
            };

            const apiCall = id
                ? updateMyFamilyMember(id, payload)
                : addMyFamilyMember(payload);

            apiCall.then(function (res) {
                const modal = bootstrap.Modal.getInstance(document.getElementById("familyMemberModal"));
                if (modal) modal.hide();

                Swal.fire({
                    icon: "success",
                    title: res.message || "Family member saved.",
                    confirmButtonColor: "#17a2b8"
                });

                loadFamilyInformation();
            }).catch(function (error) {
                messageBox.innerHTML = `<div class="custom-alert error">${escapeHtml(error.message || "Something went wrong.")}</div>`;
            });
        });
    }

    // ==============================================================================================
    //                     Get Bank Detail
    // ==============================================================================================
    function loadBankInformation() {

        const card = document.getElementById("bankInfoCard");
        const messageBox = document.getElementById("bankInfoMessage");

        if (!card) {
            return;
        }

        if (messageBox) {
            messageBox.innerHTML = "";
        }

        card.innerHTML = `
        <p class="text-muted">Loading...</p>
    `;

        fetchMyBankInformation()
            .then(function (res) {

                const d = res && res.data ? res.data : null;

                if (!d) {
                    card.innerHTML = `
                    <p class="text-muted">
                        No bank information added yet.
                    </p>
                `;
                    return;
                }

                /*
                 * Mask account number.
                 * Example:
                 * 123456789012 → ********9012
                 */
                let maskedAccount = "--";

                if (d.accountNumber) {
                    const accountNumber = String(d.accountNumber);

                    if (accountNumber.length > 4) {
                        maskedAccount =
                            "********" +
                            accountNumber.slice(-4);
                    } else {
                        maskedAccount = accountNumber;
                    }
                }

                card.innerHTML = `
                <div class="profile-info-grid">

                    <!-- Account Holder Name -->
                    <div class="profile-info-item">
                        <span class="profile-label">
                            Account Holder Name
                        </span>
                        <strong>
                            ${escapeHtml(d.accountHolderName || "--")}
                        </strong>
                    </div>

                    <!-- Bank Name -->
                    <div class="profile-info-item">
                        <span class="profile-label">
                            Bank Name
                        </span>
                        <strong>
                            ${escapeHtml(d.bankName || "--")}
                        </strong>
                    </div>

                    <!-- Account Number -->
                    <div class="profile-info-item">
                        <span class="profile-label">
                            Account Number
                        </span>
                        <strong>
                            ${escapeHtml(maskedAccount)}
                        </strong>
                    </div>

                    <!-- IFSC Code -->
                    <div class="profile-info-item">
                        <span class="profile-label">
                            IFSC Code
                        </span>
                        <strong>
                            ${escapeHtml(d.ifscCode || "--")}
                        </strong>
                    </div>

                    <!-- Branch Name -->
                    <div class="profile-info-item">
                        <span class="profile-label">
                            Branch Name
                        </span>
                        <strong>
                            ${escapeHtml(d.branchName || "--")}
                        </strong>
                    </div>

                    <!-- Account Type -->
                    <div class="profile-info-item">
                        <span class="profile-label">
                            Account Type
                        </span>
                        <strong>
                            ${escapeHtml(d.accountType || "--")}
                        </strong>
                    </div>

                    <!-- Account Status -->
                    <div class="profile-info-item">
                        <span class="profile-label">
                            Account Status
                        </span>
                        <strong>
                            ${escapeHtml(d.accountStatus || "--")}
                        </strong>
                    </div>

                </div>
            `;

            })
            .catch(function (error) {

                console.error(
                    "Bank Information API failed:",
                    error
                );

                card.innerHTML = `
                <div class="custom-alert error">
                    ${escapeHtml(
                    error.message ||
                    "Failed to load bank information."
                )}
                </div>
            `;
            });
    }
    // ==============================================================================================
    //               Formats session dates for display
    // ==============================================================================================
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

    // ==============================================================================================
    //               Loads and displays the active session list
    // ==============================================================================================
    function loadSessions() {
        const body = document.getElementById("sessionsModalBody");
        body.innerHTML = `<p class="text-muted text-center py-4">Loading sessions...</p>`;

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
    // ----------------------------------------------------------------------------------------------
    //          Session show drop
    // ----------------------------------------------------------------------------------------------
    const sessionsButton = document.getElementById("sessionsButton");
    if (sessionsButton) {
        sessionsButton.addEventListener("click", function () {
            const modal = new bootstrap.Modal(document.getElementById("sessionsModal"));
            modal.show();
            loadSessions();
            employeeProfileDropdown.classList.remove("show");
        });
    }


    // ==============================================================================================
    //      THEME TOGGLE (Dark / Light)
    // ==============================================================================================
    const themeToggleButton = document.getElementById("themeToggleButton");
    const themeToggleIcon = document.getElementById("themeToggleIcon");

    function applyTheme(theme) {
        document.documentElement.setAttribute("data-theme", theme);
        themeToggleIcon.textContent = theme === "dark" ? "☀️" : "🌙";
        localStorage.setItem("erp_theme", theme);
    }

    const savedTheme = localStorage.getItem("erp_theme") || "light";
    applyTheme(savedTheme);

    if (themeToggleButton) {
        themeToggleButton.addEventListener("click", function () {
            const current = document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
            applyTheme(current === "dark" ? "light" : "dark");
        });
    }





});

const logoutPanel = document.getElementById("logoutPanel");

if (logoutPanel) {
    logoutPanel.addEventListener("click", function () {
        // ----------------------------------------------------------------------------------------------
        //       Use the logout function from auth.js, if available.
        // ----------------------------------------------------------------------------------------------

        if (typeof logout === "function") {
            logout();
            return;
        }
        // ----------------------------------------------------------------------------------------------
        //          Fallback
        // ----------------------------------------------------------------------------------------------
        if (typeof deleteCookie === "function") {
            deleteCookie("authData");
        }
        localStorage.clear();
        sessionStorage.clear();

        window.location.href = "../index.html";
    });
}