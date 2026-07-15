const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;
const json_path = path.join(__dirname, 'logs.json');

// set ejs as templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// serve static files from public
app.use(express.static(path.join(__dirname, 'public')));

// serve raw log files as static so the frontend can fetch them
app.use('/logs', express.static('logs'));

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
            const fullPath = path.join(__dirname, 'public', 'logs', log.filename);
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

    try {
        let data = JSON.parse(fs.readFileSync(json_path, 'utf8'));
        const log = data.find(l => l.filename === req.params.filename);
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
    console.log(`Server running at http://localhost:${PORT}`);
});