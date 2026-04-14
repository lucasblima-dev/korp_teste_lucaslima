using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace Korp.Estoque.API.Middlewares;

public class GlobalExceptionHandler : IExceptionHandler
{
  private readonly ILogger<GlobalExceptionHandler> _logger;

  public GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger)
  {
    _logger = logger;
  }

  public async ValueTask<bool> TryHandleAsync(HttpContext httpContext, Exception exception, CancellationToken cancellationToken)
  {
    _logger.LogError(exception, "Ocorreu uma exceção não tratada.");

    var problemDetails = new ProblemDetails
    {
      Status = StatusCodes.Status500InternalServerError,
      Title = "Erro interno no servidor",
      Detail = exception.Message
    };

    if (exception is DbUpdateConcurrencyException)
    {
      problemDetails.Status = StatusCodes.Status409Conflict;
      problemDetails.Title = "Conflito de Concorrência";
      problemDetails.Detail = "O registro foi modificado por outro processo. Tente novamente.";
    }
    else if (exception.InnerException is PostgresException pgEx && pgEx.SqlState == "23505")
    {
      problemDetails.Status = StatusCodes.Status422UnprocessableEntity;
      problemDetails.Title = "Violação de Regra de Negócio";
      problemDetails.Detail = "Já existe um produto com este código.";
    }

    httpContext.Response.StatusCode = problemDetails.Status.Value;
    await httpContext.Response.WriteAsJsonAsync(problemDetails, cancellationToken);

    return true;
  }
}