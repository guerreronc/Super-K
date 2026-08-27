namespace SuperK.Models;

public class ItemLista
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string ProductoId { get; set; } = string.Empty;
    
    // Planeación
    public decimal CantidadPlaneada { get; set; } = 1;
    public decimal PrecioEstimado { get; set; }

    // En Caja / Carrito
    public decimal CantidadEnCarrito { get; set; } = 0;
    public decimal PrecioRealEnCaja { get; set; }
    public bool EnCarrito { get; set; } = false;
    
    // Evidencia y Notas
    public string? FotoOfertaBase64 { get; set; }
    public string? Notas { get; set; }

    // Subtotales calculados
    public decimal SubtotalEstimado => CantidadPlaneada * PrecioEstimado;
    public decimal SubtotalReal => CantidadEnCarrito * PrecioRealEnCaja;
}