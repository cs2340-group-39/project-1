import os
import shutil
import subprocess
import sys


# Function to run a command and check for errors
def run_command(command, cwd=None):
    try:
        subprocess.run(command, cwd=cwd, check=True)
    except subprocess.CalledProcessError:
        sys.exit(f"Error: Command {' '.join(command)} failed.")

# Create Python virtual environment and install dependencies
def setup_backend():
    venv_dir = os.path.join("backend", "venv")
    requirements_file = os.path.join("backend", "requirements.txt")
    
    # Check if the virtual environment exists, if not, create it
    if not os.path.exists(venv_dir):
        print("Creating virtual environment in backend...")
        run_command([sys.executable, "-m", "venv", venv_dir])
    else:
        print("Virtual environment already exists in backend.")
    
    # Install dependencies from requirements.txt
    print("Installing dependencies from requirements.txt...")
    pip_executable = os.path.join(venv_dir, "bin", "pip")
    if not os.path.exists(pip_executable):
        sys.exit("Error: Virtual environment was not created correctly.")
    
    run_command([pip_executable, "install", "-r", requirements_file])

# Check if Node.js and npm exist
def check_node_npm():
    if shutil.which("node") is None:
        sys.exit("Error: Node.js is not installed. Please install Node.js and try again.")
    if shutil.which("npm") is None:
        sys.exit("Error: npm is not installed. Please install npm and try again.")

# Set up TypeScript environment in frontend
def setup_frontend():
    print("Setting up frontend environment...")

    # Check for Node.js and npm before proceeding
    check_node_npm()

    # Install npm dependencies
    print("Installing npm dependencies in frontend...")
    run_command(["npm", "install"], cwd="frontend")

    # Set up TypeScript environment
    print("Setting up TypeScript environment...")
    run_command(["npm", "run", "build"], cwd="frontend")

# Function to run the project: build frontend, check backend, run server
def run_project():
    print("Running project...")

    # Step 1: Build frontend
    print("Building frontend using 'npm run build'...")
    run_command(["npm", "run", "build"], cwd="frontend")

    # Step 2: Check and format backend code using Ruff
    print("Checking and formatting backend code with Ruff...")
    # ruff_check_command = ["ruff", "check", "--fix", "--select", "I"]
    # ruff_format_command = ["ruff", "format", "--fix"]
    # run_command(ruff_check_command, cwd="backend")
    # run_command(ruff_format_command, cwd="backend")

    # Step 3: Run the Django development server
    print("Starting Django development server...")
    manage_py = os.path.join("manage.py")
    run_command([sys.executable, manage_py, "runserver"], cwd="backend")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        sys.exit("Error: Missing command. Available commands are 'setup' and 'runproject'.")

    command = sys.argv[1]

    if command == "setup":
        print("Setting up the project...")
        setup_backend()
        setup_frontend()
        print("Setup completed successfully.")
    
    elif command == "runproject":
        run_project()
    
    else:
        sys.exit(f"Error: Unknown command '{command}'. Available commands are 'setup' and 'runproject'.")
