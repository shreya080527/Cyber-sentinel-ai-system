import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized access.' }, { status: 401 });
  }

  try {
    const contacts = await db.emergencyContact.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = contacts.map((c) => ({
      id: c.id,
      userId: c.userId,
      name: c.name,
      phone: c.phone,
      email: c.email,
      relationship: c.relationship,
      notifyOnCritical: c.notifyOnCritical,
      createdAt: c.createdAt.toISOString(),
    }));

    return NextResponse.json({ contacts: formatted });
  } catch (error) {
    console.error('Fetch contacts error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve emergency contacts.' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized access.' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, phone, email, relationship = 'CHILD', notifyOnCritical = true } = body;

    if (!name || name.trim().length < 2) {
      return NextResponse.json({ error: 'Please enter a contact name.' }, { status: 400 });
    }

    if (!phone || phone.trim().length < 6) {
      return NextResponse.json({ error: 'Please enter a valid telephone number.' }, { status: 400 });
    }

    const contact = await db.emergencyContact.create({
      data: {
        userId: session.userId,
        name: name.trim(),
        phone: phone.trim(),
        email: email ? email.trim().toLowerCase() : null,
        relationship: relationship.trim(),
        notifyOnCritical: Boolean(notifyOnCritical),
      },
    });

    // Notify user
    await db.notification.create({
      data: {
        userId: session.userId,
        message: `Emergency family contact "${contact.name}" (${contact.relationship}) has been saved.`,
        type: 'SECURITY_ALERT',
      },
    });

    return NextResponse.json({
      message: 'Emergency contact added successfully.',
      contact: {
        id: contact.id,
        userId: contact.userId,
        name: contact.name,
        phone: contact.phone,
        email: contact.email,
        relationship: contact.relationship,
        notifyOnCritical: contact.notifyOnCritical,
        createdAt: contact.createdAt.toISOString(),
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Add contact error:', error);
    return NextResponse.json({ error: 'Failed to save emergency contact.' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized access.' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Contact ID required.' }, { status: 400 });
    }

    await db.emergencyContact.deleteMany({
      where: { id, userId: session.userId },
    });

    return NextResponse.json({ message: 'Contact removed successfully.' });
  } catch (error) {
    console.error('Delete contact error:', error);
    return NextResponse.json({ error: 'Failed to delete contact.' }, { status: 500 });
  }
}
