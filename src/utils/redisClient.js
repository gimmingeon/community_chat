import { createClient } from "redis";

const redisClient = createClient({
    socket: {
        host: process.env.REDIS_HOST, // Redis Cloud에서 제공된 호스트
        port: Number(process.env.REDIS_PORT) // Redis Cloud에서 제공된 포트
    },
    password: process.env.REDIS_PASSWORD // Redis Cloud에서 제공된 비밀번호
});

// redis 연결
const connectRedis = async () => {
    try {
        await redisClient.connect();
        console.log('Redis에 연결되었습니다.');
    } catch (error) {
        console.error('Redis 연결 실패:', error);
    }
};

connectRedis();

export default redisClient;