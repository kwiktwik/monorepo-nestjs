/**
 * Notification Processing Utilities
 * Server-side implementation of Android AlertPayNotificationListenerService logic
 */

export enum TransactionType {
    RECEIVED = "RECEIVED",
    SENT = "SENT",
    UNKNOWN = "UNKNOWN",
}

/**
 * UPI App Package Names
 */
export const UPI_APP_PACKAGES = [
    "com.phonepe.app",
    "com.google.android.apps.nbu.paisa.user",
    "net.one97.paytm",
    "com.paytm.business",
    "com.phonepe.app.business",
    "com.google.android.apps.nbu.paisa.merchant",
    "com.bharatpe.app",
    "com.razorpay.pos",
    "in.amazon.mShop.android.shopping",
    "in.org.npci.upiapp",
    "com.sbi.lotza02",
    "com.sbi.upi",
    "com.icicibank.imobile2",
    "com.axis.mobile",
    "com.snapwork.hdfc",
    "com.csam.icici.bank.imobile",
    "com.hdfc.bank.payzapp",
    "com.mobikwik_new",
    "com.freecharge.android",
    "com.myairtelapp",
    "com.grabpenny",
] as const;

/**
 * Base URL for server-to-self fetches (e.g. team-notify). Prefers NEXT_PUBLIC_BASE_URL.
 * If the request origin is https but host is localhost/127.0.0.1, returns http to avoid
 * ERR_SSL_PACKET_LENGTH_TOO_LONG when the app listens on HTTP only.
 */
export function getInternalBaseUrl(origin: string): string {
    // 1. Explicit internal base URL (e.g. for cross-container calls)
    if (process.env.INTERNAL_BASE_URL) {
        return process.env.INTERNAL_BASE_URL;
    }

    // 2. Default to localhost for internal server-to-server calls
    // This avoids DNS resolution issues for public domains from inside the server
    if (typeof window === "undefined") {
        // We use PORT from environment or default to 3000
        const port = process.env.PORT || "3000";
        return `http://localhost:${port}`;
    }

    // 3. Fallback to AUTH_URL or NEXT_PUBLIC_BASE_URL or origin
    const base = process.env.AUTH_URL || process.env.NEXT_PUBLIC_BASE_URL || origin;
    try {
        const url = new URL(base);
        if (
            url.protocol === "https:" &&
            (url.hostname === "localhost" || url.hostname === "127.0.0.1")
        ) {
            return `http://${url.host}`;
        }
        return base;
    } catch {
        return base;
    }
}

/**
 * Normalize text by removing zero-width characters and Unicode formatting marks
 */
export function normalizeText(text: string): string {
    if (!text) return "";

    return text
        .replace(/\u200c/g, "") // Zero-width non-joiner
        .replace(/\u200d/g, "") // Zero-width joiner
        .replace(/\u200b/g, "") // Zero-width space
        .replace(/\ufeff/g, ""); // Zero-width no-break space
}

/**
 * Extract amount from notification text
 * Handles multiple currency formats and patterns
 */
export function extractAmount(text: string): string | null {
    if (!text) return null;

    const patterns = [
        /₹\s*([0-9,]+(?:\.[0-9]{2})?)/i,
        /Rs\.?\s*([0-9,]+(?:\.[0-9]{2})?)/i,
        /INR\s*([0-9,]+(?:\.[0-9]{2})?)/i,
        /([0-9,]+(?:\.[0-9]{2})?)\s*rupees?/i,
        /(?:received|credited|got)\s*(?:₹|INR)?\s*([0-9,]+(?:\.[0-9]{2})?)/i,
        /(?:amount|amt):?\s*₹?\s*([0-9,]+(?:\.[0-9]{2})?)/i,
    ];

    for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match && match[1]) {
            const cleanAmount = match[1].replace(/,/g, "");
            if (cleanAmount && cleanAmount.length > 0) {
                return cleanAmount;
            }
        }
    }

    return null;
}

/**
 * Extract payer name from notification text
 * Uses app-specific patterns for better accuracy
 */
export function extractPayerName(
    packageName: string,
    text: string
): string | null {
    if (!text) return null;

    const pkg = packageName.toLowerCase();
    let patterns: string[] = [];

    // PhonePe-specific patterns
    if (pkg.includes("phonepe")) {
        // Check for PhonePe title format: "Name: Name"
        const titleMatch = text.match(/^([A-Za-z\s]+?)\s*:\s*\1/);
        if (titleMatch && titleMatch[1]) {
            const name = titleMatch[1].trim();
            if (name.length > 2) {
                return name.replace(/Money received/gi, "").trim();
            }
        }

        patterns = [
            "^([A-Za-z\\s]+?)\\s+has\\s+sent\\s+₹",
            "([A-Za-z\\s]+?)\\s+sent\\s+₹\\d+\\s+to\\s+you",
            "from\\s+([A-Za-z\\s]+?)\\s*(?:₹|\\d|via|through|on|\\(|\\.|$)",
            "by\\s+([A-Za-z\\s]+?)\\s*(?:₹|\\d|via|through|on|\\(|\\.|$)",
            "([A-Za-z\\s]+?)\\s+sent\\s+you",
        ];
    }
    // Paytm-specific patterns
    else if (pkg.includes("paytm")) {
        patterns = [
            "from\\s+([A-Za-z\\s]+?)\\s*(?:₹|\\d|via|through|on|\\(|\\.|$)",
            "by\\s+([A-Za-z\\s]+?)\\s*(?:₹|\\d|via|through|on|\\(|\\.|$)",
        ];
    }
    // Google Pay patterns
    else if (pkg.includes("google") || pkg.includes("paisa")) {
        patterns = [
            "([A-Za-z\\s]+?)\\s+paid\\s+you",
            "from\\s+([A-Za-z\\s]+?)\\s*(?:₹|\\d|via|through|on|\\(|\\.|$)",
        ];
    }
    // BHIM/SBI/NPCI patterns
    else if (pkg.includes("bhim") || pkg.includes("npci") || pkg.includes("sbi")) {
        patterns = [
            "from\\s+([A-Za-z\\s]+?)\\s*\\(",
            "from\\s+([A-Za-z\\s]+?)\\s*(?:₹|\\d|via|through|on|\\(|\\.|$)",
            "by\\s+([A-Za-z\\s]+?)\\s*\\(",
            "by\\s+([A-Za-z\\s]+?)\\s*(?:₹|\\d|via|through|on|\\(|\\.|$)",
        ];
    }
    // Generic patterns
    else {
        patterns = [
            "([A-Za-z\\s]+?)\\s+paid\\s+you",
            "^([A-Za-z\\s]+?)\\s+has\\s+sent\\s+₹",
            "([A-Za-z\\s]+?)\\s+sent\\s+you",
            "from\\s+([A-Za-z\\s]+?)\\s*(?:₹|\\d|via|through|on|\\(|\\.|$)",
            "by\\s+([A-Za-z\\s]+?)\\s*(?:₹|\\d|via|through|on|\\(|\\.|$)",
            "([A-Za-z\\s]+?)\\s+ने\\s+आपको",
            "([A-Za-z\\s]+?)\\s+ने\\s+तुम्हाला",
        ];
    }

    const normalizedText = normalizeText(text);

    for (const pattern of patterns) {
        const regex = new RegExp(pattern, "i");
        const match = normalizedText.match(regex);
        if (match && match[1]) {
            const name = match[1].trim();
            if (name.length > 2) {
                return name;
            }
        }
    }

    return null;
}

/**
 * Determine transaction type from notification text
 * Supports multiple languages
 */
export function determineTransactionType(text: string): TransactionType {
    const normalizedText = normalizeText(text);
    const lowerText = normalizedText.toLowerCase();

    // Special case: "sent to you" means received
    if (lowerText.includes("sent") && lowerText.includes("to you")) {
        return TransactionType.RECEIVED;
    }

    // Special case: "has sent" means received
    if (lowerText.includes("has sent")) {
        return TransactionType.RECEIVED;
    }

    // Check for "paid you" (received)
    if (lowerText.includes("paid you")) {
        return TransactionType.RECEIVED;
    }

    // Hindi patterns for received
    if (
        lowerText.includes("ne aapko") &&
        (lowerText.includes("pay kiye") ||
            lowerText.includes("bheje") ||
            lowerText.includes("₹"))
    ) {
        return TransactionType.RECEIVED;
    }

    // Hindi: "aapko mile/mila/prapt"
    if (
        lowerText.includes("aapko") &&
        (lowerText.includes("mile") ||
            lowerText.includes("mila") ||
            lowerText.includes("prapt"))
    ) {
        return TransactionType.RECEIVED;
    }

    // Devanagari script patterns
    if (normalizedText.includes("आपको") && normalizedText.includes("भेजे")) {
        return TransactionType.RECEIVED;
    }

    // Bengali patterns
    if (normalizedText.includes("আপনাকে") && normalizedText.includes("পাঠিয়েছে")) {
        return TransactionType.RECEIVED;
    }

    // Tamil patterns
    if (
        normalizedText.includes("உங்களுக்கு") &&
        (normalizedText.includes("அனுப்பினார்") ||
            normalizedText.includes("அனுப்பியுள்ளார்"))
    ) {
        return TransactionType.RECEIVED;
    }

    // Telugu patterns
    if (normalizedText.includes("మీకు") && normalizedText.includes("పంపారు")) {
        return TransactionType.RECEIVED;
    }

    // Marathi patterns
    if (
        normalizedText.includes("तुम्हाला") &&
        (normalizedText.includes("पाठवले") || normalizedText.includes("दिले"))
    ) {
        return TransactionType.RECEIVED;
    }

    // Gujarati patterns
    if (normalizedText.includes("તમને") && normalizedText.includes("મોકલ્યા")) {
        return TransactionType.RECEIVED;
    }

    // Kannada patterns
    if (normalizedText.includes("ನಿಮಗೆ") && normalizedText.includes("ಕಳುಹಿಸಿದ್ದಾರೆ")) {
        return TransactionType.RECEIVED;
    }

    // Malayalam patterns
    if (normalizedText.includes("നിങ്ങൾക്ക്") && normalizedText.includes("അയച്ചു")) {
        return TransactionType.RECEIVED;
    }

    // Punjabi patterns
    if (normalizedText.includes("ਤੁਹਾਨੂੰ") && normalizedText.includes("ਭੇਜੇ")) {
        return TransactionType.RECEIVED;
    }

    // English received keywords
    const receivedKeywords = [
        "received",
        "credited",
        "got",
        "incoming",
        "deposit",
        "sent you",
        "has sent",
        // Hindi
        "प्राप्त",
        "जमा",
        "मिले",
        // Bengali
        "পেয়েছেন",
        "জমা",
        // Tamil
        "பெற்றீர்கள்",
        "வரவு",
        "அனுப்பியுள்ளார்",
        // Telugu
        "అందింది",
        "జమ",
        // Marathi
        "मिळाले",
        "दिले",
        // Gujarati
        "મળ્યા",
        "જમા",
        // Kannada
        "ಸ್ವೀಕರಿಸಿದ್ದೀರಿ",
        "ಜಮೆ",
        // Malayalam
        "ലഭിച്ചു",
        "ക്രെഡിറ്റ്",
        // Punjabi
        "ਮਿਲੇ",
        "ਜਮ੍ਹਾਂ",
    ];

    // English sent keywords
    const sentKeywords = [
        "you sent",
        "you paid",
        "sent",
        "debited",
        "paid",
        "outgoing",
        "withdrawal",
        // Hindi
        "आपने भेजा",
        "भुगतान किया",
        "डेबिट",
        "काटा",
        // Bengali
        "আপনি পাঠিয়েছেন",
        "ডেবিট",
        // Tamil
        "அனுப்பினீர்கள்",
        "டெபிட்",
        // Telugu
        "మీరు పంపారు",
        "డెబిట్",
        // Marathi
        "तुम्ही पाठवले",
        "डेबिट",
        // Gujarati
        "તમે મોકલ્યા",
        "ડેબિટ",
        // Kannada
        "ನೀವು ಕಳುಹಿಸಿದ್ದೀರಿ",
        "ಡೆಬಿಟ್",
        // Malayalam
        "നിങ്ങൾ അയച്ചു",
        "ഡെബിറ്റ്",
        // Punjabi
        "ਤੁਸੀਂ ਭੇਜੇ",
        "ਡੈਬਿਟ",
    ];

    let hasReceivedKeyword = false;
    let hasSentKeyword = false;

    for (const keyword of receivedKeywords) {
        if (lowerText.includes(keyword.toLowerCase()) || normalizedText.includes(keyword)) {
            hasReceivedKeyword = true;
            break;
        }
    }

    for (const keyword of sentKeywords) {
        if (lowerText.includes(keyword.toLowerCase()) || normalizedText.includes(keyword)) {
            hasSentKeyword = true;
            break;
        }
    }

    if (hasReceivedKeyword && !hasSentKeyword) {
        return TransactionType.RECEIVED;
    }

    if (hasSentKeyword && !hasReceivedKeyword) {
        return TransactionType.SENT;
    }

    return TransactionType.UNKNOWN;
}

/**
 * Get clean, user-friendly app name from package name
 */
export function getCleanAppName(packageName: string): string {
    const pkg = packageName.toLowerCase();

    if (pkg === "com.phonepe.app.business") return "PhonePe Business";
    if (pkg.includes("phonepe")) return "PhonePe";
    if (pkg === "com.paytm.business") return "Paytm Business";
    if (pkg.includes("paytm")) return "Paytm";
    if (pkg === "com.google.android.apps.nbu.paisa.merchant")
        return "Google Pay Business";
    if (pkg.includes("google") && pkg.includes("pay")) return "Google Pay";
    if (pkg === "com.bharatpe.app") return "BharatPe";
    if (pkg === "com.razorpay.pos") return "Razorpay POS";
    if (pkg.includes("amazon")) return "Amazon Pay";
    if (pkg.includes("grabpenny")) return "GrabPenny";
    if (pkg.includes("npci")) return "BHIM";
    if (pkg === "com.sbi.upi") return "SBI Pay";
    if (pkg === "com.sbi.lotza02") return "SBI YONO";
    if (pkg.includes("sbi")) return "SBI";
    if (pkg === "com.hdfc.bank.payzapp") return "PayZapp";
    if (pkg.includes("icici")) return "ICICI Bank";
    if (pkg.includes("axis")) return "Axis Bank";
    if (pkg.includes("hdfc")) return "HDFC Bank";
    if (pkg === "com.mobikwik_new") return "MobiKwik";
    if (pkg === "com.freecharge.android") return "Freecharge";
    if (pkg === "com.myairtelapp") return "Airtel Thanks";
    if (pkg.includes("upi")) return "UPI";

    return "Payment app";
}

/**
 * Check if package is a UPI app
 */
export function isUpiApp(packageName: string): boolean {
    const pkg = packageName.toLowerCase();
    return UPI_APP_PACKAGES.some((upiPkg) => pkg.includes(upiPkg.toLowerCase()));
}

/**
 * Check if notification is a UPI payment notification
 */
export function isUpiPaymentNotification(
    packageName: string,
    title: string,
    text: string,
    bigText: string
): boolean {
    const isUpi = isUpiApp(packageName);

    const keywords = [
        "paid",
        "received",
        "credited",
        "debited",
        "upi",
        "payment",
        "transaction",
        "₹",
        "rs",
        "rupees",
        "sent",
        "money",
    ];

    const combinedText = `${title} ${text} ${bigText}`.toLowerCase();
    const hasKeywords = keywords.some((keyword) => combinedText.includes(keyword));

    return isUpi && hasKeywords;
}

/**
 * Create notification data JSON for storage
 */
export function createNotificationDataJson(
    title: string,
    text: string,
    bigText: string
): string {
    try {
        const data = {
            title,
            text,
            bigText,
            timestamp: Date.now(),
        };
        return JSON.stringify(data);
    } catch (error) {
        console.error("Error creating notification JSON:", error);
        return JSON.stringify({ error: "Failed to create notification data" });
    }
}

/**
 * Parse payment details from notification
 */
export interface PaymentDetails {
    amount: string | null;
    payerName: string | null;
    transactionType: TransactionType;
}

export function parsePaymentDetails(
    packageName: string,
    title: string,
    text: string,
    bigText: string
): PaymentDetails | null {
    const combinedText = `${title} ${text} ${bigText}`;

    const amount = extractAmount(combinedText);
    if (!amount) {
        return null;
    }

    const payerName = extractPayerName(packageName, combinedText);
    const transactionType = determineTransactionType(combinedText);

    return {
        amount,
        payerName,
        transactionType,
    };
}

/**
 * Generate TTS message for notification
 */
export function generateTTSMessage(
    amount: string | number | null,
    payerName: string | null,
    hasTransaction: boolean
): string {
    if (!hasTransaction) return "";

    // Ensure amount is a number for formatting
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

    if (numAmount && numAmount > 0) {
        // Formatted amount (e.g. 500 or 500.00 depending on locale, keeping it simple for TTS)
        // TTS usually reads numbers well without commas, but commas help readability.
        const formattedAmount = numAmount.toLocaleString("en-IN");
        const fromName = payerName || "Unknown";

        return `₹${formattedAmount} received from ${fromName}`;
    }

    return "";
}

/**
 * Format Date to DD/MM/YYYY HH:mm in IST time zone
 */
export function formatToIST(date: Date | string | null | undefined): string | null {
    if (!date) return null;
    try {
        const d = typeof date === 'string' ? new Date(date) : date;
        if (isNaN(d.getTime())) return null;

        const options: Intl.DateTimeFormatOptions = {
            timeZone: 'Asia/Kolkata',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        };

        const formatter = new Intl.DateTimeFormat('en-GB', options);
        // en-GB outputs DD/MM/YYYY, HH:mm
        return formatter.format(d).replace(',', '');
    } catch {
        return null;
    }
}
