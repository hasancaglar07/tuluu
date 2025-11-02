"use server";
import { apiClient } from "@/lib/api-client";
import { auth } from "@clerk/nextjs/server";

export const getData = async (action: string) => {
  try {
    const { getToken } = await auth();
    const token = await getToken();

    const response = await apiClient.get(
      `${process.env.NEXT_PUBLIC_API_URL}/api/admin/languages?action=${action}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    return error;
  }
};

export const checkLastUnitIsCompleted = async (id: string) => {
  try {
    const { getToken, userId } = await auth();
    const token = await getToken();

    const response = await apiClient.get(
      `${process.env.NEXT_PUBLIC_API_URL}/api/progress/checkcompletedunit`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },

        params: {
          userId: userId,
          unitId: id,
        },
      }
    );

    return response.data;
  } catch (error) {
    return error;
  }
};
