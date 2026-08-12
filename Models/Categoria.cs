namespace SuperK.Models;

public class Categoria
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string Nombre { get; set; } = string.Empty;
    public string Icono { get; set; } = "🛒"; // Emoji o clase CSS/Icono
    public string ColorHex { get; set; } = "#10B981";
}