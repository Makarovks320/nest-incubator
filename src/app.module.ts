import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BlogsController } from './features/blogs/blogs.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { BlogService } from './features/blogs/services/blog-service';
import { BlogsRepository } from './features/blogs/repositories/blogs-repository';
import { appConfig } from './utils/config';
import {Blog, BlogSchema} from './features/blogs/domain/blog-db-model';

@Module({
  imports: [
    MongooseModule.forRoot(appConfig.mongoUrl, {
      dbName: appConfig.dbName,
    }),
    MongooseModule.forFeature([{
      name: Blog.name,
      schema: BlogSchema
    }]),
  ],
  controllers: [AppController, BlogsController],
  providers: [AppService, BlogService, BlogsRepository],
})
export class AppModule {}
