using api.Services;
using API.Data;
using API.Extensions;
using API.Services;
using API.SignalR;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddSignalR();
builder.Services.AddScoped<EmailService>();
builder.Services.AddScoped<NotificationService>(); // ✅ MUST be before app.Build()

builder.Services.AddApplicationServices(builder.Configuration);
builder.Services.AddIdentityServices(builder.Configuration);
builder.Services.AddControllers();

var app = builder.Build();

// Middleware
app.UseCors(policy =>
    policy.AllowAnyHeader()
          .AllowAnyMethod()
          .AllowCredentials()
          .WithOrigins("http://localhost:4200", "https://localhost:4200" , "https://restaurant-beige-ten.vercel.app"));

app.UseAuthentication();
app.UseAuthorization();

// ✅ Map controllers and hubs
app.MapControllers();
app.MapHub<NotificationHub>("/hubs/notification");

app.Run();
