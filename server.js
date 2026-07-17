const express = require('express');
const multer = require('multer');
const imagetracer = require('imagetracerjs');
const fs = require('fs');
const { createCanvas, loadImage } = require('canvas'); // Import canvas
const app = express();
const upload = multer({ dest: 'uploads/' });

// Define a global Image object for ImageTracer
global.Image = Image; 
// Note: Some versions of imagetracer might require more mocking, 
// but often just providing the canvas context is enough.

app.use(express.static('public'));

app.post('/convert', upload.single('image'), async (req, res) => {
    if (!req.file) return res.status(400).send('No file');
    
    try {
        // Use the canvas library to load the image properly
        const img = await loadImage(req.file.path);
        const canvas = createCanvas(img.width, img.height);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        // Convert the canvas to a string for tracer
        const imgData = canvas.toDataURL();

        imagetracer.imageToSVG(imgData, (svgstr) => {
            res.set('Content-Type', 'image/svg+xml');
            res.send(svgstr);
            fs.unlinkSync(req.file.path);
        }, 'posterized2');
    } catch (error) {
        console.error(error);
        res.status(500).send('Processing failed');
    }
});

app.listen(process.env.PORT || 3000);
        
