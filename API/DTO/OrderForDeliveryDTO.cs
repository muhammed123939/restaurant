using System;
using API.DTOs;

namespace API.DTO;

public class OrderForDeliveryDTO
{
    public int? OrdersForDeliveryId { get; set; }
    public string? Comment { get; set; }
    public string status { get; set; } 
    public DateTime AssignedAt { get; set; }
    public DateTime? DeliveredAt { get; set; }
    public OrderDTO? order { get; set; }
    public UserDataDTO? employee { get; set; }
    public CustomerAddressDTO? deliveryAddress { get; set; }
}
