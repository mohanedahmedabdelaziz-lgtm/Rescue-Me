using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Signup_Signin.Migrations
{
    /// <inheritdoc />
    public partial class add_payement_method : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "PaymentMethod",
                table: "RequestServices",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PaymentMethod",
                table: "RequestServices");
        }
    }
}
