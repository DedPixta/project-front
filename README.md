# Front-project

Project to practice HTML/CSS/JavaScript skills

## Goals
- HTML - create an html page to display a table with a list of accounts.
- CSS - visualize page. 
- Javascript - generate basic CRUD (create, read, update, delete) operations based on provided api. Validate input data.

![front](https://user-images.githubusercontent.com/101488434/183255362-1f55cb74-cfd2-4405-a95e-9b843cb19af5.PNG)

## To run project

1. Download Tomcat(version 9 - Important) : https://tomcat.apache.org/download-90.cgi.
2. Set up the launch of the application through the Idea: Alt + Shift + F9 -> Edit Configurations… -> Alt + insert -> tom (in the search bar) -> Local.

![image](https://user-images.githubusercontent.com/101488434/183255790-8760aa10-972e-4940-8cfc-c4e212a428e9.png)

- After that, you need to click CONFIGURE and indicate where the archive with Tomcat was downloaded and unpacked.

![image](https://user-images.githubusercontent.com/101488434/183255854-d4cee2fa-33fb-4c37-8ee2-f1bf04160bad.png)

- In the Deployment tab: Alt + insert -> Artifact… -> rpg:war exploded -> OK.
- Leave only / (forward slash) in the Application context: field.

![image](https://user-images.githubusercontent.com/101488434/183255889-d1dc009b-520e-4d25-8e22-57c0610d0a3a.png)

- Click APPLY.
- Close the settings window.

3. Launch the application. To do this: Alt + Shift + F9 -> (config name, I named it 'App') -> Run.
4. After deploying the application, a new tab will open in the browser selected during configuration.
