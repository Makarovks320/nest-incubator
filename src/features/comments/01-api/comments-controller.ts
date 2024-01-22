import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Body, Get, HttpCode, Injectable, Param, Put, Req, UseGuards } from '@nestjs/common';
import { UserService } from '../../users/02-services/user-service';
import { HttpStatus } from '../../../application/types/types';
import { UpdateCommentInputDto } from '../05-dto/UpdateCommentInputDto';
import { AccessTokenGuard } from '../../../application/guards/AccessTokenGuard';
import { CommentsQueryRepository } from '../04-repositories/comments-query-repository';

@Injectable()
export class CommentsController {
    constructor(
        // private commentService: CommentService,
        private userService: UserService,
        // private likeService: LikeService,
        // private likesQueryRepository: LikesQueryRepository,
        private commentsQueryRepository: CommentsQueryRepository,
    ) {}

    // @Put(':id')
    // @UseGuards(AccessTokenGuard)
    // @HttpCode(HttpStatus.NO_CONTENT_204)
    // async updateComment(
    //     @Param('id') commentId: string,
    //     @Req() req: Request,
    //     @Body() inputModel: UpdateCommentInputDto,
    // ) {
    //     return await this.commentService.updateComment(inputModel.content, commentId, req.userId);
    // }
    // @Get(':id')
    // @HttpCode(HttpStatus.OK_200)
    // async getCommentById(@Param('id') commentId: string, req: Request, res: Response) {
    //     try {
    //         // const comment: CommentDbType | null = await this.commentsQueryRepository.getCommentById(commentId);
    //         const viewComment: CommentViewModel | null = await this.commentsQueryRepository.getCommentViewModel(
    //             commentId,
    //             req.userId,
    //         );
    //         if (!viewComment) {
    //             res.sendStatus(HttpStatus.NOT_FOUND_404);
    //             return;
    //         }
    //         res.send(viewComment);
    //     } catch (e) {
    //         if (e instanceof mongoose.Error) res.status(HttpStatus.SERVER_ERROR_500).send('Db Error');
    //         res.sendStatus(HttpStatus.SERVER_ERROR_500);
    //     }
    // }

    // async deleteCommentById(req: Request, res: Response) {
    //     const commentObjectId: ObjectId = stringToObjectIdMapper(req.params.id);
    //     const comment: CommentDbType | null = await this.commentsQueryRepository.getCommentById(commentObjectId);
    //     const user: UserDBModel | null = await this.userService.findUserById(req.userId!);
    //     if (!user || comment!.commentatorInfo.userLogin != user.accountData.userName) {
    //         res.status(HttpStatus.FORBIDDEN_403).send('Comment is not your own');
    //         return;
    //     } else {
    //         await this.commentService.deleteCommentById(req.params.id);
    //         res.sendStatus(HttpStatus.NO_CONTENT_204);
    //     }
    // }
    //
    // async changeLikeStatus(req: Request, res: Response) {
    //     try {
    //         await this.commentService.changeLikeStatus(req.params.id, req.body.likeStatus, req.userId);
    //         // await this.likeService.changeLikeStatus(req.params.id, req.body.likeStatus, req.userId);
    //         res.sendStatus(HttpStatus.NO_CONTENT_204);
    //     } catch (e) {
    //         if (e instanceof mongoose.Error) res.status(HttpStatus.SERVER_ERROR_500).send('Db error');
    //         res.status(HttpStatus.SERVER_ERROR_500).send('Something went wrong');
    //     }
    // }
}
