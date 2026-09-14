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

        const token = authData ? authData.token : null;
        const skipAuthHandling = AUTH_ENDPOINTS_NO_REFRESH.includes(endpoint);
        const headers = {
            "Content-Type": "application/json",
            ...(options.headers || {})
        };

        // Add JWT only when a token exists
        // and this is NOT the login/refresh request

        if (token && !skipAuthHandling) {
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

        // TOKEN EXPIRED -> try a silent refresh, then retry this
        // request exactly once. Only applies to real API calls, not
        // to the login/refresh endpoints themselves, and only when
        // we actually have a token to have expired in the first place.
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

                if (typeof logout === "function" && !options.skipAutoLogoutOn401) {
                    logout();
                }
                throw refreshError;
            }
        }

        // if (!response.ok) {
        //     throw new Error(
        //         data.message ||
        //         `Request failed with status ${response.status}`
        //     );
        // }

        // Edit by Araj

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