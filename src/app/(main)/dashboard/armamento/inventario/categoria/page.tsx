import CategoriesForm from '@/app/(main)/dashboard/abastecimiento/inventario/components/categories-form'
import PageForm from '@/modules/layout/components/page-form'

export default async function Page() {
  return (
    <PageForm
      title="Agregar Categoría"
      backLink="/dashboard/abastecimiento/inventario"
    >
      <CategoriesForm />
    </PageForm>
  )
}
