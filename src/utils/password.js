export const passwordMinLength = 8;
export const passwordMaxLength = 64;
export const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/;

export const isValidPassword = (password) => (
  password.length >= passwordMinLength
  && password.length <= passwordMaxLength
  && passwordPattern.test(password)
);

export const passwordRequirements = `Password must be ${passwordMinLength}-${passwordMaxLength} characters and include a lowercase letter, an uppercase letter, a digit, and a special character.`;