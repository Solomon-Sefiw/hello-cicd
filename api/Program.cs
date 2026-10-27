var builder = WebApplication.CreateBuilder(args);

// When running inside AWS Lambda (behind a Function URL) this swaps Kestrel for the Lambda runtime.
// When running locally with `dotnet run` it does nothing, so the app behaves like a normal web API.
builder.Services.AddAWSLambdaHosting(LambdaEventSource.HttpApi);

// The React app lives on a different domain (S3), so the browser needs CORS permission to call us.
var allowedOrigin = builder.Configuration["AllowedOrigin"] ?? "*";
builder.Services.AddCors(o => o.AddDefaultPolicy(p =>
{
    if (allowedOrigin == "*") p.AllowAnyOrigin(); else p.WithOrigins(allowedOrigin);
    p.AllowAnyHeader().AllowAnyMethod();
}));

var app = builder.Build();
app.UseCors();

var todos = new List<Todo>
{
    new(1, "Push code to GitHub", true),
    new(2, "Watch GitHub Actions run the tests", false),
    new(3, "See the app live on AWS", false),
};

app.MapGet("/", () => "Hello CI/CD API is running");

app.MapGet("/api/health", () => new { status = "ok", version = Environment.GetEnvironmentVariable("APP_VERSION") ?? "local" });

app.MapGet("/api/todos", () => todos);

app.MapPost("/api/todos", (NewTodo input) =>
{
    if (string.IsNullOrWhiteSpace(input.Title)) return Results.BadRequest("Title is required");
    var todo = new Todo(todos.Count == 0 ? 1 : todos.Max(t => t.Id) + 1, input.Title.Trim(), false);
    todos.Add(todo);
    return Results.Created($"/api/todos/{todo.Id}", todo);
});

app.Run();

public record Todo(int Id, string Title, bool Done);
public record NewTodo(string Title);

// Makes Program visible to the test project (WebApplicationFactory<Program>).
public partial class Program { }
