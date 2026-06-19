import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// GET - List all option groups for a product
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json(
        { success: false, error: 'Produkt-ID ist erforderlich' },
        { status: 400 }
      );
    }

    const optionGroups = await prisma.productOptionGroup.findMany({
      where: { productId },
      include: {
        values: {
          orderBy: { sortOrder: 'asc' },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json({ success: true, optionGroups });
  } catch (error) {
    console.error('Error fetching option groups:', error);
    return NextResponse.json(
      { success: false, error: 'Fehler beim Laden der Optionsgruppen' },
      { status: 500 }
    );
  }
}

// POST - Create a new option group
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productId, nameDe, nameEn, sortOrder, isActive, isRequired, minSelection, maxSelection } = body;

    if (!productId || !nameDe) {
      return NextResponse.json(
        { success: false, error: 'Produkt-ID und deutscher Name sind erforderlich' },
        { status: 400 }
      );
    }

    const optionGroup = await prisma.productOptionGroup.create({
      data: {
        productId,
        nameDe,
        nameEn: nameEn || null,
        sortOrder: sortOrder || 0,
        isActive: isActive !== undefined ? isActive : true,
        isRequired: isRequired !== undefined ? isRequired : false,
        minSelection: minSelection || 0,
        maxSelection: maxSelection || 1,
      },
      include: {
        values: true,
      },
    });

    return NextResponse.json({ success: true, optionGroup }, { status: 201 });
  } catch (error) {
    console.error('Error creating option group:', error);
    return NextResponse.json(
      { success: false, error: 'Fehler beim Erstellen der Optionsgruppe' },
      { status: 500 }
    );
  }
}
