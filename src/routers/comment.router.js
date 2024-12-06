import express from 'express';
import { prisma } from '../utils/index.js'
import jwtMiddleware from '../middleware/jwt-validate-middleware.js';

const router = express.Router();

// 댓글 생성
router.post('/:postId', jwtMiddleware, async (req, res) => {
    const { userId } = req.user;
    const { content } = req.body;
    const postId = req.params.postId;

    if (!content) {
        return res.status(400).json({ success: false, message: "내용을 입력해주세요." });
    }

    const comment = await prisma.comment.create({
        data: { content, userId: userId, postId: +postId }
    });

    return res.status(201).json({ comment });

});


// 댓글 전체조회
router.get('/:postId', async (req, res) => {
    const postId = req.params.postId;

    // 정렬 조건 특별한 값이 없으면 postId기준으로 내림차순 정렬
    const orderKey = req.query.orderkey ?? 'postId';
    const orderValue = req.query.orderValue ?? 'desc';

    if (!['asc', 'desc'].includes(orderValue.toLowerCase())) {
        return res.status(400).json({ message: 'orderValue가 올바르지 않습니다.' });
    }

    // postid, user의 닉네임, 제목, 내용, 좋아요 가져온다.
    const comments = await prisma.comment.findMany({
        where: {
            postId: +postId
        },
        select: {
            commentId: true,
            content: true,
            user: {
                select: { nickname: true }
            },
            like: true,
            createdAt: true
        },
        orderBy: [
            { [orderKey]: orderValue.toLowerCase() }
        ]
    });

    return res.json(posts);
});

// 댓글 수정
router.patch('/:postId/:commentId', jwtMiddleware, async (req, res) => {
    const postId = req.params.postId;
    const commentId = req.params.commentId;
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
})

export default router;