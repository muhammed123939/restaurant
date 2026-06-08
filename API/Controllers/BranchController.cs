using API.Data;
using API.DTO;
using API.Entities;
using API.interfaces;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{
    public class BranchController(DataContext context, ITokenService tokenService, IMapper mapper) : BaseApiController
    {     
        private async Task<bool> BranchExists(string branchname)
        {
            return await context.Branches.AnyAsync(x =>
                x.Name.ToLower() == branchname.ToLower());
        }


[HttpDelete("{id}")]
public async Task<ActionResult> Delete(int id)
{
    var branch = await context.Branches
        .FirstOrDefaultAsync(b => b.BranchID == id);

    if (branch == null)
        return NotFound("Branch not found");

    // 🔴 Check dependencies
    var hasMenus = await context.Menus.AnyAsync(m => m.BranchID == id);
    var hasEmployees = await context.Users.AnyAsync(u => u.BranchID == id && u.Role == "Employee");
    var hasClients = await context.Users.AnyAsync(u => u.BranchID == id && u.Role == "Client");
    var hasOrders = await context.Orders.AnyAsync(o => o.BranchID == id); // if exists

    if (hasMenus)
        return BadRequest("Cannot delete branch: it has menu items");

    if (hasEmployees)
        return BadRequest("Cannot delete branch: it has employees");

    if (hasClients)
        return BadRequest("Cannot delete branch: it has clients");

    if (hasOrders)
        return BadRequest("Cannot delete branch: it has orders");

    context.Branches.Remove(branch);
    await context.SaveChangesAsync();

    return Ok(new { message = "Branch deleted successfully" });
}

        [HttpGet("{id}")]
        public async Task<Branch?> GetBranchById(int id)
        {
            var branch = await context.Branches
                .Where(u => u.BranchID == id)
                .FirstOrDefaultAsync();

            return branch;
        }

        [HttpGet("getall")]
        public async Task<ActionResult<IEnumerable<BranchDTO>>> Getall()
        {
            var branches = await context.Branches
                .ProjectTo<BranchDTO>(mapper.ConfigurationProvider) 
                .ToListAsync();

            return Ok(branches);
        }


      [HttpGet("idname")]
        public async Task<ActionResult<IEnumerable<BranchDTO>>> idname()
        {
            var branches = context.Branches.FromSqlInterpolated
            ($"SELECT b.BranchID, b.Name FROM Branches b").Select(e => new BranchDTO
            {
                branchID = e.BranchID,
                name = e.Name
            }).ToList();

            return Ok(branches);
        }
                
      [HttpGet("idnameforcategories")]
        public async Task<ActionResult<IEnumerable<IdNameDTO>>> idnameforcategories()
        {
            var categories = context.Categories.FromSqlInterpolated
            ($"SELECT CategoryID,Name FROM Categories").Select(e => new IdNameDTO
            {
                id = e.CategoryID,
                name = e.Name
            }).ToList();

            return Ok(categories);
        }
        
        [HttpPost("register")]
        public async Task<ActionResult<BranchDTO>> Register(BranchDTO registerDTo)
        {
            if (await BranchExists(registerDTo.name))
            {                
                return BadRequest(new { message = "Branch with this name still exists" });
            }

            var newbranch = mapper.Map<Branch>(registerDTo);
            newbranch.Name = registerDTo.name;
            newbranch.Location = registerDTo.location;
            newbranch.Phone = registerDTo.phone;
            
            context.Branches.Add(newbranch);
            await context.SaveChangesAsync();
            return Ok();
        }
        [HttpPut]
        public async Task<ActionResult> Update(BranchDTO branchdatadto)
        {
            var edittedbranch= new BranchDTO();
            var branch = await GetBranchById(branchdatadto.branchID.Value);
            if (branch == null) return BadRequest("could not find branch");

            edittedbranch.branchID = branchdatadto.branchID;
            edittedbranch.name = branchdatadto.name;
            edittedbranch.location = branchdatadto.location;
            edittedbranch.phone = branchdatadto.phone;

            mapper.Map(edittedbranch, branch);
            // Save changes
            var result = await context.SaveChangesAsync();
            if (result > 0)
            return NoContent();

            return BadRequest("Failed to update the branch");
        }
    }
}
