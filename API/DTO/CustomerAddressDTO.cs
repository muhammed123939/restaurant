using System;

namespace API.DTO;

public class CustomerAddressDTO
{
  public int? addressID { get; set; }
    public int? street { get; set; }
    public string? city { get; set; }
    public int building { get; set; }
    public int floor { get; set; }
    public int appartment { get; set; }
    public string? details { get; set; }
}
