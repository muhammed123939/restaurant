using System;

namespace API.Entities;

public class Branch
{
        public int BranchID { get; set; }
        public string Name { get; set; }
        public string? Location { get; set; }
        public string? Phone { get; set; }

        public ICollection<Table> Tables { get; set; } = new List<Table>();
        public ICollection<User> Users { get; set; }
        public ICollection<Menu> Menus { get; set; }
        public ICollection<Order> Orders { get; set; }
        public ICollection<Inventory> Inventories { get; set; }
      
}
