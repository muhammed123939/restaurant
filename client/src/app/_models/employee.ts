export interface User {
  userID?: number;
  name?: string;
  branchID?: number;
  branchName?: string;

}

export interface Employee {
  employeeID: number;
  position?: string;
  salary?: number;
  isAvailable?: boolean;
  // 🔹 Navigation to User
  user?: User;     // optional nested user object
}