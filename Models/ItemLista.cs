namespace SuperK.Models;

public class ItemLista
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string? ProductoId { get; set; } // Permite nulos para items manuales sin registro previo
    public string? NombreTemporal { get; set; }

    // Planeación
    public int CantidadPlaneada { get; set; } = 1;
    public decimal PrecioEstimado { get; set; }

    // En Caja / Carrito
    public bool Comprado { get; set; } = false;
    public decimal CantidadEnCarrito { get; set; } = 0;
    public decimal PrecioRealEnCaja { get; set; }
    public bool EnCarrito { get => Comprado; set => Comprado = value; } // Compatibilidad bidireccional
    
    // Evidencia y Notas
    public string? FotoOfertaBase64 { get; set; }
    public string? Notas { get; set; }

    // Subtotales calculados
    public decimal SubtotalEstimado => CantidadPlaneada * PrecioEstimado;
    public decimal SubtotalReal => CantidadEnCarrito * PrecioRealEnCaja;
    // Propiedades para evidencia de ofertas en caja
    public bool TieneFotoOferta { get; set; } = false;
}