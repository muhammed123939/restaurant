using System;

namespace API.Entities;

public class Inventory
{
   public int InventoryID { get; set; }
    public int BranchID { get; set; }
    public int MenuItemID { get; set; }
    public int QuantityAvailable { get; set; }
    public string? Unit { get; set; }

    public Branch Branch { get; set; }
    public Menu Menu { get; set; }
}
