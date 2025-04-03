import app from './app.js';
import { dbConnection } from './src/connections/mongodb.connections.js';
// import { redis } from './src/connections/redis.connections.js';
const PORT = process.env.PORT || 5000;

dbConnection()
    // .then(() => {
    //     return new Promise((resolve, reject) => {
    //         redis.ping((err, result) => {
    //             if (err) {
    //                 console.error("Redis Connection Error:", err);
    //                 reject(err);
    //             } else {
    //                 console.log("Redis Ping Response:", result);
    //                 resolve();
    //             }
    //         });
    //     });
    // })
    .then(() => {
        app.listen(PORT, () => {
            console.log(`SERVER STARTED AT http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error("SERVER STARTUP ERROR:", error);
    })