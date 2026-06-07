using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Signup_Signin.Migrations
{
    /// <inheritdoc />
    public partial class renameordertable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_Orders",
                table: "Orders");

            migrationBuilder.RenameTable(
                name: "Orders",
                newName: "RequestServices");

            migrationBuilder.AddPrimaryKey(
                name: "PK_RequestServices",
                table: "RequestServices",
                column: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_RequestServices",
                table: "RequestServices");

            migrationBuilder.RenameTable(
                name: "RequestServices",
                newName: "Orders");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Orders",
                table: "Orders",
                column: "Id");
        }
    }
}
