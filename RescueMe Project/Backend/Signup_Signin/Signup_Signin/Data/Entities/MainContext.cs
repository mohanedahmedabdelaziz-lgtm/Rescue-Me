using Microsoft.EntityFrameworkCore;

namespace Signup_Signin.Data.Entities
{
    public class MainContext : DbContext
    {
        public MainContext(DbContextOptions<MainContext> options) : base(options)
        {

        }
        public DbSet<User> Users { get; set; }
        public DbSet<ServiceProviderx> ServiceProviders { get; set; }
        public DbSet<Order> Orders { get; set; }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            base.OnConfiguring(optionsBuilder);
        }
    }
}