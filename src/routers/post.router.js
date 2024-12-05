import express from 'express';
import { prisma } from '../utils/index.js'
import jwtMiddleware from '../middleware/jwt-validate-middleware.js';

const router = express.Router();

// 게시글 전체조회
router.get('/', async (req, res) => {

    // 정렬 조건 특별한 값이 없으면 postId기준으로 내림차순 정렬
    const orderKey = req.query.orderkey ?? 'postId';
    const orderValue = req.query.orderValue ?? 'desc';

    if (!['asc', 'desc'].includes(orderValue.toLowerCase())) {
        return res.status(400).json({ message: 'orderValue가 올바르지 않습니다.' });
    }

    // postid, user의 닉네임, 제목, 내용, 좋아요 가져온다.
    const posts = await prisma.post.findMany({
        select: {
            postId: true,
            user: {
                select: { nickname: true }
            },
            title: true,
            content: true,
            like: true,
        },
        orderBy: [
            { [orderKey]: orderValue.toLowerCase() }
        ]
    });

    return res.json({ data: posts });
});


// 게시글 전체 조회


// 게시글 상세 조회


// 게시글 수정


// 게시글 삭제



export default router;