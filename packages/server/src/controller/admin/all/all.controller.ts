import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { AritcleProvider } from 'src/provider/article/article.provider';
import { AdminGuard } from 'src/provider/auth/auth.guard';
import { CategoryProvider } from 'src/provider/category/category.provider';
import { DraftProvider } from 'src/provider/draft/draft.provider';
import { MetaProvider } from 'src/provider/meta/meta.provider';
import { TagProvider } from 'src/provider/tag/tag.provider';
import { UserProvider } from 'src/provider/user/user.provider';
import * as fs from 'fs';
import { FileInterceptor } from '@nestjs/platform-express';
import { removeID } from 'src/utils/removeId';

@ApiTags('about')
@UseGuards(AdminGuard)
@Controller('/api/admin/all')
export class AllController {
  constructor(
    private readonly articleProvider: AritcleProvider,
    private readonly categoryProvider: CategoryProvider,
    private readonly tagProvider: TagProvider,
    private readonly metaProvider: MetaProvider,
    private readonly draftProvider: DraftProvider,
    private readonly userProvider: UserProvider,
  ) {}

  @Get()
  async getAll() {
    const articles = await this.articleProvider.getAll();
    const categories = await this.categoryProvider.getAllCategories();
    const tags = await this.tagProvider.getAllTags();
    const meta = await this.metaProvider.getAll();
    const drafts = await this.draftProvider.getAll();
    const user = await this.userProvider.getUser();
    const data = {
      articles,
      tags,
      meta,
      drafts,
      categories,
      user,
    };
    return {
      statusCode: 200,
      data,
    };
  }
  @Post('/import')
  @UseInterceptors(FileInterceptor('file'))
  async importAll(@UploadedFile() file: Express.Multer.File) {
    const json = file.buffer.toString();
    const data = JSON.parse(json);
    // eslint-disable-next-line prefer-const
    let { articles, meta, drafts, user } = data;
    // 去掉 id
    articles = removeID(articles);
    drafts = removeID(drafts);
    delete user._id
    delete user.__v
    delete meta._id

    await this.articleProvider.importArticles(articles);
    await this.draftProvider.importDrafts(drafts);
    await this.userProvider.updateUser(user);
    await this.metaProvider.update(meta);
    return {
      statusCode: 200,
      data: '导入成功！',
    };
  }
}
