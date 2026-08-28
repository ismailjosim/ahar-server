import type { MenuItemWhereInput } from '@generated/prisma/models/MenuItem';
import { Request } from 'express';

import { deleteFromCloudinary } from '@/config/multer.config';
import { prisma } from '@/config/prisma.config';
import AppError from '@/helpers/AppError';
import { calculatePagination } from '@/utils/paginationHelper';
import StatusCode from '@/utils/statusCode';

const createMenuItem = async (req: Request) => {
  const payload = req.body;
  const file = req.file as Express.Multer.File | undefined;

  const data = {
    ...payload,
    imageUrl: file?.path ?? null,
  };

  try {
    return await prisma.menuItem.create({
      data,
      include: {
        category: true,
      },
    });
  } catch (error) {
    if (file?.path) {
      await deleteFromCloudinary(file.path);
    }

    throw error;
  }
};

const getMenuItems = async (query: Record<string, unknown>) => {
  const { page, limit, skip } = calculatePagination({
    page: Number(query.page || 1),
    limit: Number(query.limit || query.pageSize || 10),
  });

  const search = typeof query.search === 'string' ? query.search : undefined;

  const categoryId = typeof query.categoryId === 'string' ? query.categoryId : undefined;

  const isAvailable = query.isAvailable !== undefined ? query.isAvailable === 'true' : undefined;

  const isFeatured = query.isFeatured !== undefined ? query.isFeatured === 'true' : undefined;

  const isSpicy = query.isSpicy !== undefined ? query.isSpicy === 'true' : undefined;

  const where: MenuItemWhereInput = {
    ...(categoryId ? { categoryId } : {}),

    ...(isAvailable !== undefined ? { isAvailable } : {}),

    ...(isFeatured !== undefined ? { isFeatured } : {}),

    ...(isSpicy !== undefined ? { isSpicy } : {}),

    ...(search
      ? {
          OR: [
            {
              name: {
                contains: search,
                mode: 'insensitive',
              },
            },
            {
              description: {
                contains: search,
                mode: 'insensitive',
              },
            },
            {
              tags: {
                has: search,
              },
            },
          ],
        }
      : {}),
  };

  const [data, total] = await Promise.all([
    prisma.menuItem.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        category: true,
      },
    }),

    prisma.menuItem.count({
      where,
    }),
  ]);

  return {
    meta: {
      page,
      limit,
      total,
    },
    data,
  };
};

const getMenuItemById = async (id: string) => {
  const menuItem = await prisma.menuItem.findUnique({
    where: {
      id,
    },
    include: {
      category: true,
    },
  });

  if (!menuItem) {
    throw new AppError(StatusCode.NOT_FOUND, 'Menu item not found');
  }

  return menuItem;
};

const updateMenuItem = async (id: string, req: Request) => {
  const existingMenuItem = await getMenuItemById(id);

  const payload = req.body;
  const file = req.file as Express.Multer.File | undefined;

  const data = {
    ...payload,
  };

  if (file) {
    data.imageUrl = file.path;
  }

  try {
    const updatedMenuItem = await prisma.menuItem.update({
      where: {
        id,
      },
      data,
      include: {
        category: true,
      },
    });

    if (file && existingMenuItem.imageUrl) {
      await deleteFromCloudinary(existingMenuItem.imageUrl);
    }

    return updatedMenuItem;
  } catch (error) {
    if (file?.path) {
      await deleteFromCloudinary(file.path);
    }

    throw error;
  }
};

const deleteMenuItem = async (id: string) => {
  const menuItem = await getMenuItemById(id);

  await prisma.menuItem.delete({
    where: {
      id,
    },
  });

  if (menuItem.imageUrl) {
    try {
      await deleteFromCloudinary(menuItem.imageUrl);
    } catch (error) {
      console.error('Failed to delete image from Cloudinary:', error);
    }
  }

  return null;
};

export const MenuItemService = {
  createMenuItem,
  getMenuItems,
  getMenuItemById,
  updateMenuItem,
  deleteMenuItem,
};
