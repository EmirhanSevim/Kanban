<template>
  <div>
    <nav class="navbar">
      <div class="navbar-title" v-for="boardItem in boardList" :key="boardItem.id">
        <input type="text" v-model="boardItem.baslik" @input="updatePageTitle" @blur="updatePanoName(boardItem)" />
      </div>
    </nav>

    <div class="board">
      <div class="list" v-for="(item, index) in panoList" :key="index">
        <!-- <div>
          <Board :listBaslik="pageTitle" />
        </div> -->
        <!-- <h3 @click="logBaslik(item.listBaslik)">{{ item.listBaslik }}</h3> -->
        <div class="card" v-for="(cardItem, cardIndex) in item.kartItems" :key="cardIndex">
          {{ cardItem.baslik }}
        </div>
        <div class="ekle-button-container">
          <input v-model="kartAdi" type="text" />
          <button @click="ekleKart(kartAdi)" class="ekle-button">+ Kart Ekle</button>
        </div>
      </div>
      <div class="ekle-board-container">
        <input v-model="listeAdi" type="text" />
        <button @click="ekleListe(listeAdi)" class="ekle-board">+ Liste Ekle</button>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { ref, onMounted, defineComponent } from 'vue';
import axios from 'axios';

export default defineComponent({
  // props: {
  //   listBaslik: {
  //     type: String,
  //     required: true,
  //   },
  // },

  setup() {
    const panoList = ref([]);
    const boardList = ref([]);
    const listIndex = ref(0);
    const listeAdi = ref('');
    const kartAdi = ref('');

    interface kartAdi {
      kartItems: { baslik: string }[]; // kartItems özelliği tanımlandı
    }

    onMounted(() => {
      axios.get('https://localhost:44355/api/app/pano-app-services').then((response2) => {
        console.log('response2 :>> ', response2);
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

    const logBaslik = (baslik: string) => {
      console.log('Tıklanan Başlık:', baslik);
    };

    // const ekleKart = (item) => {

    //   if (item && item.kartItems) {
    //     const yeniListe = {
    //       listBaslik: 'Yeni Liste',
    //       kartItems: [],
    //     };
    //     item.kartItems.push(yeniListe);
    //   } else {
    //     console.error('item veya item.kartItems tanımlanmamış veya undefined.');
    //   }
    // };

    const ekleKart = (kartAdi) => {
      const yeniListe = {
        listBaslik: 'Yeni Liste',
        kartItems: [],
      };
      item.kartItems.push(kartAdi);
    };

    // const ekleListe = (item) => {
    //   const yeniListeBaslik = 'Yeni Liste';

    //   axios
    //     .post('https://localhost:44355/api/app/kart-item-detay-services', { listBaslik: yeniListeBaslik })
    //     .then((response) => {
    //       const yeniListe = response.data;
    //       item.lists.push(yeniListe);
    //     })
    //     .catch((error) => {
    //       console.error('Yeni liste eklerken hata:', error);
    //     });
    // };

    const ekleListe = (param: string) => {
      const yeniListe = {
        listBaslik: param,
        panoItemId: '3a0de902-d95b-503d-1ff6-bc67ae0de648', //tek boardımız var burası sabit kalsın
      };

      axios
        .post('https://localhost:44355/api/app/list-app-services', yeniListe)
        .then((response) => {
          console.log('response ', response);
          // // Sunucudan dönen yanıtı işleyin (örneğin, yeni board ID'sini alabilirsiniz)

          // // Yeni board verisine sunucudan gelen ID'yi ekleyin

          // // panoList'e yeni board'i ekleyin

          // // panoItemId ile ilgili güncelleme işlemi
          // axios
          //   .put(`https://localhost:44355/api/app/list-app-services/${yeniListe.panoItemId}`, {
          //     boardId: yeniBoardID, // panoItemId'yi güncellemenin yolu ve verisi
          //   })
          //   .then(() => {
          //     console.log('panoItemId güncellendi.');
          //   })
          //   .catch((error) => {
          //     console.error('panoItemId güncelleme hatası:', error);
          //   });
        })
        .catch((error) => {
          console.error('Yeni board eklerken hata:', error);
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
      // kartAdi,
    };
  },
  methods: {
    updatePanoName(boardItem) {
      console.log('boardItem :>> ', boardItem);
      console.log('board Basşlık', boardItem.baslik);
      axios.put(`https://localhost:44355/api/app/pano-app-services/${boardItem.id}`, boardItem).then((update_board_response) => {
        console.log('update_board_response :>> ', update_board_response);
      });
    },
  },
});
//https://localhost:44355/api/app/pano-app-services/3a0de902-d95b-503d-1ff6-bc67ae0de648
//https://localhost:44355/api/app/pano-app-services/3a0de902-d95b-503d-1ff6-bc67ae0de648
</script>

<style>
.navbar {
  background-color: #5c58586b;
  /* color: #fff; */
  padding: 10px;
  text-align: center;
  display: flex;
  align-items: center;
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
  padding: 50px;
  border: 1px solid rgb(255, 255, 255);
  border-radius: 10px;
  width: 200px;
}

.card {
  margin-top: 10px;
  padding: 5px;
  background-color: #8f8f8f5d;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.788);
  border-radius: 8px;
  transition: background-color 0.3s ease;
}

.card:hover {
  background-color: #f2f2f2;
}

body {
  background: linear-gradient(135deg, rgba(57, 221, 106, 0.767), rgba(16, 204, 141, 0.664), rgba(9, 64, 146, 0.685), rgba(12, 48, 207, 0.473));
  background-size: 400% 400%;
  /* animation: gradientAnimation 20s infinite; */
}
/*
@keyframes gradientAnimation {
  0% {
    background-position: 0% 100%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  } */
/* } */

input[type='text'] {
  margin-top: 2px;
  width: 222px;
  height: 20px;
  padding: 3px;
  /* border: 1px solid #ccc; */
  border-radius: 3px;
  align-items: flex-start;
  background-color: #5c58586b; /* Saydamlık ekleyin */
  cursor: pointer; /* İmleci el işareti yapın */
  transition: background-color 1s ease; /* Geçiş efekti ekleyin */
}

input[type='text']:hover {
  background-color: rgba(240, 240, 240, 1); /* İmleç üstüne geldiğinde tamamen görünür yapın */
}

.ekle-button-container {
  display: block;
  place-items: initial;
  margin-top: 30px;
}

.ekle-button {
  background-color: #ccc8e093;
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
  place-items: inherit;
  margin-top: 195px;
}

.ekle-board {
  background-color: #ccc8e093;
  color: #fff;
  padding: 5px 4px;
  border: center;
  border-radius: 5px;
  cursor: pointer;
}

.ekle-board:hover {
  background-color: #0056b3;
}
</style>
