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

        const token = authData ? authData.token : null;
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


        if (
            response.status === 401 &&
            !skipAuthHandling &&
            !_isRetry &&
            token &&
            typeof refreshAccessToken === "function"
        ) {
            try {
                console.log("Access token expired. Trying refresh...");

                await refreshAccessToken();

                console.log("Token refresh successful. Retrying:", endpoint);

                return await apiRequest(endpoint, options, true);

            } catch (refreshError) {
                console.error("Token refresh failed:", refreshError);

                // Important:
                // Don't automatically logout if this request explicitly
                // asked to skip logout on 401.
                if (
                    typeof logout === "function" &&
                    !options.skipAutoLogoutOn401
                ) {
                    logout();
                }

                // Throw original API 401 instead of hiding it
                const apiError = new Error(
                    data?.message ||
                    data?.error ||
                    "Unauthorized request"
                );

                apiError.responseData = data;
                apiError.status = response.status;

                throw apiError;
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