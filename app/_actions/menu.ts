"use server";

import { prisma } from "@/lib/prisma";

// ============================================================================
// GET ACTIVE CATEGORIES FOR FRONTEND MENU
// ============================================================================

export async function getActiveCategories() {
  try {
    const categories = await prisma.category.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        sortOrder: "asc",
      },
      include: {
        _count: {
          select: {
            products: {
              where: {
                isActive: true,
                isAvailable: true,
              },
            },
          },
        },
      },
    });

    // Transform to match frontend Category type
    const transformedCategories = categories.map((cat) => ({
      id: cat.id,
      name: cat.nameDe,
      nameEn: cat.nameEn || cat.nameDe,
      description: cat.descriptionDe,
      descriptionEn: cat.descriptionEn || cat.descriptionDe,
      order: cat.sortOrder,
    }));

    return {
      success: true,
      categories: transformedCategories,
    };
  } catch (error) {
    console.error("Error fetching categories:", error);
    return {
      success: false,
      error: "Fehler beim Laden der Kategorien",
      categories: [],
    };
  }
}

// ============================================================================
// GET AVAILABLE PRODUCTS BY CATEGORY FOR FRONTEND MENU
// ============================================================================

export async function getAvailableProductsByCategory(categoryId: string) {
  try {
    const products = await prisma.product.findMany({
      where: {
        categoryId,
        isActive: true,
        isAvailable: true,
      },
      orderBy: {
        sortOrder: "asc",
      },
      include: {
        category: true,
        images: true,
      },
    });

    // Transform to match frontend MenuItem type
    const transformedProducts = products.map((product) => ({
      id: product.id,
      categoryId: product.categoryId,
      name: product.nameDe,
      nameEn: product.nameEn || product.nameDe,
      description: product.descriptionDe || "",
      descriptionEn: product.descriptionEn || product.descriptionDe || "",
      image: product.images[0]?.url || "",
      basePrice: Number(product.price),
      allergens: product.allergens || [],
      ingredients: [], // Could be parsed from description if needed
      available: product.isAvailable,
      featured: false, // Could be added to schema if needed
      vegetarian: false, // Could be added to schema if needed
      preparationTime: product.preparationTime || 15,
      calories: product.calories || 0,
    }));

    return {
      success: true,
      products: transformedProducts,
    };
  } catch (error) {
    console.error("Error fetching products:", error);
    return {
      success: false,
      error: "Fehler beim Laden der Produkte",
      products: [],
    };
  }
}

// ============================================================================
// GET ALL AVAILABLE PRODUCTS FOR FRONTEND MENU
// ============================================================================

export async function getAllAvailableProducts() {
  try {
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        isAvailable: true,
      },
      orderBy: {
        sortOrder: "asc",
      },
      include: {
        category: true,
        images: true,
      },
    });

    // Transform to match frontend MenuItem type
    const transformedProducts = products.map((product) => ({
      id: product.id,
      categoryId: product.categoryId,
      name: product.nameDe,
      nameEn: product.nameEn || product.nameDe,
      description: product.descriptionDe || "",
      descriptionEn: product.descriptionEn || product.descriptionDe || "",
      image: product.images[0]?.url || "",
      basePrice: Number(product.price),
      allergens: product.allergens || [],
      ingredients: [], // Could be parsed from description if needed
      available: product.isAvailable,
      featured: false, // Could be added to schema if needed
      vegetarian: false, // Could be added to schema if needed
      preparationTime: product.preparationTime || 15,
      calories: product.calories || 0,
    }));

    return {
      success: true,
      products: transformedProducts,
    };
  } catch (error) {
    console.error("Error fetching products:", error);
    return {
      success: false,
      error: "Fehler beim Laden der Produkte",
      products: [],
    };
  }
}
