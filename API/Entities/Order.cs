using System.ComponentModel.DataAnnotations.Schema;

namespace API.Entities;

public class Order
{
        public int OrderID { get; set; }
        public int? CustomerID { get; set; }
        public int BranchID { get; set; }
        public int? AddressID { get; set; }
        public int? TableNo { get; set; }
        public string? Status { get; set; }
        public string? Comment { get; set; }
        public DateTime OrderDate { get; set; }
        public decimal TotalAmount { get; set; }
        public string OrderPosition { get; set; }
        public decimal TotalProfit { get; set; }
        public User Customer { get; set; }
        public Table Table { get; set; }
        public Branch Branch { get; set; }


        [ForeignKey("AddressID")]
        public CustomerAddress Address { get; set; }
        public ICollection<OrderDetail> OrderDetails { get; set; }
        public ICollection<OrdersForDelivery> OrdersForDeliveries { get; set; }
}
