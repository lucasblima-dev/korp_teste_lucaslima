using FluentValidation;
using Estoque.API.Data;
using Estoque.API.DTOs;
using Microsoft.EntityFrameworkCore;

namespace Estoque.API.Endpoints;

public static class ProdutoEndpoints
{
  public static void MapProdutoEndpoints(this IEndpointRouteBuilder app)
  {
#pragma warning disable ASPDEPR002 // O tipo ou membro é obsoleto
    var api = app.MapGroup("/api/produtos")
                 .WithTags("Produtos")
                 .WithOpenApi();
#pragma warning restore ASPDEPR002 // O tipo ou membro é obsoleto

    api.MapGet("/", ListarProdutos);
    api.MapPost("/", CriarProduto);
    api.MapPatch("/{id:guid}/saldo", AtualizarSaldo);
    api.MapDelete("/{id:guid}", DeletarProduto);
  }

  private static async Task<IResult> ListarProdutos(EstoqueDbContext db, string? busca)
  {
    var query = db.Produtos.AsQueryable();

    if (!string.IsNullOrWhiteSpace(busca))
    {
      query = query.Where(p => p.Codigo.Contains(busca) || p.Descricao.Contains(busca));
    }

    var produtos = await query.OrderBy(p => p.Descricao).ToListAsync();
    return Results.Ok(produtos);
  }

  private static async Task<IResult> CriarProduto(EstoqueDbContext db, IValidator<CriarProdutoDTO> validator, CriarProdutoDTO dto)
  {
    var validationResult = await validator.ValidateAsync(dto);
    if (!validationResult.IsValid) return Results.ValidationProblem(validationResult.ToDictionary());

    var produto = new Produto { Codigo = dto.Codigo, Descricao = dto.Descricao, Saldo = dto.Saldo };
    db.Produtos.Add(produto);
    await db.SaveChangesAsync();

    return Results.Created($"/api/produtos/{produto.Id}", produto);
  }

  private static async Task<IResult> AtualizarSaldo(EstoqueDbContext db, IValidator<AtualizarSaldoDTO> validator, Guid id, AtualizarSaldoDTO dto)
  {
    var validationResult = await validator.ValidateAsync(dto);
    if (!validationResult.IsValid) return Results.ValidationProblem(validationResult.ToDictionary());

    var produto = await db.Produtos.FindAsync(id);
    if (produto == null) return Results.NotFound();

    if (produto.Saldo - dto.QuantidadeDebito < 0)
    {
      return Results.UnprocessableEntity(new { Mensagem = "Saldo insuficiente." });
    }

    produto.Saldo -= dto.QuantidadeDebito;
    produto.AtualizadoEm = DateTime.UtcNow;

    await db.SaveChangesAsync();

    return Results.Ok(produto);
  }

  private static async Task<IResult> DeletarProduto(EstoqueDbContext db, Guid id)
  {
    var produto = await db.Produtos.FindAsync(id);
    if (produto == null) return Results.NotFound();

    produto.Ativo = false;
    await db.SaveChangesAsync();
    return Results.NoContent();
  }
}