<template>
  <div>
    <nav class="bg-gray-400 p-2.5 flex items-center">
      <div class="text-xl" v-for="boardItem in boardList" :key="boardItem.id">
        <input
          class="my-1 w-full text-xl font-mono w-72 border-none outline-none bg-transparent h-1 p-0.5 rounded-sm cursor-pointer transition-colors text-sm"
          type="text"
          v-model="boardItem.baslik"
          @input="updatePageTitle"
          @blur="updatePanoName(boardItem)"
        />
      </div>
    </nav>
    <div class="flex flex-wrap">
      <div
        class="max-h-96 h-min overflow-y-auto m-3 p-2 rounded-md w-[300px] border-solid border-2 border-white"
        v-for="(item, index) in panoList"
        :key="index"
      >
        <h3 @click="logBaslik(item.listBaslik)" class="text-xl">{{ item.listBaslik }}</h3>
        <div
          class="mt-2 p-1 bg-gray-200 shadow-sm rounded-lg transition-colors hover:bg-orange-300"
          v-for="(cardItem, cardIndex) in item.kartItems"
          :key="cardIndex"
        >
          {{ cardItem.baslik }}
        </div>
        <div class="block place-items-start mt-2 ml-3">
          <input v-model="panoList[index].yeniKartAdi" type="text" class="w-56 p-11 border rounded-lg hover:bg-white" />
          <button
            @click="ekleKart(item.id, panoList[index].yeniKartAdi)"
            class="bg-slate-500 text-white mt-1 px-4 rounded-md cursor-pointer hover:bg-slate-400"
          >
            Kart Ekle
          </button>
        </div>
      </div>

      <div class="block place-items-end mt-auto ml-6 pt-6">
        <input class="m-0.5 w-56 mr-4 h-5 p-1 rounded-sm items-start cursor-pointer transition-colors" v-model="listeAdi" type="text" />
        <button @click="ekleListe" class="bg-amber-200 mr-3 p-1 content-center rounded-md cursor-pointer">+ Liste Ekle</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { ref, onMounted, defineComponent } from 'vue';
import axios from 'axios';

export default defineComponent({
  setup() {
    const panoList = ref([]);
    const boardList = ref([]);
    const listIndex = ref(0);
    const listeAdi = ref('');
    const kartAdi = ref('');
    const kart = ref('');
    // const yeniKartAdi = ref('');
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
        console.warn('Liste adı boş olamaz.'); // Input alanı boşsa uyarı ver
      }
    };

    const logBaslik = (baslik: string) => {
      console.log('Tıklanan Başlık:', baslik);
    };

    const ekleKart = (id, yeniKartAdi) => {
      const yeniKart = {
        baslik: yeniKartAdi,
      };

      axios
        .post('https://localhost:44355/api/app/kart-item-detay-app-services/', { listItemId: id, baslik: yeniKartAdi })
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
    };
  },

  methods: {
    updatePanoName(boardItem) {
      console.log('boardItem :>> ', boardItem);
      axios.put(`https://localhost:44355/api/app/pano-app-services/${boardItem.id}`, boardItem).then((update_board_response) => {
        console.log('update_board_response :>> ', update_board_response);
      });
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
  background-color: #ac7f7f;
  animation: gradientAnimation 1s infinite;
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
  width: 222px;
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
  width: 222px;
  margin-left: -10px;
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
  display: block;
  place-items: initial;
  margin-top: 30px;
}

.ekle-button {
  background-color: #ccc8e093;
  margin-left: -10px;
  margin-top: 5px;
  color: #fff;
  padding: 5px 20px;
  border-radius: 5px;
  cursor: pointer;
}

.ekle-button:hover {
  background-color: #0056b3;
}

.ekle-board-container {
  display: block;
  margin-right: 20px;
  place-items: inherit;
  margin-top: 195px;
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
