using SuperK.Models;

namespace SuperK.Services;

public class StorageService
{
    private readonly LocalStorageService _localStorage;
    private const string KEY_CATEGORIAS = "superk_categorias";
    private const string KEY_PRODUCTOS = "superk_productos";
    private const string KEY_LISTA = "superk_lista_actual";

    public StorageService(LocalStorageService localStorage)
    {
        _localStorage = localStorage;
    }

    public async Task<List<Categoria>> ObtenerCategoriasAsync()
    {
        var categorias = await _localStorage.GetItemAsync<List<Categoria>>(KEY_CATEGORIAS);
        
        if (categorias == null || !categorias.Any())
        {
            categorias = GetCategoriasSemilla();
            await _localStorage.SetItemAsync(KEY_CATEGORIAS, categorias);
        }

        return categorias;
    }

    public async Task GuardarCategoriaAsync(Categoria nuevaCat)
    {
        var categorias = await ObtenerCategoriasAsync();
        categorias.Add(nuevaCat);
        await _localStorage.SetItemAsync(KEY_CATEGORIAS, categorias);
    }

    public async Task<List<Producto>> ObtenerProductosAsync()
    {
        return await _localStorage.GetItemAsync<List<Producto>>(KEY_PRODUCTOS) ?? new List<Producto>();
    }

    public async Task GuardarProductoAsync(Producto prod)
    {
        var productos = await ObtenerProductosAsync();
        var index = productos.FindIndex(p => p.Id == prod.Id);
        if (index >= 0)
        {
            productos[index] = prod;
        }
        else
        {
            productos.Add(prod);
        }
        await _localStorage.SetItemAsync(KEY_PRODUCTOS, productos);
    }

    public async Task<List<ItemLista>> ObtenerListaActualAsync()
    {
        return await _localStorage.GetItemAsync<List<ItemLista>>(KEY_LISTA) ?? new List<ItemLista>();
    }

    public async Task GuardarListaActualAsync(List<ItemLista> lista)
    {
        await _localStorage.SetItemAsync(KEY_LISTA, lista);
    }

    private List<Categoria> GetCategoriasSemilla()
    {
        return new List<Categoria>
        {
            new Categoria { Nombre = "Abarrotes y Despensa", Icono = "🥫" },
            new Categoria { Nombre = "Lácteos y Huevos", Icono = "🥛" },
            new Categoria { Nombre = "Frutas y Verduras", Icono = "🍎" },
            new Categoria { Nombre = "Carnes y Pescados", Icono = "🥩" },
            new Categoria { Nombre = "Limpieza del Hogar", Icono = "🧹" },
            new Categoria { Nombre = "Cuidado Personal", Icono = "🧴" },
            new Categoria { Nombre = "Bebidas y Botanas", Icono = "🥤" },
            new Categoria { Nombre = "Mascotas", Icono = "🐶" },
            new Categoria { Nombre = "Otros", Icono = "📦" }
        };
    }
    public async Task EliminarProductoAsync(string id)
    {
        var productos = await ObtenerProductosAsync();
        productos.RemoveAll(p => p.Id == id);
        await _localStorage.SetItemAsync("superk_productos", productos); 
        // Nota: Asegúrate de usar la misma clave ("superk_productos" o similar) que usas en tu StorageService
    }
}