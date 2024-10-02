## Group 39's Food App

To setup this project, first ensure you have `python`, `node`, `npm`, and `npx` installed and in your PATH.

First, cd into backend and create a new virtual environment and install all the requirements in `requirements.txt`. The command for this is `python -m venv ./venv`. To activate the environement, run `source ./venv/bin/activate` if you are on macOS of Linux or `.\venv\Scripts\actiavte` if you are on Windows. To install the requirements, run `pip install -r requirements.txt`.

Second, cd out of backend and then into frontend and run `npm install`. Once this command finishes, a new directory called `node_modules` should appear. This is the equivalent of `venv` for javascript and typescript

To run the project, you MUST ALWAYS follow these steps:

1. The very first thing you must do is cd into frontend and run `npm run build`. This command generates staticfiles which are used by Django. If you don't run this command, the UI will not work as intended.

2. Next, cd out of frontend and into backend and then you can run `python manage.py runserver`.

3. If you make any changes AT ALL to the frontend, to see these changes reflect on the website, you must re-run `npm run build` in the frontend directory. It DOES NOT matter if the Django server is already running. Live reload DOES NOT work! Every time you make a change to the frontend, you must re-compile the staticfiles to be used by Django.

REVISION 2
To setup this project, first ensure you have python, node, npm, and npx installed and in your PATH.

First, cd into backend with cd backend and create a new virtual environment and install the requirements in requirements.txt. To do this, run python -m venv ./venv. To activate the environment if you are on MacOS or Linux, run source ./venv/bin/activate. If you are on Windows, run .\venv\Scripts\activate instead.

Second, run pip install -r requirements.txt to install all of the required packages in requirements.txt.

Third, cd out of backend with cd .. and then into frontend with cd frontend and run npm install. Once this command finishes, a new directory called node_modules should appear. This is the equivalent of venv for javascript and typescript.

To run the project, you MUST ALWAYS follow these steps:

The very first thing you must do is cd into frontend and run npm run build.This command generates staticfiles which are used by Django. If you don't run this command, the UI will not work as intended.

Next, cd out of frontend with cd .. and into backend with cd backend and then you can run python manage.py runserver.

If you make any changes AT ALL to the frontend, to see these changes reflect on the website, you must re-run npm run build in the frontend directory. It DOES NOT matter if the Django server is already running. Live reload DOES NOT work! Every time you make a change to the frontend, you must re-compile the staticfiles to be used by Django.