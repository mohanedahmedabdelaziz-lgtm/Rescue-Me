using Microsoft.AspNetCore.Mvc;
using Signup_Signin.Data.Entities;
using Signup_Signin.Data.Repositories;
namespace Signup_Signin.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrdersController :ControllerBase
    {
        private readonly OrderRepo _orderRepo;

        public OrdersController(OrderRepo orderRepo)
        {
            _orderRepo = orderRepo;
        }

        [HttpPost]
        public async Task<IActionResult> CreateOrder(Order order)
        {
            var created = await _orderRepo.CreateOrder(order);

            return Ok(created);
        }

        [HttpGet]
        public async Task<IActionResult> GetOrders()
        {
            var orders = await _orderRepo.GetOrders();

            return Ok(orders);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetOrder(int id)
        {
            var order = await _orderRepo.GetOrder(id);

            if (order == null)
                return NotFound();

            return Ok(order);
        }

        [HttpPut("accept/{id}")]
        public async Task<IActionResult> Accept(
        int id,
        [FromQuery] long providerId,
        [FromQuery] string providerName,
        [FromQuery] string providerPhone
)
        {
            var ok = await _orderRepo.AcceptOrder(
                id,
                providerId,
                providerName,
                providerPhone
            );

            if (!ok)
                return NotFound();

            return Ok("accepted");
        }

        [HttpPut("reject/{id}")]
        public async Task<IActionResult> Reject(int id)
        {
            var ok = await _orderRepo.RejectOrder(id);

            if (!ok)
                return NotFound();

            return Ok("rejected");
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var ok = await _orderRepo.DeleteOrder(id);

            if (!ok)
                return NotFound();

            return Ok("deleted");
        }

        [HttpPut("done/{id}")]
        public async Task<IActionResult> Done(
        int id,
        [FromQuery] int? userRate,
        [FromQuery] string? userComment)
        {
            var ok = await _orderRepo.DoneOrder(id, userRate, userComment);
            if (!ok) return NotFound();
            return Ok("done");
        }
    }
}
