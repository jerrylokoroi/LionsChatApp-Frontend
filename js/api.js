async function registerUser(username, password) {
    const response = await fetch("https://localhost:7218/api/users/register", {
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
        throw new Error(errorData.message || "Registration failed");
    }

    return await response.json();
}