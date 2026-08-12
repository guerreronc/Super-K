namespace SuperK.Models;

public class ItemLista
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string ProductoId { get; set; } = string.Empty;
    public decimal CantidadPlaneada { get; set; } = 1;
    public decimal CantidadComprada { get; set; } = 0;
    public decimal PrecioEnCaja { get; set; }
    public bool EnCarrito { get; set; } = false;
    public string? FotoPromocionBase64 { get; set; } // Evidencia de oferta
    public string? Notas { get; set; }

    // Propiedad calculada para el subtotal
    public decimal Subtotal => EnCarrito ? (CantidadComprada * PrecioEnCaja) : (CantidadPlaneada * PrecioEnCaja);
}