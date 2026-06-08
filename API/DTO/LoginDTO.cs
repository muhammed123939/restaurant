using System;

namespace API.DTO;

public class LoginDTO
{
    public required string Name { get; set; }
    public required string Password { get; set; }
}
