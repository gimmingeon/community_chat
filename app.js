import express from 'express';

const app = express();
const port = 3000;

app.get('/', (req, res) => {
    res.send("hellow da");
});

app.listen(port, () => {
    console.log(`${port}번으로 서버가 열렸습니다.  `);
});