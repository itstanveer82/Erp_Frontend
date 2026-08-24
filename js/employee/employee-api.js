// ================================
// EMPLOYEE API (real backend calls)
// Ye file employee se related saari REAL API calls
// ek jagah rakhti hai — profile, photo, sessions, password.
// UI/rendering code yahan nahi hota, wo employee-dashboard.js me hai.
// Demo/fake data ke liye demo-api.js dekho.
// ================================


// =========================================
// PROFILE (real + demo merge)
// Real endpoint: GET /api/users/me
// =========================================

function fetchCurrentUserProfile() {
    return apiRequest("/api/profile-photos/me")
        .then(function (res) {

            const u = res.data || {};

            return Promise.all([
                demoGetProfile(),
                getRealProfilePhotoUrl()
            ]).then(function (results) {

                const d = results[0].data || {};
                const realPhotoUrl = results[1];

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

                        dateOfBirth: u.dateOfBirth || d.dateOfBirth || "Not available",
                        gender: u.gender || d.gender || "Not available"
                    }
                };
            });
        })
        .catch(function (error) {
            // console.warn("Profile API failed, using demo profile.", error);
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
            // console.log("Photo metadata response:", res);

            const photo = res.data;

            if (!photo || !photo.id) {
                // console.log("No photo record found for this user.");
                return null;
            }

            console.log("Original file:", photo.originalFileName);
            console.log("Download URL:", photo.downloadUrl);

            const downloadPath = photo.downloadUrl || "/api/profile-photos/me/download";
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
        headers: headers
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

    const photoUrl =
        /^https?:\/\//i.test(downloadPath)
            ? downloadPath
            : API_BASE_URL + downloadPath;

    console.log("PHOTO DOWNLOAD URL:", photoUrl);

    const response = await fetch(photoUrl, {
        method: "GET",
        headers: headers
    });

    console.log("PHOTO DOWNLOAD STATUS:", response.status);
    console.log(
        "PHOTO CONTENT TYPE:",
        response.headers.get("content-type")
    );

    if (!response.ok) {
        throw new Error(
            `Failed to load photo (status ${response.status})`
        );
    }

    const blob = await response.blob();

    console.log("PHOTO BLOB TYPE:", blob.type);
    console.log("PHOTO BLOB SIZE:", blob.size);

    if (!blob.size) {
        throw new Error("Photo response is empty");
    }

    const objectUrl = URL.createObjectURL(blob);

    console.log("PHOTO OBJECT URL:", objectUrl);

    return objectUrl;
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

    const response = await fetch(
        API_BASE_URL + "/api/profile-photos/me",
        {
            method: "POST",
            headers: headers,
            body: formData
        }
    );

    let data = {};

    try {
        data = await response.json();
    } catch (error) {
        data = {};
    }

    if (!response.ok) {

        const apiError = new Error(
            data.message ||
            `Upload failed with status ${response.status}`
        );

        apiError.responseData = data;

        throw apiError;
    }

    console.log("PHOTO UPLOAD RESPONSE:", data);

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