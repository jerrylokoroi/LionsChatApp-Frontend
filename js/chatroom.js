class ChatroomManager {
    static apiBaseUrl = "https://localhost:7218/api";

    static async fetchChatrooms() {
        try {
            const token = localStorage.getItem("jwtToken");
            if (!token) throw new Error("User not authenticated");
    
            const response = await fetch(`${this.apiBaseUrl}/chatrooms`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });
    
            if (!response.ok) throw new Error("Failed to fetch chatrooms");
    
            const result = await response.json();
            console.log("Fetched chatrooms:", result);
    
            if (!Array.isArray(result.data)) {
                throw new Error("Expected an array of chatrooms");
            }
    
            this.isAdmin = result.isAdmin;
            this.renderChatRooms(result.data);
        } catch (error) {
            console.error("Error fetching chatrooms:", error.message);
            alert("Unable to fetch chatrooms. Please try again later.");
        }
    }
    

    static renderChatRooms(chatRooms) {
        const chatRoomList = document.getElementById("chatRoomList");
        chatRoomList.innerHTML = "";
        chatRooms.forEach(room => {
            const li = document.createElement("li");
            li.textContent = room.name;
            li.dataset.id = room.id;

            li.addEventListener("click", () => this.enterChatroom(room.id, room.name));

            if (this.isAdmin) {
                const deleteButton = document.createElement("button");
                deleteButton.textContent = "X";
                deleteButton.classList.add("delete-btn");
                deleteButton.addEventListener("click", async (event) => {
                    event.stopPropagation();
                    await this.deleteChatroom(room.id);
                });

                li.appendChild(deleteButton);
            }

            chatRoomList.appendChild(li);
        });

        if (this.isAdmin) {
            const addRoomButton = document.createElement("button");
            addRoomButton.textContent = "Add Chatroom";
            addRoomButton.classList.add("add-btn");
            addRoomButton.addEventListener("click", () => this.addChatroom());
            chatRoomList.appendChild(addRoomButton);
        }
    }

    static enterChatroom(roomId, roomName) {
        document.getElementById("chatRoomName").textContent = roomName;
        this.fetchMessages(roomId);
    }

    static async fetchMessages(roomId) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/chatrooms/${roomId}/messages`);
            if (!response.ok) throw new Error("Failed to fetch messages");
            const result = await response.json();
            console.log("Fetched messages:", result);
            this.renderMessages(result.data);
        } catch (error) {
            console.error("Error fetching messages:", error.message);
            alert("Unable to fetch messages. Please try again later.");
        }
    }

    static renderMessages(messages) {
        const chatMessages = document.getElementById("chatMessages");
        chatMessages.innerHTML = "";
        messages.forEach(message => {
            const div = document.createElement("div");
            div.classList.add("message");
            div.textContent = `${message.sender}: ${message.text}`;
            chatMessages.appendChild(div);
        });
    }

    static async deleteChatroom(roomId) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/chatrooms/${roomId}`, { method: "DELETE" });
            if (!response.ok) throw new Error("Failed to delete chatroom");
            await this.fetchChatrooms();
        } catch (error) {
            console.error(error.message);
        }
    }

    static async addChatroom() {
        const roomName = prompt("Enter new chatroom name:");
        if (roomName) {
            try {
                console.log(`Adding chatroom with name: ${roomName}`);
                const response = await fetch(`${this.apiBaseUrl}/chatrooms/add-chatroom`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ name: roomName })
                });
                console.log(`Response status: ${response.status}`);
                if (!response.ok) throw new Error("Failed to add chatroom");
                await this.fetchChatrooms();
            } catch (error) {
                console.error("Error adding chatroom:", error.message);
                alert("Unable to add chatroom. Please try again later.");
            }
        }
    }

    static async sendMessage(roomId, message) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/chatrooms/${roomId}/messages`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ text: message })
            });
            if (!response.ok) throw new Error("Failed to send message");
            this.fetchMessages(roomId);
        } catch (error) {
            console.error("Error sending message:", error.message);
            alert("Unable to send message. Please try again later.");
        }
    }
}

window.ChatroomManager = ChatroomManager;

document.addEventListener('DOMContentLoaded', () => {
    ChatroomManager.fetchChatrooms();

    const sendMessageButton = document.getElementById("sendMessageButton");
    const messageInput = document.getElementById("messageInput");

    sendMessageButton.addEventListener("click", () => {
        const activeChatroom = document.querySelector(".chat-rooms li.active");
        if (activeChatroom) {
            const roomId = activeChatroom.dataset.id;
            const message = messageInput.value.trim();
            if (message) {
                ChatroomManager.sendMessage(roomId, message);
                messageInput.value = "";
            }
        }
    });

    messageInput.addEventListener("keypress", (event) => {
        if (event.key === "Enter") {
            sendMessageButton.click();
        }
    });
});