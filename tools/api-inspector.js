import http from 'http';
import https from 'https';

const API_BASE_URL = process.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

/**
 * Simple API Inspector for SEN Backend
 * Usage: node tools/api-inspector.js /artifacts/stats/summary
 */
async function inspect(endpoint) {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

    console.log(`\x1b[36m[Inspecting]\x1b[0m ${url}`);

    const client = url.startsWith('https') ? https : http;

    try {
        client.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    console.log('\n\x1b[32m[Response Success]\x1b[0m');
                    console.log(JSON.stringify(json, null, 4));
                } catch (e) {
                    console.log('\n\x1b[33m[Raw Response (Non-JSON)]\x1b[0m');
                    console.log(data);
                }
            });
        }).on('error', (err) => {
            console.error('\x1b[31m[Error]\x1b[0m', err.message);
        });
    } catch (error) {
        console.error('\x1b[31m[Execution Error]\x1b[0m', error.message);
    }
}

const target = process.argv[2] || '/artifacts/stats/summary';
inspect(target);
