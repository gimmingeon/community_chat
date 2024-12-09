import express from 'express';
import { prisma } from '../utils/index.js'
import jwtwebToken from "jsonwebtoken";
import bcrypt from 'bcrypt';
import jwtMiddleware from '../middleware/jwt-validate-middleware.js';
import nodemailer from 'nodemailer';
import redisClient from '../utils/redisClient.js';

const router = express.Router();

// 이메일 인증번호 전송
router.post('/verify-email', async (req, res) => {

    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ success: false, message: "이메일을 입력해주세요." })
    }

    const exitEmail = await prisma.user.findFirst({
        where: { email }
    });

    if (exitEmail) {
        return res.status(400).json({ success: false, message: "이미 존재하는 이메일입니다." });
    }

    try {
        const verficationCode = Math.floor(1000 + Math.random() * 9000);

        await redisClient.set(`${verficationCode}`, email, { EX: 300, })

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.NODEMAILER_USER,
                pass: process.env.NODEMAILER_PASS
            }
        });

        const mailSend = {
            from: process.env.NODEMAILER_USER,
            to: email,
            subject: "이메일 인증",
            text: `계정을 인증하려면 다음의 숫자를 입력하세요: ${verficationCode}`,
        };

        await transporter.sendMail(mailSend);

        return res.status(200).json({ message: "인증번호가 전송되었습니다." });

    } catch (error) {
        return res.status(500).json({ message: '이메일 전송 중 오류가 발생했습니다.' });
    }
});

// 회원가입
router.post('/signup', async (req, res) => {
    const { verficationCode, password, passwordConfirm, nickname } = req.body;

    // 필수값 검증
    if (!verficationCode) {
        return res.status(400).json({ success: false, message: "인증번호은는 필수입니다." })
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

    const email = await redisClient.get(`${verficationCode}`);

    if (!email) {
        return res.status(400).json({ success: false, message: "틀린 인증번호입니다." });
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

    await redisClient.del(`${verficationCode}`);

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
router.get('/myInfo', jwtMiddleware, async (req, res) => {
    const { userId, email, nickname } = req.user;

    return res.status(200).json({ userId, email, nickname });
});

export default router;