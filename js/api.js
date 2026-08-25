// Endpoints that must never trigger the refresh-and-retry flow -
// refreshing on a failed login attempt or a failed refresh call
// itself would either be meaningless or cause an infinite loop.
const AUTH_ENDPOINTS_NO_REFRESH = [
    "/api/auth/login",
    "/api/auth/refresh-token"
];

async function apiRequest(endpoint, options = {}, _isRetry = false) {
    try {
        let authData = null;
        // Only call getAuthData if the function exists
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

        const response = await fetch(
            API_BASE_URL + endpoint,
            {
                ...options,
                headers: headers
            }
        );

        let data = {};

        try {
            data = await response.json();
        } catch (error) {
            data = {};
        }

        // console.log("API URL:", API_BASE_URL + endpoint);
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
                return apiRequest(endpoint, options, true);
            } catch (refreshError) {
                console.error("Token refresh failed:", refreshError);
                if (typeof logout === "function") {
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
                data.message ||
                `Request failed with status ${response.status}`
            );
            apiError.responseData = data;
            throw apiError;
        }

        return data;

    } catch (error) {

        console.error("API Error:", error);

        throw error;
    }
}