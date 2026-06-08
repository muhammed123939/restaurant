using System;

namespace API.Entities;

public class OrderDetail
{
        public int OrderDetailID { get; set; }
        public int OrderID { get; set; }
        public int MenuItemID { get; set; }
        public int Quantity { get; set; }
        public decimal Price { get; set; }
        public string Name { get; set; }
         public decimal Profit { get; set; }
        public Order Order { get; set; }
        public Menu MenuItem { get; set; }
}
