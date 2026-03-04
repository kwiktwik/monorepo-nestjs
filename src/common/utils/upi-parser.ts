/**
 * UPI Notification Parser (mirrors kirana-fe lib/utils/upi-parser.ts)
 * Parses payment notifications from UPI apps and extracts amount and sender.
 */

export interface UPIParserResult {
  amount: number;
  from: string;
  isValid: boolean;
  rawText: string;
}

const UPI_TEMPLATES: Array<{
  pattern: RegExp;
  extractAmount: (m: RegExpMatchArray) => number;
  extractSender: (m: RegExpMatchArray) => string;
  isValid: boolean;
}> = [
  {
    pattern:
      /^(.+?)\s+has\s+sent\s+₹(\d+(?:,\d+)*(?:\.\d{2})?)\s*to\s+your\s+bank\s+account/i,
    extractAmount: (m) => parseFloat(m[2].replace(/,/g, '')),
    extractSender: (m) => m[1].trim(),
    isValid: true,
  },
  {
    pattern:
      /^Received\s+₹(\d+(?:,\d+)*(?:\.\d{2})?)\s+from\s+(.+?)(?:\n|Deposited|$)/i,
    extractAmount: (m) => parseFloat(m[1].replace(/,/g, '')),
    extractSender: (m) => m[2].trim(),
    isValid: true,
  },
  {
    pattern: /^(.+?)\s+paid\s+you\s+₹(\d+(?:,\d+)*(?:\.\d{2})?)(?:\n|Paid|$)/i,
    extractAmount: (m) => parseFloat(m[2].replace(/,/g, '')),
    extractSender: (m) => m[1].trim(),
    isValid: true,
  },
  {
    pattern: /^₹(\d+(?:,\d+)*(?:\.\d{2})?)\s+received\s+from\s+(.+?)(?:\s|$)/i,
    extractAmount: (m) => parseFloat(m[1].replace(/,/g, '')),
    extractSender: (m) => m[2].trim(),
    isValid: true,
  },
  {
    pattern:
      /^₹(\d+(?:,\d+)*(?:\.\d{2})?)\s+received\s+from\s+(.+?)(?:\n|Deposited|$)/i,
    extractAmount: (m) => parseFloat(m[1].replace(/,/g, '')),
    extractSender: (m) => m[2].trim(),
    isValid: true,
  },
  {
    pattern:
      /^You\s+received\s+₹(\d+(?:,\d+)*(?:\.\d{2})?)\s+from\s+(.+?)(?:\s|$)/i,
    extractAmount: (m) => parseFloat(m[1].replace(/,/g, '')),
    extractSender: (m) => m[2].trim(),
    isValid: true,
  },
  {
    pattern:
      /You\s+have\s+received\s+₹(\d+(?:,\d+)*(?:\.\d{2})?)\s+from\s+(.+?)(?:\n|$)/i,
    extractAmount: (m) => parseFloat(m[1].replace(/,/g, '')),
    extractSender: (m) => m[2].trim(),
    isValid: true,
  },
  {
    pattern:
      /^(.+?)(?::|$)[\s\S]*sent\s+₹(\d+(?:,\d+)*(?:\.\d{2})?)\s+to\s+you/i,
    extractAmount: (m) => parseFloat(m[2].replace(/,/g, '')),
    extractSender: (m) => m[1].trim(),
    isValid: true,
  },
];

const RECEIVED_KEYWORDS = [
  'received',
  'credited',
  'credit',
  'deposited',
  'added to',
  'got',
  'received from',
  'credited to',
  'payment received',
  'paid you',
];

const SENT_KEYWORDS = [
  'sent',
  'debited',
  'debit',
  'payment to',
  'transferred',
  'sent to',
  'paid to',
  'you paid',
];

function extractAmount(text: string): number | null {
  if (!text) return null;
  const patterns = [
    /₹\s*(\d+(?:,\d+)*(?:\.\d{2})?)/i,
    /Rs\.?\s*(\d+(?:,\d+)*(?:\.\d{2})?)/i,
    /INR\s*(\d+(?:,\d+)*(?:\.\d{2})?)/i,
    /(\d+(?:,\d+)*(?:\.\d{2})?)/,
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) {
      const amount = parseFloat(match[1].replace(/,/g, ''));
      return amount;
    }
  }
  return null;
}

function cleanSenderName(senderName: string): string {
  if (!senderName) return 'Unknown';
  let cleaned = senderName.trim();
  const phrasesToRemove = [
    /money\s+received/gi,
    /received\s+money/gi,
    /money\s+credited/gi,
    /credited\s+money/gi,
  ];
  for (const phrase of phrasesToRemove) {
    cleaned = cleaned.replace(phrase, '');
  }
  cleaned = cleaned.replace(/₹\s*\d+(?:,\d+)*(?:\.\d{2})?/gi, '');
  cleaned = cleaned.replace(/Rs\.?\s*\d+(?:,\d+)*(?:\.\d{2})?/gi, '');
  cleaned = cleaned.replace(/INR\s*\d+(?:,\d+)*(?:\.\d{2})?/gi, '');
  const wordsToRemove = [
    'received',
    'credited',
    'from',
    'to',
    'payment',
    'transaction',
    'successful',
    'you',
    'your',
    'account',
    'bank',
    'upi',
    'sent',
    'paid',
    'debited',
    'money',
  ];
  for (const word of wordsToRemove) {
    cleaned = cleaned.replace(new RegExp(`\\b${word}\\b`, 'gi'), '');
  }
  cleaned = cleaned
    .replace(/\./g, ' ')
    .replace(/[^\w\s@.-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (cleaned) {
    const words = cleaned.split(/\s+/).filter((w) => w.length > 0);
    if (words.length > 0) {
      return words.slice(0, Math.min(3, words.length)).join(' ');
    }
  }
  return 'Unknown';
}

function extractSenderName(text: string): string {
  if (!text) return 'Unknown';
  let cleanedText = text
    .replace(/₹\s*\d+(?:,\d+)*(?:\.\d{2})?/gi, '')
    .replace(/Rs\.?\s*\d+(?:,\d+)*(?:\.\d{2})?/gi, '')
    .replace(/INR\s*\d+(?:,\d+)*(?:\.\d{2})?/gi, '');
  const wordsToRemove = [
    'received',
    'credited',
    'from',
    'to',
    'payment',
    'transaction',
    'successful',
    'you',
    'your',
    'account',
    'bank',
    'upi',
    'sent',
    'paid',
    'debited',
    'money',
  ];
  for (const word of wordsToRemove) {
    cleanedText = cleanedText.replace(new RegExp(`\\b${word}\\b`, 'gi'), '');
  }
  return cleanSenderName(cleanedText);
}

function tryTemplateMatch(
  title: string,
  content: string,
): UPIParserResult | null {
  const withNewline = content ? `${title}\n${content}`.trim() : title.trim();
  const withSpace = `${title} ${content || ''}`.trim();
  for (const template of UPI_TEMPLATES) {
    let match = withNewline.match(template.pattern);
    let matchedText = withNewline;
    if (!match) {
      match = withSpace.match(template.pattern);
      matchedText = withSpace;
    }
    if (match) {
      try {
        const amount = template.extractAmount(match);
        const sender = cleanSenderName(template.extractSender(match));
        if (amount > 0 && sender) {
          return {
            amount,
            from: sender,
            isValid: template.isValid,
            rawText: matchedText,
          };
        }
      } catch {
        continue;
      }
    }
  }
  return null;
}

function isReceivedPayment(text: string): boolean {
  const lower = text.toLowerCase();
  if (lower.includes('sent') && lower.includes('to you')) return true;
  for (const kw of RECEIVED_KEYWORDS) {
    if (lower.includes(kw)) return true;
  }
  for (const kw of SENT_KEYWORDS) {
    if (lower.includes(kw)) return false;
  }
  return false;
}

function parseGeneric(title: string, content: string): UPIParserResult {
  const combined = `${title} ${content || ''}`.trim();
  const amount = extractAmount(combined);
  const from = extractSenderName(title || content || '');
  const isValid = amount !== null && amount > 0 && isReceivedPayment(combined);
  return {
    amount: amount ?? 0,
    from,
    isValid,
    rawText: combined,
  };
}

/**
 * Parse UPI notification and extract amount + sender (kirana-fe compatible).
 */
export function parseUPINotification(
  packageName: string,
  title: string,
  content: string,
): UPIParserResult {
  const normalizedTitle = (title ?? '').trim();
  const normalizedContent = (content ?? '').trim();

  const templateResult = tryTemplateMatch(normalizedTitle, normalizedContent);
  if (templateResult) return templateResult;

  return parseGeneric(normalizedTitle, normalizedContent);
}
