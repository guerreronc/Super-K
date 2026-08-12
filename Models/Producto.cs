namespace SuperK.Models;

public class Producto
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string CodigoBarras { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string CategoriaId { get; set; } = string.Empty;
    public decimal UltimoPrecio { get; set; }
    public string UnidadMedida { get; set; } = "Pza"; // Pza, Kg, Litro, Paquete
    public string? FotoBase64 { get; set; }
    public DateTime UltimaActualizacion { get; set; } = DateTime.Now;
}