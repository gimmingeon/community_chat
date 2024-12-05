import jwt from 'jsonwebtoken';
import { prisma } from '../utils/index.js'

export default async function (req, res, next) {
    try {

        // 헤더에서 accesstoken 가져오기
        const authorization = req.headers.authorization;

        if (!authorization) {
            throw new Error('토큰이 존재하지 않습니다.');
        }

        // accesstoken이 bearrer 토큰방식으로 올바른가
        const [tokenType, tokenValue] = authorization.split(' ');

        if (tokenType !== 'Bearer') {
            throw new Error('토큰 타입이 일치하지 않습니다.');
        }

        if (!tokenValue) {
            throw new Error('인증 방식이 올바르지 않습니다.');
        }

        // 12h의 유효기간과 key값이 올바른지 확인한다.
        const token = jwt.verify(tokenValue, 'custom-secret-key');

        //accessToken에 userId 데이터가 잘 들어있는지 확인
        const user = await prisma.user.findFirst({
            where: { userId: token.userId }
        });

        if (!user) {
            res.clearCookie('authorizaion');
            throw new EvalError('토큰 사용자가 존재하지 않습니다.');
        }

        req.user = user;

        // 문제없이 다음으로 넘어간다.
        next();
    } catch (err) {
        return res.status(401).json({ success: false, message: err.message });
    }
}