using FluentValidation;
using Estoque.API.Data;
using Estoque.API.DTOs;
using Microsoft.EntityFrameworkCore;
using Estoque.API.Middlewares;
using Estoque.API.Endpoints;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddValidatorsFromAssemblyContaining<CriarProdutoValidator>();
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddProblemDetails();
builder.Services.AddHealthChecks();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Config do DB
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<EstoqueDbContext>();
    dbContext.Database.Migrate();
}

app.UseExceptionHandler();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.MapProdutoEndpoints();
app.MapHealthChecks("/health");

app.Run();