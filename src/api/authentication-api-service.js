class AuthenticationApiService {
    static API_BASE_URL = "https://localhost:7218/api";

    static async registerUser(username, password) {
        const response = await fetch(`${this.API_BASE_URL}/users/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userName: username, passwordHash: password })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Registration failed");
        }

        return await response.json();
    }

    static async loginUser(username, password) {
        const response = await fetch(`${this.API_BASE_URL}/users/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userName: username, password })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Login failed");
        }

        const data = await response.json();
        if (!data?.data?.token || !data?.data?.user) {
            throw new Error("Invalid response from server");
        }

        return {
            token: data.data.token,
            username: data.data.user.userName,
            id: data.data.user.id,
            isAdmin: data.data.user.isAdmin
        };
    }
}

export default AuthenticationApiService;