"use client";

import Link from "next/link";

export default function JamunPrivacyPage() {
  return (
    <div className="bg-white min-h-[80vh] selection:bg-primary/10 selection:text-primary">
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="flex justify-between items-center mb-6 sm:mb-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            Privacy <span className="text-gradient">Policy</span>
          </h1>
          <Link
            href="/jamun"
            className="text-sm font-semibold text-gray-600 hover:text-primary transition-colors flex items-center gap-1"
          >
            ← Back to Jamun
          </Link>
        </div>
        <p className="text-sm font-bold text-gray-400 tracking-widest uppercase mb-12">
          Last updated: January 19, 2026
        </p>

        <div className="space-y-12 text-gray-600 leading-relaxed">
          <section>
            <p className="text-lg">
              This Privacy Policy describes Our policies and procedures on the
              collection, use, and disclosure of Your information when You use
              the Service and tells You about Your privacy rights and how the
              law protects You.
            </p>
            <p className="text-lg mt-4">
              We use Your Personal data to provide and improve the Service. By
              using the Service, You agree to the collection and use of
              information in accordance with this Privacy Policy.
            </p>
          </section>

          <section className="bg-gray-50 p-8 rounded-4xl border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Interpretation and Definitions
            </h2>
            <h3 className="text-xl font-bold text-gray-800 mb-3">
              Interpretation
            </h3>
            <p className="mb-6">
              The words of which the initial letter is capitalized have meanings
              defined under the following conditions. The following definitions
              shall have the same meaning whether they appear in singular or in
              plural.
            </p>
            <h3 className="text-xl font-bold text-gray-800 mb-3">Definitions</h3>
            <p className="mb-4">
              For the purposes of this Privacy Policy:
            </p>
            <ul className="space-y-2 list-disc list-inside ml-4">
              <li>
                <strong>Account</strong> means a unique account created for You
                to access our Service or parts of our Service.
              </li>
              <li>
                <strong>Company</strong> (referred to as either &quot;the
                Company&quot;, &quot;We&quot;, &quot;Us&quot; or &quot;Our&quot;
                in this Agreement) refers to KiranaApps.
              </li>
              <li>
                <strong>Service</strong> refers to the Jamun mobile
                application.
              </li>
              <li>
                <strong>You</strong> means the individual accessing or using the
                Service, or the company, or other legal entity on behalf of which
                such individual is accessing or using the Service, as applicable.
              </li>
            </ul>
          </section>

          <section className="bg-amber-50 p-8 rounded-4xl border border-amber-200">
            <h2 className="text-2xl font-bold text-amber-900 mb-6">
              Subscription, Pricing &amp; Refund Policy
            </h2>
            <p className="mb-6 text-amber-900/90">
              Please read this section carefully before purchasing any
              subscription.
            </p>
            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-amber-900 mb-2">1. Pricing Model</h4>
                <p className="mb-2 text-amber-900/90">
                  Jamun offers a Premium Membership to unlock all templates
                  and remove advertisements. The pricing is as follows:
                </p>
                <ul className="list-disc list-inside ml-4 space-y-1 text-amber-900/90">
                  <li>
                    <strong>Trial Period:</strong> We offer an introductory
                    trial for <strong>₹5.00</strong> (INR).
                  </li>
                  <li>
                    <strong>Monthly Subscription:</strong> Upon completion of the
                    trial, the subscription automatically renews at{" "}
                    <strong>₹199.00 per month</strong>.
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-amber-900 mb-2">2. No Refund Policy</h4>
                <p className="mb-2 text-amber-900/90">
                  All payments made to KiranaApps for the Jamun service are{" "}
                  <strong>final and non-refundable</strong>.
                </p>
                <ul className="list-disc list-inside ml-4 space-y-1 text-amber-900/90">
                  <li>We do not entertain refund requests for the ₹5 trial fee.</li>
                  <li>
                    We do not entertain refund requests for the ₹199 monthly
                    renewal fee once charged.
                  </li>
                  <li>
                    It is the user&apos;s responsibility to cancel their
                    subscription before the renewal date if they do not wish to be
                    charged.
                  </li>
                  <li>
                    No partial refunds will be issued for unused portions of the
                    subscription period.
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Collecting and Using Your Personal Data
            </h2>
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Types of Data Collected
            </h3>
            <div className="space-y-6">
              <div>
                <h4 className="font-bold text-gray-800 mb-2">Personal Data</h4>
                <p className="mb-3">
                  While using Our Service, We may ask You to provide Us with
                  certain personally identifiable information that can be used
                  to contact or identify You. Personally identifiable information
                  may include, but is not limited to:
                </p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>First name and last name (for Status Customization)</li>
                  <li>Email address</li>
                  <li>Phone number (optional for business cards)</li>
                  <li>Usage Data</li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-gray-800 mb-2">Usage Data</h4>
                <p>
                  Usage Data is collected automatically when using the Service. It
                  may include information such as Your Device&apos;s Internet
                  Protocol address (e.g. IP address), device type, operating system
                  version, the pages of our Service that You visit, the time and
                  date of Your visit, the time spent on those pages, unique
                  device identifiers and other diagnostic data.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Permissions</h2>
            <p className="mb-4">
              To provide the core functionality of Jamun (creating and
              saving images), we require the following permissions:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-2">
              <li>
                <strong>Storage (Read/Write):</strong> To save created images to
                your device gallery and to upload your logo/photo.
              </li>
              <li>
                <strong>Camera:</strong> To allow you to take a photo to add to
                your greeting card.
              </li>
              <li>
                <strong>Internet:</strong> To download the latest daily templates
                and festivals.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Use of Your Personal Data
            </h2>
            <p className="mb-4">
              The Company may use Personal Data for the following purposes:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-2">
              <li>
                <strong>To provide and maintain our Service</strong>, including
                to monitor the usage of our Service.
              </li>
              <li>
                <strong>To manage Your Account:</strong> to manage Your
                registration as a user of the Service.
              </li>
              <li>
                <strong>For the performance of a contract:</strong> the
                development, compliance and undertaking of the purchase contract
                for the products, items or services You have purchased or of any
                other contract with Us through the Service.
              </li>
              <li>
                <strong>To contact You:</strong> To contact You by email,
                telephone calls, SMS, or other equivalent forms of electronic
                communication.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Retention of Your Personal Data
            </h2>
            <p>
              The Company will retain Your Personal Data only for as long as is
              necessary for the purposes set out in this Privacy Policy. We will
              retain and use Your Personal Data to the extent necessary to
              comply with our legal obligations (for example, if we are required
              to retain your data to comply with applicable laws), resolve
              disputes, and enforce our legal agreements and policies.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Delete Your Account
            </h2>
            <p className="mb-4">
              You have the right to delete or request that We assist in deleting
              the Personal Data that We have collected about You. Deleting your
              account is permanent and cannot be undone. All your data, including
              business information, customer records, inventory data, and
              transaction history will be permanently deleted.
            </p>
            <p className="mb-4">
              You may update, amend, or delete Your information at any time by
              signing in to Your Account, if you have one, and visiting the
              account settings section that allows you to manage Your personal
              information.
            </p>
            <p className="mb-4">
              To request permanent account deletion across Kirana Apps products,
              please follow these steps:
            </p>
            <ol className="mb-4 list-decimal list-inside space-y-1">
              <li>
                Send an email to{" "}
                <a
                  href="mailto:support@kiranaapps.com"
                  className="text-primary hover:underline font-medium"
                >
                  support@kiranaapps.com
                </a>
              </li>
              <li>Use the subject line: &quot;Account Deletion Request&quot;</li>
              <li>Include your registered email address or phone number</li>
              <li>
                Specify which app(s) you&apos;re using (Alert Soundbox,
                Jamun Quotes with photos, Customer &amp; Supplier App,
                Expense Tracker)
              </li>
              <li>
                Confirm that you want to permanently delete your account and all
                associated data
              </li>
            </ol>
            <p className="mb-4">
              Account deletion requests are typically processed within 7 business
              days. You will receive a confirmation email once your account has
              been deleted. During this time, your account will be deactivated
              and inaccessible.
            </p>
            <p className="mb-4">
              For the latest details, you can also review our dedicated{" "}
              <Link
                href="/delete-account"
                className="text-primary hover:underline font-medium"
              >
                Delete Account
              </Link>{" "}
              page.
            </p>
            <p>
              You may also contact Us to request access to, correct, or delete
              any personal information that You have provided to Us.
            </p>
          </section>

          <section className="bg-primary/10 p-8 rounded-4xl border border-primary/20">
            <h2 className="text-2xl font-bold text-primary mb-6">
              Security of Your Personal Data
            </h2>
            <p className="text-primary">
              The security of Your Personal Data is important to Us, but
              remember that no method of transmission over the Internet, or
              method of electronic storage is 100% secure. While We strive to
              use commercially acceptable means to protect Your Personal Data,
              We cannot guarantee its absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Children&apos;s Privacy
            </h2>
            <p>
              Our Service does not address anyone under the age of 13. We do not
              knowingly collect personally identifiable information from anyone
              under the age of 13. If You are a parent or guardian and You are
              aware that Your child has provided Us with Personal Data, please
              contact Us.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Changes to this Privacy Policy
            </h2>
            <p>
              We may update Our Privacy Policy from time to time. We will notify
              You of any changes by posting the new Privacy Policy on this page.
            </p>
            <p className="mt-4">
              You are advised to review this Privacy Policy periodically for any
              changes. Changes to this Privacy Policy are effective when they are
              posted on this page.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Us</h2>
            <p className="mb-4">
              If you have any questions about this Privacy Policy, You can
              contact us:
            </p>
            <p>
              By email:{" "}
              <a
                href="mailto:support@kiranaapps.com"
                className="text-primary hover:underline font-medium"
              >
                support@kiranaapps.com
              </a>
            </p>
          </section>

          <div className="pt-12 mt-12 border-t border-gray-100 text-center">
            <p className="text-gray-400 font-medium mb-4">
              © 2026 KiranaApps. All rights reserved.
            </p>
            <Link
              href="/contact"
              className="inline-block px-8 py-3 bg-gray-900 text-white font-bold rounded-2xl hover:bg-black transition-all"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
