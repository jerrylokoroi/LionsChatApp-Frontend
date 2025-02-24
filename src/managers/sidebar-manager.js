import ChatroomApiService from '../api/chatroom-api-service.js';
import UIManager from '../ui/ui-manager.js';

class SidebarManager {
    static async renderSidebar(token, isAdmin, onChatroomSelect) {
        try {
            const chatrooms = await ChatroomApiService.fetchChatrooms(token);
            const chatRoomList = document.getElementById('chatRoomList');
            if (!chatRoomList) return;
            chatRoomList.innerHTML = '';

            if (chatrooms.length === 0) {
                const noChatroomsMessage = document.createElement('li');
                noChatroomsMessage.textContent = 'No chatrooms available';
                chatRoomList.appendChild(noChatroomsMessage);
            } else {
                chatrooms.forEach(chatroom => {
                    const li = document.createElement('li');
                    li.dataset.id = chatroom.id;
                    li.innerHTML = `<span>${chatroom.name}</span>`;

                    li.addEventListener('click', () => {
                        onChatroomSelect(chatroom.id, chatroom.name);
                        history.pushState(null, '', `?roomId=${chatroom.id}&roomName=${encodeURIComponent(chatroom.name)}`);
                    });

                    if (isAdmin) {
                        const deleteButton = document.createElement('button');
                        deleteButton.textContent = 'X';
                        deleteButton.classList.add('delete-btn');
                        deleteButton.addEventListener('click', async (e) => {
                            e.stopPropagation();
                            const confirmed = confirm('Are you sure you want to delete this chatroom?');
                            if (confirmed) {
                                await ChatroomApiService.deleteChatroom(chatroom.id, token);
                                SidebarManager.renderSidebar(token, isAdmin, onChatroomSelect);
                            }
                        });
                        li.appendChild(deleteButton);
                    }

                    chatRoomList.appendChild(li);
                });
            }

            // Add the Add Chatroom button if the user is an admin
            if (isAdmin) {
                const addButton = document.createElement('button');
                addButton.textContent = 'Add Chatroom';
                addButton.classList.add('add-btn');
                addButton.addEventListener('click', async () => {
                    const name = prompt('Enter new chatroom name:');
                    if (name) {
                        await ChatroomApiService.addChatroom(name, localStorage.getItem('id'), token);
                        SidebarManager.renderSidebar(token, isAdmin, onChatroomSelect);
                    }
                });
                chatRoomList.appendChild(addButton);
            }

            // Add the Logout button
            const logoutButton = document.createElement('button');
            logoutButton.textContent = 'Logout';
            logoutButton.classList.add('logout-btn');
            logoutButton.addEventListener('click', () => {
                localStorage.clear();
                window.location.href = 'login.html';
            });
            chatRoomList.appendChild(logoutButton);

        } catch (error) {
            UIManager.showError(error.message);
        }
    }
}

export default SidebarManager;