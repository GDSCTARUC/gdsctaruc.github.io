function checkLogin() {
    // Check Login
    firebase.auth().onIdTokenChanged(function(user) {
        if (user) {
            // User is signed in or token was refreshed.
            user_id = user.uid;
            if (user_id !== "qSTmjO7s3zXDFPM7biFKamYLgvc2") {
                window.location.href = "login.html";
            }
        } else {
            window.location.href = "login.html";
        }
    });
}

function checkTime(i) {
    if (i < 10) {
        i = "0" + i;
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
    if (first_name === "") {
        error_prompt[0].innerHTML = "This field is required!";
        error_count++;
    } else if (characters_validation.test(first_name) === false) {
        error_prompt[0].innerHTML = "First Name can only contain characters!";
        error_count++;
    } else {
        error_prompt[0].innerHTML = "";
    }

    // Last Name validation
    if (last_name === "") {
        error_prompt[1].innerHTML = "This field is required!";
        error_count++;
    } else if (characters_validation.test(last_name) === false) {
        error_prompt[1].innerHTML = "Last Name can only contain characters!";
        error_count++;
    } else {
        error_prompt[1].innerHTML = "";
    }


    //Email validation
    if (email === "") {
        error_prompt[2].innerHTML = "This field is required!";
        error_count++;
    } else if (email_validation.test(email) === false) {
        error_prompt[2].innerHTML = "Your email format is invalid!";
        error_count++;
    } else {
        error_prompt[2].innerHTML = "";
    }

    // Message Validation
    if (message === "") {
        error_prompt[3].innerHTML = "This field is required!";
        error_count++;
    } else {
        error_prompt[3].innerHTML = "";
    }

    // Insert valid data
    if (error_count === 0) {
        // Prevent Spam
        if (!checkMessageCookie()) {
            // Display loader
            loader.style.display = "";

            // Get current date
            var Today = new Date();

            //date 
            var dt = Today.getDate();
            var mth = Today.getMonth() + 1;
            var yr = Today.getFullYear();

            //hour
            var hour = Today.getHours();
            var minute = Today.getMinutes();
            var second = Today.getSeconds();

            dt = checkTime(dt);
            mth = checkTime(mth);
            minute = checkTime(minute);
            second = checkTime(second);

            date = dt + "-" + mth + "-" + yr + ", " + hour + ":" + minute + ":" + second;

            firebase.database().ref("contact_details/").push({
                Date: date,
                FirstName: first_name,
                LastName: last_name,
                Email: email,
                Message: message
            });

            // Set Cookies
            setMessageCookie("dsc-contact", "sent", 1);

            $.ajax({
                url: "https://formsubmit.co/ajax/gdsc.taruc@gmail.com",
                method: "POST",
                data: {
                    First_Name: first_name ,
                    Last_Name : last_name,
                    Email : email,
                    Message: message
                },
                dataType: "json"
            }).then(()=>{
                console.log("Form successfully submitted")
            }).catch((error)=>{
                console.log("Error during form submission: " + error)
            });

            alert("Form submitted we will approach you shortly!");

            // Remove loader
            loader.style.display = "none";
        } else {
            alert("Form submitted we will approach you shortly!");
        }

    }


}

function login() {
    email = document.getElementById("email").value;
    password = document.getElementById("password").value;
    error_prompt = document.getElementById("error-prompt");
    login_loader = document.getElementById("login-loader");

    // Show the loader
    login_loader.style.display = "";

    // Clear the error message
    error_prompt.innerHTML = "";

    if (email === "" || password === "") {
        // Remove the loader
        login_loader.style.display = "none";

        // Display error
        error_prompt.innerHTML = "Please fill up all the columns!";
    } else {
        firebase.auth().signInWithEmailAndPassword(email, password)
            .then((user) => {

                firebase.auth().onIdTokenChanged(function(user) {

                    if (user.uid === "qSTmjO7s3zXDFPM7biFKamYLgvc2") {
                        // Signed in 
                        window.location.href = "backstage.html";
                    } else {
                        // Display error
                        error_prompt.innerHTML = "Invalid username or password!";

                        // Remove the loader
                        login_loader.style.display = "none";
                    }
                });

            })
            .catch((error) => {

                // Remove the loader
                login_loader.style.display = "none";

                // var errorCode = error.code;
                // var errorMessage = error.message;

                // console.log(errorCode)

                // Display error
                error_prompt.innerHTML = "Invalid username or password!";
            });
    }

}


// Navbar functions
function scrollTrigger(id) {
    try {
        var elementPosition = document.getElementById(id).offsetTop;
        window.scrollTo({
            top: parseInt(elementPosition) - 50, //add your necessary value
            behavior: "smooth" //Smooth transition to roll
        });
    } catch (ex) {
        const redirectIndex = "/index.html";
        const redirectEvent = "/events.html";
        switch (id) {
            case "home":
            case "about-us":
            case "our-team":
                window.location.replace(redirectIndex + "#" + id);
                break;
            case "past-events":
            case "dsc-upcoming-events":
                window.location.replace(redirectEvent + "#" + id);
                break;
        }
    }
}

function enterSignIn() {
    if (event.keyCode === 13) {
        event.preventDefault();
        login();
    }
}

function logout() {
    firebase.auth().signOut();
}

function setMessageCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for (var i = 0; i < ca.length; i++) {
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

    var user = getCookie("dsc-contact");

    if (user != "") {
        return true;
    } else {
        return false
    }
}

function dateFormatter(timestamp){
    const date = new Date(timestamp);

    return date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear() + ", " + checkTime(date.getHours()) + ":" + checkTime(date.getMinutes());
}

function websiteLoading(){
    var loading_modal = document.getElementById("modal-loading");

    //Remove loading gif after 5 seconds
    setTimeout(function(){
        loading_modal.style.display = "none";
    }, 4000);

}

function getEventType(type){
    if(type == 1){
        return "Workshop";
    }
    else if(type == 2){
        return "Talk";
    }
    else{
        return "Event";
    }
}