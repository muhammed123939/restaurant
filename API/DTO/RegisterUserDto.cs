using System;
using System.ComponentModel.DataAnnotations;

namespace API.DTO;

public class RegisterUserDto
{

    public string  Name { get; set; } 
    public string? Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public int BranchID { get; set; } 
    public int? salary { get; set; } 
public string? Position { get; set; } 

    public string? password { get; set; } = string.Empty;
    


}
