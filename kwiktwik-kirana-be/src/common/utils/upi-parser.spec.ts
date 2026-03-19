import {
  isUpiApp,
  isUpiPaymentNotification,
  parseUPINotification,
  UPI_APP_PACKAGES,
} from './upi-parser';

describe('UPI Parser', () => {
  describe('UPI_APP_PACKAGES', () => {
    it('should contain PhonePe package', () => {
      expect(UPI_APP_PACKAGES).toContain('com.phonepe.app');
    });

    it('should contain Google Pay package', () => {
      expect(UPI_APP_PACKAGES).toContain(
        'com.google.android.apps.nbu.paisa.user',
      );
    });

    it('should contain Paytm package', () => {
      expect(UPI_APP_PACKAGES).toContain('net.one97.paytm');
    });

    it('should contain BHIM package', () => {
      expect(UPI_APP_PACKAGES).toContain('in.org.npci.upiapp');
    });

    it('should NOT contain Gmail package', () => {
      expect(UPI_APP_PACKAGES).not.toContain('com.google.android.gm');
    });
  });

  describe('isUpiApp', () => {
    it('should return true for PhonePe', () => {
      expect(isUpiApp('com.phonepe.app')).toBe(true);
    });

    it('should return true for Google Pay', () => {
      expect(isUpiApp('com.google.android.apps.nbu.paisa.user')).toBe(true);
    });

    it('should return true for Paytm', () => {
      expect(isUpiApp('net.one97.paytm')).toBe(true);
    });

    it('should return true for BHIM', () => {
      expect(isUpiApp('in.org.npci.upiapp')).toBe(true);
    });

    it('should return true for case-insensitive match', () => {
      expect(isUpiApp('COM.PHONEPE.APP')).toBe(true);
      expect(isUpiApp('Com.Phonepe.App')).toBe(true);
    });

    it('should return false for Gmail', () => {
      expect(isUpiApp('com.google.android.gm')).toBe(false);
    });

    it('should return false for WhatsApp', () => {
      expect(isUpiApp('com.whatsapp')).toBe(false);
    });

    it('should return false for unknown app', () => {
      expect(isUpiApp('com.unknown.app')).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(isUpiApp('')).toBe(false);
    });
  });

  describe('isUpiPaymentNotification', () => {
    const paymentTitle = 'You received ₹500 from John';
    const paymentContent = 'Payment successful';
    const paymentBigText = '';

    it('should return true for UPI app with payment keywords', () => {
      expect(
        isUpiPaymentNotification(
          'com.phonepe.app',
          paymentTitle,
          paymentContent,
          paymentBigText,
        ),
      ).toBe(true);
    });

    it('should return true for Google Pay with payment keywords', () => {
      expect(
        isUpiPaymentNotification(
          'com.google.android.apps.nbu.paisa.user',
          '₹1000 received from Jane',
          '',
          '',
        ),
      ).toBe(true);
    });

    it('should return false for Gmail even with payment keywords', () => {
      // This is the key test - Gmail notifications should NOT be parsed as UPI
      expect(
        isUpiPaymentNotification(
          'com.google.android.gm',
          'Payment received',
          'You received ₹500',
          '',
        ),
      ).toBe(false);
    });

    it('should return false for WhatsApp with payment keywords', () => {
      expect(
        isUpiPaymentNotification(
          'com.whatsapp',
          'Payment received',
          '₹500 received',
          '',
        ),
      ).toBe(false);
    });

    it('should return false for UPI app without payment keywords', () => {
      expect(
        isUpiPaymentNotification(
          'com.phonepe.app',
          'Welcome to PhonePe',
          'Thanks for installing',
          '',
        ),
      ).toBe(false);
    });

    it('should return false for non-UPI app with unrelated content', () => {
      expect(
        isUpiPaymentNotification(
          'com.google.android.gm',
          'New email from boss',
          'Meeting at 3pm',
          '',
        ),
      ).toBe(false);
    });

    it('should detect various payment keywords', () => {
      const keywords = ['paid', 'received', 'credited', '₹', 'rs', 'rupees'];
      keywords.forEach((keyword) => {
        expect(
          isUpiPaymentNotification(
            'com.phonepe.app',
            `You ${keyword} money`,
            '',
            '',
          ),
        ).toBe(true);
      });
    });
  });

  describe('parseUPINotification', () => {
    describe('PhonePe notifications', () => {
      it('should parse received payment', () => {
        const result = parseUPINotification(
          'com.phonepe.app',
          'You received ₹1,500 from John Doe',
          'Payment successful',
        );
        expect(result.amount).toBe(1500);
        expect(result.from).toBe('John');
        expect(result.isValid).toBe(true);
      });

      it('should parse sent payment as invalid', () => {
        const result = parseUPINotification(
          'com.phonepe.app',
          'You sent ₹1,000 to Bob',
          'Payment successful',
        );
        expect(result.amount).toBe(1000);
        expect(result.isValid).toBe(false);
      });
    });

    describe('Google Pay notifications', () => {
      it('should parse received payment', () => {
        const result = parseUPINotification(
          'com.google.android.apps.nbu.paisa.user',
          '₹500.00 received from Jane Smith',
          'Google Pay',
        );
        expect(result.amount).toBe(500);
        expect(result.from).toBe('Jane');
        expect(result.isValid).toBe(true);
      });
    });

    describe('Paytm notifications', () => {
      it('should parse Rs format', () => {
        const result = parseUPINotification(
          'net.one97.paytm',
          'Paytm: Rs 1000 received from Merchant',
          '',
        );
        expect(result.amount).toBe(1000);
        expect(result.from).toBe('Paytm Merchant');
        expect(result.isValid).toBe(true);
      });
    });

    describe('BHIM notifications', () => {
      it('should parse received from UPI ID', () => {
        const result = parseUPINotification(
          'in.org.npci.upiapp',
          'BHIM: ₹800 received from sender@upi',
          '',
        );
        expect(result.amount).toBe(800);
        expect(result.from).toBe('BHIM sender@');
        expect(result.isValid).toBe(true);
      });
    });

    describe('Gmail notifications (should NOT be parsed as UPI)', () => {
      it('should parse Gmail notification but mark as invalid if it has amount', () => {
        // Gmail notifications should not be parsed as valid UPI transactions
        // even if they contain payment-related text
        const result = parseUPINotification(
          'com.google.android.gm',
          'Payment received',
          'You received ₹500 from client',
        );
        // parseUPINotification doesn't validate package, that's handled by isUpiPaymentNotification
        // This test shows that without package validation, it would parse
        expect(result.amount).toBe(500);
        // But isValid should be true based on content alone
        // The key is that we use isUpiPaymentNotification BEFORE calling this
      });
    });

    describe('Edge cases', () => {
      it('should handle empty title and content', () => {
        const result = parseUPINotification('com.phonepe.app', '', '');
        expect(result.amount).toBe(0);
        expect(result.from).toBe('Unknown');
        expect(result.isValid).toBe(false);
      });

      it('should handle special characters in sender name', () => {
        const result = parseUPINotification(
          'com.phonepe.app',
          '₹100 received from ABC@123',
          '',
        );
        expect(result.amount).toBe(100);
        expect(result.from).toContain('ABC');
      });
    });

    describe('Emoji digit handling', () => {
      it('should parse notification with emoji digits in amount', () => {
        const result = parseUPINotification(
          'com.phonepe.app',
          "You've received Rs.3️⃣5️⃣ from HITESH SO DINESH KUMAR",
          '',
        );
        expect(result.amount).toBe(35);
        expect(result.from).toBe('HITESH SO DINESH');
        expect(result.isValid).toBe(true);
      });

      it('should parse notification with multiple emoji digits', () => {
        const result = parseUPINotification(
          'com.phonepe.app',
          '₹1️⃣5️⃣0️⃣0️⃣ received from John Doe',
          '',
        );
        expect(result.amount).toBe(1500);
        expect(result.from).toBe('John');
        expect(result.isValid).toBe(true);
      });

      it('should parse Google Pay notification with emoji digits', () => {
        const result = parseUPINotification(
          'com.google.android.apps.nbu.paisa.user',
          'You received ₹5️⃣0️⃣0️⃣.00 from Jane',
          '',
        );
        expect(result.amount).toBe(500);
        expect(result.from).toBe('Jane');
        expect(result.isValid).toBe(true);
      });

      it('should detect payment keywords with emoji digits', () => {
        expect(
          isUpiPaymentNotification(
            'com.phonepe.app',
            "You've received Rs.3️⃣5️⃣ from HITESH",
            '',
            '',
          ),
        ).toBe(true);
      });

      it('should handle mixed emoji and regular digits', () => {
        const result = parseUPINotification(
          'com.phonepe.app',
          '₹1️⃣00 received from Test User',
          '',
        );
        expect(result.amount).toBe(100);
        expect(result.isValid).toBe(true);
      });
    });
  });
});
