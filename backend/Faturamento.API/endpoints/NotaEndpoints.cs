using Faturamento.API.Data;
using Faturamento.API.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Faturamento.API.Endpoints;

public record CriarNotaDTO(List<ItemNotaDTO> Itens);
public record ItemNotaDTO(Guid ProdutoId, string Codigo, string Descricao, int Quantidade, int SaldoAtual);

public static class NotaEndpoints
{
  public static void MapNotaEndpoints(this IEndpointRouteBuilder app)
  {
    var api = app.MapGroup("/api/notas").WithTags("Notas Fiscais");

    api.MapGet("/", async (FaturamentoDbContext db) =>
        await db.NotasFiscais.Include(n => n.Itens).OrderByDescending(n => n.CriadaEm).ToListAsync());

    api.MapPost("/", async (FaturamentoDbContext db, CriarNotaDTO dto) =>
    {
      var nota = new NotaFiscal
      {
        Itens = dto.Itens.Select(i => new ItemNota
        {
          ProdutoId = i.ProdutoId,
          CodigoProduto = i.Codigo,
          DescricaoProduto = i.Descricao,
          Quantidade = i.Quantidade,
          SaldoAnterior = i.SaldoAtual
        }).ToList()
      };
      db.NotasFiscais.Add(nota);
      await db.SaveChangesAsync();
      return Results.Created($"/api/notas/{nota.Id}", nota);
    });

    api.MapPost("/{id:guid}/imprimir", async (
        Guid id,
        [FromHeader(Name = "Idempotency-Key")] string? idempotencyKey,
        FaturamentoDbContext db,
        EstoqueClient estoqueClient,
        QuestPdfGenerator pdfGenerator) =>
    {
      var nota = await db.NotasFiscais.Include(n => n.Itens).FirstOrDefaultAsync(n => n.Id == id);
      if (nota == null) return Results.NotFound();

      if (!string.IsNullOrEmpty(idempotencyKey) && nota.IdempotencyKey == idempotencyKey && nota.Status == StatusNota.Fechada)
      {
        var cachedPdf = pdfGenerator.GerarPdfNotaFiscal(nota);
        return Results.File(cachedPdf, "application/pdf", $"Nota_{nota.Numero}.pdf");
      }

      if (nota.Status == StatusNota.Fechada) return Results.UnprocessableEntity("Nota já está fechada.");

      foreach (var item in nota.Itens)
      {
        var sucesso = await estoqueClient.DebitarSaldoAsync(item.ProdutoId, item.Quantidade);
        if (!sucesso)
          return Results.Problem("Falha ao debitar saldo no estoque ou circuito aberto (503).", statusCode: 503);
      }

      nota.Status = StatusNota.Fechada;
      nota.FechadaEm = DateTime.UtcNow;
      nota.IdempotencyKey = idempotencyKey;

      await db.SaveChangesAsync();

      var pdf = pdfGenerator.GerarPdfNotaFiscal(nota);
      return Results.File(pdf, "application/pdf", $"Nota_{nota.Numero}.pdf");
    });
  }
}