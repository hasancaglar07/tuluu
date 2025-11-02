"use server";
import { apiClient } from "@/lib/api-client";
import { auth } from "@clerk/nextjs/server";

export const getLesson = async (id: string) => {
  try {
    const { getToken } = await auth();

    const token = await getToken();

    const response = await apiClient.get(
      process.env.NEXT_PUBLIC_API_URL + "/api/admin/lessons/" + id,
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
