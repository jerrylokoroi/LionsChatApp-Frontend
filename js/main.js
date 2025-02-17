document.addEventListener('DOMContentLoaded', () => {
    PasswordVisibility.init();

    const form = document.getElementById('registrationForm');
    const usernameError = document.getElementById('usernameError');
    const passwordError = document.getElementById('passwordError');
    const confirmPasswordError = document.getElementById('confirmPasswordError');
    const messageDiv = document.getElementById('message');
    const submitButton = document.getElementById('submitButton');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        [usernameError, passwordError, confirmPasswordError, messageDiv].forEach(listItems => {
            listItems.textContent = '';
            listItems.className = '';
        });

        const username = form.username.value.trim();
        const password = form.password.value.trim();
        const confirmPassword = form.confirmPassword.value.trim();

        let hasErrors = false;

        const usernameErrorMsg = PasswordValidation.validateUsername(username);
        if (usernameErrorMsg) {
            usernameError.textContent = usernameErrorMsg;
            usernameError.classList.add('error-message');
            hasErrors = true;
        }

        const passwordErrors = PasswordValidation.validatePassword(password, confirmPassword);
        if (passwordErrors.length) {
            passwordError.innerHTML = passwordErrors.map(error => `<li>${error}</li>`).join('');
            passwordError.classList.add('error-message');
            hasErrors = true;
        }

        if (hasErrors) return;

        try {
            submitButton.disabled = true;
            messageDiv.textContent = 'Registering...';

           // api call
            const response = await fetch('https://localhost:7218/api/users/register', { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    userName: username,  
                    passwordHash: password  
                })
            });
        
            const data = await response.json();
        
            if (!response.ok) {
                throw new Error(data.message || 'Registration failed');
            }
        
            messageDiv.textContent = 'Registration successful! Redirecting...';
            messageDiv.classList.add('success-message');
        
            setTimeout(() => window.location.href = 'login.html', 2000); //Redirect to login
        } catch (error) {
            messageDiv.textContent = error.message || 'Registration failed';
            messageDiv.className = 'error';
        } finally {
            submitButton.disabled = false;
        }
        
    });
});