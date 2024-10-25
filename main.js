'use-strict'

document.addEventListener('DOMContentLoaded', function() {
  let tempHTMLContent = document.createElement('div');
  let allMembers = []

  const stepOneButton = document.querySelector('#step-1')
  const stepTwoButton = document.querySelector('#step-2')
  const stepThreeButton = document.querySelector('#step-3')
  const lichkaTitle = document.querySelector('#lichka-title')
  const lichkaNumber = document.querySelector('#lichka-number')
  const lichkaNumbLabelNode = document.querySelector('.js-lichka-numb-label')
  const fileInput = document.getElementById('file-input');
  const membersNode = document.querySelector('#members')
  const resultBox = document.querySelector('#preview-box')

  fileInput.addEventListener('change', function(event) {
    const file = event.target.files[0];

    if (file) {
      const reader = new FileReader();

      reader.onload = function(e) {
        tempHTMLContent.innerHTML = e.target.result;
      };

      reader.readAsText(file);
    }
  });

  stepOneButton.addEventListener('click', function () {
    if (!lichkaTitle.value) {
      alert('Введите заголовок лички')
      return
    }
    if (!lichkaNumber.value) {
      alert('Введите номер лички')
      return
    }
    if (!fileInput.value) {
      alert('Загрузите файл переписки')
      return
    }

    modifyPageContent();

    getAllMembers();
  })

  stepTwoButton.addEventListener('click', function () {
    setMarkup()
  });

  stepThreeButton.addEventListener('click', function () {
    const contentToCopy = resultBox.innerHTML;
    const textarea = document.createElement('textarea');
    textarea.value = contentToCopy;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);

    document.querySelector('.js-content-copied').classList.remove('hidden')
  });

  function modifyPageContent() {
    let tempContent = tempHTMLContent.querySelector('.history');
    let serviceMsg = tempHTMLContent.querySelector('.message.service');

    if (serviceMsg) serviceMsg.parentNode.removeChild(serviceMsg)

    tempHTMLContent = `<div aria-label="${lichkaTitle.value}" class="__i_ v3">
      ${tempContent.innerHTML}
    </div>`

    const tempContainer = document.createElement('div');

    tempContainer.innerHTML = tempHTMLContent

    tempHTMLContent = tempContainer

    lichkaNumbLabelNode.innerText = lichkaNumber.value;
    resultBox.innerHTML = tempContainer.innerHTML;
  }

  function getAllMembers() {
    const allUserpic = tempHTMLContent.querySelectorAll('.userpic')
    allUserpic.forEach(element => {
      let objectExists = allMembers.some(obj => obj.id === element.classList[1])

      if (!objectExists) {
        let parentNode = element.closest('.message')

        allMembers.push({
          name: parentNode.querySelector('.from_name').innerText.trim(),
          id: element.classList[1]
        })
      }
    });

    const list = document.createElement('ul');

    allMembers.forEach((member, index) => {
      const listItem = document.createElement('li');
      const label = document.createElement('label');
      const radioInput = document.createElement('input');
      const labelText = document.createTextNode(member.name);
      const nameInput = document.createElement('input');
      const avatarInput = document.createElement('input');

      radioInput.type = 'radio';
      radioInput.name = 'member';
      radioInput.value = member.name;
      radioInput.id = member.id;

      if (index === 0) {
        radioInput.checked = true;
      }

      nameInput.type = 'text';
      nameInput.value = member.name;
      nameInput.id = `user-name-${member.id}`;

      avatarInput.type = 'text';
      avatarInput.id = `user-avatar-${member.id}`;
      avatarInput.placeholder = 'Название аватарки. Например: avatar_n.jpg';

      label.appendChild(radioInput);
      label.appendChild(labelText);

      listItem.appendChild(label);
      listItem.appendChild(nameInput);
      listItem.appendChild(avatarInput);
      list.appendChild(listItem);
    });

    membersNode.appendChild(list);

    document.querySelector('.js-members').classList.remove('hidden')
    stepTwoButton.classList.remove('hidden')
  }

  function setMarkup() {
    const selectedRadioButton = document.querySelector('input[name="member"]:checked');
    const authorId = selectedRadioButton.id;
    const allDivs = tempHTMLContent.querySelectorAll('div')

    allDivs.forEach(element => {
      // remove all attributes "id"
      element.removeAttribute('id')

      if (element.classList.contains('userpic')) {
        // for author
        if (element.classList.contains(authorId)) {
          // set user avatar
          let avatar = document.querySelector(`#user-avatar-${authorId}`)
          let avatarName = `${authorId}.jpg`;
          if (avatar.value) avatarName = avatar.value;
          element.innerHTML = `<img src="/img/lichka/lichka-${lichkaNumber.value}/avatars/${avatarName}" alt="">`

          // set css classes for author
          let parent = element.parentNode;

          parent.classList.remove(...parent.classList)
          parent.classList.add('userpic_wrap', 'pull_right')
          parent.parentNode.classList.add('user-admin')

          getAllNextSiblings(parent.parentNode, 'user-admin')

          let dateEl = parent.nextElementSibling.querySelector('.date');
          dateEl.classList.remove(...dateEl.classList)
          dateEl.classList.add('date', 'details', 'pull_left')

          // set user`s name
          let userName = document.querySelector(`#user-name-${authorId}`)
          let fromNameEl = parent.nextElementSibling.querySelector('.from_name');
          fromNameEl.innerText = userName.value
        }
      }

      if (element.classList.contains('media_wrap')) {
        setUrlForImage(element)
      }
    });

    // the rest users
    const restUsers = allMembers.filter(i => i.id !== authorId)

    for (let i = 0; i < restUsers.length; i++) {
      let cssClass = ''

      if (i === 0) {
        cssClass = 'companion-one'
      } else if (i === 1) {
        cssClass = 'companion-two'
      } else if (i === 2) {
        cssClass = 'companion-three'
      }

      modifySimpleUser(restUsers[i], cssClass)
    }

    resultBox.innerHTML = tempHTMLContent.innerHTML

    document.querySelector('.js-main-data').classList.add('hidden')
    document.querySelector('.js-copy-sect').classList.remove('hidden')
    resultBox.classList.remove('hidden')
  }

  // helper functions
  function getAllNextSiblings(element, cssClass) {
    const parentElement = element.parentElement;
    const siblingElements = Array.from(parentElement.children);
    const startIndex = siblingElements.indexOf(element) + 1;

    for (let i = startIndex; i < siblingElements.length; i++) {
      const sibling = siblingElements[i];
      if (sibling.classList.contains('joined')) {
        sibling.classList.add(cssClass, 'further-msg');

        let dateEl = sibling.querySelector('.date');
        if (dateEl) dateEl.classList.remove('pull_right')
      } else {
        break;
      }
    }
  }

  function modifySimpleUser(user, cssClass) {
    const userMainMsg = tempHTMLContent.querySelectorAll(`.${user.id}`)

    userMainMsg.forEach(el => {
      // set user avatar
      let avatar = document.querySelector(`#user-avatar-${user.id}`)
      let avatarName = `${user.id}.jpg`;
      if (avatar.value) avatarName = avatar.value;
      el.innerHTML = `<img src="/img/lichka/lichka-${lichkaNumber.value}/avatars/${avatarName}" alt="">`

      // set css classes
      const closestParent = el.parentNode
      const mainParent = closestParent.parentNode
      mainParent.classList.add(cssClass)

      // set user`s name
      let userName = document.querySelector(`#user-name-${user.id}`)
      let fromNameEl = mainParent.querySelector('.from_name');
      fromNameEl.innerText = userName.value

      getAllNextSiblings(mainParent, cssClass)
    })
  }

  function setUrlForImage(node) {
    const link = node.querySelector('a');
    const img = link.querySelector('img');

    if (link) {
      let address = link.getAttribute('href');

      if (address) {
        address = address.split('/')
        address[0] = `/img/lichka/lichka-${lichkaNumber.value}/photos/`
        address = address.join('')
        link.setAttribute('href', address);
      }
    }

    if (img) {
      let address = img.getAttribute('src');

      if (address) {
        address = address.split('/')
        address[0] = `/img/lichka/lichka-${lichkaNumber.value}/photos/`
        address = address.join('')
        img.setAttribute('src', address);
      }
    }
  }
});
