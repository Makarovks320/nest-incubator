import { Request, Response } from 'express';
import mongoose from 'mongoose';
import {
    Body,
    Controller,
    Get,
    HttpCode,
    NotFoundException,
    Param,
    Put,
    Req,
    UnauthorizedException,
    UseGuards,
} from '@nestjs/common';
import { UserService } from '../../users/02-services/user-service';
import { HttpStatus } from '../../../application/types/types';
import { UpdateCommentInputDto } from '../05-dto/UpdateCommentInputDto';
import { AccessTokenGuard } from '../../../application/guards/AccessTokenGuard';
import { CommentsQueryRepository } from '../04-repositories/comments-query-repository';
import { CommentService } from '../02-services/comment-service';
import { CommentIdDto } from '../05-dto/CommentIdDto';
import { CommentViewModel } from './models/output-models/CommentViewModel';

@Controller('comments')
export class CommentsController {
    constructor(
        private commentService: CommentService,
        private userService: UserService,
        // private likeService: LikeService,
        // private likesQueryRepository: LikesQueryRepository,
        private commentsQueryRepository: CommentsQueryRepository,
    ) {}

    @Put(':id')
    @UseGuards(AccessTokenGuard)
    @HttpCode(HttpStatus.NO_CONTENT_204)
    async updateComment(
        @Param('id') commentId: string,
        @Req() req: Request,
        @Body() inputModel: UpdateCommentInputDto,
    ) {
        return await this.commentService.updateComment(inputModel.content, commentId, req.userId);
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK_200)
    async getCommentById(@Param() uriParam: CommentIdDto, req: Request) {
        const viewComment: CommentViewModel | null = await this.commentsQueryRepository.getCommentViewModel(
            uriParam.id,
            req.userId,
        );
        if (!viewComment) throw new NotFoundException();
        return viewComment;
    }

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
