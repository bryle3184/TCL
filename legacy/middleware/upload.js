const path = require('path')
const multer = require('multer')

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage, 
  fileFilter: function(req, file, callback){
    if(
      file.mimetype == 'image/png' ||
      file.mimetype == 'image/jpg' 
    ){
      callback(null, true)
    }
    else{
      console.log('different file type')
      console.log(file)
      callback(null, true)
    }
  }
});

module.exports = upload















