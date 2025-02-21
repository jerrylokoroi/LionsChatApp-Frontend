class ApiService {
    static init() {
        console.log("ApiService initialized!");
    }

    static async registerUser(username, password) {
        const response = await fetch("https://localhost:7218/api/users/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                userName: username,
                passwordHash: password
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Registration failed");
        }

        return await response.json();
    }
    static async loginUser(username, password) {
        try {
            const response = await fetch("https://localhost:7218/api/users/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    userName: username,
                    password: password
                })
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Login failed");
            }
    
            const data = await response.json();
    
            if (!data.token) {
                throw new Error("No token received from the server");
            }
    
            // Store JWT token in localStorage
            localStorage.setItem("jwtToken", data.token);
    
            console.log("Login successful, token stored!");
            return data.token; // Return token for further use if needed
    
        } catch (error) {
            console.error("Error logging in:", error.message);
            alert("Login failed: " + error.message);
            throw error; // Re-throw error for handling in UI
        }
    }
    
}

ApiService.init();