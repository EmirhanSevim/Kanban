<template>
  <div class="h-full w-full overflow-y-hidden">
    <nav class="p-5 h-[64px]">
      <div v-for="boardItem in boardList" :key="boardItem.id">
        <input
          class="bg-transparent text-white font-bold w-full text-3xl cursor-pointer transition-colors"
          type="text"
          v-model="boardItem.baslik"
          @input="updatePageTitle"
          @blur="updatePanoName(boardItem)"
        />
      </div>
    </nav>

    <div class="flex overflow-x-auto h-[calc(100vh-64px)] overflow-y-hidden">
      <DxScrollView class="scrollable-board" direction="horizontal" show-scrollbar="none">
        <DxSortable
          :data="panoList"
          class="flex overflow-x-auto w-full"
          item-orientation="horizontal"
          group="tasksGroup"
          @drag-start="onTaskDragStart($event)"
          @reorder="onTaskDrop($event)"
          @add="onTaskDrop($event)"
        >
          <div
            class="bg-white p-[8px 8px 4px 12px] max-w-xl h-min m-3 p-2 rounded-md w-96 overflow-y-scroll border-solid border-2 border-black"
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
                @reorder="onTaskDropKart($event)"
                @add="onTaskDropKart($event)"
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
              <input
                v-model="panoList[index].yeniKartAdi"
                type="text"
                class="bg-gray-400 w-max text-black p-full border rounded-lg hover:bg-slate-50"
              />
              <button
                @click="ekleKart(item.id, panoList[index].yeniKartAdi)"
                class="bg-green-500 font-bold text-black mt-1 p-1 mr-auto cursor-pointer hover:bg-slate-300"
              >
                Kart Ekle
              </button>
            </div>
          </div>
        </DxSortable>
        <div class="block mt-auto ml-6 pt-6 overflow-y-hidden">
          <input class="eklelistinput" v-model="listeAdi" type="text" />
          <button @click="ekleListe" class="bg-green-500 font-bold ml-1 p-1 content-center rounded-md cursor-pointer">+ Başka liste ekleyin</button>
        </div>
      </DxScrollView>
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
    // const yeniKartAdi = ref('');
    // const newList = panoList.value.find((list) => list.id === e.toData[0].listItemId);

    interface kartAdi {
      kartItems: { baslik: string }[];
    }

    const logKartAdi = () => {
      console.log('Kart Adı:', this.yeniKartAdi);
    };

    const listeGetir = () => {
      axios
        .get('https://localhost:44355/api/app/list-app-services')
        .then((response) => {
          panoList.value = response.data || [];
          console.log('panoList :>> ', panoList.value);
        })
        .catch((error) => {
          console.error('Veri çekme hatası:', error);
        });
    };

    onMounted(() => {
      axios.get('https://localhost:44355/api/app/pano-app-services').then((response2) => {
        boardList.value = response2.data || [];
      });

      listeGetir();
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
      setTimeout(() => {
        listeGetir();
      }, 500);
    };

    const logBaslik = (baslik: any) => {
      console.log('Tıklanan Başlık:', baslik);
    };

    const moveCardToList = (card: any, newList: any) => {
      // Eski listeden kartı kaldır
      const oldList = panoList.value.find((list) => list.id === card.listItemId);
      oldList.kartItems = oldList.kartItems.filter((item: any) => item.id !== card.id);

      // Yeni liste içine kartı ekle
      const newListItem = panoList.value.find((list) => list.id === newList.id);
      newListItem.kartItems.push(card);

      // Sunucuya güncelleme isteği gönder
      axios
        .put(`https://localhost:44355/api/app/kart-item-detay-app-services/${card.id}`, {
          //https://localhost:44355/api/app/list-app-services/3a0e0778-7bab-9914-c43d-1312b018bac1/position?newPosition=2
          listItemId: newList.id,
        })
        .then((response) => {
          console.log('card, response :>> ', card, response);
          // Başarıyla güncellendi
        })
        .catch((error) => {
          console.error('Kartı taşırken hata:', error);
        });
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

      setTimeout(() => {
        listeGetir();
      }, 500);
    };

    return {
      panoList,
      boardList,
      logBaslik,
      pageTitle: '',
      ekleListe,
      listeGetir,
      listIndex,
      ekleKart,
      listeAdi,
      kartAdi,
      logKartAdi,
      kart,
      isModalOpen,
      editedCard,
      moveCardToList,
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
      const list = this.panoList.splice(e.fromIndex, 1)[0];
      this.panoList.splice(e.toIndex, 0, list);
    },

    onTaskDragStart(e: any) {
      e.itemData = e.fromData[e.fromIndex];

      const scrollContainer = document.querySelector('.flex.overflow-x-auto');
      if (scrollContainer) {
        scrollContainer.scrollLeft += 100; // Sayfanın sağa kaymasını ayarlayabilirsiniz
      }
    },

    onTaskDrop(e: any) {
      e.fromData.splice(e.fromIndex, 1);
      e.toData.splice(e.toIndex, 0, e.itemData);
      const newPosition = e.toIndex + 1;
      const listId = e.itemData.id;
      console.log('e.itemData.id :>> ', e.itemData.id);
      console.log('e.toIndex :>> ', e.toIndex);

      axios
        .put(`https://localhost:44355/api/app/list-app-services/${listId}/position?newPosition=${newPosition}`)
        .then((response) => {
          console.log('List başarıyla post edildi:', response.data);
        })
        .catch((error) => {
          console.error('List pozisyonu güncellenirken hata oluştu:', error);
        });
      setTimeout(() => {
        this.listeGetir();
      }, 500);
    },

    onTaskDropKart(e: any) {
      console.log('e :>> ', e);

      e.fromData.splice(e.fromIndex, 1);
      e.toData.splice(e.toIndex, 0, e.itemData);
      const cartId = e.itemData.id;
      const newPosition = e.toIndex + 1;
      const newList = this.panoList.find((list) => list.id === e.toData[0].listItemId);

      console.log('Kart pozisyonu güncellendi:', e.itemData.id);
      /*
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "listItemId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "baslik": "string",
  "description": "string",
  "kartPosition": 0
}
*/
      axios
        .put(`https://localhost:44355/api/app/kart-item-detay-app-services/${cartId}`, {
          listItemId: newList.id,
          kartPosition: newPosition,
          baslik: e.itemData.baslik,
          description: e.itemData.description,
        })
        //https://localhost:44355/api/app/list-app-services/3a0e0778-7bab-9914-c43d-1312b018bac1/position?newPosition=6
        .then((response) => {
          console.log('Kart pozisyonu başarıyla güncellendi:', response.data);

          // Yeni pozisyon hesaplaması için bir dizi oluştur
          const updatedPositions = e.toData.map((item, index) => ({
            id: item.id,
            newPosition: index + 1,
          }));

          // Kartların pozisyonlarını güncelleme isteklerini dizi içinde topla
          const updateRequests = updatedPositions.map((position: any) =>
            axios.put(`https://localhost:44355/api/app/kart-item-detay-app-services/${position.id}/position?newPosition=${position.newPosition}`)
          );

          // Tüm kart pozisyon güncelleme isteklerini sırayla çalıştır
          Promise.all(updateRequests)
            .then((responses) => {
              console.log('Diğer kartların pozisyonları güncellendi:', responses);
            })
            .catch((error) => {
              console.error('Diğer kartların pozisyonlarını güncelleme hatası:', error);
            });
        })
        .catch((error) => {
          console.error('Kart pozisyonunu güncelleme hatası:', error);
        });
    },

    onListReorderKart(e: any) {
      const kart = this.panoList.splice(e.fromIndex.position + 1)[0];
      this.panoList.splice(e.toIndex, 1, kart);
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

.card {
  position: absolute;
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
}

.scrollable-board {
  white-space: nowrap;
  scroll-behavior: smooth; /* Daha düzgün kaydırma efekti */
  transition: transform 0.2s ease;
}

.scrollable-board::-webkit-scrollbar {
  width: 200px;
}

.scrollable-board::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.scrollable-board::-webkit-scrollbar-thumb {
  background: #888;
}

.scrollable-board::-webkit-scrollbar-thumb:hover {
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
  background-image: url(arkaplan.jpg);
}
/*
.baslikinput {
  margin-top: 10px;
  width: 222px;
  border: none;
  outline: none;
  background-color: black;
  height: 20px;
  padding: 10px;
  border-radius: 10px;
  align-items: flex-start;
  cursor: pointer;
  transition: background-color 1s ease;
  font-size: 50px;
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
} */

input[type='text'] {
  margin-top: 2px;
  width: auto;
  /* margin-right: auto; */
  /* margin-right: px; */
  height: 20px;
  width: 330px;
  padding: 12px;
  border-radius: 5px;
  align-items: flex-start;
  cursor: pointer;
  transition: background-color 1s ease;
}

input[type='text']:hover {
  background-color: rgba(240, 240, 240, 1);
}
.ekle-button-container {
  position: sticky;
  top: 0;
  background-color: white;
  z-index: 1;
  padding: 10px;
  margin-bottom: 10px;
}

.ekle-button {
  background-color: #2a00fc93;
  margin-left: -10px;
  margin-top: 5px;
  padding: 5px 20px;
  border-radius: 5px;
  cursor: pointer;
}

.ekle-button:hover {
  background-color: #727579;
}

.ekle-board-container {
  position: sticky;
  top: 0;
  background-color: white;
  z-index: 1;
  padding: 10px;
  margin-bottom: 10px;
}

.ekle-board {
  background-color: #2b00ff93;
  color: #fff;
  margin-right: 10 px;
  padding: 5px 4px;
  border: center;
  border-radius: 5px;
  cursor: pointer;
}
.dx-sortable {
  display: block;
}

.ekle-board:hover {
  background-color: #3f90e7;
}
</style>
