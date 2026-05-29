using Microsoft.EntityFrameworkCore;
using Signup_Signin.Data.Entities;
namespace Signup_Signin.Data.Repositories
{
    public class AuthRepo
    {
        private readonly MainContext _context;
        public AuthRepo(MainContext context)
        {
            _context = context;
        }

        async public Task SignUpUser(User user)
        {
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
        }
        async public Task SignUpServiceProvider(ServiceProviderx provider)
        {
            _context.ServiceProviders.Add(provider);
            await _context.SaveChangesAsync();
        }

        async public Task<User?> SignInUser(string email, string password)
        {
            return await _context.Users.FirstOrDefaultAsync(u => u.Email == email && u.Password == password);
        }

        async public Task<ServiceProviderx?> SignInProvider(string name, string password)
        {
            return await _context.ServiceProviders.FirstOrDefaultAsync(u => u.Name == name && u.Password == password);
        }
    }
}
