"use server";
import { apiClient } from "@/lib/api-client";
import { auth } from "@clerk/nextjs/server";

export const getData = async (action: string) => {
  try {
    const { getToken } = await auth();
    const token = await getToken();

    const response = await apiClient.get(
      `/api/public/lessons?action=${action}`,
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
