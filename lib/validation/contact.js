const COMMON_EMAIL_DOMAIN_FIXES = {
  "gmail.con": "gmail.com",
  "gmail.co": "gmail.com",
  "gmail.om": "gmail.com",
  "gmial.com": "gmail.com",
  "gamil.com": "gmail.com",
  "gmali.com": "gmail.com",
  "gmaill.com": "gmail.com",
  "gmqil.com": "gmail.com",

  "hotmail.con": "hotmail.com",
  "hotmai.com": "hotmail.com",
  "hotmal.com": "hotmail.com",

  "outlook.con": "outlook.com",
  "outlok.com": "outlook.com",

  "yahoo.con": "yahoo.com",
  "yaho.com": "yahoo.com",

  "icloud.con": "icloud.com",
  "iclod.com": "icloud.com",
};

export function normalizeEmail(value = "") {
  return String(value)
    .trim()
    .toLowerCase();
}

export function isValidEmailFormat(value = "") {
  const email = normalizeEmail(value);

  if (!email) {
    return false;
  }

  if (email.length > 254) {
    return false;
  }

  const parts = email.split("@");

  if (parts.length !== 2) {
    return false;
  }

  const [localPart, domain] = parts;

  if (!localPart || !domain) {
    return false;
  }

  if (localPart.length > 64) {
    return false;
  }

  if (
    localPart.startsWith(".") ||
    localPart.endsWith(".") ||
    localPart.includes("..")
  ) {
    return false;
  }

  if (
    domain.startsWith(".") ||
    domain.endsWith(".") ||
    domain.includes("..")
  ) {
    return false;
  }

  const emailPattern =
    /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/i;

  return emailPattern.test(email);
}

export function getEmailSuggestion(value = "") {
  const email = normalizeEmail(value);

  const atIndex = email.lastIndexOf("@");

  if (atIndex === -1) {
    return null;
  }

  const localPart = email.slice(0, atIndex);
  const domain = email.slice(atIndex + 1);

  const correctedDomain =
    COMMON_EMAIL_DOMAIN_FIXES[domain];

  if (!correctedDomain) {
    return null;
  }

  return `${localPart}@${correctedDomain}`;
}

export function normalizeAustralianMobile(
  value = "",
) {
  let phone = String(value)
    .trim()
    .replace(/[^\d+]/g, "");

  if (phone.startsWith("+61")) {
    phone = `0${phone.slice(3)}`;
  } else if (phone.startsWith("61")) {
    phone = `0${phone.slice(2)}`;
  }

  return phone.replace(/\D/g, "");
}

export function isValidAustralianMobile(
  value = "",
) {
  const phone =
    normalizeAustralianMobile(value);

  return /^04\d{8}$/.test(phone);
}

export function formatAustralianMobile(
  value = "",
) {
  const phone =
    normalizeAustralianMobile(value);

  if (!/^04\d{8}$/.test(phone)) {
    return phone;
  }

  return `${phone.slice(0, 4)} ${phone.slice(
    4,
    7,
  )} ${phone.slice(7)}`;
}

export function validateContactDetails({
  email,
  confirmEmail,
  phone,
  confirmPhone,
}) {
  const normalizedEmail =
    normalizeEmail(email);

  const normalizedConfirmEmail =
    normalizeEmail(confirmEmail);

  const normalizedPhone =
    normalizeAustralianMobile(phone);

  const normalizedConfirmPhone =
    normalizeAustralianMobile(confirmPhone);

  if (!normalizedEmail) {
    return {
      valid: false,
      field: "email",
      error: "Please enter your email address.",
    };
  }

  if (!isValidEmailFormat(normalizedEmail)) {
    return {
      valid: false,
      field: "email",
      error:
        "Please enter a valid email address.",
    };
  }

  const emailSuggestion =
    getEmailSuggestion(normalizedEmail);

  if (emailSuggestion) {
    return {
      valid: false,
      field: "email",
      error: `Please check your email address. Did you mean ${emailSuggestion}?`,
      suggestion: emailSuggestion,
    };
  }

  if (
    normalizedEmail !==
    normalizedConfirmEmail
  ) {
    return {
      valid: false,
      field: "confirmEmail",
      error:
        "The email addresses do not match.",
    };
  }

  if (!isValidAustralianMobile(phone)) {
    return {
      valid: false,
      field: "phone",
      error:
        "Please enter a valid Australian mobile number, for example 0412 345 678.",
    };
  }

  if (
    normalizedPhone !==
    normalizedConfirmPhone
  ) {
    return {
      valid: false,
      field: "confirmPhone",
      error:
        "The mobile numbers do not match.",
    };
  }

  return {
    valid: true,

    email: normalizedEmail,

    phone: normalizedPhone,
  };
}