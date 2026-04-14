using FluentValidation;
using Estoque.API.Data;
using Estoque.API.DTOs;
using Microsoft.EntityFrameworkCore;
using Estoque.API.Middlewares;
using Estoque.API.Endpoints;

var builder = WebApplication.CreateBuilder(args);

// Config do DB
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? "Host=localhost;Port=5432;Database=db_estoque;Username=postgres;Password=postgres";
builder.Services.AddDbContext<EstoqueDbContext>(opts => opts.UseNpgsql(connectionString));

builder.Services.AddValidatorsFromAssemblyContaining<CriarProdutoValidator>();
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddProblemDetails();
builder.Services.AddHealthChecks();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

app.UseExceptionHandler();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.MapProdutoEndpoints();
app.MapHealthChecks("/health");

app.Run();