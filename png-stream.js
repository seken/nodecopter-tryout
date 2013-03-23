// Run this to receive a png image stream from your drone.

var arDrone = require('ar-drone');
var http    = require('http');
var fs = require('fs');

//console.log('Connecting png stream ...');
//var pngStream = arDrone.createPngStream();
BOTTOM=3
TOP=0
client = arDrone.createClient()
client.config('video:video_channel', TOP);
client.config('general:navdata_demo', 'FALSE');
client.config('detect:enemy_colors', '3');
client.config('detect:detect_type', '10');
client.config('detect:detections_select_h', '1');
client.config('control:altitude_max', '2000');

navdata = arDrone.createUdpNavdataStream()



var net=require('net');
var s = net.createServer(function(c) {
	c.on('data', function(data) {
		if (data == 'stop') {
			console.log('stopping');
			client.stop()
			client.land();
		}
	})
})
s.listen(3002);

/*
var lastPng;
var i = 0;
pngStream
  .on('error', console.log)
  .on('data', function(pngBuffer) {
    lastPng = pngBuffer;
	fs.writeFile('pngs/'+(i++)+'.png', pngBuffer);
  });

var server = http.createServer(function(req, res) {
  if (!lastPng) {
    res.writeHead(503);
    res.end('Did not receive any png data yet.');
    return;
  }

  res.writeHead(200, {'Content-Type': 'image/png'});
  res.end(lastPng);
});

server.listen(8080, function() {
  console.log('Serving latest png on port 8080 ...');
});
*/

client.stop();
client.takeoff();

client.up(0.5);
client.after(1000, function () {
	client.stop();
});

var found = false;

client.after(2000, function() {
	client.on('navdata', function(data) {
		try {
			if (data.demo.batteryPercentage < 20) {
				console.log('Battery: ' + data.demo.batteryPercentage);
			}

		    //console.log('Alt: ' + data.demo.altitude);
		    //console.log(data.visionDetect);

			if (data.visionDetect.nbDetected > 0) {

				client.stop();

				vd = data.visionDetect
				console.log('distance', vd.dist);

				if (vd.dist[0] > 100) {
					console.log('forwards' + vd.dist[0])
					client.front(0.2);
				} else if (vd.dist[0] < 100)  {
					console.log('back')
					client.back(0.2);
				} else {
					console.log('nothing to do...')
				}

				if (vd.yc > 550) {
					client.down(0.2);
				} else if (vd.yc < 450) {
					client.up(0.2);
				} else {
					client.up(0);
				}

				if (vd.xc > 600) {
					client.right(0.2);
				} else if (vd.xc < 400) {
					client.left(0.2);
				} else {
					client.left(0);
				}
				
			} else {
				// look around for one
				console.log('none found')
				client.clockwise(.7);
			}
		} catch (error) {}

	});
});
process.on('SIGINT', function () {
	client && client.land();
	setTimeout(function () {
		process.exit(0);
	}, 1000)
});
//client.land();
