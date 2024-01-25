import { Request } from 'express';
import {
    Body,
    Controller,
    Delete,
    ForbiddenException,
    Get,
    HttpCode,
    InternalServerErrorException,
    NotFoundException,
    Param,
    Put,
    Req,
    UseGuards,
} from '@nestjs/common';
import { HttpStatus } from '../../../application/types/types';
import { UpdateCommentInputDto } from '../05-dto/UpdateCommentInputDto';
import { AccessTokenGuard } from '../../../application/guards/AccessTokenGuard';
import { CommentsQueryRepository } from '../04-repositories/comments-query-repository';
import { CommentService, CommentServiceError } from '../02-services/comment-service';
import { CommentIdDto } from '../05-dto/CommentIdDto';
import { CommentViewModel } from './models/output-models/CommentViewModel';
import { ResultObject } from '../../../application/result-object/ResultObject';

@Controller('comments')
export class CommentsController {
    constructor(
        private commentService: CommentService,
        // private likeService: LikeService,
        // private likesQueryRepository: LikesQueryRepository,
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
        if (result.hasErrorCode(CommentServiceError.COMMENT_NOT_FOUND)) throw new NotFoundException();

        if (result.hasErrorCode(CommentServiceError.COMMENT_ACCESS_DENIED)) throw new ForbiddenException();

        if (result.hasErrorCode(CommentServiceError.COMMENT_DELETE_ERROR)) throw new InternalServerErrorException();
        return;
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
        if (result.hasErrorCode(CommentServiceError.COMMENT_NOT_FOUND)) {
            throw new NotFoundException();
        }
        if (result.hasErrorCode(CommentServiceError.COMMENT_ACCESS_DENIED)) {
            throw new ForbiddenException();
        }
        if (result.hasErrorCode(CommentServiceError.COMMENT_DELETE_ERROR)) throw new InternalServerErrorException();
        return;
    }

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
