'use client'
import * as React from 'react'

import { useForm, SubmitHandler } from 'react-hook-form'
import { Button } from '@/modules/common/components/button'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/modules/common/components/form'
import { DialogFooter } from '@/modules/common/components/dialog/dialog'
import { useToast } from '@/modules/common/components/toast/use-toast'

import { useRouter } from 'next/navigation'

import { Usuario } from '@prisma/client'
import { Combobox } from '@/modules/common/components/combobox'
import { DateRange } from 'react-day-picker'
import { Calendar } from '@/modules/common/components/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/modules/common/components/popover/popover'
import { cn } from '@/utils/utils'
import { CalendarIcon, DownloadIcon, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { generateAuditReportData } from '../../lib/actions'
import {
  RadioGroup,
  RadioGroupItem,
} from '@/modules/common/components/radio-group'
import { Label } from '@/modules/common/components/label/label'

// type User = Prisma.UsuarioGetPayload<{ include: { rol: true } }>
type FormValues = {
  userId: string
  dateRange: DateRange
}
interface Props {
  users: Usuario[]
}

export default function ExportAuditReport({ users }: Props) {
  const { toast } = useToast()
  const router = useRouter()
  const comboboxUsers = users.map((user) => ({
    value: user.id,
    label: `${user.tipo_cedula}-${user.cedula} ${user.nombre}`,
  }))
  //   console.log('users', comboboxUsers)
  const form = useForm<FormValues>({})
  const [isPending, startTransition] = React.useTransition()
  const [loading, setLoading] = React.useState(false)
  const [documentFormat, setDocumentFormat] = React.useState<string>('PDF')

  const handleExport = async (data: any) => {
    setLoading(true)
    try {
      const apiUrl =
        documentFormat === 'PDF'
          ? '/api/export-report-pdf'
          : '/api/export-report-word'

      const body = {
        data,
        url: `${process.env.NEXT_PUBLIC_BASE_URL}/reporte-auditoria-template.docx`,
        name: 'reporte-auditoria',
      }
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        toast({
          title: 'Parece que hubo un problema',
          description: 'No se pudo generar el archivo',
          variant: 'destructive',
        })
        setLoading(false)
        return
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `reporte-auditoria.${
        documentFormat === 'PDF' ? 'pdf' : 'docx'
      }`
      document.body.appendChild(a)
      a.click()
      a.remove()
    } catch (error) {
      toast({
        title: 'Parece que hubo un problema',
        description: 'No se pudo generar el archivo: ' + error,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }
  const onSubmit: SubmitHandler<FormValues> = async (values) => {
    if (!values.dateRange.from || !values.dateRange.to) {
      toast({
        title: 'Error',
        description: 'Por favor, selecciona un rango de fechas',
        variant: 'default',
      })
      return
    }
    startTransition(async () => {
      const data = await generateAuditReportData(
        values.userId,
        values.dateRange
      )
      console.log('data', data)
      handleExport(data)
    })
  }

  return (
    <Form {...form}>
      <form
        style={{
          scrollbarGutter: 'stable both-edges',
        }}
        className="flex-1 overflow-y-hidden gap-8 mb-36"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4">
            <h1 className="text-xl text-center font-semibold">
              Exportar Reporte de Auditoría
            </h1>
            <p className="text-center font-normal text-sm text-slate-600">
              Selecciona los usuarios y el rango de fechas a exportar
            </p>
          </div>
          <FormField
            control={form.control}
            name="userId"
            rules={{
              required: 'Este campo es requerido',
            }}
            render={({ field }) => (
              <FormItem className="flex flex-col w-full ">
                <FormLabel>Usuario:</FormLabel>
                <Combobox
                  name={field.name}
                  data={comboboxUsers}
                  form={form}
                  field={field}
                  isValueString={true}
                />

                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="dateRange"
            rules={{
              required: 'Este campo es requerido',
            }}
            render={({ field }) => (
              <FormItem className="flex flex-col w-full ">
                <FormLabel>Selecciona el rango de fechas:</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="date"
                      variant={'outline'}
                      className={cn(
                        'w-[240px] justify-start text-left font-normal',
                        !field.value && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value?.from ? (
                        field.value.to ? (
                          <>
                            {format(field.value.from, 'dd/MM/y')} -{' '}
                            {format(field.value.to, 'dd/MM/y')}
                          </>
                        ) : (
                          format(field.value.from, 'dd/MM/y')
                        )
                      ) : (
                        <span>Seleccionar fechas</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={field.value?.from}
                      selected={field.value}
                      onSelect={field.onChange}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>

                <FormMessage />
              </FormItem>
            )}
          />
          <RadioGroup
            disabled={loading}
            defaultValue="comfortable"
            onValueChange={(value) => setDocumentFormat(value)}
            className="flex flex-col gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="PDF" id="r1" />
              <Label htmlFor="r1">{`PDF (Recomendado)`}</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="WORD" id="r2" />
              <Label htmlFor="r2">WORD</Label>
            </div>
          </RadioGroup>
        </div>

        <DialogFooter className="fixed right-0 bottom-0 bg-white pt-4 border-t border-border gap-4 items-center w-full p-4">
          <Button variant="default" type="submit" disabled={isPending}>
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <DownloadIcon className="mr-2 h-4 w-4" />
            )}
            {isPending ? 'Exportando...' : 'Exportar'}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  )
}
