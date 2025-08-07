# Deployment script for Bright Minds Academy

# Check if Docker is running
try {
    docker info | Out-Null
} catch {
    Write-Host "Docker is not running. Please start Docker Desktop and try again." -ForegroundColor Red
    exit 1
}

# Check if .env file exists, if not, create it from .env.example
if (-not (Test-Path .env)) {
    Write-Host "Creating .env file from .env.example..." -ForegroundColor Yellow
    Copy-Item .env.example -Destination .env
    Write-Host "Please update the .env file with your configuration and run this script again." -ForegroundColor Yellow
    exit 0
}

# Load environment variables
Get-Content .env | ForEach-Object {
    $name, $value = $_.Split('=', 2)
    if ($name -and $value) {
        Set-Item -Path "env:$name" -Value $value
    }
}

# Build and start containers
Write-Host "Building and starting containers..." -ForegroundColor Cyan
docker-compose up -d --build

# Check if containers started successfully
$backendStatus = docker ps --filter "name=school-backend" --format '{{.Status}}'
$dbStatus = docker ps --filter "name=school-mongodb" --format '{{.Status}}'
$nginxStatus = docker ps --filter "name=school-nginx" --format '{{.Status}}'

Write-Host "`nDeployment Summary:" -ForegroundColor Green
Write-Host "-------------------" -ForegroundColor Green
Write-Host "Backend: $backendStatus" -ForegroundColor $(if ($backendStatus) { 'Green' } else { 'Red' })
Write-Host "MongoDB: $dbStatus" -ForegroundColor $(if ($dbStatus) { 'Green' } else { 'Red' })
Write-Host "Nginx:   $nginxStatus" -ForegroundColor $(if ($nginxStatus) { 'Green' } else { 'Red' })

Write-Host "`nApplication should be available at http://localhost" -ForegroundColor Cyan
Write-Host "Admin interface: http://localhost/admin" -ForegroundColor Cyan
Write-Host "API Documentation: http://localhost/api/docs" -ForegroundColor Cyan

Write-Host "`nTo view logs, run: docker-compose logs -f" -ForegroundColor Yellow
Write-Host "To stop the application: docker-compose down" -ForegroundColor Yellow
