"use server";
import { apiClient } from "@/lib/api-client";
import { auth } from "@clerk/nextjs/server";

export const getLessonUnitTest = async (lastUnit: string, id: string) => {
  try {
    const { getToken } = await auth();
    const token = await getToken();

    const response = await apiClient.get(`/api/units/${lastUnit}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      params: {
        lastUnit: id,
      },
    });

    return response.data;
  } catch (error) {
    return error;
  }
};
