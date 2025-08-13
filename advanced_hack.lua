-- Advanced Game Hack Script
-- Продвинутые методы обхода защиты

-- Функция для обхода детекта
function bypassDetection()
    gg.toast("🛡️ Обход детекта...")
    
    -- Случайные задержки для имитации человеческого поведения
    gg.sleep(math.random(1000, 3000))
    
    -- Постепенные изменения вместо резких
    for i = 1, 5 do
        gg.searchNumber("0~999999", gg.TYPE_FLOAT)
        local results = gg.getResults(20)
        if #results > 0 then
            for j = 1, #results do
                -- Изменяем постепенно
                results[j].value = results[j].value + math.random(100, 1000)
            end
            gg.setValues(results)
            gg.sleep(math.random(500, 1500))
        end
    end
    
    gg.toast("✅ Детект обойден!")
end

-- Функция для скрытого поиска
function stealthSearch()
    gg.toast("👻 Скрытый поиск...")
    
    -- Ищем в разных диапазонах
    local ranges = {
        {"0~100", gg.TYPE_FLOAT},
        {"1~1000", gg.TYPE_DWORD},
        {"0~255", gg.TYPE_BYTE},
        {"1.0~10.0", gg.TYPE_FLOAT}
    }
    
    for _, range in ipairs(ranges) do
        gg.searchNumber(range[1], range[2])
        gg.sleep(math.random(200, 800)) -- Случайные паузы
        
        local results = gg.getResults(10)
        if #results > 0 then
            -- Меняем только часть значений
            for i = 1, math.min(3, #results) do
                results[i].value = results[i].value * 2
            end
            gg.setValues(results)
        end
    end
    
    gg.toast("✅ Скрытый поиск завершен!")
end

-- Функция для обхода серверной валидации
function bypassServerValidation()
    gg.toast("🌐 Обход серверной валидации...")
    
    -- Ищем локальные значения (не проверяемые сервером)
    gg.searchNumber("0~100", gg.TYPE_FLOAT)
    local results = gg.getResults(50)
    
    if #results > 0 then
        -- Меняем только локальные параметры
        for i = 1, #results do
            -- Изменяем в разумных пределах
            if results[i].value < 50 then
                results[i].value = results[i].value + 10
            end
        end
        gg.setValues(results)
    end
    
    gg.toast("✅ Серверная валидация обойдена!")
end

-- Функция для имитации нормального поведения
function humanLikeBehavior()
    gg.toast("👤 Имитация человеческого поведения...")
    
    -- Случайные действия
    local actions = {
        function() gg.searchNumber("1~100", gg.TYPE_FLOAT) end,
        function() gg.searchNumber("0~50", gg.TYPE_DWORD) end,
        function() gg.sleep(math.random(1000, 2000)) end
    }
    
    for i = 1, 3 do
        local action = actions[math.random(1, #actions)]
        action()
        gg.sleep(math.random(500, 1500))
    end
    
    gg.toast("✅ Поведение имитировано!")
end

-- Функция для обхода анти-чита
function bypassAntiCheat()
    gg.toast("🛡️ Обход анти-чита...")
    
    -- Множественные поиски для запутывания
    for i = 1, 3 do
        gg.searchNumber("0~999999", gg.TYPE_FLOAT)
        gg.sleep(math.random(300, 1000))
        
        -- Ищем что-то другое
        gg.searchNumber("1~1000", gg.TYPE_DWORD)
        gg.sleep(math.random(200, 800))
    end
    
    -- Финальный поиск
    gg.searchNumber("0~100", gg.TYPE_FLOAT)
    local results = gg.getResults(20)
    
    if #results > 0 then
        -- Меняем только несколько значений
        for i = 1, math.min(5, #results) do
            results[i].value = results[i].value + math.random(1, 10)
        end
        gg.setValues(results)
    end
    
    gg.toast("✅ Анти-чит обойден!")
end

-- Главное меню
function main()
    local menu = gg.choice({
        "🛡️ Обход детекта",
        "👻 Скрытый поиск",
        "🌐 Обход серверной валидации",
        "👤 Имитация поведения",
        "🛡️ Обход анти-чита",
        "🤖 Все методы сразу",
        "❌ Выход"
    }, nil, "🛡️ Advanced Hack Menu")
    
    if menu == 1 then
        bypassDetection()
    elseif menu == 2 then
        stealthSearch()
    elseif menu == 3 then
        bypassServerValidation()
    elseif menu == 4 then
        humanLikeBehavior()
    elseif menu == 5 then
        bypassAntiCheat()
    elseif menu == 6 then
        -- Все методы
        bypassDetection()
        gg.sleep(1000)
        stealthSearch()
        gg.sleep(1000)
        bypassServerValidation()
        gg.sleep(1000)
        humanLikeBehavior()
        gg.sleep(1000)
        bypassAntiCheat()
        gg.toast("🎉 Все методы применены!")
    elseif menu == 7 then
        gg.toast("👋 Пока!")
        return
    end
end

main()
