import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

import { cn } from '@/lib/utils'
import { buttonVariants } from '@/modules/common/components/button/button'
import { SignupForm } from '@/modules/auth/templates/signup-form'
export const metadata: Metadata = {
  title: 'Registro',
  description: ' Ingresa tus datos para crear tu cuenta',
}

export default function Page() {
  return (
    <div className="flex flex-col w-full justify-center items-center gap-4 ">
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Comienza a crear tu cuenta
            </h1>
            <p className="text-sm text-muted-foreground">
              Complete el formulario para poder acceder.
            </p>
          </div>
          <SignupForm />
          <p className="px-8 text-center text-sm text-muted-foreground">
            Al hacer clic en Continuar, acepta nuestra{' '}
            <Link
              href="/terms"
              className="underline underline-offset-4 hover:text-primary"
            >
              Condiciones de uso
            </Link>{' '}
            and{' '}
            <Link
              href="/privacy"
              className="underline underline-offset-4 hover:text-primary"
            >
              Política de privacidad
            </Link>
            .
          </p>
        </div>
      </div>
      <Link
        href="/auth/login"
        className={cn(buttonVariants({ variant: 'ghost' }), '')}
      >
        Ya tengo una cuenta
      </Link>
    </div>
  )
}
