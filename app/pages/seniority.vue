<template>
  <Transition name="fade">
    <div class="page-container">
      <main>
        <div class="card">
          <DataTable
            :value="seniorityLevels"
            v-model:filters="filters"
            dataKey="id"
            tableStyle="min-width: 50rem"
            :loading="loading"
            paginator
            :rows="10"
            :rowsPerPageOptions="[5, 10, 20, 50]"
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} seniority levels"
            editMode="cell"
            filterDisplay="row"
            @cell-edit-complete="onCellEditComplete"
          >
            <template #header>
              <div class="flex justify-content-between align-items-center">
                <h2>Seniority Levels</h2>
                <VButton class="button-add" @click="openNew">Add Level</VButton>
              </div>
            </template>

            <template #empty> No seniority levels found. </template>
            <template #loading> Loading seniority data. Please wait. </template>

            <Column field="id" header="ID" sortable style="width: 10%"></Column>

            <Column field="name" header="Name" sortable style="width: 25%">
              <template #body="{ data }">{{ data.name }}</template>
              <template #editor="{ data, field }">
                <InputText v-model="data[field]" />
              </template>
              <template #filter="{ filterModel, filterCallback }">
                <InputText
                  v-model="filterModel.value"
                  type="text"
                  @input="filterCallback()"
                  class="p-column-filter"
                  placeholder="Search by name"
                />
              </template>
            </Column>

            <Column field="displayName" header="Display Name" sortable style="width: 25%">
              <template #body="{ data }">{{ data.displayName }}</template>
              <template #editor="{ data, field }">
                <InputText v-model="data[field]" />
              </template>
              <template #filter="{ filterModel, filterCallback }">
                <InputText
                  v-model="filterModel.value"
                  type="text"
                  @input="filterCallback()"
                  class="p-column-filter"
                  placeholder="Search by display name"
                />
              </template>
            </Column>

            <Column field="seniority_coefficient" header="Coefficient" sortable style="width: 20%">
              <template #body="{ data }">{{ data.seniority_coefficient }}</template>
              <template #editor="{ data, field }">
                <InputNumber v-model="data[field]" :minFractionDigits="1" :maxFractionDigits="2" />
              </template>
            </Column>

            <Column bodyStyle="text-align:center; overflow: visible" style="width: 20%">
              <template #body="slotProps">
                <img class="role-delete" src="@/public/sprites/delete.svg" @click="confirmDelete(slotProps.data)" />
              </template>
            </Column>
          </DataTable>
        </div>

        <Dialog v-model:visible="dialogVisible" :style="{ width: '450px' }" header="Seniority Level" :modal="true" class="p-fluid">
          <div class="field-container">
            <div class="field">
              <label for="name">Name</label>
              <InputText id="name" v-model.trim="form.name" required autofocus :class="{ 'p-invalid': submitted && !form.name }" />
              <small class="p-error" v-if="submitted && !form.name">Name is required.</small>
            </div>
            <div class="field">
              <label for="displayName">Display Name</label>
              <InputText id="displayName" v-model.trim="form.displayName" required :class="{ 'p-invalid': submitted && !form.displayName }" />
              <small class="p-error" v-if="submitted && !form.displayName">Display name is required.</small>
            </div>
            <div class="field">
              <label for="seniority_coefficient">Coefficient</label>
              <InputNumber id="seniority_coefficient" v-model="form.seniority_coefficient" :minFractionDigits="1" :maxFractionDigits="2" />
            </div>
          </div>

          <template #footer>
            <Button label="Cancel" icon="pi pi-times" text @click="hideDialog" />
            <Button label="Save" icon="pi pi-check" text @click="save" />
          </template>
        </Dialog>

        <Dialog v-model:visible="deleteDialogVisible" :style="{ width: '450px' }" header="Confirm" :modal="true">
          <div class="confirmation-content">
            <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
            <span v-if="form">Are you sure you want to delete <b>{{ form.displayName }}</b>?</span>
          </div>
          <template #footer>
            <Button label="No" text @click="deleteDialogVisible = false" />
            <Button label="Yes" text @click="deleteItem" />
          </template>
        </Dialog>
      </main>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import { FilterMatchMode } from '@primevue/core'

interface SeniorityLevel {
  id?: number
  name: string
  displayName: string
  seniority_coefficient: number
}

const seniorityLevels = ref<SeniorityLevel[]>([])
const dialogVisible = ref(false)
const deleteDialogVisible = ref(false)
const form = ref<SeniorityLevel>({ name: '', displayName: '', seniority_coefficient: 1 })
const submitted = ref(false)
const loading = ref(true)
const toast = useToast()
const store = useMainStore()

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  name: { value: null, matchMode: FilterMatchMode.CONTAINS },
  displayName: { value: null, matchMode: FilterMatchMode.CONTAINS }
})

const fetchData = async () => {
  loading.value = true
  try {
    const res = await $fetch(store.getApi('/api/seniorityLevel'))
    seniorityLevels.value = res.data || []
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch data', life: 3000 })
  } finally {
    loading.value = false
  }
}

const openNew = () => {
  form.value = { name: '', displayName: '', seniority_coefficient: 1 }
  submitted.value = false
  dialogVisible.value = true
}

const hideDialog = () => {
  dialogVisible.value = false
  submitted.value = false
}

const save = async () => {
  submitted.value = true
  if (!form.value.name.trim() || !form.value.displayName.trim()) return

  loading.value = true
  try {
    if (form.value.id) {
      await $fetch(store.getApi(`/api/seniorityLevel?id=${form.value.id}`), {
        method: 'PUT',
        body: form.value,
      })
      const index = seniorityLevels.value.findIndex(l => l.id === form.value.id)
      if (index !== -1) seniorityLevels.value[index] = { ...form.value }
      toast.add({ severity: 'success', summary: 'Updated', detail: 'Seniority updated', life: 3000 })
    } else {
      const res = await $fetch(store.getApi('/api/seniorityLevel'), {
        method: 'POST',
        body: form.value,
      })
      seniorityLevels.value.push(res.data)
      toast.add({ severity: 'success', summary: 'Created', detail: 'Seniority added', life: 3000 })
    }
    dialogVisible.value = false
  } catch {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to save', life: 3000 })
  } finally {
    loading.value = false
  }
}

const confirmDelete = (item: SeniorityLevel) => {
  form.value = { ...item }
  deleteDialogVisible.value = true
}

const deleteItem = async () => {
  if (!form.value.id) return
  loading.value = true
  try {
    await $fetch(store.getApi(`/api/seniorityLevel?id=${form.value.id}`), {
      method: 'DELETE',
    })
    seniorityLevels.value = seniorityLevels.value.filter(item => item.id !== form.value.id)
    toast.add({ severity: 'success', summary: 'Deleted', detail: 'Seniority deleted', life: 3000 })
  } catch {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete', life: 3000 })
  } finally {
    loading.value = false
    deleteDialogVisible.value = false
  }
}

const onCellEditComplete = ({ data, newValue, field }: any) => {
  data[field] = newValue
  toast.add({ severity: 'success', summary: 'Updated', detail: `Field '${field}' updated`, life: 2000 })
}

onMounted(fetchData)

</script>

<style scoped lang="scss">
.page-container {
  position: relative;
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem 1rem;

  main {
    width: 100%;
    max-width: 1200px;
    display: flex;
    flex-flow: column nowrap;
  }
}

.button-add {
  width: 10rem;
  height: 3rem;
  margin: 1rem 0;
  padding: 0.8rem 2rem;
  font-size: 1rem;
  font-weight: 500;
  border: none;
  transition: all 0.2s ease;
}

.card {
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  background: white;
}

.confirmation-content {
  display: flex;
  align-items: center;
  justify-content: center;
}

.field-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  
  .field {
    display: flex;
    justify-content: space-between;
    width: 100%;
    gap: 1rem;
  }
}

.role-delete {
  width: 1.6rem;
  height: 1.6rem;
  cursor: pointer;
}
</style>
