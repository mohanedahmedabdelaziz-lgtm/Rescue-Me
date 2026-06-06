using Microsoft.AspNetCore.Mvc;
using Signup_Signin.Data.Entities;
using Signup_Signin.Data.Repositories;
using System.Net.Http.Json;
using System.Text.Json;

namespace Signup_Signin.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrdersController : ControllerBase
    {
        private readonly OrderRepo _orderRepo;

        public OrdersController(OrderRepo orderRepo)
        {
            _orderRepo = orderRepo;
        }

        [HttpPost]
        public async Task<IActionResult> CreateOrder(RequestService order)
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
            if (order == null) return NotFound();
            return Ok(order);
        }



        [HttpGet("user/{userName}")]
        public async Task<IActionResult> GetOrdersByUser(string userName)
        {
            if (string.IsNullOrEmpty(userName))
                return BadRequest("userName is required");

            var orders = await _orderRepo.GetOrdersByUser(userName);
            return Ok(orders);
        }


        [HttpPut("accept/{id}")]
        public async Task<IActionResult> Accept(
            int id,
            [FromQuery] long providerId,
            [FromQuery] string providerName,
            [FromQuery] string providerPhone)
        {
            var ok = await _orderRepo.AcceptOrder(id, providerId, providerName, providerPhone);
            if (!ok) return NotFound();
            return Ok("accepted");
        }

        [HttpPut("reject/{id}")]
        public async Task<IActionResult> Reject(int id)
        {
            var ok = await _orderRepo.RejectOrder(id);
            if (!ok) return NotFound();
            return Ok("rejected");
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var ok = await _orderRepo.DeleteOrder(id);
            if (!ok) return NotFound();
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

        [HttpPut("payment/{orderId}")]
        public async Task<IActionResult> UpdatePaymentMethod(int orderId, [FromQuery] string paymentMethod)
        {
            var result = await _orderRepo.UpdatePaymentMethod(orderId, paymentMethod);
            if (!result) return NotFound();
            return Ok("Payment method updated.");
        }

        // ═══════════════════════════════════════════
        // ✅ Paymob Integration
        // ═══════════════════════════════════════════
        [HttpGet("paymob/{orderId}")]
        public async Task<IActionResult> CreatePaymobPayment(int orderId)
        {
            try
            {
                var order = await _orderRepo.GetOrder(orderId);
                if (order == null) return NotFound("الطلب غير موجود");

                // ⚠️ استبدل القيم دي بالأرقام الحقيقية من لوحة تحكم Paymob
                string apiKey = "ZXlKaGJHY2lPaUpJVXpVeE1pSXNJblI1Y0NJNklrcFhWQ0o5LmV5SmpiR0Z6Y3lJNklrMWxjbU5vWVc1MElpd2ljSEp2Wm1sc1pWOXdheUk2TVRFM05USTJOaXdpYm1GdFpTSTZJbWx1YVhScFlXd2lmUS5uZjU2aW5wd0xqY1l6ZVI3ZTh3d3ExOHJLbjZWUzJPZmtqR2lRTFNfWEFkTGtuajBwVmJTU1BEVktIeUQ0RWxUci15YUcxWHJjSWFXaW1BNXdNZ0NxZw==";
                string integrationId = "5707262";   // ← من قسم Payment Integrations
                string iframeId = "1049990";             // ← من قسم Iframes

                int amountCents = (int)((order.ServicePrice > 0 ? order.ServicePrice : 100) * 100);

                using var client = new HttpClient();

                // ─── 1. Auth ───
                var authBody = new { api_key = apiKey };
                var authRes = await client.PostAsJsonAsync("https://accept.paymob.com/api/auth/tokens", authBody);
                var authJson = await authRes.Content.ReadFromJsonAsync<JsonElement>();

                if (!authRes.IsSuccessStatusCode || !authJson.TryGetProperty("token", out var tokenProp))
                    return BadRequest(new { message = "فشل المصادقة مع Paymob", details = authJson.ToString() });

                string token = tokenProp.GetString()!;

                // ─── 2. Create Order ───
                var orderBody = new
                {
                    auth_token = token,
                    delivery_needed = false,
                    amount_cents = amountCents,
                    currency = "EGP",
                    items = new object[] { }
                };
                var orderRes = await client.PostAsJsonAsync("https://accept.paymob.com/api/ecommerce/orders", orderBody);
                var orderJson = await orderRes.Content.ReadFromJsonAsync<JsonElement>();

                if (!orderRes.IsSuccessStatusCode || !orderJson.TryGetProperty("id", out var idProp))
                    return BadRequest(new { message = "فشل إنشاء الطلب في Paymob", details = orderJson.ToString() });

                string paymobOrderId = idProp.GetRawText();

                // ─── 3. Payment Key ───
                var keyBody = new
                {
                    auth_token = token,
                    amount_cents = amountCents,
                    expiration = 3600,
                    order_id = paymobOrderId,
                    billing_data = new
                    {
                        apartment = "NA",
                        email = "test@test.com",
                        floor = "NA",
                        first_name = "User",
                        street = "NA",
                        building = "NA",
                        phone_number = "01000000000",
                        shipping_method = "NA",
                        postal_code = "NA",
                        city = "Cairo",
                        last_name = "User",
                        country = "EG"
                    },
                    currency = "EGP",
                    integration_id = integrationId
                };

                var keyRes = await client.PostAsJsonAsync("https://accept.paymob.com/api/acceptance/payment_keys", keyBody);
                var keyJson = await keyRes.Content.ReadFromJsonAsync<JsonElement>();

                if (!keyRes.IsSuccessStatusCode || !keyJson.TryGetProperty("token", out var payTokenProp))
                    return BadRequest(new { message = "فشل إنشاء مفتاح الدفع", details = keyJson.ToString() });

                string paymentToken = payTokenProp.GetString()!;

                return Ok(new
                {
                    paymentUrl = $"https://accept.paymob.com/api/acceptance/iframes/{iframeId}?payment_token={paymentToken}"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    message = "Exception داخلياً",
                    error = ex.Message,
                    inner = ex.InnerException?.Message
                });
            }
        }
    }
}