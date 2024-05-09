'use server'

import * as z from 'zod'
import bcrypt from 'bcryptjs'

import { RegisterSchema } from '@/utils/schemas'
import { getUserByEmail } from '@/lib/data/get-user-byEmail'

import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { Tipos_Cedulas } from '@prisma/client'

export const signup = async (values: z.infer<typeof RegisterSchema>) => {
  const validatedFields = RegisterSchema.safeParse(values)

  if (!validatedFields.success) {
    return { error: 'Invalid fields!' }
  }

  const { email, password, name, adminPassword } = validatedFields.data
  const adminPasswordDb = await prisma.admin.findFirst({
    where: {
      state: 'Activa',
    },
  })
  if (adminPassword !== adminPasswordDb?.password) {
    return {
      error: 'Contraseña de administrador incorrecta',
      field: 'adminPassword',
    }
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  const existingUser = await getUserByEmail(email)

  if (existingUser) {
    return { error: 'Este correo ya está registrado', field: 'email' }
  }

  await prisma.usuario.create({
    data: {
      cedula: validatedFields.data.cedula,
      tipo_cedula: validatedFields.data.tipo_cedula,
      nombre: name,
      email,
      contrasena: hashedPassword,
      rol: {
        connectOrCreate: {
          where: {
            rol: 'Administrador',
          },
          create: {
            rol: 'Administrador',
            descripcion: 'Allows access to all features',
          },
        },
      },
    },
  })

  return { success: 'Registrado correctamente' }
}

type SignupByFacialID = {
  email: string
  facialID: string
  adminPassword: string
  name: string
  cedula: string
  tipo_cedula: Tipos_Cedulas
}
export const signupByFacialID = async ({
  email,
  facialID,
  adminPassword,
  name,
  cedula,
  tipo_cedula,
}: SignupByFacialID) => {
  const existingUser = await getUserByEmail(email)
  const eixstingUserByFacialID = await prisma.usuario.findUnique({
    where: {
      facialID,
    },
  })

  if (existingUser || eixstingUserByFacialID) {
    return {
      error: 'Esta persona ya está registrada',
      field: 'email',
    }
  }
  console.log({ email, facialID, adminPassword, name })
  try {
    await prisma.usuario.create({
      data: {
        cedula,
        tipo_cedula,
        nombre: name,
        email,
        facialID,
        rol: {
          connectOrCreate: {
            where: {
              rol: 'Administrador',
            },
            create: {
              rol: 'Administrador',
              descripcion: 'Allows access to all features',
            },
          },
        },
      },
    })
    return { success: 'Registrado correctamente' }
  } catch (error) {
    console.log(error)
    return { error: 'Error al registrar la persona', field: 'facialID' }
  }
}

export const getAllUsers = async () => {
  const session = await auth()
  if (!session?.user) {
    throw new Error('You must be signed in to perform this action')
  }
  const users = await prisma.usuario.findMany()
  return users
}
