//CALLBACK:
function getRandomArtwork(callback) {
  // https://javascript.info/promisify
  chrome.storage.local.get(["json"], function (result) {
    console.log("Json Retrieved:");
    console.log(result);
    let randInt = Math.floor(Math.random() * result["json"]["data"].length);
    callback(result["json"]["data"][randInt]);
  });
}
let randArtwork = getRandomArtwork(function (randArtwork) {
  console.log(randArtwork);
});
//PROMISE:
function getRandomArtwork() {
  return new Promise(function (resolve, reject) {
    chrome.storage.local.get(["json"], function (result) {
      console.log("Json Retrieved:");
      console.log(result);
      let randInt = Math.floor(Math.random() * result["json"]["data"].length);
      resolve(result["json"]["data"][randInt]);
      reject(new Error("Error:" + result["json"]["data"][randInt]));
    });
  });
}
let artWork = getRandomArtwork();
artWork.then((result) => console.log(result));
// OLD FETCH:
async function fetchJson(url) {
  const response = await fetch(url);
  if (response.ok) {
    return await response.json();
  } else {
    const message = `An error has occured: ${response.status}`;
    throw new Error(message);
  }
}
//OLD UPDATEJSON
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
