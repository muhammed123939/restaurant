using System;
using System.ComponentModel.DataAnnotations;

namespace API.Entities;

public class CustomerAddress
{

        [Key] 
        public int AddressID { get; set; }
        public int UserID { get; set; }
        public int Building { get; set; }
        public int Floor { get; set; }
        public int Appartment { get; set; }
        
        public int? Street { get; set; }
        public string? City { get; set; }
        public string? Details { get; set; }
        
        public User User { get; set; }
        public ICollection<Order> Orders { get; set; }
       
public ICollection<OrdersForDelivery> OrdersForDeliveries { get; set; }
}
