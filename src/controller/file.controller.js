const uploadFile = require("../middleware/upload");
const fs = require("fs");
const baseUrl = "http://localhost:8080/files/";

const upload = async (req, res) => {
  try {
    await uploadFile(req, res);

    if (req.file == undefined) {
      return res.status(400).send({ message: "Please upload a file!" });
    }

      let buf = '';
    for await ( const chunk of fs.createReadStream(`./resources/uploads/${req.file.originalname}`) ) {
        const lines = buf.concat(chunk).split(/\r?\n/);
        buf = lines.pop();
        alllines=[]
        object={}
        for( const line of lines ) {
          var obj = JSON.parse(line);
            //console.log(obj);
            A_latitude=53.339428
            A_longitude =-6.257664
            B_latitude=obj["latitude"]
            B_longitude=obj["longitude"]
            if ((A_latitude == B_latitude) && (A_longitude == B_longitude)) {
              return 0;
          }
          else {
              // var radlat1 = Math.PI * A_latitude/180;
              // var radlat2 = Math.PI * B_latitude/180;
              // var theta = A_longitude-B_longitude;
              // var radtheta = Math.PI * theta/180;
              // var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
              // if (dist > 1) {
              //     dist = 1;
              // }
              // dist = Math.acos(dist);
              // dist = dist * 180/Math.PI;
              // dist = dist * 60 * 1.1543;
              // dist = dist * 1.609344

             
			var f = 1/298.257; 
			la1uLambert = A_latitude*Math.PI/180;
			la2uLambert = B_latitude*Math.PI/180;
			if (Math.abs(A_latitude)<90){
				la1uLambert = Math.atan((1 - f)*Math.tan(la1uLambert));
			}
			if (Math.abs(B_latitude)<90){
				la2uLambert = Math.atan((1 - f)*Math.tan(la2uLambert));
			}
			la1u = A_latitude*Math.PI/180;
			lo1u = A_longitude*Math.PI/180;
			la2u = B_latitude*Math.PI/180;
			lo2u = B_longitude*Math.PI/180;

			// Lambert Method
			deltaLat = la2uLambert - la1uLambert; 
			deltaLon = lo2u - lo1u;
			a = Math.sin(deltaLat/2)*Math.sin(deltaLat/2) + Math.cos(la1uLambert)*Math.cos(la2uLambert) * Math.sin(deltaLon/2) * Math.sin(deltaLon/2);
			c = 2*Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
			P = (la1uLambert + la2uLambert)/2;
			Q = (la2uLambert - la1uLambert)/2;
			X = (c - Math.sin(c))*Math.sin(P)*Math.sin(P)*Math.cos(Q)*Math.cos(Q)/Math.cos(c/2)/Math.cos(c/2); 
			Y = (c + Math.sin(c))*Math.sin(Q)*Math.sin(Q)*Math.cos(P)*Math.cos(P)/Math.sin(c/2)/Math.sin(c/2);
			dist = 6378.1*(c - f*(X + Y)/2);
			

			
		
               
          }
            //console.log(A_latitude);
            //console.log(A_longitude);
           // console.log(la2uLambert)
            if(dist<=100){
              
             newdata={"user_id":obj["user_id"],"name":obj["name"],"Distance":dist,"latitude":B_latitude,"longitude":B_longitude} 
           
            //obj["KM"]=dist
            alllines.push(newdata)  
           
            }
            alllines = alllines.sort((a, b) => {
              if (a.user_id < b.user_id) {
                return -1;
              }
            });
   }
    res.status(200).send({
      
      message: alllines,
    });     
  }
  if(buf.length) console.log(buf); 
 
  } catch (err) {
    console.log(err);

    if (err.code == "LIMIT_FILE_SIZE") {
      return res.status(500).send({
        message: "File size Too Large",
      });
    }

    res.status(500).send({
      message: `Erorr Occured while uploading the file: ${req.file.originalname}. ${err}`,
    });
  }
};

const getListFiles = (req, res) => {
  const directoryPath = __basedir + "/resources/uploads/";

  fs.readdir(directoryPath, function (err, files) {
    if (err) {
      res.status(500).send({
        message: "Error! Unable to Find the files!",
      });
    }

    let fileInfos = [];

    files.forEach((file) => {
      fileInfos.push({
        name: file,
        url: baseUrl + file,
      });
    });

    res.status(200).send(fileInfos);
  });
};

const remove = (req, res) => {
  const fileName = req.params.name;
  const directoryPath = __basedir + "/resources/uploads/";

  fs.unlink(directoryPath + fileName, (err) => {
    if (err) {
      res.status(500).send({
        message: `Unable to delete ${fileName}. ` + err,
      });
    }

    res.status(200).send({
      message: `File ${fileName} deleted.`,
    });
  });
};

const removeSync = (req, res) => {
  const fileName = req.params.name;
  const directoryPath = __basedir + "/resources/uploads/";

  try {
    fs.unlinkSync(directoryPath + fileName);

    res.status(200).send({
      message: `File ${fileName} deleted.`,
    });
  } catch (err) {
    res.status(500).send({
      message:  `Unable to delete ${fileName}. ` + err,
    });
  }
};

module.exports = {
  upload,
  getListFiles,
  remove,
  removeSync,
};
