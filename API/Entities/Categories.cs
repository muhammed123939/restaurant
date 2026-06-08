using System;
using System.ComponentModel.DataAnnotations;

namespace API.Entities
{
    public class Categories
        {[Key]
        public int CategoryID { get; set; }

        public string Name { get; set; } = null!;

        // Navigation Property
        public ICollection<Menu> MenuItems { get; set; } = new List<Menu>();
    }
}
