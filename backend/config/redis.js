import {createClient} from "redis"

const redisClient = createClient({
    url:process.env.REDIS_URL
})
redisClient.on("error", (err) => {
    console.error("Redis Error", err)
})
redisClient.on("connect", () => {
    console.log("Redis connecting...");
});

redisClient.on("ready", (err) => {
    console.log("Redis ready")
})

await redisClient.connect()
export default redisClient;