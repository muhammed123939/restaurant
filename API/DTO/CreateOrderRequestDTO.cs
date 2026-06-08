using System;
using API.DTOs;

namespace API.DTO;

public class CreateOrderRequestDTO
{
    public OrderDTO order { get; set; }
    public OrderForDeliveryDTO? OrderForDeliveryDTO { get; set; } // optional (only for delivery orders)

}
