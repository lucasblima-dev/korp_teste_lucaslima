using Faturamento.API.Data;
using Faturamento.API.Dndpoints;
using Faturamento.API.Services;
using Microsoft.EntityFrameworkCore;
using Polly;
using Polly.Extensions.Http;

var builder = WebApplication.CreateBuilder(args);

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

using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<FaturamentoDbContext>();
    dbContext.Database.Migrate();
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.MapNotaEndpoints();

app.Run();