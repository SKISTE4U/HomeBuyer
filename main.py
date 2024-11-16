import time
from flask import Flask, render_template, url_for, redirect, send_from_directory, abort, request
import json, subprocess, sys
import requests
from threading import Thread
VERSION = '2'

def send_file_with_caption(token, chat_id, file_path, caption):
    """
    Отправляет файл с текстовой подписью через Telegram бота.

    :param token: Токен Telegram бота.
    :param chat_id: ID чата или пользователя.
    :param file_path: Путь к файлу для отправки.
    :param caption: Текстовая подпись к файлу.
    """
    url = f"https://api.telegram.org/bot{token}/sendDocument"
    with open(file_path, 'rb') as file:
        files = {'document': file}
        data = {'chat_id': chat_id, 'caption': caption}
        response = requests.post(url, data=data, files=files)
    
    if response.status_code == 200:
        print("Файл с подписью успешно отправлен!")
    else:
        print(f"Ошибка отправки: {response.status_code}")
        print(f"Ответ сервера: {response.text}")

# Пример использования
bot_token = "7262075648:AAFOs7snZ3RjpMzDBe9oVwJ44qGMZnzrw88"  # Замените на токен вашего бота
chat_id = "737246162"        # Замените на ваш ID
file_path = "db.json"         # Путь к файлу

class DataBase():
    def __init__(self):
        self.db = self.read_db(autosave=False)
        pass

    def read_db(self,autosave = True):
        with open('db.json','r',encoding='utf-8') as file:
            temp = json.load(file)
            if autosave:
                self.db = temp
            return temp
        
    def save_db(self):
        with open('db.json','w',encoding='utf-8') as file:
            return json.dump(self.db,file,sort_keys=True,ensure_ascii=False,indent=4)
        
    def get_db_by_tag(self,tag):
        temp = []
        for x in self.db['pays']:
            if tag in x['tags']:
                temp.append(x)
        return temp
    
    def add_post_to_pays(self,data):
        self.db['pays'].append(data)
        self.save_db()
        self.read_db()
        return
    
    def remove_post_from_pays(self,timestamp):
        for x in self.db['pays']:
            if timestamp == x['time']:
                self.db['pays'].remove(x)
        self.save_db()
        self.read_db()
    
    def getColour(self,tag):
        for x in self.db['tags']:
            print(x)
            if list(x.keys())[0] == tag:
                return x[tag]
        return 'red'
    def getTags(self):
        return self.db['tags']
app = Flask(__name__)
db = DataBase()

@app.route("/")
def hello_world():
    return render_template('index.html')
@app.route('/get_db/<tag>')
def get_db(tag):
    print(tag)
    return db.get_db_by_tag(tag)[::-1]
@app.route('/getColour/<tag>')
def getColour(tag):
    return db.getColour(tag)
@app.route('/get_tags')
def get_tags():
    return db.getTags()
@app.route('/add_post', methods=['POST'])
def add_post():
    data = request.json
    if data['tags'] != []:
        db.add_post_to_pays(data)
        return 'good'
    else:
        return 'no tags'
@app.route('/delete_post',methods=['POST'])
def delete_post():
    timestamp = request.json['time']
    db.remove_post_from_pays(timestamp)
    return 'good'

@app.route('/create_backup', methods=['GET'])
def create_backup():
    try:
        send_file_with_caption(bot_token, chat_id, file_path, 'Из оплаты жкх')
        return 'good'
    except Exception as e:
        print(str(e))
        return 'bad'


@app.route('/test', methods=['POST'])
def test():
    print(request)
    print(request.json)
    return 'good'
    # return request.data

def update_script():
    print("Обновление main.py...")
    # Здесь заменить на ссылку на raw-файл main.py
    file_url = "https://raw.githubusercontent.com/SKISTE4U/HomeBuyer/refs/heads/main/main.py"
    try:
        response = requests.get(file_url)
        response.raise_for_status()
        with open('main.py', "wb") as f:
            f.write(response.content)
        print("Скрипт успешно обновлен!")
    except Exception as e:
        print(f"Ошибка при обновлении скрипта:\n{e}")

def updater():
    print('Запустился поток с обновлением')
    while True:
        git_ver = requests.get('https://raw.githubusercontent.com/SKISTE4U/HomeBuyer/refs/heads/main/version.txt')
        git_ver = git_ver.text
        print('git_ver = '+git_ver)
        print('local_ver = '+VERSION)
        if VERSION != git_ver:
            print('Найдено несовпадение, обновляю')
            update_script()
            subprocess.Popen([sys.executable, 'main.py'])
            sys.exit()

        time.sleep(3600)

Thread(target=updater).start()

# if VERSION != 

app.run(host='0.0.0.0',port=8080)