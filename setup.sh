#!/bin/bash

# Create or update virtual environment
if [ -d "venv" ]; then
    echo "Virtual environment already exists. Updating packages..."
else
    echo "Creating new virtual environment..."
    python3 -m venv ./venv
fi

# Activate virtual environment
source ./venv/bin/activate

# Upgrade pip
pip3 install --upgrade pip

# Install packages from requirements.txt
pip3 install -r requirements.txt

echo "Virtual environment setup complete. Activating environment..."
chmod +x ./venv/bin/activate
./venv/bin/activate

echo "Changing directory to Django project root..."
cd ./food_app || exit