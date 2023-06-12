// get our buttons
const help = document.getElementById("help-button");
const info = document.getElementById("info-button");
const menu = document.getElementById("menu-button");

// get our modals
const helpModal = document.getElementById("helpModal");
const infoModal = document.getElementById("infoModal");
const errorModal = document.getElementById("errorModal");

// functions called on clicks
const showHelp = () => {
    helpModal.showModal();
}

const showInfo = () => {
    infoModal.showModal();
}


// add Event listeners
help.addEventListener('click', showHelp);
info.addEventListener('click', showInfo);

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

function flip() {
    if (menu_flip.style.transform === "rotateY(180deg)") {
        menu_flip.style.transform = "rotateY(0deg)"; // flip it back on re-click
    } else if ( menu_flip.style.transform === "" || menu_flip.style.transform === "rotateY(0deg)") { 
        menu_flip.style.transform = "rotateY(180deg)";
    }
    lastFocusedInput.focus();
}

function handleMenuAction(menuId) {
    let htmlContent;
    switch(menuId) {
        case 'register-menu':
            htmlContent = `
              <div class="menu-form">
              <form action="/register" method="post">
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
            htmlContent = `<h1>Login</h1>
            <button class="reset-button" onclick="flip()">Close</button>`;
            break;
        case 'logout-menu':
            htmlContent = `<h1>Goodbye</h1>
            <button class="reset-button" onclick="flip()">Close</button>`;
            break;
        case 'stats-menu':
            htmlContent = `<h1>Stats</h1>
            <button class="reset-button" onclick="flip()">Close</button>`;
            break;
        default:
            htmlContent = '';
    }
    flip();
    menu_content.innerHTML = htmlContent;
    lastFocusedInput.focus();
}



