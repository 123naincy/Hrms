export interface CreateEmployeeInput {
  fullName: string;
  email: string;
  mobile: string;

  department?: string;
  designation?: string;

  role?: string;

  joiningDate?: string;

  password?: string;
}