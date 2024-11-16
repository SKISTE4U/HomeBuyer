const example_popup = `<div class="popup">
            <div class="one_line">
                <h2 style="margin: 0;">Добавить запись</h2>
            </div>
            <div class="one_line">
                
                <input type="text" name="name" placeholder="Название">
                <input type="text" name="price" placeholder="Сумма">
            </div>
            <h3>Теги:</h3>
            <div class="one_line taags">
                <!-- <div class="one_tag">ТПлюс</div>
                <div class="one_tag">Деревня</div>
                <div class="one_tag">Шевченко 83</div> -->
            </div>
            <div class="one_line">
                <button>Отмена</button>
                <button onclick="add_post()">Добавить</button>
            </div>
        </div>`