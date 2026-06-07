'use server';

import { prisma } from '@/lib/prisma';
import { CreateCategorySchema, UpdateCategorySchema, CreateCategoryInput, UpdateCategoryInput } from '@/lib/validations/admin';
import { revalidatePath } from 'next/cache';

// ============================================================================
// GET CATEGORIES
// ============================================================================

export async function getCategories({
  search,
  limit = 50,
  offset = 0,
}: {
  search?: string;
  limit?: number;
  offset?: number;
} = {}) {
  try {
    const where: any = {
      isActive: true,
    };

    if (search) {
      where.OR = [
        { nameDe: { contains: search, mode: 'insensitive' } },
        { nameEn: { contains: search, mode: 'insensitive' } },
      ];
    }

    const categories = await prisma.category.findMany({
      where,
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { sortOrder: 'asc' },
      take: limit,
      skip: offset,
    });

    const total = await prisma.category.count({ where });

    return {
      success: true,
      categories,
      total,
    };
  } catch (error) {
    console.error('Error fetching categories:', error);
    return {
      success: false,
      error: 'Fehler beim Laden der Kategorien',
    };
  }
}

// ============================================================================
// GET CATEGORY BY ID
// ============================================================================

export async function getCategoryById(categoryId: string) {
  try {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        products: {
          where: { isActive: true },
          take: 10,
        },
      },
    });

    if (!category) {
      return {
        success: false,
        error: 'Kategorie nicht gefunden',
      };
    }

    return {
      success: true,
      category,
    };
  } catch (error) {
    console.error('Error fetching category:', error);
    return {
      success: false,
      error: 'Fehler beim Laden der Kategorie',
    };
  }
}

// ============================================================================
// CREATE CATEGORY
// ============================================================================

export async function createCategory(input: CreateCategoryInput) {
  try {
    const validated = CreateCategorySchema.parse(input);

    const category = await prisma.category.create({
      data: {
        nameDe: validated.nameDe,
        nameEn: validated.nameEn,
        descriptionDe: validated.descriptionDe,
        descriptionEn: validated.descriptionEn,
        sortOrder: validated.sortOrder,
        imageUrl: validated.imageUrl,
        isActive: validated.isActive,
      },
    });

    revalidatePath('/backend/categories');
    revalidatePath('/backend');

    return {
      success: true,
      category,
    };
  } catch (error) {
    console.error('Error creating category:', error);
    return {
      success: false,
      error: 'Fehler beim Erstellen der Kategorie',
    };
  }
}

// ============================================================================
// UPDATE CATEGORY
// ============================================================================

export async function updateCategory(input: UpdateCategoryInput) {
  try {
    const validated = UpdateCategorySchema.parse(input);

    const { id, ...updateData } = validated;

    const category = await prisma.category.update({
      where: { id },
      data: {
        ...(updateData.nameDe && { nameDe: updateData.nameDe }),
        ...(updateData.nameEn && { nameEn: updateData.nameEn }),
        ...(updateData.descriptionDe !== undefined && { descriptionDe: updateData.descriptionDe }),
        ...(updateData.descriptionEn !== undefined && { descriptionEn: updateData.descriptionEn }),
        ...(updateData.sortOrder !== undefined && { sortOrder: updateData.sortOrder }),
        ...(updateData.imageUrl !== undefined && { imageUrl: updateData.imageUrl }),
        ...(updateData.isActive !== undefined && { isActive: updateData.isActive }),
      },
    });

    revalidatePath('/backend/categories');
    revalidatePath('/backend');

    return {
      success: true,
      category,
    };
  } catch (error) {
    console.error('Error updating category:', error);
    return {
      success: false,
      error: 'Fehler beim Aktualisieren der Kategorie',
    };
  }
}

// ============================================================================
// DELETE CATEGORY
// ============================================================================

export async function deleteCategory(categoryId: string) {
  try {
    // Check if category has products
    const productCount = await prisma.product.count({
      where: {
        categoryId,
        isActive: true,
      },
    });

    if (productCount > 0) {
      return {
        success: false,
        error: 'Kategorie enthält noch Produkte und kann nicht gelöscht werden',
      };
    }

    await prisma.category.update({
      where: { id: categoryId },
      data: { isActive: false },
    });

    revalidatePath('/backend/categories');
    revalidatePath('/backend');

    return {
      success: true,
    };
  } catch (error) {
    console.error('Error deleting category:', error);
    return {
      success: false,
      error: 'Fehler beim Löschen der Kategorie',
    };
  }
}
