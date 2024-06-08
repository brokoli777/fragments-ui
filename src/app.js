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

  // Do an authenticated request to the fragments API server and log the result
  const userFragments = await getUserFragments(user);

  const yourFragments = document.getElementById("yourFragments");

  //console.log(userFragments.fragments)

  if(userFragments.fragments.length === 0){
    const notFound = document.createElement("p");
    notFound.innerText = "No fragments found";
    yourFragments.appendChild(notFound);
  }
  else{
    for (const fragment of userFragments.fragments) {
      const fragmentElement = document.createElement("li");
      fragmentElement.innerText = fragment;
      yourFragments.appendChild(fragmentElement);
    }
  }

  // for (const fragment of userFragments) {
  //   console.log(fragment);
  // }


  document.getElementById("myForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const fragmentText = document.getElementById("fragmentText");

    const res = await postUserFragment(user, fragmentText.value);
    console.log("res::"+res.status)

    if (res.status == "ok") {
      console.log("Fragment posted successfully");
      //set fragment to blank again
      fragmentText.value = "";
    } else {
      console.log("Error posting fragment");
    }


  });

  // TODO: later in the course, we will show all the user's fragments in the HTML...

}

// Wait for the DOM to be ready, then start the app
addEventListener('DOMContentLoaded', init);