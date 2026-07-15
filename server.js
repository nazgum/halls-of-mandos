import 'dotenv/config';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { startBot } from './discord_bot.js';

// es module fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3030;
const DOMAIN = process.env.DOMAIN || "localhost"
const json_path = path.join(__dirname, 'logs.json');

// set ejs as templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// escape html helper
const escapeHTML = (str) => {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
};

// safe log serving to strip out malicious contentt
app.get('/logs/:filename', (req, res) => {
    // path.basename strips out malicious ../../ attempts
    const safeFilename = path.basename(req.params.filename); 
    const fullPath = path.join(__dirname, 'public', 'logs', safeFilename);

    if (fs.existsSync(fullPath)) {
        const rawText = fs.readFileSync(fullPath, 'utf8');
        
        // stop browsers from executing the text file directly as html
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.setHeader('X-Content-Type-Options', 'nosniff');
        
        // this is sanitized in our parser
        res.send(rawText);
    } else {
        res.status(404).send('Log not found.');
    }
});

// serve static files from public
app.use(express.static(path.join(__dirname, 'public')));

// routes
app.get('/', (req, res) => {
    res.render('pages/index', { pageTitle: 'MUME Logs' });
});

app.get('/log/:slug', (req, res) => {
    // You can pass the slug to the template if you want, but your frontend 
    // JS already perfectly extracts it from the URL, so we just render the view.
    res.render('pages/show', { pageTitle: 'Loading Log...' });
});


// api to get logs with automated dates
app.get('/api/logs', (req, res) => {
    if (!fs.existsSync(json_path)) {
        return res.json([]);
    }

    try {
        const rawData = fs.readFileSync(json_path, 'utf8');
        const logs = JSON.parse(rawData);

        // loop through logs and get created dates
        const logsWithStats = logs.map(log => {
            // protect the file stat reader
            const safeFilename = path.basename(log.filename);
            const fullPath = path.join(__dirname, 'public', 'logs', safeFilename);
            let dateStr = 'Unknown';
            
            try {
                if (fs.existsSync(fullPath)) {
                    const stats = fs.statSync(fullPath);
                    dateStr = stats.birthtime.toLocaleDateString('en-US', { 
                        month: 'short', day: 'numeric', year: 'numeric' 
                    });
                }
            } catch (e) {
                console.error(`Could not read file stats for ${log.filename}`, e);
            }

            return {
                ...log,
                date: dateStr,
                author: log.author || 'Nazgum' // default to me if no author
            };
        });

        res.json(logsWithStats);
    } catch (err) {
        console.error("DEBUG: Failed to parse logs.json:", err);
        res.status(500).send("Error reading logs.json.");
    }
});

// api to update views
app.post('/api/view/:filename', (req, res) => {
    if (!fs.existsSync(json_path)) return res.sendStatus(404);

    // prevent path traversal for security
    const safeFilename = path.basename(req.params.filename);

    try {
        let data = JSON.parse(fs.readFileSync(json_path, 'utf8'));
        const log = data.find(l => l.filename === safeFilename);
        if (log) {
            log.views = (log.views || 0) + 1;
            fs.writeFileSync(json_path, JSON.stringify(data, null, 2));
        }
        res.sendStatus(200);
    } catch (err) {
        console.error("Failed to update view count:", err);
        res.sendStatus(500);
    }
});

app.listen(PORT, () => {
    console.log(`Server running at ${DOMAIN}:${PORT}`);

    //startBot();
});