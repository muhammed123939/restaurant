using Microsoft.AspNetCore.SignalR;
using System.Collections.Concurrent;

namespace API.SignalR
{
    public class NotificationHub : Hub
    {
        private static readonly ConcurrentDictionary<string, string> _connections = new();


public override async Task OnConnectedAsync()
{
    var httpContext = Context.GetHttpContext();
    var role = httpContext?.Request.Query["role"].ToString();
    var userId = httpContext?.Request.Query["userId"].ToString(); // 👈 use userId here

    if (!string.IsNullOrEmpty(role) && !string.IsNullOrEmpty(userId))
    {
        _connections.TryAdd($"{role}:{userId}", Context.ConnectionId);
        Console.WriteLine($"✅ Connected: {role}:{userId} → {Context.ConnectionId}");
    }

    await base.OnConnectedAsync();
}

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var key = _connections.FirstOrDefault(x => x.Value == Context.ConnectionId).Key;

            if (!string.IsNullOrEmpty(key))
            {
                _connections.TryRemove(key, out _);
                Console.WriteLine($"❌ Disconnected: {key}");
            }

            await base.OnDisconnectedAsync(exception);
        }

        // ✅ Send notification to specific user
        public async Task SendNotification(string role, string id, string message)
        {
            string key = $"{role}:{id}";
            if (_connections.TryGetValue(key, out var connectionId))
            {
                await Clients.Client(connectionId).SendAsync("ReceiveNotification", "System", message);
                Console.WriteLine($"📩 Sent to {key} ({connectionId}): {message}");
            }
            else
            {
                Console.WriteLine($"⚠️ No active connection for {key}. Notification not sent.");
            }
        }

        public static string? GetConnection(string role, int id)
        {
            string key = $"{role}:{id}";
            return _connections.TryGetValue(key, out var connectionId) ? connectionId : null;
        }
    }
}
