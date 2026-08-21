// ================================
// DEMO API (fake backend for frontend testing)
// Real backend aane ke baad in functions ko
// apiRequest("/api/employee/...") calls se replace karo.
// Har function ke upar wahi real endpoint suggest kiya hai.
// ================================

function demoDelay(data, ms = 400) {
    return new Promise(function (resolve) {
        setTimeout(function () {
            resolve({ success: true, data: data });
        }, ms);
    });
}

// Suggested real endpoint: GET /api/employee/me/profile
function demoGetProfile() {
    return demoDelay({
        employeeCode: "EMP-1312",
        systemId: "SYS-1042",
        firstName: "Mohd",
        lastName: "Eraj Ansari",
        profileImage: "../assets/image/Image01.jpg",
        email: "era1312@gmail.com",
        phone: "+91 888193***",
        departmentName: "IT",
        designation: "Software Developer",
        joiningDate: "2026-08-01",
        reportingManager: "Manmohan Pathak",
        systemStatus: "OUT",
        dateOfBirth: "1998-04-15",
        gender: "Male"

    });
}


// Suggested real endpoint: GET /api/employee/me/dashboard-summary
function demoGetDashboardSummary() {
    return demoDelay({
        attendancePercent: 92,
        leaveBalanceDays: 8,
        pendingCorrections: 1,
        lastPayslipMonth: "July 2026"
    });
}

// Suggested real endpoint: GET /api/employee/me/attendance?month=YYYY-MM
function demoGetMyAttendance() {
    return demoDelay([
        { date: "2026-08-18", checkIn: "09:32 AM", checkOut: "06:15 PM", hours: "8h 43m", status: "PRESENT" },
        { date: "2026-08-17", checkIn: "09:50 AM", checkOut: "06:05 PM", hours: "8h 15m", status: "LATE" },
        { date: "2026-08-16", checkIn: "--", checkOut: "--", hours: "--", status: "ABSENT" },
        { date: "2026-08-15", checkIn: "--", checkOut: "--", hours: "--", status: "LEAVE" },
        { date: "2026-08-14", checkIn: "09:28 AM", checkOut: "06:20 PM", hours: "8h 52m", status: "PRESENT" }
    ]);
}

// =========================
// RESET PASSWORD (from Profile)
// =========================



// if (resetPasswordForm) {
//     resetPasswordForm.addEventListener("submit", function (e) {
//         e.preventDefault();

//         resetPasswordMessage.innerHTML = "";

//         const currentPassword = document.getElementById("currentPasswordField").value;
//         const newPassword = document.getElementById("newPasswordField").value;
//         const confirmPassword = document.getElementById("confirmPasswordField").value;

//         if (newPassword !== confirmPassword) {
//             resetPasswordMessage.innerHTML =
//                 `<div class="custom-alert error">New password and confirm password do not match.</div>`;
//             return;
//         }

//         if (newPassword.length < 6) {
//             resetPasswordMessage.innerHTML =
//                 `<div class="custom-alert error">Password must be at least 6 characters.</div>`;
//             return;
//         }

//         demoChangePassword({
//             currentPassword: currentPassword,
//             newPassword: newPassword
//         }).then(function (res) {
//             resetPasswordMessage.innerHTML =
//                 `<div class="custom-alert success">${escapeHtml(res.data.message)}</div>`;

//             resetPasswordForm.reset();

//             setTimeout(function () {
//                 resetPasswordFormWrapper.classList.add("d-none");
//                 resetPasswordMessage.innerHTML = "";
//             }, 1500);
//         });
//     });
// }

// Suggested real endpoint: POST /api/employee/me/change-password
function demoChangePassword(payload) {
    console.log("Demo change password payload:", payload);
    return demoDelay({ message: "Password updated successfully." }, 600);
}

// Suggested real endpoint: GET /api/employee/me/attendance/calendar?month=YYYY-MM
function demoGetAttendanceCalendar() {
    const statuses = ["PRESENT", "PRESENT", "PRESENT", "LATE", "ABSENT", "LEAVE", "WEEKEND"];
    const days = [];

    for (let i = 1; i <= 31; i++) {
        days.push({
            day: i,
            status: statuses[i % statuses.length]
        });
    }

    return demoDelay(days);
}

// Suggested real endpoint: GET /api/employee/me/leaves
function demoGetMyLeaves() {
    return demoDelay([
        { leaveType: "Sick Leave", fromDate: "2026-08-10", toDate: "2026-08-11", days: 2, status: "APPROVED", appliedOn: "2026-08-08" },
        { leaveType: "Casual Leave", fromDate: "2026-08-20", toDate: "2026-08-20", days: 1, status: "PENDING", appliedOn: "2026-08-17" }
    ]);
}

// Suggested real endpoint: GET /api/employee/me/leave-types
function demoGetLeaveTypes() {
    return demoDelay(["Casual Leave", "Sick Leave", "Earned Leave", "Unpaid Leave"]);
}

// Suggested real endpoint: GET /api/employee/me/leave-balance
function demoGetLeaveBalance() {
    return demoDelay([
        { leaveType: "Casual Leave", remainingDays: 4, totalDays: 12 },
        { leaveType: "Sick Leave", remainingDays: 3, totalDays: 8 },
        { leaveType: "Earned Leave", remainingDays: 1, totalDays: 15 }
    ]);
}

// Suggested real endpoint: POST /api/employee/me/leaves
function demoApplyLeave(payload) {
    console.log("Demo apply leave payload:", payload);
    return demoDelay({ message: "Leave request submitted successfully." }, 600);
}

// Suggested real endpoint: GET /api/employee/me/payroll/current
function demoGetPayroll() {
    return demoDelay({
        month: "August 2026",
        basic: 45000,
        allowances: 8000,
        deductions: 3200,
        netPay: 49800
    });
}

// Suggested real endpoint: GET /api/employee/me/payroll/history
function demoGetPayrollHistory() {
    return demoDelay([
        { month: "August 2026", basic: 45000, allowances: 8000, deductions: 3200, netPay: 49800, status: "PENDING" },
        { month: "July 2026", basic: 45000, allowances: 7500, deductions: 3000, netPay: 49500, status: "PAID" },
        { month: "June 2026", basic: 45000, allowances: 7500, deductions: 3000, netPay: 49500, status: "PAID" },
        { month: "May 2026", basic: 44000, allowances: 7300, deductions: 2500, netPay: 48800, status: "PAID" }
    ]);
}

// Suggested real endpoint: GET /api/employee/me/payslips
function demoGetPayslips() {
    return demoDelay([
        { month: "July 2026", netPay: 49500, status: "PAID" },
        { month: "June 2026", netPay: 49500, status: "PAID" },
        { month: "May 2026", netPay: 48800, status: "PAID" }
    ]);
}

// Suggested real endpoint: GET /api/employee/me/attendance-corrections
function demoGetCorrections() {
    return demoDelay([
        { date: "2026-08-16", change: "Mark as Present (system error)", reason: "Biometric device down that day", status: "PENDING" }
    ]);
}

// Suggested real endpoint: POST /api/employee/me/attendance-corrections
function demoSubmitCorrection(payload) {
    console.log("Demo correction payload:", payload);
    return demoDelay({ message: "Correction request submitted successfully." }, 600);
}

// Suggested real endpoint: GET /api/employee/me/leave-policy
function demoGetLeavePolicy() {
    return demoDelay({
        left: [
            "PPL limit - 3 in a month (Leave should be applied before 15 days).",
            "Quarter or half leaves - 1.5 in a month allowed.",
            "Leave before or after a holiday will convert the holiday as leave."
        ],
        right: [
            "Halfday Leave = Fullday/2 + 1 hour | Quarter Leave = Fullday/4 + 30 min.",
            "Leave in LOP will cause deduction.",
            "LOP limit - 7 in a month.",
            "If leave is not approved, double deduction will be applied."
        ]
    });
}

// Suggested real endpoint: GET /api/employee/me/leave-form-meta
function demoGetLeaveFormMeta() {
    return demoDelay({
        sessions: ["Full Day", "First Half", "Second Half"],
        applyToOptions: [
            { id: 1, name: "Priya Sharma (Reporting Manager)" },
            { id: 2, name: "Amit Khanna (HR)" }
        ],
        ccOptions: [
            { id: 1, name: "Priya Sharma", email: "priya.sharma@example.com" },
            { id: 2, name: "Amit Khanna", email: "amit.khanna@example.com" },
            { id: 3, name: "Neha Gupta", email: "neha.gupta@example.com" }
        ]
    });
}