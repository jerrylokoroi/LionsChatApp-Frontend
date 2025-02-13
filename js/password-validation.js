class PasswordValidation {
  static validateUsername(username) {
    if (username.length < 3) return 'Username must be at least 3 characters';
    return '';
  }

  static validatePassword(password, confirmPassword) {
    const errors = [];
    if (password.length < 8) errors.push('Password must be at least 8 characters');
    if (password !== confirmPassword) errors.push('Passwords do not match');
    return errors;
  }
}