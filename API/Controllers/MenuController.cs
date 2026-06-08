using API.Data;
using API.DTO;
using API.Entities;
using API.Services;
using API.interfaces;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{

    public class MenuController(DataContext context, ITokenService tokenService, IMapper mapper, IPhotoService photoService) : BaseApiController
    {

        [HttpPost("AddOrReplacePhoto/{menuItemId}")]
        public async Task<ActionResult> AddOrReplacePhoto(IFormFile file, int menuItemId)
        {
            var menu = await context.Menus.FirstOrDefaultAsync(m => m.MenuItemID == menuItemId);
            if (menu == null) return NotFound("Menu item not found");

            // Delete old photo from cloud if exists
            if (!string.IsNullOrEmpty(menu.PublicId))
            {
                var deleteResult = await photoService.DeletePhotoAsync(menu.PublicId);
                if (deleteResult.Error != null)
                    return BadRequest(deleteResult.Error.Message);
            }

            // Upload new photo
            var uploadResult = await photoService.AddPhotoAsync(file);
            if (uploadResult.Error != null) return BadRequest(uploadResult.Error.Message);

            // Update Menu table
            menu.ImageUrl = uploadResult.SecureUrl.AbsoluteUri;
            menu.PublicId = uploadResult.PublicId;

            await context.SaveChangesAsync();

            return Ok("Menu photo added/replaced successfully");
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(int id)
        {
            // 1️⃣ Delete inventory if exists
            var inventory = await context.Inventories
                .FirstOrDefaultAsync(u => u.MenuItemID == id);

            if (inventory != null)
            {
                context.Inventories.Remove(inventory);
            }

            // 2️⃣ Get the menu
            var menu = await context.Menus
                .FirstOrDefaultAsync(u => u.MenuItemID == id);

            if (menu == null)
                return NotFound("Menu not found");

            // 3️⃣ Delete photo if exists
            if (!string.IsNullOrEmpty(menu.PublicId))
            {
                await photoService.DeletePhotoAsync(menu.PublicId);
            }

            // 4️⃣ Remove menu
            context.Menus.Remove(menu);

            // 5️⃣ Save changes
            await context.SaveChangesAsync();

            return Ok(new { message = "Menu deleted successfully" });
        }

        [HttpGet("GetMenuPhotos")]
        public async Task<ActionResult<IEnumerable<PhotoDTO>>> GetMenuPhotos()
        {
            var photos = await context.Menus
                .Where(m => m.ImageUrl != null)
                .Select(m => new PhotoDTO
                {
                    MenuItemID = m.MenuItemID,
                    Url = m.ImageUrl
                })
                .ToListAsync();

            return Ok(photos);
        }

        [HttpGet("GetMenuPhoto/{menuItemId}")]
        public async Task<ActionResult<PhotoDTO>> GetMenuPhoto(int menuItemId)
        {
            var photo = await context.Menus
                .Where(m => m.MenuItemID == menuItemId)
                .Select(m => new PhotoDTO
                {
                    MenuItemID = m.MenuItemID,
                    Url = m.ImageUrl
                })
                .FirstOrDefaultAsync();

            if (photo == null) return NotFound();

            return Ok(photo);
        }


        [HttpGet("branch/{branchID}")]
        public async Task<ActionResult<IEnumerable<object>>> GetMenuByBranch(int branchID)
        {
            // Get categories with their menu items for this branch
            var categories = await context.Categories
                .Select(c => new
                {
                    id = c.CategoryID,
                    name = c.Name,
                    menuItems = c.MenuItems
                        .Where(m => m.BranchID == branchID)
                        .Select(m => new
                        {
                            menuItemID = m.MenuItemID,
                            name = m.Name,
                            sell_price = m.sell_price,
                            buy_price = m.buy_price,
                            imageUrl = m.ImageUrl,
                            branchID = m.BranchID,
                            quantity = context.Inventories
                                        .Where(i => i.MenuItemID == m.MenuItemID && i.BranchID == branchID)
                                        .Select(i => (int?)i.QuantityAvailable)
                                        .FirstOrDefault()

                        })
                        .ToList()
                })
                .ToListAsync();

            return Ok(categories);
        }


        [HttpGet("{id}/{branchID}")]
        public async Task<ActionResult<MenuDTO>> GetItemById(int id, int branchID)
        {
            var menu = await context.Menus
                .FirstOrDefaultAsync(m => m.MenuItemID == id);

            if (menu == null)
                return NotFound();

            var inventory = await context.Inventories
                .FirstOrDefaultAsync(i => i.MenuItemID == id && i.BranchID == branchID);

            var dto = new MenuDTO
            {
                menuItemID = menu.MenuItemID,
                name = menu.Name,
                categoryID = menu.CategoryID,
                branchID = menu.BranchID,
                sell_price = menu.sell_price,
                buy_price = menu.buy_price,
                quantity = inventory?.QuantityAvailable // null if not exist
            };

            return Ok(dto);
        }

        [HttpGet("getall")]
        public async Task<ActionResult<IEnumerable<MenuDTO>>> Getall()
        {
            var menus = await context.Menus
                .ProjectTo<MenuDTO>(mapper.ConfigurationProvider)
                .ToListAsync();

            return Ok(menus);
        }

        [HttpGet("idname")]
        public async Task<ActionResult<IEnumerable<MenuDTO>>> idname()
        {
            var menus = context.Menus.FromSqlInterpolated
            ($"SELECT MenuItemID , Name FROM Menus").Select(e => new MenuDTO
            {
                menuItemID = e.MenuItemID,
                name = e.Name
            }).ToList();

            return Ok(menus);
        }

        private async Task<bool> MenuExists(string name, int branchID)
        {
            return await context.Menus.AnyAsync(x =>
                x.Name.ToLower() == name.ToLower() &&
                x.BranchID == branchID
            );
        }

        [HttpPost("register")]
        public async Task<ActionResult<MenuDTO>> Register(RegistermenuDTO registerDTo)
        {
            // Check if menu already exists at that branch
            if (await MenuExists(registerDTo.name, registerDTo.branchID))
            {
                return BadRequest("This item already exists at that branch");
            }

            // Map DTO to entity
            var newMenu = mapper.Map<Menu>(registerDTo);
            newMenu.BranchID = registerDTo.branchID;
            newMenu.Name = registerDTo.name;
            newMenu.CategoryID = registerDTo.categoryID;
            newMenu.sell_price = registerDTo.sell_price;
            newMenu.buy_price = registerDTo.buy_price;

            context.Menus.Add(newMenu);

            // Save changes first to generate MenuItemID
            await context.SaveChangesAsync();

            // Map inventory
            var inventory = new Inventory
            {
                MenuItemID = newMenu.MenuItemID,  // ID is now generated
                BranchID = registerDTo.branchID,
                QuantityAvailable = registerDTo.Quantity
            };
            context.Inventories.Add(inventory);
            await context.SaveChangesAsync();
            return Ok();
        }

        [HttpPut]
        public async Task<ActionResult> Update(MenuDTO menudatadto)
        {
            // 1️⃣ Get the menu item
            var menu = await context.Menus
                .FirstOrDefaultAsync(m => m.MenuItemID == menudatadto.menuItemID.Value);

            if (menu == null)
                return BadRequest("Could not find menu item");

            // 2️⃣ Update menu fields
            menu.Name = menudatadto.name;
            menu.CategoryID = menudatadto.categoryID;
            menu.BranchID = menudatadto.branchID;
            menu.sell_price = menudatadto.sell_price;
            menu.buy_price = menudatadto.buy_price!;

            // 3️⃣ Handle inventory per branch
            if (menudatadto.quantity.HasValue)
            {
                var inventory = await context.Inventories
                    .FirstOrDefaultAsync(i => i.MenuItemID == menu.MenuItemID
                                           && i.BranchID == menu.BranchID);

                if (inventory == null)
                {
                    // Inventory does not exist → create it
                    inventory = new Inventory
                    {
                        MenuItemID = menu.MenuItemID,
                        BranchID = menu.BranchID,
                        QuantityAvailable = menudatadto.quantity.Value
                    };
                    await context.Inventories.AddAsync(inventory);
                }
                else
                {
                    // Inventory exists → update quantity
                    inventory.QuantityAvailable = menudatadto.quantity.Value;
                }
            }

            // 4️⃣ Save changes
            var result = await context.SaveChangesAsync();

            if (result > 0)
                return NoContent();

            return BadRequest("Failed to update the Menu");
        }
    }
}
