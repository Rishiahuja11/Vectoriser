const express = require('express');
const multer = require('multer');
const potrace = require('potrace');
const fs = require('fs');
const path = require('path');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(express.static('public'));

app.post('/convert', upload.single('image'), (req, res) => {
    if (!req.file) return res.status(400).send('No image uploaded.');

    const inputPath = req.file.path;
    const outputPath = `${inputPath}.svg`;

    // Convert the image to SVG using Potrace
    potrace.trace(inputPath, { turdSize: 2, optTolerance: 0.2 }, (err, svg) => {
        if (err) return res.status(500).send('Error processing image.');

        // Send the SVG directly to the browser
        res.setHeader('Content-Type', 'image/svg+xml');
        res.send(svg);

        // Privacy: Clean up the uploaded file after processing
        fs.unlink(inputPath, () => {});
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
      
