const https = require('https');

const apiKey = 'AIzaSyA6qJoHY_YtG0F-KsfCIzfqbxvtd6MYGJU';
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    res.on('end', () => {
        try {
            const parsed = JSON.parse(data);
            const fs = require('fs');
            if (parsed.error) {
                console.error('Error:', parsed.error);
            } else if (parsed.models) {
                fs.writeFileSync('models.json', JSON.stringify(parsed, null, 2));
                console.log('Models saved to models.json');
            } else {
                console.log('No models found or unexpected format:', data);
            }
        } catch (e) {
            console.error('Error parsing response:', e.message);
            console.log('Raw response:', data);
        }
    });
}).on('error', (err) => {
    console.error('Request Error:', err.message);
});
