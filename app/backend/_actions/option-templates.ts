'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// ============================================================================
// Option Group Template CRUD
// ============================================================================

export async function getOptionGroupTemplates() {
  try {
    const templates = await prisma.optionGroupTemplate.findMany({
      where: {
        isActive: true,
      },
      include: {
        values: {
          where: {
            isActive: true,
          },
          orderBy: {
            sortOrder: 'asc',
          },
        },
      },
      orderBy: {
        sortOrder: 'asc',
      },
    });
    return { success: true, templates };
  } catch (error) {
    console.error('Error fetching option group templates:', error);
    return { success: false, error: 'Fehler beim Abrufen der Optionsgruppen-Vorlagen' };
  }
}

export async function getOptionGroupTemplate(id: string) {
  try {
    const template = await prisma.optionGroupTemplate.findUnique({
      where: { id },
      include: {
        values: {
          orderBy: {
            sortOrder: 'asc',
          },
        },
      },
    });
    if (!template) {
      return { success: false, error: 'Vorlage nicht gefunden' };
    }
    return { success: true, template };
  } catch (error) {
    console.error('Error fetching option group template:', error);
    return { success: false, error: 'Fehler beim Abrufen der Optionsgruppen-Vorlage' };
  }
}

export async function createOptionGroupTemplate(input: {
  nameDe: string;
  nameEn?: string;
  isRequired?: boolean;
  minSelection?: number;
  maxSelection?: number;
  sortOrder?: number;
  isActive?: boolean;
}) {
  try {
    const template = await prisma.optionGroupTemplate.create({
      data: {
        nameDe: input.nameDe,
        nameEn: input.nameEn || null,
        isRequired: input.isRequired ?? false,
        minSelection: input.minSelection ?? 0,
        maxSelection: input.maxSelection ?? 1,
        sortOrder: input.sortOrder ?? 0,
        isActive: input.isActive ?? true,
      },
    });
    revalidatePath('/backend/settings');
    return { success: true, template };
  } catch (error) {
    console.error('Error creating option group template:', error);
    return { success: false, error: 'Fehler beim Erstellen der Optionsgruppen-Vorlage' };
  }
}

export async function updateOptionGroupTemplate(
  id: string,
  input: {
    nameDe?: string;
    nameEn?: string;
    isRequired?: boolean;
    minSelection?: number;
    maxSelection?: number;
    sortOrder?: number;
    isActive?: boolean;
  }
) {
  try {
    const template = await prisma.optionGroupTemplate.update({
      where: { id },
      data: input,
    });
    revalidatePath('/backend/settings');
    return { success: true, template };
  } catch (error) {
    console.error('Error updating option group template:', error);
    return { success: false, error: 'Fehler beim Aktualisieren der Optionsgruppen-Vorlage' };
  }
}

export async function deleteOptionGroupTemplate(id: string) {
  try {
    await prisma.optionGroupTemplate.delete({
      where: { id },
    });
    revalidatePath('/backend/settings');
    return { success: true };
  } catch (error) {
    console.error('Error deleting option group template:', error);
    return { success: false, error: 'Fehler beim Löschen der Optionsgruppen-Vorlage' };
  }
}

// ============================================================================
// Option Group Template Value CRUD
// ============================================================================

export async function createOptionTemplateValue(
  templateId: string,
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
    const value = await prisma.optionGroupTemplateValue.create({
      data: {
        templateId,
        nameDe: input.nameDe,
        nameEn: input.nameEn || null,
        extraPrice: input.extraPrice || 0,
        sortOrder: input.sortOrder ?? 0,
        isActive: input.isActive ?? true,
        isDefault: input.isDefault ?? false,
      },
    });
    revalidatePath('/backend/settings');
    return { success: true, value };
  } catch (error) {
    console.error('Error creating option template value:', error);
    return { success: false, error: 'Fehler beim Erstellen des Optionswertes' };
  }
}

export async function updateOptionTemplateValue(
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
    const value = await prisma.optionGroupTemplateValue.update({
      where: { id },
      data: input,
    });
    revalidatePath('/backend/settings');
    return { success: true, value };
  } catch (error) {
    console.error('Error updating option template value:', error);
    return { success: false, error: 'Fehler beim Aktualisieren des Optionswertes' };
  }
}

export async function deleteOptionTemplateValue(id: string) {
  try {
    await prisma.optionGroupTemplateValue.delete({
      where: { id },
    });
    revalidatePath('/backend/settings');
    return { success: true };
  } catch (error) {
    console.error('Error deleting option template value:', error);
    return { success: false, error: 'Fehler beim Löschen des Optionswertes' };
  }
}

// ============================================================================
// Product Assignment
// ============================================================================

export async function assignTemplateToProduct(productId: string, templateId: string, sortOrder?: number) {
  try {
    const assignment = await prisma.productOptionGroupAssignment.create({
      data: {
        productId,
        templateId,
        sortOrder: sortOrder ?? 0,
      },
    });
    revalidatePath('/backend/products');
    return { success: true, assignment };
  } catch (error) {
    console.error('Error assigning template to product:', error);
    return { success: false, error: 'Fehler beim Zuweisen der Vorlage zum Produkt' };
  }
}

export async function removeTemplateFromProduct(productId: string, templateId: string) {
  try {
    await prisma.productOptionGroupAssignment.deleteMany({
      where: {
        productId,
        templateId,
      },
    });
    revalidatePath('/backend/products');
    return { success: true };
  } catch (error) {
    console.error('Error removing template from product:', error);
    return { success: false, error: 'Fehler beim Entfernen der Vorlage vom Produkt' };
  }
}

export async function toggleProductTemplateDisabled(productId: string, templateId: string) {
  try {
    const assignment = await prisma.productOptionGroupAssignment.findUnique({
      where: {
        productId_templateId: {
          productId,
          templateId,
        },
      },
    });

    if (!assignment) {
      return { success: false, error: 'Zuweisung nicht gefunden' };
    }

    const updated = await prisma.productOptionGroupAssignment.update({
      where: {
        productId_templateId: {
          productId,
          templateId,
        },
      },
      data: {
        isDisabled: !assignment.isDisabled,
      },
    });
    revalidatePath('/backend/products');
    return { success: true, assignment: updated };
  } catch (error) {
    console.error('Error toggling template disabled:', error);
    return { success: false, error: 'Fehler beim Umschalten der Vorlage' };
  }
}

// ============================================================================
// Category Assignment
// ============================================================================

export async function assignTemplateToCategory(categoryId: string, templateId: string, sortOrder?: number) {
  try {
    const assignment = await prisma.categoryOptionGroupAssignment.create({
      data: {
        categoryId,
        templateId,
        sortOrder: sortOrder ?? 0,
      },
    });
    revalidatePath('/backend/categories');
    return { success: true, assignment };
  } catch (error) {
    console.error('Error assigning template to category:', error);
    return { success: false, error: 'Fehler beim Zuweisen der Vorlage zur Kategorie' };
  }
}

export async function removeTemplateFromCategory(categoryId: string, templateId: string) {
  try {
    await prisma.categoryOptionGroupAssignment.deleteMany({
      where: {
        categoryId,
        templateId,
      },
    });
    revalidatePath('/backend/categories');
    return { success: true };
  } catch (error) {
    console.error('Error removing template from category:', error);
    return { success: false, error: 'Fehler beim Entfernen der Vorlage von der Kategorie' };
  }
}

// ============================================================================
// Get Option Groups for Product (with inheritance)
// ============================================================================

export async function getProductOptionGroups(productId: string) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        category: {
          include: {
            optionGroupAssignments: {
              include: {
                template: {
                  include: {
                    values: {
                      where: { isActive: true },
                      orderBy: { sortOrder: 'asc' },
                    },
                  },
                },
              },
              orderBy: { sortOrder: 'asc' },
            },
          },
        },
        optionGroupAssignments: {
          include: {
            template: {
              include: {
                values: {
                  where: { isActive: true },
                  orderBy: { sortOrder: 'asc' },
                },
              },
            },
          },
          orderBy: { sortOrder: 'asc' },
        },
        optionGroups: {
          where: { isActive: true },
          include: {
            values: {
              where: { isActive: true },
              orderBy: { sortOrder: 'asc' },
            },
          },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (!product) {
      return { success: false, error: 'Produkt nicht gefunden' };
    }

    // Combine category inherited groups, product-specific assignments, and legacy groups
    const allGroups: any[] = [];

    // Add category inherited groups (if not disabled)
    product.category.optionGroupAssignments.forEach((assignment) => {
      const productAssignment = product.optionGroupAssignments.find(
        (pa) => pa.templateId === assignment.templateId
      );
      
      // Only include if not disabled by product override
      if (!productAssignment || !productAssignment.isDisabled) {
        allGroups.push({
          ...assignment.template,
          source: 'category',
          isDisabled: productAssignment?.isDisabled || false,
        });
      }
    });

    // Add product-specific template assignments
    product.optionGroupAssignments.forEach((assignment) => {
      // Only add if not already added from category (to avoid duplicates)
      if (!allGroups.find((g) => g.id === assignment.templateId)) {
        allGroups.push({
          ...assignment.template,
          source: 'product',
          isDisabled: assignment.isDisabled,
        });
      }
    });

    // Add legacy product-specific groups
    product.optionGroups.forEach((group) => {
      allGroups.push({
        ...group,
        source: 'legacy',
      });
    });

    // Sort by sortOrder
    allGroups.sort((a, b) => a.sortOrder - b.sortOrder);

    return { success: true, groups: allGroups };
  } catch (error) {
    console.error('Error fetching product option groups:', error);
    return { success: false, error: 'Fehler beim Abrufen der Optionsgruppen' };
  }
}
