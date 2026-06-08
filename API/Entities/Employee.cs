using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace API.Entities;

public class Employee
{
        [ForeignKey("User")]

        public int EmployeeID { get; set; } // FK to Users
        public string? Position { get; set; }
        public decimal? Salary { get; set; }
        public bool IsAvailable { get; set; }
        public User User { get; set; }

}
