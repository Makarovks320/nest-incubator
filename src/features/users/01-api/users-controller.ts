import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    NotFoundException,
    Param,
    Post,
    Query,
    UseGuards,
} from '@nestjs/common';
import { UserService } from '../02-services/user-service';
import { UsersQueryRepository } from '../04-repositories/users-query-repository';
import { HttpStatus, WithPagination } from '../../../application/types/types';
import { UserViewModel } from '../types/user-view-model';
import { UsersDataMapper } from './users-data-mapper';
import { UsersInputQueryParams, UsersQueryParams } from '../types/users-query-params';
import { getQueryParamsForUsers } from '../../../application/helpers/get-query-params';
import { UserDocument } from '../03-domain/user-db-model';
import { RefreshTokenGuard } from '../../../application/guards/basicAuthGuard';
import { CreateUserInputDto } from '../05-dto/CreateUserInputDto';

@Controller('users')
@UseGuards(RefreshTokenGuard)
export class UsersController {
    constructor(
        private userService: UserService,
        private usersQueryRepository: UsersQueryRepository,
    ) {}

    @Post()
    @HttpCode(HttpStatus.CREATED_201)
    async createNewUser(@Body() inputModel: CreateUserInputDto) {
        const createdUser: UserViewModel = await this.userService.createUser(inputModel);
        return createdUser;
    }

    @Get()
    @HttpCode(HttpStatus.OK_200)
    async getUsers(@Query() query: UsersInputQueryParams) {
        const queryParams: UsersQueryParams = getQueryParamsForUsers(query);
        const users: WithPagination<UserViewModel> = await this.usersQueryRepository.getUsers(queryParams);
        return users;
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK_200)
    async getUserById(@Param('id') userId: string) {
        const userDB: UserDocument | null = await this.userService.findUserById(userId);
        if (!userDB) {
            throw new NotFoundException();
        }
        return UsersDataMapper.getUserViewModel(userDB);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT_204)
    async deleteUserById(@Param('id') userId: string) {
        const isDeleted = await this.userService.deleteUserById(userId);
        if (!isDeleted) {
            throw new NotFoundException();
        }
        return;
    }

    @Delete()
    @HttpCode(HttpStatus.NO_CONTENT_204)
    async deleteAllUsers() {
        return await this.userService.deleteAllUsers();
    }
}
