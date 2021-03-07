"use strict";

let testingUrl = "https://www.artstation.com/users/lemonhunter/likes.json";
let testingName = "lemonhunter";
function getStorage(key) {
  return new Promise(function (resolve, reject) {
    chrome.storage.local.get(key, function (result) {
      console.log("v Result received from storage v");
      console.log(result[key]);
      resolve(result[key]);
    });
  });
}
function setStorage(key, value) {
  return new Promise(function (resolve, reject) {
    chrome.storage.local.set({ [key]: value }, function () {
      console.log("Key:");
      console.log(key);
      console.log("Set to:");
      console.log(value);
      resolve();
    });
  });
}
async function fetchJson(url) {
  const RESPONSE = await fetch(url);
  if (RESPONSE.ok) {
    console.log("Json fetching succesfull.");
    let respJson = RESPONSE.json();
    console.log(respJson);
    return respJson;
    // if (
    //   Object.keys(respJson["PromiseResult"]).length === 0 &&
    //   respJson["PromiseResult"].constructor === Object
    // ) {
    //   return null;
    // } else {
    //   return respJson;
    // }
  } else {
    const MESSAGE = "An error has occured:" + RESPONSE.status;
    throw MESSAGE;
  }
}
async function updateJson(url) {
  // const userUrl = await getStorage("userUrl");
  const USERJSON = await fetchJson(url);
  await setStorage("json", USERJSON);
  console.log("JSON Updated");
}
async function getRandomArtwork() {
  console.log("Random artwork function activated");
  const RESULT = await getStorage(["json"]);
  let randInt = Math.floor(Math.random() * RESULT["data"].length);
  return RESULT["data"][randInt];
}
async function init() {
  console.log("Init func activated");
  let userUrl = await getStorage("userUrl");
  if (userUrl == undefined) {
    document.getElementById("usernameForm").style.opacity = "100";
    document.getElementById("formContainer").style.pointerEvents = "auto";
    document.getElementById("sister").style.pointerEvents = "none";
    document.getElementById("brother").style.pointerEvents = "none";
    // SET FORM VISIBILITY TO 100 IF userURL not found.
    console.log("User url not found");
  } else {
    console.log("User found.");
    updateJson(userUrl);
    setElements();
  }
}
async function setElements() {
  console.log("Set elements function activated.");
  let artworkObj = await getRandomArtwork();
  let bgUrl = bgUrlMaker(artworkObj.cover.small_square_url);
  let artistName = artworkObj.user.username;
  let artworkTitle = artworkObj.title;
  let artworkLink = artworkObj.permalink;
  console.log(artworkTitle, artistName, bgUrl);
  document.getElementById("artworkLink").href = artworkLink;
  document.getElementById("artworkLink").innerText =
    artworkTitle + " \n  " + artistName;
  document.getElementById("blurbg").style.backgroundImage =
    "url(" + bgUrl + ")";
  document.getElementById("bg").style.backgroundImage = "url(" + bgUrl + ")";
  document.getElementById("changeUser").style.opacity = "100";
  let userUrl = await getStorage("userUrl");
  let userName = userUrl.replace("https://www.artstation.com/users/", "");
  userName = userName.replace("/likes.json", "");
  document.querySelector("#username").placeholder = userName;
  console.log("Set elements function finished.");
}
function bgUrlMaker(url) {
  const linkParts = url.split("/");
  let firstPart = "";
  for (let i = 0; i < 10; i++) {
    firstPart += linkParts[i] + "/";
  }
  let lastPart = "";
  for (let i = linkParts.length; i > linkParts.length - 2; i--) {
    lastPart += linkParts[i];
  }
  lastPart = lastPart.replace("undefined", "");
  let bgUrl = firstPart + "large/" + lastPart;
  return bgUrl;
}
function createUrl(username) {
  let userUrl = "https://www.artstation.com/users/";
  userUrl += username;
  userUrl += "/likes.json";
  console.log("User url created: " + userUrl);
  return userUrl;
}
init();

window.onload = function () {
  document
    .getElementById("formButton")
    .addEventListener("click", async function getUsername() {
      let username = document.getElementById("username").value;
      if (username == "") {
        alert("Please enter a username");
      } else {
        // console.log(username);
        let userUrl = createUrl(username);
        let fetchedJson = await fetchJson(userUrl);
        console.log(fetchedJson);
        if (fetchedJson["data"].length == 0) {
          alert("User not found or has no likes!");
        } else {
          console.log("User Found.");
          document.getElementById("usernameForm").style.opacity = "0";
          await setStorage("userUrl", userUrl);
          await updateJson(userUrl);
          await setElements();
          document.getElementById("usernameForm").style.opacity = "0";
          document.getElementById("bg").style.opacity = "100";
          document.getElementById("formContainer").style.pointerEvents = "none";
          document.getElementById("sister").style.pointerEvents = "auto";
          document.getElementById("brother").style.pointerEvents = "auto";
          // location.reload();
          //hide form
        }
      }
    });
  document
    .getElementById("changeUser")
    .addEventListener("click", function changeUserButton() {
      console.log("Change user button pressed!");
      document.getElementById("usernameForm").style.opacity = "100";
      document.getElementById("usernameForm").style.transitionDuration = "1s";
      console.log("Username form set to 100 opacity!");

      document.getElementById("bg").style.opacity = "0";
      document.getElementById("bg").style.transitionDuration = "1s";
      document.getElementById("cancelButton").disabled = false;
      document.getElementById("cancelButton").style.opacity = 100;
      document.getElementById("cancelButton").style.cursor = "pointer";
      document.getElementById("formContainer").style.pointerEvents = "auto";
      // document.getElementById("brother").style.transitionDuration = "0s";
      // document.getElementById("brother").style.visibility = "hidden";
      document.getElementById("sister").style.pointerEvents = "none";
      document.getElementById("brother").style.pointerEvents = "none";
    });
  document
    .getElementById("cancelButton")
    .addEventListener("click", function cancelChange() {
      document.getElementById("usernameForm").style.opacity = "0";
      document.getElementById("bg").style.opacity = "100";
      document.getElementById("formContainer").style.pointerEvents = "none";
      document.getElementById("sister").style.pointerEvents = "auto";
      document.getElementById("brother").style.pointerEvents = "auto";
    });
  document
    .getElementById("refreshButton")
    .addEventListener("click", function refresh() {
      setElements();
    });
};
