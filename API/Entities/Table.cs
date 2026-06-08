using System;

namespace API.Entities;

public class Table
{
   public int TableID { get; set; }
    public int TableNo { get; set; }
    public int Capacity { get; set; }
    public bool Status { get; set; } // Available / Occupied
    public int BranchID { get; set; }

   public Branch Branch { get; set; }
    // 🔗 One Table → Many Orders
    public ICollection<Order> Orders { get; set; } = new List<Order>();
}



