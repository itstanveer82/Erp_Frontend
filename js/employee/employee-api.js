// ================================
// EMPLOYEE API (real backend calls)
// Ye file employee se related saari REAL API calls
// ek jagah rakhti hai — profile, photo, sessions, password.
// UI/rendering code yahan nahi hota, wo employee-dashboard.js me hai.
// Demo/fake data ke liye demo-api.js dekho.
// ================================

function fetchCurrentUserProfile() {
    return Promise.all([
        apiRequest("/api/users/me"),
        apiRequest("/api/profiles/me").catch(function (error) {
        if (error.message && error.message.includes("No profile found")) {
            // Expected case — employee ne extended profile abhi tak fill nahi kiya
            return { data: {} };
        }
        console.error("Unexpected error fetching extended profile:", error);
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


// =========================================
// PROFILE PHOTO (alag microservice, port 8084)
// Real endpoint: GET /api/profile-photos/me
// Real endpoint: POST /api/profile-photos (multipart, field "file")
// =========================================

let overriddenProfileImage = null;
let cachedRealPhotoUrl = null;
let realPhotoFetchedOnce = false;

// Fetches real profile photo once, caches the blob-URL,
// returns null silently if no photo uploaded yet (404) or on error.
function getRealProfilePhotoUrl() {
    if (realPhotoFetchedOnce) {
        return Promise.resolve(cachedRealPhotoUrl);
    }

    console.log("Fetching profile photo metadata...");

    return photoApiRequest("/api/profile-photos/me")
        .then(function (res) {
            const photo = res.data;

            if (!photo || !photo.id) {
                return null;
            }

            //  downloadUrl backend se lene ki jagah, hardcode "/me/download" —
            // kyunki ye hamesha logged-in user ki apni photo hai, koi permission nahi chahiye
            const downloadPath = "/api/profile-photos/me/download";
            console.log("Downloading photo binary from:", downloadPath);

            return fetchProfilePhotoAsObjectUrl(downloadPath)
                .then(function (blobUrl) {
                    console.log("Photo blob URL created:", blobUrl);
                    return blobUrl;
                });
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

function resetProfilePhotoCache() {
    realPhotoFetchedOnce = false;
}

function setOverriddenProfileImage(imageUrl) {
    overriddenProfileImage = imageUrl;
}

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

// Downloads the actual image bytes (with auth header) and
// converts them into a temporary browser URL for <img src>
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

// Suggested endpoint — CONFIRM with backend developer:
// POST http://<photo-service>/api/profile-photos  (multipart/form-data, field name "file")
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

    const response = await fetch(API_BASE_URL + "/api/profile-photos/me", {
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

// Real endpoint: DELETE /api/profile-photos/me
function deleteProfilePhoto() {
    return photoApiRequest("/api/profile-photos/me", {
        method: "DELETE"
    });
}


// =========================================
// SESSIONS
// Real endpoint: GET /api/sessions
// Real endpoint: DELETE /api/sessions/{id}
// =========================================

function getEmployeeSessions() {
    return apiRequest("/api/sessions");
}

function revokeEmployeeSession(sessionId) {
    return apiRequest(`/api/sessions/${sessionId}`, {
        method: "DELETE"
    });
}


// =========================================
// CHANGE PASSWORD
// Real endpoint: POST /api/auth/change-password
// =========================================

function changeEmployeePassword(oldPassword, newPassword) {
    return apiRequest("/api/auth/change-password", {
        method: "POST",
        body: JSON.stringify({
            oldPassword: oldPassword,
            newPassword: newPassword
        })
    });
}