var UI = require('ui');
var Vector2 = require('vector2');
var ajax = require('ajax');
var Accel = require('ui/accel');
var Vibe = require('ui/vibe');
Accel.init();
var accelConfig = {
  "rate" : 10,
  "samples" : 25,
};
Accel.config(accelConfig);
var accelTemp = 0;

/*
var main = new UI.Card({
  subitle: "",
  body: 'Loading...'
});
*/
var main = new UI.Window();
var streetName = new UI.Text({
  position: new Vector2(0,0),
  size: new Vector2(120,60),
  text: "SpeedLimiter loading..."
});
var maxSpeedLimit = new UI.Text({
  position: new Vector2(0,50),
  size: new Vector2(120,60),
  text: ""
});
var tooFast = new UI.Text({
  position: new Vector2(0,75),
  size: new Vector2(120,60),
  text: ""
});
var currentSpeed = new UI.Text({
  position: new Vector2(0,100),
  size: new Vector2(120,60),
  text: ""
});
main.add(streetName);
main.add(maxSpeedLimit);
main.add(currentSpeed);
main.add(tooFast);
var radius = 1500;
var speedScreen;
var roadSpeedLimit;

main.show();


main.on('click', 'select', function(e) {
  var wind = new UI.Window();
  var textfield = new UI.Text({
    position: new Vector2(0, 50),
    size: new Vector2(144, 30),
    font: 'gothic-24-bold',
    text: 'Text Anywhere!',
    textAlign: 'center'
  });
  wind.add(textfield);
  wind.show();
});


navigator.geolocation.getCurrentPosition(
  function(pos){
      console.log(pos.coords.latitude + "hi");
      console.log(pos.coords.longitude);
    var url = "http://www.overpass-api.de/api/interpreter?data=[out:json];way(around:" + radius + "," + pos.coords.latitude + "," + pos.coords.longitude + ")[maxspeed];out;";
    Accel.on('data', function(e){
      accelTemp = 0;
      for(var i = 0; i < e.accels.length; i++){
        accelTemp = accelTemp + (Math.sqrt(Math.pow(e.accels[i].x, 2) + Math.pow(e.accels[i].y, 2) + Math.pow(e.accels[i].z, 2)));
      }
      //console.log(accelTemp/e.accels.length);
      speedScreen = Number((accelTemp/(e.accels.length*100) -0.10)).toFixed(1);
      if(speedScreen > roadSpeedLimit*1){
        Vibe.vibrate('long');
        tooFast.text("TOO FAST! " + Number(speedScreen).toFixed(0) + "mph");
      }

      currentSpeed.text("Current Speed: " + speedScreen + "mph");
    });
    ajax({
    url: url,
    type: 'json',
    },
    function(data){
      var speedlimit = data.elements[0].tags.maxspeed;
      var streetname = data.elements[0].tags.name;
      streetName.text(streetname);
      roadSpeedLimit = speedlimit;
      maxSpeedLimit.text("Max Speed: " + speedlimit);
      
      console.log(speedScreen + " speedscreen");
    },
    function (err) {
      console.log("AJAX Error: " + JSON.stringify(err));
      console.log(pos.coords.latitude);
      console.log(pos.coords.longitude);
    },
    {timeout: 10000}
  );
});