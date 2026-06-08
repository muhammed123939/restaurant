using API.Entities;
using Humanizer;
using Microsoft.EntityFrameworkCore;

namespace API.Data
{
    public class DataContext : DbContext
    {
        public DataContext(DbContextOptions<DataContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Table> Tables { get; set; }
        public DbSet<Branch> Branches { get; set; }
        public DbSet<Employee> Employees { get; set; }
        public DbSet<CustomerAddress> CustomerAddresses { get; set; }
        public DbSet<Menu> Menus { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderDetail> OrderDetails { get; set; }
        public DbSet<OrdersForDelivery> OrdersForDeliverys { get; set; }
        public DbSet<Inventory> Inventories { get; set; }
        public DbSet<Notification> Notifications { get; set; }
        public DbSet<Categories> Categories { get; set; }
    
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);


            // Automatic pluralization for all other entities
            foreach (var entity in modelBuilder.Model.GetEntityTypes())
            {

                var tableName = entity.GetTableName();
                entity.SetTableName(tableName.Pluralize());
            }

            modelBuilder.Entity<Inventory>(entity =>

            {

                entity.HasKey(i => i.InventoryID);

                entity.HasOne(i => i.Branch)
                      .WithMany(b => b.Inventories)
                      .HasForeignKey(i => i.BranchID);

                entity.HasOne(i => i.Menu)
                      .WithMany(m => m.Inventories)
                      .HasForeignKey(i => i.MenuItemID);
            });

            // ✅ OrdersForDelivery → Order
            modelBuilder.Entity<OrdersForDelivery>()
                .HasOne(d => d.Order)
                .WithMany(o => o.OrdersForDeliveries)
                .HasForeignKey(d => d.OrderId)
                .OnDelete(DeleteBehavior.Restrict);

            // ✅ OrdersForDelivery → CustomerAddress
            modelBuilder.Entity<OrdersForDelivery>()
                .HasOne(d => d.CustomerAddress)
                .WithMany(a => a.OrdersForDeliveries)
                .HasForeignKey(d => d.AddressID)
                .OnDelete(DeleteBehavior.Restrict);

            // ✅ OrdersForDelivery → Employee (User)
            modelBuilder.Entity<OrdersForDelivery>()
                .HasOne(d => d.Employee)
                .WithMany(u => u.OrdersForDeliveries)
                .HasForeignKey(d => d.EmployeeId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<User>()
                .HasOne(u => u.Branch)
                .WithMany(b => b.Users)
                .HasForeignKey(u => u.BranchID);

            modelBuilder.Entity<Notification>()
                .HasOne(n => n.User)
                .WithMany(u => u.Notifications)
                .HasForeignKey(n => n.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Menu>()
                .HasOne(m => m.Category)
                .WithMany(c => c.MenuItems)
                .HasForeignKey(m => m.CategoryID);

            // ✅ Employee (1-to-1) with User
            modelBuilder.Entity<Employee>()
                .HasOne(e => e.User)
                .WithOne(u => u.Employee)
                .HasForeignKey<Employee>(e => e.EmployeeID)
                .OnDelete(DeleteBehavior.Restrict);

            // One-to-many Table -> Orders
            modelBuilder.Entity<Order>()
                .HasOne(o => o.Table)
                .WithMany(t => t.Orders)
                .HasForeignKey(o => o.TableNo)
                .OnDelete(DeleteBehavior.SetNull); // if table is deleted, order remains

            // ✅ Order → Customer (User)
            modelBuilder.Entity<Order>()
                .HasOne(o => o.Customer)
                .WithMany(u => u.Orders)
                .HasForeignKey(o => o.CustomerID)
                .OnDelete(DeleteBehavior.Restrict);

            // ✅ Order → Branch
            modelBuilder.Entity<Order>()
                .HasOne(o => o.Branch)
                .WithMany(b => b.Orders)
                .HasForeignKey(o => o.BranchID)
                .OnDelete(DeleteBehavior.Restrict);

            // ✅ Order → Address
            modelBuilder.Entity<Order>()
                .HasOne(o => o.Address)
                .WithMany(a => a.Orders)
                .HasForeignKey(o => o.AddressID)
                .OnDelete(DeleteBehavior.Restrict);

            // ✅ OrderDetail → MenuItem
            modelBuilder.Entity<OrderDetail>()
                .HasOne(od => od.MenuItem)
                .WithMany(m => m.OrderDetails)
                .HasForeignKey(od => od.MenuItemID)
                .OnDelete(DeleteBehavior.Restrict);


        }
    }
}
