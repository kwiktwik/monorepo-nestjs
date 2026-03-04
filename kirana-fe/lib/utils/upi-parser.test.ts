/**
 * Test cases for UPI notification parser
 * 
 * Run this file to test various UPI notification formats
 * 
 * Usage: npx tsx lib/utils/upi-parser.test.ts
 */

import { parseUPINotification, formatAmount } from "./upi-parser";

interface TestCase {
  name: string;
  packageName: string;
  title: string;
  content: string;
  expected: {
    amount: number; // in rupees
    from: string;
    isValid: boolean;
  };
}

const testCases: TestCase[] = [
  // PhonePe test cases
  {
    name: "PhonePe - Received payment with comma",
    packageName: "com.phonepe.app",
    title: "You received ₹1,500 from John Doe",
    content: "Payment successful",
    expected: {
      amount: 1500,
      from: "John Doe",
      isValid: true,
    },
  },
  {
    name: "PhonePe - Received payment without comma",
    packageName: "com.phonepe.app",
    title: "You received ₹500 from Jane Smith",
    content: "",
    expected: {
      amount: 500,
      from: "Jane Smith",
      isValid: true,
    },
  },
  {
    name: "PhonePe - Sent payment (should be invalid)",
    packageName: "com.phonepe.app",
    title: "You sent ₹1,000 to Bob",
    content: "Payment successful",
    expected: {
      amount: 1000,
      from: "Bob",
      isValid: false,
    },
  },
  {
    name: "PhonePe - Credited to account",
    packageName: "com.phonepe.app",
    title: "₹2,500 credited to your account from Alice",
    content: "",
    expected: {
      amount: 2500,
      from: "Alice",
      isValid: true,
    },
  },

  // Google Pay test cases
  {
    name: "Google Pay - Received with decimal",
    packageName: "com.google.android.apps.nbu.paisa.user",
    title: "₹500.00 received from Jane Smith",
    content: "Google Pay",
    expected: {
      amount: 500,
      from: "Jane Smith",
      isValid: true,
    },
  },
  {
    name: "Google Pay - Received payment",
    packageName: "com.google.android.apps.nbu.paisa.user",
    title: "You received ₹1,200 from Merchant Name",
    content: "",
    expected: {
      amount: 1200,
      from: "Merchant Name",
      isValid: true,
    },
  },

  // Paytm test cases
  {
    name: "Paytm - Rs format",
    packageName: "net.one97.paytm",
    title: "Paytm: Rs 1000 received from Merchant",
    content: "",
    expected: {
      amount: 1000,
      from: "Merchant",
      isValid: true,
    },
  },
  {
    name: "Paytm - Rs. format with decimal",
    packageName: "net.one97.paytm",
    title: "Rs. 500.00 credited to your Paytm wallet",
    content: "From: Shop Owner",
    expected: {
      amount: 500,
      from: "Shop Owner",
      isValid: true,
    },
  },

  // BHIM test cases
  {
    name: "BHIM - Received from UPI ID",
    packageName: "in.org.npci.upiapp",
    title: "BHIM: ₹800 received from sender@upi",
    content: "",
    expected: {
      amount: 800,
      from: "sender@upi",
      isValid: true,
    },
  },

  // Generic/Unknown app
  {
    name: "Generic - Basic received format",
    packageName: "com.unknown.app",
    title: "Payment received: ₹350 from Customer",
    content: "",
    expected: {
      amount: 350,
      from: "Customer",
      isValid: true,
    },
  },
];

function runTests() {
  console.log("🧪 Running UPI Parser Tests\n");
  console.log("=".repeat(80));

  let passed = 0;
  let failed = 0;

  testCases.forEach((test, index) => {
    console.log(`\n📝 Test ${index + 1}: ${test.name}`);
    console.log("-".repeat(80));

    const result = parseUPINotification(
      test.packageName,
      test.title,
      test.content
    );

    const amountMatch = result.amount === test.expected.amount;
    const fromMatch = result.from.toLowerCase().includes(test.expected.from.toLowerCase()) ||
      test.expected.from.toLowerCase().includes(result.from.toLowerCase());
    const isValidMatch = result.isValid === test.expected.isValid;

    const testPassed = amountMatch && fromMatch && isValidMatch;

    console.log(`Input:`);
    console.log(`  Package: ${test.packageName}`);
    console.log(`  Title: ${test.title}`);
    console.log(`  Content: ${test.content || "(empty)"}`);
    console.log(`\nExpected:`);
    console.log(`  Amount: ${formatAmount(test.expected.amount)} (${test.expected.amount} rupees)`);
    console.log(`  From: ${test.expected.from}`);
    console.log(`  Valid: ${test.expected.isValid}`);
    console.log(`\nActual:`);
    console.log(`  Amount: ${formatAmount(result.amount)} (${result.amount} rupees) ${amountMatch ? "✅" : "❌"}`);
    console.log(`  From: ${result.from} ${fromMatch ? "✅" : "❌"}`);
    console.log(`  Valid: ${result.isValid} ${isValidMatch ? "✅" : "❌"}`);

    if (testPassed) {
      console.log(`\n✅ Test PASSED`);
      passed++;
    } else {
      console.log(`\n❌ Test FAILED`);
      failed++;
    }
  });

  console.log("\n" + "=".repeat(80));
  console.log(`\n📊 Results: ${passed} passed, ${failed} failed out of ${testCases.length} tests`);

  if (failed === 0) {
    console.log("\n🎉 All tests passed!");
  } else {
    console.log(`\n⚠️  ${failed} test(s) failed`);
  }
}

// Run tests if this file is executed directly
runTests();
