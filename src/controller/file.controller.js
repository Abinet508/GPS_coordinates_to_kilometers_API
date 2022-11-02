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
            A_latitiude=53.339428
            A_longtiude=-6.257664
            B_latitiude=obj["latitude"]
            B_longtiude=obj["longitude"]
            if ((A_latitiude == B_latitiude) && (A_longtiude == B_longtiude)) {
              return 0;
          }
          else {
              var radlat1 = Math.PI * A_latitiude/180;
              var radlat2 = Math.PI * B_latitiude/180;
              var theta = A_longtiude-B_longtiude;
              var radtheta = Math.PI * theta/180;
              var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
              if (dist > 1) {
                  dist = 1;
              }
              dist = Math.acos(dist);
              dist = dist * 180/Math.PI;
              dist = dist * 60 * 1.1515;
              dist = dist * 1.609344 
               
          }
            console.log(A_latitiude);
            console.log(A_longtiude);
            console.log(dist)
            if(dist<=100){
              
             newdata={"user_id":obj["user_id"],"name":obj["name"]} 
           
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
