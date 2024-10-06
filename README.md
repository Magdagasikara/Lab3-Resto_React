
___
**Restaurant app (3/3), frontend with React.**  
Book a table component for restaurant's customers. Uses DayPicker to choose dates and displays possible and available timeslots depending on opening hours and available places.  
___
  
Part 1, backend with ASP.NET Core Web Api:  
https://github.com/Magdagasikara/Lab1-WebAPI_Db_Resto  
Part 2, frontend with ASP.NET MVC:  
https://github.com/Magdagasikara/Lab2-MVC_Resto_Frontend  


Extras

User form:  
- Once user leaves the email field with a valid value a request is made to backend to check if user is already there.  
- If user exists, the name filed will be automatically filled in.  
- If user exists and changes the name, the name will be updated in the db while making the reservation.  
- If user doesn't exist, the email and name will be saved in the db while making the reservation.  

Available timeslots are created with regard to:  
- Opening hours and visit duration define which timeslots will be shown:  
  - Opening hours are defined as an array of arrays (now [[11,14],[17,23]]) but it could be added to Admin's dashboard and saved in the db.  
  - Visit duration. Only if the whole duration is withing opening hours (both start and end) the timeslot will be shown.  
- Number of guests and today's date and time define which timeslots are choseable (not "turned off" and crossed out):  
  - Only timeslots that have available spaces for the chosen visit duration and number of guests can be chosen for reservation.  
  - If reservation is made for the current day, only timeslots starting 2h ahead can be chosen for reservation.  
Days that have passed or are too far ahead (on month ahead - even this could be added to settings in admin's dashboard) cannot be booked and no timeslots would appear.  
  

Crucial improvements needed....  
- Clean components, break out functions and move them to services or other components...  
  
Possible improvements:   
- Import openingHours and maxSeatsPerBooking from admin's settings and Db instead of defining them in the code  
- Use CreateContext to transfer states between components.  
- Disable ADD before timeslot is chosen.  
- Try adding  Swedish settings in .toLocaleString('sv-SE').  
