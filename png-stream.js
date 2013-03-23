// Run this to receive a png image stream from your drone.

var arDrone = require('..');
var http    = require('http');
var fs = require('fs');

console.log('Connecting png stream ...');

var pngStream = arDrone.createPngStream();
BOTTOM=3
TOP=0
client = arDrone.createClient()
client.config('video:video_channel', TOP);
client.config('general:navdata_demo', 'FALSE');
client.config('detect:detect_type', '10');
client.config('detect:detections_select_h', '1');
navdata = arDrone.createUdpNavdataStream()


client.on('navdata', function(data) {
	try {
//		console.log(data)
//    console.log('Battery: ' + data.demo.batteryPercentage)
//    console.log('Alt: ' + data.demo.altitude)
	console.log(data.visionDetect);

	if (data.visionDetect.nbDetected > 0) {
		vd = data.visionDetect
		if (vd.dist[0] > 60) {
			console.log('forwards' + vd.dist[0])
			client.front(0.1);
		} else if (vd.dist[0] < 50)  {
			console.log('back')
			client.back(0.1);
		} else {
			console.log('@')
			client.front(0);
		}

		if (vd.yc > 550) {
			client.down(0.1);
		} else if (vd.yc < 450) {
			client.up(0.1);
		} else {
			client.up(0);
		}

		if (vd.xc > 600) {
			client.right(0.1);
		} else if (vd.xc < 400) {
			client.left(0.1);
		} else {
			client.left(0);
		}

	}
	} catch (error) {}
});


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

/*
client.takeoff();

client.after(20000, function() {
//	client.forward(0.01);
	client.stop();
	client.land();
});

client.after(500, function() {
});
*/
