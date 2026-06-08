using System;
using System.ComponentModel.DataAnnotations;

namespace API.Entities;

public class User
{
        [Key]
        public int UserID { get; set; }
        public string Name { get; set; }
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public byte[] PasswordHash { get; set; }
        public byte[] PasswordSalt { get; set; }
        public int? BranchID { get; set; }
        public string Role { get; set; } // Customer, Employee, Admin

        public bool Verified { get; set; }  // ✅ new column
        
        public Branch Branch { get; set; }
        public ICollection<CustomerAddress> Addresses { get; set; }
        public ICollection<Order> Orders { get; set; }
        public ICollection<OrdersForDelivery> OrdersForDeliveries { get; set; }
        public Employee Employee { get; set; }
        public ICollection<Notification> Notifications { get; set; }

}
