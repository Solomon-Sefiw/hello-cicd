using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;

// These tests start the real API in memory. GitHub Actions runs them on every push;
// if one fails, the deploy job never runs - that is the whole point of CI.
public class ApiTests(WebApplicationFactory<Program> factory) : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client = factory.CreateClient();

    [Fact]
    public async Task Health_returns_ok()
    {
        var health = await _client.GetFromJsonAsync<Dictionary<string, string>>("/api/health");
        Assert.Equal("ok", health!["status"]);
    }

    [Fact]
    public async Task Todos_returns_seed_items()
    {
        var todos = await _client.GetFromJsonAsync<List<Todo>>("/api/todos");
        Assert.NotEmpty(todos!);
    }

    [Fact]
    public async Task Creating_todo_without_title_is_rejected()
    {
        var response = await _client.PostAsJsonAsync("/api/todos", new NewTodo(""));
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Creating_todo_adds_it()
    {
        var response = await _client.PostAsJsonAsync("/api/todos", new NewTodo("Learn CI/CD"));
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var created = await response.Content.ReadFromJsonAsync<Todo>();
        Assert.Equal("Learn CI/CD", created!.Title);
    }
}
