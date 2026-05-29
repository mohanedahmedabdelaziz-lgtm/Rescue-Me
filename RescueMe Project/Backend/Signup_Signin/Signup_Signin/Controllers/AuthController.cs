using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Signup_Signin.Data.Entities;
using Signup_Signin.Data.Repositories;

namespace Signup_Signin.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly AuthRepo _authRepo;
        public AuthController(AuthRepo authRepo)
        {
            _authRepo = authRepo;
        }

        [HttpPost("signup/user")]
        async public Task <IActionResult> SignUpUser(User user)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            await _authRepo.SignUpUser(user);
            return Ok("User created successfully.");
        }


        [HttpPost("signup/provider")]
        async public Task<IActionResult> SignUpProvider(ServiceProviderx provider)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            await _authRepo.SignUpServiceProvider(provider);
            return Ok("Provider created successfully.");
        }




        [HttpGet("signin/user")]
        async public Task<IActionResult>  SignInUser(string email, string password)
        {
            if (email == null || password == null)
            {
                return Unauthorized("empty email or password.");
            }

            var user = await _authRepo.SignInUser(email, password);
            if (user == null)
            {
                return Unauthorized("Invalid email or password.");
            }
            return Ok(user);
        }

        [HttpGet("signin/provider")]
        async public Task <IActionResult> SignInProvider(string name, string password)
        {
            if (name == null || password==null)
            {
                return Unauthorized("Invalid name or password.");
            }
            var provider =await _authRepo.SignInProvider(name, password);
            if (provider == null)
            {
                return Unauthorized("Invalid name or password.");
            }
            return Ok(provider);
        }
    }
}
