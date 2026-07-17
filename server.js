const express = require('express');
const multer = require('multer');
const imagetracer = require('imagetracerjs');
const fs = require('fs');
const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(express.static('public'));

app.post('/convert', upload.single('image'), (req, res) => {
    if (!req.file) return res.status(400).send('No file');
    
    // Read the file and process it
    const imgData = fs.readFileSync(req.file.path, 'base64');
    const imgUrl = `data:image/jpeg;base64,${imgData}`;

    imagetracer.imageToSVG(imgUrl, (svgstr) => {
        res.set('Content-Type', 'image/svg+xml');
        res.send(svgstr);
        fs.unlinkSync(req.file.path); // Clean up
    }, 'posterized2');
});

app.listen(process.env.PORT || 3000);
