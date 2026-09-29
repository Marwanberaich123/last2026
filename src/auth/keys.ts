export const ADMIN_KEY = 'kalo@123';

export const OFFICIAL_100_KEYS = [
  'A3F9K2L8Z1', 'M7X4V0C5B9', 'Q1W6E8R3T5', 'Y2U9I4O7P0', 'A5S2D8F1G6',
  'H9J3K6L0Z4', 'X8C1V7B2N5', 'M3Q0W6E9R4', 'T1Y8U2I5O7', 'P6A3S9D0F2',
  'G5H1J8K4L7', 'Z2X9C0V3B6', 'N4M8Q1W5E7', 'R0T3Y6U9I2', 'O5P1A7S4D8',
  'F2G9H0J3K5', 'L1Z8X4C7V9', 'B3N6M0Q2W8', 'E5R1T7Y4U9', 'I0O3P6A2S8',
  'D1F7G4H0J6', 'K9L2Z5X8C3', 'V0B4N7M1Q9', 'W6E2R5T8Y0', 'U3I7O1P4A9',
  'S5D0F3G8H2', 'J7K1L9Z4X6', 'C2V5B8N0M3', 'Q7W4E1R9T6', 'Y2U0I5O8P3',
  'A6S1D9F4G7', 'H3J0K8L5Z2', 'X9C4V1B7N0', 'M5Q2W8E3R6', 'T9Y1U4I0O7',
  'P2A8S5D1F9', 'G0H6J4K7L3', 'Z8X2C9V5B1', 'N6M0Q3W7E4', 'R1T8Y5U2I9',
  'O4P0A3S7D2', 'F8G5H1J9K6', 'L4Z0X7C3V8', 'B2N9M5Q1W6', 'E0R7T4Y8U3',
  'I6O2P9A4S0', 'D5F1G8H3J7', 'K0L6Z2X9C4', 'V1B7N3M8Q5', 'W9E4R0T6Y2',
  'U8I5O1P7A3', 'S9D4F0G6H2', 'J5K1L8Z4X0', 'C7V3B9N6M2', 'Q0W5E1R8T4',
  'Y7U3I9O5P1', 'A8S2D6F0G4', 'H9J5K1L7Z3', 'X6C0V4B8N2', 'M9Q4W1E7R0',
  'T5Y2U8I4O9', 'P3A0S6D1F7', 'G2H8J4K9L5', 'Z1X7C3V0B6', 'N4M0Q5W9E2',
  'R8T3Y7U1I6', 'O0P5A9S4D2', 'F6G1H7J3K8', 'L4Z0X5C9V2', 'B7N3M8Q4W1',
  'E9R5T0Y6U2', 'I7O3P8A4S1', 'D0F5G9H2J6', 'K1L7Z4X8C3', 'V9B5N0M6Q2',
  'W7E3R8T4Y0', 'U6I1O9P5A2', 'S8D3F7G0H4', 'J9K5L2Z6X1', 'C4V8B3N7M0',
  'Q1W6E2R9T5', 'Y0U4I8O3P7', 'A6S1D9F4G2', 'H7J3K0L8Z5', 'X2C6V1B9N4',
  'M8Q3W7E0R5', 'T1Y6U2I9O4', 'P0A5S8D3F7', 'G1H6J2K9L4', 'Z0X7C5V8B3',
  'N9M4Q1W6E2', 'R8T3Y7U0I5', 'O2P6A9S4D1', 'F5G0H8J3K7', 'L2Z9X4C1V6',
  'B8N5M0Q4W9', 'E3R7T1Y6U2', 'I4O0P8A5S3', 'D9F2G7H1J6', 'K0L4Z8X5C9'
];

export function checkKey(rawKey: string): { valid: boolean; isAdmin: boolean; suffix: string; cleanKey: string } {
  if (!rawKey) return { valid: false, isAdmin: false, suffix: '', cleanKey: '' };
  const clean = rawKey.trim();
  
  // Check Admin Key (case-insensitive)
  if (clean.toLowerCase() === ADMIN_KEY.toLowerCase()) {
    return {
      valid: true,
      isAdmin: true,
      suffix: 'ADMIN',
      cleanKey: ADMIN_KEY
    };
  }

  // Check 100 Keys (case-insensitive)
  const cleanUpper = clean.toUpperCase();
  const found = OFFICIAL_100_KEYS.find(k => k.toUpperCase() === cleanUpper);
  if (found) {
    return {
      valid: true,
      isAdmin: false,
      suffix: found.slice(-4),
      cleanKey: found
    };
  }

  return { valid: false, isAdmin: false, suffix: '', cleanKey: '' };
}
