import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { UserService } from './user.service';

/**
 * 想让该Controller中所有的请求都不包含password字段，
 * 那可以直接用ClassSerializerInterceptor标记类
 */
@UseInterceptors(ClassSerializerInterceptor)
@ApiTags('用户管理')
@Controller('authorization/account')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * 在对应请求的地方标记使用ClassSerializerInterceptor，
   * 此时，POST /api/user/register这个请求返回的数据中，就不会包含password这个字段
   * create(@Body() createUserDto: CreateUserDto)
   * @param createUser
   * @returns
   */
  // @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({ summary: '注册用户' })
  @ApiResponse({ status: 201, type: [User] })
  @Post()
  register(@Body() createUser: CreateUserDto) {
    return this.userService.register(createUser);
  }

  @ApiOperation({ summary: '获取用户信息' })
  @ApiBearerAuth() // swagger文档设置token
  @UseGuards(AuthGuard('jwt'))
  @Get('by-token')
  getUserInfo(@Req() req) {
    return req.user;
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
