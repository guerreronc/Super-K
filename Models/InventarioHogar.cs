namespace SuperK.Models;

public class InventarioHogar
{
    public string ProductoId { get; set; } = string.Empty;
    public decimal StockActual { get; set; } = 0;
    public decimal StockMinimo { get; set; } = 1; // Dispara auto-reorden al llegar a este nivel
    public bool Agotado => StockActual <= StockMinimo;
    public DateTime? UltimaFechaCompra { get; set; }
}