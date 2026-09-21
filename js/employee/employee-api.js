let overriddenProfileImage = null;

// ==========================================================================================
//      Resolve the logged-in employee's reporting manager name.
//      1) /me me direct name mile to wahi use hoga
//      2) warna manager id se GET /api/employees/managers me match karega
// ==========================================================================================
async function resolveReportingManagerName(u) {
    console.log("ME data for manager lookup:", u);

    const managerKeys = Object.keys(u).filter(function (k) {
        return /manager/i.test(k);
    });
    console.log("Manager-related keys in /me:", managerKeys);

    let managerId = null;

    for (const key of managerKeys) {
        const val = u[key];

        if (val === null || val === undefined || val === "" || typeof val === "boolean") {
            continue;
        }

        // Direct name (string, numeric nahi)
        if (typeof val === "string" && isNaN(Number(val))) {
            return val;
        }

        // Object: { employeeId, fullName }
        if (typeof val === "object") {
            if (val.fullName) return val.fullName;
            if (val.employeeId != null) managerId = val.employeeId;
            continue;
        }

        // Numeric id
        if (managerId === null) managerId = val;
    }

    const res = await fetchManagers();

    // Manager id mili to list me se naam nikalo
    if (managerId !== null) {
        const match = res.data.find(function (m) {
            return String(m.employeeId) === String(managerId);
        });
        if (match) return match.fullName;
    }

    // ------------------------------------------------------------------
    // TEMP (sirf testing): backend field na bheje to pehla manager dikhao,
    // agar logged-in employee khud wo manager nahi hai.
    // Backend fix hone par ye block DELETE kar dena.
    // ------------------------------------------------------------------
    const other = res.data.find(function (m) {
        return m.employeeCode !== u.employeeCode;
    });
    if (other) return other.fullName;

    return "Not available";
}


// =============================================================================================
//      Upload the logged-in employee's profile photo.
//      API: POST /api/employees/me/profile-image  (multipart/form-data)
// =============================================================================================
async function uploadProfilePhoto(file) {
    const authData = typeof getAuthData === "function" ? getAuthData() : null;
    const token = authData ? authData.token : null;

    const formData = new FormData();
    formData.append("file", file);

    // Content-Type manually mat lagana, browser multipart boundary khud set karta hai
    const response = await fetch(API_BASE_URL + "/api/employees/me/profile-image", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
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
        apiError.status = response.status;
        throw apiError;
    }

    return data;
}

// =============================================================================================
//      Delete the logged-in employee's profile photo.
//      API: DELETE /api/employees/me/profile-image
// =============================================================================================
function deleteProfilePhoto() {
    return photoApiRequest("/api/employees/me/profile-image", {
        method: "DELETE"
    });
}



// ==========================================================================================
//      Profile image (GET /api/employees/me/profile-image)
//      Image token ke saath fetch hoti hai, isliye blob URL banake <img> me lagate hain.
//      Promise cache hota hai, taaki page load par ek hi baar call jaye.
// ==========================================================================================
let realPhotoPromise = null;

async function loadRealProfilePhoto() {
    try {
        const authData = typeof getAuthData === "function" ? getAuthData() : null;
        const token = authData ? authData.token : null;

        const response = await fetch(API_BASE_URL + "/api/employees/me/profile-image", {
            method: "GET",
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            cache: "no-store"
        });

        // 404 = photo set nahi hai
        if (!response.ok) {
            return null;
        }

        const type = response.headers.get("Content-Type") || "";

        // Image seedha binary aati hai
        if (type.startsWith("image/")) {
            return URL.createObjectURL(await response.blob());
        }

        // Fallback: JSON aaye to URL wali field dhundo
        const json = await response.json();
        console.log("Profile image GET returned JSON:", json);
        const d = json.data || {};
        return d.imageUrl || d.url || d.profileImage || null;

    } catch (error) {
        console.warn("Could not load profile photo:", error);
        return null;
    }
}

function getRealProfilePhotoUrl() {
    if (!realPhotoPromise) {
        realPhotoPromise = loadRealProfilePhoto();
    }
    return realPhotoPromise;
}

// Upload / delete ke baad cache clear karo
function resetProfilePhotoCache() {
    if (realPhotoPromise) {
        realPhotoPromise.then(function (url) {
            if (url && String(url).startsWith("blob:")) {
                URL.revokeObjectURL(url);
            }
        });
    }
    realPhotoPromise = null;
}




// ==========================================================================================
//      Get the logged-in employee's user and profile details.
//      GET /api/users/me  → Fetches basic logged-in user information.
//      GET /api/profiles/me → Fetches employee profile details and profile photo.
//      Used to display the current employee's profile information.
// ==========================================================================================
function fetchCurrentUserProfile() {

    return apiRequest("/api/employees/me")
        .then(async function (res) {

            const u = res.data || {};
            const managerName = await resolveReportingManagerName(u);
            const photoUrl = u.hasProfileImage === false ? null : await getRealProfilePhotoUrl();

            return {
                success: true,

                data: {

                    // =========================
                    // BASIC EMPLOYEE INFORMATION
                    // =========================

                    employeeCode: u.employeeCode || "--",

                    firstName: u.firstName || "",

                    lastName: u.lastName || "",

                    email: u.email || "--",

                    phone: u.phone || "--",


                    // =========================
                    // WORK INFORMATION
                    // =========================

                    designation:
                        u.designation || "Not available",

                    joiningDate:
                        u.joiningDate || "Not available",

                    departmentName:
                        u.departmentName || "Not available",

                    roleName:
                        u.roleName || "Not available",

                    status:
                        u.status || "Not available",


                    // =========================
                    // ROLE / PERMISSION
                    // =========================

                    roles:
                        u.roleName
                            ? [u.roleName]
                            : [],

                    permissions:
                        u.permissions || [],


                    // =========================
                    // PROFILE IMAGE FLAGS
                    // =========================

                    hasProfileImage:
                        !!u.hasProfileImage,

                    hasCoverImage:
                        !!u.hasCoverImage,

                    profileImage:
                        overriddenProfileImage || photoUrl,


                    // =========================
                    // OTHER PROFILE DATA
                    // =========================

                    dateOfBirth:
                        u.dateOfBirth || "Not available",

                    gender:
                        u.gender || "Not available",

                    reportingManager: managerName
                }
            };
        })

        .catch(function (error) {

            console.error(
                "Employee profile API failed:",
                error
            );

            // Demo data only if real API fails
            return demoGetProfile();
        });
}



// ============================================================================================
//      Get the logged-in employee's active sessions.
//      API: GET /api/sessions
//      Returns the sessions currently active for the employee.
// ============================================================================================
function getEmployeeSessions() {
    return apiRequest("/api/sessions/my");
}

// ============================================================================================
//      Revoke a selected employee session.
//      API: DELETE /api/sessions/{id}
//      Ends the specified active session using its session ID.
// ============================================================================================
function revokeEmployeeSession(sessionId) {
    return apiRequest(`/api/sessions/${sessionId}`, {
        method: "DELETE"
    });
}

// ===========================================================================================
//      Change the logged-in employee's password.
//      API: PUT /api/employees/me/change-password
//      Body: { currentPassword, newPassword }
// ===========================================================================================
function changeEmployeePassword(currentPassword, newPassword) {
    return photoApiRequest("/api/employees/me/change-password", {
        method: "PUT",
        body: JSON.stringify({
            currentPassword: currentPassword,
            newPassword: newPassword
        })
    });
}

// ===================================================================================================
//      Get the logged-in employee's emergency contacts.
//      API: GET /api/emergency-contacts/me
//      Returns the emergency contact details saved for the employee.
// ===================================================================================================
function fetchMyEmergencyContacts() {
    return apiRequest("/api/emergency-contacts/me")
        .catch(function (error) {
            console.error("❌ Emergency contacts fetch failed:", error.message, error.responseData);
            return { success: false, data: [] };
        });
}

// =================================================================================================
//      Add an emergency contact for the logged-in employee.
//      API: POST /api/emergency-contacts/me
//      Saves a new emergency contact to the employee's profile.
// =================================================================================================
function addMyEmergencyContact(payload) {
    return apiRequest("/api/emergency-contacts/me", {
        method: "POST",
        body: JSON.stringify(payload)
    });
}

// ================================================================================================
//      Update an existing emergency contact for the logged-in employee.
//      API: PUT /api/emergency-contacts/me/{contactId}
//      Updates the emergency contact details using the contact ID.
// ================================================================================================
function updateMyEmergencyContact(contactId, payload) {
    return apiRequest(`/api/emergency-contacts/me/${contactId}`, {
        method: "PUT",
        body: JSON.stringify(payload)
    });
}

// ===============================================================================================
//      Delete an emergency contact for the logged-in employee.
//      API: DELETE /api/emergency-contacts/me/{contactId}
//      Removes the selected emergency contact using the contact ID.
// ===============================================================================================
function deleteMyEmergencyContact(contactId) {
    return apiRequest(`/api/emergency-contacts/me/${contactId}`, {
        method: "DELETE"
    });
}

// ---------------------------------------------------------------------------------------
// GET /api/employees/me/family
// ---------------------------------------------------------------------------------------
function fetchMyFamilyMembers() {
    return apiRequest(
        "/api/employees/me/family",
        {
            method: "GET",
            skipAutoLogoutOn401: true
        }
    );
}




// ---------------------------------------------------------------------------------------
// POST /api/employees/me/family
// ---------------------------------------------------------------------------------------

function addMyFamilyMember(payload) {
    return apiRequest(
        "/api/employees/me/family",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload),
            skipAutoLogoutOn401: true
        }
    );
}



// ---------------------------------------------------------------------------------------
// PUT /api/employees/me/family/{memberID}
// ---------------------------------------------------------------------------------------
function updateMyFamilyMember(id, payload) {
    return apiRequest(
        `/api/employees/me/family/${id}`,
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload),
            skipAutoLogoutOn401: true
        }
    );
}


// ---------------------------------------------------------------------------------------
// DEACTIVATE /api/employees/me/family/{memberID}/deactivate
// ---------------------------------------------------------------------------------------
function deactivateMyFamilyMember(id) {
    return apiRequest(
        `/api/employees/me/family/${id}/deactivate`,
        {
            method: "PUT",
            skipAutoLogoutOn401: true
        }
    );
}

// ==================================================================================================
//              EDUCATION DETAILS
// ==================================================================================================
// ---------------------------------------------------------------------------------------
//  GET /api/education-details/me
// ---------------------------------------------------------------------------------------
function fetchMyEducationDetails() {
    return apiRequest("/api/education-details/me");
}
// ---------------------------------------------------------------------------------------
//  POST /api/education-details/me
// ---------------------------------------------------------------------------------------
function addMyEducationDetail(payload) {
    return apiRequest("/api/education-details/me", {
        method: "POST",
        body: JSON.stringify(payload)
    });
}
// ---------------------------------------------------------------------------------------
//  PUT /api/education-details/me/{id}
// ---------------------------------------------------------------------------------------
function updateMyEducationDetail(id, payload) {
    return apiRequest(`/api/education-details/me/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload)
    });
}
// ---------------------------------------------------------------------------------------
//  DELETE /api/education-details/me/{id}
// ---------------------------------------------------------------------------------------
function deleteMyEducationDetail(id) {
    return apiRequest(`/api/education-details/me/${id}`, {
        method: "DELETE"
    });
}


// ====================================================================================================
//              EXPERIENCE DETAILS
// ====================================================================================================
// ---------------------------------------------------------------------------------------
//  GET /api/experience-details/me
// ---------------------------------------------------------------------------------------
function fetchMyExperienceDetails() {
    return apiRequest("/api/experience-details/me");
}
// ---------------------------------------------------------------------------------------
//  POST /api/experience-details/me
// ---------------------------------------------------------------------------------------
function addMyExperienceDetail(payload) {
    return apiRequest("/api/experience-details/me", {
        method: "POST",
        body: JSON.stringify(payload)
    });
}
// ---------------------------------------------------------------------------------------
//  PUT /api/experience-details/me/{id}
// ---------------------------------------------------------------------------------------
function updateMyExperienceDetail(id, payload) {
    return apiRequest(`/api/experience-details/me/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload)
    });
}
// ---------------------------------------------------------------------------------------
//  DELETE /api/experience-details/me/{id}
// ---------------------------------------------------------------------------------------
function deleteMyExperienceDetail(id) {
    return apiRequest(`/api/experience-details/me/${id}`, {
        method: "DELETE"
    });
}


// ===================================================================================================
//                  EMPLOYEE SKILLS
// ===================================================================================================
// ---------------------------------------------------------------------------------------
//  GET /api/employee-skills/me
// ---------------------------------------------------------------------------------------
function fetchMySkills() {
    return apiRequest("/api/employee-skills/me");
}
// ---------------------------------------------------------------------------------------
//  POST /api/employee-skills/me
// ---------------------------------------------------------------------------------------
function addMySkill(payload) {
    return apiRequest("/api/employee-skills/me", {
        method: "POST",
        body: JSON.stringify(payload)
    });
}
// ---------------------------------------------------------------------------------------
//  DELETE /api/employee-skills/me/{id}
// ---------------------------------------------------------------------------------------
function deleteMySkill(id) {
    return apiRequest(`/api/employee-skills/me/${id}`, {
        method: "DELETE"
    });
}


// ===================================================================================================
//              NOMINEE DETAILS
// ===================================================================================================
// ---------------------------------------------------------------------------------------
//  GET /api/nominee-details/me
// ---------------------------------------------------------------------------------------
function fetchMyNominees() {
    return apiRequest("/api/nominee-details/me");
}
// ---------------------------------------------------------------------------------------
//  POST /api/nominee-details/me
// ---------------------------------------------------------------------------------------
function addMyNominee(payload) {
    return apiRequest("/api/nominee-details/me", {
        method: "POST",
        body: JSON.stringify(payload)
    });
}
// ---------------------------------------------------------------------------------------
//  PUT /api/nominee-details/me/{id}
// ---------------------------------------------------------------------------------------
function updateMyNominee(id, payload) {
    return apiRequest(`/api/nominee-details/me/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload)
    });
}
// ---------------------------------------------------------------------------------------
//  DELETE /api/nominee-details/me/{id}
// ---------------------------------------------------------------------------------------
function deleteMyNominee(id) {
    return apiRequest(`/api/nominee-details/me/${id}`, {
        method: "DELETE"
    });
}


// =================================================================================================
//                  BANK INFORMATION
// =================================================================================================
// ---------------------------------------------------------------------------------------
//  GET /api/bank-information/me
// ---------------------------------------------------------------------------------------
function fetchMyBankInformation() {
    return apiRequest("/api/employees/me/bank-info");
}


function fetchPersonalInfo() {

    return apiRequest(
        "/api/employees/me/personal-info",
        {
            method: "GET",
            skipAutoLogoutOn401: true
        }
    )
        .then(function (res) {

            return {
                success: true,
                data: res.data || {}
            };

        })
        .catch(function (error) {

            console.error(
                "Personal information API failed:",
                error
            );

            return {
                success: false,
                data: {}
            };
        });
}

async function updatePersonalInfo(payload) {

    return apiRequest(
        "/api/employees/me/personal-info",
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload),
            skipAutoLogoutOn401: true
        }
    );
}


async function savePersonalInfo() {

    const payload = {
        dateOfBirth:
            document.getElementById("dateOfBirth")?.value || null,

        gender:
            document.getElementById("gender")?.value || null,

        heightCm:
            document.getElementById("heightCm")?.value
                ? Number(document.getElementById("heightCm").value)
                : null,

        weightKg:
            document.getElementById("weightKg")?.value
                ? Number(document.getElementById("weightKg").value)
                : null,

        bloodGroup:
            document.getElementById("bloodGroup")?.value || null,

        maritalStatus:
            document.getElementById("maritalStatus")?.value || null,

        religion:
            document.getElementById("religion")?.value || null,

        nationality:
            document.getElementById("nationality")?.value || null,

        aadhaarNumber:
            document.getElementById("aadhaarNumber")?.value || null,

        panNumber:
            document.getElementById("panNumber")?.value || null,

        passportNumber:
            document.getElementById("passportNumber")?.value || null,

        drivingLicenseNumber:
            document.getElementById("drivingLicenseNumber")?.value || null
    };

    try {

        const response = await updatePersonalInfo(payload);

        console.log("Personal Info Updated:", response);

        alert("Personal information updated successfully.");

        // GET API se fresh data reload
        await loadPersonalInfo();

    } catch (error) {

        console.error("Unable to update personal information:", error);

        alert(
            error?.message ||
            "Failed to update personal information."
        );
    }
}



function addMyAddress(payload) {
    return apiRequest("/api/addresses/me", {
        method: "POST",
        body: JSON.stringify(payload)
    });
}
// ---------------------------------------------------------------------------------------
//  PUT /api/addresses/me/{id}
// ---------------------------------------------------------------------------------------
function updateMyAddress(id, payload) {
    return apiRequest(`/api/addresses/me/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload)
    });
}


// =================================================================================================
//                  ATTENDANCE - CHECK IN / CHECK OUT
// =================================================================================================
// ---------------------------------------------------------------------------------------
//  POST /api/attendance/check-in
//  Body optional hai — shiftId pass kar sakte ho, ya blank bhej sakte ho
// ---------------------------------------------------------------------------------------
function checkInAttendance(shiftId) {
    const payload = shiftId ? { shiftId: shiftId } : {};

    return apiRequest("/api/attendance/check-in", {
        method: "POST",
        body: JSON.stringify(payload),
        skipAutoLogoutOn401: true
    });
}

// ---------------------------------------------------------------------------------------
//  POST /api/attendance/check-out
// ---------------------------------------------------------------------------------------
function checkOutAttendance() {
    return apiRequest("/api/attendance/check-out", {
        method: "POST",
        body: JSON.stringify({}),
        skipAutoLogoutOn401: true
    });
}

// ==========================================================================================
//      Get the logged-in employee's permissions.
//      API: GET /api/employees/me/permissions
//      Returns: [{ id, permission, grantedByName, grantedAt }]
// ==========================================================================================
function fetchMyPermissions() {
    return apiRequest("/api/employees/me/permissions", {
        method: "GET",
        skipAutoLogoutOn401: true
    })
        .then(function (res) {
            return {
                success: true,
                data: Array.isArray(res.data) ? res.data : []
            };
        })
        .catch(function (error) {
            console.error("Permissions API failed:", error);
            return { success: false, data: [] };
        });
}

// ==========================================================================================
//      Get list of managers (for Apply To / CC To dropdowns)
//      API: GET /api/employees/managers
//      Returns: [{ employeeId, fullName, ... }]
// ==========================================================================================
function fetchManagers() {
    return apiRequest("/api/employees/managers", {
        method: "GET",
        skipAutoLogoutOn401: true
    })
        .then(function (res) {
            return {
                success: true,
                data: Array.isArray(res.data) ? res.data : []
            };
        })
        .catch(function (error) {
            console.error("Managers API failed:", error);
            return { success: false, data: [] };
        });
}