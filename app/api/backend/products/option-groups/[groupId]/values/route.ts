import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// GET - List all option values for a group
export async function GET(
  request: Request,
  { params }: { params: { groupId: string } }
) {
  try {
    const optionValues = await prisma.productOptionValue.findMany({
      where: { optionGroupId: params.groupId },
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json({ success: true, optionValues });
  } catch (error) {
    console.error('Error fetching option values:', error);
    return NextResponse.json(
      { success: false, error: 'Fehler beim Laden der Optionswerte' },
      { status: 500 }
    );
  }
}

// POST - Create a new option value
export async function POST(
  request: Request,
  { params }: { params: { groupId: string } }
) {
  try {
    const body = await request.json();
    const { nameDe, nameEn, extraPrice, sortOrder, isActive, isDefault } = body;

    if (!nameDe) {
      return NextResponse.json(
        { success: false, error: 'Deutscher Name ist erforderlich' },
        { status: 400 }
      );
    }

    const optionValue = await prisma.productOptionValue.create({
      data: {
        optionGroupId: params.groupId,
        nameDe,
        nameEn: nameEn || null,
        extraPrice: extraPrice || 0,
        sortOrder: sortOrder || 0,
        isActive: isActive !== undefined ? isActive : true,
        isDefault: isDefault !== undefined ? isDefault : false,
      },
    });

    return NextResponse.json({ success: true, optionValue }, { status: 201 });
  } catch (error) {
    console.error('Error creating option value:', error);
    return NextResponse.json(
      { success: false, error: 'Fehler beim Erstellen des Optionswerts' },
      { status: 500 }
    );
  }
}
