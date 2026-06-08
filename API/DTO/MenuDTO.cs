using System;

namespace API.DTO;

public class MenuDTO
{
    public int? menuItemID { get; set; }
    public int branchID { get; set; }
    public string? name { get; set; }
    public int categoryID { get; set; }
    public decimal sell_price { get; set; }
    public decimal buy_price { get; set; }
    public string? imageUrl { get; set; }
    public string? publicId { get; set; }
    public int? quantity { get; set; }

}