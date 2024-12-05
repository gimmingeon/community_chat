import express from 'express';
import { prisma } from '../utils/index.js'
import jwtwebToken from "jsonwebtoken";
import bcrypt from 'bcrypt';
import jwtValidateMiddleware from '../middleware/jwt-validate-middleware.js';

const router = express.Router();

// 회원가입
router.post('/signup', async (req, res) => {
    const { email, password, passwordConfirm, nickname } = req.body

    // 필수값 검증
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

    const exitEmail = await prisma.user.findFirst({
        where: { email }
    });

    if (exitEmail) {
        return res.status(400).json({ success: false, message: "이미 존재하는 이메일입니다." });
    }

    const exitNickname = await prisma.user.findFirst({ where: { nickname } });

    if (exitNickname) {
        return res.status(400).json({ success: false, message: "이미 존재하는 닉네임입니다." });
    }

    if (!(password == passwordConfirm)) {
        return res.status(400).json({ success: false, message: "비밀번호와 비밀번호 확인이 맞지 않습니다.." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
        data: {
            email,
            password: hashedPassword,
            nickname,
        }
    });

    return res.status(201).json({ email, nickname });
});

// 로그인
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    // 필수값 검증
    if (!email) {
        return res.status(400).json({ success: false, message: "이메일은 필수입니다." })
    }

    if (!password) {
        return res.status(400).json({ success: false, message: "비밀번호는 필수입니다." })
    }

    const exitUser = await prisma.user.findFirst({ where: { email } })

    if (!exitUser) {
        return res.status(401).json({ success: false, message: '이메일이 틀렸습니다.' })
    }

    if (!(await bcrypt.compare(password, exitUser.password))) {
        return res.status(401).json({ success: false, message: '비밀번호가 틀렸습니다.' })
    }

    const accessToken = jwtwebToken.sign({ userId: exitUser.userId }, 'custom-secret-key', { expiresIn: '12h' });

    res.cookie('authorization', `Bearer ${accessToken}`);

    return res.json({ accessToken });
});

// 내 정보 조회
router.get('/myInfo', jwtValidateMiddleware, async (req, res) => {
    const { userId, email, nickname } = req.user;

    return res.status(200).json({ userId, email, nickname });
});

export default router;