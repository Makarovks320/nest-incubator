import { Request } from 'express';
import { Body, Controller, Delete, Get, HttpCode, NotFoundException, Param, Put, Req, UseGuards } from '@nestjs/common';
import { HttpStatus } from '../../../application/types/types';
import { UpdateCommentInputDto } from '../05-dto/UpdateCommentInputDto';
import { AccessTokenGuard } from '../../../application/guards/AccessTokenGuard';
import { CommentsQueryRepository } from '../04-repositories/comments-query-repository';
import { CommentService } from '../02-services/comment-service';
import { CommentIdDto } from '../05-dto/CommentIdDto';
import { CommentViewModel } from './models/output-models/CommentViewModel';
import { ResultObject } from '../../../application/result-object/ResultObject';
import { LikeStatusUpdateDto } from '../../likes/05-dto/LikeStatusUpdateDto';
import { handleResultObject } from '../../../application/result-object/ServiceErrorList';

@Controller('comments')
export class CommentsController {
    constructor(
        private commentService: CommentService,
        private commentsQueryRepository: CommentsQueryRepository,
    ) {}

    @Put('/:id')
    @UseGuards(AccessTokenGuard)
    @HttpCode(HttpStatus.NO_CONTENT_204)
    async updateComment(
        @Param('id') commentId: string,
        @Req() req: Request,
        @Body() inputModel: UpdateCommentInputDto,
    ) {
        const result = await this.commentService.updateComment(inputModel.content, commentId, req.userId);
        handleResultObject(result);
    }

    @Get('/:id')
    @HttpCode(HttpStatus.OK_200)
    async getCommentById(@Param() uriParam: CommentIdDto, @Req() req: Request) {
        const viewComment: CommentViewModel | null = await this.commentsQueryRepository.getCommentViewModel(
            uriParam.id,
            req.userId,
        );
        if (!viewComment) throw new NotFoundException();
        return viewComment;
    }

    @Delete('/:id')
    @UseGuards(AccessTokenGuard)
    @HttpCode(HttpStatus.NO_CONTENT_204)
    async deleteCommentById(@Param('id') commentId: string, @Req() req: Request) {
        const result: ResultObject = await this.commentService.deleteCommentById(commentId, req.userId);
        handleResultObject(result);
    }
    @Put('/:id/like-status')
    @UseGuards(AccessTokenGuard)
    @HttpCode(HttpStatus.NO_CONTENT_204)
    async changeLikeStatus(@Param('id') commentId: string, @Body() input: LikeStatusUpdateDto, @Req() req: Request) {
        const result: ResultObject = await this.commentService.changeLikeStatus(
            commentId,
            input.likeStatus,
            req.userId,
        );
        handleResultObject(result);
    }
}
