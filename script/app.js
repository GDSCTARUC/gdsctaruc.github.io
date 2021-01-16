function checkLogin()
{
    // Check Login
    firebase.auth().onIdTokenChanged(function(user) {
        if (user) {
            // User is signed in or token was refreshed.
            user_id = user.uid;
            if(user_id !== "qSTmjO7s3zXDFPM7biFKamYLgvc2")
            {
                window.location.href="login.html";
            }
        }
        else
        {
            window.location.href= "login.html";
        }
    });
}

function checkTime(i)
{
	if(i<10)
	{
		i="0"+i;
	}
	
	return i;
}


function formSubmit() {

    var first_name = $("#first_name").val();
    var last_name = $("#last_name").val();
    var email = $("#email").val();
    var message = $("#message").val();
    var error_prompt = document.getElementsByClassName("error-prompt");
    var error_count = 0;
    var loader = document.getElementById("sending-loader");

    // Regex format
    var characters_validation = /^[ A-Za-z]+$/;
    var email_validation = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

    // Input validation

    // First name validation
    if(first_name === "")
    {
        error_prompt[0].innerHTML = "This field is required!";
        error_count++;
    }
    else if(characters_validation.test(first_name) === false)
    {
        error_prompt[0].innerHTML = "First Name can only contain characters!";
        error_count++;
    }  
    else
    {
        error_prompt[0].innerHTML = "";
    }

    // Last Name validation
    if(last_name === "")
    {
        error_prompt[1].innerHTML = "This field is required!";
        error_count++;
    }
    else if(characters_validation.test(last_name) === false)
    {
        error_prompt[1].innerHTML = "Last Name can only contain characters!";
        error_count++;
    }  
    else
    {
        error_prompt[1].innerHTML = "";
    }   


    //Email validation
    if(email === "")
    {
        error_prompt[2].innerHTML = "This field is required!";
        error_count++;
    }
    else if(email_validation.test(email) === false)
    {
        error_prompt[2].innerHTML = "Your email format is invalid!";
        error_count++;
    }  
    else
    {
        error_prompt[2].innerHTML = "";
    }

    // Message Validation
    if(message === "")
    {
        error_prompt[3].innerHTML = "This field is required!";
        error_count++;
    }
    else
    {
        error_prompt[3].innerHTML = "";
    }

    // Insert valid data
    if(error_count === 0)
    {
        // Prevent Spam
        if(!checkMessageCookie())
        {
            // Display loader
            loader.style.display = "";

            // Get current date
            var Today= new Date();

            //date 
            var dt = Today.getDate();
            var mth = Today.getMonth()+1;
            var yr= Today.getFullYear();
            
            //hour
            var hour = Today.getHours();
            var minute= Today.getMinutes();
            var second = Today.getSeconds();
            
            dt = checkTime(dt);
            mth = checkTime(mth);
            minute=checkTime(minute);
            second=checkTime(second);
            
            date = dt + "-" + mth + "-" + yr + ", " + hour + ":" + minute + ":" + second;
            
            firebase.database().ref("contact_details/").push({
                Date : date,
                FirstName : first_name,
                LastName : last_name,
                Email : email,
                Message: message
            });

            // Set Cookies
            setMessageCookie("send-message", "sent", 1);

            alert("Form submitted we will approach you shortly!");

            // Remove loader
            loader.style.display = "none";
        }
        else
        {
            alert("Form submitted we will approach you shortly!");
        }
        
    }
    

}

function login()
{
    email = document.getElementById("email").value;
    password = document.getElementById("password").value;
    error_prompt = document.getElementById("error-prompt");

    if(email === "" || password === "")
    {
        // Display error
        error_prompt.innerHTML = "Please fill up all the columns!";
    }
    else
    {
        firebase.auth().signInWithEmailAndPassword(email, password)
        .then((user) => {
            // Signed in 
            window.location.href = "backstage.html";
        })
        .catch((error) => {
            var errorCode = error.code;
            var errorMessage = error.message;

            // Display error
            error_prompt.innerHTML = errorMessage;
        });
    }
    
}


// Navbar functions
function scrollTrigger(id) {
    var elementPosition = document.getElementById(id).offsetTop;

    window.scrollTo({
        top: parseInt(elementPosition) - 50, //add your necessary value
        behavior: "smooth"  //Smooth transition to roll
    });
}

function enterSignIn()
{
    if (event.keyCode === 13) {
        event.preventDefault();
        login();
    }
}

function displayRecord()
{
    record_container = document.getElementById("record-body");
    record_count = 0;
    loader = document.getElementById("loader");

    // Retrieve Data from the database
    firebase.database().ref("contact_details").once("value", function(snapshot){
        snapshot.forEach(function(childSnapshot){
            
            // Print record
            record_container.innerHTML = record_container.innerHTML +
            "<tr>" +
                "<td>" + childSnapshot.val().Date + "</td>" +
                "<td>" + childSnapshot.val().FirstName + "</td>" +
                "<td>" + childSnapshot.val().LastName + "</td>" +
                "<td>" + childSnapshot.val().Email + "</td>" +
                "<td>" + childSnapshot.val().Message + "</td>" +       
            "</tr>";

            // Add record count
            record_count++;
        });
    }).then(function(){

        if(record_count === 0)
        {
            // Remove loader
            document.getElementById("loader").style.display = "none";

            // Display No Record Message
            record_container.innerHTML = record_container.innerHTML +
            "<tr>" +
                "<td class='text-danger'>No Record Found!</td>" +
                "<td></td>" +
                "<td></td>" +
                "<td></td>" +
                "<td></td>" +       
            "</tr>";
        }
        else
        {
            // Remove loader
            document.getElementById("loader").style.display = "none";
        }
    });
}

function logout()
{
    firebase.auth().signOut();
}

function setMessageCookie(cname, cvalue, exdays)
{
  var d = new Date();
  d.setTime(d.getTime() + (exdays*24*60*60*1000));
  var expires = "expires="+ d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for(var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

function checkMessageCookie() {

  var user = getCookie("send-message");

  if (user != "") {
    return true;
  } 
  else 
  {
    return false
  }
}
