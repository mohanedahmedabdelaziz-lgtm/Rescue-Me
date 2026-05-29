using Microsoft.EntityFrameworkCore;
using Signup_Signin.Data.Entities;
namespace Signup_Signin.Data.Repositories
{
    public class OrderRepo
    {
        private readonly MainContext _context;

        public OrderRepo(MainContext context)
        {
            _context = context;
        }

        
        public async Task<Order> CreateOrder(Order order)
        {
            _context.Orders.Add(order);
            await _context.SaveChangesAsync();
            return order;
        }

        public async Task<List<Order>> GetOrders()
        {
            return await _context.Orders
                .OrderByDescending(o => o.CreatedAt)
                .ToListAsync();
        }

        
        public async Task<Order?> GetOrder(int id)
        {
            return await _context.Orders
                .FirstOrDefaultAsync(o => o.Id == id);
        }

        public async Task<bool> AcceptOrder(
            int orderId,
            long providerId,
            string providerName,
            string providerPhone
        )
        {
            var order = await _context.Orders.FindAsync(orderId);

            if (order == null)
                return false;

            order.Status = "accepted";
            order.ProviderId = providerId;
            order.ProviderName = providerName;
            order.ProviderPhone = providerPhone;

            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> RejectOrder(int orderId)
        {
            var order = await _context.Orders.FindAsync(orderId);

            if (order == null)
                return false;

            order.Status = "rejected";

            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> DeleteOrder(int orderId)
        {
            var order = await _context.Orders.FindAsync(orderId);

            if (order == null)
                return false;

            _context.Orders.Remove(order);

            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> DoneOrder(int orderId, int? userRate, string? userComment)
        {
            var order = await _context.Orders.FindAsync(orderId);
            if (order == null) return false;
            order.Status = "done";
            order.UserRate = userRate;
            order.UserComment = userComment;
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
