export interface UserData {
  userID: any
  name: string
  email?: string
  phone?: string
  password?: any
  role? : string
  verified?: boolean
  branchID?: number
  branchName?:string
  employeeID?: number;       // FK to Employee
  employee?: Employee;
}


export interface Employee {
  employeeID?: number;
  position?: string;
  salary?: number;
  isAvailable?: boolean;
}

