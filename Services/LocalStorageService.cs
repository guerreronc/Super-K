using System.Text.Json;
using Microsoft.JSInterop;

namespace SuperK.Services;

public class LocalStorageService
{
    private readonly IJSRuntime _jsRuntime;

    public LocalStorageService(IJSRuntime jsRuntime)
    {
        _jsRuntime = jsRuntime;
    }

    public async ValueTask SetItemAsync<T>(string key, T data)
    {
        var json = JsonSerializer.Serialize(data);
        await _jsRuntime.InvokeVoidAsync("localStorage.setItem", key, json);
    }

    public async ValueTask<T?> GetItemAsync<T>(string key)
    {
        var json = await _jsRuntime.InvokeAsync<string?>("localStorage.getItem", key);
        if (string.IsNullOrWhiteSpace(json)) return default;
        return JsonSerializer.Deserialize<T>(json);
    }

    public async ValueTask RemoveItemAsync(string key)
    {
        await _jsRuntime.InvokeVoidAsync("localStorage.removeItem", key);
    }
}