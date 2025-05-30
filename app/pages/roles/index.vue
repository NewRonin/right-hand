<template>
  <Transition name="fade">
    <div class="page-container">
      <main>
        <div class="card">
          <DataTable
            :value="roles"
            v-model:filters="filters"
            dataKey="id"
            tableStyle="min-width: 50rem"
            :loading="loading"
            paginator
            :rows="10"
            :rowsPerPageOptions="[5, 10, 20, 50]"
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} roles"
            editMode="cell"
            filterDisplay="row"
            @cell-edit-complete="onCellEditComplete"
          >
            <template #header>
              <div class="flex justify-content-between align-items-center">
                <h2>Roles Management</h2>
                <VButton class="button-add" @click="openNew">Add Role</VButton>
              </div>
            </template>

            <template #empty> No roles found. </template>
            <template #loading> Loading roles data. Please wait. </template>

            <Column field="id" header="ID" sortable style="width: 10%"></Column>

            <Column field="name" header="Name" sortable style="width: 35%">
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

            <Column field="display_name" header="Display Name" sortable style="width: 35%">
              <template #body="{ data }">{{ data.display_name }}</template>
              <template #editor="{ data, field }">
                <InputText v-model="data[field]" autofocus />
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


            <Column bodyStyle="text-align:center; overflow: visible" style="width: 20%">
              <template #body="slotProps">
                <img class="role-delete" src="@/public/sprites/delete.svg" @click="confirmDeleteRole(slotProps.data)" />
              </template>
            </Column>
          </DataTable>
        </div>

        <Dialog v-model:visible="roleDialog" :style="{ width: '450px' }" header="Role Details" :modal="true" class="p-fluid">
          <div class="field-container">
            <div class="field">
              <label for="name">Name</label>
              <InputText
                id="name"
                v-model.trim="role.name"
                required
                autofocus
                :class="{ 'p-invalid': submitted && !role.name }"
              />
              <small class="p-error" v-if="submitted && !role.name">Name is required.</small>
            </div>
            <div class="field">
              <label for="display_name">Display Name</label>
              <InputText
                id="display_name"
                v-model.trim="role.display_name"
                required
                :class="{ 'p-invalid': submitted && !role.display_name }"
              />
              <small class="p-error" v-if="submitted && !role.display_name">Display Name is required.</small>
            </div>
          </div>

          <template #footer>
            <Button label="Cancel" icon="pi pi-times" text @click="hideDialog" />
            <Button label="Save" icon="pi pi-check" text @click="saveRole" />
          </template>
        </Dialog>

        <Dialog v-model:visible="deleteRoleDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
          <div class="confirmation-content">
            <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
            <span v-if="role">Are you sure you want to delete <b>{{ role.display_name }}</b>?</span>
          </div>
          <template #footer>
            <Button label="No" text @click="deleteRoleDialog = false" />
            <Button label="Yes" text @click="deleteRole" />
          </template>
        </Dialog>
      </main>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { FilterMatchMode } from '@primevue/core'
import { useToast } from 'primevue/usetoast'

interface Role {
  id?: number
  display_name: string
  name: string
  seniority_coefficient?: number
}

const roles = ref<Role[]>([])
const roleDialog = ref(false)
const deleteRoleDialog = ref(false)
const role = ref<Role>({ display_name: '', name: '', seniority_coefficient: 1 })
const selectedRole = ref<Role | null>(null)
const submitted = ref(false)
const loading = ref(true)
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  display_name: { value: null, matchMode: FilterMatchMode.CONTAINS },
  name: { value: null, matchMode: FilterMatchMode.CONTAINS }
})
const toast = useToast()
const store= useMainStore()

const fetchRoles = async () => {
  loading.value = true
  try {
    const response = await $fetch(store.getApi('/api/role'))
    roles.value = response.data || []
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to fetch roles',
      life: 3000
    })
  } finally {
    loading.value = false
  }
}

const openNew = () => {
  role.value = { display_name: '', name: '', seniority_coefficient: 1 }
  submitted.value = false
  roleDialog.value = true
}

const hideDialog = () => {
  roleDialog.value = false
  submitted.value = false
}

const saveRole = async () => {
  submitted.value = true

  if (role.value.display_name.trim() && role.value.name.trim()) {
    loading.value = true
    try {
      const payload = {
        name: role.value.name,
        displayName: role.value.display_name,
      }

      if (role.value.id) {
        await $fetch(store.getApi(`/api/role?id=${role.value.id}`), {
          method: 'PUT',
          body: payload,
        })
        const index = roles.value.findIndex(r => r.id === role.value.id)
        if (index !== -1) roles.value[index] = { ...role.value }
        toast.add({ severity: 'success', summary: 'Successful', detail: 'Role Updated', life: 3000 })
      } else {
        const res = await $fetch(store.getApi(`/api/role`), {
          method: 'POST',
          body: payload,
        })
        roles.value.push({ ...res.data, name: role.value.name })
        toast.add({ severity: 'success', summary: 'Successful', detail: 'Role Created', life: 3000 })
      }

      roleDialog.value = false
      role.value = { display_name: '', name: '', seniority_coefficient: 1 }
    } catch (error) {
      toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to save role', life: 3000 })
    } finally {
      loading.value = false
    }
  }
}

const confirmDeleteRole = (selected: Role) => {
  role.value = { ...selected }
  deleteRoleDialog.value = true
}

const deleteRole = async () => {
  if (role.value.id) {
    loading.value = true
    try {
      await $fetch(`/api/role?id=${role.value.id}`, {
        method: 'DELETE',
      })
      roles.value = roles.value.filter(r => r.id !== role.value.id)
      deleteRoleDialog.value = false
      role.value = { display_name: '', name: '', seniority_coefficient: 1 }
      toast.add({ severity: 'success', summary: 'Successful', detail: 'Role Deleted', life: 3000 })
    } catch (error) {
      toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete role', life: 3000 })
    } finally {
      loading.value = false
    }
  }
}

const onCellEditComplete = (event: any) => {
  const { data, newValue, field } = event
  data[field] = newValue
  toast.add({ severity: 'success', summary: 'Updated', detail: `Field '${field}' updated.`, life: 2000 })
}

onMounted(() => {
  fetchRoles()
})
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
  width: 80px;
  height: 3rem;
  margin: 1rem 0;
  padding: 0.8rem 2rem;
  font-size: 1rem;
  font-weight: 500;
  color: white;
  border: none;
  transition: all 0.2s ease;
  min-width: 180px;
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

.p-dialog .p-field {
  margin-bottom: 1rem;
}

.field-container {
  display: flex;
  flex-flow: column wrap;
  gap: 1rem;
  align-items: flex-start;
  
  .field {
    display: flex;
    width: 70%;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
  }
}

.role-delete{
  width: 1.6rem;
  height: 1.6rem;
  cursor: pointer;
}

</style>
