import express from 'express';
import { prisma } from '../utils/index.js'
import jwtMiddleware from '../middleware/jwt-validate-middleware.js';

const router = express.Router();

// 게시글 생성
router.post('/', jwtMiddleware, async (req, res) => {
    const { userId } = req.user;
    const { title, content } = req.body;

    if (!title) {
        return res.status(400).json({ success: false, message: "제목을 입력해주세요." });
    }

    if (!content) {
        return res.status(400).json({ success: false, message: "내용을 입력해주세요." });
    }

    const post = await prisma.post.create({
        data: { title, content, userId: userId }
    });

    return res.status(201).json({ post });

});


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

    return res.json(posts);
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

    return res.json({ data: post });
});


// 게시글 수정
router.patch('/:postId', jwtMiddleware, async (req, res) => {
    const postId = req.params.postId;
    const { userId } = req.user;
    const { title, content } = req.body;

    if (!postId) {
        return res.status(400).json({
            success: false,
            message: 'postId는 필수입니다.'
        });
    }

    if (!title) {
        return res.status(400).json({
            success: false,
            message: '제목을 입력해주세요.'
        });
    }

    if (!content) {
        return res.status(400).json({
            success: false,
            message: '내용을 입력해주세요.'
        });
    }

    const post = await prisma.post.findFirst({ where: { postId: Number(postId) } });

    if (!post) {
        return res.status(404).json({
            success: false,
            message: '존재하지 않는 게시글입니다.'
        });
    }

    if (post.userId !== userId) {
        return res.status(403).json({
            success: false,
            message: '게시글은 작성자만 수정할 수 있습니다.'
        });
    }

    const patchPost = await prisma.post.update({
        where: { postId: post.postId },
        data: { title, content }

    });

    return res.status(200).json({ patchPost });
});

// 게시글 삭제
router.delete('/:postId', jwtMiddleware, async (req, res) => {
    const { userId } = req.user;
    const postId = req.params.postId;

    if (!postId) {
        return res.status(400).json({
            success: false,
            message: 'postId는 필수입니다.'
        });
    }

    const post = await prisma.post.findFirst({ where: { postId: Number(postId) } });

    if (!post) {
        return res.status(404).json({
            success: false,
            message: '존재하지 않는 게시글입니다.'
        });
    }

    if (post.userId !== userId) {
        return res.status(403).json({
            success: false,
            message: '게시글은 작성자만 삭제할 수 있습니다.'
        });
    }

    await prisma.post.delete({
        where: { postId: post.postId }
    });

    return res.status(201).json({ message: "게시글이 삭제되었습니다." })
});


export default router;