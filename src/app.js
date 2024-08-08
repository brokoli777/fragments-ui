// src/app.js

import { Auth, getUser } from "./auth";

import {
  getUserFragments,
  postUserFragment,
  updateFragment,
  deleteFragment,
  getFragment,
} from "./api";

async function init() {
  // Get our UI elements
  const userSection = document.querySelector("#user");
  const loginBtn = document.querySelector("#login");
  const logoutBtn = document.querySelector("#logout");

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
  user = await getUser();
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
  userSection.querySelector(".username").innerText = user.username;

  // Disable the Login button
  loginBtn.disabled = true;

  //Form Inputs
  const fragmentText = document.getElementById("fragmentText");
  const fragmentFile = document.getElementById("fragmentFile");
  const inputType = document.getElementById("inputType");
  const textContentType = document.getElementById("textContentType");

  const updateInputType = document.getElementById("updateInputType");
  const updateFragmentId = document.getElementById("updateFragmentID");
  const updateFragmentText = document.getElementById("updateFragmentText");
  const updateFragmentFile = document.getElementById("updateFragmentFile");
  const updateTextContentType = document.getElementById(
    "updateTextContentType"
  );

  fragmentFile.disabled = true;
  fragmentFile.style.visibility = "hidden";

  updateFragmentFile.disabled = true;
  updateFragmentFile.style.visibility = "hidden";

  inputType.addEventListener("change", function (e) {
    if (inputType.checked) {
      fragmentText.disabled = true;
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

  updateInputType.addEventListener("change", function (e) {
    if (updateInputType.checked) {
      updateFragmentText.style.display = "none";
      updateFragmentId.style.display = "none";
      updateTextContentType.style.display = "none";
      updateFragmentFile.style.visibility = "visible";
    } else {
      updateFragmentText.style.display = "block";
      updateFragmentId.style.display = "block";
      updateTextContentType.style.display = "block";
      updateFragmentFile.style.visibility = "hidden";
    }
  });

  // Display the user's fragments
  displayFragments(user);
}

document
  .getElementById("myForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const fragmentText = document.getElementById("fragmentText");
    const fragmentFile = document.getElementById("fragmentFile").files[0];

    const fragmentValue = inputType.checked ? fragmentFile : fragmentText.value;

    let contentType = "";
    console.log("fragmentValue::" + fragmentValue);

    if (inputType.checked) {
      const fileName = fragmentFile.name.toLowerCase();
      if (fileName.endsWith(".md")) {
        contentType = "text/markdown";
      } else if (fileName.endsWith(".txt")) {
        contentType = "text/plain";
      } else if (fileName.endsWith(".csv")) {
        contentType = "text/csv";
      } else if (fileName.endsWith(".json")) {
        contentType = "application/json";
      } else if (fileName.endsWith(".html")) {
        contentType = "text/html";
      } else {
        contentType = fragmentFile.type;
      }
    } else {
      contentType = textContentType.value;
    }

    const res = await postUserFragment(user, fragmentValue, contentType);

    console.log("res::" + res.status);

    if (res && res.status === "ok") {
      console.log("Fragment posted successfully");
      alert("Fragment posted successfully");
      //refresh
      displayFragments(user);
      //set fragment to blank again
      fragmentText.value = "";
    } else {
      console.error("Error posting fragment");
    }
  });

const updateForm = document.getElementById("updateForm");

updateForm.addEventListener("submit", async function (e) {
  e.preventDefault();

  const updateInputType = document.getElementById("updateInputType");
  const updateFragmentId = document.getElementById("updateFragmentID").value;
  const updateFragmentText =
    document.getElementById("updateFragmentText").value;
  const updateFragmentFile =
    document.getElementById("updateFragmentFile").files[0];
  const updateTextContentType = document.getElementById(
    "updateTextContentType"
  );

  console.log("updateFragmentId: " + updateFragmentId);
  console.log("updateFragmentText: " + updateFragmentText);

  const fragmentValue = updateInputType.checked
    ? updateFragmentFile
    : updateFragmentText;

  let contentType = "";
  console.log("fragmentValue::" + fragmentValue);

  //exception for .md files
  if (updateInputType.checked) {
    const fileName = updateFragmentFile.name.toLowerCase();
    if (fileName.endsWith(".md")) {
      contentType = "text/markdown";
    } else {
      contentType = updateFragmentFile.type;
    }
  } else {
    contentType = updateTextContentType.value;
  }

  const res = await updateFragment(
    user,
    updateFragmentId,
    fragmentValue,
    contentType
  );
  if (res.status === "ok") {
    console.log("Fragment updated successfully");
    //refresh
    displayFragments(user);
    fragmentText.value = "";

    alert("Fragment updated successfully");
  } else {
    data = await res.json();
    console.error("Error updating fragment" + data);
    alert("Error updating fragment");
  }
});

const deleteForm = document.getElementById("deleteForm");

deleteForm.addEventListener("submit", async function (e) {
  e.preventDefault();

  const fragmentId = document.getElementById("deleteFragmentID").value;

  const res = await deleteFragment(user, fragmentId);
  if (res && res.status === "ok") {
    console.log("Fragment deleted successfully");
    //refresh
    displayFragments(user);
    //set fragment to blank again
    fragmentText.value = "";

    alert("Fragment deleted successfully");
  } else {
    console.error("Error deleting fragment");
    alert("Error deleting fragment");
  }
});

const getForm = document.getElementById("getForm");

getForm.addEventListener("submit", async function (e) {
  e.preventDefault();

  console.log("getForm");

  const fragmentId = document.getElementById("getFragmentID").value;

  await getFragment(user, fragmentId);

});

async function displayFragments(user) {
  // Do an authenticated request to the fragments API server and log the result
  const userFragments = await getUserFragments(user);

  const yourFragments = document.getElementById("yourFragments");
  yourFragments.innerHTML = "";

  if (userFragments.fragments.length === 0) {
    const notFound = document.createElement("p");
    notFound.innerText = "No fragments found";
    yourFragments.appendChild(notFound);
  } else {
    for (const fragment of userFragments.fragments) {
      const fragmentElement = document.createElement("pre");
      fragmentElement.style.marginBottom = "5px";
      fragmentElement.innerText = JSON.stringify(fragment, undefined, 2);
      yourFragments.appendChild(fragmentElement);
    }
  }
}

// Wait for the DOM to be ready, then start the app
addEventListener("DOMContentLoaded", init);
