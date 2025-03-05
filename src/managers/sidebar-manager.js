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

                    // Add chatroom icon
                    const img = document.createElement('img');
                    img.src = chatroom.iconUrl || '/images/default-icon.png'; // Fallback image
                    img.alt = `${chatroom.name} icon`;
                    img.classList.add('chatroom-icon');

                    const nameSpan = document.createElement('span');
                    nameSpan.textContent = chatroom.name;

                    li.appendChild(img);
                    li.appendChild(nameSpan);

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

                    li.addEventListener('click', () => {
                        chatRoomList.querySelectorAll('li').forEach(item => item.classList.remove('active'));
                        li.classList.add('active');
                        localStorage.setItem('selectedChatroomId', chatroom.id);
                        onChatroomSelect(chatroom.id, chatroom.name);
                        history.pushState(null, '', `?roomId=${chatroom.id}&roomName=${encodeURIComponent(chatroom.name)}`);
                    });

                    chatRoomList.appendChild(li);
                });

                const selectedId = localStorage.getItem('selectedChatroomId');
                if (selectedId) {
                    const selectedLi = chatRoomList.querySelector(`li[data-id="${selectedId}"]`);
                    if (selectedLi) {
                        selectedLi.classList.add('active');
                    }
                }
            }

            if (isAdmin) {
                const searchContainer = document.createElement('div');
                searchContainer.classList.add('search-container');

                const searchInput = document.createElement('input');
                searchInput.type = 'text';
                searchInput.placeholder = 'Search users...';
                searchInput.classList.add('search-input');

                const searchResults = document.createElement('ul');
                searchResults.classList.add('search-results');

                searchContainer.appendChild(searchInput);
                searchContainer.appendChild(searchResults);
                chatRoomList.appendChild(searchContainer);

                // Debounce search input for efficiency
                let searchTimeout;
                searchInput.addEventListener('input', () => {
                    clearTimeout(searchTimeout);
                    searchTimeout = setTimeout(async () => {
                        const query = searchInput.value.trim();
                        if (query) {
                            const users = await ChatroomApiService.searchUsers(query, token);
                            SidebarManager.renderSearchResults(users, searchResults, token);
                        } else {
                            searchResults.innerHTML = '';
                        }
                    }, 300); // 300ms delay
                });
            }

            if (isAdmin) {
                const addButton = document.createElement('button');
                addButton.innerHTML = '<i class="fas fa-plus"> Add ChatRoom</i>';
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

            const logoutButton = document.createElement('button');
            logoutButton.innerHTML = '<i class="fas fa-sign-out-alt"> Sign Out</i>';
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

    static renderSearchResults(users, searchResults, token) {
        searchResults.innerHTML = '';
        users.forEach(user => {
            const li = document.createElement('li');
            li.textContent = user.userName;

            const assignButton = document.createElement('button');
            assignButton.textContent = 'Make Admin';
            assignButton.classList.add('assign-btn');
            assignButton.addEventListener('click', async () => {
                try {
                    await ChatroomApiService.assignAdmin(user.userName, token);
                    alert(`${user.userName} is now an admin.`);
                } catch (error) {
                    UIManager.showError(error.message);
                }
            });

            li.appendChild(assignButton);
            searchResults.appendChild(li);
        });
    }
}

export default SidebarManager;