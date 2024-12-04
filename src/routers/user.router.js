import express from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = express.Router();

router.post('/sign-up', async (req, res) => {
    const { email, password, passwordConfirm, nickname } = req.body

    if (!email) {
        return res.status(400).json({ success: false, message: "이메일은 필수입니다." })
    }

    if (!password) {
        return res.status(400).json({ success: false, message: "비밀번호는 필수입니다." })
    }

    if (!passwordConfirm) {
        return res.status(400).json({ success: false, message: "비밀번호 확인은 필수입니다" })
    }

    if (!nickname) {
        return res.status(400).json({ success: false, message: "닉네임은 필수입니다." })
    }

    const exitUser = await prisma.user.findFirst({
        where: { email }
    });

    if (exitUser) {
        return res.status(400).json({ success: false, message: "이미 존재하는 이메일입니다." });
    }

    if (!(password == passwordConfirm)) {
        return res.status(400).json({ success: false, message: "비밀번호와 비밀번호 확인이 맞지 않습니다.." });
    }

    await prisma.user.create({
        data: {
            email,
            password,
            nickname,
        }
    });

    return res.status(201).json({ email, nickname });

});

export default router;