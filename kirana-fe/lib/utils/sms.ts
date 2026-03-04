/**
 * SMS Service Utility
 * 
 * This file handles sending OTP codes via SMS using Equence SMS API.
 * 
 * Required Environment Variables:
 * - EQUENCE_USERNAME: Equence account username
 * - EQUENCE_PASSWORD: Equence account password
 * - EQUENCE_PE_ID: Equence Principal Entity ID (PE ID)
 * - EQUENCE_TMPL_ID: Equence Template ID for OTP messages
 * - EQUENCE_SENDER_ID: 6-character sender ID (e.g., "SMSTST")
 * 
 * API Documentation: Equence SMS API Reference Document 2024 V1.0
 */

/**
 * Converts phone number from E.164 format to Equence format
 * E.164 format: +1234567890 or +919876543210
 * Equence format: 1234567890 (without +, with country code)
 * 
 * According to Equence API documentation:
 * - For domestic (India): 10 digits or 12 digits with 91 prefix
 * - For international: 8-15 digits with country code
 */
function formatPhoneNumberForEquence(phoneNumber: string): string {
  // Remove all non-digit characters except keep the number
  let formatted = phoneNumber.replace(/\D/g, "");
  
  // If the number starts with country code (e.g., 91 for India), use as is
  // If it's a 10-digit number (likely Indian), prepend 91
  if (formatted.length === 10 && /^[0-9]{10}$/.test(formatted)) {
    formatted = `91${formatted}`;
  }
  
  // Validate length (Equence accepts 8-15 digits)
  if (formatted.length < 8 || formatted.length > 15) {
    throw new Error(
      `Invalid phone number format. Expected 8-15 digits, got ${formatted.length}`
    );
  }
  
  return formatted;
}

/**
 * Sends an OTP code to the specified phone number using Equence SMS API
 * @param phoneNumber - The phone number in E.164 format (e.g., +1234567890 or +919876543210)
 * @param code - The OTP code to send
 * @throws Error if SMS sending fails
 */
export async function sendOTP(phoneNumber: string, code: string, appHash?: string): Promise<void> {

  // Validate required environment variables
  const username = process.env.EQUENCE_USERNAME;
  const password = process.env.EQUENCE_PASSWORD;
  const peId = process.env.EQUENCE_PE_ID;
  const tmplId = process.env.EQUENCE_TMPL_ID;
  const senderId = process.env.EQUENCE_SENDER_ID || "SMSTST";

  if (!username || !password || !peId || !tmplId) {
    const missingVars = [];
    if (!username) missingVars.push("EQUENCE_USERNAME");
    if (!password) missingVars.push("EQUENCE_PASSWORD");
    if (!peId) missingVars.push("EQUENCE_PE_ID");
    if (!tmplId) missingVars.push("EQUENCE_TMPL_ID");
    
    throw new Error(
      `Missing required Equence SMS configuration: ${missingVars.join(", ")}`
    );
  }

  
  // Create OTP message
  const messageText = `${code} is your Alert Soundbox OTP for login. Do not share it with anyone.`;

  // Prepare request body according to Equence JSON API format
  const requestBody = {
    username,
    password,
    peId,
    tmplId,
    to: phoneNumber,
    from: senderId,
    text: messageText,
  };

  try {
    // Send SMS via Equence API
    const response = await fetch("https://api.equence.in/pushsms", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Equence API error (${response.status}): ${errorText}`
      );
    }

    const result = await response.json();
    // Check for error in response
    if (result.errorCode) {
      throw new Error(
        `Equence API error: ${result.message || "Unknown error"} (Code: ${result.errorCode})`
      );
    }

    // Check response status
    if (result.response && Array.isArray(result.response)) {
      const smsResponse = result.response[0];
      
      if (smsResponse.status === "Success") {
      } else if (smsResponse.status === "failed") {
        throw new Error(
          `Failed to send SMS to ${smsResponse.destination || phoneNumber}`
        );
      }
    } else {
      // Log unexpected response format but don't fail
    }
  } catch (error) {
    console.error("[Send OTP] Equence API error:", error instanceof Error ? error.message : error);
    
    // Re-throw with more context
    if (error instanceof Error) {
      throw new Error(`Failed to send OTP: ${error.message}`);
    }
    throw new Error("Failed to send OTP: Unknown error");
  }
}

/**
 * Sends an OTP code directly via Equence API
 * Calls Equence pushsms API directly (no intermediary server)
 *
 * Required Environment Variables:
 * - EQUENCE_USERNAME: Equence account username
 * - EQUENCE_PASSWORD: Equence account password
 * - EQUENCE_SENDER_ID: Sender ID (e.g., "ALRTSN")
 * - EQUENCE_TMPL_ID: Template ID for OTP messages (e.g., "1707176553065211775")
 *
 * @param phoneNumber - The phone number in E.164 format (e.g., +919876543210)
 * @param code - The OTP code to send
 * @param appHash - The app hash for Android SMS verification (optional)
 * @throws Error if SMS sending fails
 */
export async function sendOTPViaAPI(
  phoneNumber: string,
  code: string,
  appHash?: string
): Promise<void> {
  console.log("[Send OTP] sendOTPViaAPI called", { phone: `${phoneNumber?.slice(0, 4)}****`, hasAppHash: !!appHash });

  // Validate input phone number first
  if (!phoneNumber || typeof phoneNumber !== "string" || phoneNumber.trim() === "") {
    console.error("[SMS] Invalid phone number received:", phoneNumber);
    throw new Error("Phone number is required and must be a non-empty string");
  }

  // Get credentials from environment variables
  const username = process.env.EQUENCE_USERNAME;
  const password = process.env.EQUENCE_PASSWORD;
  const from = process.env.EQUENCE_SENDER_ID || "ALRTSN";
  const tmplId = process.env.EQUENCE_TMPL_ID || "1707176553065211775";

  // Validate environment variables
  if (!username || !password) {
    const missingVars = [];
    if (!username) missingVars.push("EQUENCE_USERNAME");
    if (!password) missingVars.push("EQUENCE_PASSWORD");
    throw new Error(
      `Missing required Equence SMS configuration: ${missingVars.join(", ")}`
    );
  }

  // Format phone number for API (remove + and ensure proper format)
  let formattedPhoneNumber: string;
  try {
    formattedPhoneNumber = formatPhoneNumberForEquence(phoneNumber);
  } catch (error) {
    console.error("[SMS] Error formatting phone number:", error);
    throw new Error(`Invalid phone number format: ${error instanceof Error ? error.message : "Unknown error"}`);
  }

  if (!formattedPhoneNumber || formattedPhoneNumber.trim() === "") {
    throw new Error("Phone number is required and cannot be empty after formatting");
  }

  const phoneNumberString = String(formattedPhoneNumber).trim();
  if (!phoneNumberString || phoneNumberString === "null" || phoneNumberString === "undefined") {
    throw new Error(`Invalid phone number: "${phoneNumberString}" (original: "${phoneNumber}")`);
  }

  // Build message text: "OTP is your Alert Soundbox OTP... Do not share...\n appHash"
  const text = appHash
    ? `${code} is your Alert Soundbox OTP for login. Do not share it with anyone.\n ${appHash}`
    : `${code} is your Alert Soundbox OTP for login. Do not share it with anyone.`;

  const payload = {
    username,
    password,
    to: phoneNumberString,
    from,
    tmplId,
    text,
  };

  try {
    const response = await fetch("https://api.equence.in/pushsms", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[SMS] Equence API error:", errorText);
      throw new Error(
        `Equence API error (${response.status}): ${errorText}`
      );
    }

    const result = await response.json();

    // Check for error in response
    if (result.errorCode) {
      throw new Error(
        `Equence API error: ${result.message || "Unknown error"} (Code: ${result.errorCode})`
      );
    }

    if (result.response && Array.isArray(result.response)) {
      const smsResponse = result.response[0];
      if (smsResponse.status === "failed") {
        throw new Error(
          `Failed to send SMS to ${smsResponse.destination || phoneNumber}`
        );
      }
    }

    console.log(`[SMS] OTP sent successfully to ${phoneNumber}`);
  } catch (error) {
    console.error("[SMS] Error sending OTP via Equence:", error);
    if (error instanceof Error) {
      throw new Error(`Failed to send OTP: ${error.message}`);
    }
    throw new Error("Failed to send OTP: Unknown error");
  }
}

