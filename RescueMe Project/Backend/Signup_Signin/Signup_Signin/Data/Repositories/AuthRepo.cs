using BCrypt.Net;
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

        // ==================== SIGNUP ====================

        public async Task SignUpUser(User user)
        {
            // hash password before save
            user.Password = BCrypt.Net.BCrypt.HashPassword(user.Password);

            _context.Users.Add(user);
            await _context.SaveChangesAsync();
        }

        public async Task SignUpServiceProvider(ServiceProviderx provider)
        {
            // hash password before save
            provider.Password = BCrypt.Net.BCrypt.HashPassword(provider.Password);

            _context.ServiceProviders.Add(provider);
            await _context.SaveChangesAsync();
        }

        // ==================== SIGNIN ====================

        public async Task<User?> SignInUser(string email, string password)
        {
            // get user with email
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == email);

            if (user == null) return null;

            // Password Validation
            bool isValid = BCrypt.Net.BCrypt.Verify(password, user.Password);

            return isValid ? user : null;
        }

        public async Task<ServiceProviderx?> SignInProvider(string name, string password)
        {
            // Get Provider with Name
            var provider = await _context.ServiceProviders
                .FirstOrDefaultAsync(p => p.Name == name);

            if (provider == null) return null;

            // Password Validation
            bool isValid = BCrypt.Net.BCrypt.Verify(password, provider.Password);

            return isValid ? provider : null;
        }
    }
}