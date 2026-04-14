using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using Faturamento.API.Data;

namespace Faturamento.API.Services;

public class QuestPdfGenerator
{
  public byte[] GerarPdfNotaFiscal(NotaFiscal nota)
  {
    QuestPDF.Settings.License = LicenseType.Community;

    var document = Document.Create(container =>
    {
      container.Page(page =>
          {
            page.Size(PageSizes.A4);
            page.Margin(2, Unit.Centimetre);

            page.Header().Element(ComposeHeader);
            page.Content().Element(x => ComposeContent(x, nota));
            page.Footer().AlignCenter().Text(x =>
                {
                  x.Span("Página ");
                  x.CurrentPageNumber();
                });
          });
    });

    return document.GeneratePdf();
  }

  private void ComposeHeader(IContainer container)
  {
    container.Row(row =>
    {
      row.RelativeItem().Column(column =>
          {
            column.Item().Text("KORP ERP").FontSize(24).SemiBold().FontColor(Colors.Blue.Darken2);
            column.Item().Text("Comprovante de Faturamento");
          });
    });
  }

  private void ComposeContent(IContainer container, NotaFiscal nota)
  {
    container.PaddingVertical(1, Unit.Centimetre).Column(column =>
    {
      column.Item().Text($"Nota Nº: {nota.Numero}").SemiBold();
      column.Item().Text($"Emissão: {nota.FechadaEm:dd/MM/yyyy HH:mm}");
      column.Item().PaddingBottom(1, Unit.Centimetre);

      column.Item().Table(table =>
          {
            table.ColumnsDefinition(columns =>
                {
                  columns.ConstantColumn(80);
                  columns.RelativeColumn();
                  columns.ConstantColumn(60);
                });

            table.Header(header =>
                {
                  header.Cell().Text("CÓDIGO").SemiBold();
                  header.Cell().Text("DESCRIÇÃO").SemiBold();
                  header.Cell().Text("QTD").SemiBold();
                });

            foreach (var item in nota.Itens)
            {
              table.Cell().Text(item.CodigoProduto);
              table.Cell().Text(item.DescricaoProduto);
              table.Cell().Text(item.Quantidade.ToString());
            }
          });
    });
  }
}