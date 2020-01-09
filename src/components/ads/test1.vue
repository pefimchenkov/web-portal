<template>
 <v-container fluid>
  <v-layout row>
   <v-flex xs12>
    <template>
     <v-data-table
      :headers="headers"
      :items="Clients"
      :loading="listLoading"
      loading-text="Loading..."
      fixed-header
      calculate-widths
      :items-per-page="50"
      :mobile-breakpoint="550"
      sort-by="ID"
      item-key="ID"
      sort-desc
      class="elevation-2"
     >
      <template v-slot:body.prepend>
       <tr>
        <td>
         <v-text-field clearable v-model="Filters.searchClientID" type="number"></v-text-field>
        </td>
        <td>
         <v-text-field clearable v-model="Filters.searchClientName" type="text"></v-text-field>
        </td>
        <td>
         <v-text-field clearable v-model="Filters.searchClientLegpers" type="text"></v-text-field>
        </td>
        <td>
         <v-text-field clearable v-model="Filters.searchClientManager" type="text"></v-text-field>
        </td>
        <td>
         <v-text-field clearable v-model="Filters.searchClientProject" type="text"></v-text-field>
        </td>
        <td colspan="1"></td>
       </tr>
      </template>
      <template v-slot:item.action="{ item }">
       <v-icon small @click="editItem(item)">edit</v-icon>
       <v-icon class="ml-3" small @click="deleteItem(item)">delete</v-icon>
       <v-btn text fab small left :to="'/clients/' + item.ID">
        <v-icon>more_horiz</v-icon>
       </v-btn>
      </template>
     </v-data-table>
    </template>
   </v-flex>
  </v-layout>
 </v-container>
</template>

<script>
import { getList } from '@/api/table'

export default {
 filters: {
  statusFilter (status) {
   const statusMap = {
    published: 'success',
    draft: 'gray',
    deleted: 'danger'
   }
   return statusMap[status]
  }
 },
 data () {
  return {
   Clients: null,
   Filters: {
    searchClientID: null,
    searchClientName: '',
    searchClientLegpers: '',
    searchClientManager: '',
    searchClientProject: ''
   },
   listLoading: true
  }
 },
 computed: {
  headers () {
   return [
    {
     text: 'ID',
     value: 'ID',
     filter: value => {
      if (!this.Filters.searchClientID) return true
      return value === +this.Filters.searchClientID
     },
     width: '120px'
    },
    {
     text: 'Бренд',
     value: 'NAME',
     filter: value => {
      if (!this.Filters.searchClientName) return true
      return value
       .toLowerCase()
       .includes(this.Filters.searchClientName.toLowerCase())
     }
    },
    {
     text: 'Юрлица',
     value: 'LEGPERS',
     filter: value => {
      if (!this.Filters.searchClientLegpers) return true
      if (!value) return false
      return value
       .toLowerCase()
       .includes(this.Filters.searchClientLegpers.toLowerCase())
     }
    },
    {
     text: 'Куратор',
     value: 'MANAGER',
     filter: value => {
      if (!this.Filters.searchClientManager) return true
      if (!value) return false
      return value
       .toLowerCase()
       .includes(this.Filters.searchClientManager.toLowerCase())
     }
    }
   ]
  }
 },
 created () {
  this.fetchData()
 },
 methods: {
  fetchData () {
   this.listLoading = true
   getList().then(response => {
    this.Clients = response.data.items
    this.listLoading = false
   })
  }
 }
}
</script>
