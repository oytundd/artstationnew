"use strict";

let userUrl = "https://www.artstation.com/users/lemonhunter/likes.json";
let userName = "lemonhunter";
function getStorage(key) {
  //tested
  return new Promise(function (resolve, reject) {
    chrome.storage.local.get(["key"], function (result) {
      console.log("v Result received from storage v");
      console.log(result.key);
      resolve(result);
    });
  });
}
function setStorage(key, value) {
  return new Promise(function (resolve, reject) {
    chrome.storage.local.set({ key: value }, function () {
      console.log("v Storage set v");
      console.log(key, value);
      resolve();
    });
  });
}
async function fetchJson(url) {
  const RESPONSE = await fetch(url);
  if (RESPONSE.ok) {
    return RESPONSE.json();
  } else {
    const MESSAGE = "An error has occured:" + response.status;
    throw MESSAGE;
  }
}
async function updateJson(url) {
  const USERJSON = await fetchJson(url);
  await setStorage("json", USERJSON);
}
async function getRandomArtwork() {
  chrome.storage.local.get(["json"], function (result) {
    console.log("Json Retrieved:");
    console.log(result);
    let randInt = Math.floor(Math.random() * result["json"]["data"].length);
    return result["json"]["data"][randInt];
  });
}
