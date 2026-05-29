using System.ComponentModel.DataAnnotations;

namespace Signup_Signin.Data.Entities
{
    public class ServiceProviderx
    {
        [Key]
        public int Id { get; set; }
        [Required]
        public string Name { get; set; }
        public string Password { get; set; }
        public ServiceType type { get; set; }
        [Required]
        public string Phone { get; set; }

        public enum ServiceType
        {
            Tow,
            Mechanic,   
            Electrician
        }
    }
}
