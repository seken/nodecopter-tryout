drone = require("ar-drone").createClient();
drone.config('general:navdata_demo', 'TRUE');
HORIZONTAL = 0
VERTICAL = 1
drone.config('video:video1_channel', HORIZONTAL);

drone.takeoff();

drone
  .after(5000, function() {
    this.clockwise(0.5);
  })
  .after(3000, function() {
    this.animate('flipLeft', 15);
  })
  .after(1000, function() {
    this.stop();
    this.land();
  });
