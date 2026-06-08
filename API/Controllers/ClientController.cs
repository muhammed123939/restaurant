using System.Security.Cryptography;
using System.Text;
using api.Services;
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
    public class ClientController(EmailService emailService, DataContext context, ITokenService tokenService, IMapper mapper) : BaseApiController
    {
        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(int id)
        {
            var user = await context.Users
                .FirstOrDefaultAsync(u => u.UserID == id && u.Role.ToLower() == "client");

            if (user == null)
                return NotFound("User not found");

            // 🔴 Check if this client has orders
            var hasOrders = await context.Orders
                .AnyAsync(o => o.CustomerID == id); // 👈 adjust based on your relation

            if (hasOrders)
                return BadRequest("Cannot delete client because they have existing orders");

            context.Users.Remove(user);
            await context.SaveChangesAsync();

            return Ok(new { message = "User deleted successfully" });
        }
        private async Task<bool> emailExist(string email)
        {
            if (string.IsNullOrEmpty(email))
                return false;

            return await context.Users.AnyAsync(x => x.Email == email);
        }

        [HttpGet("getclientaddressid/{id}")]
        public async Task<ActionResult<int>> GetClientAddressId(int id)
        {
            var address = await context.CustomerAddresses
                .Where(u => u.UserID == id)
                .Select(u => u.AddressID)   // select only AddressID
                .FirstOrDefaultAsync();

            if (address == 0) // assuming AddressID is int and 0 means not found
                return NotFound("Address not found");

            return Ok(address);
        }

        [HttpGet("getaddress/{userId}")]
        public async Task<ActionResult<List<CustomerAddressDTO>>> GetAddress(int userId)
        {
            var addresses = await context.CustomerAddresses
                .Where(a => a.UserID == userId)
                .ToListAsync();

            return Ok(addresses);
        }


        [HttpGet("{id}")]
        public async Task<User?> GetUserById(int id)
        {
            var user = await context.Users
                .Where(u => u.UserID == id && u.Role.ToLower() == "client")
                .FirstOrDefaultAsync();

            return user;
        }

        [HttpGet("getclientsByBranch/{branchID}")]
        public async Task<ActionResult<IEnumerable<UserDataDTO>>> GetClientsByBranch(int branchID)
        {
            var users = await context.Users
                .Where(u => u.Role != null &&
                            u.Role.ToLower() == "client" &&
                            u.BranchID == branchID)
                .ProjectTo<UserDataDTO>(mapper.ConfigurationProvider)
                .ToListAsync();

            return Ok(users);
        }

        [HttpGet("getAllClients")]
        public async Task<ActionResult<IEnumerable<UserDataDTO>>> getAllClients()
        {
            var users = await context.Users
              .Include(u => u.Branch)
                .Where(u => u.Role.ToLower() == "client")
                .ProjectTo<UserDataDTO>(mapper.ConfigurationProvider)
                .ToListAsync();
            return Ok(users);
        }

        [HttpPost("login")] //function 3mlt check login w b3tt check for login 
        public async Task<ActionResult<DataLoginDTO>> Login(LoginDTO loginDTo)
        {

            var user = await context.Users
        .FirstOrDefaultAsync(x =>
            x.Name.ToLower() == loginDTo.Name.ToLower() &&
            x.Role.ToLower() == "Client");

            if (user == null) return Unauthorized("invalid username or Password");
            using var hmac = new HMACSHA512(user.PasswordSalt);//5at salt mn database
            var computedhash = hmac.ComputeHash(Encoding.UTF8.GetBytes(loginDTo.Password));//compute hash elsalt m3 elpassword entered
            for (int i = 0; i < computedhash.Length; i++)
            {
                if (computedhash[i] != user.PasswordHash[i]) return Unauthorized("invalid username or Password");//karen password hash in db m3 computed hash
            }
            return
             new DataLoginDTO
             {
                 Id = user.UserID,
                 Name = user.Name,
                 Role = user.Role,
                 Token = tokenService.CreateToken(user),
                 BranchID = user.BranchID
             };
        }

        [HttpPost("register")]
        public async Task<ActionResult<DataLoginDTO>> Register(RegisterUserDto registerDTo)
        {
            if (await UserExists(registerDTo.Name))
            {
                return BadRequest(new { message = "User with this name And role already exists" });
            }

            if (await emailExist(registerDTo.Email))
            {
                return BadRequest(new { message = "User with this email Exist" });
            }

            using var hmac = new HMACSHA512();
            var newuser = mapper.Map<User>(registerDTo);
            newuser.Name = registerDTo.Name;
            newuser.Email = registerDTo.Email;
            newuser.Phone = registerDTo.Phone;
            newuser.PasswordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(registerDTo.password));
            newuser.PasswordSalt = hmac.Key;
            newuser.Role = "Client";
            newuser.BranchID = registerDTo.BranchID;

            context.Users.Add(newuser);
            await context.SaveChangesAsync();
            return Ok();
        }

        [HttpGet("search")]
        public async Task<ActionResult<IEnumerable<UserDataDTO>>> SearchClients([FromQuery] string term)
        {
            if (term == "all")
            {
                return await context.Users
                    .Where(p => p.Role.ToLower() == "client")
                    .ProjectTo<UserDataDTO>(mapper.ConfigurationProvider)
                    .ToListAsync();
            }

            if (string.IsNullOrWhiteSpace(term) || term.Length == 1)
            {
                return Ok();
            }

            else
            {
                term = term.ToLower();

                return await context.Users
                    .Where(p =>
                        p.Role.ToLower() == "client" &&
                        (
                            p.Name.ToLower().Contains(term) ||
                            p.Phone.ToLower().Contains(term) ||
                            p.Email.ToLower().Contains(term) ||
                            p.Branch.Name.ToLower().Contains(term)
                        )
                    )
                    .ProjectTo<UserDataDTO>(mapper.ConfigurationProvider)
                    .ToListAsync();
            }

        }

        [HttpPost("offer")]
        public async Task<ActionResult> SendOfferToVerifiedClients([FromBody] string offer)
        {
            if (string.IsNullOrWhiteSpace(offer)) return BadRequest("Offer cannot be empty.");

            // Get all verified clients with email
            var verifiedClients = await context.Users
                .Where(c => c.Verified && !string.IsNullOrEmpty(c.Email) && c.Role == "client")
                .ToListAsync();

            if (!verifiedClients.Any()) return NotFound("No verified clients with email found.");

            foreach (var client in verifiedClients)
            {
                // You should have an email service here
                await emailService.SendEmailAsync(client.Email, "New Offer for You!", offer);
            }

            return Ok("Offer sent to all verified clients.");
        }

        [HttpPost("saveAddress/{userId}")]
        public async Task<ActionResult<bool>> SaveAddress(int userId, [FromBody] CustomerAddressDTO dto)
        {
            if (dto == null)
                return BadRequest("Address data is required");

            // Create entity from DTO
            var address = new CustomerAddress
            {
                UserID = userId,
                Street = dto.street,
                City = dto.city,
                Building = dto.building,
                Floor = dto.floor,
                Appartment = dto.appartment,
                Details = dto.details


            };

            context.CustomerAddresses.Add(address);
            await context.SaveChangesAsync();

            return Ok(true);
        }

        [HttpPut("updateAddress/{userID}")]
        public async Task<ActionResult<bool>> UpdateAddress(int userID, [FromBody] CustomerAddressDTO dto)
        {
            if (dto == null)
                return BadRequest("Address data is required");

            var address = await context.CustomerAddresses
                    .FirstOrDefaultAsync(a => a.UserID == userID);

            if (address == null)
                return NotFound("Address not found");

            // Update fields
            address.Street = dto.street;
            address.City = dto.city;
            address.Building = dto.building;
            address.Floor = dto.floor;
            address.Appartment = dto.appartment;
            address.Details = dto.details;

            await context.SaveChangesAsync();

            return Ok(true);
        }

        [HttpPut]
        public async Task<ActionResult> Update(UserDataDTO userdatadto)
        {
            
var user = await context.Users
    .FirstOrDefaultAsync(x => x.UserID == userdatadto.UserID && x.Role == "Client");
    
    if (user == null)
        return BadRequest(new { message = "Could not find user" });

    // Check if name exists in another user (IMPORTANT FIX)
    var nameExists = await context.Users
        .AnyAsync(x => x.Name == userdatadto.Name && x.UserID != userdatadto.UserID);

    if (nameExists)
        return BadRequest(new { message = "User with this name Exist" });
        
            // Update basic fields
            user.Name = userdatadto.Name;
            user.Phone = userdatadto.Phone;
            user.Email = string.IsNullOrWhiteSpace(userdatadto.Email) ? null : userdatadto.Email;
            user.BranchID = userdatadto.BranchID;
            user.Role = string.IsNullOrWhiteSpace(userdatadto.Role) ? user.Role : userdatadto.Role; // never null

            // Update password only if provided
            if (!string.IsNullOrWhiteSpace(userdatadto.Password))
            {
                using var hmac = new HMACSHA512();
                user.PasswordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(userdatadto.Password));
                user.PasswordSalt = hmac.Key;
            }

            try
            {
                var result = await context.SaveChangesAsync();
                if (result > 0)
                    return NoContent(); // success
                else
                    return BadRequest("No changes detected or update failed.");
            }
            catch (DbUpdateException ex)
            {
                // Log exception if needed
                return BadRequest($"Database update error: {ex.InnerException?.Message ?? ex.Message}");
            }
        }
        private async Task<bool> UserExists(string username)
        {
            return await context.Users.AnyAsync(x =>
                x.Name.ToLower() == username.ToLower() &&
                x.Role.ToLower() == "Client");
        }

    }
}
