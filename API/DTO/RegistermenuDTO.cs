using System;

namespace API.DTO;

public class RegistermenuDTO
{
    public int branchID { get; set; }
     public string? name { get; set; }
     public int categoryID { get; set; }
     public decimal  sell_price { get; set; }
     public decimal  buy_price { get; set; }
 public int Quantity { get; set; } 

}
