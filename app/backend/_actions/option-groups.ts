"use server";

import { prisma } from "@/lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";
import { revalidatePath } from "next/cache";

// ============================================================================
// GET OPTION GROUPS FOR PRODUCT
// ============================================================================

export async function getOptionGroups(productId: string) {
  try {
    const optionGroups = await prisma.productOptionGroup.findMany({
      where: { productId },
      include: {
        values: {
          orderBy: { sortOrder: 'asc' },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });

    // Convert Decimal to Number for serialization
    const serializedGroups = optionGroups.map(group => ({
      ...group,
      values: group.values.map(value => ({
        ...value,
        extraPrice: Number(value.extraPrice),
      })),
    }));

    return {
      success: true,
      optionGroups: serializedGroups,
    };
  } catch (error) {
    console.error("Error fetching option groups:", error);
    return {
      success: false,
      error: "Fehler beim Laden der Optionsgruppen",
    };
  }
}

// ============================================================================
// CREATE OPTION GROUP
// ============================================================================

export async function createOptionGroup(input: {
  productId: string;
  nameDe: string;
  nameEn?: string;
  sortOrder?: number;
  isActive?: boolean;
  isRequired?: boolean;
  minSelection?: number;
  maxSelection?: number;
}) {
  try {
    const optionGroup = await prisma.productOptionGroup.create({
      data: {
        productId: input.productId,
        nameDe: input.nameDe,
        nameEn: input.nameEn || null,
        sortOrder: input.sortOrder || 0,
        isActive: input.isActive !== undefined ? input.isActive : true,
        isRequired: input.isRequired !== undefined ? input.isRequired : false,
        minSelection: input.minSelection || 0,
        maxSelection: input.maxSelection || 1,
      },
      include: {
        values: true,
      },
    });

    revalidatePath("/backend/products");

    // Convert Decimal to Number for serialization
    const serializedGroup = {
      ...optionGroup,
      values: optionGroup.values.map(value => ({
        ...value,
        extraPrice: Number(value.extraPrice),
      })),
    };

    return {
      success: true,
      optionGroup: serializedGroup,
    };
  } catch (error) {
    console.error("Error creating option group:", error);
    return {
      success: false,
      error: "Fehler beim Erstellen der Optionsgruppe",
    };
  }
}

// ============================================================================
// UPDATE OPTION GROUP
// ============================================================================

export async function updateOptionGroup(
  id: string,
  input: {
    nameDe?: string;
    nameEn?: string;
    sortOrder?: number;
    isActive?: boolean;
    isRequired?: boolean;
    minSelection?: number;
    maxSelection?: number;
  }
) {
  try {
    const optionGroup = await prisma.productOptionGroup.update({
      where: { id },
      data: {
        ...(input.nameDe !== undefined && { nameDe: input.nameDe }),
        ...(input.nameEn !== undefined && { nameEn: input.nameEn }),
        ...(input.sortOrder !== undefined && { sortOrder: input.sortOrder }),
        ...(input.isActive !== undefined && { isActive: input.isActive }),
        ...(input.isRequired !== undefined && { isRequired: input.isRequired }),
        ...(input.minSelection !== undefined && { minSelection: input.minSelection }),
        ...(input.maxSelection !== undefined && { maxSelection: input.maxSelection }),
      },
      include: {
        values: true,
      },
    });

    revalidatePath("/backend/products");

    // Convert Decimal to Number for serialization
    const serializedGroup = {
      ...optionGroup,
      values: optionGroup.values.map(value => ({
        ...value,
        extraPrice: Number(value.extraPrice),
      })),
    };

    return {
      success: true,
      optionGroup: serializedGroup,
    };
  } catch (error) {
    console.error("Error updating option group:", error);
    return {
      success: false,
      error: "Fehler beim Aktualisieren der Optionsgruppe",
    };
  }
}

// ============================================================================
// DELETE OPTION GROUP
// ============================================================================

export async function deleteOptionGroup(id: string) {
  try {
    await prisma.productOptionGroup.delete({
      where: { id },
    });

    revalidatePath("/backend/products");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error deleting option group:", error);
    return {
      success: false,
      error: "Fehler beim Löschen der Optionsgruppe",
    };
  }
}

// ============================================================================
// CREATE OPTION VALUE
// ============================================================================

export async function createOptionValue(
  optionGroupId: string,
  input: {
    nameDe: string;
    nameEn?: string;
    extraPrice?: number;
    sortOrder?: number;
    isActive?: boolean;
    isDefault?: boolean;
  }
) {
  try {
    const optionValue = await prisma.productOptionValue.create({
      data: {
        optionGroupId,
        nameDe: input.nameDe,
        nameEn: input.nameEn || null,
        extraPrice: new Decimal(input.extraPrice || 0),
        sortOrder: input.sortOrder || 0,
        isActive: input.isActive !== undefined ? input.isActive : true,
        isDefault: input.isDefault !== undefined ? input.isDefault : false,
      },
    });

    revalidatePath("/backend/products");

    // Convert Decimal to Number for serialization
    const serializedValue = {
      ...optionValue,
      extraPrice: Number(optionValue.extraPrice),
    };

    return {
      success: true,
      optionValue: serializedValue,
    };
  } catch (error) {
    console.error("Error creating option value:", error);
    return {
      success: false,
      error: "Fehler beim Erstellen des Optionswerts",
    };
  }
}

// ============================================================================
// UPDATE OPTION VALUE
// ============================================================================

export async function updateOptionValue(
  id: string,
  input: {
    nameDe?: string;
    nameEn?: string;
    extraPrice?: number;
    sortOrder?: number;
    isActive?: boolean;
    isDefault?: boolean;
  }
) {
  try {
    const optionValue = await prisma.productOptionValue.update({
      where: { id },
      data: {
        ...(input.nameDe !== undefined && { nameDe: input.nameDe }),
        ...(input.nameEn !== undefined && { nameEn: input.nameEn }),
        ...(input.extraPrice !== undefined && { extraPrice: new Decimal(input.extraPrice) }),
        ...(input.sortOrder !== undefined && { sortOrder: input.sortOrder }),
        ...(input.isActive !== undefined && { isActive: input.isActive }),
        ...(input.isDefault !== undefined && { isDefault: input.isDefault }),
      },
    });

    revalidatePath("/backend/products");

    // Convert Decimal to Number for serialization
    const serializedValue = {
      ...optionValue,
      extraPrice: Number(optionValue.extraPrice),
    };

    return {
      success: true,
      optionValue: serializedValue,
    };
  } catch (error) {
    console.error("Error updating option value:", error);
    return {
      success: false,
      error: "Fehler beim Aktualisieren des Optionswerts",
    };
  }
}

// ============================================================================
// DELETE OPTION VALUE
// ============================================================================

export async function deleteOptionValue(id: string) {
  try {
    await prisma.productOptionValue.delete({
      where: { id },
    });

    revalidatePath("/backend/products");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error deleting option value:", error);
    return {
      success: false,
      error: "Fehler beim Löschen des Optionswerts",
    };
  }
}
