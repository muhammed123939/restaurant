using System;

namespace API.DTO;

public class DataLoginDTO
{
    public required int Id { get; set; }
    public  int ? BranchID { get; set; }
    public required string Name { get; set; }
    public  string Role { get; set; }
    public  string? Position{ get; set; }
    public required string Token { get; set; }
}
