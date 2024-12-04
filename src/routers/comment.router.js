import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
    res.send("comment router 정상 작동")
});

export default router;