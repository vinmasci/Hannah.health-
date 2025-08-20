// FatSecret API Proxy Server
// This server handles OAuth authentication server-side to keep credentials secure

const http = require('http');
const https = require('https');
const url = require('url');
const querystring = require('querystring');

// Load environment variables
require('dotenv').config();

const CLIENT_ID = process.env.FATSECRET_CLIENT_ID;
const CLIENT_SECRET = process.env.FATSECRET_CLIENT_SECRET;
const PORT = process.env.PROXY_PORT || 3001;

let accessToken = null;
let tokenExpiry = null;

// CORS headers for local development
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
};

// Get OAuth 2.0 access token
async function getAccessToken() {
    if (accessToken && tokenExpiry && Date.now() < tokenExpiry) {
        return accessToken;
    }

    return new Promise((resolve, reject) => {
        const credentials = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
        const postData = 'grant_type=client_credentials&scope=basic';

        const options = {
            hostname: 'oauth.fatsecret.com',
            path: '/connect/token',
            method: 'POST',
            headers: {
                'Authorization': `Basic ${credentials}`,
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': postData.length
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const response = JSON.parse(data);
                    accessToken = response.access_token;
                    tokenExpiry = Date.now() + (response.expires_in * 1000);
                    resolve(accessToken);
                } catch (error) {
                    reject(error);
                }
            });
        });

        req.on('error', reject);
        req.write(postData);
        req.end();
    });
}

// Make API request to FatSecret
async function makeFatSecretRequest(method, params) {
    const token = await getAccessToken();
    
    return new Promise((resolve, reject) => {
        const queryParams = new URLSearchParams({
            method: method,
            format: 'json',
            ...params
        });

        const options = {
            hostname: 'platform.fatsecret.com',
            path: `/rest/server.api?${queryParams}`,
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (error) {
                    reject(error);
                }
            });
        });

        req.on('error', reject);
        req.end();
    });
}

// Create HTTP server
const server = http.createServer(async (req, res) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        res.writeHead(200, corsHeaders);
        res.end();
        return;
    }

    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const query = parsedUrl.query;

    try {
        let result;

        switch (pathname) {
            case '/api/search':
                result = await makeFatSecretRequest('foods.search', {
                    search_expression: query.q || '',
                    max_results: query.max || 20
                });
                break;

            case '/api/food':
                result = await makeFatSecretRequest('food.get.v2', {
                    food_id: query.id
                });
                break;

            case '/api/autocomplete':
                result = await makeFatSecretRequest('foods.autocomplete', {
                    expression: query.q || ''
                });
                break;

            default:
                res.writeHead(404, corsHeaders);
                res.end(JSON.stringify({ error: 'Not found' }));
                return;
        }

        res.writeHead(200, corsHeaders);
        res.end(JSON.stringify(result));
    } catch (error) {
        console.error('Error:', error);
        res.writeHead(500, corsHeaders);
        res.end(JSON.stringify({ error: 'Internal server error' }));
    }
});

server.listen(PORT, () => {
    console.log(`FatSecret proxy server running on http://localhost:${PORT}`);
    console.log('Available endpoints:');
    console.log(`  - http://localhost:${PORT}/api/search?q=chicken`);
    console.log(`  - http://localhost:${PORT}/api/food?id=12345`);
    console.log(`  - http://localhost:${PORT}/api/autocomplete?q=chic`);
});