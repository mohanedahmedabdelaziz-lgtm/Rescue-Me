using Microsoft.EntityFrameworkCore;
using Signup_Signin.Data.Entities;
using Signup_Signin.Data.Repositories;

var builder = WebApplication.CreateBuilder(args);

// Add services
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddScoped<AuthRepo>();

builder.Services.AddScoped<OrderRepo>();

builder.Services.AddDbContext<MainContext>(options =>
    options.UseSqlServer(
        "Data Source=MOHANEDAHMED;Initial Catalog=RescueME;Integrated Security=True;Encrypt=False;TrustServerCertificate=True"
    ));

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        policy =>
        {
            policy.AllowAnyOrigin()
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});
 
var app = builder.Build();


app.UseCors("AllowAll");

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthorization();

app.MapControllers();

app.Run();