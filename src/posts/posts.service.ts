import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getRepository, Repository } from 'typeorm';
import { PostsEntity } from './entities/posts.entity';

export interface PostsRo {
  currentPage: number;
  items: PostsEntity[];
  itemsPerPage: number;
  totalPages: number;
  totalItems: number;
}
@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(PostsEntity)
    private readonly postsRepository: Repository<PostsEntity>,
  ) {}

  // 创建文章
  async create(post: Partial<PostsEntity>): Promise<PostsEntity> {
    const { title } = post;
    const doc = await this.postsRepository.findOne({ where: { title } });
    if (doc) {
      throw new HttpException('文章已存在', 400);
    }
    return await this.postsRepository.save(post);
  }

  // 获取文章列表
  async findAll(query): Promise<PostsRo> {
    const qb = await getRepository(PostsEntity).createQueryBuilder('post');
    qb.where('1 = 1');
    qb.orderBy('post.create_time', 'DESC');

    const totalItems = await qb.getCount();
    const { pageIndex = 1, pageSize = 10, ...params } = query;
    qb.limit(pageSize);
    qb.offset(pageSize * (pageIndex - 1));

    const totalPages =
      totalItems % pageSize == 0
        ? totalItems / pageSize
        : totalItems / pageSize + 1;
    const posts = await qb.getMany();
    return {
      items: posts,
      totalItems,
      currentPage: pageIndex,
      itemsPerPage: pageSize,
      totalPages,
    };
  }

  // 获取指定文章
  async findById(id): Promise<PostsEntity> {
    return await this.postsRepository.findOne(id);
  }

  // 更新文章
  async updateById(id, post): Promise<PostsEntity> {
    const existPost = await this.postsRepository.findOne(id);
    if (!existPost) {
      throw new HttpException(`id为${id}的文章不存在`, 400);
    }
    const updatePost = this.postsRepository.merge(existPost, post);
    return this.postsRepository.save(updatePost);
  }

  // 刪除文章
  async remove(id) {
    const existPost = await this.postsRepository.findOne(id);
    if (!existPost) {
      throw new HttpException(`id为${id}的文章不存在`, 400);
    }
    return await this.postsRepository.remove(existPost);
  }
}
