<template>
  <Transition name="fade">
    <div class="page-container">
      <main>
        <div class="card">
          <DataTable
            :value="employees"
            v-model:filters="filters"
            dataKey="id"
            tableStyle="min-width: 50rem"
            :loading="loading"
            paginator
            :rows="10"
            :rowsPerPageOptions="[5, 10, 20, 50]"
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} employees"
            editMode="cell"
            filterDisplay="row"
            @cell-edit-complete="onCellEditComplete"
          >
            <template #header>
              <div class="flex justify-content-between align-items-center">
                <h2>Employees Management</h2>
                <VButton class="button-add" @click="openNew">Add Employee</VButton>
              </div>
            </template>

            <template #empty> No employees found. </template>
            <template #loading> Loading employees data. Please wait. </template>

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

            <Column field="role.display_name" header="Role" sortable style="width: 35%">
              <template #body="{ data }">{{ data.role.display_name }}</template>
              <template #editor="{ data, field }">
                <InputText v-model="data.role.display_name" />
              </template>
            </Column>

            <Column field="seniorityLevel.name" header="Seniority Level" sortable style="width: 35%">
              <template #body="{ data }">{{ data.seniorityLevel.name }}</template>
              <template #editor="{ data, field }">
                <InputText v-model="data.seniorityLevel.name" />
              </template>
            </Column>

            <Column bodyStyle="text-align:center; overflow: visible" style="width: 20%">
              <template #body="slotProps">
                <img class="employee-delete" src="@/public/sprites/delete.svg" @click="confirmDeleteEmployee(slotProps.data)" />
              </template>
            </Column>
          </DataTable>
        </div>

        <Dialog v-model:visible="employeeDialog" :style="{ width: '450px' }" header="Employee Details" :modal="true" class="p-fluid">
          <div class="field-container">
            <div class="field">
              <label for="name">Name</label>
              <InputText
                id="name"
                v-model.trim="employee.name"
                required
                autofocus
                :class="{ 'p-invalid': submitted && !employee.name }"
              />
              <small class="p-error" v-if="submitted && !employee.name">Name is required.</small>
            </div>

            <div class="field">
              <label for="role">Role</label>
              <Dropdown
                id="role"
                v-model="employee.roleId"
                :options="roles"
                optionLabel="display_name"
                optionValue="id"
                placeholder="Select Role"
                required
              />
            </div>

            <div class="field">
              <label for="seniority_level">Seniority Level</label>
              <Dropdown
                id="seniority_level"
                v-model="employee.seniorityLevelId"
                :options="seniorityLevels"
                optionLabel="name"
                optionValue="id"
                placeholder="Select Seniority Level"
                required
              />
            </div>
          </div>

          <template #footer>
            <Button label="Cancel" text @click="hideDialog" />
            <Button label="Save" text @click="saveEmployee" />
          </template>
        </Dialog>

        <Dialog v-model:visible="deleteEmployeeDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
          <div class="confirmation-content">
            <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
            <span v-if="employee">Are you sure you want to delete <b>{{ employee.name }}</b>?</span>
          </div>
          <template #footer>
            <Button label="No" icon="pi pi-times" text @click="deleteEmployeeDialog = false" />
            <Button label="Yes" icon="pi pi-check" text @click="deleteEmployee" />
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

interface Employee {
  id?: number
  name: string
  roleId: number
  seniorityLevelId: number
  role: { display_name: string }
  seniorityLevel: { name: string }
}

const employees = ref<Employee[]>([])
const employeeDialog = ref(false)
const deleteEmployeeDialog = ref(false)
const employee = ref<Employee>({ name: '', roleId: 0, seniorityLevelId: 0, role: { display_name: '' }, seniorityLevel: { name: '' } })
const selectedEmployee = ref<Employee | null>(null)
const submitted = ref(false)
const loading = ref(true)
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  name: { value: null, matchMode: FilterMatchMode.CONTAINS }
})
const roles = ref<any[]>([])
const seniorityLevels = ref<any[]>([])
const toast = useToast()
const store = useMainStore()

const fetchEmployees = async () => {
  loading.value = true
  try {
    const response = await $fetch(store.getApi('/api/employee'))
    employees.value = response.data || []
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to fetch employees',
      life: 3000
    })
  } finally {
    loading.value = false
  }
}

const fetchRoles = async () => {
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
  }
}

const fetchSeniorityLevels = async () => {
  try {
    const response = await $fetch(store.getApi('/api/seniority-level'))
    seniorityLevels.value = response.data || []
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to fetch seniority levels',
      life: 3000
    })
  }
}

const openNew = () => {
  employee.value = { name: '', roleId: 0, seniorityLevelId: 0, role: { display_name: '' }, seniorityLevel: { name: '' } }
  submitted.value = false
  employeeDialog.value = true
}

const hideDialog = () => {
  employeeDialog.value = false
  submitted.value = false
}

const saveEmployee = async () => {
  submitted.value = true

  if (employee.value.name.trim() && employee.value.roleId && employee.value.seniorityLevelId) {
    loading.value = true
    try {
      const payload = {
        name: employee.value.name,
        seniorityLevelId: employee.value.seniorityLevelId,
        roleId: employee.value.roleId,
      }

      if (employee.value.id) {
        await $fetch(store.getApi(`/api/employee?id=${employee.value.id}`), {
          method: 'PUT',
          body: payload,
        })
        const index = employees.value.findIndex(e => e.id === employee.value.id)
        if (index !== -1) employees.value[index] = { ...employee.value }
        toast.add({ severity: 'success', summary: 'Successful', detail: 'Employee Updated', life: 3000 })
      } else {
        const res = await $fetch(store.getApi(`/api/employee`), {
          method: 'POST',
          body: payload,
        })
        employees.value.push({ ...res.data })
        toast.add({ severity: 'success', summary: 'Successful', detail: 'Employee Created', life: 3000 })
      }

      employeeDialog.value = false
      employee.value = { name: '', roleId: 0, seniorityLevelId: 0, role: { display_name: '' }, seniorityLevel: { name: '' } }
    } catch (error) {
      toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to save employee', life: 3000 })
    } finally {
      loading.value = false
    }
  }
}

const confirmDeleteEmployee = (selected: Employee) => {
  employee.value = { ...selected }
  deleteEmployeeDialog.value = true
}

const deleteEmployee = async () => {
  if (employee.value.id) {
    loading.value = true
    try {
      await $fetch(`/api/employee?id=${employee.value.id}`, {
        method: 'DELETE',
      })
      employees.value = employees.value.filter(e => e.id !== employee.value.id)
      deleteEmployeeDialog.value = false
      employee.value = { name: '', roleId: 0, seniorityLevelId: 0, role: { display_name: '' }, seniorityLevel: { name: '' } }
      toast.add({ severity: 'success', summary: 'Successful', detail: 'Employee Deleted', life: 3000 })
    } catch (error) {
      toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete employee', life: 3000 })
    } finally {
      loading.value = false
    }
  }
}

onMounted(() => {
  fetchEmployees()
  fetchRoles()
  fetchSeniorityLevels()
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

.employee-delete {
  width: 1.6rem;
  height: 1.6rem;
  cursor: pointer;
}
</style>
