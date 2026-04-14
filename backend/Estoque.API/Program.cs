using FluentValidation;
using Korp.Estoque.API.Data;
using Korp.Estoque.API.DTOs;
using Korp.Estoque.API.Endpoints;
using Korp.Estoque.API.Middlewares;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Configuração do BD
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? "Host=localhost;Port=5432;Database=db_estoque;Username=postgres;Password=postgres";
builder.Services.AddDbContext<EstoqueDbContext>(opts => opts.UseNpgsql(connectionString));

builder.Services.AddValidatorsFromAssemblyContaining<CriarProdutoValidator>();
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddProblemDetails();
builder.Services.AddHealthChecks();

// Swagger (Para documentação da API)
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

app.UseExceptionHandler();

// Ativar Swagger em modo de desenvolvimento
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Mapeamento Limpo dos Endpoints (A nossa "chamada" para as controllers)
app.MapProdutoEndpoints();
app.MapHealthChecks("/health");

app.Run();