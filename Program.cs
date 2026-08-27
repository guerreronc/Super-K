using Microsoft.AspNetCore.Components.Web;
using Microsoft.AspNetCore.Components.WebAssembly.Hosting;
using App_SUPER_K;

var builder = WebAssemblyHostBuilder.CreateDefault(args);
builder.RootComponents.Add<App>("#app");
builder.RootComponents.Add<HeadOutlet>("head::after");

builder.Services.AddScoped(sp => new HttpClient { BaseAddress = new Uri(builder.HostEnvironment.BaseAddress) });
// Registrar servicios locales nativos de SUPER-K
builder.Services.AddScoped<SuperK.Services.LocalStorageService>();
builder.Services.AddScoped<SuperK.Services.StorageService>();
builder.Services.AddScoped<SuperK.Services.OpenFoodFactsService>();
await builder.Build().RunAsync();
