using System;

namespace API.DTO;

public class UserDataDTO
{
    public int UserID { get; set; }
    public string? Name { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? Password { get; set; }
    public string? Role { get; set; }
    public bool? Verified { get; set; }
    public int? BranchID { get; set; }
    public string? BranchName { get; set; }
    // 🔹 Navigation to Employee
    public EmployeeDTO? Employee { get; set; }
}


