using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Signup_Signin.Migrations
{
    /// <inheritdoc />
    public partial class AddRatingToOrder : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "UserComment",
                table: "Orders",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "UserRate",
                table: "Orders",
                type: "int",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "UserComment",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "UserRate",
                table: "Orders");
        }
    }
}
