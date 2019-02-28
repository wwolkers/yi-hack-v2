createState('baby_crying_last_timestamp', 0, {name: 'Last Time Baby cry was detected', unit: 'timestamp'});

schedule('*/10 * * * * *', function () {

const jsftp = require("jsftp");
var fs      = require("fs");
var path = require("path");

const ftp = new jsftp({
  host: "REPLACE_WITH_IP_FROM_YI_CAMERA"
});
            
ftp.ls("tmp/eventd", (err, res) => {
  res.forEach(file => {
      if(file.name == "event_child_cry.mp4") {
            var babyCryingTimestamp = getState("baby_crying_last_timestamp");
           
            if(file.time > babyCryingTimestamp.val) {
                console.log("cry detected");
                console.log(file.time);
                setState("baby_crying_last_timestamp",file.time);

                ftp.get("tmp/eventd/event_child_cry.mp4", "/tmp/event_child_cry.mp4", err => {
                
                    console.log("File copied successfully!");

                    setTimeout(function() {
                        sendTo('telegram.0', {
                            user: 'REPLACE_WITH_WHITELISTED_USER_NAMES',
                            text: fs.readFileSync('/tmp/event_child_cry.mp4'), 
                            caption: 'Baby cry detected!',
                            type: 'video'
                        });
                        
                    }, 500);
                });

                removeAllFilesInPublicFolder(ftp, "sdcard/YH1080P_Record");
                removeAllFilesInPublicFolder(ftp, "sdcard/YH1080P_Record_sub");
            }
      }
    });
});
});

function removeAllFilesInPublicFolder(ftp, deleteThisDirectory) {
  walk(ftp, deleteThisDirectory)
    .then((results) => {
      let files = flatten(results)
        .filter(Boolean);

      console.log("About to try deleting ", files.map((file) => file.filepath));

      // Non-empty directories can't be removed, should I remove all files first?
      let deletions = files.map((file) => {
        if (isDirectory(file)) {
          return deleteDirectory(ftp, file);
        } else {
          return deleteFile(ftp, file);
        }
      });

      return Promise.all(deletions);
    }).then((deletionResults) => {
      console.log("Deletion results: ", deletionResults);
      ftp.destroy();
    }).catch((error) => {
      console.log("Error all: ", error);
    })
}

function walk(ftp, directory) {
  return list(ftp, directory)
    .then((files) => {
      
      console.log(directory);
      if (files.length === 0) {
        return Promise.resolve();
      }
      return Promise.all(files.map((file) => {
		console.log(file.name);
        file.filepath = directory + "/" + file.name;

        let promises = [];

        if (isDirectory(file)) {
          promises.push(walk(ftp, directory +"/"+ file.name));
        }
        // Make sure the directory is after the files in the list of promises
        promises.push(Promise.resolve(file));

        return Promise.all(promises);
      }));
    });
}

function deleteDirectory(ftp, directory) {
  return new Promise((resolve, reject) => {
    ftp.raw('rmd', directory.filepath, (error, result) => {
      if (error) {
        return reject(error);
      } else {
        return resolve(result);
      }
    });
  })
}

function deleteFile(ftp, file) {
  return new Promise((resolve, reject) => {
    ftp.raw('dele', file.filepath, (error, result) => {
      if (error) {
        return reject(error);
      } else {
        return resolve(result);
      }
    });
  })
}

function list(ftp, directory) {
  return new Promise((resolve, reject) => {
    ftp.ls(directory, (error, files) => {
        
      if (error) {
          console.log(error);
        reject(error);
        return;
      }

      resolve(files);
    });
  });
}

function isDirectory(file) {
  return file.type === 1;
}

const flatten = list => list.reduce(
  (a, b) => a.concat(Array.isArray(b) ? flatten(b) : b), []
);