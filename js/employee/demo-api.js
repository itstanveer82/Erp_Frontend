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
        // employeeCode: "EMP-1312",
        // systemId: "SYS-1042",
        // firstName: "Mohd",
        // lastName: "Tanveer Ansari",
        // profileImage: "../assets/image/Image01.jpg",
        // email: "tannu1312@gmail.com",
        // phone: "+91 888193***",
        // departmentName: "IT",
        // designation: "Software Developer",
        // joiningDate: "2026-08-01",
        // reportingManager: "RM",
        // systemStatus: "OUT",
        // dateOfBirth: "1998-04-15",
        // gender: "Male"

    });
}


// Suggested real endpoint: GET /api/employee/me/dashboard-summary
function demoGetDashboardSummary() {
    return demoDelay({
        attendancePercent: 112,
        leaveBalanceDays: 88,
        pendingCorrections: 57,
        lastPayslipMonth: "July 2050"
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


// Suggested real endpoint: GET /api/employee/me/joining-details
function demoGetJoiningDetails() {
    return demoDelay({
        dateOfJoining: "2026-08-01",
        confirmationDate: "2027-02-01",
        status: "Active"
    });
}

// Suggested real endpoint: PUT /api/employee/me/joining-details
function demoUpdateJoiningDetails(payload) {
    console.log("Demo update joining details payload:", payload);
    return demoDelay({ message: "Joining details updated successfully." }, 600);
}

// Suggested real endpoint: GET /api/employee/me/family
function demoGetFamilyMembers() {
    return demoDelay([
        { id: 1, name: "Sunita Pathak", relationship: "Mother", dateOfBirth: "1968-03-12", phone: "9876500001" },
        { id: 2, name: "Aarav Pathak", relationship: "Son", dateOfBirth: "2018-11-05", phone: "" }
    ]);
}

// Suggested real endpoint: POST /api/employee/me/family
function demoAddFamilyMember(payload) {
    console.log("Demo add family member payload:", payload);
    return demoDelay({ message: "Family member added successfully." }, 600);
}

// Suggested real endpoint: PUT /api/employee/me/family/{id}
function demoUpdateFamilyMember(id, payload) {
    console.log("Demo update family member", id, payload);
    return demoDelay({ message: "Family member updated successfully." }, 600);
}

// Suggested real endpoint: DELETE /api/employee/me/family/{id}
function demoDeleteFamilyMember(id) {
    console.log("Demo delete family member", id);
    return demoDelay({ message: "Family member removed successfully." }, 400);
}


// Suggested real endpoint: GET /api/employee/me/personal-information
function demoGetPersonalInformation() {
    return demoDelay({
        height: "5'8\"",
        weight: "70 kg",
        passportNo: "",
        panNo: "ABCDE1234F",
        aadharNo: "XXXX-XXXX-1234",
        religion: "",
        maritalStatus: "Single",
        bloodGroup: "O+",
        shift: "Day"
    });
}

// Suggested real endpoint: PUT /api/employee/me/personal-information
function demoUpdatePersonalInformation(payload) {
    console.log("Demo update personal info payload:", payload);
    return demoDelay({ message: "Personal information updated successfully." }, 600);
}

// Suggested real endpoint: GET /api/employee/me/emergency-contacts
function demoGetEmergencyContacts() {
    return demoDelay([
        { id: 1, name: "Sunita Pathak", relationship: "Mother", phone: "9876500001", address: "Kanpur, UP" }
    ]);
}

// Suggested real endpoint: POST /api/employee/me/emergency-contacts
function demoAddEmergencyContact(payload) {
    console.log("Demo add emergency contact payload:", payload);
    return demoDelay({ message: "Emergency contact added successfully." }, 600);
}

// Suggested real endpoint: PUT /api/employee/me/emergency-contacts/{id}
function demoUpdateEmergencyContact(id, payload) {
    console.log("Demo update emergency contact", id, payload);
    return demoDelay({ message: "Emergency contact updated successfully." }, 600);
}

// Suggested real endpoint: DELETE /api/employee/me/emergency-contacts/{id}
function demoDeleteEmergencyContact(id) {
    console.log("Demo delete emergency contact", id);
    return demoDelay({ message: "Emergency contact removed successfully." }, 400);
}

// Suggested real endpoint: GET /api/employee/me/education
function demoGetEducation() {
    return demoDelay([
        {
            id: 1, qualification: "B.Tech", institution: "IIT Kanpur",
            rollNumber: "20CS1042", subjects: "Computer Science",
            year: "2022", percentage: "82%"
        }
    ]);
}

// Suggested real endpoint: POST /api/employee/me/education
function demoAddEducation(payload) {
    console.log("Demo add education payload:", payload);
    return demoDelay({ message: "Education record added successfully." }, 600);
}

// Suggested real endpoint: PUT /api/employee/me/education/{id}
function demoUpdateEducation(id, payload) {
    console.log("Demo update education", id, payload);
    return demoDelay({ message: "Education record updated successfully." }, 600);
}

// Suggested real endpoint: DELETE /api/employee/me/education/{id}
function demoDeleteEducation(id) {
    console.log("Demo delete education", id);
    return demoDelay({ message: "Education record removed successfully." }, 400);
}

// Suggested real endpoint: GET /api/employee/me/experience
function demoGetExperience() {
    return demoDelay([
        {
            id: 1, fromDate: "2022-07-01", toDate: "2026-07-31",
            organization: "Infosys", position: "Software Engineer",
            reasonOfLeaving: "Better opportunity", lastCtc: "6.5 LPA",
            lastContactNo: "9876543210", lastReferenceNo: "REF-2201",
            totalLength: "4 years 1 month"
        }
    ]);
}

// Suggested real endpoint: POST /api/employee/me/experience
function demoAddExperience(payload) {
    console.log("Demo add experience payload:", payload);
    return demoDelay({ message: "Experience record added successfully." }, 600);
}

// Suggested real endpoint: PUT /api/employee/me/experience/{id}
function demoUpdateExperience(id, payload) {
    console.log("Demo update experience", id, payload);
    return demoDelay({ message: "Experience record updated successfully." }, 600);
}

// Suggested real endpoint: DELETE /api/employee/me/experience/{id}
function demoDeleteExperience(id) {
    console.log("Demo delete experience", id);
    return demoDelay({ message: "Experience record removed successfully." }, 400);
}

// Suggested real endpoint: GET /api/employee/me/work-position
function demoGetWorkPosition() {
    return demoDelay({
        departmentName: "IT",
        designation: "6",
        gradeLevel: "12"
    });
}

// Suggested real endpoint: GET /api/employee/me/exit-details
function demoGetExitDetails() {
    return demoDelay({
        separationMode: "Confirmed",
        lastWorkingDate: ""
    });
}

// Suggested real endpoint: GET /api/employee/me/nominations
function demoGetNominations() {
    return demoDelay([
        { id: 1, nominationFor: "PF", familyMember: "Sunita Pathak", percentage: 100 }
    ]);
}

// Suggested real endpoint: POST /api/employee/me/nominations
function demoAddNomination(payload) {
    console.log("Demo add nomination payload:", payload);
    return demoDelay({ message: "Nomination added successfully." }, 600);
}

// Suggested real endpoint: PUT /api/employee/me/nominations/{id}
function demoUpdateNomination(id, payload) {
    console.log("Demo update nomination", id, payload);
    return demoDelay({ message: "Nomination updated successfully." }, 600);
}

// Suggested real endpoint: DELETE /api/employee/me/nominations/{id}
function demoDeleteNomination(id) {
    console.log("Demo delete nomination", id);
    return demoDelay({ message: "Nomination removed successfully." }, 400);
}

// Suggested real endpoint: GET /api/employee/me/skills
function demoGetSkills() {
    return demoDelay(["Java", "Spring Boot", "MySQL"]);
}

// Suggested real endpoint: PUT /api/employee/me/skills
function demoUpdateSkills(skillsArray) {
    console.log("Demo update skills payload:", skillsArray);
    return demoDelay({ message: "Skills updated successfully." }, 500);
}

// Suggested real endpoint: POST /api/employee/me/profile-image (multipart/form-data)
function demoUpdateProfileImage(file) {
    console.log("Demo update profile image:", file && file.name);
    return demoDelay({ message: "Profile photo updated successfully." }, 600);
}