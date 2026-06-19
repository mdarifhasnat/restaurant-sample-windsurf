import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// PUT - Update an option value
export async function PUT(
  request: Request,
  { params }: { params: { groupId: string; id: string } }
) {
  try {
    const body = await request.json();
    const { nameDe, nameEn, extraPrice, sortOrder, isActive, isDefault } = body;

    const optionValue = await prisma.productOptionValue.update({
      where: { id: params.id },
      data: {
        ...(nameDe !== undefined && { nameDe }),
        ...(nameEn !== undefined && { nameEn }),
        ...(extraPrice !== undefined && { extraPrice }),
        ...(sortOrder !== undefined && { sortOrder }),
        ...(isActive !== undefined && { isActive }),
        ...(isDefault !== undefined && { isDefault }),
      },
    });

    return NextResponse.json({ success: true, optionValue });
  } catch (error) {
    console.error('Error updating option value:', error);
    return NextResponse.json(
      { success: false, error: 'Fehler beim Aktualisieren des Optionswerts' },
      { status: 500 }
    );
  }
}

// DELETE - Delete an option value
export async function DELETE(
  request: Request,
  { params }: { params: { groupId: string; id: string } }
) {
  try {
    await prisma.productOptionValue.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting option value:', error);
    return NextResponse.json(
      { success: false, error: 'Fehler beim Löschen des Optionswerts' },
      { status: 500 }
    );
  }
}
