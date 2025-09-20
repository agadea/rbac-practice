'use server';

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import bcrypt from 'bcrypt';
import prismaClient from "@/lib/database";

import { SignUpFormSchema } from "@/lib/definitions";

export async function signUpAction(prevState: any, formData: FormData) {
  const validatedFields = SignUpFormSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    return {
      type: 'error',
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Sign In.',
    };
  }

  const { firstName, lastName, email, password } = validatedFields.data;

  const exist = await prismaClient.user.findUnique({
    where: {
      email,
    },
  });

  if (exist) {
    return {
      type: 'error',
      message: 'User already exists.',
    };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    await prismaClient.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        status: true, // Set default status to true
        createdBy: 'system',
      },
    });
  } catch (error) {
    return {
      type: 'error',
      message: 'Database Error: Failed to Sign In.',
    };
  }

  const cookieStore = await cookies()

  cookieStore.set({
    name: 'flash',
    value: JSON.stringify({ type: 'success', message: 'Cuenta creada correctamente' }),
    path: '/',
    maxAge: 10,
  });

  redirect('/login');
}