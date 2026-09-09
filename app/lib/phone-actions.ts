const PHONE_CHARACTERS = /^\+?[\d\s().-]+$/;
const MIN_PHONE_DIGITS = 7;
const MAX_PHONE_DIGITS = 15;

export interface PhoneActions {
  display: string;
  telHref: string;
  whatsappHref: string;
}

export function buildPhoneActions(
  phone?: string | null,
): PhoneActions | null {
  const display = phone?.trim().replace(/^whatsapp:\s*/i, "").trim();

  if (!display || !PHONE_CHARACTERS.test(display)) {
    return null;
  }

  const digits = display.replace(/\D/g, "");
  if (digits.length < MIN_PHONE_DIGITS || digits.length > MAX_PHONE_DIGITS) {
    return null;
  }

  const telNumber = display.startsWith("+") ? `+${digits}` : digits;

  return {
    display,
    telHref: `tel:${telNumber}`,
    whatsappHref: `https://wa.me/${digits}`,
  };
}
