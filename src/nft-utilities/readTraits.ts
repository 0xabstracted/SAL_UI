export const readTraits = async (uri: string , fileName: String) => {
    var obj;
    // var fs = require('fs');
    // var files = fs.readdirSync('/Users/bhargavveepuri/Downloads/metadata');  
    // for (let index = 0; index < files.length; index++) {
      var xhr = new XMLHttpRequest();
      xhr.addEventListener("readystatechange", function() {
        if(this.readyState === 4) {
          obj= {
            mint: fileName,
            attributes: JSON.parse(this.responseText).attributes,
            image: JSON.parse(this.responseText).image,
            name: JSON.parse(this.responseText).name,
          }
           console.log(obj);
        }
      });
      xhr.open("GET", uri);
      xhr.send();
    // }
    return obj;
  }