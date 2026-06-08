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
    public class EmployeeController(EmailService emailService, DataContext context, ITokenService tokenService, IMapper mapper) : BaseApiController
    {

        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(int id)
        {
            var employee = await context.Employees
                .Include(e => e.User)
                .FirstOrDefaultAsync(e => e.EmployeeID == id);

            if (employee == null)
                return NotFound("Employee not found");

            // 🔴 Check if employee has delivery orders
            var hasOrders = await context.OrdersForDeliverys
                .AnyAsync(o => o.EmployeeId == id);

            if (hasOrders)
                return BadRequest("Cannot delete employee: they have assigned delivery orders");

            // Remove employee
            context.Employees.Remove(employee);

            // Remove related user
            if (employee.User != null)
            {
                context.Users.Remove(employee.User);
            }

            await context.SaveChangesAsync();

            return Ok(new { message = "Employee and related user deleted successfully" });
        }

        private async Task<bool> EmployeeExists(string name)
        {
            return await context.Employees
                .AnyAsync(e =>
                    e.User != null &&
                    e.User.Name.ToLower() == name.ToLower() &&
                    e.User.Role.ToLower() == "Employee"
                );
        }
        private async Task<bool> EmailExist(string email)
        {
            if (string.IsNullOrEmpty(email))
                return false;

            return await context.Users.AnyAsync(x => x.Email == email);
        }

        [HttpGet("{id}")]
        public async Task<User?> GetEmployeeById(int id)
        {
            var user = await context.Users
                .Where(u => u.UserID == id && u.Role == "Employee")
                .Where(u => u.UserID == id && u.Role == "Employee")
                .FirstOrDefaultAsync();

            return user;
        }

        [HttpGet("data/{id}")]
        public async Task<ActionResult<EmployeeDTO>> GetDataEmployeeById(int id)
        {
            var employee = await context.Employees
                .Include(e => e.User)
                .FirstOrDefaultAsync(e => e.EmployeeID == id);

            if (employee == null)
                return NotFound();

            var employeeDto = new EmployeeDTO
            {
                EmployeeID = employee.EmployeeID,
                Position = employee.Position,
                Salary = employee.Salary,
                IsAvailable = employee.IsAvailable,

                User = employee.User == null ? null : new UserDataDTO
                {
                    UserID = employee.User.UserID,
                    Name = employee.User.Name,
                    BranchID = employee.User.BranchID
                }
            };

            return Ok(employeeDto);
        }

        [HttpGet("getall")]
        public async Task<ActionResult<IEnumerable<EmployeeDTO>>> Getall()
        {
            var employees = await context.Employees
                .ProjectTo<EmployeeDTO>(mapper.ConfigurationProvider)
                .ToListAsync();

            return Ok(employees);
        }

        [HttpGet("getAvailableDrivers/{branchID}")]
        public async Task<ActionResult<IEnumerable<UserDataDTO>>> GetAvailableDrivers(int branchID)
        {
            var drivers = await context.Users
       .Include(u => u.Employee)
       .Where(u =>
           u.Role == "Employee"
           && u.BranchID == branchID
           && u.Employee.EmployeeID == u.UserID
           && u.Employee.Position == "Driver"
           && u.Employee.IsAvailable
       )
       .Select(u => new UserDataDTO
       {
           UserID = u.UserID,
           Name = u.Name,
           Phone = u.Phone
       })
       .ToListAsync();

            return Ok(drivers);
        }

        [HttpGet("idname")]
        public async Task<ActionResult<IEnumerable<UserDataDTO>>> idname()
        {
            var employees = context.Users.FromSqlInterpolated
            ($"SELECT u.UserID, u.Name FROM users u JOIN Employees e ON e.EmployeeID = u.UserId").Select(e => new UserDataDTO
            {
                UserID = e.UserID,
                Name = e.Name
            }).ToList();

            return Ok(employees);
        }

        [HttpPost("login")]
        public async Task<ActionResult<DataLoginDTO>> Login(LoginDTO loginDTo)
        {
            // Find user by name
            var user = await context.Users
                .FirstOrDefaultAsync(x => x.Name.ToLower() == loginDTo.Name.ToLower());

            if (user == null)
                return BadRequest(new { message = "User not found" });

            // Check if user exists in Employees table
            var employee = await context.Employees
                .FirstOrDefaultAsync(e => e.EmployeeID == user.UserID);

            if (employee == null)
                return BadRequest(new { message = "User is not registered as an employee" });

            // Verify password
            using var hmac = new HMACSHA512(user.PasswordSalt);
            var computedHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(loginDTo.Password));

            for (int i = 0; i < computedHash.Length; i++)
            {
                if (computedHash[i] != user.PasswordHash[i])
                    return Unauthorized("Invalid username or password");
            }

            // Return DTO using the fetched employee object
            return new DataLoginDTO
            {
                Id = user.UserID,
                Role = user.Role,
                Position = employee.Position, // ✅ use employee, not user.Employee
                Name = user.Name,
                Token = tokenService.CreateToken(user),
                BranchID = user.BranchID
            };
        }

        [HttpPost("register")]
        public async Task<ActionResult<DataLoginDTO>> Register(RegisterUserDto registerDTo)
        {
            if (await EmployeeExists(registerDTo.Name))
                return BadRequest(new { message = "User with this name Exist" });

            if (await EmailExist(registerDTo.Email))
                return BadRequest(new { message = "User with this email exists" });

            using var hmac = new HMACSHA512();

            // Map user
            var newUser = mapper.Map<User>(registerDTo);
            newUser.Name = registerDTo.Name;
            newUser.Email = registerDTo.Email;
            newUser.Phone = registerDTo.Phone;
            newUser.PasswordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(registerDTo.password));
            newUser.PasswordSalt = hmac.Key;
            newUser.Role = "Employee";
            newUser.BranchID = registerDTo.BranchID;

            // 🔹 Create Employee for this User
            var newEmployee = new Employee
            {
                Position = registerDTo.Position,
                User = newUser,   // Link back to user
                IsAvailable = true,
                Salary = registerDTo.salary
            };

            // Assign Employee to user
            newUser.Employee = newEmployee;

            // Add user (Employee will be saved via navigation)
            context.Users.Add(newUser);
            await context.SaveChangesAsync();

            return Ok(new { message = "User and Employee created successfully" });
        }

        [HttpPost("message")]
        public async Task<ActionResult> SendmessageToVerifiedEmployees([FromBody] string offer)
        {
            if (string.IsNullOrWhiteSpace(offer)) return BadRequest("message cannot be empty.");

            // Get all verified clients with email
            var verifiedEmployees = await context.Users
                .Where(c => c.Verified && !string.IsNullOrEmpty(c.Email) && c.Role == "employee")
                .ToListAsync();

            if (!verifiedEmployees.Any()) return NotFound("No verified employees with email found.");

            foreach (var client in verifiedEmployees)
            {
                // You should have an email service here
                await emailService.SendEmailAsync(client.Email, "New message for You!", offer);
            }

            return Ok("message sent to all verified employees.");
        }

        [HttpPut]
        public async Task<ActionResult> Update(UserDataDTO userdatadto)
        {

var user = await context.Users
    .FirstOrDefaultAsync(x => x.UserID == userdatadto.UserID && x.Role == "Employee");
    
    if (user == null)
        return BadRequest(new { message = "Could not find user" });

    // Check if name exists in another user (IMPORTANT FIX)
    var nameExists = await context.Employees
        .AnyAsync(x => x.User.Name == userdatadto.Name && x.User.UserID != userdatadto.UserID);

    if (nameExists)
        return BadRequest(new { message = "User with this name Exist" });
        
            using var hmac = new HMACSHA512();

            // Update basic fields
            user.Name = userdatadto.Name ?? user.Name;
            user.Email = userdatadto.Email ?? user.Email; // optional email
            user.Phone = userdatadto.Phone ?? user.Phone;
            user.BranchID = userdatadto.BranchID;
            // Update password if provided
            if (!string.IsNullOrWhiteSpace(userdatadto.Password))
            {
                user.PasswordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(userdatadto.Password));
                user.PasswordSalt = hmac.Key;
            }

            try
            {
                var result = await context.SaveChangesAsync();
                if (result > 0)
                    return NoContent();
            }
            catch (Exception ex)
            {
                // Optional: log exception
                return BadRequest("Failed to update the user: " + ex.Message);
            }

            return BadRequest("Failed to update the user");
        }

        [HttpPut("data")]
        public async Task<ActionResult> Update(EmployeeDTO employeedto)
        {
            // Load employee including User navigation
            var employee = await context.Employees
                .Include(e => e.User)
                .FirstOrDefaultAsync(e => e.EmployeeID == employeedto.EmployeeID);

            if (employee == null)
                return BadRequest("Could not find Employee");

            // Make sure the User navigation exists
            if (employee.User == null)
                return BadRequest("Associated User not found for this Employee");

            // Update User's branch safely
            if (employeedto.User != null && employeedto.User.BranchID != null)
            {
                var branchExists = await context.Branches
                    .AnyAsync(b => b.BranchID == employeedto.User.BranchID);

                if (!branchExists)
                    return BadRequest($"Branch with ID {employeedto.User.BranchID} does not exist.");

                employee.User.BranchID = employeedto.User.BranchID.Value;
            }

            // Update employee fields safely
            if (!string.IsNullOrEmpty(employeedto.Position))
                employee.Position = employeedto.Position;

            if (employeedto.Salary.HasValue)
                employee.Salary = employeedto.Salary.Value;

            if (employeedto.IsAvailable.HasValue)
                employee.IsAvailable = employeedto.IsAvailable.Value;

            await context.SaveChangesAsync();

            return NoContent();
        }
    }
}
