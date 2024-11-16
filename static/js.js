const DEBUG = true
var lastTag = 'Шевченко 83'
var SelectedTags = []

function info(text){
    console.log('%c[INFO] '+text, 'background: #222; color: #bada55')
}
function debug(text){
    if(DEBUG){
        console.log('%c[DEBUG] '+text, 'color: red')
    }
}


function httpGet(theUrl){
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", window.location.href+theUrl, false ); // false for synchronous request
    xmlHttp.send( null );
    return xmlHttp.responseText;
}
function httpPost(theUrl, data) {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", window.location.href + theUrl);
    xhr.setRequestHeader("Content-Type", "application/json; charset=UTF-8")
    data = JSON.stringify(data)
    xhr.onload = () => {
        return xhr.responseText;
        if (xhr.readyState == 4 && xhr.status == 201) {
          
        } else {
          console.log(`Error: ${xhr.status}`);
        }
      };
    xhr.send(data)
}

function addZeroz(number) {
    return ('0' + number).slice(-2);
  }
function getDateFromTimestamp(timestamp){
    var date = new Date(timestamp * 1000);
    let day = addZeroz(date.getDate())
    let month = addZeroz(date.getMonth()+1)
    let year = date.getFullYear()
    let hour = addZeroz(date.getHours())
    let minute = addZeroz(date.getMinutes())
    return  day+'.'+month+'.'+year+' '+hour+':'+minute
}
function get_color(tag) {
    for (const item of TAGS) {
        if (item[tag]) {
            return item[tag]; // Возвращаем цвет, если тег найден.
        }
    }
    return null; // Если тег не найден, возвращаем null.
}
function place_db(tag = lastTag){
    debug('place_db')
    lastTag = tag
    const List = document.querySelector('.list').querySelector('ul')
    List.innerHTML = ''
    let req = httpGet('/get_db/'+tag)
    req = JSON.parse(req)
    for (let x = 0; x < req.length; x++) {
        const element = req[x];
        let li = document.createElement('li')
        li.classList.add('one_item')
        li.innerHTML = `
            <div class="name">${element['name']} - ${element['price']}</div>
            <div class="right">
                <div class="tags">
                </div>
                <div class="time">
                    <span>${getDateFromTimestamp(element['time'])}</span>
                </div>
                <div class="delete">
                    <i class="fa-regular fa-trash-can" style='cursor:pointer' onclick="delete_post(${element['time']})"></i>
                </div>
            </div>
        `
        let temp = li.querySelector('.tags')
        for (let i = 0; i < element['tags'].length; i++) {
            const elem = element['tags'][i];
            let one_tag = document.createElement('div')
            one_tag.classList.add('one_tag')
            one_tag.innerHTML = elem
            temp.prepend(one_tag)
            one_tag.setAttribute('style','--tag_color:'+get_color(elem))
        }
        List.appendChild(li)
    }
}

function clear_list() {
    const List = document.querySelector('.list').querySelector('ul')
    List.innerHTML = ''
}
let checkbox = document.querySelector('.delivery-swither').querySelector('input')

checkbox.addEventListener('change',function(){
    if(checkbox.checked){
        info('Деревня')
        clear_list()
        place_db('Деревня')
    }
    else{
        info('Шевченко 83')
        clear_list()
        place_db('Шевченко 83')
    }
    })

function popup_closer(insta = false){
    let popup = document.querySelector('.popup_wrapper')
    if(insta){
        popup.style.animation = 'hide_popup_wrapper .4s ease-in-out forwards'
        return
    }
    popup.onclick = function(event){
        let target = event.target
        if (target.classList[0] != 'popup_wrapper'){
            return
        }
        else{
            popup.style.animation = 'hide_popup_wrapper .4s ease-in-out forwards'
        }
    }
}

function popup_adder(){
    // show popup

    let popup = document.querySelector('.popup_wrapper')
    popup.innerHTML = example_popup

    let tags_zone = popup.querySelector('.taags')
    popup.style.display = 'flex'
    popup.style.animation = 'show_popup_wrapper .4s ease-in-out forwards'

    // get tags
    let tags = TAGS
    for (let x = 0; x < tags.length; x++) {
        const element = tags[x];
        let name = Object.keys(element)[0]
        let color = element[name]
        let div = document.createElement('div')
        div.classList.add('one_tag')
        div.setAttribute('onclick','select_tag(this)')
        div.style = '--tag_color: '+color+';'
        div.innerHTML = name
        tags_zone.append(div)
    }
}

function delete_post(timestamp) {
    let temp = confirm('Вы уверены что хотите удалить запись?')
    if(temp){
        httpPost('/delete_post',{'time':timestamp})
        place_db()
    }
    
}

function select_tag(elem) {
    if(elem.classList.contains('selected_tag')){
        elem.classList.remove('selected_tag')
    }
    else{
        elem.classList.add('selected_tag')
    }
}

function add_post() {
    const popup = document.querySelector('.popup_wrapper')
    let name = document.getElementsByName('name')[0].value
    let price = document.getElementsByName('price')[0].value
    let all_tags = popup.querySelectorAll('.one_tag')
    let added_tags = []
    for (let x = 0; x < all_tags.length; x++) {
        const element = all_tags[x];
        console.log(element)
        if(element.classList.contains('selected_tag')){
            added_tags.push(element.innerHTML)
        }
    }
    data = {
        'tags':added_tags,
        'name':name,
        'price':price,
        'time':parseInt(Date.now()/1000)
    }
    let req = httpPost('/add_post',data)
    // if(req != 'good'){
        // alert('Какая то ошибка')
    // }
    place_db()
    popup_closer(true)
}

function search_by_tags_front() {
    let searcher = document.querySelector('.search_by_tags')
    searcher.innerHTML = ''
    // searcher.style.display = 'block'
    searcher.style.animation = 'search_by_tags_show .4s ease-in-out forwards'
    console.log(searcher)
    for (let x = 0; x < TAGS.length; x++) {
        const element = TAGS[x];
        console.log(element)
        let name = Object.keys(element)[0]
        let color = element[name]
        let div = document.createElement('div')
        div.classList.add('one_tag')
        div.setAttribute('style','--color: '+color)
        div.setAttribute('onclick','find_by_tags(this)')
        searcher.appendChild(div)
        div.innerHTML = name
    }
}
function create_backup() {
    let req = httpGet('create_backup')
    if (req == 'good') {
        alert('Создана резервная копия!')
    }
    else{
        alert('Произошла непредвиденная ошибка, пожалуйста обратитесь к специалисту\n'+req)
    }
}


const TAGS = JSON.parse(httpGet('get_tags'))

popup_closer()
place_db('Шевченко 83')