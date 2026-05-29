using System.ComponentModel.DataAnnotations;

namespace Signup_Signin.Data.Entities
{
    public class Order
    {
        [Key]
        public int Id { get; set; }

        public string UserName { get; set; }
        public string UserPhone { get; set; }

        public string ServiceName { get; set; }
        public decimal ServicePrice { get; set; }

        // 0 tow
        // 1 mechanic
        // 2 electrician
        public int ProviderType { get; set; }

        public string CarName { get; set; }
        public string PlateNumber { get; set; }

        public double UserLat { get; set; }
        public double UserLng { get; set; }
        public string UserAddress { get; set; }

        // pending
        // accepted
        // rejected
        // done
        public string Status { get; set; } = "pending";

        public long? ProviderId { get; set; }
        public string? ProviderName { get; set; }
        public string? ProviderPhone { get; set; }
        public int? UserRate { get; set; }
        public string? UserComment { get; set; }
        public string? Description { get; set; }



        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }
}
