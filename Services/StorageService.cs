using SuperK.Models;

namespace SuperK.Services;

public class StorageService
{
    private readonly LocalStorageService _localStorage;
    private const string KEY_PRODUCTOS = "superk_productos";
    private const string KEY_CATEGORIAS = "superk_categorias";
    private const string KEY_CARRITO = "superk_carrito";
    private const string KEY_DESPENSA = "superk_despensa";

    public StorageService(LocalStorageService localStorage)
    {
        _localStorage = localStorage;
    }

    // --- CATEGORÍAS ---
    public async Task<List<Categoria>> ObtenerCategoriasAsync()
    {
        var categorias = await _localStorage.GetItemAsync<List<Categoria>>(KEY_CATEGORIAS);
        if (categorias == null || !categorias.Any())
        {
            categorias = CargarCategoriasSemilla();
            await _localStorage.SetItemAsync(KEY_CATEGORIAS, categorias);
        }
        return categorias;
    }

    // --- PRODUCTOS ---
    public async Task<List<Producto>> ObtenerProductosAsync()
    {
        return await _localStorage.GetItemAsync<List<Producto>>(KEY_PRODUCTOS) ?? new List<Producto>();
    }

    public async Task GuardarProductoAsync(Producto producto)
    {
        var productos = await ObtenerProductosAsync();
        var index = productos.FindIndex(p => p.Id == producto.Id);
        if (index >= 0)
            productos[index] = producto;
        else
            productos.Add(producto);

        await _localStorage.SetItemAsync(KEY_PRODUCTOS, productos);
    }

    // --- LISTA / CARRITO DEL SÚPER ---
    public async Task<List<ItemLista>> ObtenerListaActualAsync()
    {
        return await _localStorage.GetItemAsync<List<ItemLista>>(KEY_CARRITO) ?? new List<ItemLista>();
    }

    public async Task GuardarListaActualAsync(List<ItemLista> lista)
    {
        await _localStorage.SetItemAsync(KEY_CARRITO, lista);
    }

    // --- CATEGORÍAS BASE POR DEFECTO ---
    private List<Categoria> CargarCategoriasSemilla()
    {
        return new List<Categoria>
        {
            new Categoria { Nombre = "Abarrotes y Despensa", Icono = "🥫", ColorHex = "#F59E0B" },
            new Categoria { Nombre = "Frutas y Verduras", Icono = "🍎", ColorHex = "#10B981" },
            new Categoria { Nombre = "Lácteos y Huevo", Icono = "🥛", ColorHex = "#3B82F6" },
            new Categoria { Nombre = "Carnes y Pescados", Icono = "🥩", ColorHex = "#EF4444" },
            new Categoria { Nombre = "Limpieza del Hogar", Icono = "🧹", ColorHex = "#8B5CF6" },
            new Categoria { Nombre = "Cuidado Personal", Icono = "🧴", ColorHex = "#EC4899" },
            new Categoria { Nombre = "Bebidas y Botanas", Icono = "🥤", ColorHex = "#06B6D4" }
        };
    }
}