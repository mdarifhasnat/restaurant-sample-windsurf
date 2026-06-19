import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// PUT - Update an option group
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { nameDe, nameEn, sortOrder, isActive, isRequired, minSelection, maxSelection } = body;

    const optionGroup = await prisma.productOptionGroup.update({
      where: { id: params.id },
      data: {
        ...(nameDe !== undefined && { nameDe }),
        ...(nameEn !== undefined && { nameEn }),
        ...(sortOrder !== undefined && { sortOrder }),
        ...(isActive !== undefined && { isActive }),
        ...(isRequired !== undefined && { isRequired }),
        ...(minSelection !== undefined && { minSelection }),
        ...(maxSelection !== undefined && { maxSelection }),
      },
      include: {
        values: true,
      },
    });

    return NextResponse.json({ success: true, optionGroup });
  } catch (error) {
    console.error('Error updating option group:', error);
    return NextResponse.json(
      { success: false, error: 'Fehler beim Aktualisieren der Optionsgruppe' },
      { status: 500 }
    );
  }
}

// DELETE - Delete an option group
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.productOptionGroup.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting option group:', error);
    return NextResponse.json(
      { success: false, error: 'Fehler beim Löschen der Optionsgruppe' },
      { status: 500 }
    );
  }
}
