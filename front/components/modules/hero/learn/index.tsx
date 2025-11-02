"use client";

import Container from "@/components/custom/container";
import Loading from "@/components/custom/loading";
import { useAppDispatch } from "@/store";
import { fetchLessons } from "@/store/lessonsSlice";
import { fetchUserProgress } from "@/store/progressSlice";
import { fetchSettings } from "@/store/settingsSlice";
import { fetchUserData } from "@/store/userSlice";
import { Language } from "@/types";
import { useAuth } from "@clerk/nextjs";
import Image from "next/image";
import { useLocalizedRouter } from "@/hooks/useLocalizedRouter";
import React, { useState } from "react";
import { useIntl } from "react-intl";
import { apiClient } from "@/lib/api-client";
import useSWR from "swr";

// SWR fetcher function
const fetchLanguages = async (
  getToken: () => Promise<string | null>
): Promise<Language[]> => {
  const token = await getToken();
  const response = await apiClient.get("/api/public/lessons?action=learn", {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data.languages || [];
};

export default function LanguagesToLearn() {
  const { userId, getToken } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const router = useLocalizedRouter();
  const dispatch = useAppDispatch();
  const intl = useIntl();

  const {
    data: languages,
    error,
    isLoading: loadingLanguages,
    mutate,
  } = useSWR("/api/public/lessons", () => fetchLanguages(getToken));

  const handleLearn = async (languageId: string) => {
    setIsLoading(true);
    const token = await getToken();

    try {
      await apiClient.post(
        `/api/progress/addlanguage`,
        { userId, languageId },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (userId && token) {
        await dispatch(fetchUserData({ userId, token }));
        await dispatch(fetchLessons({ languageId, token }));
        await dispatch(fetchUserProgress({ languageId, token }));
        await dispatch(fetchSettings({ token }));
      }

      router.push(`/dashboard`);
    } catch (error) {
      console.error("❌ Error starting progress:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    mutate(); // re-fetch on retry button click
  };

  return (
    <section className="py-20 flex-1">
      {(isLoading || loadingLanguages) && <Loading isLoading={true} />}

      <Container>
        <div className="grid grid-cols-1 gap-20 justify-items-center items-center">
          <h3 className="text-center">
            {intl.formatMessage({ id: "learn.title" })}
          </h3>

          {error ? (
            <div className="flex flex-col items-center gap-4">
              <p className="text-red-500">
                {intl.formatMessage({
                  id: "learn.error",
                  defaultMessage: "Error fetching languages. Please try again.",
                })}
              </p>
              <button
                onClick={handleRetry}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg"
              >
                {intl.formatMessage({
                  id: "learn.retry",
                  defaultMessage: "Retry",
                })}
              </button>
            </div>
          ) : languages && languages.length > 0 ? (
            <div className="flex flex-wrap gap-10 justify-center">
              {languages.map((language) => (
                <div
                  key={language._id}
                  role="button"
                  onClick={() => handleLearn(language._id)}
                  className="flex flex-col justify-center gap-4 items-center border border-gray-200 rounded-xl hover:bg-gray-200 p-6 px-14 w-full sm:w-fit cursor-pointer"
                >
                  <Image
                    src={
                      language.imageUrl ||
                      "https://cdn-icons-png.flaticon.com/128/10446/10446694.png"
                    }
                    width={70}
                    height={70}
                    alt={`${language.name} flag`}
                  />
                  <div className="flex flex-col items-center">
                    <h6>{language.name}</h6>
                    <span className="text-sm text-muted-foreground">
                      {intl.formatMessage(
                        { id: "learn.learners" },
                        {
                          count:
                            language.userCount + 1124 > 1000
                              ? ((language.userCount + 1124) / 1000).toFixed(
                                  1
                                ) + "k"
                              : language.userCount + 1124,
                        }
                      )}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center mt-12 animate-fadeIn text-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-14 h-14 text-gray-400 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 14v.01M12 10h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"
                />
              </svg>

              <h4 className="text-lg font-medium text-gray-700 mb-2">
                {intl.formatMessage({
                  id: "learn.empty.title",
                  defaultMessage: "No Languages Available",
                })}
              </h4>

              <p className="text-sm text-gray-500 max-w-md">
                {intl.formatMessage({
                  id: "learn.empty",
                  defaultMessage:
                    "There is no language to learn right now. Please come back later.",
                })}
              </p>
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
