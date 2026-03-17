const Redis = require('ioredis');
const WebSocket = require('ws');

const ws = new WebSocket('wss://ws.blacktowerx.com.br/');

ws.on('open', () => {
    console.log('WS connected. Publishing to redis...');
    
    const redis = new Redis({
        host: "147.93.176.5",
        port: 6379,
        password: "8H#k29@Lm!xPz_92Q"
    });

    const msg = JSON.stringify({
        event: "NOTIFICATION_CREATED",
        payload: { type: "TEST", title: "Test Title" },
        timestamp: new Date().toISOString()
    });

    redis.publish('inventory-channel', msg, (err, count) => {
        if(err) console.error("Redis publish error", err);
        else console.log(`Published to ${count} subscribers`);
        
        redis.quit();
    });
});

ws.on('message', (data) => {
    console.log('WS Received:', data.toString());
    process.exit(0);
});

ws.on('error', (err) => {
    console.error('WS error:', err);
    process.exit(1);
});
setTimeout(() => {
    console.log('Timeout waiting for message');
    process.exit(1);
}, 5000);
