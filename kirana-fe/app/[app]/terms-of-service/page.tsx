import { getAppWithCompany, getAllAppSlugs } from "../../../config/legal"
import Link from "next/link"
import { notFound } from "next/navigation"

export function generateStaticParams() {
  return getAllAppSlugs().map((app) => ({ app }))
}

export default async function TermsOfServicePage({
  params,
}: {
  params: Promise<{ app: string }>
}) {
  const { app } = await params
  const appData = getAppWithCompany(app)

  if (!appData) {
    return notFound()
  }

  const { name, company } = appData

  return (
    <div className="bg-white min-h-[80vh] selection:bg-primary/10 selection:text-primary">
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="mb-12 border-b border-gray-100 pb-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-2">
            Terms of <span className="text-gradient">Service</span>
          </h1>
          <p className="text-sm font-bold text-gray-400 tracking-widest uppercase">
            Last updated: October 20, 2025
          </p>
        </div>

        <div className="space-y-12 text-gray-600 leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              1. Agreement to Terms
            </h2>
            <p className="text-lg">
              By accessing or using {company.website}, you agree to comply with and
              be bound by these Terms of Service. These terms apply to all
              visitors, users, and others who access or use the Service.
            </p>
          </section>

          <section className="bg-gray-50 p-8 rounded-[2rem] border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              2. Use of Service
            </h2>
            <p className="text-lg mb-4">
              You agree to use our services only for lawful purposes and in
              accordance with these Terms. You are responsible for maintaining the
              confidentiality of your account and password.
            </p>
            <p className="text-lg">
              You may not use our service to transmit any malicious code or engage
              in any behavior that disrupts the service for other users.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              3. Subscription & Billing
            </h2>
            <p className="text-lg">
              Certain parts of the Service are billed on a subscription basis. You
              will be billed in advance on a recurring and periodic basis. Billing
              cycles are set on a.
             monthly or annual basis</p>
          </section>

          <section className="bg-primary/10 p-10 rounded-[3rem] border border-primary/20">
            <h2 className="text-2xl font-bold text-primary mb-6">
              4. Limitation of Liability
            </h2>
            <p className="text-lg text-primary/80">
              In no event shall {company.website}, nor its directors, employees, or
              partners, be liable for any indirect, incidental, special,
              consequential, or punitive damages resulting from your use of the
              service.
            </p>
          </section>

          <div className="pt-12 mt-12 border-t border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Governing Law
            </h2>
            <p className="text-lg">
              These Terms shall be governed and construed in accordance with the
              laws of {company.country}, without regard to its conflict of law
              provisions.
            </p>
          </div>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Contact Us
            </h2>
            <p className="text-lg mb-4">
              If you have questions about these terms, contact:
            </p>
            <div className="bg-gray-50 p-6 rounded-2xl">
              <p className="font-bold text-gray-900">{company.legalName}</p>
              <p>Email: {company.supportEmail}</p>
              <p>Phone: {company.phone}</p>
            </div>
          </section>
        </div>
      </section>
    </div>
  )
}
