// get our buttons
const help = document.getElementById("help-button");
const menu = document.getElementById("menu-button");

// get our modals
const helpModal = document.getElementById("helpModal");
const errorModal = document.getElementById("errorModal");

// functions called on clicks
const showHelp = () => {
    helpModal.showModal();
};

// add Event listeners
help.addEventListener('click', showHelp);

// close dialogs when 'x' button is clicked
const closeDialog = () => {
    document.querySelectorAll('dialog').forEach(dialog => {
        dialog.close();
    });
};

// SideNav
/* Set the width of the side navigation to 250px */
function openNav() {
    document.getElementById("mySidenav").style.width = "250px";
    document.getElementById("mySidenav").style.visibility = "visible";
    lastFocusedInput.focus();
  }
  
function closeNav() {
document.getElementById("mySidenav").style.width = "0";
document.getElementById("mySidenav").style.visibility = "hidden";
lastFocusedInput.focus();
}

// Sidenav functions
const menu_flip = document.querySelector(".flip-card-inner"); 
const menu_content = document.querySelector(".flip-card-back");
//const logged_in = document.querySelector(".logged_in");

// login and session related vars
let login_status = false;
let user_id = "";

// Sidenav forms ( register & login )
async function menuFormHandler(menu_event){
    menu_event.preventDefault(); // we don't want a page reload - let the JS do it's work.
    const form = menu_event.target.closest('form');
    const formData = new FormData(form);
    const formAction = new URL(form.action); // we use this to strip the path from the form.action attribute
    const data = await submitForm(formData, formAction.pathname.toString());

    if (data) {
        console.log(data.message);
        menu_content.innerHTML = 
        `<div class="menu-form"><h1>${data.message}</h1><br>
        <button class="reset-button" onclick="flip()">Close</button></div>`;

        // if the payload comes back with the key 'logged_in' we register that the user has logged in
        if (data.logged_in === "true") {
            login_status = true;
            user_id = data.user_id;
            logged_in.innerHTML =`Logged in: ${user_id}`;
        }

    } else {
        console.log("No response from the server");
    }
}
let flipped = false; // this variable can be used to check if we are flipped
function flip() {
    if (menu_flip.style.transform === "rotateY(180deg)") {
        menu_flip.style.transform = "rotateY(0deg)"; // flip it back on re-click
        flipped =  false;
    } else if ( menu_flip.style.transform === "" || menu_flip.style.transform === "rotateY(0deg)") { 
        menu_flip.style.transform = "rotateY(180deg)";
        flipped = true;
    }
    lastFocusedInput.focus();
}

async function handleMenuAction(menuId) {
    let htmlContent;
    switch(menuId) {
        case 'register-menu':
            htmlContent = `
              <div class="menu-form">
              <form action="/register" method="post" onsubmit="menuFormHandler(event);">
              <h1>Register</h1>
              <p>Please fill in this form to create an account.</p>
              <hr>
              <input type="text" placeholder="Enter Email" name="user_id" id="user_id" required> 
              <input type="password" placeholder="Enter Password" name="password" id="password" required>
              <input type="password" placeholder="Repeat Password" name="pass_conf" id="pass_conf" required>
              <br>
              <button type="submit" class="reset-button">Register</button>
              <button type="button" class="reset-button" onclick="flip()">Close</button>
              </form>
              </div>`;
            break;

        case 'login-menu':
            htmlContent = `
            <div class="menu-form">
            <form action="/login" method="post" onsubmit="menuFormHandler(event);">
            <h1>Login</h1>
            <p>Please Login.</p>
            <hr>
            <input type="text" placeholder="Enter Email" name="user_id" id="user_id" required> 
            <input type="password" placeholder="Enter Password" name="password" id="password" required>
            <br>
            <button type="submit" class="reset-button">Login</button>
            <button type="button" class="reset-button" onclick="flip()">Close</button>
            </form>
            </div>`;
            break;
        case 'logout-menu':
            htmlContent = `<h1>Logout</h1><br>
            <button type="button" class="reset-button" onclick="logout(); flip()">Logout</button>`;
            break;
        case 'stats-menu':
            htmlContent = await get_stats();
            break;
        default:
            htmlContent = '';
    }
    // only flip if we aren't already
    if (flipped === false){
        flip();
        flipped = true;
    }
    menu_content.innerHTML = htmlContent;
    lastFocusedInput.focus();
}