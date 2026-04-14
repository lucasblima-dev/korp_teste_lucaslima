using Microsoft.EntityFrameworkCore;
//using Npgsql.EntityFrameworkCore.PostgreSQL;

namespace Estoque.API.Data;

public class Produto
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Codigo { get; set; } = string.Empty;
    public string Descricao { get; set; } = string.Empty;
    public int Saldo { get; set; }
    public bool Ativo { get; set; } = true;
    public DateTime CriadoEm { get; set; } = DateTime.UtcNow;
    public DateTime? AtualizadoEm { get; set; }

    public uint Version { get; set; }
}

public class EstoqueDbContext : DbContext
{
    public EstoqueDbContext(DbContextOptions<EstoqueDbContext> options) : base(options) { }

    public DbSet<Produto> Produtos => Set<Produto>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Produto>().HasQueryFilter(p => p.Ativo);

        modelBuilder.Entity<Produto>()
            .Property(p => p.Version)
            .IsRowVersion();

        modelBuilder.Entity<Produto>()
            .HasIndex(p => p.Codigo).IsUnique();

        modelBuilder.Entity<Produto>().HasData(
            new Produto { Id = Guid.NewGuid(), Codigo = "PRD001", Descricao = "RTX 5090 16Gb", Saldo = 150 },
            new Produto { Id = Guid.NewGuid(), Codigo = "PRD002", Descricao = "Samsung Galaxy S26 Pro", Saldo = 8 },
            new Produto { Id = Guid.NewGuid(), Codigo = "PRD003", Descricao = "Monitor Samsung OLED G8", Saldo = 0 },
            new Produto { Id = Guid.NewGuid(), Codigo = "PRD004", Descricao = "Teclado Mecânico Red Dragon", Saldo = 45 },
            new Produto { Id = Guid.NewGuid(), Codigo = "PRD005", Descricao = "Mouse sem fio", Saldo = 12 }
        );
    }
}