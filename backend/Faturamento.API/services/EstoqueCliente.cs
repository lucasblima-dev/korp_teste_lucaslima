namespace Faturamento.API.Services;

public record DebitarSaldoDTO(int QuantidadeDebito);

public class EstoqueClient
{
  private readonly HttpClient _httpClient;

  public EstoqueClient(HttpClient httpClient)
  {
    _httpClient = httpClient;
  }

  public async Task<bool> DebitarSaldoAsync(Guid produtoId, int quantidade)
  {
    var response = await _httpClient.PatchAsJsonAsync($"/api/produtos/{produtoId}/saldo", new DebitarSaldoDTO(quantidade));
    return response.IsSuccessStatusCode;
  }
}