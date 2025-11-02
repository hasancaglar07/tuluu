import HeaderPage from "@/components/modules/header/page";
import Container from "@/components/custom/container";
import { LocaleLink } from "@/components/custom/locale-link";
import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <HeaderPage />

      <Container className="py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8">
            Terms of Service
          </h1>

          <div className="bg-gray-50 p-4 rounded-lg mb-8">
            <p className="text-gray-600">Last Updated: May 1, 2025</p>
          </div>

          <div className="prose prose-lg max-w-none">
            <p>
              Welcome to TULU! These Terms of Service (Terms) govern your
              access to and use of the TULU application and website (the
              Service). Please read these Terms carefully before using our
              Service.
            </p>

            <div className="space-y-10 mt-10">
              <h4>Acceptance of Terms</h4>
              <p>
                By accessing or using our Service, you agree to be bound by
                these Terms. If you disagree with any part of the Terms, you may
                not access the Service.
              </p>

              <h4>Changes to Terms</h4>
              <p>
                We reserve the right to modify or replace these Terms at any
                time. If a revision is material, we will provide at least 30
                days notice prior to any new terms taking effect. What
                constitutes a material change will be determined at our sole
                discretion.
              </p>

              <h4>Account Registration</h4>
              <p>
                To use certain features of our Service, you must register for an
                account. You must provide accurate, current, and complete
                information during the registration process and keep your
                account information up-to-date.
              </p>
              <p>
                You are responsible for safeguarding the password that you use
                to access the Service and for any activities or actions under
                your password. You agree not to disclose your password to any
                third party.
              </p>

              <h4>User Content</h4>
              <p>
                Our Service allows you to post, link, store, share and otherwise
                make available certain information, text, graphics, or other
                material (Content). You are responsible for the Content that you
                post on or through the Service, including its legality,
                reliability, and appropriateness.
              </p>
              <p>
                By posting Content on or through the Service, you represent and
                warrant that: (i) the Content is yours and/or you have the right
                to use it and the right to grant us the rights and license as
                provided in these Terms, and (ii) that the posting of your
                Content on or through the Service does not violate the privacy
                rights, publicity rights, copyrights, contract rights or any
                other rights of any person or entity.
              </p>

              <h4>Subscriptions and Payments</h4>
              <p>
                Some parts of the Service are billed on a subscription basis
                (Subscription(s)). You will be billed in advance on a recurring
                and periodic basis (Billing Cycle). Billing cycles are set on a
                monthly or annual basis, depending on the type of subscription
                plan you select when purchasing a Subscription.
              </p>
              <p>
                At the end of each Billing Cycle, your Subscription will
                automatically renew under the exact same conditions unless you
                cancel it or we cancel it. You may cancel your Subscription
                renewal either through your online account management page or by
                contacting our customer support team.
              </p>

              <h4>Free Trial</h4>
              <p>
                We may, at our sole discretion, offer a Subscription with a free
                trial for a limited period of time (Free Trial). You may be
                required to enter your billing information in order to sign up
                for the Free Trial.
              </p>
              <p>
                If you do enter your billing information when signing up for the
                Free Trial, you will not be charged by us until the Free Trial
                has expired. On the last day of the Free Trial period, unless
                you cancelled your Subscription, you will be automatically
                charged the applicable subscription fee for the type of
                Subscription you have selected.
              </p>

              <h4>Intellectual Property</h4>
              <p>
                The Service and its original content (excluding Content provided
                by users), features, and functionality are and will remain the
                exclusive property of TULU and its licensors. The Service
                is protected by copyright, trademark, and other laws of both the
                United States and foreign countries. Our trademarks and trade
                dress may not be used in connection with any product or service
                without the prior written consent of TULU.
              </p>

              <h4>Termination</h4>
              <p>
                We may terminate or suspend your account and bar access to the
                Service immediately, without prior notice or liability, under
                our sole discretion, for any reason whatsoever and without
                limitation, including but not limited to a breach of the Terms.
              </p>
              <p>
                If you wish to terminate your account, you may simply
                discontinue using the Service, or notify us that you wish to
                terminate your account.
              </p>

              <h4>Limitation of Liability</h4>
              <p>
                In no event shall TULU, nor its directors, employees,
                partners, agents, suppliers, or affiliates, be liable for any
                indirect, incidental, special, consequential or punitive
                damages, including without limitation, loss of profits, data,
                use, goodwill, or other intangible losses, resulting from (i)
                your access to or use of or inability to access or use the
                Service; (ii) any conduct or content of any third party on the
                Service; (iii) any content obtained from the Service; and (iv)
                unauthorized access, use or alteration of your transmissions or
                content, whether based on warranty, contract, tort (including
                negligence) or any other legal theory, whether or not we have
                been informed of the possibility of such damage.
              </p>

              <h4>Governing Law</h4>
              <p>
                These Terms shall be governed and construed in accordance with
                the laws of the State of California, United States, without
                regard to its conflict of law provisions.
              </p>

              <h4>Contact Us</h4>
              <p>
                If you have any questions about these Terms, please contact us
                at:
              </p>
              <p>
                <strong>Email:</strong> legal@tulu.com
                <br />
                <strong>Address:</strong> 123 Language Lane, San Francisco, CA
                94103
              </p>
            </div>
          </div>
        </div>
      </Container>

      <footer className="bg-gray-100 py-8 mt-12">
        <Container>
          <div className="text-center text-gray-600">
            <p>© {new Date().getFullYear()} TULU. All rights reserved.</p>
            <div className="flex justify-center gap-4 mt-4">
              <LocaleLink href="/terms" className="hover:underline">
                Terms of Service
              </LocaleLink>
              <Link
                href="https://www.patreon.com/messages/8b25e025c56c4d47a903cd9b02049c63?mode=campaign&tab=chats"
                className="hover:underline"
              >
                Contact Us
              </Link>
              <LocaleLink href="/about" className="hover:underline">
                About Us
              </LocaleLink>
            </div>
          </div>
        </Container>
      </footer>
    </div>
  );
}

// Nextjs dynamic metadata
export function generateMetadata() {
  return {
    title: `Terms - TULU`,
    description: `Page - Description here`,
    icons: {
      icon: "/images/logo_icon.png",
      shortcut: "/favicon.ico",
      apple: "/apple-touch-icon.png",
    },
  };
}
