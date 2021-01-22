"use strict";

let userUrl = "https://www.artstation.com/users/lemonhunter/likes.json";
let userName = "lemonhunter";
let userJson;
let randomArtwork;
async function fetchJson(url) {
  const response = await fetch(url);
  if (response.ok) {
    return await response.json();
  } else {
    const message = `An error has occured: ${response.status}`;
    throw new Error(message);
  }
}
function updateJson(passedJson, userUrl) {
  passedJson = fetchJson(userUrl).then((passedJson) => {
    chrome.storage.local.set({ json: passedJson }, function () {
      chrome.storage.local.get(["json"], function (result) {
        console.log("Json Stored:");
        console.log(result);
      });
    });
  });
}
async function getRandomArtwork() {
  chrome.storage.local.get(["json"], function (result) {
    console.log("Json Retrieved:");
    console.log(result);
    let randInt = Math.floor(Math.random() * result["json"]["data"].length);
    return result["json"]["data"][randInt];
  });
}
