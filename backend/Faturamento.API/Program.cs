using Faturamento.API.Data;
using Faturamento.API.Dndpoints;
using Faturamento.API.Services;
using Microsoft.EntityFrameworkCore;
using Polly;
using Polly.Extensions.Http;

var builder = WebApplication.CreateBuilder(args);

var connString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? "Host=localhost;Port=5432;Database=db_faturamento;Username=postgres;Password=postgres";
builder.Services.AddDbContext<FaturamentoDbContext>(opts => opts.UseNpgsql(connString));

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddSingleton<QuestPdfGenerator>();

var retryPolicy = HttpPolicyExtensions
    .HandleTransientHttpError()
    .WaitAndRetryAsync(3, retryAttempt => TimeSpan.FromSeconds(Math.Pow(2, retryAttempt)));

var circuitBreakerPolicy = HttpPolicyExtensions
    .HandleTransientHttpError()
    .CircuitBreakerAsync(5, TimeSpan.FromSeconds(15));

var estoqueUrl = builder.Configuration["EstoqueApi:BaseUrl"] ?? "http://localhost:5001";
builder.Services.AddHttpClient<EstoqueClient>(client =>
{
    client.BaseAddress = new Uri(estoqueUrl);
})
.AddPolicyHandler(retryPolicy)
.AddPolicyHandler(circuitBreakerPolicy);

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.MapNotaEndpoints();

app.Run();