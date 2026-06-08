using Microsoft.AspNetCore.SignalR;
using API.SignalR;
using API.Entities;
using API.Data;

namespace API.Services
{
    public class NotificationService
    {
        private readonly IHubContext<NotificationHub> _hubContext;
        private readonly DataContext _context; // add context

        public NotificationService(IHubContext<NotificationHub> hubContext, DataContext context)
        {
            _hubContext = hubContext;
            _context = context; // assign
        }

        public async Task SendToUser(string role, int userId, string message)
        {
            // 1. Save notification in DB
            var notification = new Notification
            {
                UserId = userId,
                Role = role,
                Title = "System",
                Message = message
            };
            _context.Notifications.Add(notification);
            await _context.SaveChangesAsync();

            // 2. Try to push via SignalR if user is online
            var connectionId = NotificationHub.GetConnection(role, userId);
            if (connectionId != null)
            {
                await _hubContext.Clients.Client(connectionId)
                    .SendAsync("ReceiveNotification", "System", message);
            }
        }
    }
}
