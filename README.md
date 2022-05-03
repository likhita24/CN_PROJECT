# CN_PROJECT

**Git clone:** git clone git@github.com:likhita24/CN_PROJECT.git

Next, run the XAMPP server and then create a database with name "db_cfss". After creating the database, import "cfss.sql" file from the cloned repositoryin the "db_cfss" database. 


To run the CFSS web application:

**1. cd cfss**

**2. Creating virtual environments**

        py -3 -m venv .venv
        .venv\scripts\activate

**3. Installing packages:**

        pip install django
        pip install pymysql
 
**4. Run "python manage.py runserver"**

**5. Go to the  http://127.0.0.1:8000/ and see the working of the application.**
