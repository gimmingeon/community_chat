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
            like: true,
            createdAt: true
        },
        orderBy: [
            { [orderKey]: orderValue.toLowerCase() }
        ]
    });

    return res.json({ data: posts });
});

// 게시글 상세 조회
router.get('/:postId', async (req, res) => {

    // postId params로 가져옴
    const postId = req.params.postId;

    if (!postId) {
        return res.status(400).json({
            success: false,
            message: 'postId는 필수입니다.'
        });
    }

    // postid, user의 닉네임, 제목, 내용, 좋아요 가져온다.
    const post = await prisma.post.findFirst({

        // params로 가져온 postId는 문자다. 때문에 숫자로 바꿈
        where: { postId: Number(postId) },
        select: {
            postId: true,
            user: {
                select: { nickname: true }
            },
            title: true,
            content: true,
            like: true,
            createdAt: true
        },
    });

    if (!post) {
        return res.json({ data: {} });
    }

    return res.json({ data: posts });
});


// 게시글 수정


// 게시글 삭제



export default router;