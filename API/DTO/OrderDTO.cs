using System;
using System.Collections.Generic;
using API.DTO;

namespace API.DTOs
{
    public class OrderDTO
    {
        public int OrderID { get; set; }
        public int? TableNo{ get; set; }
        public string? Status { get; set; }
        public string? Comment { get; set; }
        public string OrderPosition { get; set; }
        public int? CustomerID { get; set; }
        public int BranchID { get; set; }
        public string? BranchName { get; set; }
        public int? AddressID { get; set; }
        public DateTime OrderDate { get; set; }
        public decimal TotalAmount { get; set; }
    public UserDataDTO ? customer { get; set; }
    public OrderForDeliveryDTO ? orderfordelivery { get; set; }

        public List<OrderDetailDTO> OrderDetails { get; set; }
    }

    public class OrderDetailDTO
    {
        public int OrderDetailID { get; set; }
        public int OrderID { get; set; }
        public int MenuItemID { get; set; }
        public int Quantity { get; set; }
        public string Name { get; set; }
        public decimal Price { get; set; }
    }
}
