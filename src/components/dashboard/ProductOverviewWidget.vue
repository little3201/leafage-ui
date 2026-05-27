<script setup lang="ts">
import { useToast } from 'primevue/usetoast'
import { onMounted, ref, watch } from 'vue'

type Product = {
  id: number | null
  name: string
  category: string
  price: number
  status: string
}

const toast = useToast()
const products = ref<Product[]>([
  {
    id: 1,
    name: 'Laptop Pro',
    category: 'Electronics',
    price: 2499,
    status: 'In Stock',
  },
  {
    id: 2,
    name: 'Wireless Mouse',
    category: 'Accessories',
    price: 49,
    status: 'Low Stock',
  },
  {
    id: 3,
    name: 'Monitor 4K',
    category: 'Electronics',
    price: 699,
    status: 'Out of Stock',
  },
  {
    id: 4,
    name: 'Keyboard',
    category: 'Accessories',
    price: 149,
    status: 'In Stock'
  },
])

const selectedProduct = ref<Product | null>(null)
const searchQuery = ref('')
const loading = ref(false)

const product = ref<Product>({
  id: null,
  name: '',
  category: '',
  price: 0,
  status: ''
})
const productDialog = ref(false)
const deleteProductDialog = ref(false)
const deleteProductsDialog = ref(false)
const filteredProducts = ref<Product[]>([])
const selectedProducts = ref<Product[]>([])

const searchProducts = () => {
  loading.value = true
  filteredProducts.value = products.value.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      product.status.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
  setTimeout(() => {
    loading.value = false
  }, 300)
}

watch(searchQuery, () => {
  searchProducts()
})

onMounted(() => {
  filteredProducts.value = [...products.value]
})

const editProduct = (prod: Product) => {
  product.value = { ...prod }
  productDialog.value = true
  toast.add({ severity: 'success', summary: 'Successful', detail: 'Product Created', life: 3000 })
}
const confirmDeleteProduct = (prod: Product) => {
  product.value = prod
  deleteProductDialog.value = true
}
const deleteProduct = () => {
  products.value = products.value.filter(val => val.id !== product.value.id)
  deleteProductDialog.value = false
  product.value = {
    id: null,
    name: '',
    category: '',
    price: 0,
    status: ''
  }
  toast.add({ severity: 'success', summary: 'Successful', detail: 'Product Deleted', life: 3000 })
}
const deleteSelectedProducts = () => {
  products.value = products.value.filter(val => !selectedProducts.value.includes(val))
  deleteProductsDialog.value = false
  selectedProducts.value = []
  toast.add({ severity: 'success', summary: 'Successful', detail: 'Products Deleted', life: 3000 })
}
</script>

<template>
  <div
    class="bg-surface-0 dark:bg-surface-900 p-6 rounded-xl border border-surface-200 dark:border-surface-700 flex flex-col gap-4">
    <div class="flex sm:items-center justify-between mb-4 sm:flex-row flex-col gap-2">
      <span class="font-medium text-base">Products Overview</span>
      <IconField class="sm:w-auto w-full">
        <InputIcon class="pi pi-search" />
        <InputText v-model="searchQuery" placeholder="Search products..." class="p-inputtext-sm md:w-auto! w-full!"
          @keyup.enter="searchProducts" />
      </IconField>
    </div>
    <div class="flex flex-col gap-2">
      <DataTable :value="filteredProducts" v-model:selection="selectedProduct" selectionMode="single" :loading="loading"
        :rows="5" :pt="{
          mask: {
            class: 'backdrop-blur-sm! bg-surface-0/20! dark:bg-surface-900/20!',
          },
          loadingIcon: {
            class: 'text-primary!',
          },
        }">
        <Column selectionMode="multiple" style="width: 3rem" :exportable="false"></Column>
        <Column field="name" header="Name" sortable></Column>
        <Column field="category" header="Category" sortable></Column>
        <Column field="price" header="Price" sortable>
          <template #body="{ data }"> ${{ data.price }} </template>
        </Column>
        <Column field="status" header="Status">
          <template #body="{ data }">
            <Tag :severity="data.status === 'In Stock' ? 'success' : data.status === 'Low Stock' ? 'warn' : 'danger'
              ">
              {{ data.status }}
            </Tag>
          </template>
        </Column>
        <Column :exportable="false" style="min-width: 12rem">
          <template #body="slotProps">
            <Button icon="pi pi-pencil" variant="outlined" rounded class="mr-2" @click="editProduct(slotProps.data)" />
            <Button icon="pi pi-trash" variant="outlined" rounded severity="danger"
              @click="confirmDeleteProduct(slotProps.data)" />
          </template>
        </Column>
      </DataTable>

      <Dialog v-model:visible="deleteProductDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
        <div class="flex items-center gap-4">
          <i class="pi pi-exclamation-triangle text-3xl" />
          <span v-if="product">Are you sure you want to delete <b>{{ product.name }}</b>?</span>
        </div>
        <template #footer>
          <Button label="No" icon="pi pi-times" text @click="deleteProductDialog = false" severity="secondary"
            variant="text" />
          <Button label="Yes" icon="pi pi-check" @click="deleteProduct" severity="danger" />
        </template>
      </Dialog>

      <Dialog v-model:visible="deleteProductsDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
        <div class="flex items-center gap-4">
          <i class="pi pi-exclamation-triangle text-3xl" />
          <span v-if="product">Are you sure you want to delete the selected products?</span>
        </div>
        <template #footer>
          <Button label="No" icon="pi pi-times" text @click="deleteProductsDialog = false" severity="secondary"
            variant="text" />
          <Button label="Yes" icon="pi pi-check" text @click="deleteSelectedProducts" severity="danger" />
        </template>
      </Dialog>
    </div>
  </div>
</template>
