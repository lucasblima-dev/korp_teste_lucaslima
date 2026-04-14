//using Microsoft.EntityFrameworkCore;

namespace Faturamento.API.Data;

public enum StatusNota { Aberta = 1, Fechada = 2 }

public class NotaFiscal
{
  public Guid Id { get; set; } = Guid.NewGuid();
  public int Numero { get; set; }
  public StatusNota Status { get; set; } = StatusNota.Aberta;
  public DateTime CriadaEm { get; set; } = DateTime.UtcNow;
  public DateTime? FechadaEm { get; set; }
  public string? IdempotencyKey { get; set; }
  public List<ItemNota> Itens { get; set; } = new();
}

public class ItemNota
{
  public Guid Id { get; set; } = Guid.NewGuid();
  public Guid NotaFiscalId { get; set; }
  public Guid ProdutoId { get; set; }
  public string CodigoProduto { get; set; } = string.Empty;
  public string DescricaoProduto { get; set; } = string.Empty;
  public int Quantidade { get; set; }
  public int SaldoAnterior { get; set; }
}

public class FaturamentoDbContext : DbContext
{
  public FaturamentoDbContext(DbContextOptions<FaturamentoDbContext> options) : base(options) { }

  public DbSet<NotaFiscal> NotasFiscais => Set<NotaFiscal>();
  public DbSet<ItemNota> ItensNota => Set<ItemNota>();

  protected override void OnModelCreating(ModelBuilder modelBuilder)
  {
    modelBuilder.HasSequence<int>("NotaFiscalNumeros").StartsAt(1001).IncrementsBy(1);

    modelBuilder.Entity<NotaFiscal>()
        .Property(n => n.Numero)
        .HasDefaultValueSql("nextval('\"NotaFiscalNumeros\"')");
  }
}