using API.Data;
using API.DTO;
using API.DTOs;
using API.Entities;
using API.interfaces;
using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;


namespace API.Controllers
{

    public class TableController(DataContext context, ITokenService tokenService, IMapper mapper) : BaseApiController
    {

        private async Task<bool> TableExists(int tableNo, int branchId)
        {
            return await context.Tables.AnyAsync(t =>
                t.TableNo == tableNo &&
                t.BranchID == branchId);
        }

        [HttpGet("tables-with-status/{branchID}")]
        public async Task<ActionResult<IEnumerable<TableDTO>>> GetStatus(int branchID)
        {
            var tables = await context.Tables
    .Where(t => t.BranchID == branchID)
    .Select(t => new TableDTO
    {
        TableID = t.TableID,
        TableNo = t.TableNo,
        Status = t.Status,
        Capacity = t.Capacity,
        BranchID = t.BranchID
    })
    .OrderBy(t => t.TableNo)
    .ToListAsync();

            return Ok(tables);
        }


        [HttpPost("register")]
        public async Task<ActionResult> CreateTable(TableDTO dto)
        {
            // check branch exists
            var branchExists = await context.Branches.AnyAsync(b => b.BranchID == dto.BranchID);
            if (!branchExists)
                return BadRequest("Branch does not exist");

            // optional duplicate check
            if (await TableExists(dto.TableNo, dto.BranchID))
                return BadRequest(new { message = "Table already exists in this branch" });

            var table = mapper.Map<Table>(dto);

            context.Tables.Add(table);
            await context.SaveChangesAsync();

            return Ok(new { message = "Table created successfully" });
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteTable(int id)
        {
            var table = await context.Tables.FindAsync(id);

            if (table == null)
                return NotFound("Table not found");

            // optional safety check (if orders exist)
            var hasOrders = await context.Orders.AnyAsync(o => o.Table.TableID == id);
            if (hasOrders)
                return BadRequest("Cannot delete table: it has orders");

            context.Tables.Remove(table);
            await context.SaveChangesAsync();

            return Ok(new { message = "Table deleted successfully" });
        }

        [HttpPut]
        public async Task<ActionResult> UpdateTable(TableDTO dto)
        {
            var table = await context.Tables.FindAsync(dto.TableID);

            if (table == null)
                return BadRequest("Table not found");

            var branchExists = await context.Branches.AnyAsync(b => b.BranchID == dto.BranchID);
            if (!branchExists)
                return BadRequest("Branch does not exist");

            // update fields
            table.TableNo = dto.TableNo;
            table.Capacity = dto.Capacity;
            table.Status = dto.Status;
            table.BranchID = dto.BranchID;

            var result = await context.SaveChangesAsync();

            if (result > 0)
                return NoContent();

            return BadRequest("Failed to update table");
        }


    }
}