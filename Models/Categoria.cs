namespace SuperK.Models;

public class Categoria
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string Nombre { get; set; } = string.Empty;
    public string Icono { get; set; } = "📦";
    public bool EsPersonalizada { get; set; } = false;
}