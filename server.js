const express = require('express');
const multer = require('multer');
const imagetracer = require('imagetracerjs');
const fs = require('fs');
const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(express.static('public'));

app.post('/convert', upload.single('image'), (req, res) => {
    if (!req.file) return res.status(400).send('No file uploaded');
    
    try {
        // Trace the image
        imagetracer.imageToSVG(
            req.file.path, 
            (svgstr) => {
                res.set('Content-Type', 'image/svg+xml');
                res.send(svgstr);
                // Clean up the file
                fs.unlink(req.file.path, (err) => { if(err) console.error(err); });
            }, 
            'posterized2'
        );
    } catch (error) {
        console.error(error);
        res.status(500).send('Processing failed');
        // Clean up even if it fails
        if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    }
});

app.listen(process.env.PORT || 3000);
