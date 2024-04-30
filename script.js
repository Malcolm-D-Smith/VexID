// More API functions here:
// https://github.com/googlecreativelab/teachablemachine-community/tree/master/libraries/image

// the link to your model provided by Teachable Machine export panel
const URL = "./mk1/";
let model,
  webcam,
  labelContainer,
  discContainer,
  maxPredictions,
  winner,
  classes;
// Load the image model and setup the webcam
async function init() {
  const modelURL = URL + "model.json";
  const metadataURL = URL + "metadata.json";
  fetch("./classes.json")
    .then((response) => response.json())
    .then((json) => {
      classes = json;
    });
  // load the model and metadata
  // Refer to tmImage.loadFromFiles() in the API to support files from a file picker
  // or files from your local hard drive
  // Note: the pose library adds "tmImage" object to your window (window.tmImage)
  model = await tmImage.load(modelURL, metadataURL);
  maxPredictions = model.getTotalClasses();
  maxPredictions = 10;
  // Convenience function to setup a webcam
  const flip = true; // whether to flip the webcam
  webcam = new tmImage.Webcam(
    window.innerWidth / 2,
    window.innerWidth / 2,
    flip
  ); // width, height, flip
  await webcam.setup(); // request access to the webcam
  await webcam.play();
  window.requestAnimationFrame(loop);

  // append elements to the DOM
  document.getElementById("webcam-container").appendChild(webcam.canvas);
  labelContainer = document.getElementById("label-container");
  discContainer = document.getElementById("description-container");
  discContainer.appendChild(document.createElement("div")); //thumbnail
  discContainer.appendChild(document.createElement("div")); //title
  discContainer.appendChild(document.createElement("div")); //description
  for (let i = 0; i < maxPredictions; i++) {
    // and class labels
    labelContainer.appendChild(document.createElement("div"));
  }
}

async function loop() {
  webcam.update(); // update the webcam frame
  //await predict();
  window.requestAnimationFrame(loop);
}
async function capture() {
  winner = await model.predictTopK(webcam.canvas);
  for (let i = 0; i < maxPredictions; i++) {
    const classPrediction =
      winner[i].className +
      ": " +
      (winner[i].probability * 100).toFixed(2) +
      "%";
    labelContainer.childNodes[i].innerHTML = classPrediction;
  }
  const wi = classes["ind"][winner[0].className];
  discContainer.childNodes[0].innerHTML =
    '<img src="./thumbnails/' +
    wi +
    '.png" style="width:200px;height:200px;"></img>';
  discContainer.childNodes[1].innerHTML =
    "<h2>" + classes["classes"][wi] + "</h2>";
  discContainer.childNodes[2].innerHTML = classes["descriptions"][wi];
  //discContainer.childNodes[0].innerHTML = winner
  var msg = new SpeechSynthesisUtterance();
  msg.text = classes["classes"][wi];
  window.speechSynthesis.speak(msg);
}
async function read() {
  const wi = classes["ind"][winner[0].className];
  var msg = new SpeechSynthesisUtterance();
  msg.text = classes["descriptions"][wi];
  window.speechSynthesis.speak(msg);
}
init();
