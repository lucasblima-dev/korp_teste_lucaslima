using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Estoque.API.Migrations
{
    /// <inheritdoc />
    public partial class InitalCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Produtos",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Codigo = table.Column<string>(type: "text", nullable: false),
                    Descricao = table.Column<string>(type: "text", nullable: false),
                    Saldo = table.Column<int>(type: "integer", nullable: false),
                    Ativo = table.Column<bool>(type: "boolean", nullable: false),
                    CriadoEm = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    AtualizadoEm = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Produtos", x => x.Id);
                });

            migrationBuilder.InsertData(
                table: "Produtos",
                columns: new[] { "Id", "Ativo", "AtualizadoEm", "Codigo", "CriadoEm", "Descricao", "Saldo" },
                values: new object[,]
                {
                    { new Guid("1f041a62-a16c-48b4-9e0c-e27c9a83761c"), true, null, "PRD001", new DateTime(2026, 4, 14, 18, 46, 53, 713, DateTimeKind.Utc).AddTicks(3222), "RTX 5090 16Gb", 150 },
                    { new Guid("81e83bad-027a-43d5-bd27-e9ab0a5ce695"), true, null, "PRD004", new DateTime(2026, 4, 14, 18, 46, 53, 713, DateTimeKind.Utc).AddTicks(4335), "Teclado Mecânico Red Dragon", 45 },
                    { new Guid("a68bd204-fe4a-4f7a-bed9-dc5b04350e3c"), true, null, "PRD003", new DateTime(2026, 4, 14, 18, 46, 53, 713, DateTimeKind.Utc).AddTicks(4326), "Monitor Samsung OLED G8", 0 },
                    { new Guid("f5473c19-96f7-4820-9a37-530cd1aa7eba"), true, null, "PRD002", new DateTime(2026, 4, 14, 18, 46, 53, 713, DateTimeKind.Utc).AddTicks(4323), "Samsung Galaxy S26 Pro", 8 },
                    { new Guid("fcd9f749-7b66-429d-be55-032e323d907c"), true, null, "PRD005", new DateTime(2026, 4, 14, 18, 46, 53, 713, DateTimeKind.Utc).AddTicks(4337), "Mouse sem fio", 12 }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Produtos_Codigo",
                table: "Produtos",
                column: "Codigo",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Produtos");
        }
    }
}
