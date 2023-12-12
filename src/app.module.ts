import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BlogsController } from './features/blogs/01-api/blogs.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { BlogService } from './features/blogs/02-services/blog-service';
import { BlogsRepository } from './features/blogs/04-repositories/blogs-repository';
import { appConfig } from './utils/config';
import {Blog, BlogSchema} from './features/blogs/03-domain/blog-db-model';

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
