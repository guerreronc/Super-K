using System.Text.Json;
namespace SuperK.Services;

public class OpenFoodFactsService
{
    private readonly HttpClient _http;

    public OpenFoodFactsService(HttpClient http)
    {
        _http = http;
    }

    public async Task<string?> BuscarNombreProductoAsync(string codigoBarras)
    {
        try
        {
            // API pública v2 de Open Food Facts
            var url = $"https://world.openfoodfacts.org/api/v2/product/{codigoBarras}.json";
            
            // Requerimiento de Open Food Facts: incluir un User-Agent personalizado
            var request = new HttpRequestMessage(HttpMethod.Get, url);
            request.Headers.Add("User-Agent", "AppSuperK - BlazorWasm - Version 1.0");

            var response = await _http.SendAsync(request);
            if (!response.IsSuccessStatusCode) return null;

            using var doc = await JsonDocument.ParseAsync(await response.Content.ReadAsStreamAsync());
            var root = doc.RootElement;

            // Verificar si el producto fue encontrado (status == 1)
            if (root.TryGetProperty("status", out var status) && status.GetInt32() == 1)
            {
                if (root.TryGetProperty("product", out var product))
                {
                    // Priorizar nombre en español si existe
                    string nombre = "";
                    if (product.TryGetProperty("product_name_es", out var nameEs) && !string.IsNullOrWhiteSpace(nameEs.GetString()))
                        nombre = nameEs.GetString()!;
                    else if (product.TryGetProperty("product_name", out var name) && !string.IsNullOrWhiteSpace(name.GetString()))
                        nombre = name.GetString()!;

                    // Obtener la marca
                    string marca = "";
                    if (product.TryGetProperty("brands", out var brand) && !string.IsNullOrWhiteSpace(brand.GetString()))
                        marca = brand.GetString()!.Split(',')[0].Trim();

                    if (string.IsNullOrWhiteSpace(nombre)) return null;

                    return string.IsNullOrWhiteSpace(marca) ? nombre : $"{nombre} - {marca}";
                }
            }
        }
        catch
        {
            // Retorna null si no hay internet o falla la respuesta
        }

        return null;
    }
}