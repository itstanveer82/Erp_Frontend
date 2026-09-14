// ==========================================================================================
//      Get the logged-in employee's user and profile details.
//      GET /api/users/me  → Fetches basic logged-in user information.
//      GET /api/profiles/me → Fetches employee profile details and profile photo.
//      Used to display the current employee's profile information.
// ==========================================================================================
function fetchCurrentUserProfile() {
    return Promise.all([
        apiRequest("/api/employees/me"),
        apiRequest("/api/employees/me/profile-image").catch(function (error) {
            if (error.message && error.message.includes("No profile found")) {
                return { data: {} };
            }
            return { data: {} };
        }),
        demoGetProfile(),
        getRealProfilePhotoUrl()
    ]).then(function (results) {

        const u = results[0].data || {};
        const ext = results[1].data || {};
        const d = results[2].data || {};
        const realPhotoUrl = results[3];

        return {
            success: true,
            data: {
                employeeCode: u.employeeCode || d.employeeCode || "--",
                firstName: u.firstName || d.firstName || "",
                lastName: u.lastName || d.lastName || "",
                email: u.email || d.email || "--",
                phone: u.phone || d.phone || "--",

                departmentName: u.departmentName || d.departmentName || "Not available",
                designation: u.designation || d.designation || "Not available",
                joiningDate: u.joiningDate || d.joiningDate || "Not available",
                reportingManager: u.reportingManager || d.reportingManager || "Not available",

                roles: u.roleName ? [u.roleName] : (u.roles || []),
                permissions: u.permissions || [],

                profileImage:
                    overriddenProfileImage ||
                    realPhotoUrl ||
                    u.profileImage ||
                    d.profileImage ||
                    null,

                dateOfBirth: ext.dateOfBirth || u.dateOfBirth || d.dateOfBirth || "Not available",
                gender: ext.gender || u.gender || d.gender || "Not available"
            }
        };
    })
        .catch(function (error) {
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
//  GET /api/family-members/me
// ---------------------------------------------------------------------------------------
function fetchMyFamilyMembers() {
    return apiRequest("/api/family-members/me");
}
// ---------------------------------------------------------------------------------------
//  POST /api/family-members/me
// ---------------------------------------------------------------------------------------
function addMyFamilyMember(payload) {
    return apiRequest("/api/family-members/me", {
        method: "POST",
        body: JSON.stringify(payload)
    });
}
// ---------------------------------------------------------------------------------------
//  PUT /api/family-members/me/{id}
// ---------------------------------------------------------------------------------------
function updateMyFamilyMember(id, payload) {
    return apiRequest(`/api/family-members/me/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload)
    });
}
// ---------------------------------------------------------------------------------------
//  DELETE /api/family-members/me/{id}
// ---------------------------------------------------------------------------------------
function deleteMyFamilyMember(id) {
    return apiRequest(`/api/family-members/me/${id}`, {
        method: "DELETE"
    });
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
    return apiRequest("/api/bank-information/me");
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
function fetchMyAddress() {
    return apiRequest("/api/addresses/me")
        .catch(function (error) {
            return { success: false, data: null };
        });
}
// ---------------------------------------------------------------------------------------
//  POST /api/addresses/me
// ---------------------------------------------------------------------------------------
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