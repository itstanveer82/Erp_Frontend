// ==========================================================================================
//      Get the logged-in employee's user and profile details.
//      GET /api/users/me  → Fetches basic logged-in user information.
//      GET /api/profiles/me → Fetches employee profile details and profile photo.
//      Used to display the current employee's profile information.
// ==========================================================================================
function fetchCurrentUserProfile() {

    return apiRequest("/api/employees/me")
        .then(function (res) {

            const u = res.data || {};

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
                        overriddenProfileImage || null,


                    // =========================
                    // OTHER PROFILE DATA
                    // =========================

                    dateOfBirth:
                        u.dateOfBirth || "Not available",

                    gender:
                        u.gender || "Not available",

                    reportingManager:
                        u.reportingManager || "Not available"
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


// ==========================================================================================
//      Get and download the logged-in employee's profile photo.
//      GET /api/profile-photos/me          → Fetches the employee's profile photo details.
//      GET /api/profile-photos/me/download → Downloads the employee's profile photo file.
//      Used to display or download the current employee's profile photo.)
// ==========================================================================================
let overriddenProfileImage = null;
let cachedRealPhotoUrl = null;
let realPhotoFetchedOnce = false;
// ---------------------------------------------------------------------------------------
// Fetches real profile photo once, caches the blob-URL,
// ---------------------------------------------------------------------------------------
function getRealProfilePhotoUrl() {
    if (realPhotoFetchedOnce) {
        return Promise.resolve(cachedRealPhotoUrl);
    }
    return photoApiRequest("/api/employees/me/profile-image")
        .then(function (res) {
            const photo = res.data;

            if (!photo || !photo.id) {
                return null;
            }
        })
        .catch(function (error) {
            console.warn("Could not load real profile photo:", error);
            return null;
        })
        .then(function (url) {
            cachedRealPhotoUrl = url;
            realPhotoFetchedOnce = true;
            return url;
        });
}

// ==========================================================================================
//      Clear the cached profile photo so the latest employee photo can be loaded.
//      Used after updating or changing the profile photo.
// ==========================================================================================
function resetProfilePhotoCache() {
    realPhotoFetchedOnce = false;
}

// ==========================================================================================
//      Set an override profile image for the logged-in employee.
//      Used to display a custom image instead of the default profile photo.
// ==========================================================================================
function setOverriddenProfileImage(imageUrl) {
    overriddenProfileImage = imageUrl;
}

// =========================================================================================
//      Common authenticated API request function for profile photo endpoints.
//      Handles the request based on the endpoint provided.
//      Used by profile photo APIs to avoid duplicating authentication/request logic.
// =========================================================================================
async function photoApiRequest(endpoint, options = {}) {
    let authData = null;
    if (typeof getAuthData === "function") {
        authData = getAuthData();
    }
    const token = authData ? authData.token : null;

    const headers = {
        "Content-Type": "application/json",
        ...(options.headers || {})
    };

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }
    const response = await fetch(API_BASE_URL + endpoint, {
        ...options,
        headers: headers,
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
        throw apiError;
    }

    return data;
}

// ============================================================================================
//      Download the employee profile photo as binary data.
//      Creates a Blob URL from the downloaded file for displaying or using the photo.
// ============================================================================================
async function fetchProfilePhotoAsObjectUrl(downloadPath) {
    let authData = null;
    if (typeof getAuthData === "function") {
        authData = getAuthData();
    }
    const token = authData ? authData.token : null;

    const headers = {};
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(API_BASE_URL + downloadPath, {
        headers,
        cache: "no-store"   // sirf ye rakho, URL me query param mat jodo
    });

    if (!response.ok) {
        throw new Error(`Failed to load photo (status ${response.status})`);
    }

    const blob = await response.blob();
    return URL.createObjectURL(blob);
}

// =============================================================================================
//      Upload the logged-in employee's profile photo.
//      API: POST /api/profile-photos/me
//      Sends the selected photo to the server and updates the employee's profile image.
// =============================================================================================
async function uploadProfilePhoto(file) {
    let authData = null;
    if (typeof getAuthData === "function") {
        authData = getAuthData();
    }
    const token = authData ? authData.token : null;

    const formData = new FormData();
    formData.append("file", file);

    const headers = {};
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(API_BASE_URL + "/api/employees/me/profile-image", {
        method: "POST",
        headers: headers,
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

// =============================================================================================
//      Delete the logged-in employee's profile photo.
//      API: DELETE /api/profile-photos/me
//      Removes the current profile photo from the employee's account.
// =============================================================================================
function deleteProfilePhoto() {
    return photoApiRequest("/api/employees/me/profile-image", {
        method: "DELETE"
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
//      API: POST /api/auth/change-password
//      Updates the employee's account password after validating the current password.
// ===========================================================================================
function changeEmployeePassword(oldPassword, newPassword) {
    return apiRequest("/api/auth/change-password", {
        method: "POST",
        body: JSON.stringify({
            oldPassword: oldPassword,
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


// =================================================================================================
//              USER PROFILE (extended)
// =================================================================================================
// ---------------------------------------------------------------------------------------
//  GET /api/profiles/me
// ---------------------------------------------------------------------------------------
function fetchMyExtendedProfile() {
    return apiRequest("/api/profiles/me");
}
// ---------------------------------------------------------------------------------------
//  PUT /api/profiles/me
// ---------------------------------------------------------------------------------------
function updateMyExtendedProfile(payload) {
    return apiRequest("/api/profiles/me", {
        method: "PUT",
        body: JSON.stringify(payload)
    });
}

// =================================================================================================
//                  ADDRESS (Personal Information)
// =================================================================================================
// ---------------------------------------------------------------------------------------
//  GET /api/addresses/me
// ---------------------------------------------------------------------------------------
// ==========================================================================================
//                  Get Logged-in Employee Personal Information
//                  GET /api/employees/me/personal-info
// ==========================================================================================
// function fetchPersonalInfo() {

//     return apiRequest("/api/employees/me/personal-info")
//         .then(function (res) {
//             return {
//                 success: true,
//                 data: res.data || {}
//             };
//         })
//         .catch(function (error) {
//             console.error(
//                 "Personal information API failed:",
//                 error
//             );
//             return {
//                 success: false,
//                 data: {}
//             };
//         });
// }

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



// async function updatePersonalInfo(payload) {
//     console.log("PERSONAL INFO PUT PAYLOAD:", payload);

//     try {
//         const response = await apiRequest(
//             "/api/employees/me/personal-info",
//             {
//                 method: "PUT",
//                 headers: {
//                     "Content-Type": "application/json"
//                 },
//                 body: JSON.stringify(payload),

//                 // 401 par automatic logout mat karo
//                 skipAutoLogoutOn401: true
//             }
//         );

//         console.log("PERSONAL INFO PUT SUCCESS:", response);
//         return response;

//     } catch (error) {
//         console.error("PERSONAL INFO PUT FAILED:", error);
//         console.error("STATUS:", error.status);
//         console.error("RESPONSE:", error.responseData);

//         throw error;
//     }
// }
// ---------------------------------------------------------------------------------------
//  POST /api/addresses/me
// ---------------------------------------------------------------------------------------


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