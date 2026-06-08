using System;

namespace API.Entities;

public class Notification
{
    public int Id { get; set; }
     // Receiver
      public int UserId { get; set; }     // FK
    public string Role { get; set; }         // "trainer", "client", etc.
    public string Title { get; set; }
    public string Message { get; set; }
    public bool IsRead { get; set; } = false;
    public User User { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
 
}
