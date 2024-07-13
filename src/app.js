// src/app.js

import { Auth, getUser } from './auth';

import { getUserFragments, postUserFragment } from './api';

async function init() {
  // Get our UI elements
  const userSection = document.querySelector('#user');
  const loginBtn = document.querySelector('#login');
  const logoutBtn = document.querySelector('#logout');

  // Wire up event handlers to deal with login and logout.
  loginBtn.onclick = () => {
    // Sign-in via the Amazon Cognito Hosted UI (requires redirects), see:
    // https://docs.amplify.aws/lib/auth/advanced/q/platform/js/#identity-pool-federation
    Auth.federatedSignIn();
  };
  logoutBtn.onclick = () => {
    // Sign-out of the Amazon Cognito Hosted UI (requires redirects), see:
    // https://docs.amplify.aws/lib/auth/emailpassword/q/platform/js/#sign-out
    Auth.signOut();
  };

  // See if we're signed in (i.e., we'll have a `user` object)
  const user = await getUser();
  if (!user) {
    // Disable the Logout button
    logoutBtn.disabled = true;
    return;
  }

  // Log the user info for debugging purposes
  console.log({ user });

  // Update the UI to welcome the user
  userSection.hidden = false;

  // Show the user's username
  userSection.querySelector('.username').innerText = user.username;

  // Disable the Login button
  loginBtn.disabled = true;


  //Form Inputs
  const fragmentText = document.getElementById("fragmentText");
  const fragmentFile = document.getElementById("fragmentFile");
  const inputType = document.getElementById("inputType");
  const textContentType = document.getElementById("textContentType");

  fragmentFile.disabled = true;
  fragmentFile.style.visibility = "hidden";
  
  inputType.addEventListener("change", function (e) {
    
    if (inputType.checked) {
      fragmentText.disabled =true;
      fragmentText.style.display = "none";
      textContentType.style.display = "none";
      fragmentFile.disabled = false;
      fragmentFile.style.visibility = "visible";
    } else {
      fragmentText.disabled = false;
      fragmentText.style.display = "block";
      textContentType.style.display = "block";
      fragmentFile.disabled = true;
      fragmentFile.style.visibility = "hidden";
    }
  });

  

  // Display the user's fragments
  displayFragments(user);


  document.getElementById("myForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const fragmentText = document.getElementById("fragmentText");
    const fragmentFile = document.getElementById("fragmentFile").files[0];

    const fragmentValue = inputType.checked ? fragmentFile : fragmentText.value;

    let contentType = "";
    console.log("fragmentValue::"+fragmentValue)

    if (inputType.checked) {
      const fileName = fragmentFile.name.toLowerCase();
      if (fileName.endsWith('.md')) {
          contentType = 'text/markdown';
      } else if (fileName.endsWith('.txt')) {
          contentType = 'text/plain';
      } else if (fileName.endsWith('.csv')) {
          contentType = 'text/csv';
      } else if (fileName.endsWith('.json')) {
          contentType = 'application/json';
      } else if (fileName.endsWith('.html')) {
          contentType = 'text/html';
      } else {
          contentType = fragmentFile.type;
      }
  } else {
      contentType = textContentType.value; 
  }

    const res = await postUserFragment(user, fragmentValue, contentType);
    
    console.log("res::"+res.status)

    if (res.status == "ok") {
      console.log("Fragment posted successfully")
      //refresh
      displayFragments(user);
      //set fragment to blank again
      fragmentText.value = "";
    } else {
      console.log("Error posting fragment");
    }


  });


  
}

async function displayFragments(user) {
  // Do an authenticated request to the fragments API server and log the result
  const userFragments = await getUserFragments(user);

  const yourFragments = document.getElementById("yourFragments");
  yourFragments.innerHTML = "";
  
  if(userFragments.fragments.length === 0){
    const notFound = document.createElement("p");
    notFound.innerText = "No fragments found";
    yourFragments.appendChild(notFound);
  }
  else{
    for (const fragment of userFragments.fragments) {
      const fragmentElement = document.createElement("pre");
      fragmentElement.style.marginBottom = "5px";
      fragmentElement.innerText = JSON.stringify(fragment, undefined, 2);
      yourFragments.appendChild(fragmentElement);
    }
  }
}

// Wait for the DOM to be ready, then start the app
addEventListener('DOMContentLoaded', init);