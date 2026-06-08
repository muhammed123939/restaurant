using System;

namespace API.DTO;

public class ReceiptDto
{
  public int OrderID { get; set; }
    public string OrderNumber { get; set; }
    public DateTime Date { get; set; }

    public string? OrderPosition { get; set; }
    public int? TableNo { get; set; }

    public string? OrderComment { get; set; }
    public string? DeliveryComment { get; set; }

    public string? CustomerName { get; set; }
    public string? CustomerPhone { get; set; }

    public int? Building { get; set; }
    public int? Appartment { get; set; }
    public string? City { get; set; }
    public int? Floor { get; set; }
    public int? Street { get; set; }


    public List<ReceiptItemDto> Items { get; set; }

    public decimal SubTotal { get; set; }
    public decimal Tax { get; set; }
    public decimal Total { get; set; }
}

public class ReceiptItemDto
{
    public string Name { get; set; }
    public int Quantity { get; set; }
    public decimal Price { get; set; }
}

