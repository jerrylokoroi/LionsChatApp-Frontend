import ChatroomManager from "./chatroom.js";
document.addEventListener('DOMContentLoaded', () => {
    
    const chatroomManager = new ChatroomManager("https://localhost:7218/api");
    chatroomManager.fetchChatrooms();
    
    const registrationForm = document.getElementById('registrationForm');
    const loginForm = document.getElementById('loginForm');

    const usernameError = document.getElementById('usernameError');
    const passwordError = document.getElementById('passwordError');
    const confirmPasswordError = document.getElementById('confirmPasswordError');
    const messageDiv = document.getElementById('message');
    const buttonText = document.getElementById('buttonText');

    const loadingSpinner = document.getElementById('loadingSpinner');
    const registerButton = document.getElementById('submitButton');
    const loginButton = document.getElementById('loginButton');

    const chatRoomList = document.getElementById('chatRoomList');

    // const chatRooms = [
    //     { name: "Create Chatroom" }
    // ];

    // const chatRoomList = document.getElementById('chatRoomList');

    // chatRooms.forEach(room => {
    //     const li = document.createElement('li');
    //     li.textContent = room.name;
    //     li.addEventListener('click', () => {
    //         window.location.href = room.url; 
    //     });
    //     chatRoomList.appendChild(li);
    // });

    function clearErrors() {

        [usernameError, passwordError, confirmPasswordError, messageDiv].forEach(listItems => {
            if(listItems){
               listItems.textContent = '';
            listItems.className = '';
            }
           
        });
    }

    async function handleFormSubmit(e, formType) {
        e.preventDefault();
        clearErrors();

        const form = formType === "register" ? registrationForm : loginForm;
        const username = form.username.value.trim();
        const password = form.password.value.trim();
        const confirmPassword = formType === "register" ? form.confirmPassword.value.trim() : null;

        let hasErrors = false;

        const usernameErrorMsg = PasswordValidation.validateUsername(username);
        if (usernameErrorMsg) {
            usernameError.textContent = usernameErrorMsg;
            usernameError.classList.add('error-message');
            hasErrors = true;
        }

        if (formType === "register") {
            const passwordErrors = PasswordValidation.validatePassword(password, confirmPassword);
            if (passwordErrors.length) {
                passwordError.innerHTML = passwordErrors.map(error => `<li>${error}</li>`).join('');
                passwordError.classList.add('error-message');
                hasErrors = true;
            }
        }
        if (hasErrors) return;

        try {
            const button = formType === "register" ? registerButton : loginButton;
            button.disabled = true;
            buttonText.textContent = formType === "register" ? "Registering..." : "Logging in...";
            loadingSpinner.style.display = "inline-block";

            if (formType === "register") {
                await ApiService.registerUser(username, password);
                messageDiv.textContent = "Registration successful! Redirecting...";
                messageDiv.classList.add("success-message");
                setTimeout(() => (window.location.href = "login.html"), 2000);
            } else {
                await ApiService.loginUser(username, password);
                messageDiv.textContent = "Login successful! Redirecting...";
                messageDiv.classList.add("success-message");
                setTimeout(() => (window.location.href = "dashboard.html"), 2000);
            }
        }

        catch (error) {
            messageDiv.textContent = error.message || (formType === "register" ? "Registration failed" : "Login failed");
            messageDiv.classList.add('error-message');
        } finally {
            const button = formType === "register" ? registerButton : loginButton;
            button.disabled = false;
            buttonText.textContent = formType === "register" ? "Register" : "Login";
            loadingSpinner.style.display = "none";
        }
    }


    if (registrationForm) {
        registrationForm.addEventListener('submit', (e) => handleFormSubmit(e, "register"));
    }

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => handleFormSubmit(e, "login"));
    }
});

