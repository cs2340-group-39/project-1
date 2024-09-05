# Check if the virtual environment directory exists
if (Test-Path "venv") {
    Write-Host "Virtual environment already exists. Updating packages..."
} else {
    Write-Host "Creating new virtual environment..."
    python -m venv .\venv
}

# Activate virtual environment
Write-Host "Activating virtual environment..."
& .\venv\Scripts\Activate.ps1

# Install packages from requirements.txt
pip install -r requirements.txt

Write-Host "Virtual environment setup complete. Activating environment..."
# In PowerShell, you just need to activate the virtual environment with:
& .\venv\Scripts\Activate.ps1

Write-Host "Changing directory to Django project root..."
Set-Location -Path .\food_app
