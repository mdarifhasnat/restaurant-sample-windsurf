"use server";

import { prisma } from "@/lib/prisma";
import {
  CreateProductInput,
  CreateProductSchema,
  UpdateProductInput,
  UpdateProductSchema,
} from "@/lib/validations/admin";
import { Decimal } from "@prisma/client/runtime/library";
import { revalidatePath } from "next/cache";

// ============================================================================
// GET PRODUCTS
// ============================================================================

export async function getProducts({
  categoryId,
  search,
  limit = 50,
  offset = 0,
}: {
  categoryId?: string;
  search?: string;
  limit?: number;
  offset?: number;
} = {}) {
  try {
    const where: any = {
      isActive: true,
    };

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (search) {
      where.OR = [
        { nameDe: { contains: search, mode: "insensitive" } },
        { nameEn: { contains: search, mode: "insensitive" } },
      ];
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
        images: true,
      },
      orderBy: { nameDe: "asc" },
      take: limit,
      skip: offset,
    });

    const total = await prisma.product.count({ where });

    // Convert Decimal to Number for serialization
    const serializedProducts = products.map((product) => ({
      ...product,
      price: Number(product.price),
    }));

    return {
      success: true,
      products: serializedProducts,
      total,
    };
  } catch (error) {
    console.error("Error fetching products:", error);
    return {
      success: false,
      error: "Fehler beim Laden der Produkte",
    };
  }
}

// ============================================================================
// GET PRODUCT BY ID
// ============================================================================

export async function getProductById(productId: string) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        category: true,
        images: true,
      },
    });

    if (!product) {
      return {
        success: false,
        error: "Produkt nicht gefunden",
      };
    }

    // Convert Decimal to Number for serialization
    const serializedProduct = {
      ...product,
      price: Number(product.price),
    };

    return {
      success: true,
      product: serializedProduct,
    };
  } catch (error) {
    console.error("Error fetching product:", error);
    return {
      success: false,
      error: "Fehler beim Laden des Produkts",
    };
  }
}

// ============================================================================
// CREATE PRODUCT
// ============================================================================

export async function createProduct(input: CreateProductInput) {
  try {
    const validated = CreateProductSchema.parse(input);

    const product = await prisma.product.create({
      data: {
        name: validated.name,
        nameDe: validated.nameDe,
        nameEn: validated.nameEn || validated.nameDe,
        description: validated.description,
        descriptionDe: validated.descriptionDe,
        descriptionEn: validated.descriptionEn || validated.descriptionDe,
        price: new Decimal(validated.price),
        categoryId: validated.categoryId,
        isActive: validated.isActive,
        isAvailable: validated.isAvailable,
        allergens: validated.allergens,
        calories: validated.calories,
        preparationTime: validated.preparationTime,
      },
      include: {
        category: true,
      },
    });

    revalidatePath("/backend/products");
    revalidatePath("/backend");

    // Convert Decimal to Number for serialization
    const serializedProduct = {
      ...product,
      price: Number(product.price),
    };

    return {
      success: true,
      product: serializedProduct,
    };
  } catch (error) {
    console.error("Error creating product:", error);
    return {
      success: false,
      error: "Fehler beim Erstellen des Produkts",
    };
  }
}

// ============================================================================
// UPDATE PRODUCT
// ============================================================================

export async function updateProduct(input: UpdateProductInput) {
  try {
    const validated = UpdateProductSchema.parse(input);

    const { id, ...updateData } = validated;

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(updateData.name !== undefined && { name: updateData.name }),
        ...(updateData.nameDe !== undefined && { nameDe: updateData.nameDe }),
        ...(updateData.nameEn !== undefined && { 
          nameEn: updateData.nameEn || updateData.nameDe 
        }),
        ...(updateData.description !== undefined && { description: updateData.description }),
        ...(updateData.descriptionDe !== undefined && { descriptionDe: updateData.descriptionDe }),
        ...(updateData.descriptionEn !== undefined && { 
          descriptionEn: updateData.descriptionEn || updateData.descriptionDe 
        }),
        ...(updateData.price && { price: new Decimal(updateData.price) }),
        ...(updateData.categoryId && { categoryId: updateData.categoryId }),
        ...(updateData.isActive !== undefined && {
          isActive: updateData.isActive,
        }),
        ...(updateData.isAvailable !== undefined && {
          isAvailable: updateData.isAvailable,
        }),
        ...(updateData.allergens !== undefined && {
          allergens: updateData.allergens,
        }),
        ...(updateData.calories !== undefined && {
          calories: updateData.calories,
        }),
        ...(updateData.preparationTime !== undefined && {
          preparationTime: updateData.preparationTime,
        }),
      },
      include: {
        category: true,
      },
    });

    revalidatePath("/backend/products");
    revalidatePath("/backend");

    // Convert Decimal to Number for serialization
    const serializedProduct = {
      ...product,
      price: Number(product.price),
    };

    return {
      success: true,
      product: serializedProduct,
    };
  } catch (error) {
    console.error("Error updating product:", error);
    return {
      success: false,
      error: "Fehler beim Aktualisieren des Produkts",
    };
  }
}

// ============================================================================
// DELETE PRODUCT
// ============================================================================

export async function deleteProduct(productId: string) {
  try {
    await prisma.product.update({
      where: { id: productId },
      data: { isActive: false },
    });

    revalidatePath("/backend/products");
    revalidatePath("/backend");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error deleting product:", error);
    return {
      success: false,
      error: "Fehler beim Löschen des Produkts",
    };
  }
}

// ============================================================================
// TOGGLE PRODUCT AVAILABILITY
// ============================================================================

export async function toggleProductAvailability(productId: string) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return {
        success: false,
        error: "Produkt nicht gefunden",
      };
    }

    const updated = await prisma.product.update({
      where: { id: productId },
      data: { isAvailable: !product.isAvailable },
    });

    revalidatePath("/backend/products");
    revalidatePath("/backend");

    // Convert Decimal to Number for serialization
    const serializedProduct = {
      ...updated,
      price: Number(updated.price),
    };

    return {
      success: true,
      product: serializedProduct,
    };
  } catch (error) {
    console.error("Error toggling product availability:", error);
    return {
      success: false,
      error: "Fehler beim Ändern der Verfügbarkeit",
    };
  }
}
