using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace API.Entities;

public class OrdersForDelivery
{

    public int OrdersForDeliveryId { get; set; }

    [Required]
    public int OrderId { get; set; }

    public int? EmployeeId { get; set; }          // FK to User (Employee)
    public int AddressID { get; set; }   // FK to CustomerAddress

    public string? Comment { get; set; }

    public string Status { get; set; } = "Pending";

    public DateTime AssignedAt { get; set; } = DateTime.UtcNow;
    public DateTime? DeliveredAt { get; set; }

    // Navigation properties
    [ForeignKey("OrderId")]
    public Order? Order { get; set; }

    [ForeignKey("EmployeeId")]
    public User? Employee { get; set; }          // Employee data

    [ForeignKey("AddressID")]
    public CustomerAddress? CustomerAddress { get; set; } // will give you the client
    
    }


