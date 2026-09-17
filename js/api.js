const AUTH_ENDPOINTS_NO_REFRESH = [
    "/api/auth/login",
    "/api/auth/refresh-token"
];

async function apiRequest(endpoint, options = {}, _isRetry = false) {
    try {
        let authData = null;

        if (typeof getAuthData === "function") {
            authData = getAuthData();
        }

        const token = authData ? authData.token  : null;
        const skipAuthHandling = AUTH_ENDPOINTS_NO_REFRESH.includes(endpoint);
        const headers = {
            "Content-Type": "application/json",
            ...(options.headers || {})
        };

        if (token && !skipAuthHandling) {
            headers["Authorization"] = `Bearer ${token}`;
        }

        const response = await fetch(
            API_BASE_URL + endpoint,
            {
                ...options,
                headers,
                credentials: "include"
            }
        );

        let data = {};

        try {
            data = await response.json();
        } catch (error) {
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

                return await apiRequest(endpoint, options, true);

            } catch (refreshError) {
                console.error("Token refresh failed:", refreshError);

                if (typeof logout === "function" && !options.skipAutoLogoutOn401) {
                    logout();
                }
                throw refreshError;
            }
        }

        if (!response.ok) {
            const apiError = new Error(
                data?.message ||
                data?.error ||
                `Request failed with status ${response.status}`
            );

            apiError.responseData = data;
            apiError.status = response.status;

            throw apiError;
        }

        return data;

    } catch (error) {
        console.error("API Error:", error);
        throw error;
    }
}