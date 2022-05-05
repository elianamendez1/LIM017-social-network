/* eslint-disable max-len */
import {
  logOut, savePost, onGetPost, getPost, updatePost, getArrayLikes, postLike,
  deletePost, getDataWithFilters,
} from '../lib/firebaseAuth.js';
// eslint-disable-next-line import/no-cycle
import { onNavigate } from '../main.js';

export const Feed = () => {
  const feedDiv = document.createElement('div');
  const containerFeed = `
    <header class= "navFeed">
      <figure class="top headerReset">
        <img src="images/logotype/Full-logo.png" alt="Binge Worthy logo" class="logoFeed">
        <img src="images/mobile/Mobile icon nav.png" class="nav">
        <input type="button" id="logOut" value="Log out" class="button">
      </figure>
    </header>

    <form id="postForm" class="modal inactive">
      <div class="gridColum mtop">
        <p id="originalPost" class="purple originalPost"></p>
        <select class="select" id="tag">
          <option disabled selected >Type</option>
          <option value="Movie">Movie</option>
          <option value="Book">Book</option>
          <option value="TV Show">TV Show</option>
        </select>
      </div>
      <textarea id="postDescription" placeholder="Write your recommendation here"></textarea>
      <div class="post">
        <input type="submit" id="postBtn" value="Post" class="button">
        <input type="button" id="cancelUpload" value="Cancel" class="button">
      </div>
    </form>

    <div id="overlay" class="inactive"></div>
    <div id="deleteDiv" class="inactive modal">
      <h3>Are you sure to delete?</h3>
      <input type="button" id="cancelDelete" value="Cancel" class="button">
      <input type="button" id="confirmDelete" value="Delete" class="button">
    </div>
    <div id="overlayDelete" class="inactive"></div>

    <div id="postContainer"></div>

    <footer>
      <nav id= "footerMobile">
        <ul class="footerFeed darkPurple">
          <li class="icon-home" id="home"></li>
          <li class="icon-books" id="BookFilter"></li>
          <div><img src="images/mobile/upload post icon.png" id="uploadPost"> </div>
          <li class="icon-video-camera" id="MovieFilter"></li>
          <li class="icon-man-woman" id="tvShowFilter"></li>
        </ul>
      </nav>
    </footer>
    `;
  feedDiv.innerHTML = containerFeed;

  const logOutBtn = feedDiv.querySelector('#logOut');
  const description = feedDiv.querySelector('#postDescription');
  const post = feedDiv.querySelector('#postDescription');
  const postBtn = feedDiv.querySelector('#postBtn');
  const postForm = feedDiv.querySelector('#postForm');
  const postContainer = feedDiv.querySelector('#postContainer');
  // const op = feedDiv.querySelector('.originalPost');
  const tag = feedDiv.querySelector('#tag');
  // const postBody = feedDiv.querySelector('#postBody');

  const openModalPost = feedDiv.querySelector('#uploadPost');
  const closeModalBtn = feedDiv.querySelector('#cancelUpload');
  const overlay = feedDiv.querySelector('#overlay');
  let id = '';
  let editStatus = false;
  function changeToEditingStatus() {
    postBtn.value = 'Update';
  }
  function changeToPostingStatus() {
    postBtn.value = 'Post';
  }

  // Funciones de la ventana modal
  function openPostModal() {
    postForm.classList.add('active');
    overlay.classList.add('active');
    postForm.classList.remove('inactive');
    overlay.classList.remove('inactive');
  }
  function closePostModal() {
    postForm.classList.add('inactive');
    overlay.classList.add('inactive');
    postForm.classList.remove('active');
    overlay.classList.remove('active');
  }

  openModalPost.addEventListener('click', openPostModal);
  postBtn.addEventListener('click', closePostModal);
  closeModalBtn.addEventListener('click', () => {
    closePostModal();
    postForm.reset();
    changeToPostingStatus();
  });
  // Funciones de la ventana modal de delete
  const cancelDelete = feedDiv.querySelectorAll('#cancelDelete');
  const overlayDelete = feedDiv.querySelector('#overlayDelete');
  const deleteDiv = feedDiv.querySelector('#deleteDiv');
  const confirmDelete = feedDiv.querySelector('#confirmDelete');
  let deleteId = '';

  function openDeleteModal() {
    deleteDiv.classList.add('active');
    overlayDelete.classList.add('active');
    deleteDiv.classList.remove('inactive');
    overlayDelete.classList.remove('inactive');
  }
  function closeDeleteModal() {
    deleteDiv.classList.add('inactive');
    overlayDelete.classList.add('inactive');
    deleteDiv.classList.remove('active');
    overlayDelete.classList.remove('active');
  }

  const movieFilter = feedDiv.querySelector('#MovieFilter');
  const BookFilter = feedDiv.querySelector('#BookFilter');
  const tvShowFilter = feedDiv.querySelector('#tvShowFilter');
  const home = feedDiv.querySelector('#home');

  function addLikesPost(user) {
    console.log('soooy usuario', user);
    const likeButton = feedDiv.querySelectorAll('.likeButton');
    likeButton.forEach((e) => {
      e.addEventListener('click', async () => {
        console.log('entreee al botón likeeeeeee', getArrayLikes(e.id));
        // likeButton.classList.add('icon-like-red');
        // eslint-disable-next-line prefer-const
        let arrayLikes = await getArrayLikes(e.id);
        console.log('entreee getarraLikesssss', e.id);
        let count = 0;
        const arrayCounter = arrayLikes.length;
        console.log('soooooy arrayCounter', arrayCounter, arrayLikes.length, arrayLikes);
        // eslint-disable-next-line no-plusplus
        for (let i = 0; i < arrayLikes.length; i++) {
          if (arrayLikes[i] === user.uid) {
            arrayLikes.splice(i, 1);
            postLike(e.id, arrayLikes);
            break;
          } else {
            // eslint-disable-next-line no-plusplus
            count++;
          }
        }
        if (count === arrayCounter) {
          arrayLikes.push(user.uid);
          postLike(e.id, arrayLikes);
        }
      });
    });
  }

  const fetchPosts = () => {
    onGetPost((querySnapshot) => {
      let posts = '';
      querySnapshot.forEach((doc) => {
        const postData = doc.data();
        posts += `
          <div id="postFormContainer" id="postForm">
            <div class="usersEmail">
              <p id="userName" class="darkPurple">example@gmail.com</p>
              <p id="tagSelected">${postData.tag}</p>
            </div>
            <p id="postBody">${postData.post}</p>
            <i class="icon-heart likeButton"></i>
            <div>
            <button class="btnEdit" data-id=${doc.id}>Edit</button>
            </div>
            <input type="button" class="deleteBtns" value="Delete" data-id="${doc.id}" class="button">
          </div>
          `;
      });
      postContainer.innerHTML = posts;
      addLikesPost();
      // console.log('SOOOY la ejecución de like', addLikes());

      const deleteBtns = feedDiv.querySelectorAll('.deleteBtns');
      deleteBtns.forEach((btn) => {
        btn.addEventListener('click', ({ target: { dataset } }) => {
          deleteId = dataset.id;
          openDeleteModal();
        });
      });
      cancelDelete.forEach((btn) => {
        btn.addEventListener('click', () => {
          closeDeleteModal();
        });
      });

      const editBtns = feedDiv.querySelectorAll('.btnEdit');
      editBtns.forEach((btn) => {
        btn.addEventListener('click', async ({ target: { dataset } }) => {
          editStatus = true;
          changeToEditingStatus();
          openPostModal();
          const doc = await getPost(dataset.id);
          const postDoc = doc.data();
          description.value = postDoc.post;
          tag.value = postDoc.tag;
          id = dataset.id;
        });
      });
    });
  };
  fetchPosts();
  console.log('soy feccccch', fetchPosts(), addLikesPost);

  confirmDelete.addEventListener('click', () => {
    deletePost(deleteId)
      .then(() => {
        console.log('se eliminó tu post', deleteId);
        deleteDiv.classList.add('inactive');
        overlayDelete.classList.add('inactive');
        deleteDiv.classList.remove('active');
        overlayDelete.classList.remove('active');
      });
  });

  postForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!editStatus) {
      savePost(post, tag);
    } else {
      updatePost(id, {
        post: post.value,
        tag: tag.value,
      });
      changeToPostingStatus();
      console.log('valor botonsito', postBtn.value);
      editStatus = false;
    }

    postForm.reset();
  });

  logOutBtn.addEventListener('click', () => {
    logOut()
      .then(() => {
        onNavigate('/');
      });
  });

  // Filtro tag según: movie, book, tvShow
  movieFilter.addEventListener('click', () => {
    getDataWithFilters('movie', (querySnapshot) => {
      let posts = '';
      postContainer.innerHTML = '';
      querySnapshot.forEach((doc) => {
        const postData = doc.data();
        posts += `
        <div id="postFormContainer" id="postForm">
          <div class="usersEmail">
            <p id="userName" class="darkPurple">example@gmail.com</p>
            <p id="tagSelected">${postData.tag}</p>
          </div>
          <p id="postBody">${postData.post}</p>
          <input type="button" id="openPopUpBtn" value="Delete" data-id="${doc.id}" class="button">
        </div>
        `;
      });
      postContainer.innerHTML = posts;
    });
  });
  BookFilter.addEventListener('click', () => {
    getDataWithFilters('book', (querySnapshot) => {
      let posts = '';
      postContainer.innerHTML = '';
      querySnapshot.forEach((doc) => {
        const postData = doc.data();
        posts += `
        <div id="postFormContainer" id="postForm">
          <div class="usersEmail">
            <p id="userName" class="darkPurple">example@gmail.com</p>
            <p id="tagSelected">${postData.tag}</p>
          </div>
          <p id="postBody">${postData.post}</p>
          <input type="button" id="openPopUpBtn" value="Delete" data-id="${doc.id}" class="button">
        </div>
        `;
      });
      postContainer.innerHTML = posts;
    });
  });
  tvShowFilter.addEventListener('click', () => {
    getDataWithFilters('tvShow', (querySnapshot) => {
      let posts = '';
      postContainer.innerHTML = '';
      querySnapshot.forEach((doc) => {
        const postData = doc.data();
        posts += `
        <div id="postFormContainer" id="postForm">
          <div class="usersEmail">
            <p id="userName" class="darkPurple">example@gmail.com</p>
            <p id="tagSelected">${postData.tag}</p>
          </div>
          <p id="postBody">${postData.post}</p>
          <input type="button" id="openPopUpBtn" value="Delete" data-id="${doc.id}" class="button">
        </div>
        `;
      });
      postContainer.innerHTML = posts;
    });
  });
  // home recarga la pantalla
  home.addEventListener('click', () => {
    onNavigate('/feed');
  });

  return feedDiv;
};
