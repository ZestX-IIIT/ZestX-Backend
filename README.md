# ZestX-Backend

Hosted Link : http://zestx.netlify.app/

ZestX Frontend Repository: https://github.com/ZestX-IIIT/ZestX


## Overview

ZestX for the webkirti : We have made for a month-long fest website with various events. Our website has two modes: visitors and admin.

Visitors can register for the various events taking place. For that, they first require to register. A verification mail will be sent to the user. Once verified, the user can explore the website and the events going on. The visitor’s dashboard would contain their details and the list of events they are registered in, and the past event they participated in before. The user can change his details as well. For that, he needs to provide the password. Users can even change their email address and a new verification mail would e sent to the new mail address. The user also has access to change the password. Finally, a log-out button for the user.

Next comes the admin mode. Admin log-in credentials are directly linked to the database. Admin would log in and would be redirected to the admin page where admin can manage the users. All the events would be displayed on the admin page, including the user registered for the same. Admin can add more external users to a particular event and can remove anyone from any event. In short, it has direct access to the database.


## Features

### Security Features
<ol>
<li>Our website is more focused on security, and for that, we will be sending a verification mail to the visitor. Visitors can register only when the verification gets completed.
</li>
<li>Later, if the user tries to change the mail, a verification mail would be sent to the visitor’s new mail address.
</li>
<li>Similarly, we send a mail if a visitor forgets the password. There too, we send a link for the new webpage where users can change their passwords.
</li>
<li>Passwords too have constraints, which is, it’s mandatory to add one lowercase letter, one uppercase letter, one digit, one unique character with a minimum length of six characters.
</li>
<li>Redirection is also an essential factor in our website. If a visitor tries to open the main admin page, he would be automatically redirected to the homepage. Similar redirection is on the sign-in page, where the web page is opened according to the login credentials. Other necessary redirections too are added.
</li>
<li>We haven’t used any passwords in our code. We tried to keep our security intact.</li>


</ol>

### Utilization Features
<ol>
<li>Our pages are fully responsive for all the devices to add the functionality of opening our website on any device.
</li>
<li>We have done DOM manipulation and tried to open all the pages of the homepage without refreshing the page. 
</li>
<li>Visitors can go through all the events, get all the information about the event by clicking the posters, and register. </li>
<li>Users can change their personal information, including the password.
</li>
<li>Admin can add/remove any user from any event, and admin credentials are directly linked to the database.
</li>
<li>We have added some incredible animations and UI enhancing features to our website, like a scrollable progress bar.
</li>

</ol>


## Authors

- [Akash Gupta](https://github.com/akashgupta1909)
- [Harshil Mendpara](https://github.com/HarshilMendpara)
- [Raj Varsani](https://github.com/RajVarsani)