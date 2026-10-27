import api from "./api";

export const getEmployees = async () => {
  const response = await api.get("/employees");

  return response.data.data;
};

export const getEmployeeById = async (id: string) => {
  const response = await api.get(`/employees/${id}`);

  return response.data.data;
};

export const createEmployee = async (data: any) => {
  const response = await api.post("/employees", data);

  return response.data.data;
};

export const updateEmployee = async (
  id: string,
  data: any
) => {
  const response = await api.put(
    `/employees/${id}`,
    data
  );

  return response.data.data;
};

export const updateEmployeeStatus = async (
  id: string,
  isActive: boolean
) => {
  const response = await api.patch(
    `/employees/${id}/status`,
    {
      isActive,
    }
  );

  return response.data.data;
};

export const resetEmployeePassword = async (
  id: string,
  newPassword: string
) => {
  const response = await api.patch(
    `/employees/${id}/password`,
    {
      newPassword,
    }
  );

  return response.data;
};