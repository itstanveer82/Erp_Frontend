async function apiRequest(endpoint, options = {}) {
    try {
        let authData = null;
        // Only call getAuthData if the function exists
        if (typeof getAuthData === "function") {
            authData = getAuthData();
        }

        const token = authData ? authData.token : null;

        const headers = {
            "Content-Type": "application/json",
            ...(options.headers || {})
        };

        // Add JWT only when a token exists
        // and this is NOT the login request

        if (token && endpoint !== "/api/auth/login") {
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

        console.log("API URL:", API_BASE_URL + endpoint);
        console.log("API Status:", response.status);
        console.log("API Response:", data);

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