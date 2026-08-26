const AUTH_ENDPOINTS_NO_REFRESH = [
    "/api/auth/login",
    "/api/auth/refresh-token"
];

async function apiRequest(endpoint, options = {}, _isRetry = false) {
    try {
        // Get current auth data
        let authData = null;

        if (typeof getAuthData === "function") {
            authData = getAuthData();
        }

        const token = authData?.token || null;

        // These endpoints must never trigger refresh + retry
        const skipAuthHandling =
            AUTH_ENDPOINTS_NO_REFRESH.includes(endpoint);

        // Build headers
        const headers = {
            "Content-Type": "application/json",
            ...(options.headers || {})
        };

        // Add JWT when available.
        // Login does not need an Authorization header.
        if (token && endpoint !== "/api/auth/login") {
            headers["Authorization"] = `Bearer ${token}`;
        }

        // IMPORTANT:
        // fetch must NOT be inside `if (token)`.
        // Login and unauthenticated requests must also be sent.
        const response = await fetch(
            API_BASE_URL + endpoint,
            {
                ...options,
                headers
            }
        );

        // Parse response
        let data = {};

        try {
            data = await response.json();
        } catch (error) {
            // Response may have no JSON body
            data = {};
        }

        console.log("API URL:", API_BASE_URL + endpoint);
        console.log("API Status:", response.status);
        console.log("API Response:", data);

        // =========================================================
        // TOKEN EXPIRED
        // Refresh only:
        // 1. For a 401 response
        // 2. Not for login/refresh endpoints
        // 3. Only on the first attempt
        // 4. Only when we actually had a token
        // 5. Only when refreshAccessToken exists
        // =========================================================
        if (
            response.status === 401 &&
            !skipAuthHandling &&
            !_isRetry &&
            token &&
            typeof refreshAccessToken === "function"
        ) {
            try {
                await refreshAccessToken();

                // Retry the original request exactly once
                return await apiRequest(
                    endpoint,
                    options,
                    true
                );

            } catch (refreshError) {
                console.error(
                    "Token refresh failed:",
                    refreshError
                );

                if (typeof logout === "function") {
                    logout();
                }

                throw refreshError;
            }
        }

        // =========================================================
        // HANDLE OTHER API ERRORS
        // =========================================================
        if (!response.ok) {
            const apiError = new Error(
                data?.message ||
                data?.error ||
                `Request failed with status ${response.status}`
            );

            // Keep the complete API response available
            apiError.responseData = data;
            apiError.status = response.status;

            throw apiError;
        }

        // =========================================================
        // SUCCESS
        // =========================================================
        return data;

    } catch (error) {
        console.error("API Error:", error);
        throw error;
    }
}