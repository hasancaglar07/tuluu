"use client";

import HeaderPage from "@/components/modules/header/page";
import Container from "@/components/custom/container";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { LocaleLink } from "@/components/custom/locale-link";
import { FormattedMessage } from "react-intl";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <HeaderPage />

      <Container className="py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8">
            <FormattedMessage id="about.title" />
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
              <h2 className="text-2xl font-bold mb-4">
                <FormattedMessage id="about.mission.title" />
              </h2>
              <p className="text-gray-700 mb-4">
                <FormattedMessage id="about.mission.paragraph1" />
              </p>
              <p className="text-gray-700 mb-4">
                <FormattedMessage id="about.mission.paragraph2" />
              </p>
              <p className="text-gray-700 mb-6">
                <FormattedMessage id="about.mission.paragraph3" />
              </p>
              <LocaleLink href="/sign-in">
                <Button className="bg-[#58cc02] hover:bg-[#46a302] text-white font-bold">
                  <FormattedMessage id="about.mission.cta" />
                </Button>
              </LocaleLink>
            </div>
          </div>

          <div className="mb-16">
            <h2 className="text-2xl font-bold mb-6 text-center">
              <FormattedMessage id="about.howItWorks.title" />
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-gray-50 p-6 rounded-lg text-center">
                <div className="bg-[#ffc800] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">1</span>
                </div>
                <h3 className="text-xl font-bold mb-2">
                  <FormattedMessage id="about.howItWorks.step1.title" />
                </h3>
                <p className="text-gray-700">
                  <FormattedMessage id="about.howItWorks.step1.description" />
                </p>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg text-center">
                <div className="bg-[#ff4b4b] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl text-white">2</span>
                </div>
                <h3 className="text-xl font-bold mb-2">
                  <FormattedMessage id="about.howItWorks.step2.title" />
                </h3>
                <p className="text-gray-700">
                  <FormattedMessage id="about.howItWorks.step2.description" />
                </p>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg text-center">
                <div className="bg-[#1cb0f6] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl text-white">3</span>
                </div>
                <h3 className="text-xl font-bold mb-2">
                  <FormattedMessage id="about.howItWorks.step3.title" />
                </h3>
                <p className="text-gray-700">
                  <FormattedMessage id="about.howItWorks.step3.description" />
                </p>
              </div>
            </div>
          </div>

          <div className="mb-16">
            <h2 className="text-2xl font-bold mb-6">
              <FormattedMessage id="about.story.title" />
            </h2>
            <p className="text-gray-700 mb-4">
              <FormattedMessage id="about.story.paragraph1" />
            </p>
            <p className="text-gray-700 mb-4">
              <FormattedMessage id="about.story.paragraph2" />
            </p>
            <p className="text-gray-700 mb-4">
              <FormattedMessage id="about.story.paragraph3" />
            </p>
            <p className="text-gray-700">
              <FormattedMessage id="about.story.paragraph4" />
            </p>
          </div>

          <div className="mb-16">
            <h2 className="text-2xl font-bold mb-6 text-center">
              <FormattedMessage id="about.features.title" />
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-3 text-green-800">
                  <FormattedMessage id="about.features.values.title" />
                </h3>
                <p className="text-gray-700">
                  <FormattedMessage id="about.features.values.description" />
                </p>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-3 text-blue-800">
                  <FormattedMessage id="about.features.categories.title" />
                </h3>
                <p className="text-gray-700">
                  <FormattedMessage id="about.features.categories.description" />
                </p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-3 text-purple-800">
                  <FormattedMessage id="about.features.islamic.title" />
                </h3>
                <p className="text-gray-700">
                  <FormattedMessage id="about.features.islamic.description" />
                </p>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-3 text-orange-800">
                  <FormattedMessage id="about.features.parental.title" />
                </h3>
                <p className="text-gray-700">
                  <FormattedMessage id="about.features.parental.description" />
                </p>
              </div>

              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-3 text-yellow-800">
                  <FormattedMessage id="about.features.gamification.title" />
                </h3>
                <p className="text-gray-700">
                  <FormattedMessage id="about.features.gamification.description" />
                </p>
              </div>

              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-3 text-indigo-800">
                  <FormattedMessage id="about.features.multilingual.title" />
                </h3>
                <p className="text-gray-700">
                  <FormattedMessage id="about.features.multilingual.description" />
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-8 rounded-lg text-center">
            <h2 className="text-2xl font-bold mb-4">
              <FormattedMessage id="about.community.title" />
            </h2>
            <p className="text-gray-700 mb-6">
              <FormattedMessage id="about.community.description" />
            </p>
            <LocaleLink href="/learn">
              <Button
                size="lg"
                className="bg-[#58cc02] hover:bg-[#46a302] text-white font-bold"
              >
                <FormattedMessage id="about.community.cta" />
              </Button>
            </LocaleLink>
          </div>
        </div>
      </Container>

      <footer className="bg-gray-100 py-8 mt-12">
        <Container>
          <div className="text-center text-gray-600">
            <div className="flex justify-center gap-4">
              <LocaleLink href="/terms" className="hover:underline">
                <FormattedMessage id="footer.privacy" />
              </LocaleLink>
              <LocaleLink
                href="https://tulukitap.com/"
                className="hover:underline"
              >
                Tulu Kitap
              </LocaleLink>
              <LocaleLink href="/about" className="hover:underline">
                <FormattedMessage id="about.title" />
              </LocaleLink>
            </div>
          </div>
        </Container>
      </footer>
    </div>
  );
}
