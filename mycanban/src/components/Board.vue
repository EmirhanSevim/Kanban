<template>
  <div>
    <nav class="backdrop-blur-md p-5 flex items-center">
      <div class="text-3xl" v-for="boardItem in boardList" :key="boardItem.id">
        <input
          class="bg-transparent mr-10 font-bold my-3 w-full text-3xl font-mono border-none outline-none h-40 p-8 rounded-sm cursor-pointer transition-colors"
          type="text"
          v-model="boardItem.baslik"
          @input="updatePageTitle"
          @blur="updatePanoName(boardItem)"
        />
      </div>
    </nav>
    <div class="flex flex-wrap">
      <div
        class="bg-white max-h-96 h-min overflow-y-auto m-3 p-2 rounded-md w-[300px] border-solid border-2 border-black"
        v-for="(item, index) in panoList"
        :key="index"
      >
        <h3 @click="logBaslik(item.listBaslik)" class="text-black text-xl font-bold">{{ item.listBaslik }}</h3>

        <DxScrollView class="scrollable-list" show-scrollbar="always">
          <DxSortable
            :data="item.kartItems"
            class="sortable-cards"
            group="tasksGroup"
            @drag-start="onTaskDragStart($event)"
            @reorder="onTaskDrop($event)"
            @add="onTaskDrop($event)"
          >
            <div
              class="mt-2 p-1 bg-slate-200 text-black shadow-sm rounded-lg transition-colors hover:bg-gray-300"
              v-for="(cardItem, cardIndex) in item.kartItems"
              :key="cardIndex"
              @click="openModal(cardItem)"
            >
              {{ cardItem.baslik }}
            </div>
          </DxSortable>
        </DxScrollView>

        <div class="block place-items-start mt-2 ml-3 rounded-3xl kart-ekle-container">
          <input v-model="panoList[index].yeniKartAdi" type="text" class="bg-gray-400 w-max text-black p-full border rounded-lg hover:bg-white" />
          <button
            @click="ekleKart(item.id, panoList[index].yeniKartAdi)"
            class="bg-blue-400 font-bold text-black mt-1 p-1 mr-auto cursor-pointer hover:bg-slate-300"
          >
            Kart Ekle
          </button>
        </div>
      </div>

      <div class="block place-items-end mt-auto ml-6 pt-6">
        <input class="eklelistinput" v-model="listeAdi" type="text" />
        <button @click="ekleListe" class="font-bold bg-slate-500 ml-1 p-1 content-center rounded-md cursor-pointer">+ Başka liste ekleyin</button>
      </div>
    </div>
  </div>

  <CardModal :isModalOpen="isModalOpen" :editedCard="editedCard" @close="closeModal" @save="saveCardChanges" />
</template>

<script lang="ts">
import { ref, onMounted, defineComponent } from 'vue';
import axios from 'axios';
import CardModal from './CardModal.vue';
import { DxScrollView } from 'devextreme-vue/scroll-view';
import { DxSortable } from 'devextreme-vue/sortable';

export default defineComponent({
  components: {
    DxScrollView,
    DxSortable,
    CardModal,
  },
  props: {
    editedCard: Object,
  },

  setup() {
    const panoList = ref([]);
    const boardList = ref([]);
    const listIndex = ref(0);
    const listeAdi = ref('');
    const kartAdi = ref('');
    const kart = ref('');
    const editedCard = ref({
      id: '',
      baslik: '',
      description: '',
      listItemId: '',
    });
    const isModalOpen = ref(false);
    const yeniKartAdi = ref('');

    interface kartAdi {
      kartItems: { baslik: string }[];
    }

    const logKartAdi = () => {
      console.log('Kart Adı:', this.yeniKartAdi);
    };

    onMounted(() => {
      axios.get('https://localhost:44355/api/app/pano-app-services').then((response2) => {
        boardList.value = response2.data || [];
      });

      axios
        .get('https://localhost:44355/api/app/list-app-services')
        .then((response) => {
          console.log(response.data);
          panoList.value = response.data || [];
          console.log('panoList :>> ', panoList.value);
        })
        .catch((error) => {
          console.error('Veri çekme hatası:', error);
        });
    });

    const ekleListe = () => {
      if (listeAdi.value.trim() !== '') {
        const yeniListe = {
          listBaslik: listeAdi.value,
          panoItemId: '3a0de902-d95b-503d-1ff6-bc67ae0de648', // Tek board'umuz var, burası sabit kalsın
        };

        axios
          .post('https://localhost:44355/api/app/list-app-services', yeniListe)
          .then((response) => {
            console.log('Yeni liste başarıyla eklendi:', response.data);
            listeAdi.value = '';
          })
          .catch((error) => {
            console.error('Yeni liste eklerken hata:', error);
          });
      } else {
        alert('Liste adı boş olamaz.');
      }
    };

    const logBaslik = (baslik: any) => {
      console.log('Tıklanan Başlık:', baslik);
    };

    const ekleKart = (id: any, yeniKartAdi: any) => {
      const yeniKart = {
        baslik: yeniKartAdi,
      };
      axios
        .post('https://localhost:44355/api/app/kart-item-detay-app-services/', { listItemId: id, baslik: yeniKart.baslik })
        .then((response) => {
          console.log('Veri başarıyla post edildi:', response.data);
        })
        .catch((error) => {
          console.error('Veri post edilirken hata oluştu:', error);
        });
    };

    return {
      panoList,
      boardList,
      logBaslik,
      pageTitle: '',
      ekleListe,
      listIndex,
      ekleKart,
      listeAdi,
      kartAdi,
      logKartAdi,
      kart,
      isModalOpen,
      editedCard,
    };
  },

  methods: {
    updatePanoName(boardItem: any) {
      console.log('boardItem :>> ', boardItem);
      axios.put(`https://localhost:44355/api/app/pano-app-services/${boardItem.id}`, boardItem).then((update_board_response) => {
        console.log('update_board_response :>> ', update_board_response);
      });
    },
    saveChanges() {
      this.$emit('save', this.editedCard);
      this.closeModal();
    },
    openModal(card: any) {
      this.editedCard = card;
      this.isModalOpen = true;
    },
    closeModal() {
      this.isModalOpen = false;
    },
    saveCardChanges(updatedCard: any) {
      console.log('Updated Card:', updatedCard);
    },
    onListReorder(e: any) {
      const list = this.lists.splice(e.fromIndex, 1)[0];
      this.lists.splice(e.toIndex, 0, list);

      const status = this.statuses.splice(e.fromIndex, 1)[0];
      this.statuses.splice(e.toIndex, 0, status);
    },
    onTaskDragStart(e: any) {
      e.itemData = e.fromData[e.fromIndex];
    },
    onTaskDrop(e: any) {
      e.fromData.splice(e.fromIndex, 1);
      e.toData.splice(e.toIndex, 0, e.itemData);
    },
    getPriorityClass(task: any) {
      return `priority-${task.Task_Priority}`;
    },
  },

  data() {
    return {
      yeniKartAdi: '',
    };
  },
});
</script>

<style>
.block.place-items-start {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

/* Kart ekle düğmesini sabitlemek için düğme konteynerini stilleyin */
.block.place-items-start .ml-3 {
  margin-top: auto; /* Listenin altına sabitler */
}
#kanban {
  white-space: nowrap;
}

.list {
  border-radius: 8px;
  margin: 5px;
  background-color: rgba(192, 192, 192, 0.4);
  display: inline-block;
  vertical-align: top;
  white-space: normal;
}

.list-title {
  font-size: 16px;
  padding: 10px;
  padding-left: 30px;
  margin-bottom: -10px;
  font-weight: bold;
  cursor: pointer;
}

.scrollable-list {
  height: 400px;
  width: 260px;
}

/* .sortable-cards {
  min-height: 380px;
} */

.card {
  position: relative;
  background-color: white;
  box-sizing: border-box;
  width: 230px;
  padding: 10px 20px;
  margin: 10px;
  cursor: pointer;
}

.card-subject {
  padding-bottom: 10px;
}

.card-assignee {
  opacity: 0.6;
}

.card-priority {
  position: absolute;
  top: 10px;
  bottom: 10px;
  left: 5px;
  width: 5px;
  border-radius: 2px;
  background: #86c285;
}

.priority-1 {
  background: #adadad;
}

.priority-2 {
  background: #86c285;
}

.priority-3 {
  background: #edc578;
}

.priority-4 {
  background: #ef7d59;
}

.dx-sortable {
  display: block;
}
/* width */
::-webkit-scrollbar {
  width: 10px;
}

/* Track */
::-webkit-scrollbar-track {
  background: #f1f1f1;
}

/* Handle */
::-webkit-scrollbar-thumb {
  background: #888;
}

/* Handle on hover */
::-webkit-scrollbar-thumb:hover {
  background: #555;
}
.navbar-title {
  font-size: 18px;
  margin: 0;
}

.page-container {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.page-title {
  font-size: 5px;
  margin-bottom: 1px;
}

.board {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  gap: 5px;
}

.page-title {
  font-size: 5px;
  margin-right: 10px;
  justify-content: left;
  padding: 5px;
  background-color: #f0f0f0;
}

.list {
  margin: 10px;
  padding: 45px;
  border: 1px solid rgb(255, 255, 255);
  border-radius: 10px;
  width: 200px;
}

.card {
  margin-top: 10px;
  padding: 5px;
  background-color: #8f8f8f5d;
  box-shadow: 0px 2px 4px rgba(255, 255, 255, 0.788);
  border-radius: 8px;
  transition: background-color 0.1s ease;
}

.card:hover {
  background-color: #f2f2f2;
}

body {
  /* background: linear-gradient(135deg, rgba(57, 221, 106, 0.767), rgba(16, 204, 141, 0.664), rgba(9, 64, 146, 0.685), rgba(12, 48, 207, 0.473)); */
  /* background-size: 400% 400%; */

  background-image: url('arkaplan.jpg');
}
/*
@keyframes gradientAnimation {
  0% {
    background-position: 300% 50%;
  }
  50% {
    background-position: 50% 100%;
  }
  100% {
    background-position: 100% 300%;
  } */
/* } */

.baslikinput {
  margin-top: 2px;
  width: 222px;
  border: none;
  outline: none;
  background-color: transparent;
  height: 20px;
  padding: 3px;
  border-radius: 3px;
  align-items: flex-start;
  cursor: pointer;
  transition: background-color 1s ease;
  font-size: 20px;
}

.eklelistinput {
  margin-top: 2px;
  color: black;
  width: 222px;
  background-color: white;
  margin-right: 40px;
  height: 20px;
  padding: 3px;
  border-radius: 3px;
  align-items: flex-start;
  cursor: pointer;
  transition: background-color 1s ease;
}

input[type='text'] {
  margin-top: 2px;
  width: 260px;
  margin-left: -15px;
  height: 20px;
  padding: 3px;
  border-radius: 3px;
  align-items: flex-start;
  cursor: pointer;
  transition: background-color 1s ease;
}

input[type='text']:hover {
  background-color: rgba(240, 240, 240, 1);
}

.ekle-button-container {
  position: sticky; /* Yapışık pozisyon */
  top: 0; /* Üst kenara yapışık */
  background-color: white; /* Arka plan rengi */
  z-index: 1; /* Görünürlük sıralaması */
  padding: 10px; /* Kenar boşluğu ekleyin */
  margin-bottom: 10px; /* Alt kısma boşluk ekleyin */
}

.ekle-button {
  background-color: #ccc8e093;
  margin-left: -10px;
  margin-top: 5px;

  padding: 5px 20px;
  border-radius: 5px;
  cursor: pointer;
}

.ekle-button:hover {
  background-color: #0056b3;
}

.ekle-board-container {
  position: sticky; /* Yapışık pozisyon */
  top: 0; /* Üst kenara yapışık */
  background-color: white; /* Arka plan rengi */
  z-index: 1; /* Görünürlük sıralaması */
  padding: 10px; /* Kenar boşluğu ekleyin */
  margin-bottom: 10px; /* Alt kısma boşluk ekleyin */
}

.ekle-board {
  background-color: #ccc8e093;
  color: #fff;
  margin-right: 10 px;
  padding: 5px 4px;
  border: center;
  border-radius: 5px;
  cursor: pointer;
}

.ekle-board:hover {
  background-color: #0056b3;
}
</style>
