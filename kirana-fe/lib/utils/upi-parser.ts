/**
 * UPI Notification Parser
 * Parses payment notifications from various Indian UPI apps
 * and extracts amount and sender information
 */

export interface UPIParserResult {
  amount: number; // Amount in rupees
  from: string; // Sender name or identifier
  isValid: boolean; // True if this is a valid received payment
  rawText: string; // Original notification text
}

/**
 * Package names for various UPI apps
 */
const UPI_APP_PACKAGES = {
  PHONEPE: "com.phonepe.app",
  GOOGLE_PAY: "com.google.android.apps.nbu.paisa.user",
  PAYTM: "net.one97.paytm",
  BHIM: "in.org.npci.upiapp",
  AMAZON_PAY: "in.amazon.mShop.android.shopping",
  MOBIKWIK: "com.mobikwik_new",
  FREECHARGE: "com.freecharge.android",
  // Add more as needed
} as const;

/**
 * Template patterns for specific UPI apps (high priority)
 * These are checked first before falling back to generic parsing
 */
const UPI_TEMPLATES = [
  // PhonePe: "Ved Prakash Yadav has sent ₹1to your bank account Federal Bank-8751"
  {
    pattern: /^(.+?)\s+has\s+sent\s+₹(\d+(?:,\d+)*(?:\.\d{2})?)\s*to\s+your\s+bank\s+account/i,
    extractAmount: (match: RegExpMatchArray) => parseFloat(match[2].replace(/,/g, "")),
    extractSender: (match: RegExpMatchArray) => match[1].trim(),
    isValid: true,
  },
  // Paytm: "Received ₹1 from Ved Prakash Yadav\nDeposited in your Jupiter (Federal Bank) account"
  {
    pattern: /^Received\s+₹(\d+(?:,\d+)*(?:\.\d{2})?)\s+from\s+(.+?)(?:\n|Deposited|$)/i,
    extractAmount: (match: RegExpMatchArray) => parseFloat(match[1].replace(/,/g, "")),
    extractSender: (match: RegExpMatchArray) => match[2].trim(),
    isValid: true,
  },
  // Google Pay: "Ved Prakash Yadav paid you ₹100.00\nPaid via SuperMoney UPI"
  {
    pattern: /^(.+?)\s+paid\s+you\s+₹(\d+(?:,\d+)*(?:\.\d{2})?)(?:\n|Paid|$)/i,
    extractAmount: (match: RegExpMatchArray) => parseFloat(match[2].replace(/,/g, "")),
    extractSender: (match: RegExpMatchArray) => match[1].trim(),
    isValid: true,
  },
  // BharatPe: "₹100 received from Ved Prakash Yadav"
  {
    pattern: /^₹(\d+(?:,\d+)*(?:\.\d{2})?)\s+received\s+from\s+(.+?)(?:\s|$)/i,
    extractAmount: (match: RegExpMatchArray) => parseFloat(match[1].replace(/,/g, "")),
    extractSender: (match: RegExpMatchArray) => match[2].trim(),
    isValid: true,
  },
  // Super Money: "₹50.00 received from Ved Prakash Yadav\nDeposited in you Federal bank on..."
  {
    pattern: /^₹(\d+(?:,\d+)*(?:\.\d{2})?)\s+received\s+from\s+(.+?)(?:\n|Deposited|$)/i,
    extractAmount: (match: RegExpMatchArray) => parseFloat(match[1].replace(/,/g, "")),
    extractSender: (match: RegExpMatchArray) => match[2].trim(),
    isValid: true,
  },
  // PayZapp: "You received ₹1 from Ved Prakash Yadav"
  {
    pattern: /^You\s+received\s+₹(\d+(?:,\d+)*(?:\.\d{2})?)\s+from\s+(.+?)(?:\s|$)/i,
    extractAmount: (match: RegExpMatchArray) => parseFloat(match[1].replace(/,/g, "")),
    extractSender: (match: RegExpMatchArray) => match[2].trim(),
    isValid: true,
  },
  // Mobikwik: "Money Recevied via UPI\nYou have received ₹50.0 from 9654404595@slc"
  {
    pattern: /You\s+have\s+received\s+₹(\d+(?:,\d+)*(?:\.\d{2})?)\s+from\s+(.+?)(?:\n|$)/i,
    extractAmount: (match: RegExpMatchArray) => parseFloat(match[1].replace(/,/g, "")),
    extractSender: (match: RegExpMatchArray) => match[2].trim(),
    isValid: true,
  },
  // Navi: "Received ₹1 from Ved Prakash Yadav\nDeposited in your Federal Bank account"
  {
    pattern: /^Received\s+₹(\d+(?:,\d+)*(?:\.\d{2})?)\s+from\s+(.+?)(?:\n|Deposited|$)/i,
    extractAmount: (match: RegExpMatchArray) => parseFloat(match[1].replace(/,/g, "")),
    extractSender: (match: RegExpMatchArray) => match[2].trim(),
    isValid: true,
  },
  // Generic "sent to you" pattern: "SADEKUL NADAP: SADEKUL NADAP\nsent ₹30 to you."
  {
    pattern: /^(.+?)(?::|$)[\s\S]*sent\s+₹(\d+(?:,\d+)*(?:\.\d{2})?)\s+to\s+you/i,
    extractAmount: (match: RegExpMatchArray) => parseFloat(match[2].replace(/,/g, "")),
    extractSender: (match: RegExpMatchArray) => match[1].trim(),
    isValid: true,
  },
];

/**
 * Keywords that indicate a received payment
 */
const RECEIVED_KEYWORDS = [
  "received",
  "credited",
  "credit",
  "deposited",
  "added to",
  "got",
  "received from",
  "credited to",
  "payment received",
  "paid you", // Google Pay uses "paid you" for received payments
];

/**
 * Keywords that indicate a sent payment (should be marked as invalid)
 */
const SENT_KEYWORDS = [
  "sent",
  "debited",
  "debit",
  "payment to",
  "transferred",
  "sent to",
  "paid to",
  "you paid", // "you paid" means you sent money
];

/**
 * Extract amount from text
 * Handles formats like: ₹1,500, Rs 500, Rs. 1500.00, 500.00
 */
function extractAmount(text: string): number | null {
  if (!text) return null;

  // Try to match currency with amount (₹, Rs, Rs.)
  const patterns = [
    // ₹1,500.00 or ₹1500 or ₹1,500
    /₹\s*(\d+(?:,\d+)*(?:\.\d{2})?)/i,
    // Rs 1,500.00 or Rs. 1500
    /Rs\.?\s*(\d+(?:,\d+)*(?:\.\d{2})?)/i,
    // INR 1500
    /INR\s*(\d+(?:,\d+)*(?:\.\d{2})?)/i,
    // Just a number with optional decimals (fallback)
    /(\d+(?:,\d+)*(?:\.\d{2})?)/,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      // Remove commas and convert to number
      const cleanNumber = match[1].replace(/,/g, "");
      const amount = parseFloat(cleanNumber);

      // Return amount in rupees (no conversion)
      return amount;
    }
  }

  return null;
}

/**
 * Clean sender name by removing common payment-related phrases and words
 */
function cleanSenderName(senderName: string): string {
  if (!senderName) return "Unknown";

  let cleaned = senderName.trim();

  // Remove common phrases first (order matters - longer phrases first)
  const phrasesToRemove = [
    /money\s+received/gi,
    /received\s+money/gi,
    /money\s+credited/gi,
    /credited\s+money/gi,
  ];

  for (const phrase of phrasesToRemove) {
    cleaned = cleaned.replace(phrase, "");
  }

  // Remove amount patterns
  cleaned = cleaned.replace(/₹\s*\d+(?:,\d+)*(?:\.\d{2})?/gi, "");
  cleaned = cleaned.replace(/Rs\.?\s*\d+(?:,\d+)*(?:\.\d{2})?/gi, "");
  cleaned = cleaned.replace(/INR\s*\d+(?:,\d+)*(?:\.\d{2})?/gi, "");

  // Remove common payment-related words
  const wordsToRemove = [
    "received",
    "credited",
    "from",
    "to",
    "payment",
    "transaction",
    "successful",
    "you",
    "your",
    "account",
    "bank",
    "upi",
    "sent",
    "paid",
    "debited",
    "money",
  ];

  for (const word of wordsToRemove) {
    const regex = new RegExp(`\\b${word}\\b`, "gi");
    cleaned = cleaned.replace(regex, "");
  }

  // Clean up extra spaces, dots, and special characters
  cleaned = cleaned
    .replace(/\./g, " ") // Remove dots
    .replace(/[^\w\s@.-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // If we have something left, take the first meaningful word/phrase
  if (cleaned && cleaned.length > 0) {
    // Try to extract name (first 1-3 words)
    const words = cleaned.split(/\s+/).filter((w) => w.length > 0);
    if (words.length > 0) {
      // Return first 1-3 words as name
      return words.slice(0, Math.min(3, words.length)).join(" ");
    }
  }

  return "Unknown";
}

/**
 * Extract sender name from text
 * Removes common words and extracts the name
 */
function extractSenderName(text: string, _amount: number | null): string {
  if (!text) return "Unknown";

  let cleanedText = text.trim();

  // Remove amount patterns
  cleanedText = cleanedText.replace(/₹\s*\d+(?:,\d+)*(?:\.\d{2})?/gi, "");
  cleanedText = cleanedText.replace(/Rs\.?\s*\d+(?:,\d+)*(?:\.\d{2})?/gi, "");
  cleanedText = cleanedText.replace(/INR\s*\d+(?:,\d+)*(?:\.\d{2})?/gi, "");

  // Remove common payment-related words
  const wordsToRemove = [
    "received",
    "credited",
    "from",
    "to",
    "payment",
    "transaction",
    "successful",
    "you",
    "your",
    "account",
    "bank",
    "upi",
    "sent",
    "paid",
    "debited",
    "money",
  ];

  for (const word of wordsToRemove) {
    const regex = new RegExp(`\\b${word}\\b`, "gi");
    cleanedText = cleanedText.replace(regex, "");
  }

  // Use cleanSenderName for final cleaning to ensure consistency
  return cleanSenderName(cleanedText);
}

/**
 * Try to match against priority templates first
 * Returns parsed result if template matches, null otherwise
 */
function tryTemplateMatch(title: string, content: string): UPIParserResult | null {
  // Try matching with newline-separated text first (preserves original format)
  const combinedTextWithNewline = content 
    ? `${title}\n${content}`.trim()
    : title.trim();

  // Also try space-separated version as fallback
  const combinedTextWithSpace = `${title} ${content || ""}`.trim();

  // Try each template pattern on both versions
  for (const template of UPI_TEMPLATES) {
    // Try newline version first
    let match = combinedTextWithNewline.match(template.pattern);
    let matchedText = combinedTextWithNewline;

    // If no match, try space-separated version
    if (!match) {
      match = combinedTextWithSpace.match(template.pattern);
      matchedText = combinedTextWithSpace;
    }

    if (match) {
      try {
        const amount = template.extractAmount(match);
        const sender = cleanSenderName(template.extractSender(match));

        if (amount !== null && amount > 0 && sender) {
          return {
            amount,
            from: sender,
            isValid: template.isValid,
            rawText: matchedText,
          };
        }
      } catch {
        // If extraction fails, continue to next template
        continue;
      }
    }
  }

  return null;
}

/**
 * Check if the notification indicates a received payment or sent payment
 */
function isReceivedPayment(text: string): boolean {
  const lowerText = text.toLowerCase();

  // Special case: "sent...to you" means someone sent money TO you (received)
  // Check this BEFORE checking general "sent" keyword
  if (lowerText.includes("sent") && lowerText.includes("to you")) {
    return true;
  }

  // First check for received keywords (higher priority)
  // This includes "paid you" which means someone paid TO you
  for (const keyword of RECEIVED_KEYWORDS) {
    if (lowerText.includes(keyword)) {
      return true;
    }
  }

  // Then check for sent keywords
  // This includes "paid to" and "you paid" which mean you sent money
  for (const keyword of SENT_KEYWORDS) {
    if (lowerText.includes(keyword)) {
      return false;
    }
  }

  // If no clear indication, return false (be conservative)
  return false;
}

/**
 * Parse PhonePe notification
 * Example: "You received ₹1,500 from John Doe"
 * Example: "₹500 credited to your account from Jane"
 */
function parsePhonePe(title: string, content: string): UPIParserResult {
  const combinedText = `${title} ${content || ""}`;
  const amount = extractAmount(combinedText);
  const from = extractSenderName(title || content || "", amount);
  const isValid = amount !== null && amount > 0 && isReceivedPayment(combinedText);

  return {
    amount: amount || 0,
    from,
    isValid,
    rawText: combinedText,
  };
}

/**
 * Parse Google Pay notification
 * Example: "₹500.00 received from Jane Smith"
 * Example: "You received ₹1,200 from Merchant Name"
 */
function parseGooglePay(title: string, content: string): UPIParserResult {
  const combinedText = `${title} ${content || ""}`;
  const amount = extractAmount(combinedText);
  const from = extractSenderName(title || content || "", amount);
  const isValid = amount !== null && amount > 0 && isReceivedPayment(combinedText);

  return {
    amount: amount || 0,
    from,
    isValid,
    rawText: combinedText,
  };
}

/**
 * Parse Paytm notification
 * Example: "Paytm: Rs 1000 received from Merchant"
 * Example: "Rs. 500 credited to your Paytm wallet"
 */
function parsePaytm(title: string, content: string): UPIParserResult {
  const combinedText = `${title} ${content || ""}`;
  const amount = extractAmount(combinedText);
  const from = extractSenderName(
    (title || content || "").replace(/paytm:/gi, ""),
    amount
  );
  const isValid = amount !== null && amount > 0 && isReceivedPayment(combinedText);

  return {
    amount: amount || 0,
    from,
    isValid,
    rawText: combinedText,
  };
}

/**
 * Parse BHIM UPI notification
 * Example: "BHIM: ₹800 received from sender@upi"
 */
function parseBHIM(title: string, content: string): UPIParserResult {
  const combinedText = `${title} ${content || ""}`;
  const amount = extractAmount(combinedText);
  const from = extractSenderName(
    (title || content || "").replace(/bhim:/gi, ""),
    amount
  );
  const isValid = amount !== null && amount > 0 && isReceivedPayment(combinedText);

  return {
    amount: amount || 0,
    from,
    isValid,
    rawText: combinedText,
  };
}

/**
 * Generic parser for unknown UPI apps
 * Uses pattern matching to extract amount and sender
 */
function parseGeneric(title: string, content: string): UPIParserResult {
  const combinedText = `${title} ${content || ""}`;
  const amount = extractAmount(combinedText);
  const from = extractSenderName(title || content || "", amount);
  const isValid = amount !== null && amount > 0 && isReceivedPayment(combinedText);

  return {
    amount: amount || 0,
    from,
    isValid,
    rawText: combinedText,
  };
}

/**
 * Main parser function
 * Determines the UPI app and calls the appropriate parser
 * Priority: Template matching first, then app-specific parser, then generic parser
 */
export function parseUPINotification(
  packageName: string,
  title: string,
  content: string
): UPIParserResult {
  // Normalize inputs
  const normalizedPackage = packageName?.toLowerCase() || "";
  const normalizedTitle = title || "";
  const normalizedContent = content || "";

  // FIRST: Try template matching (highest priority)
  const templateResult = tryTemplateMatch(normalizedTitle, normalizedContent);
  if (templateResult) {
    return templateResult;
  }

  // SECOND: Fall back to app-specific parsers
  if (normalizedPackage.includes("phonepe")) {
    return parsePhonePe(normalizedTitle, normalizedContent);
  } else if (
    normalizedPackage.includes("paisa") ||
    normalizedPackage.includes("google") ||
    normalizedPackage.includes("gpay")
  ) {
    return parseGooglePay(normalizedTitle, normalizedContent);
  } else if (normalizedPackage.includes("paytm")) {
    return parsePaytm(normalizedTitle, normalizedContent);
  } else if (normalizedPackage.includes("bhim") || normalizedPackage.includes("npci")) {
    return parseBHIM(normalizedTitle, normalizedContent);
  } else {
    // Use generic parser for unknown apps
    return parseGeneric(normalizedTitle, normalizedContent);
  }
}

/**
 * Helper function to format amount for display
 * Formats rupees with proper formatting
 */
export function formatAmount(amountInRupees: number): string {
  return `₹${amountInRupees.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
