class PasswordValidation {
  static validateUsername(username) {
    if (username.length < 3 || username.length > 40) {
      return 'Username must be between 3 and 40 characters';
    }
    return '';
  }

  static validatePassword(password, confirmPassword) {
    const errors = [];

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (password !== confirmPassword) {
      errors.push('Passwords do not match');
    }

    return errors;
  }
}