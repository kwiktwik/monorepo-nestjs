"use client";

import Link from "next/link";

const WHAT_GETS_DELETED = [
  "Your profile and account information",
  "All business and store data",
  "Customer and supplier records",
  "Inventory and stock information",
  "Transaction and sales history",
  "All app settings and preferences",
];

const HOW_TO_DELETE_STEPS = [
  'Send an email to support@kiranaapps.com',
  'Use the subject line: "Account Deletion Request"',
  "Include your registered email address or phone number",
  "Specify which app(s) you're using (Alert Soundbox, Jamun Quotes with photos, Customer & Supplier App, Expense Tracker)",
  "Confirm that you want to permanently delete your account and all associated data",
];

const ALTERNATIVES = [
  "Temporarily deactivate your account instead",
  "Export your data for your records",
  "Contact support to resolve any issues you're experiencing",
  "Review your subscription or downgrade to a free plan",
];

export default function KiranaAppsDeleteAccount() {
  return (
    <div className="bg-white min-h-[80vh] selection:bg-primary/10 selection:text-primary">
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="mb-12 border-b border-gray-100 pb-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
            Delete Your <span className="text-gradient">Account</span>
          </h1>
          <p className="text-lg text-gray-600">
            We&apos;re sorry to see you go. Here&apos;s how you can delete your account.
          </p>
        </div>

        <div className="space-y-12 text-gray-600 leading-relaxed">
          <section className="bg-amber-50 p-6 sm:p-8 rounded-2xl border border-amber-200">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center">
                <svg className="w-5 h-5 text-amber-900" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-amber-900 mb-2">Important Notice</h2>
                <p className="text-amber-900/90 font-medium">
                  Deleting your account is permanent and cannot be undone. All your data, including business information, customer records, inventory data, and transaction history will be permanently deleted.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">What Gets Deleted</h2>
            <p className="mb-4 text-lg">
              When you delete your account, the following information will be permanently removed:
            </p>
            <ul className="space-y-3 list-disc list-inside ml-4 text-lg">
              {WHAT_GETS_DELETED.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">How to Delete Your Account</h2>
            <p className="mb-6 text-lg">
              To request account deletion, please follow these steps:
            </p>
            <ol className="space-y-4 list-decimal list-inside ml-4 text-lg">
              {HOW_TO_DELETE_STEPS.map((step, i) => (
                <li key={i}>
                  {step.includes("support@kiranaapps.com") ? (
                    <>
                      Send an email to{" "}
                      <a
                        href="mailto:support@kiranaapps.com"
                        className="text-primary hover:underline font-medium"
                      >
                        support@kiranaapps.com
                      </a>
                    </>
                  ) : (
                    step
                  )}
                </li>
              ))}
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Processing Time</h2>
            <p className="text-lg">
              Account deletion requests are typically processed within 7 business days. You will receive a confirmation email once your account has been deleted. During this time, your account will be deactivated and inaccessible.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Before You Delete</h2>
            <p className="mb-4 text-lg">
              Consider these alternatives before deleting your account:
            </p>
            <ul className="space-y-3 list-disc list-inside ml-4 text-lg">
              {ALTERNATIVES.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="pt-8 text-center">
            <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
              If you have any questions or concerns before deleting your account, our support team is here to help.
            </p>
            <Link
              href="/contact"
              className="inline-block px-8 py-4 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-all"
            >
              Contact Support
            </Link>
          </section>
        </div>
      </section>
    </div>
  );
}
