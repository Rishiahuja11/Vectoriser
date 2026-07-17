const { JSDOM } = require("jsdom");
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.window = dom.window;
global.document = dom.window.document;
global.Node = dom.window.Node;
const express = require('express');
const multer = require('multer');
const imagetracer = require('imagetracerjs');
const fs = require('fs');
const { createCanvas, loadImage, Image } = require('canvas');

// Set up the global Image object for imagetracerjs
global.Image = Image;

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(express.static('public'));

app.post('/convert', upload.single('image'), async (req, res) => {
    if (!req.file) return res.status(400).send('No file uploaded');
    
    try {
        // Load the image into a canvas environment
        const img = await loadImage(req.file.path);
        const canvas = createCanvas(img.width, img.height);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        // Get the data URL for the tracer
        const imgData = canvas.toDataURL();

        // Perform vectorization
        imagetracer.imageToSVG(
        imgData,
    (svgstr) => {
        res.set('Content-Type', 'image/svg+xml');
        res.send(svgstr);
        fs.unlink(req.file.path, (err) => { if (err) console.error(err); });
    },
    {
        ltres: 0.1,        // Lower is more precise for lines
        qtres: 1,          // Keeps shapes smooth
        scale: 2,          // Increase scale for better perceived quality
        pathomit: 0,       // Keep every detail, do not omit paths
        numberofcolors: 256, // Allows for much higher color fidelity
        colorquantcycles: 3 // Higher accuracy in color matching
    }
);

    } catch (error) {
        console.error("Conversion error:", error);
        res.status(500).send('Processing failed');
        // Clean up even if conversion fails
        if (fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
    
