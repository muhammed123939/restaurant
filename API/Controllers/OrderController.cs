using API.Data;
using API.DTO;
using API.DTOs;
using API.Entities;
using API.interfaces;
using API.Services;
using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{
    public class OrderController(DataContext context, ITokenService tokenService, IMapper mapper, NotificationService notificationService) : BaseApiController
    {
        // Tables 
        [HttpPut("closeorder/{orderID}")]
        public async Task<ActionResult> CloseOrder(int orderID)
        {
            // 1️⃣ Find the order
            var order = await context.Orders.FindAsync(orderID);
            if (order == null)
                return NotFound("Order not found");

            // 2️⃣ Mark order as closed
            order.Status = "Closed";
            // 3️⃣ Free the table if it's a dine-in order
            if (order.TableNo.HasValue)
            {
                var table = await context.Tables
                    .FirstOrDefaultAsync(t => t.TableNo == order.TableNo);

                if (table != null)
                {
                    table.Status = false; // Available again
                }
            }
            // 4️⃣ Save changes
            await context.SaveChangesAsync();
            return Ok();
        }

        [HttpGet("open-for-table/{tableNo}")]
        public async Task<ActionResult<OrderDTO>> GetOpenOrderForTable(int tableNo)
        {
            // 1️⃣ Check if table exists
            var table = await context.Tables.FindAsync(tableNo);
            if (table == null)
                return NotFound("Table not found");

            // 2️⃣ Find open order for this table
            var order = await context.Orders
                .Include(o => o.OrderDetails)
                .FirstOrDefaultAsync(o => o.TableNo == tableNo && o.Status == "Open");

            if (order == null)
                return Ok(null); // No open order

            // 3️⃣ Map to DTO
            var orderDto = new OrderDTO
            {
                Comment = order.Comment,
                OrderID = order.OrderID,
                TableNo = order.TableNo,
                CustomerID = order.CustomerID,
                BranchID = order.BranchID,
                AddressID = order.AddressID,
                OrderDate = order.OrderDate,
                Status = order.Status,
                OrderPosition = order.OrderPosition,
                TotalAmount = order.TotalAmount,
                OrderDetails = order.OrderDetails.Select(d => new OrderDetailDTO
                {
                    OrderDetailID = d.OrderDetailID,
                    OrderID = d.OrderID,
                    MenuItemID = d.MenuItemID,
                    Name = d.Name,
                    Quantity = d.Quantity,
                    Price = d.Price
                }).ToList()
            };

            return Ok(orderDto);
        }

        // ORDER
        [HttpPost]
        public async Task<ActionResult<OrderDTO>> AddOrder(CreateOrderRequestDTO request)
        {
            var orderDto = request.order;
            var orderfordeliveryDTO = request.OrderForDeliveryDTO;

            if (orderDto == null || orderDto.OrderDetails == null || !orderDto.OrderDetails.Any())
                return BadRequest("Order details are required");

            Order order;

            // ============================
            // 🟢 DINE-IN (TABLE ORDER)
            // ============================
            if (orderDto.TableNo.HasValue)
            {
                // Check if there's already an open order for this table
                order = await context.Orders
                    .Include(o => o.OrderDetails).ThenInclude(d => d.MenuItem)
                    .FirstOrDefaultAsync(o =>
                        o.TableNo == orderDto.TableNo &&
                        o.Status == "Open");

                if (order != null)
                {
                    // 🔄 Update existing order
                    foreach (var newItem in orderDto.OrderDetails)
                    {
                        var existingItem = order.OrderDetails
                            .FirstOrDefault(d => d.MenuItemID == newItem.MenuItemID);

                        if (existingItem != null)
                        {
                            existingItem.Quantity += newItem.Quantity;
                        }
                        else
                        {
                            order.OrderDetails.Add(new OrderDetail
                            {
                                MenuItemID = newItem.MenuItemID,
                                Quantity = newItem.Quantity,
                                Price = newItem.Price,
                                Name = newItem.Name
                            });
                        }
                    }
                }
                else
                {
                    // 🆕 Create new dine-in order
                    order = new Order
                    {
                        TableNo = orderDto.TableNo,
                        Status = "Open",
                        OrderPosition = orderDto.OrderPosition,
                        BranchID = orderDto.BranchID,
                        OrderDate = orderDto.OrderDate,
                        Comment = orderDto.Comment,

                        OrderDetails = orderDto.OrderDetails.Select(od => new OrderDetail
                        {
                            MenuItemID = od.MenuItemID,
                            Quantity = od.Quantity,
                            Price = od.Price,
                            Name = od.Name
                        }).ToList()
                    };

                    await context.Orders.AddAsync(order);
                }

                // 🔥 Update table status
                var table = await context.Tables
                    .FirstOrDefaultAsync(t => t.TableNo == orderDto.TableNo);

                if (table != null)
                {
                    table.Status = true;
                }
            }
            else
            {
                // ============================
                // 🚚 DELIVERY / TAKEAWAY ORDER
                // ============================
                order = new Order
                {
                    CustomerID = orderDto.CustomerID,

                    BranchID = orderDto.BranchID,
                    OrderPosition = orderDto.OrderPosition,
                    Status = null,
                    Comment = orderDto.Comment,
                    OrderDate = orderDto.OrderDate,

                    OrderDetails = orderDto.OrderDetails.Select(od => new OrderDetail
                    {
                        MenuItemID = od.MenuItemID,
                        Quantity = od.Quantity,
                        Price = od.Price,
                        Name = od.Name
                    }).ToList()
                };

                // ✅ DELIVERY ORDER
                if (orderDto.AddressID != null && orderDto.AddressID > 0)
                {
                    // Check address exists
                    var addressExists = await context.CustomerAddresses
                        .AnyAsync(a => a.AddressID == orderDto.AddressID);

                    if (!addressExists)
                        return BadRequest("Invalid AddressID");

                    order.AddressID = orderDto.AddressID;
                }

                // Save order first to generate OrderID
                await context.Orders.AddAsync(order);
                await context.SaveChangesAsync();

                // Create delivery record
                if (orderfordeliveryDTO != null && order.AddressID.HasValue)
                {
                    var orderfordelivery = new OrdersForDelivery
                    {
                        OrderId = order.OrderID,
                        AddressID = order.AddressID.Value,
                        Status = "Pending",
                        Comment = orderfordeliveryDTO.Comment,
                        AssignedAt = DateTime.UtcNow
                    };

                    if (order.CustomerID.HasValue)
                    {
                        await notificationService.SendToUser(
                            "Client",
                            order.CustomerID.Value,
                            $"Your Order Placed order ID #{order.OrderID}"
                        );
                    }

                    await context.OrdersForDeliverys.AddAsync(orderfordelivery);
                    await context.SaveChangesAsync();
                }
            }

            // ============================
            // 📦 INVENTORY CHECK
            // ============================
            foreach (var detail in orderDto.OrderDetails)
            {
                var inventory = await context.Inventories
                    .FirstOrDefaultAsync(i =>
                        i.BranchID == orderDto.BranchID &&
                        i.MenuItemID == detail.MenuItemID);

                if (inventory == null)
                    return BadRequest($"Item {detail.MenuItemID} not found in inventory");

                if (inventory.QuantityAvailable < detail.Quantity)
                    return BadRequest($"Not enough quantity for item {detail.MenuItemID}");

                inventory.QuantityAvailable -= detail.Quantity;
            }

            // ============================
            // 💰 RECALCULATE TOTAL
            // ============================
            order.TotalAmount = order.OrderDetails.Sum(d => d.Quantity * d.Price);
            await context.SaveChangesAsync();
            var getorderforprofit = await context.Orders
                .Include(o => o.OrderDetails)
                    .ThenInclude(d => d.MenuItem)
                .FirstOrDefaultAsync(o => o.OrderID == order.OrderID);
            if (getorderforprofit != null)
            {
                CalculateOrderProfit(getorderforprofit);
            }
            CalculateOrderProfit(getorderforprofit);

            await context.SaveChangesAsync();

            var receipt = await BuildReceiptAsync(order, orderfordeliveryDTO);

            return Ok(receipt);

        }
        private void CalculateOrderProfit(Order order)
        {

            foreach (var item in order.OrderDetails)
            {
                var sellPrice = item.MenuItem.sell_price;
                var costPrice = item.MenuItem.buy_price;

                item.Profit = (sellPrice - costPrice) * item.Quantity;
            }

            order.TotalProfit = order.OrderDetails.Sum(x => x.Profit);
        }
        private async Task<ReceiptDto> BuildReceiptAsync(
            Order order,
            OrderForDeliveryDTO? orderfordeliveryDTO = null)
        {
            string? deliveryComment = null;

            CustomerAddress? address = null;

            if (order.AddressID.HasValue)
            {
                address = await context.CustomerAddresses
                    .Include(a => a.User)
                    .FirstOrDefaultAsync(a => a.AddressID == order.AddressID.Value);
            }

            var isDelivery = address != null;

            if (isDelivery && orderfordeliveryDTO != null)
            {
                deliveryComment = string.IsNullOrWhiteSpace(orderfordeliveryDTO.Comment)
                    ? null
                    : orderfordeliveryDTO.Comment;
            }

            return new ReceiptDto
            {
                OrderID = order.OrderID,
                OrderNumber = order.OrderID.ToString(),
                Date = order.OrderDate,

                OrderPosition = order.OrderPosition,
                TableNo = order.TableNo,

                OrderComment = string.IsNullOrWhiteSpace(order.Comment)
                    ? null
                    : order.Comment,

                DeliveryComment = isDelivery
                    ? deliveryComment
                    : null,

                CustomerName = isDelivery
                    ? address?.User?.Name
                    : null,

                CustomerPhone = isDelivery
                    ? address?.User?.Phone
                    : null,

                Building = isDelivery ? address?.Building : null,
                Appartment = isDelivery ? address?.Appartment : null,
                City = isDelivery ? address?.City : null,
                Floor = isDelivery ? address?.Floor : null,
                Street = isDelivery ? address?.Street : null,

                Items = order.OrderDetails.Select(d => new ReceiptItemDto
                {
                    Name = d.Name,
                    Quantity = d.Quantity,
                    Price = d.Price
                }).ToList(),

                SubTotal = order.TotalAmount,
                Tax = 0,
                Total = order.TotalAmount
            };
        }

        // ============================
        // DELETE ORDER
        // ============================
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteOrder(int id)
        {
            var order = await context.Orders
                .Include(o => o.OrderDetails)
                .FirstOrDefaultAsync(o => o.OrderID == id);

            if (order == null)
                return NotFound();

            // ✅ Restore inventory quantities
            foreach (var detail in order.OrderDetails)
            {
                var inventory = await context.Inventories
                    .FirstOrDefaultAsync(i =>
                        i.BranchID == order.BranchID &&
                        i.MenuItemID == detail.MenuItemID);

                if (inventory != null)
                {
                    inventory.QuantityAvailable += detail.Quantity;
                }
            }

            // ✅ Make table available if TableNo exists
            if (order.TableNo.HasValue) // or != null if TableNo is int?
            {
                var table = await context.Tables
                    .FirstOrDefaultAsync(t => t.TableNo == order.TableNo);

                if (table != null)
                {
                    table.Status = false; // mark table as available
                }
            }

            // Remove order details and order
            context.OrderDetails.RemoveRange(order.OrderDetails);
            context.Orders.Remove(order);

            await context.SaveChangesAsync();

            return Ok();
        }

        [HttpGet("getorders")]
        public async Task<ActionResult<IEnumerable<OrderDTO>>> GetOrders()
        {
            var orders = await context.Orders
                .Include(o => o.OrderDetails)
                .Include(o => o.OrdersForDeliveries)
                .OrderByDescending(o => o.OrderDate)
                .ToListAsync();

            var ordersDto = orders.Select(o => new OrderDTO
            {
                Comment = o.Comment,
                OrderPosition = o.OrderPosition,
                Status = o.Status,
                TableNo = o.TableNo,
                OrderID = o.OrderID,
                CustomerID = o.CustomerID,
                BranchID = o.BranchID,
                AddressID = o.AddressID,
                OrderDate = o.OrderDate,
                TotalAmount = o.TotalAmount,

                orderfordelivery = o.OrderPosition == "Delivery"
            ? o.OrdersForDeliveries?
                .OrderByDescending(x => x.OrdersForDeliveryId)
                .Select(x => new OrderForDeliveryDTO
                {
                    OrdersForDeliveryId = x.OrdersForDeliveryId,
                    status = x.Status
                })
                .FirstOrDefault()
            : null,

                OrderDetails = o.OrderDetails.Select(od => new OrderDetailDTO
                {
                    Name = od.Name,
                    OrderDetailID = od.OrderDetailID,
                    OrderID = od.OrderID,
                    MenuItemID = od.MenuItemID,
                    Quantity = od.Quantity,
                    Price = od.Price
                }).ToList()
            }).ToList();

            return Ok(ordersDto);
        }

        // ============================
        // GET ORDERS OF CLIENT
        // ============================
        [HttpGet("getorderofclient/{id}")]
        public async Task<ActionResult<IEnumerable<OrderDTO>>> GetOrderOfClient(int id)
        {
 var orders = await context.Orders
        .Where(o => o.CustomerID == id)
        .Include(o => o.OrderDetails)
        .Include(o => o.OrdersForDeliveries) // 👈 IMPORTANT (missing in your query)
        .OrderByDescending(o => o.OrderDate)
        .ToListAsync();
        
            var ordersDto = orders.Select(o => new OrderDTO
            {
                OrderPosition = o.OrderPosition,
                OrderID = o.OrderID,
                CustomerID = o.CustomerID,
                BranchID = o.BranchID,
                AddressID = o.AddressID,
                OrderDate = o.OrderDate,
                TotalAmount = o.TotalAmount,
                Comment = o.Comment,
                orderfordelivery = o.OrderPosition == "Delivery"
            ? o.OrdersForDeliveries?
                .OrderByDescending(x => x.OrdersForDeliveryId)
                .Select(x => new OrderForDeliveryDTO
                {
                    OrdersForDeliveryId = x.OrdersForDeliveryId,
                    status = x.Status
                })
                .FirstOrDefault()
            : null,
                OrderDetails = o.OrderDetails.Select(od => new OrderDetailDTO
                {
                    Name = od.Name,
                    OrderDetailID = od.OrderDetailID,
                    OrderID = od.OrderID,
                    MenuItemID = od.MenuItemID,
                    Quantity = od.Quantity,
                    Price = od.Price
                }).ToList()
            }).ToList();

            return Ok(ordersDto);
        }

        // ============================
        // GET ORDER BY ID
        // ============================
        [HttpGet("{id}")]
        public async Task<ActionResult<OrderDTO>> GetOrder(int id)
        {
            var order = await context.Orders
                .Include(o => o.OrderDetails)
                .FirstOrDefaultAsync(o => o.OrderID == id);

            if (order == null)
                return NotFound();

            var orderDto = new OrderDTO
            {
                Status = order.Status,
                OrderPosition = order.OrderPosition,
                OrderID = order.OrderID,
                CustomerID = order.CustomerID,
                BranchID = order.BranchID,
                AddressID = order.AddressID,
                OrderDate = order.OrderDate,
                TotalAmount = order.TotalAmount,
                TableNo = order.TableNo,
                Comment = order.Comment,

                OrderDetails = order.OrderDetails.Select(od => new OrderDetailDTO
                {
                    Name = od.Name,
                    OrderDetailID = od.OrderDetailID,
                    OrderID = od.OrderID,
                    MenuItemID = od.MenuItemID,
                    Quantity = od.Quantity,
                    Price = od.Price
                }).ToList()
            };

            return Ok(orderDto);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<OrderDTO>> UpdateOrder(int id, OrderDTO updatedOrderDto)
        {
            var order = await context.Orders
                .Include(o => o.OrderDetails)
                .FirstOrDefaultAsync(o => o.OrderID == id);

            if (order == null)
                return NotFound();

            // ======= ADJUST INVENTORY =======
            // Assume inventory is in MenuInventory table
            // 1. Build a dictionary of old order quantities
            var oldQuantities = order.OrderDetails
                .GroupBy(od => od.MenuItemID)
                .ToDictionary(g => g.Key, g => g.Sum(od => od.Quantity));

            // 2. Check new quantities against inventory
            foreach (var newDetail in updatedOrderDto.OrderDetails)
            {
                var inventoryItem = await context.Inventories
                    .FirstOrDefaultAsync(i => i.MenuItemID == newDetail.MenuItemID);

                if (inventoryItem == null)
                    return BadRequest($"Inventory not found for MenuItemID {newDetail.MenuItemID}");

                // Calculate available stock considering old order
                var oldQty = oldQuantities.ContainsKey(newDetail.MenuItemID) ? oldQuantities[newDetail.MenuItemID] : 0;
                var available = inventoryItem.QuantityAvailable + oldQty; // stock + what was in old order

                if (newDetail.Quantity > available)
                    return BadRequest($"Not enough quantity for item {newDetail.MenuItemID}. Available: {available}");
            }

            // 3. Restore old quantities to inventory (rollback old order)
            foreach (var oldDetail in order.OrderDetails)
            {
                var inventoryItem = await context.Inventories
                    .FirstOrDefaultAsync(i => i.MenuItemID == oldDetail.MenuItemID);
                if (inventoryItem != null)
                    inventoryItem.QuantityAvailable += oldDetail.Quantity;
            }

            // 4. Update order info
            order.CustomerID = updatedOrderDto.CustomerID;
            order.OrderPosition = updatedOrderDto.OrderPosition;
            order.BranchID = updatedOrderDto.BranchID;
            order.AddressID = updatedOrderDto.AddressID;
            order.OrderDate = updatedOrderDto.OrderDate;
            order.Comment = updatedOrderDto.Comment;
            order.TotalAmount = updatedOrderDto.OrderDetails.Sum(od => od.Quantity * od.Price);

            // ===== Handle table occupancy =====
            var oldTableNo = order.TableNo;
            var newTableNo = updatedOrderDto.TableNo;

            // 1️⃣ Free the old table if it exists and is different from the new table
            if (oldTableNo != null && oldTableNo != newTableNo)
            {
                var oldTable = await context.Tables.FirstOrDefaultAsync(t => t.TableNo == oldTableNo);
                if (oldTable != null)
                {
                    oldTable.Status = false; // free old table
                }
            }

            // 2️⃣ Assign new table
            order.TableNo = newTableNo;

            if (newTableNo != null)
            {
                var newTable = await context.Tables.FirstOrDefaultAsync(t => t.TableNo == newTableNo);
                if (newTable != null)
                {
                    newTable.Status = true; // occupy new table
                }
            }

            // Remove old order details
            context.OrderDetails.RemoveRange(order.OrderDetails);

            // Add new order details
            order.OrderDetails = updatedOrderDto.OrderDetails.Select(od => new OrderDetail
            {
                Name = od.Name,
                MenuItemID = od.MenuItemID,
                Quantity = od.Quantity,
                Price = od.Price
            }).ToList();

            // 5. Subtract new quantities from inventory
            foreach (var newDetail in order.OrderDetails)
            {
                var inventoryItem = await context.Inventories
                    .FirstOrDefaultAsync(i => i.MenuItemID == newDetail.MenuItemID);

                if (inventoryItem != null)
                {
                    inventoryItem.QuantityAvailable -= newDetail.Quantity;
                }
            }

            await context.SaveChangesAsync();

            var getorderforprofit = await context.Orders
                .Include(o => o.OrderDetails)
                    .ThenInclude(d => d.MenuItem)
                .FirstOrDefaultAsync(o => o.OrderID == updatedOrderDto.OrderID);

            CalculateOrderProfit(getorderforprofit);

            await context.SaveChangesAsync();


            var receipt = await BuildReceiptAsync(order, null);
            return Ok(receipt);


        }

        //orders for delivery        

        [HttpPut("assignDriverForOrder/{orderId}/{driverId}")]
        public async Task<IActionResult> AssignDriverForOrder(int orderId, int driverId)
        {
            var orderForDelivery = await context.OrdersForDeliverys
                .Include(o => o.Order)
                .Include(o => o.Employee) // لو عندك Driver هنا
                .FirstOrDefaultAsync(o => o.OrderId == orderId);
            if (orderForDelivery == null) return NotFound();

            var driver = await context.Users
                .Include(u => u.Employee)
                .FirstOrDefaultAsync(u => u.UserID == driverId);

            if (orderForDelivery == null)
                return NotFound("Order not found");

            if (driver == null || driver.Employee == null)
                return BadRequest("Driver not valid");

            if (driver.Role != "Employee" || driver.Employee.Position != "Driver")
                return BadRequest("Invalid driver");

            driver.Employee.IsAvailable = false;
            orderForDelivery.EmployeeId = driverId;

            orderForDelivery.Status = "OutForDelivery";

            if (orderForDelivery.Order.CustomerID.HasValue)
            {

                await notificationService.SendToUser(
                    "Client",
                    orderForDelivery.Order.CustomerID.Value,
                    $"Your Order on the way"
                );
            }

            await notificationService.SendToUser(
                "Employee",
                driverId,
                $"come to deliver the order "
            );

            await context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("deleteOrderForDelivery/{id}/{deleteOrder}")]
        public async Task<IActionResult> deleteOrderForDelivery(int id, bool deleteOrder)
        {
            var orderForDelivery = await context.OrdersForDeliverys
                .Include(d => d.Order)
                .FirstOrDefaultAsync(d => d.OrdersForDeliveryId == id);

            if (orderForDelivery == null)
                return NotFound("OrderForDelivery not found");

            if (orderForDelivery.Status != "Pending")
                return BadRequest("Only pending orders can be deleted");


            // Update order before deleting delivery
            if (orderForDelivery.Order != null)
            {
                orderForDelivery.Order.OrderPosition = "Take-away";
            }
            var orderId = orderForDelivery.OrderId;

            // Remove delivery
            context.OrdersForDeliverys.Remove(orderForDelivery);
            await context.SaveChangesAsync();

            if (deleteOrder == true)
            {
                await DeleteOrder(orderId);
            }

            return NoContent();
        }

        [HttpGet("getAllOrdersForDeliveryForDriver/{driverId}")]
        public async Task<ActionResult<IEnumerable<OrderForDeliveryDTO>>> getAllOrdersForDeliveryForDriver(int driverId)
        {
            var result = await context.OrdersForDeliverys
                .Where(d => d.EmployeeId == driverId)
                .Select(d => new OrderForDeliveryDTO
                {
                    OrdersForDeliveryId = d.OrdersForDeliveryId,
                    status = d.Status.ToString(),
                    AssignedAt = d.AssignedAt,
                    DeliveredAt = d.DeliveredAt,

                    order = d.Order == null ? null : new OrderDTO
                    {
                        OrderID = d.Order.OrderID,
                        TotalAmount = d.Order.TotalAmount,
                        BranchID = d.Order.BranchID,

                        customer = d.Order.Customer == null ? null : new UserDataDTO
                        {
                            UserID = d.Order.Customer.UserID,
                            Name = d.Order.Customer.Name,
                            Phone = d.Order.Customer.Phone
                        }
                    },

                    employee = d.Employee == null ? null : new UserDataDTO
                    {
                        UserID = d.Employee.UserID,
                        Name = d.Employee.Name,
                        Phone = d.Employee.Phone
                    },

                    deliveryAddress = d.CustomerAddress == null ? null : new CustomerAddressDTO
                    {
                        addressID = d.CustomerAddress.AddressID,
                        city = d.CustomerAddress.City,
                        building = d.CustomerAddress.Building,
                        floor = d.CustomerAddress.Floor,
                        appartment = d.CustomerAddress.Appartment,
                        details = d.CustomerAddress.Details
                    }
                })
                .ToListAsync();

            return Ok(result);
        }

        // PUT: api/delivery/markDelivered/{id}
        [HttpPut("markorderAsDelivered/{orderforDeliveryId}")]
        public async Task<IActionResult> markorderAsDelivered(int orderforDeliveryId)
        {
            var orderForDelivery = await context.OrdersForDeliverys
    .Include(x => x.Order)
    .FirstOrDefaultAsync(x => x.OrdersForDeliveryId == orderforDeliveryId);

            if (orderForDelivery == null)
                return NotFound("OrdersForDelivery not found");

            // ✅ Update delivery status
            orderForDelivery.Status = "Delivered";
            orderForDelivery.DeliveredAt = DateTime.UtcNow;

            if (orderForDelivery?.Order?.CustomerID is int customerId)
            {
                await notificationService.SendToUser(
                    "Client",
                    customerId,
                    "Your Order Delivered thanks for choosing us"
                );
            }

            // ✅ Make driver available again
            var driver = await context.Users
                .Include(u => u.Employee)
                .FirstOrDefaultAsync(u => u.UserID == orderForDelivery.EmployeeId);

            if (driver != null && driver.Employee != null)
            {
                driver.Employee.IsAvailable = true;
            }

            await context.SaveChangesAsync();

            return Ok();
        }

        [HttpGet("getAllOrdersForDeliveries")]
        public async Task<ActionResult<IEnumerable<OrderForDeliveryDTO>>> getAllOrdersForDeliveries()
        {

            var result = await context.OrdersForDeliverys
                .Select(d => new OrderForDeliveryDTO
                {
                    OrdersForDeliveryId = d.OrdersForDeliveryId,
                    Comment = d.Comment,
                    status = d.Status.ToString(),
                    AssignedAt = d.AssignedAt,
                    DeliveredAt = d.DeliveredAt,

                    // ✅ Order
                    order = d.Order == null ? null : new OrderDTO
                    {
                        OrderID = d.Order.OrderID,
                        TotalAmount = d.Order.TotalAmount,
                        BranchName = d.Order.Branch.Name,

                        customer = d.Order.Customer == null ? null : new UserDataDTO
                        {
                            UserID = d.Order.Customer.UserID,
                            Name = d.Order.Customer.Name,
                            Phone = d.Order.Customer.Phone
                        }
                    },

                    employee = context.Users
            .Where(u => u.UserID == d.EmployeeId)
            .Select(u => new UserDataDTO
            {
                UserID = u.UserID,
                Name = u.Name,
                Phone = u.Phone
            })
            .FirstOrDefault(),

                    // ✅ Address
                    deliveryAddress = d.CustomerAddress == null ? null : new CustomerAddressDTO
                    {
                        addressID = d.CustomerAddress.AddressID,
                        street = d.CustomerAddress.Street,
                        city = d.CustomerAddress.City,
                        building = d.CustomerAddress.Building,
                        floor = d.CustomerAddress.Floor,
                        appartment = d.CustomerAddress.Appartment,
                        details = d.CustomerAddress.Details
                    }
                })
                .ToListAsync();

            return Ok(result);
        }
        [HttpGet("getOrdersOfBranch/{branchID}")]
        public async Task<ActionResult<IEnumerable<OrderDTO>>> getOrdersOfBranch(int branchID)
        {
            var orders = await context.Orders
                .Where(o => o.BranchID == branchID)
                .Include(o => o.OrderDetails)        // <-- include order details
                .Include(o => o.Customer)            // optional: include customer info
                .Include(o => o.Branch)              // optional: include branch info
                .Include(o => o.Address)             // optional: include address
                .ToListAsync();

            // Map to DTO if needed
            var ordersDto = orders.Select(o => new OrderDTO
            {
                OrderID = o.OrderID,
                BranchID = o.BranchID,
                CustomerID = o.CustomerID,
                AddressID = o.AddressID,
                TableNo = o.TableNo,
                Status = o.Status,
                Comment = o.Comment,
                OrderDate = o.OrderDate,
                TotalAmount = o.TotalAmount,
                OrderPosition = o.OrderPosition,
                OrderDetails = o.OrderDetails?.Select(d => new OrderDetailDTO
                {
                    OrderDetailID = d.OrderDetailID,
                    MenuItemID = d.MenuItemID,
                    Name = d.Name,
                    Quantity = d.Quantity,
                    Price = d.Price
                }).ToList()
            }).ToList();

            return Ok(ordersDto);
        }


        [HttpGet("getBranchOrderForDeliveries/{branchID}")]
        public async Task<ActionResult<IEnumerable<OrderForDeliveryDTO>>> GetBranchOrderForDeliveries(int branchID)
        {

            var result = await context.OrdersForDeliverys
            .Where(d => d.Order.BranchID == branchID)
                .Select(d => new OrderForDeliveryDTO
                {
                    OrdersForDeliveryId = d.OrdersForDeliveryId,
                    Comment = d.Comment,
                    status = d.Status.ToString(),
                    AssignedAt = d.AssignedAt,
                    DeliveredAt = d.DeliveredAt,

                    // ✅ Order
                    order = d.Order == null ? null : new OrderDTO
                    {
                        OrderID = d.Order.OrderID,
                        TotalAmount = d.Order.TotalAmount,
                        BranchID = d.Order.BranchID,

                        customer = d.Order.Customer == null ? null : new UserDataDTO
                        {
                            UserID = d.Order.Customer.UserID,
                            Name = d.Order.Customer.Name,
                            Phone = d.Order.Customer.Phone
                        }
                    },

                    employee = context.Users
            .Where(u => u.UserID == d.EmployeeId)
            .Select(u => new UserDataDTO
            {
                UserID = u.UserID,
                Name = u.Name,
                Phone = u.Phone
            })
            .FirstOrDefault(),

                    // ✅ Address
                    deliveryAddress = d.CustomerAddress == null ? null : new CustomerAddressDTO
                    {
                        addressID = d.CustomerAddress.AddressID,
                        street = d.CustomerAddress.Street,
                        city = d.CustomerAddress.City,
                        building = d.CustomerAddress.Building,
                        floor = d.CustomerAddress.Floor,
                        appartment = d.CustomerAddress.Appartment,
                        details = d.CustomerAddress.Details
                    }
                })
                .ToListAsync();

            return Ok(result);
        }

        [HttpGet("branch-profit")]
        public async Task<ActionResult<decimal>> GetBranchProfit(
            int branchId,
            DateTime from,
            DateTime to)
        {
            var profit = await context.Orders
                .Where(x =>
                    x.BranchID == branchId &&
                    x.OrderDate >= from &&
                    x.OrderDate <= to)
                .SumAsync(x => x.TotalProfit);

            return Ok(profit);
        }
        [HttpGet("all-branches-profit")]
        public async Task<ActionResult<List<BranchProfitDto>>> GetAllBranchesProfit(
            DateTime from,
            DateTime to)
        {
            var result = await context.Orders
                .Where(x =>
                    x.OrderDate >= from &&
                    x.OrderDate <= to)
                .GroupBy(x => x.BranchID)
                .Select(g => new BranchProfitDto
                {
                    BranchID = g.Key,
                    TotalProfit = g.Sum(x => x.TotalProfit)
                })
                .ToListAsync();

            return Ok(result);
        }
    }
}
