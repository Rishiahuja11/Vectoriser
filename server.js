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
                // Clean up the temporary file
                fs.unlink(req.file.path, (err) => {
                    if (err) console.error("Error deleting file:", err);
                });
            },
            'posterized2'
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
    
