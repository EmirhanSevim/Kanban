<template>
  <div class="modal" v-if="isModalOpen">
    <div class="modal-content">
      <h2>Kart Düzenle</h2>
      <input v-model="editedCard.baslik" type="text" placeholder="Card Title" />
      <textarea v-model="editedCard.description" placeholder="Card Description"></textarea>
      <button @click="saveChanges(editedCard)">Kaydet</button>
      <button @click="closeModal">Kapat</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import axios from 'axios';
import { defineProps, defineEmits } from 'vue';
const { isModalOpen, editedCard } = defineProps(['isModalOpen', 'editedCard']);
const emit = defineEmits(['close', 'save']);
const closeModal = () => {
  emit('close');
};

const saveChanges = async (card: any) => {
  axios.put(`https://localhost:44355/api/app/kart-item-detay-app-services/${card.id}`, card).then((response) => {
    console.log('response :>> ', response);
    emit('close');
  });
};
</script>

<style scoped>
.modal {
  color: black;
  font-weight: bold;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  /* box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2); */
  max-width: 400px;
  width: 100%;
  text-align: center;
}

input[type='text'],
textarea {
  color: black;
  width: 100%;
  margin: 10px 0;
  padding: 8px;
  background-color: rgb(226 232 240);
  border: 1px solid #ccc;
  border-radius: 4px;
}

button {
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 10px 20px;
  cursor: pointer;
  margin: 5px;
}

button:hover {
  background-color: #0056b3;
}

button:last-child {
  background-color: #ccc;
  color: #333;
}
</style>
