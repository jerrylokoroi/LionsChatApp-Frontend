export default class ChatroomManager {
    constructor(apiBaseUrl) {
        this.apiBaseUrl = apiBaseUrl;
        this.chatRoomList = document.getElementById("chatRoomList");
        this.addRoomButton = document.createElement("button");
        this.addRoomButton.textContent = "Add Chatroom";
        this.addRoomButton.addEventListener("click", () => this.addChatroom());
        document.querySelector(".chat-rooms").appendChild(this.addRoomButton);
    }

    async fetchChatrooms() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/chatrooms`);
            if (!response.ok) throw new Error("Failed to fetch chatrooms");
            const result = await response.json();
            console.log("Fetched chatrooms:", result);
            if (!Array.isArray(result.data)) {
                throw new Error("Expected an array of chatrooms");
            }
            this.renderChatRooms(result.data);
        } catch (error) {
            console.error("Error fetching chatrooms:", error.message);
            alert("Unable to fetch chatrooms. Please try again later.");
        }
    }

    renderChatRooms(chatRooms) {
        this.chatRoomList.innerHTML = "";
        chatRooms.forEach(room => {
            const li = document.createElement("li");
            li.textContent = room.name;
            li.dataset.id = room.id;

            // Enter chatroom event
            li.addEventListener("click", () => this.enterChatroom(room.id));

            // Delete button
            const deleteButton = document.createElement("button");
            deleteButton.textContent = "X";
            deleteButton.classList.add("delete-btn");
            deleteButton.addEventListener("click", async (event) => {
                event.stopPropagation(); // Prevent enter event
                await this.deleteChatroom(room.id);
            });

            li.appendChild(deleteButton);
            this.chatRoomList.appendChild(li);
        });
    }

    enterChatroom(roomId) {
        window.location.href = `/chatroom.html?room=${roomId}`;
    }

    async deleteChatroom(roomId) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/chatrooms/${roomId}`, { method: "DELETE" });
            if (!response.ok) throw new Error("Failed to delete chatroom");
            await this.fetchChatrooms();
        } catch (error) {
            console.error(error.message);
        }
    }

    async addChatroom() {
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
}