class ChatroomApiService {
    static API_BASE_URL = "https://localhost:7218/api";

    static async fetchChatrooms(token) {
        const response = await fetch(`${this.API_BASE_URL}/chatrooms`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (response.status === 404) {
            return [];
        }

        if (!response.ok) {
            const result = await response.json();
            throw new Error(result.message || "Failed to fetch chatrooms");
        }

        const result = await response.json();
        if (!Array.isArray(result.data)) throw new Error("Chatrooms data is not an array");
        return result.data;
    }

    static async fetchMessages(roomId, token) {
        const response = await fetch(`${this.API_BASE_URL}/chatrooms/${roomId}/messages`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (response.status === 404) {
            console.error(`Chatroom with ID ${roomId} not found`);
            throw new Error("Chatroom not found");
        }

        if (!response.ok) {
            const result = await response.json();
            throw new Error(result.message || "Failed to fetch messages");
        }

        const result = await response.json();
        return result.data || [];
    }

    static async deleteChatroom(roomId, token) {
        const response = await fetch(`${this.API_BASE_URL}/chatrooms/${roomId}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) throw new Error("Failed to delete chatroom");
    }

    static async addChatroom(name, createdBy, token) {
        const now = new Date().toISOString();
        const response = await fetch(`${this.API_BASE_URL}/chatrooms/add-chatroom`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name,
                createdById: createdBy,
                createdAt: now,
                updatedById: createdBy,
                updatedAt: now
            })
        });

        if (!response.ok) throw new Error("Failed to add chatroom");
    }

    static async sendMessage(roomId, message, token) {
        const userId = localStorage.getItem('id');
        const response = await fetch(`${this.API_BASE_URL}/chatrooms/${roomId}/messages`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ text: message, userId })
        });

        if (!response.ok) throw new Error("Failed to send message");
    }

    static async searchUsers(query, token) {
        const response = await fetch(`/api/users/search?query=${encodeURIComponent(query)}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) throw new Error('Failed to search users');
        const data = await response.json();
        return data.data; 
    }

    static async assignAdmin(userName, token) {
        const response = await fetch(`/api/users/assign-admin/${encodeURIComponent(userName)}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) throw new Error('Failed to assign admin');
    }
}

export default ChatroomApiService;