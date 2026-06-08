using System;

namespace API.DTO;

public class EmployeeDTO
{
    public int? EmployeeID { get; set; }
    public string? Position { get; set; }
    public decimal? Salary { get; set; }
    public bool? IsAvailable { get; set; }
    public int? UserID { get; set; }
        public string? BranchName { get; set; }
    public UserDataDTO? User { get; set; }
}

