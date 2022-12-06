const fs = require('fs');
const path = require('path');
const ChromeExtension = require('crx');

const crxFolder = path.resolve(__dirname, './crx');

if (!fs.existsSync(crxFolder)) {
  fs.mkdirSync(crxFolder);
}

const crx = new ChromeExtension({
  privateKey: process.env.CRX_KEY ?? fs.readFileSync(path.resolve(__dirname, './crx/dist.pem')),
});

crx
  .load(path.resolve(__dirname, './dist'))
  .then((crx) => crx.pack())
  .then((crxBuffer) => {
    fs.writeFileSync(path.resolve(__dirname, './crx/dist.crx'), crxBuffer);
    console.log('Package crx Finish!!');
  })
  .catch((err) => {
    console.error(err);
  });
