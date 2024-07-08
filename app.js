const express = require('express');
const axios = require('axios');
require('dotenv').config();

const githubToken = process.env.GITHUB_TOKEN;
const app = express();
const port = process.env.PORT || 3000;

const endpoints = {
    views: 'traffic/views',
    clones: 'traffic/clones',
    forks: 'forks',
    downloads: 'releases',
    commits: 'commits'
};

const fetchData = async (owner, repo, endpoint) => {
    const url = `https://api.github.com/repos/${owner}/${repo}/${endpoint}`;
    const headers = { Authorization: `token ${githubToken}` };
    const response = await axios.get(url, { headers });

    switch (endpoint) {
        case 'traffic/views':
            return response.data.count;
        case 'traffic/clones':
            return response.data.count;
        case 'forks':
            return response.data.length;
        case 'releases':
            return response.data.reduce((acc, release) => acc + release.assets.reduce((acc, asset) => acc + asset.download_count, 0), 0);
        case 'commits':
            return response.data.length;
    }
};

const generateBadgeURL = (label, message, color) => `https://img.shields.io/badge/${label}-${message}-${color}`;

app.get('/:owner/:repo/:metric', async (req, res) => {
    try {
        const { metric, owner, repo } = req.params;
        const { color = 'blue' } = req.query;
        if (!endpoints[metric]) return res.status(400).json({ error: 'Invalid metric' });

        const data = await fetchData(owner, repo, endpoints[metric]);
        const badgeURL = generateBadgeURL(metric.charAt(0).toUpperCase() + metric.slice(1), `${data}`, color);
        res.redirect(badgeURL);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching data' });
    }
});

app.listen(port, () => console.log(`Server running at http://localhost:${port}`));