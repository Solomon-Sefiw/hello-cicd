# Multi-stage build: stage 1 has the full SDK to compile, stage 2 only has the small runtime.
# The final image is ~220 MB instead of ~900 MB, and contains no source code or compilers.

# ---- Stage 1: build ----
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy only the project file first and restore. Docker caches this layer, so packages are
# re-downloaded only when Api.csproj changes - not on every code change.
COPY Api.csproj .
RUN dotnet restore

COPY . .
RUN dotnet publish -c Release -o /app --no-restore

# ---- Stage 2: run ----
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app .

# .NET 8 images listen on port 8080 and run as a non-root user by default.
EXPOSE 8080
ENTRYPOINT ["dotnet", "Api.dll"]
