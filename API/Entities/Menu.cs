using System;
using System.ComponentModel.DataAnnotations;

namespace API.Entities;

public class Menu
{
    [Key]
    public int MenuItemID { get; set; }
    public int BranchID { get; set; }
    public string Name { get; set; }
    public string? ImageUrl { get; set; }
    public string? PublicId { get; set; }
    public decimal sell_price { get; set; }
    public decimal buy_price { get; set; }
    public int CategoryID { get; set; }
 
    public Categories Category { get; set; } = null!;
    public Branch Branch { get; set; }
    public ICollection<OrderDetail> OrderDetails { get; set; }
    public ICollection<Inventory> Inventories { get; set; }
}
