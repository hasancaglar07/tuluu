import HeaderPage from "@/components/modules/header/page";
import Container from "@/components/custom/container";
import { LocaleLink } from "@/components/custom/locale-link";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      <HeaderPage />

      <Container className="py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8">
            Privacy Policy
          </h1>

          <div className="bg-gray-50 p-4 rounded-lg mb-8">
            <p className="text-gray-600">Last Updated: May 1, 2025</p>
          </div>

          <div className="prose prose-lg max-w-none">
            <p>
              At TULU, we take your privacy seriously. This Privacy Policy
              explains how we collect, use, disclose, and safeguard your
              information when you use our language learning application and
              website.
            </p>

            <div className="space-y-8 mt-10">
              <h4>Information We Collect</h4>
              <p>
                We collect information that you provide directly to us when you:
              </p>
              <ul>
                <li>Create an account</li>
                <li>Complete your profile</li>
                <li>Use our language learning features</li>
                <li>Participate in quizzes or tests</li>
                <li>Make purchases</li>
                <li>Contact customer support</li>
                <li>Respond to surveys or promotions</li>
              </ul>

              <p>This information may include:</p>
              <ul>
                <li>Name, email address, and password</li>
                <li>Profile information (such as profile picture)</li>
                <li>Language preferences and learning goals</li>
                <li>
                  Payment information (processed by our payment providers)
                </li>
                <li>Your progress and performance data</li>
                <li>Device information and usage data</li>
              </ul>

              <h4>How We Use Your Information</h4>
              <p>We use the information we collect to:</p>
              <ul>
                <li>Provide, maintain, and improve our services</li>
                <li>Create and manage your account</li>
                <li>Process transactions</li>
                <li>
                  Track your progress and personalize your learning experience
                </li>
                <li>
                  Send you technical notices, updates, and support messages
                </li>
                <li>Respond to your comments and questions</li>
                <li>Develop new features and services</li>
                <li>Monitor and analyze usage patterns</li>
                <li>
                  Protect against, identify, and prevent fraud and other illegal
                  activity
                </li>
              </ul>

              <h4>Sharing Your Information</h4>
              <p>We may share your information with:</p>
              <ul>
                <li>Service providers who perform services on our behalf</li>
                <li>
                  Partners with whom we offer co-branded services or promotions
                </li>
                <li>
                  Other users (such as for leaderboards, but limited to username
                  and score)
                </li>
                <li>
                  In response to legal process or when we believe it&apos;s
                  necessary to protect our rights
                </li>
                <li>In connection with a merger, sale, or acquisition</li>
              </ul>

              <h4>Your Choices</h4>
              <p>You can manage your information and privacy preferences by:</p>
              <ul>
                <li>Updating your account profile</li>
                <li>Adjusting notification settings</li>
                <li>Opting out of promotional communications</li>
                <li>Requesting deletion of your account</li>
              </ul>

              <h4>Data Security</h4>
              <p>
                We implement appropriate technical and organizational measures
                to protect your personal information. However, no method of
                transmission over the Internet or electronic storage is 100%
                secure, so we cannot guarantee absolute security.
              </p>

              <h4>Children&apos;s Privacy</h4>
              <p>
                Our services are not directed to children under 13. If we learn
                we have collected personal information from a child under 13, we
                will delete that information as quickly as possible. If you
                believe a child under 13 has provided us with personal
                information, please contact us.
              </p>

              <h4>International Data Transfers</h4>
              <p>
                Your information may be transferred to, and processed in,
                countries other than the country in which you reside. These
                countries may have data protection laws that are different from
                the laws of your country.
              </p>

              <h4>Changes to This Policy</h4>
              <p>
                We may update this Privacy Policy from time to time. We will
                notify you of any changes by posting the new Privacy Policy on
                this page and updating the -Last Updated- date.
              </p>

              <h4>Contact Us</h4>
              <p>
                If you have any questions about this Privacy Policy, please
                contact us at:
              </p>
              <p>
                <strong>Email:</strong> privacy@tulu.com
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
              <LocaleLink
                href="https://www.patreon.com/messages/8b25e025c56c4d47a903cd9b02049c63?mode=campaign&tab=chats"
                className="hover:underline"
              >
                Contact Us
              </LocaleLink>
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
