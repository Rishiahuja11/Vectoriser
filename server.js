const express = require('express');
const multer = require('multer');
const imagetracer = require('imagetracerjs');
const fs = require('fs');
const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(express.static('public'));

app.post('/convert', upload.single('image'), (req, res) => {
    if (!req.file) return res.status(400).send('No file');

    try {
        // 1. Read the image file as a buffer
        const imgBuffer = fs.readFileSync(req.file.path);
        
        // 2. Since imagetracer on Node expects raw pixel data, 
        // we convert the buffer to a base64 string for the library
        const base64Image = `data:${req.file.mimetype};base64,${imgBuffer.toString('base64')}`;

        // 3. Process the base64 string
        imagetracer.imageToSVG(
            base64Image,
            (svgstr) => {
                res.set('Content-Type', 'image/svg+xml');
                res.send(svgstr);
                fs.unlinkSync(req.file.path); // Clean up
            },
            'posterized2'
        );
    } catch (error) {
        console.error(error);
        res.status(500).send('Processing failed');
    }
});

app.listen(process.env.PORT || 3000);
           
