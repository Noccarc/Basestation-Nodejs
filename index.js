/*const SerialPort = require('serialport')
const xbee = require('xbee')
var sys = require('util');
var serial_xbee = new SerialPort("/dev/ttyUSB0", { 
    baudRate:115200,
    parser: xbee.packetParser()
  });
//// execute an AT command on a remote xbee module
 serial_xbee.on("data", function(data) {
  let output = Buffer.from(data, 'hex');
  let output1=output.toString("utf8")

   console.log('xbee data received:', output1);    
  });
// From the example code at www.npmjs.com/package/xbee-api
*/
var util       = require('util');
var SerialPort = require('serialport');

var xbee_api   = require('xbee-api');
const { exception } = require('console');
var C          = xbee_api.constants;

var xbeeAPI = new xbee_api.XBeeAPI({
  api_mode: 1
});

var serialport = new SerialPort("/dev/ttyUSB0", {
    baudRate: 115200,
     
});
serialport.on("open", function() {
  console.log("Serial port open... sending ATND");
  var frame_obj = {    
    type: 0x10, // xbee_api.constants.FRAME_TYPE.ZIGBEE_TRANSMIT_REQUEST
    id: 0x01, // optional, nextFrameId() is called per default
    destination64: "0013A20041AEC2E1",
    destination16: "fffe", // optional, "fffe" is default
    broadcastRadius: 0x00, // optional, 0x00 is default
    options: 0x08, // optional, 0x00 is default
    data: "TxData0A" // Can either be string or byte array.
  };

  xbeeAPI.builder.write(frame_obj);
});


serialport.pipe(xbeeAPI.parser);
xbeeAPI.builder.pipe(serialport);
  
// All frames parsed by the XBee will be emitted here
    xbeeAPI.parser.on("data", function(frame) { 
      console.log("frame=",frame)
      console.log(typeof frame)
     // console.log("delivery Status=", frame.deliveryStatus)
      if(frame.deliveryStatus==0){
        console.log("deliveryStatus=",frame.deliveryStatus)
      }
      if(frame.remote64){
        console.log("xbee id=",frame.remote64)
      }

      if(frame.data){
        let output = Buffer.from(frame.data, 'hex');
        let output1=output.toString("utf8")
      
        console.log("data=", output1);
      }    
});



// The data frames are outputted by this function