"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// ============================================================================
// GET PRODUCT OPTIONS
// ============================================================================

export async function getProductOptions(productId: string) {
  try {
    const options = await prisma.productOption.findMany({
      where: {
        productId,
        isActive: true,
      },
      orderBy: [
        { sortOrder: 'asc' },
        { createdAt: 'asc' },
      ],
    });

    // Convert Decimal to Number for serialization
    const serializedOptions = options.map((option) => ({
      ...option,
      priceAdd: Number(option.priceAdd),
    }));

    return {
      success: true,
      options: serializedOptions,
    };
  } catch (error) {
    console.error("Error fetching product options:", error);
    return {
      success: false,
      error: "Fehler beim Laden der Produktoptionen",
    };
  }
}

// ============================================================================
// CREATE PRODUCT OPTION
// ============================================================================

export async function createProductOption(input: {
  productId: string;
  name: string;
  nameDe: string;
  nameEn?: string;
  priceAdd: number;
  type: 'SIZE' | 'EXTRAS' | 'TOPPINGS' | 'SAUCES' | 'SPICE_LEVEL';
  isRequired?: boolean;
  sortOrder?: number;
}) {
  try {
    const option = await prisma.productOption.create({
      data: {
        productId: input.productId,
        name: input.name,
        nameDe: input.nameDe,
        nameEn: input.nameEn || input.nameDe,
        priceAdd: input.priceAdd,
        type: input.type,
        isRequired: input.isRequired || false,
        sortOrder: input.sortOrder || 0,
      },
    });

    revalidatePath("/backend/products");
    revalidatePath("/backend");

    // Convert Decimal to Number for serialization
    const serializedOption = {
      ...option,
      priceAdd: Number(option.priceAdd),
    };

    return {
      success: true,
      option: serializedOption,
    };
  } catch (error) {
    console.error("Error creating product option:", error);
    return {
      success: false,
      error: "Fehler beim Erstellen der Produktoption",
    };
  }
}

// ============================================================================
// UPDATE PRODUCT OPTION
// ============================================================================

export async function updateProductOption(
  id: string,
  input: {
    name?: string;
    nameDe?: string;
    nameEn?: string;
    priceAdd?: number;
    type?: 'SIZE' | 'EXTRAS' | 'TOPPINGS' | 'SAUCES' | 'SPICE_LEVEL';
    isRequired?: boolean;
    sortOrder?: number;
    isActive?: boolean;
  }
) {
  try {
    const option = await prisma.productOption.update({
      where: { id },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.nameDe !== undefined && { nameDe: input.nameDe }),
        ...(input.nameEn !== undefined && { nameEn: input.nameEn }),
        ...(input.priceAdd !== undefined && { priceAdd: input.priceAdd }),
        ...(input.type !== undefined && { type: input.type }),
        ...(input.isRequired !== undefined && { isRequired: input.isRequired }),
        ...(input.sortOrder !== undefined && { sortOrder: input.sortOrder }),
        ...(input.isActive !== undefined && { isActive: input.isActive }),
      },
    });

    revalidatePath("/backend/products");
    revalidatePath("/backend");

    // Convert Decimal to Number for serialization
    const serializedOption = {
      ...option,
      priceAdd: Number(option.priceAdd),
    };

    return {
      success: true,
      option: serializedOption,
    };
  } catch (error) {
    console.error("Error updating product option:", error);
    return {
      success: false,
      error: "Fehler beim Aktualisieren der Produktoption",
    };
  }
}

// ============================================================================
// DELETE PRODUCT OPTION
// ============================================================================

export async function deleteProductOption(id: string) {
  try {
    await prisma.productOption.update({
      where: { id },
      data: { isActive: false },
    });

    revalidatePath("/backend/products");
    revalidatePath("/backend");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error deleting product option:", error);
    return {
      success: false,
      error: "Fehler beim Löschen der Produktoption",
    };
  }
}
