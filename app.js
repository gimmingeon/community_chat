import express from 'express';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import userRouter from './src/routers/user.router.js';
import postRouter from './src/routers/post.router.js';
import commentRouter from './src/routers/comment.router.js';
import './src/utils/redis.js';

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(express.json());
app.use(cookieParser());

app.use('/user', userRouter);
app.use('/post', postRouter);
app.use('/comment', commentRouter);

app.get('/', (req, res) => {
    res.send("hellow da");
});

app.listen(port, () => {
    console.log(`${port}번으로 서버가 열렸습니다.`);
});