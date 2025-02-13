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

        const usernameErrorMsg = PasswordValidation.validateUsername(username);
        const passwordErrors = PasswordValidation.validatePassword(password, confirmPassword);

        if (usernameErrorMsg) {
            usernameError.textContent = usernameErrorMsg;
            usernameError.classList.add('error-message');
        }
        if (passwordErrors.length) {
            passwordErrors.forEach(error => {
                if (error.includes('Password length')) {
                    passwordError.textContent = error;
                    passwordError.classList.add('error-message');
                }
                if (error.includes('match')) {
                    confirmPasswordError.textContent = error;
                    confirmPasswordError.classList.add('error-message');
                }
            });
        }

        try {
            submitButton.disabled = true;
            messageDiv.textContent = 'Registering...';

            // api call
            throw new Error('Registration failed: API service not implemented');

            messageDiv.textContent = 'Registration successful! Redirecting...';
            messageDiv.classList.add('success-message');
            setTimeout(() => window.location.href = '', 2000); // Redirect to login
        } catch (error) {
            messageDiv.textContent = error.message || 'Registration failed';
            messageDiv.className = 'error';
        } finally {
            submitButton.disabled = false;
        }
    });
});