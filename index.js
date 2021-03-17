var util       = require('util');
var SerialPort = require('serialport');

var xbee_api   = require('xbee-api');
const { exception } = require('console');
const mongoose = require('mongoose');
var C          = xbee_api.constants;
const MongoClient = require('mongodb').MongoClient;
const { stringify } = require('querystring');


var xbeeAPI = new xbee_api.XBeeAPI({
  api_mode: 1
});
 var serialport = new SerialPort("/dev/ttyUSB0", {
  baudRate: 115200,
 
});

serialport.pipe(xbeeAPI.parser);
xbeeAPI.builder.pipe(serialport);

const uri = "mongodb+srv://admin:noccarc@cluster0.az0a3.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
mongoose.connect(uri,{ useNewUrlParser: true, useUnifiedTopology: true })
.then(()=>console.log("connection successfull ...."))
.catch((err)=> console.log(err))

let remote_addr;

const dataSchema = new mongoose.Schema({
  xbee_id:String,
  dist_cov:Number,
  batt_stat:Number,
  Date:{
    type:Date,
    default:Date.now
  }
})

const RobotData = new mongoose.model("RobotData", dataSchema)

const insertData = async(id,dist,bat)=>{
  try{
    const Robotdata= new RobotData({
      xbee_id:id,
      dist_cov:dist,
      batt_stat:bat,
    })
    const result = await Robotdata.save();
   // console.log(result)
  }
  catch(err){
    console.log(err)
  }
}
  
// All frames parsed by the XBee will be recieved  here 
    xbeeAPI.parser.on("data", function(frame) {  
      if(frame.deliveryStatus){
        console.log("deliveryStatus=",frame.deliveryStatus)
      }

      if(frame.data){
        remote_addr=frame.remote64
        let robotsData = Buffer.from(frame.data, 'hex');
        robotsData=robotsData.toString("utf8")
        splitdata(robotsData,remote_addr)
        
      }    
});

splitdata=(robotsData,remote_addr)=>{
  robotsData=robotsData;
  var distcov    = parseFloat(robotsData.substring(robotsData.lastIndexOf("A") + 1, robotsData.lastIndexOf("B")));
  var battvol    = parseFloat(robotsData.substring(robotsData.lastIndexOf("C") + 1, robotsData.lastIndexOf("D")));
  var tdriveCurr = parseFloat(robotsData.substring(robotsData.lastIndexOf("E") + 1, robotsData.lastIndexOf("F")));
  var bdrivecurr = parseFloat(robotsData.substring(robotsData.lastIndexOf("G") + 1, robotsData.lastIndexOf("H")));
  var brushCurr  = parseFloat(robotsData.substring(robotsData.lastIndexOf("I") + 1, robotsData.lastIndexOf("J")));
  var totalcurr  = parseFloat(robotsData.substring(robotsData.lastIndexOf("K") + 1, robotsData.lastIndexOf("L")));
  var peakcurr      = parseFloat(robotsData.substring(robotsData.lastIndexOf("M") + 1, robotsData.lastIndexOf("N")));
  var finvol     = parseFloat(robotsData.substring(robotsData.lastIndexOf("O") + 1, robotsData.lastIndexOf("P")));
  insertData(remote_addr,distcov,battvol)
  console.log("data=", remote_addr);
  
}


