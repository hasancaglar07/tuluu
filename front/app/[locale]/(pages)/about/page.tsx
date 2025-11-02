import HeaderPage from "@/components/modules/header/page";
import Container from "@/components/custom/container";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { LocaleLink } from "@/components/custom/locale-link";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <HeaderPage />

      <Container className="py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8">
            About TULU
          </h1>

          <div className="flex flex-col md:flex-row items-center gap-8 mb-16">
            <div className="md:w-1/2">
              <Image
                src="/images/happy_face.gif"
                alt="TULU Mascot"
                width={400}
                height={400}
                className="rounded-lg"
              />
            </div>
            <div className="md:w-1/2">
              <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
              <p className="text-gray-700 mb-4">
                At TULU, we believe that language learning should be fun,
                accessible, and effective. Our mission is to break down language
                barriers and connect people across cultures through engaging,
                gamified learning experiences.
              </p>
              <p className="text-gray-700 mb-6">
                Whether you&apos;re learning for travel, work, or personal
                growth, TULU makes it easy to build a daily language
                learning habit that sticks.
              </p>
              <LocaleLink href="/sign-in">
                <Button className="bg-[#58cc02] hover:bg-[#46a302] text-white font-bold">
                  Start Learning Today
                </Button>
              </LocaleLink>
            </div>
          </div>

          <div className="mb-16">
            <h2 className="text-2xl font-bold mb-6 text-center">
              How TULU Works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-gray-50 p-6 rounded-lg text-center">
                <div className="bg-[#ffc800] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">1</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Learn Through Play</h3>
                <p className="text-gray-700">
                  Our bite-sized lessons feel more like games than studying,
                  making learning addictive and fun.
                </p>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg text-center">
                <div className="bg-[#ff4b4b] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl text-white">2</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Practice Daily</h3>
                <p className="text-gray-700">
                  Build a streak and earn rewards by practicing just a few
                  minutes every day.
                </p>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg text-center">
                <div className="bg-[#1cb0f6] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl text-white">3</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Track Your Progress</h3>
                <p className="text-gray-700">
                  Watch yourself improve with XP, achievements, and level-ups
                  that keep you motivated.
                </p>
              </div>
            </div>
          </div>

          <div className="mb-16">
            <h2 className="text-2xl font-bold mb-6">Our Story</h2>
            <p className="text-gray-700 mb-4">
              TULU was founded in 2025 by a team of language enthusiasts
              and education technology experts who wanted to revolutionize how
              people learn languages. Frustrated by traditional methods that
              felt boring and ineffective, we set out to create a platform that
              makes language learning as enjoyable as playing a game.
            </p>
            <p className="text-gray-700 mb-4">
              Today, TULU helps millions of learners worldwide master new
              languages through our scientifically-designed curriculum and
              engaging gamification elements. Our adaptive learning technology
              personalizes each user&apos;s experience, focusing on areas where
              they need the most practice.
            </p>
            <p className="text-gray-700">
              We&apos;re constantly evolving and expanding our language
              offerings, with a commitment to making quality language education
              accessible to everyone, everywhere.
            </p>
          </div>

          <div className="bg-gray-50 p-8 rounded-lg text-center">
            <h2 className="text-2xl font-bold mb-4">Join Our Community</h2>
            <p className="text-gray-700 mb-6">
              Become part of our global community of language learners and start
              your journey today.
            </p>
            <LocaleLink href="/learn">
              <Button
                size="lg"
                className="bg-[#58cc02] hover:bg-[#46a302] text-white font-bold"
              >
                Get Started for Free
              </Button>
            </LocaleLink>
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
