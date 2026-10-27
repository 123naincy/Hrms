import api from "./api";

export const getTodayAttendance = async () => {
  const response = await api.get("/attendance/today");

  return response.data.data;
};

export const punchIn = async (data: {
  location?: string;
  selfie?: string;
  workMode?: string;
  latitude?: number;
  longitude?: number;
}) => {
  const response = await api.post(
    "/attendance/punch-in",
    data
  );

  return response.data.data;
};

export const punchOut = async (data: {
  location?: string;
  selfie?: string;
  latitude?: number;
  longitude?: number;
}) => {
  const response = await api.post(
    "/attendance/punch-out",
    data
  );

  return response.data.data;
};

export const getMonthlyAttendance = async (
  year: number,
  month: number
) => {
  const response = await api.get(
    "/attendance/my/monthly",
    {
      params: {
        year,
        month,
      },
    }
  );

  return response.data.data;
};