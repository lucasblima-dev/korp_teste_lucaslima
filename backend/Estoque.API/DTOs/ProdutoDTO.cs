using FluentValidation;

namespace Estoque.API.DTOs;

public record CriarProdutoDTO(string Codigo, string Descricao, int Saldo);
public record AtualizarSaldoDTO(int QuantidadeDebito);

public class CriarProdutoValidator : AbstractValidator<CriarProdutoDTO>
{
  public CriarProdutoValidator()
  {
    RuleFor(x => x.Codigo).NotEmpty().WithMessage("O código é obrigatório.");
    RuleFor(x => x.Descricao).NotEmpty().MinimumLength(3).WithMessage("Descrição muito curta.");
    RuleFor(x => x.Saldo).GreaterThanOrEqualTo(0).WithMessage("Saldo inicial não pode ser negativo.");
  }
}

public class AtualizarSaldoValidator : AbstractValidator<AtualizarSaldoDTO>
{
  public AtualizarSaldoValidator()
  {
    RuleFor(x => x.QuantidadeDebito).GreaterThan(0).WithMessage("A quantidade a debitar deve ser maior que zero.");
  }
}