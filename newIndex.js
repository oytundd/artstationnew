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
    return RESPONSE.json();
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
// Max number of likes pages to fetch, so big accounts don't make refreshes slow.
const MAX_PAGES = 10;
async function fetchAllLikes(url) {
  const seen = new Set();
  const all = [];
  for (let page = 1; page <= MAX_PAGES; page++) {
    let pageJson;
    try {
      pageJson = await fetchJson(url + "?page=" + page);
    } catch (err) {
      // Failing on the first page is a real error; later pages just end the list.
      if (page === 1) throw err;
      console.error(err);
      break;
    }
    const items = (pageJson && pageJson.data) || [];
    // Stop on an empty page, or if the server ignored ?page and repeated itself.
    const fresh = items.filter((item) => !seen.has(item.id));
    if (fresh.length === 0) break;
    fresh.forEach((item) => seen.add(item.id));
    all.push(...fresh);
  }
  return { data: all };
}
async function updateJson(url) {
  const USERJSON = await fetchAllLikes(url);
  await setStorage("json", USERJSON);
  console.log("JSON Updated");
}
async function getRandomArtwork() {
  console.log("Random artwork function activated");
  const RESULT = await getStorage("json");
  if (!RESULT || !RESULT.data || RESULT.data.length === 0) {
    throw new Error("No liked artworks found in storage");
  }
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
    try {
      const cached = await getStorage("json");
      if (cached && cached.data && cached.data.length > 0) {
        // Show the cached likes right away and refresh them in the background.
        setElements();
        updateJson(userUrl).catch(console.error);
      } else {
        // Nothing usable cached yet: must fetch before we can render.
        await updateJson(userUrl);
        await setElements();
      }
    } catch (err) {
      console.error(err);
    }
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
  const titleEl = document.createElement("span");
  titleEl.className = "artTitle";
  titleEl.textContent = artworkTitle;
  const artistEl = document.createElement("span");
  artistEl.className = "artArtist";
  artistEl.textContent = artistName;
  document.getElementById("artworkLink").replaceChildren(titleEl, artistEl);
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
  return url.replace("/small_square/", "/large/");
}
function createUrl(username) {
  let userUrl = "https://www.artstation.com/users/";
  userUrl += encodeURIComponent(username);
  userUrl += "/likes.json";
  console.log("User url created: " + userUrl);
  return userUrl;
}
init();

window.onload = function () {
  // Pressing Enter in the username box would otherwise submit (reload) the form.
  document.getElementById("usernameForm").addEventListener("submit", (e) => {
    e.preventDefault();
    document.getElementById("formButton").click();
  });
  document
    .getElementById("formButton")
    .addEventListener("click", async function getUsername() {
      let username = document.getElementById("username").value.trim();
      if (username == "") {
        alert("Please enter a username");
      } else {
        let userUrl = createUrl(username);
        let fetchedJson;
        try {
          fetchedJson = await fetchJson(userUrl);
        } catch (err) {
          console.error(err);
          alert("User not found or ArtStation could not be reached!");
          return;
        }
        if (!fetchedJson || !fetchedJson.data || fetchedJson.data.length == 0) {
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
